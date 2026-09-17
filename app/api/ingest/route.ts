import { env } from "cloudflare:workers";
import { createHash } from "node:crypto";

type SourcePayload={key:string;name:string;url:string;kind:string;priority:number;status:"ok"|"error";fetchedAt:string;contentHash?:string;body?:string;error?:string};
type Payload={runKey:string;sources:SourcePayload[]};

export async function POST(request:Request){
  const runtime=env as unknown as Record<string,unknown>;const secret=runtime.INGEST_SECRET;
  if(typeof secret!=="string"||request.headers.get("authorization")!==`Bearer ${secret}`)return Response.json({ok:false,error:"unauthorized"},{status:401});
  if(!runtime.DB||!runtime.BUCKET)return Response.json({ok:false,error:"storage unavailable"},{status:503});
  const db=runtime.DB as D1Database;const bucket=runtime.BUCKET as R2Bucket;let payload:Payload;
  try{payload=await request.json() as Payload}catch{return Response.json({ok:false,error:"invalid json"},{status:400})}
  if(!payload.runKey||!Array.isArray(payload.sources)||payload.sources.length>50)return Response.json({ok:false,error:"invalid payload"},{status:422});
  const now=Math.floor(Date.now()/1000);let accepted=0;
  await db.prepare("INSERT OR IGNORE INTO ingestion_runs (run_key,status,items_found,items_published,started_at) VALUES (?,?,?,?,?)").bind(payload.runKey,"running",payload.sources.length,0,now).run();
  for(const source of payload.sources){
    if(!source.key||!source.url)continue;
    await db.prepare("INSERT INTO sources (key,name,base_url,kind,priority,enabled,created_at) VALUES (?,?,?,?,?,1,?) ON CONFLICT(key) DO UPDATE SET name=excluded.name,base_url=excluded.base_url,kind=excluded.kind,priority=excluded.priority").bind(source.key,source.name,source.url,source.kind,source.priority??100,now).run();
    if(source.status!=="ok"||!source.body)continue;
    const row=await db.prepare("SELECT id FROM sources WHERE key=?").bind(source.key).first<{id:number}>();if(!row)continue;
    const hash=source.contentHash??createHash("sha256").update(source.body).digest("hex");
    const objectKey=`sources/${source.key}/${hash}.html`;
    await bucket.put(objectKey,source.body,{httpMetadata:{contentType:"text/html; charset=utf-8"},customMetadata:{source:source.key,fetchedAt:source.fetchedAt}});
    await db.prepare("INSERT OR IGNORE INTO source_items (source_id,external_id,url,content_hash,raw_json,discovered_at) VALUES (?,?,?,?,?,?)").bind(row.id,hash,source.url,hash,JSON.stringify({fetchedAt:source.fetchedAt,objectKey}),now).run();accepted++;
  }
  await db.prepare("UPDATE ingestion_runs SET status=?,items_published=?,finished_at=? WHERE run_key=?").bind("collected",accepted,now,payload.runKey).run();
  return Response.json({ok:true,accepted});
}
