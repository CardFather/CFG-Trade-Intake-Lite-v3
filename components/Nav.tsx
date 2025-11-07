import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Nav(){
  const r = useRouter();
  const [q,setQ] = useState("");
  const go = (e:any)=>{
    e.preventDefault();
    if(!q.trim()) return;
    r.push(`/search?q=${encodeURIComponent(q.trim())}`);
    setQ("");
  };
  const Item = ({href,label}:{href:string,label:string}) => (
    <Link href={href} style={{padding:"6px 10px",borderRadius:8,background:r.pathname===href?"#111":"#222",color:"#fff",textDecoration:"none"}}>
      {label}
    </Link>
  );
  return (
    <div style={{position:"sticky",top:0,zIndex:10,background:"#1a1a1a",borderBottom:"1px solid #333"}}>
      <div style={{display:"flex",alignItems:"center",gap:8, padding:"8px 12px", maxWidth:1100, margin:"0 auto"}}>
        <Link href="/" style={{color:"#fff",fontWeight:800,letterSpacing:.3,textDecoration:"none"}}>CFG Intake</Link>
        <div style={{display:"flex",gap:6, marginLeft:12}}>
          <Item href="/" label="Queue" />
          <Item href="/new" label="New Intake" />
          <Item href="/credits" label="Redeem" />
          <Item href="/tv" label="TV View" />
          <Item href="/search" label="Search" />
        </div>
        <form onSubmit={go} style={{marginLeft:"auto", display:"flex", gap:6}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name / phone / email / intake id" style={{padding:"6px 10px",borderRadius:8,border:"1px solid #444",background:"#0f0f0f",color:"#fff",width:320}} />
          <button type="submit" style={{padding:"6px 12px",borderRadius:8,border:"1px solid #444",background:"#2b2b2b",color:"#fff"}}>Search</button>
        </form>
      </div>
    </div>
  );
}
