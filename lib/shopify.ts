// lib/shopify.ts
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const NS = process.env.SHOPIFY_CREDIT_NAMESPACE || "cfg";
const KEY = process.env.SHOPIFY_CREDIT_KEY || "store_credit_cents";
const REST_BASE = `https://${STORE_DOMAIN}/admin/api/2024-10`;
const GRAPHQL = `https://${STORE_DOMAIN}/admin/api/2024-10/graphql.json`;
const CURRENCY = process.env.SHOP_CURRENCY || "USD";

// ---- if you ever still want the metafield helpers for display only:
export async function shopifyAdmin(path: string, init?: RequestInit) {
  const res = await fetch(`${REST_BASE}${path}`, {
    ...init,
    headers: {
      "X-Shopify-Access-Token": ADMIN_TOKEN,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Shopify ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function setCustomerCreditCents(customerId: number | string, cents: number) {
  const list = await shopifyAdmin(`/customers/${customerId}/metafields.json`);
  const existing = (list?.metafields || []).find((m: any) => m.namespace === NS && m.key === KEY);
  if (existing) {
    return (
      await shopifyAdmin(`/metafields/${existing.id}.json`, {
        method: "PUT",
        body: JSON.stringify({ metafield: { id: existing.id, value: String(cents), type: "number_integer" } }),
      })
    ).metafield;
  } else {
    return (
      await shopifyAdmin(`/metafields.json`, {
        method: "POST",
        body: JSON.stringify({
          metafield: {
            namespace: NS,
            key: KEY,
            type: "number_integer",
            value: String(cents),
            owner_resource: "customer",
            owner_id: customerId,
          },
        }),
      })
    ).metafield;
  }
}

// ---- Native Store Credit (GraphQL) ----
async function shopifyGraphQL(query: string, variables: any) {
  const res = await fetch(GRAPHQL, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": ADMIN_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Shopify GQL ${res.status}: ${JSON.stringify(json.errors || json)}`);
  }
  return json;
}
const toMoney = (cents: number, currency = CURRENCY) => ({
  amount: (Math.round(cents) / 100).toFixed(2),
  currencyCode: currency,
});
const toCustomerGid = (numericId: string | number) => `gid://shopify/Customer/${numericId}`;

export async function storeCreditCreditCents(customerId: string | number, cents: number, reason?: string) {
  const query = `
    mutation storeCreditAccountCredit($id: ID!, $creditInput: StoreCreditAccountCreditInput!) {
      storeCreditAccountCredit(id: $id, creditInput: $creditInput) {
        storeCreditAccountTransaction { amount { amount currencyCode } account { balance { amount currencyCode } } }
        userErrors { message field }
      }
    }`;
  const variables = {
    id: toCustomerGid(customerId),
    creditInput: { creditAmount: toMoney(cents) /*, reason: reason || null*/ },
  };
  const json = await shopifyGraphQL(query, variables);
  const err = json.data?.storeCreditAccountCredit?.userErrors?.[0];
  if (err) throw new Error(`StoreCredit credit error: ${err.message}`);
  return json.data.storeCreditAccountCredit.storeCreditAccountTransaction;
}

export async function storeCreditDebitCents(customerId: string | number, cents: number, reason?: string) {
  const query = `
    mutation storeCreditAccountDebit($id: ID!, $debitInput: StoreCreditAccountDebitInput!) {
      storeCreditAccountDebit(id: $id, debitInput: $debitInput) {
        storeCreditAccountTransaction { amount { amount currencyCode } account { balance { amount currencyCode } } }
        userErrors { message field }
      }
    }`;
  const variables = {
    id: toCustomerGid(customerId),
    debitInput: { debitAmount: toMoney(cents) /*, reason: reason || null*/ },
  };
  const json = await shopifyGraphQL(query, variables);
  const err = json.data?.storeCreditAccountDebit?.userErrors?.[0];
  if (err) throw new Error(`StoreCredit debit error: ${err.message}`);
  return json.data.storeCreditAccountDebit.storeCreditAccountTransaction;
}

export async function getStoreCreditBalance(customerId: string | number) {
  const query = `
    query storeCreditAccount($id: ID!) {
      storeCreditAccount(id: $id) {
        balance { amount currencyCode }
      }
    }`;
  const variables = { id: toCustomerGid(customerId) };
  const json = await shopifyGraphQL(query, variables);
  return json.data.storeCreditAccount?.balance;
}
