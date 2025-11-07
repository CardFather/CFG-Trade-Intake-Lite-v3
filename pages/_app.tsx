import type { AppProps } from "next/app";
import Nav from "../components/Nav";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div style={{background:"#0b0b0b",minHeight:"100vh",color:"#fff"}}>
      <Nav />
      <div style={{maxWidth:1100, margin:"0 auto", padding:"16px"}}>
        <Component {...pageProps} />
      </div>
    </div>
  );
}
