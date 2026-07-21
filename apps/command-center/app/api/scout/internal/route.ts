import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { agentMessages, agents, goalAssignments, monitoringQueries, opportunities, opportunityEvidence, scoutRuns, sharedGoals } from "@/db/schema";
import { normalizeScoutTitle, scoreScoutOpportunity } from "@/lib/agents/scout";
import { isScoutInternalRequest, parseScoutIngest, SCOUT_ACTIVATION_CORRELATION_ID, SCOUT_GOAL_ID } from "@/lib/scout-internal";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isScoutInternalRequest(request)) return NextResponse.json({ error: "Internal authentication required." }, { status: 401 });
  let input: Record<string, unknown>;
  try { input = await request.json() as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  try {
    if (input.action === "activate") return NextResponse.json(await activateScout());
    if (input.action === "ingest_run") return NextResponse.json(await ingestScoutRun(input), { status: 201 });
    if (input.action === "accept_handoff") return NextResponse.json(await acceptHandoff(input));
    return NextResponse.json({ error: "Unsupported internal action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SCOUT_INTERNAL_FAILURE";
    const clientError = /^(INVALID_|DEMONSTRATION_|EVIDENCE_)/.test(message);
    return NextResponse.json({ error: clientError ? message : "Scout internal operation failed safely." }, { status: clientError ? 400 : 502 });
  }
}

async function activateScout() {
  const db = await getDb();
  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  const agentRows = [
    { id:"AGT-001", name:"Symbiont COO", mission:"Resolve company priorities, authority conflicts, and agent escalations.", authorityLevel:"L2", parentAgentId:null, status:"Active", version:"1.0.0", updatedAt:now },
    { id:"AGT-002", name:"Sales Operations", mission:"Own qualification, outreach, and pursuit after accepting governed handoffs.", authorityLevel:"L1", parentAgentId:"AGT-001", status:"Active", version:"1.0.0", updatedAt:now },
    { id:"AGT-009", name:"Opportunity Scout", mission:"Discover, verify, score, deduplicate, and route public buying signals.", authorityLevel:"L1", parentAgentId:"AGT-001", status:"Active — governed", version:"1.0.0", updatedAt:now },
  ];
  for (const row of agentRows) await db.insert(agents).values(row).onConflictDoUpdate({ target:agents.id, set:{ name:row.name, mission:row.mission, authorityLevel:row.authorityLevel, parentAgentId:row.parentAgentId, status:row.status, version:row.version, updatedAt:now } });
  await db.insert(sharedGoals).values({ id:SCOUT_GOAL_ID, objective:"Continuously discover and route verified, high-fit opportunity signals without unauthorized external action.", accountableAgentId:"AGT-001", priority:"P1", status:"Active", successMeasuresJson:JSON.stringify(["Canonical source opened before reporting","No duplicate handoffs","Scores follow published thresholds","AGT-002 explicitly accepts pursuit handoffs","Zero unauthorized external actions"]), updatedAt:now }).onConflictDoUpdate({ target:sharedGoals.id, set:{ accountableAgentId:"AGT-001", priority:"P1", status:"Active", updatedAt:now } });
  const assignments = [
    { id:"ASN-GOAL-009-001", sharedGoalId:SCOUT_GOAL_ID, agentId:"AGT-001", role:"Accountable Owner", status:"Accepted", acceptedAt:now, updatedAt:now },
    { id:"ASN-GOAL-009-002", sharedGoalId:SCOUT_GOAL_ID, agentId:"AGT-002", role:"Handoff Owner", status:"Accepted", acceptedAt:now, updatedAt:now },
    { id:"ASN-GOAL-009-009", sharedGoalId:SCOUT_GOAL_ID, agentId:"AGT-009", role:"Discovery and Evidence Owner", status:"Accepted", acceptedAt:now, updatedAt:now },
  ];
  for (const row of assignments) await db.insert(goalAssignments).values(row).onConflictDoUpdate({ target:[goalAssignments.sharedGoalId, goalAssignments.agentId], set:{ role:row.role, status:row.status, acceptedAt:now, updatedAt:now } });
  const queries = [
    { id:"QRY-AGT009-NY-STATE", name:"New York state building intelligence", queryText:"(BIM OR reality capture OR laser scanning OR digital twin OR facilities technology OR building data) AND (RFP OR RFQ OR bid OR capital project)", sourceCategory:"NYS Contract Reporter, OGS, authorities, SUNY/CUNY and official issuer sources", geography:"New York", cadence:"Weekdays 08:00 ET", status:"Active", nextCheckAt:tomorrow, robotsPolicy:"Official public pages and APIs only; no account creation or terms acceptance", requiresAuthentication:false, ownerAgentId:"AGT-009", updatedAt:now },
    { id:"QRY-AGT009-NY-LOCAL", name:"New York local capital projects", queryText:"(renovation OR modernization OR assessment OR infrastructure) AND (survey OR BIM OR scan OR digital twin OR asset information)", sourceCategory:"NYC, counties, municipalities, schools, transit, airports and utilities", geography:"New York", cadence:"Weekdays 08:00 ET", status:"Active", nextCheckAt:tomorrow, robotsPolicy:"Canonical issuer sources only; respect restricted-period contact rules", requiresAuthentication:false, ownerAgentId:"AGT-009", updatedAt:now },
    { id:"QRY-AGT009-NJ-STATE", name:"New Jersey state building intelligence", queryText:"(BIM OR reality capture OR laser scanning OR unmanned aerial OR digital twin OR facilities technology) AND (RFP OR RFQ OR bid)", sourceCategory:"NJ Treasury DPP, NJSTART public notices, NJDOT, NJ Transit and official issuer sources", geography:"New Jersey", cadence:"Weekdays 08:00 ET", status:"Active", nextCheckAt:tomorrow, robotsPolicy:"Use public notices; stop at authentication, CAPTCHA or click-through terms", requiresAuthentication:false, ownerAgentId:"AGT-009", updatedAt:now },
    { id:"QRY-AGT009-NJ-LOCAL", name:"New Jersey local capital projects", queryText:"(facility OR campus OR school OR utility OR transit) AND (renovation OR survey OR scan OR BIM OR asset data)", sourceCategory:"Counties, municipalities, schools, universities, authorities and utilities", geography:"New Jersey", cadence:"Weekdays 08:00 ET", status:"Active", nextCheckAt:tomorrow, robotsPolicy:"Official procurement and capital-plan sources only; privacy-minimized", requiresAuthentication:false, ownerAgentId:"AGT-009", updatedAt:now },
  ];
  for (const row of queries) await db.insert(monitoringQueries).values(row).onConflictDoUpdate({ target:monitoringQueries.id, set:{ name:row.name, queryText:row.queryText, sourceCategory:row.sourceCategory, geography:row.geography, cadence:row.cadence, status:row.status, nextCheckAt:row.nextCheckAt, robotsPolicy:row.robotsPolicy, requiresAuthentication:row.requiresAuthentication, ownerAgentId:row.ownerAgentId, updatedAt:now } });
  await db.insert(agentMessages).values({ id:"MSG-AGT009-ACTIVATION", sharedGoalId:SCOUT_GOAL_ID, correlationId:SCOUT_ACTIVATION_CORRELATION_ID, senderAgentId:"AGT-001", recipientAgentId:"AGT-009", messageType:"Information", status:"Accepted", subject:"AGT-009 governed production monitoring approved", bodyJson:JSON.stringify({ authority:"L1", owner:"AGT-001", customer:"AGT-002", approvalBoundary:"No external contact, account creation, terms acceptance, bid submission, or commitment", monitoringScope:"New Jersey and New York state and local public buyers", monitoringQueryCount:queries.length }), idempotencyKey:"activate:agt-009:v1", acceptedAt:now }).onConflictDoNothing();
  return { status:"active", sharedGoalId:SCOUT_GOAL_ID, correlationId:SCOUT_ACTIVATION_CORRELATION_ID, agents:agentRows.length, assignments:assignments.length, monitoringQueries:queries.length, liveScanOccurred:false, opportunityWrites:0, handoffs:0 };
}

async function ingestScoutRun(raw: unknown) {
  const input = parseScoutIngest(raw);
  const db = await getDb();
  const now = new Date().toISOString();
  let verifiedCount = 0, routedCount = 0, duplicateCount = 0;
  for (const item of input.opportunities) {
    const normalizedTitle = normalizeScoutTitle(item.title);
    const matches = await db.select({ id:opportunities.id }).from(opportunities).where(or(eq(opportunities.id,item.id),eq(opportunities.canonicalUrl,item.canonicalUrl),and(eq(opportunities.issuer,item.issuer),eq(opportunities.normalizedTitle,normalizedTitle)))).limit(1);
    const opportunityId = matches[0]?.id ?? item.id;
    if (matches.length) duplicateCount += 1;
    const scored = scoreScoutOpportunity(item.scores);
    const handoffStatus = scored.route === "sales_operations" ? "Review — awaiting AGT-002 acceptance" : scored.route === "watchlist" ? "Watchlist" : "Archived with reason";
    const values = { issuer:item.issuer, issuerWebsite:item.issuerWebsite, title:item.title, normalizedTitle, solicitationNumber:item.solicitationNumber, canonicalUrl:item.canonicalUrl, publicationDate:item.publicationDate, deadlineAt:item.deadlineAt, deadlineTimezone:item.deadlineTimezone, location:item.location, geographyKey:item.geographyKey, statedValue:item.statedValue, currency:item.currency, procurementType:item.procurementType, scope:item.scope, publicContactJson:item.publicContact ? JSON.stringify(item.publicContact) : null, accessRequirements:item.accessRequirements, fitRationale:item.fitRationale, serviceFitScore:item.scores.serviceFit, buyerFitScore:item.scores.buyerFit, timingScore:item.scores.timing, valueScore:item.scores.value, evidenceScore:item.scores.evidence, accessScore:item.scores.access, recurrenceScore:item.scores.recurrence, totalScore:scored.total, confidence:item.confidence, freshness:item.freshness, risksJson:JSON.stringify(item.risks), missingInformationJson:JSON.stringify(item.missingInformation), nextAction:item.nextAction, route:scored.route, handoffStatus, observedAt:item.observedAt, sourceKind:item.sourceKind, isDemonstration:false, updatedAt:now };
    if (matches.length) await db.update(opportunities).set(values).where(eq(opportunities.id,opportunityId));
    else await db.insert(opportunities).values({ id:opportunityId, ...values });
    await db.insert(opportunityEvidence).values({ ...item.evidence, opportunityId }).onConflictDoNothing();
    verifiedCount += 1;
    if (scored.route === "sales_operations") {
      await db.insert(agentMessages).values({ id:`MSG-${input.runId}-${opportunityId}`, sharedGoalId:input.sharedGoalId, correlationId:input.correlationId, senderAgentId:"AGT-009", recipientAgentId:"AGT-002", messageType:"Handoff", status:"Review", subject:`Qualified opportunity: ${item.title}`, bodyJson:JSON.stringify({ objective:"AGT-002 accepts or declines qualification ownership", canonicalUrl:item.canonicalUrl, score:scored.total, confidence:item.confidence, nextAction:item.nextAction, acceptanceCriteria:["Canonical evidence reviewed","Qualification owner assigned","Pursuit decision recorded"], authority:"L1 — no external action" }), opportunityId, idempotencyKey:`handoff:${input.sharedGoalId}:${opportunityId}:${item.evidence.contentHash}` }).onConflictDoNothing();
      routedCount += 1;
    }
  }
  await db.insert(scoutRuns).values({ id:input.runId, sharedGoalId:input.sharedGoalId, correlationId:input.correlationId, agentId:"AGT-009", status:"Complete", startedAt:input.startedAt, completedAt:input.completedAt, sourcesChecked:input.sourcesChecked, candidatesFound:input.candidatesFound, verifiedCount, routedCount }).onConflictDoNothing();
  return { status:"Complete", runId:input.runId, sharedGoalId:input.sharedGoalId, correlationId:input.correlationId, verifiedCount, routedCount, duplicateCount };
}

async function acceptHandoff(input: Record<string, unknown>) {
  for (const key of ["messageId","sharedGoalId","correlationId"]) if (typeof input[key] !== "string" || !input[key]) throw new Error(`INVALID_${key.toUpperCase()}`);
  if (input.sharedGoalId !== SCOUT_GOAL_ID) throw new Error("INVALID_SHARED_GOAL");
  const db = await getDb();
  const match = await db.select().from(agentMessages).where(and(eq(agentMessages.id,String(input.messageId)),eq(agentMessages.sharedGoalId,String(input.sharedGoalId)),eq(agentMessages.correlationId,String(input.correlationId)),eq(agentMessages.recipientAgentId,"AGT-002"),eq(agentMessages.messageType,"Handoff"),eq(agentMessages.status,"Review"))).limit(1);
  if (!match.length) throw new Error("INVALID_HANDOFF_STATE");
  const now = new Date().toISOString();
  await db.update(agentMessages).set({ status:"Accepted", acceptedAt:now }).where(eq(agentMessages.id,match[0].id));
  if (match[0].opportunityId) await db.update(opportunities).set({ handoffStatus:"Accepted by AGT-002", updatedAt:now }).where(eq(opportunities.id,match[0].opportunityId));
  return { status:"Accepted", messageId:match[0].id, opportunityId:match[0].opportunityId, acceptedBy:"AGT-002", sharedGoalId:input.sharedGoalId, correlationId:input.correlationId, acceptedAt:now };
}
