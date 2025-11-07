import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; if (req.method !== "POST") return res.status(405).end();
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing id" });
  const { data, error } = await supabase.from("trades").update({ status: "PAID", payout_type: "CASH", paid_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ trade: data });
}
