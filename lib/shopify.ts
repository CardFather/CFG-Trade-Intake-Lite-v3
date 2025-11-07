const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const NS = process.env.SHOPIFY_CREDIT_NAMESPACE || "cfg";
const KEY = process.env.SHOPIFY_CREDIT_KEY || "store_credit_cents";
const base = `https://${STORE_DOMAIN}/admin/api/2024-10`;
export async function shopifyAdmin(path:string, init?:RequestInit){
  const res = await fetch(`${base}${path}`,{...init,headers:{"X-Shopify-Access-Token":ADMIN_TOKEN,"Content-Type":"application/json",...(init?.headers||{})},cache:"no-store"});
  if(!res.ok) throw new Error(`Shopify ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}
export async function setCustomerCreditCents(customerId:number|string, cents:number){
  const list = await shopifyAdmin(`/customers/${customerId}/metafields.json`);
  const existing = (list?.metafields||[]).find((m:any)=>m.namespace===NS && m.key===KEY);
  if(existing){
    return (await shopifyAdmin(`/metafields/${existing.id}.json`,{method:"PUT",body:JSON.stringify({metafield:{id:existing.id,value:String(cents),type:"number_integer"}})})).metafield;
  } else {
    return (await shopifyAdmin(`/metafields.json`,{method:"POST",body:JSON.stringify({metafield:{namespace:NS,key:KEY,type:"number_integer",value:String(cents),owner_resource:"customer",owner_id:customerId}})})).metafield;
  }
}
