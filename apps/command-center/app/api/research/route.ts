import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { researchRequests } from "@/db/schema";
import { isAuthorized } from "@/lib/auth";
import { demonstrationResearchData } from "@/lib/research";
export const dynamic="force-dynamic";
export async function GET(request:Request){try{const db=await getDb();if(!isAuthorized(request))return NextResponse.json({...demonstrationResearchData,database:"authorization_required",activation:"Secure access is required for live research. Demonstration records remain visibly labeled."});const rows=await db.select().from(researchRequests).where(eq(researchRequests.status,"Draft")).orderBy(desc(researchRequests.updatedAt)).limit(100);if(!rows.length)return NextResponse.json(demonstrationResearchData);return NextResponse.json({...demonstrationResearchData,source:"d1",database:"connected",asOf:new Date().toISOString(),activation:"Authorized draft research requests from D1. External source connections and handoffs are reported only when recorded.",requests:rows.map(r=>({id:r.researchId,title:r.question,topic:r.geography||"General",owner:r.ownerAgentId,requester:r.requestingAgentId,status:r.status,confidence:r.confidence,freshness:r.freshness,observedAt:r.observationDate,sourceType:"Recorded source",claimType:"Fact",summary:r.decisionSupported,evidence:JSON.parse(r.evidenceLinksJson),isDemonstration:false}))});}catch{return NextResponse.json({...demonstrationResearchData,database:"unavailable"});}}
export async function POST(){return NextResponse.json({error:"Research mutation requires an authenticated internal workflow and human-reviewed authority."},{status:405,headers:{Allow:"GET"}});}
