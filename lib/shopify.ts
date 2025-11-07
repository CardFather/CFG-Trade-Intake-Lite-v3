// lib/shopify.ts  (append these)
const GRAPHQL = `https://${STORE_DOMAIN}/admin/api/2025-10/graphql.json`; // use a version that supports Store Credit

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

const toMoney = (cents: number, currency = (process.env.SHOP_CURRENCY || "USD")) => ({
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
    creditInput: { creditAmount: toMoney(cents) /*, reason: reason || null */ },
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
    debitInput: { debitAmount: toMoney(cents) /*, reason: reason || null */ },
  };
  const json = await shopifyGraphQL(query, variables);
  const err = json.data?.storeCreditAccountDebit?.userErrors?.[0];
  if (err) throw new Error(`StoreCredit debit error: ${err.message}`);
  return json.data.storeCreditAccountDebit.storeCreditAccountTransaction;
}
