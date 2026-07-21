"use client";

import { useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { BUSINESS_AREAS, CLASSIFICATIONS, LEGACY_INTAKE, LIFECYCLE, type KnowledgeAsset, type KnowledgeData } from "@/lib/knowledge";

const DEMO_NOW = new Date("2026-07-20T23:59:59Z");
type CollectionKey = "all" | "ready" | "templates" | "exchange" | "custom";
type ArchiveFile = { name:string; path:string; file:File };
type DirectoryInputProps = InputHTMLAttributes<HTMLInputElement> & { webkitdirectory?: string; directory?: string };

export function KnowledgeControl({ data, onNavigate }: { data: KnowledgeData | null; onNavigate?:(view:"Agent Network"|"Opportunity Scout")=>void }) {
  const [area, setArea] = useState("all"); const [type, setType] = useState("all"); const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all"); const [classification, setClassification] = useState("all"); const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<CollectionKey>("all");
  const [selectedAssetId, setSelectedAssetId] = useState<string|null>(null);
  const [archiveFiles, setArchiveFiles] = useState<ArchiveFile[]>([]);
  const directoryInput = useRef<HTMLInputElement>(null);
  if (!data) return <section className="knowledge-view"><Hero /><div className="knowledge-loading">KNOWLEDGE LIBRARY · CHECKING GOVERNED SOURCE</div></section>;

  const now = data.source === "d1" ? new Date(data.asOf) : DEMO_NOW;
  const types = unique(data.assets.map((item) => item.assetType)); const owners = unique(data.assets.map((item) => item.owner));
  const visible = data.assets.filter((item) => area === "all" || item.businessArea === area).filter((item) => type === "all" || item.assetType === type).filter((item) => status === "all" || item.status === status).filter((item) => owner === "all" || item.owner === owner).filter((item) => classification === "all" || item.classification === classification).filter((item) => collection !== "ready" || isReady(item)).filter((item) => !query.trim() || [item.id, item.title, item.description, item.sourceSystem, item.businessArea, ...item.tags, ...item.synonyms].join(" ").toLowerCase().includes(query.toLowerCase().trim()));
  const ready = visible.filter(isReady); const historical = visible.filter(isHistorical); const reference = visible.filter((item) => !isReady(item) && !isHistorical(item));
  const overdue = visible.filter((item) => item.reviewDate && new Date(`${item.reviewDate}T23:59:59Z`) < now && !isHistorical(item));
  const byArea = BUSINESS_AREAS.map((name) => ({ name, count: data.assets.filter((item) => item.businessArea === name).length })).filter((item) => item.count);
  const maxArea = Math.max(1, ...byArea.map((item) => item.count));
  const selectedAsset = data.assets.find((item)=>item.id===selectedAssetId) ?? null;
  const matchingFiles = selectedAsset ? findArchiveMatches(selectedAsset, archiveFiles).slice(0,40) : [];

  function connectArchive(event:ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).map((file)=>({ name:file.name, path:(file as File & {webkitRelativePath?:string}).webkitRelativePath || file.name, file }));
    setArchiveFiles(selected);
  }
  function openFullFile(item:ArchiveFile) {
    const url=URL.createObjectURL(item.file);
    window.open(url,"_blank","noopener,noreferrer");
    window.setTimeout(()=>URL.revokeObjectURL(url),60_000);
  }

  function chooseCollection(next: CollectionKey) {
    setCollection(next); setArea("all"); setType("all"); setStatus("all"); setOwner("all"); setClassification("all"); setQuery("");
    if (next === "ready") setStatus("Active");
    if (next === "templates") setType("TPL");
    if (next === "exchange") setArea("Archive");
  }
  function chooseArea(next: string) { setArea(next); setCollection("custom"); }

  const collections = [
    { key: "all" as const, label: "All resources", note: "Browse the full visible library", count: data.assets.length },
    { key: "ready" as const, label: "Ready to use", note: "Approved sources for current work", count: data.assets.filter(isReady).length },
    { key: "templates" as const, label: "Templates", note: "Reusable forms and working aids", count: data.assets.filter((item) => item.assetType === "TPL").length },
    { key: "exchange" as const, label: "Legacy Exchange", note: "Company history and archive findings", count: data.assets.filter((item) => item.businessArea === "Archive").length },
  ];

  return <section className="knowledge-view">
    <Hero />
    <div className={`knowledge-disclosure ${data.source !== "demonstration" ? "live" : "demo"}`}><div><span className={`dot ${data.source !== "demonstration" ? "green" : "amber"}`} /><b>{data.source === "d1" ? "AUTHORIZED D1 LIBRARY" : data.source === "verified_snapshot" ? "VERIFIED KNOWLEDGE SNAPSHOT" : "DEMONSTRATION INDEX"}</b></div><p>{data.activation}</p><span>UPDATED {dateTime(data.asOf)}</span></div>

    <div className="knowledge-start"><div><p>Browse by need</p><h3>Start with a useful collection</h3></div><div className="knowledge-collections">{collections.map((item) => <button type="button" className={collection === item.key ? "active" : ""} onClick={() => chooseCollection(item.key)} key={item.key}><span>{item.label}</span><small>{item.note}</small><b>{String(item.count).padStart(2, "0")}</b></button>)}</div></div>

    <div className="knowledge-search"><label htmlFor="knowledge-query">What are you looking for?</label><input id="knowledge-query" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setCollection("custom"); }} placeholder="Try: project closeout, meeting decisions, Exchange history" /></div>
    <div className="knowledge-filters" aria-label="Knowledge filters">
      <Filter label="Topic" value={area} set={(value) => chooseArea(value)} values={[...BUSINESS_AREAS]} all="All topics" />
      <Filter label="Resource type" value={type} set={(value) => { setType(value); setCollection("custom"); }} values={types} all="All resource types" />
      <Filter label="Use status" value={status} set={(value) => { setStatus(value); setCollection("custom"); }} values={[...LIFECYCLE]} all="All use states" />
      <Filter label="Steward" value={owner} set={(value) => { setOwner(value); setCollection("custom"); }} values={owners} all="All stewards" />
      <Filter label="Access" value={classification} set={(value) => { setClassification(value); setCollection("custom"); }} values={[...CLASSIFICATIONS]} all="All visible access" />
    </div>

    <div className="knowledge-metrics human-metrics">
      <Metric label="Search results" value={pad(visible.length)} note="Resources in this view" />
      <Metric label="Ready to use" value={pad(ready.length)} note="Current approved guidance" tone="green" />
      <Metric label="Reference only" value={pad(reference.length)} note="Review before relying on it" tone="amber" />
      <Metric label="Historical" value={pad(historical.length)} note="Context, not current guidance" />
    </div>

    <div className="knowledge-grid index-grid">
      <div className="knowledge-panel"><PanelTitle kicker="Resource library" title="Find the right source" suffix={`${visible.length} result${visible.length === 1 ? "" : "s"}`} />
        <div className="knowledge-head"><span>Resource</span><span>Use</span><span>Source</span><span>Confidence</span></div>
        {visible.map((item) => <ResourceRow item={item} matchCount={findArchiveMatches(item,archiveFiles).length} onSelect={()=>setSelectedAssetId(item.id)} key={item.id} />)}
        {!visible.length && <Empty text="No resources match these filters. Clear a filter or choose All resources." />}
      </div>
      <aside className="knowledge-panel area-panel"><PanelTitle kicker="Topics" title="Browse the library" suffix="Visible resources" />{byArea.map((item) => <button type="button" className={area === item.name ? "active" : ""} onClick={() => chooseArea(item.name)} key={item.name}><span>{item.name}</span><i><em style={{width:`${Math.max(8, item.count / maxArea * 100)}%`}} /></i><b>{String(item.count).padStart(2,"0")}</b></button>)}</aside>
    </div>

    <div className="knowledge-grid context-grid">
      <div className="knowledge-panel intake-panel"><PanelTitle kicker="Legacy Exchange" title="Historical archive" suffix={archiveFiles.length ? `${archiveFiles.length.toLocaleString("en-US")} files connected` : "Local permission required"} /><div className="intake-state"><strong>{LEGACY_INTAKE.physicalFiles.toLocaleString("en-US")}</strong><span>restricted historical files indexed locally</span></div><p>Connect the preserved local archive to open full source files directly from this browser session. Files stay on this device and are never uploaded by this control.</p><input ref={directoryInput} type="file" multiple onChange={connectArchive} {...({webkitdirectory:"",directory:""} as DirectoryInputProps)} className="archive-file-input" /><button className="archive-connect" type="button" onClick={()=>directoryInput.current?.click()}>{archiveFiles.length?"Reconnect local archive":"Connect full-file archive"}</button><dl><div><dt>Unique files</dt><dd>{LEGACY_INTAKE.uniqueHashes.toLocaleString("en-US")}</dd></div><div><dt>Nested records</dt><dd>{LEGACY_INTAKE.nestedArchiveMembers.toLocaleString("en-US")}</dd></div><div><dt>Library connection</dt><dd>{archiveFiles.length?"Full-file session":"Metadata only"}</dd></div><div><dt>Upload</dt><dd>Never</dd></div><div><dt>Assessment</dt><dd>Draft v0.1</dd></div></dl></div>
      <div className="knowledge-panel use-guide"><PanelTitle kicker="Use labels" title="Know what you can rely on" suffix={`${overdue.length} overdue review${overdue.length === 1 ? "" : "s"}`} /><UseGuide tone="ready" title="Ready to use" body="Approved, active, and identified as the current source of truth." /><UseGuide tone="reference" title="Reference only" body="Useful context or a working draft. Confirm with the steward before relying on it." /><UseGuide tone="historical" title="Historical" body="Preserved for evidence and learning. Excluded from current operating guidance." /><p>Restricted records are never returned in this public view. Access follows the classification and the canonical source system.</p></div>
    </div>

    <details className="knowledge-governance"><summary><span>Governance and audit trail</span><small>{data.alerts.length} exceptions · {data.auditEvents.length} recent events</small></summary><div className="knowledge-grid governance-grid"><div className="knowledge-panel"><PanelTitle kicker="Exceptions" title="Items needing stewardship" suffix={`${data.alerts.length} signals`} />{data.alerts.map((alert) => <article className="knowledge-alert" key={alert.id}><div><span>{alert.id}</span><b className={alert.severity === "Escalate" ? "danger-text" : ""}>{alert.kind} · {alert.severity}</b></div><h4>{alert.title}</h4><p>{alert.detail}</p><small>{alert.assetIds.join(" · ")}</small></article>)}{!data.alerts.length && <Empty text="No knowledge exceptions detected." />}</div><div className="knowledge-panel"><PanelTitle kicker="Audit trail" title="Material knowledge events" suffix={`${data.auditEvents.length} recent`} />{data.auditEvents.map((event) => <article className="audit-row" key={event.id}><span>{event.id} · {event.assetId}</span><h4>{event.action}</h4><p>{event.reason}</p><small>{event.actorAgentId} · {dateTime(event.occurredAt)}</small><small>{event.correlationId}</small></article>)}</div></div><div className="authority-strip"><div><span>AGT-005</span><strong>L2 · REVERSIBLE INTERNAL ACTIONS</strong></div><p>May classify, link, schedule reviews, correct evidence-backed metadata, and reversibly archive approved superseded records. It cannot approve material content, publish, alter access, destroy records, or treat drafts as guidance.</p><b>Human approval · control preserved</b></div></details>
    {selectedAsset && <aside className="knowledge-drawer" role="dialog" aria-modal="true" aria-label={`Knowledge details for ${selectedAsset.title}`}><button type="button" className="drawer-close" onClick={()=>setSelectedAssetId(null)} aria-label="Close knowledge details">×</button><p className="eyebrow">{selectedAsset.id} · v{selectedAsset.version}</p><h3>{selectedAsset.title}</h3><p>{selectedAsset.description}</p><div className="drawer-data"><button type="button" title={selectedAsset.sourceEvidence}><span>Source evidence</span><b>{selectedAsset.sourceSystem}</b></button><button type="button" title={`Lifecycle ${selectedAsset.status}; classification ${selectedAsset.classification}`}><span>Use + access</span><b>{selectedAsset.status} · {selectedAsset.classification}</b></button><button type="button" title="Evidence-backed quality score"><span>Knowledge quality</span><b>{selectedAsset.quality.score ?? "Not scored"}</b></button><button type="button" title={selectedAsset.canonicalLocation}><span>Canonical location</span><b>{selectedAsset.canonicalLocation}</b></button></div><div className="drawer-links"><button type="button" onClick={()=>onNavigate?.("Agent Network")}>Open responsible agent</button><button type="button" onClick={()=>onNavigate?.("Opportunity Scout")}>Open matched opportunities</button>{selectedAsset.canonicalLocation.startsWith("http")&&<a href={selectedAsset.canonicalLocation} target="_blank" rel="noreferrer">Open canonical source ↗</a>}</div><div className="full-file-list"><header><div><p className="eyebrow">Permissioned local source</p><h4>Full files</h4></div><span>{matchingFiles.length} matching</span></header>{!archiveFiles.length&&<p>Connect the local archive to resolve full files for this record. No file is uploaded.</p>}{archiveFiles.length&&!matchingFiles.length&&<p>No filename match was found. Search the library with another term or review the local index.</p>}{matchingFiles.map((item)=><button type="button" onClick={()=>openFullFile(item)} title={item.path} key={item.path}><span>{item.name}</span><small>{item.path}</small><b>Open full file ↗</b></button>)}</div><p className="drawer-warning">Historical files remain untrusted evidence. Opening a file does not make it approved, current, or safe for external use.</p></aside>}
  </section>;
}

function ResourceRow({ item, matchCount, onSelect }: { item: KnowledgeAsset; matchCount:number; onSelect:()=>void }) { const use = useStateFor(item); return <button type="button" className="knowledge-row knowledge-row-button" onClick={onSelect} title={`Open ${item.id}: ${item.sourceEvidence}`}><div><p>{plainType(item.assetType)} · {item.businessArea}</p><h4>{item.title}</h4><small>{item.description}</small><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div><b className={`use-chip ${use.tone}`}>{use.label}</b><small>{use.detail}</small><small>{item.classification} access</small><small>Steward: {item.owner}</small></div><div><b>{item.sourceSystem}</b><small>{item.canonicalLocation}</small><small className={item.linkStatus === "Broken" ? "danger-text" : ""}>{item.linkStatus === "Broken" ? "Source link needs repair" : "Source trace available"}</small><small>{matchCount?`${matchCount} local file match${matchCount===1?"":"es"}`:`${item.id} · v${item.version}`}</small></div><div><strong className={item.quality.score !== null && item.quality.score < 60 ? "red" : item.quality.score !== null && item.quality.score < 80 ? "amber" : "green"}>{item.quality.score ?? "—"}</strong><small>{item.quality.score === null ? "Not yet scored" : "Evidence quality /100"}</small><div className="knowledge-score"><i style={{ width: `${item.quality.score ?? 0}%` }} /></div><small>Open details →</small></div></button>; }
function Hero() { return <div className="knowledge-hero"><div><p className="eyebrow">Symbiont knowledge library</p><h2>Find the work.<br/><em>Trust the source.</em></h2></div><p>Standards, templates, decisions, project history, and institutional knowledge organized around what people need to find and whether it is safe to use.</p></div>; }
function Filter({label,value,set,values,all}:{label:string;value:string;set:(value:string)=>void;values:string[];all:string}) { return <label>{label}<select value={value} onChange={(event)=>set(event.target.value)}><option value="all">{all}</option>{values.map((item)=><option key={item} value={item}>{item}</option>)}</select></label>; }
function Metric({label,value,note,tone="neutral"}:{label:string;value:string;note:string;tone?:string}) { return <article><span>{label}</span><strong className={tone}>{value}</strong><p>{note}</p></article>; }
function PanelTitle({kicker,title,suffix}:{kicker:string;title:string;suffix:string}) { return <div className="knowledge-panel-title"><div><p>{kicker}</p><h3>{title}</h3></div><span>{suffix}</span></div>; }
function UseGuide({tone,title,body}:{tone:string;title:string;body:string}) { return <div className="use-guide-row"><i className={tone} /><div><b>{title}</b><p>{body}</p></div></div>; }
function Empty({text}:{text:string}) { return <div className="knowledge-empty">{text}</div>; }
function isReady(item: KnowledgeAsset) { return item.status === "Active" && item.isAuthoritative && item.quality.status !== "Restricted from guidance"; }
function isHistorical(item: KnowledgeAsset) { return item.status === "Archived" || item.status === "Superseded"; }
function useStateFor(item: KnowledgeAsset) { if (isReady(item)) return { label:"Ready to use", detail:"Current source of truth", tone:"ready" }; if (isHistorical(item)) return { label:"Historical", detail:"Context, not current guidance", tone:"historical" }; return { label:"Reference only", detail:"Confirm before relying on it", tone:"reference" }; }
function plainType(value:string) { return ({POL:"Policy",SOP:"Procedure",STD:"Standard",TPL:"Template",CHK:"Checklist",FRM:"Form",RPT:"Report",DEC:"Decision",MTG:"Meeting record",DEL:"Deliverable",DAT:"Dataset",AUT:"Automation",AGT:"Agent charter",RES:"Research"} as Record<string,string>)[value] || value; }
function unique(values:string[]) { return [...new Set(values)].sort(); } function pad(value:number) { return String(value).padStart(2,"0"); }
function findArchiveMatches(item:KnowledgeAsset,files:ArchiveFile[]){const ignored=new Set(["historical","capability","current","company","services","systems","support","project","technology"]);const terms=[...item.tags,...item.synonyms,item.title].flatMap((value)=>value.toLowerCase().split(/[^a-z0-9]+/)).filter((value)=>value.length>=4&&!ignored.has(value));return files.filter((entry)=>terms.some((term)=>entry.path.toLowerCase().includes(term)));}
function dateTime(value:string){const parsed=new Date(value);return Number.isFinite(parsed.getTime())?new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"}).format(parsed):value;}
