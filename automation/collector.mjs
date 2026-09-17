import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const sources=JSON.parse(await readFile(new URL("./sources.json",import.meta.url),"utf8"));
const dryRun=process.argv.includes("--dry-run");
const timeoutMs=Number(process.env.COLLECTOR_TIMEOUT_MS??15000);

async function fetchSource(source){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(source.url,{headers:{"user-agent":"DiziMeterBot/0.1 (+data quality monitor; respectful fetch cadence)",accept:"text/html,application/xhtml+xml"},signal:controller.signal});
    const body=await response.text();
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return {...source,status:"ok",fetchedAt:new Date().toISOString(),contentType:response.headers.get("content-type"),contentHash:createHash("sha256").update(body).digest("hex"),body:body.slice(0,500000)};
  }catch(error){return {...source,status:"error",fetchedAt:new Date().toISOString(),error:error instanceof Error?error.message:String(error)}}finally{clearTimeout(timer)}
}

const results=[];
for(const source of sources){results.push(await fetchSource(source))}
const envelope={runKey:`collector-${new Date().toISOString()}`,sources:results};
const summary=results.map(({key,status,error})=>({key,status,error}));

if(dryRun){console.log(JSON.stringify(summary,null,2));process.exit(results.some(x=>x.status==="ok")?0:1)}
const target=process.env.DIZIMETER_INGEST_URL;const secret=process.env.DIZIMETER_INGEST_SECRET;
if(!target||!secret)throw new Error("DIZIMETER_INGEST_URL and DIZIMETER_INGEST_SECRET are required");
const response=await fetch(target,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${secret}`},body:JSON.stringify(envelope)});
if(!response.ok)throw new Error(`Ingest failed: ${response.status} ${await response.text()}`);
console.log(JSON.stringify({ok:true,summary,response:await response.json()},null,2));
