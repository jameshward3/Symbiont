"use client";

import { useState } from "react";
import { BUSINESS_AREAS, CLASSIFICATIONS, LIFECYCLE, type KnowledgeData } from "@/lib/knowledge";

const DEMO_NOW = new Date("2026-07-20T23:59:59Z");

export function KnowledgeControl({ data }: { data: KnowledgeData | null }) {
  const [area, setArea] = useState("all"); const [type, setType] = useState("all"); const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all"); const [classification, setClassification] = useState("all"); const [query, setQuery] = useState("");
  if (!data) return <section className="knowledge-view"><Hero /><div className="knowledge-loading">KNOWLEDGE INDEX · CHECKING GOVERNED SOURCE</div></section>;
  const now = data.source === "d1" ? new Date(data.asOf) : DEMO_NOW;
  const types = unique(data.assets.map((item) => item.assetType)); const owners = unique(data.assets.map((item) => item.owner));
  const visible = data.assets.filter((item) => area === "all" || item.businessArea === area).filter((item) => type === "all" || item.assetType === type).filter((item) => status === "all" || item.status === status).filter((item) => owner === "all" || item.owner === owner).filter((item) => classification === "all" || item.classification === classification).filter((item) => !query.trim() || [item.id, item.title, item.description, item.sourceSystem, ...item.tags, ...item.synonyms].join(" ").toLowerCase().includes(query.toLowerCase().trim()));
  const active = visible.filter((item) => item.status === "Active" && item.isAuthoritative);
  const awaiting = visible.filter((item) => item.status === "Review");
  const overdue = visible.filter((item) => item.reviewDate && new Date(`${item.reviewDate}T23:59:59Z`) < now && !["Archived", "Superseded"].includes(item.status));
  const remediation = visible.filter((item) => item.quality.status !== "Healthy");
  const broken = visible.filter((item) => item.linkStatus === "Broken");
  const archive = visible.filter((item) => item.status === "Archived" || item.status === "Superseded");
  const byArea = BUSINESS_AREAS.map((name) => ({ name, count: data.assets.filter((item) => item.businessArea === name).length })).filter((item) => item.count);
  return <section className="knowledge-view">
    <Hero />
    <div className={`knowledge-disclosure ${data.source === "d1" ? "live" : "demo"}`}><div><span className={`dot ${data.source === "d1" ? "green" : "amber"}`} /><b>{data.source === "d1" ? "AUTHORIZED D1 METADATA" : "DEMONSTRATION INDEX"}</b></div><p>{data.activation}</p><span>AS OF {dateTime(data.asOf)}</span></div>
    <div className="knowledge-search"><label htmlFor="knowledge-query">Search controlled knowledge</label><input id="knowledge-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID, title, tag, synonym, source" /></div>
    <div className="knowledge-filters" aria-label="Knowledge filters">
      <Filter label="Business area" value={area} set={setArea} values={[...BUSINESS_AREAS]} all="All areas" />
      <Filter label="Asset type" value={type} set={setType} values={types} all="All types" />
      <Filter label="Lifecycle" value={status} set={setStatus} values={[...LIFECYCLE]} all="All states" />
      <Filter label="Owner" value={owner} set={setOwner} values={owners} all="All owners" />
      <Filter label="Classification" value={classification} set={setClassification} values={[...CLASSIFICATIONS]} all="All access" />
    </div>
    <div className="knowledge-metrics">
      <Metric label="Controlled assets" value={pad(visible.length)} note="Visible in current scope" /><Metric label="Active authority" value={pad(active.length)} note="Current sources of truth" tone="green" />
      <Metric label="Awaiting review" value={pad(awaiting.length)} note="Not authoritative" tone="amber" /><Metric label="Overdue reviews" value={pad(overdue.length)} note="Past governed review date" tone={overdue.length ? "red" : "green"} />
      <Metric label="Quality exceptions" value={pad(remediation.length)} note="Unknown or below 80" tone="amber" /><Metric label="Broken links" value={pad(broken.length)} note="Canonical path unavailable" tone={broken.length ? "red" : "green"} />
      <Metric label="Conflicts" value={pad(data.alerts.filter((item) => item.kind === "Conflict" || item.kind === "Duplicate").length)} note="Source-of-truth review" /><Metric label="Archive history" value={pad(archive.length)} note="Excluded from guidance" />
    </div>
    <div className="knowledge-grid index-grid">
      <div className="knowledge-panel"><PanelTitle kicker="Controlled index" title="Authoritative knowledge map" suffix={`${visible.length} visible`} />
        <div className="knowledge-head"><span>Asset</span><span>Control</span><span>Source</span><span>Quality</span></div>
        {visible.map((item) => <article className="knowledge-row" key={item.id}><div><p>{item.id} · {item.businessArea} / {item.assetType}</p><h4>{item.title}</h4><small>{item.description}</small><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div><b className={`life-chip ${slug(item.status)}`}>{item.status}</b><small>v{item.version} · {item.classification}</small><small>{item.owner}</small><small>Review {item.reviewDate ? date(item.reviewDate) : "unscheduled"}</small></div><div><b>{item.sourceSystem}</b><small>{item.canonicalLocation}</small><small className={item.linkStatus === "Broken" ? "danger-text" : ""}>{item.linkStatus} · {item.isAuthoritative ? "Authoritative" : "Not authoritative"}</small></div><div><strong className={item.quality.score !== null && item.quality.score < 60 ? "red" : item.quality.score !== null && item.quality.score < 80 ? "amber" : "green"}>{item.quality.score ?? "—"}</strong><small>{item.quality.status}</small><div className="knowledge-score"><i style={{ width: `${item.quality.score ?? 0}%` }} /></div><small>Usage {item.quality.usage === "unknown" ? "unknown" : item.quality.usage}</small></div></article>)}
        {!visible.length && <Empty text="No controlled assets match this view." />}
      </div>
      <aside className="knowledge-panel area-panel"><PanelTitle kicker="Taxonomy" title="Content by area" suffix="Governed map" />{byArea.map((item) => <div className="area-row" key={item.name}><span>{item.name}</span><div><i style={{width:`${Math.max(8, item.count / Math.max(...byArea.map((areaItem) => areaItem.count)) * 100)}%`}} /></div><b>{String(item.count).padStart(2,"0")}</b></div>)}</aside>
    </div>
    <div className="knowledge-grid signal-grid">
      <div className="knowledge-panel"><PanelTitle kicker="Exceptions" title="Duplicates, conflicts, links, orphans" suffix={`${data.alerts.length} signals`} />{data.alerts.map((alert) => <article className="knowledge-alert" key={alert.id}><div><span>{alert.id}</span><b className={alert.severity === "Escalate" ? "danger-text" : ""}>{alert.kind} · {alert.severity}</b></div><h4>{alert.title}</h4><p>{alert.detail}</p><small>{alert.assetIds.join(" · ")}</small></article>)}{!data.alerts.length && <Empty text="No knowledge exceptions detected." />}</div>
      <div className="knowledge-panel"><PanelTitle kicker="Audit trail" title="Material knowledge events" suffix={`${data.auditEvents.length} recent`} />{data.auditEvents.map((event) => <article className="audit-row" key={event.id}><span>{event.id} · {event.assetId}</span><h4>{event.action}</h4><p>{event.reason}</p><small>{event.actorAgentId} · {dateTime(event.occurredAt)}</small><small>{event.correlationId}</small></article>)}</div>
      <div className="knowledge-panel intake-panel"><PanelTitle kicker="Exchange intake" title="Historical archive readiness" suffix="Awaiting upload" /><div className="intake-state"><strong>00</strong><span>historical files connected</span></div><p>Uploaded files will be hashed, inventoried, classified, deduplicated, linked, and held in Draft or Review until authority and ownership are verified.</p><dl><div><dt>Original files</dt><dd>Preserved</dd></div><div><dt>Embedded instructions</dt><dd>Untrusted</dd></div><div><dt>Permanent deletion</dt><dd>Human approval</dd></div><div><dt>Exchange report</dt><dd>Pending evidence</dd></div></dl></div>
    </div>
    <div className="authority-strip"><div><span>AGT-005</span><strong>L2 · REVERSIBLE INTERNAL ACTIONS</strong></div><p>May classify, link, schedule reviews, correct evidence-backed metadata, and reversibly archive approved superseded records. It cannot approve material content, publish, alter access, destroy records, or treat drafts as guidance.</p><b>HUMAN CONTROL PRESERVED</b></div>
  </section>;
}

function Hero() { return <div className="knowledge-hero"><div><p className="eyebrow">AGT-005 · Knowledge Steward</p><h2>One source.<br/><em>Every truth traceable.</em></h2></div><p>Controlled knowledge across Symbiont: classified, linked, versioned, reviewable, searchable, access-aware, and anchored to its canonical evidence.</p></div>; }
function Filter({label,value,set,values,all}:{label:string;value:string;set:(value:string)=>void;values:string[];all:string}) { return <label>{label}<select value={value} onChange={(event)=>set(event.target.value)}><option value="all">{all}</option>{values.map((item)=><option key={item} value={item}>{item}</option>)}</select></label>; }
function Metric({label,value,note,tone="neutral"}:{label:string;value:string;note:string;tone?:string}) { return <article><span>{label}</span><strong className={tone}>{value}</strong><p>{note}</p></article>; }
function PanelTitle({kicker,title,suffix}:{kicker:string;title:string;suffix:string}) { return <div className="knowledge-panel-title"><div><p>{kicker}</p><h3>{title}</h3></div><span>{suffix}</span></div>; }
function Empty({text}:{text:string}) { return <div className="knowledge-empty">{text}</div>; }
function unique(values:string[]) { return [...new Set(values)].sort(); } function pad(value:number) { return String(value).padStart(2,"0"); } function slug(value:string){return value.toLowerCase();}
function date(value:string){const parsed=new Date(`${value}T12:00:00Z`);return Number.isFinite(parsed.getTime())?new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(parsed):value;}
function dateTime(value:string){const parsed=new Date(value);return Number.isFinite(parsed.getTime())?new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"}).format(parsed):value;}
