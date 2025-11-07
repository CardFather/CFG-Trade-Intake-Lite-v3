import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const q = (req.query.q as string || "").trim();
  if(!q) return res.json({ results: [] });

  const like = `%${q}%`;

  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .or(`customer_name.ilike.${like},customer_phone.ilike.${like},customer_email.ilike.${like},intake_id.ilike.${like},sortswift_order_no.ilike.${like}`)
    .order("checkin_at", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ results: data || [] });
}
