// pages/api/trades/[id]/pay_credit.ts
import { storeCreditCreditCents } from "../../../../lib/shopify";

// …after we fetch `trade`
if (!trade.shopify_customer_id) return res.status(400).json({ error: "No Shopify customer linked" });
if (!trade.credit_value_cents) return res.status(400).json({ error: "credit_value_cents missing" });

// 1) Write to Supabase ledger (keep this as your internal record)
await supabase.from("store_credit_ledger").insert({
  shopify_customer_id: trade.shopify_customer_id,
  delta_cents: trade.credit_value_cents,
  reason: "Trade credit",
  reference: trade.intake_id,
  actor: "system",
});

// 2) CREDIT Shopify native Store credit
await storeCreditCreditCents(trade.shopify_customer_id, trade.credit_value_cents, "Trade credit");

// 3) Mark trade paid
const { data: updated, error: errUpd } = await supabase
  .from("trades")
  .update({ status: "PAID", payout_type: "CREDIT", paid_at: new Date().toISOString() })
  .eq("id", id)
  .select()
  .single();

return res.json({ trade: updated });
