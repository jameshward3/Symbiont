import {NextResponse} from "next/server";
import {isAuthorized} from "@/lib/auth";
import {WORKFLOW_STAGES,type PortalProject} from "@/lib/workflow-portal";
export async function POST(request:Request){
 if(!isAuthorized(request))return NextResponse.json({error:"Authorization is required to create or update a Notion record."},{status:401});
 const project=await request.json() as PortalProject;
 if(project.notionUrl)return NextResponse.json({url:project.notionUrl,message:"The existing Notion page is linked. Automatic updates require the Notion integration settings."});
 const token=process.env.NOTION_TOKEN;const databaseId=process.env.NOTION_PROJECTS_DATABASE_ID;
 if(!token||!databaseId)return NextResponse.json({error:"Notion is not configured yet. Add the approved Notion integration token and Projects database ID, or paste an existing Notion page URL."},{status:503});
 const stage=WORKFLOW_STAGES.find(item=>item.id===project.stage);
 const response=await fetch("https://api.notion.com/v1/pages",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Notion-Version":"2022-06-28","Content-Type":"application/json"},body:JSON.stringify({parent:{database_id:databaseId},properties:{Name:{title:[{text:{content:project.title}}]},"Symbiont ID":{rich_text:[{text:{content:project.id}}]},Stage:{select:{name:stage?.label||project.stage}},Owner:{rich_text:[{text:{content:project.owner}}]},"Next Action":{rich_text:[{text:{content:project.nextAction||"Not assigned"}}]}}})});
 const result=await response.json() as {url?:string;message?:string};if(!response.ok)return NextResponse.json({error:`Notion did not accept the record: ${result.message||"integration error"}`},{status:502});
 return NextResponse.json({url:result.url,message:"Notion project page created and linked. Symbiont remains the workflow authority until a bidirectional mapping is approved."});
}
