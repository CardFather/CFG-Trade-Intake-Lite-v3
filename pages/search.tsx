import { useRouter } from "next/router";
import useSWR from "swr";
import Link from "next/link";
import { useEffect, useState } from "react";
const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export default function Search(){
  const r = useRouter();
  const q = (r.query.q as string) || "";
  const { data, isLoading } = useSWR(q?`/api/search?q=${encodeURIComponent(q)}`:null, fetcher);
  const [local,setLocal]=useState(q);

  useEffect(()=>{ setLocal(q || ""); },[q]);
  const submit=(e:any)=>{ e.preventDefault(); if(!local.trim()) return; r.push(`/search?q=${encodeURIComponent(local.trim())}`); };

  return (
    <div style={{fontFamily:"system-ui"}}>
      <h1>Search</h1>
      <form onSubmit={submit} style={{display:"flex", gap:8, margin:"8px 0 16px"}}>
        <input value={local} onChange={e=>setLocal(e.target.value)} placeholder="name / phone / email / intake id / SortSwift #" style={{padding:"8px 10px", borderRadius:8, border:"1px solid #444", background:"#0f0f0f", color:"#fff", width:420}}/>
        <button style={{padding:"8px 12px", borderRadius:8, border:"1px solid #444", background:"#2b2b2b", color:"#fff"}}>Search</button>
      </form>
      {!q && <div style={{opacity:.6}}>Type above to search.</div>}
      {q && isLoading && <div>Searching…</div>}
      {q && data && <Results results={data.results||[]} />}
    </div>
  );
}

function Results({results}:{results:any[]}){
  return (
    <div style={{display:"grid", gap:8}}>
      {results.map((t:any)=>(
        <div key={t.id} style={{border:"1px solid #333", borderRadius:10, padding:"10px 12px", display:"flex", justifyContent:"space-between", background:"#121212"}}>
          <div>
            <div style={{fontWeight:700}}>{t.customer_name || "Guest"}</div>
            <div style={{fontSize:12, opacity:.7}}>{t.customer_phone || ""} {t.customer_email ? `· ${t.customer_email}` : ""}</div>
            <div style={{fontSize:12, opacity:.6}}>Intake: {t.intake_id} · Queue #{String(t.queue_number).padStart(3,"0")} · Status: {t.status}</div>
          </div>
          <Link href={`/t/${t.qr_slug}`}>Open</Link>
        </div>
      ))}
      {!results.length && <div style={{opacity:.6}}>No results.</div>}
    </div>
  );
}
