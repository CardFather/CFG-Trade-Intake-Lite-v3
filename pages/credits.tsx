import { useState } from "react";
export default function Credits(){
  const [customerId,setCustomerId]=useState(""); const [amount,setAmount]=useState("");
  const redeem=async()=>{
    const r=await fetch("/api/credits/redeem",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({shopify_customer_id:customerId,amount_cents:Math.round((parseFloat(amount)||0)*100),reason:"POS redemption"})}).then(r=>r.json());
    if(r.error) alert(r.error); else alert("Redeemed. New balance (cents): "+r.balance_cents);
  };
  return (<div style={{padding:20,fontFamily:"system-ui"}}>
    <h1>Redeem Store Credit</h1>
    <input placeholder="Shopify customer ID" value={customerId} onChange={e=>setCustomerId(e.target.value)} />
    <input placeholder="Amount $" value={amount} onChange={e=>setAmount(e.target.value)} />
    <button onClick={redeem}>Redeem</button>
    <p style={{fontSize:12,opacity:.6}}>Tip: get the numeric customer ID from the Shopify Admin URL.</p>
  </div>);
}
