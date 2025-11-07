import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";
import { randomUUID } from "crypto";

function makeIntakeId(date=new Date(),seq:number){
  const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,"0");
  const d=String(date.getDate()).padStart(2,"0"); const s=String(seq).padStart(4,"0");
  return `TI-${y}-${m}-${d}-${s}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { customer, sortswift_order_no, est_item_count, notes, staff_checkin } = req.body || {};
    const today = new Date();
    const { data: list } = await supabase.from("trades").select("id").gte("checkin_at", new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString());
    const seq = (list?.length || 0) + 1;
    const intake_id = makeIntakeId(today, seq);
    const queue_number = seq;
    const qr_slug = randomUUID().split("-")[0];
    const { data, error } = await supabase.from("trades").insert({
      intake_id, queue_number, qr_slug,
      shopify_customer_id: customer?.id ? String(customer.id) : null,
      customer_name: customer?.name || null,
      customer_phone: customer?.phone || null,
      customer_email: customer?.email || null,
      sortswift_order_no: sortswift_order_no || null,
      est_item_count: est_item_count || null,
      notes: notes || null,
      staff_checkin: staff_checkin || null,
      status: "OPEN"
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ trade: data });
  }
  if (req.method === "GET") {
    const { status } = req.query;
    let q = supabase.from("trades").select("*").order("checkin_at", { ascending: false }).limit(100);
    if (status && typeof status === "string") q = q.eq("status", status.toUpperCase());
    const { data, error } = await q;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ trades: data });
  }
  res.setHeader("Allow", "GET,POST"); res.status(405).end();
}
