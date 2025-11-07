import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (!slug || typeof slug !== "string") return res.status(400).json({ error: "Missing slug" });
  const { data, error } = await supabase.from("trades").select("*").eq("qr_slug", slug).single();
  if (error) return res.status(404).json({ error: error.message });
  return res.json({ trade: data });
}
