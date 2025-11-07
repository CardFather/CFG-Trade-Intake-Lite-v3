import useSWR from "swr"; import Link from "next/link";
const fetcher=(u:string)=>fetch(u).then(r=>r.json());
export default function Home(){
  const {data:open}=useSWR("/api/trades?status=OPEN",fetcher,{refreshInterval:4000});
  const {data:inprog}=useSWR("/api/trades?status=IN_PROGRESS",fetcher,{refreshInterval:4000});
  const {data:ready}=useSWR("/api/trades?status=READY",fetcher,{refreshInterval:2000});
  return (<div style={{padding:20,fontFamily:"system-ui"}}>
    <h1>Queue</h1>
    <Section title="Open" items={open?.trades||[]} />
    <Section title="In Progress" items={inprog?.trades||[]} />
    <Section title="Ready" items={ready?.trades||[]} />
    <p style={{marginTop:16}}><a href="/new">New Intake</a> · <a href="/credits">Redeem</a></p>
  </div>);
}
function Section({title,items}:{title:string,items:any[]}){
  return (<div style={{marginBottom:16}}>
    <h3>{title} ({items.length})</h3>
    <div style={{display:"grid",gap:8}}>
      {items.map((t:any)=>(<div key={t.id} style={{border:"1px solid #ddd",borderRadius:8,padding:"8px 10px",display:"flex",justifyContent:"space-between"}}>
        <div><div style={{fontWeight:600}}>Trade #{String(t.queue_number).padStart(3,"0")}</div>
        <div style={{fontSize:12,opacity:.7}}>{t.customer_name || t.customer_phone || "Guest"}</div></div>
        <Link href={`/t/${t.qr_slug}`}>Open</Link>
      </div>))}
      {!items.length && <div style={{fontSize:12,opacity:.6}}>No tickets.</div>}
    </div>
  </div>);
}
