// pages/api/credits/redeem.ts
import { storeCreditDebitCents } from "../../../lib/shopify";

const neg = Math.abs(parseInt(String(amount_cents), 10) || 0);

// 1) DEBIT in Shopify (this is what reduces the Admin balance)
await storeCreditDebitCents(shopify_customer_id, neg, reason || "Redemption");

// 2) Record in Supabase ledger
await supabase.from("store_credit_ledger").insert({
  shopify_customer_id,
  delta_cents: -neg,
  reason: reason || "Redemption",
  reference: null,
  actor: "system",
});

return res.json({ ok: true });
