import useSWR from "swr";
const fetcher = (u:string)=>fetch(u).then(r=>r.json());
const big = (n:number)=>String(n).padStart(3,"0");
export default function TV(){
  const {data:ready} = useSWR("/api/trades?status=READY", fetcher, { refreshInterval: 1500 });
  const {data:inprog} = useSWR("/api/trades?status=IN_PROGRESS", fetcher, { refreshInterval: 3000 });
  const {data:open} = useSWR("/api/trades?status=OPEN", fetcher, { refreshInterval: 4000 });
  return (
    <div style={{fontFamily:"system-ui", paddingTop: 12}}>
      <h1 style={{fontSize:36, marginBottom:8}}>Now Serving</h1>
      <Row title="READY" items={(ready?.trades||[]).slice(0,8)} color="#26a269" />
      <Row title="IN PROGRESS" items={(inprog?.trades||[]).slice(0,10)} color="#e5a50a" />
      <Row title="OPEN" items={(open?.trades||[]).slice(0,12)} color="#3584e4" />
    </div>
  );
}
function Row({title, items, color}:{title:string, items:any[], color:string}){
  return (
    <div style={{marginBottom:18}}>
      <div style={{fontSize:18, opacity:.85, marginBottom:8}}>{title}</div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10}}>
        {items.map((t:any)=>(
          <div key={t.id} style={{background:"#111",border:`2px solid ${color}`, borderRadius:12, padding:"16px 12px", textAlign:"center"}}>
            <div style={{fontSize:44, fontWeight:900, letterSpacing:1}}>{big(t.queue_number)}</div>
            <div style={{fontSize:12, opacity:.7}}>{t.customer_name || t.customer_phone || "Guest"}</div>
          </div>
        ))}
        {!items.length && <div style={{opacity:.5}}>— none —</div>}
      </div>
    </div>
  );
}
