import { useState } from "react";
export default function NewIntake(){
  const [form,setForm]=useState<any>({}); const [created,setCreated]=useState<any>(null); const [busy,setBusy]=useState(false);
  const onChange=(e:any)=>setForm({...form,[e.target.name]:e.target.value});
  const onSubmit=async(e:any)=>{e.preventDefault(); setBusy(true);
    const customer={id:form.shopify_customer_id||null,name:form.customer_name||null,phone:form.customer_phone||null,email:form.customer_email||null};
    const r=await fetch("/api/trades",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,sortswift_order_no:form.sortswift_order_no||null,est_item_count:form.est_item_count?Number(form.est_item_count):null,notes:form.notes||null,staff_checkin:form.staff_checkin||null})}).then(r=>r.json());
    setCreated(r.trade); setBusy(false);
  };
  return (<div style={{padding:20,fontFamily:"system-ui"}}>
    <h1>New Intake</h1>
    {!created?(<form onSubmit={onSubmit} style={{display:"grid",gap:8,maxWidth:480}}>
      <input name="customer_name" placeholder="Customer name" onChange={onChange}/>
      <input name="customer_phone" placeholder="Phone" onChange={onChange}/>
      <input name="customer_email" placeholder="Email" onChange={onChange}/>
      <input name="sortswift_order_no" placeholder="SortSwift # (optional)" onChange={onChange}/>
      <input name="est_item_count" placeholder="Estimated item count" onChange={onChange}/>
      <input name="staff_checkin" placeholder="Staff initials" onChange={onChange}/>
      <textarea name="notes" placeholder="Notes" onChange={onChange}/>
      <button disabled={busy}>{busy?"Creating...":"Create Intake"}</button>
    </form>):(<div>
      <div>Created: {created.intake_id}</div>
      <div>Queue #{created.queue_number}</div>
      <div style={{marginTop:8}}><a href={`/t/${created.qr_slug}`}>Open Ticket</a></div>
    </div>)}
  </div>);
}
