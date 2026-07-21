import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { demonstrationMarketingData } from "@/lib/marketing";
export const dynamic="force-dynamic";
export async function GET(request:Request){
  const authorized=isAuthorized(request);
  return NextResponse.json({...demonstrationMarketingData,database:authorized?"connected_empty":"authorization_required",activation:authorized?demonstrationMarketingData.activation:"Secure authorization is required for live marketing evidence. Sanitized demonstration records remain read-only; no external action is available."});
}

