"use client";
import type { ClientSuccessData } from "@/lib/client-success";

export function ClientSuccessControl({data}:{data:ClientSuccessData|null}) {
  if (!data) return <section className="cs-view"><div className="cs-loading">AGT-013 · CHECKING APPROVED EVIDENCE</div></section>;
  return <section className="cs-view">
    <div className="cs-hero"><div><p className="eyebrow">AGT-013 · Client Success</p><h2>Outcomes after<br/><em>the sale.</em></h2></div><p>Onboarding, adoption, value realization, relationship risk, renewals, and governed expansion signals—linked to authoritative delivery records.</p></div>
    <div className={`cs-disclosure ${data.source === "d1" ? "live" : ""}`}><b>{data.source === "d1" ? "LIVE D1 EVIDENCE" : "DEMONSTRATION DATA"}</b><span>{data.activation}</span><i>L1 · DRAFT</i></div>
    <div className="cs-metrics"><article><span>Clients tracked</span><strong>{data.clients.length}</strong><p>Approved records only</p></article><article><span>At risk</span><strong className="amber">{data.clients.filter(c=>c.health==="Amber"||c.health==="Red").length}</strong><p>Intervention required</p></article><article><span>Reviews upcoming</span><strong>{data.clients.length}</strong><p>Next 30 days</p></article><article><span>Pending approvals</span><strong>{data.clients.filter(c=>c.communicationStatus.includes("approval")).length}</strong><p>External drafts held</p></article></div>
    <div className="cs-panel"><div className="cs-head"><span>Client + health</span><span>Onboarding / adoption</span><span>Outcomes + value</span><span>Risk + relationship</span><span>Renewal + expansion</span></div>{data.clients.map(c=><article className="cs-row" key={c.id}><div><p>{c.id} · {c.projectId}</p><h3>{c.name}</h3><b className={`cs-health ${c.health.toLowerCase()}`}>{c.health} {c.score ?? "—"}</b><small>{c.explanation}</small></div><div><b>{c.onboarding}%</b><small>Onboarding complete</small><b>{c.adoption}%</b><small>Adoption evidence</small></div><div><b>{c.outcome}%</b><small>Outcome progress</small><p>{c.value}</p></div><div><b>{c.risks} risk · {c.issues} issues</b><small>{c.satisfaction}</small><p>Review {c.nextReview}</p></div><div><b>{c.renewalDate}</b><small>{c.expansion}</small><span className="approval-chip">{c.communicationStatus}</span></div></article>)}</div>
    <div className="cs-governance"><div><b>AGT-002</b><span>Commercial qualification</span></div><i>← expansion signal</i><div><b>AGT-013</b><span>Outcome coordination</span></div><i>delivery link →</i><div><b>AGT-003</b><span>Authoritative schedule</span></div></div>
  </section>;
}
