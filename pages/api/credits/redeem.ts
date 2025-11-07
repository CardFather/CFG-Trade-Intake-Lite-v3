import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";
import { storeCreditDebitCents } from "../../../lib/shopify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { shopify_customer_id, amount_cents, reason } = req.body || {};
  if (!shopify_customer_id) return res.status(400).json({ error: "Missing shopify_customer_id" });
  if (!amount_cents) return res.status(400).json({ error: "Missing amount_cents" });

  const amt = Math.abs(parseInt(String(amount_cents), 10) || 0);

  try {
    // 1) DEBIT Shopify native Store Credit
    await storeCreditDebitCents(shopify_customer_id, amt, reason || "Redemption");

    // 2) Log to Supabase ledger
    const { error: e1 } = await supabase.from("store_credit_ledger").insert({
      shopify_customer_id,
      delta_cents: -amt,
      reason: reason || "Redemption",
      reference: null,
      actor: "system",
    });
    if (e1) return res.status(500).json({ error: e1.message });

    return res.json({ ok: true });
  } catch (err: any) {
    console.error("Redeem error:", err);
    return res.status(500).json({ error: err.message });
  }
}
