import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";
import { setCustomerCreditCents } from "../../../lib/shopify";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== "POST") return res.status(405).end();
  const { shopify_customer_id, amount_cents, reason } = req.body || {};
  if (!shopify_customer_id || !amount_cents) return res.status(400).json({ error: "Missing fields" });

  const neg = -Math.abs(parseInt(String(amount_cents),10)||0);

  const { error: e1 } = await supabase.from("store_credit_ledger").insert({
    shopify_customer_id, delta_cents: neg, reason: reason||"Redemption", reference: null, actor: "system"
  });
  if (e1) return res.status(500).json({ error: e1.message });

  const { data: all, error: e2 } = await supabase
    .from("store_credit_ledger").select("delta_cents")
    .eq("shopify_customer_id", shopify_customer_id);
  if (e2) return res.status(500).json({ error: e2.message });

  const balance = (all||[]).reduce((a,r)=>a+(r.delta_cents||0),0);

  try { await setCustomerCreditCents(shopify_customer_id, balance); }
  catch(err:any){ return res.status(500).json({ error: "Shopify metafield update failed: "+err.message }); }

  return res.json({ ok:true, balance_cents: balance });
}
