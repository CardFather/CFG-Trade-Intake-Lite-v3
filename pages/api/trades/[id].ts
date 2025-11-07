import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing id" });

  if (req.method === "GET") {
    const { data, error } = await supabase.from("trades").select("*").eq("id", id).single();
    if (error) return res.status(404).json({ error: error.message });
    return res.json({ trade: data });
  }

  if (req.method === "PATCH") {
    const { data, error } = await supabase.from("trades").update(req.body || {}).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ trade: data });
  }

  res.setHeader("Allow", "GET,PATCH"); res.status(405).end();
}
