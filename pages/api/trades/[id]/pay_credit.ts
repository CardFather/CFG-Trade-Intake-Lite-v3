import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";
import { storeCreditCreditCents } from "../../../../lib/shopify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== "POST") return res.status(405).end();
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing id" });

  // Load trade
  const { data: trade, error: errTrade } = await supabase.from("trades").select("*").eq("id", id).single();
  if (errTrade || !trade) return res.status(404).json({ error: errTrade?.message || "Trade not found" });

  if (!trade.shopify_customer_id) return res.status(400).json({ error: "No Shopify customer linked" });
  if (!trade.credit_value_cents) return res.status(400).json({ error: "credit_value_cents missing" });

  // 1) Credit Shopify native Store Credit
  await storeCreditCreditCents(trade.shopify_customer_id, trade.credit_value_cents, "Trade credit");

  // 2) Log to Supabase ledger
  const { error: errLedger } = await supabase.from("store_credit_ledger").insert({
    shopify_customer_id: trade.shopify_customer_id,
    delta_cents: trade.credit_value_cents,
    reason: "Trade credit",
    reference: trade.intake_id,
    actor: "system",
  });
  if (errLedger) return res.status(500).json({ error: errLedger.message });

  // 3) Mark trade paid
  const { data: updated, error: errUpd } = await supabase
    .from("trades")
    .update({ status: "PAID", payout_type: "CREDIT", paid_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (errUpd) return res.status(500).json({ error: errUpd.message });

  return res.json({ trade: updated });
}
