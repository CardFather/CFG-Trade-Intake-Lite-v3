import { useRouter } from "next/router"; import useSWR from "swr"; import { useState } from "react";
const fetcher=(u:string)=>fetch(u).then(r=>r.json());
export default function Ticket(){
  const {slug}=useRouter().query; const {data,mutate}=useSWR(slug?`/api/tickets/${slug}`:null,fetcher,{refreshInterval:2000});
  const trade=data?.trade; const [cash,setCash]=useState(""); const [credit,setCredit]=useState("");
  const patch=async(body:any)=>{await fetch(`/api/trades/${trade.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); mutate();};
  const markReady=async()=>{await fetch(`/api/trades/${trade.id}/ready`,{method:"POST"}); mutate();};
  const payCash=async()=>{await fetch(`/api/trades/${trade.id}/pay_cash`,{method:"POST"}); mutate();};
  const payCredit=async()=>{const r=await fetch(`/api/trades/${trade.id}/pay_credit`,{method:"POST"}).then(r=>r.json()); if(r.error) alert(r.error); mutate();};
  if(!trade) return <div style={{padding:20,fontFamily:"system-ui"}}>Loading...</div>;
  return (<div style={{padding:20,fontFamily:"system-ui"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
      <div><div style={{fontSize:12,opacity:.7}}>Trade #{String(trade.queue_number).padStart(3,"0")} · {trade.intake_id}</div>
      <div style={{fontSize:18,fontWeight:600}}>{trade.customer_name || trade.customer_phone || "Guest"}</div></div>
      <div style={{fontSize:12,border:"1px solid #ddd",borderRadius:8,padding:"2px 6px"}}>{trade.status}</div>
    </div>
    <div style={{border:"1px solid #ddd",borderRadius:8,padding:10}}>
      <div style={{fontSize:12,opacity:.8}}>Values</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}>
        <input placeholder="Cash $" value={cash} onChange={e=>setCash(e.target.value)} />
        <input placeholder="Store Credit $" value={credit} onChange={e=>setCredit(e.target.value)} />
      </div>
      <div style={{marginTop:8,display:"flex",gap:8}}>
        <button onClick={()=>patch({cash_value_cents:Math.round((parseFloat(cash)||0)*100),credit_value_cents:Math.round((parseFloat(credit)||0)*100)})}>Save Values</button>
        <button onClick={markReady}>Mark READY</button>
      </div>
    </div>
    {trade.status==="READY"&&(<div style={{border:"1px solid #ddd",borderRadius:8,padding:10,marginTop:10}}>
      <div style={{fontSize:12}}>Payout</div>
      <div style={{marginTop:8,display:"flex",gap:8}}>
        <button onClick={payCash}>Pay CASH</button>
        <button onClick={payCredit}>Add STORE CREDIT</button>
      </div>
    </div>)}
  </div>);
}
