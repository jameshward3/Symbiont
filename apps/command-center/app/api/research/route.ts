import {NextResponse} from "next/server";
import {demonstrationResearchData,verifiedResearchData} from "@/lib/research";
export const dynamic="force-dynamic";
export async function GET(request:Request){const demo=new URL(request.url).searchParams.get("demo")==="1";return NextResponse.json(demo?demonstrationResearchData:verifiedResearchData);}
export async function POST(){return NextResponse.json({error:"Research mutation requires an authenticated internal workflow and human-reviewed authority."},{status:405,headers:{Allow:"GET"}});}
