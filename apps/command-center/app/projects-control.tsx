"use client";

import { useMemo } from "react";
import { deliveryDataForMode, type DeliveryData } from "@/lib/delivery-control";
import { qualifiedPursuitPortfolio, type PortfolioOpportunityInput, type PortalProject } from "@/lib/workflow-portal";
import { DeliveryControl } from "./delivery-control";

export function ProjectsControl({ opportunities, workflowProjects, deliveryData, demoMode, onOpenPursuit }:{
  opportunities:PortfolioOpportunityInput[];
  workflowProjects:PortalProject[];
  deliveryData:DeliveryData|null;
  demoMode:boolean;
  onOpenPursuit:(id:string)=>void;
}) {
  const pursuits=useMemo(()=>qualifiedPursuitPortfolio(opportunities,workflowProjects,demoMode),[demoMode,opportunities,workflowProjects]);
  const delivery=useMemo(()=>deliveryDataForMode(deliveryData,demoMode),[deliveryData,demoMode]);
  const activeDelivery=delivery?.projects.length || 0;
  const actionHandoffs=pursuits.filter(item=>item.inActionQueue).length;
  const reviewRequired=pursuits.filter(item=>/review|required|conditional/i.test(`${item.recommendation} ${item.bidDecision}`)).length;

  return <section className="projects-control-view">
    <div className="projects-hero"><div><p className="eyebrow">Qualification → delivery</p><h2>Pursuits become projects<br/><em>only through governed gates.</em></h2></div><p>Projects now starts at qualification, keeps the bid estimate visible, and carries approved work into delivery. Decisions and approvals are completed in Actions.</p></div>
    <div className={`projects-mode ${demoMode?"demo":"live"}`}><b>{demoMode?"DEMONSTRATION PORTFOLIO":"LIVE GOVERNED PORTFOLIO"}</b><span>{demoMode?"Illustrative pursuits and delivery records are visible only while Demo mode is on.":"Only non-demonstration pursuits at Qualification or later and authorized delivery projects are shown."}</span></div>
    <div className="projects-metrics">
      <ProjectMetric label="Qualified pursuits" value={pursuits.length} note="Qualification through agreement" />
      <ProjectMetric label="In Actions" value={actionHandoffs} note="Governed workflow handoffs" />
      <ProjectMetric label="Decision review" value={reviewRequired} note="Bid or price review required" />
      <ProjectMetric label="Active delivery" value={activeDelivery} note="Authorized project records" />
    </div>
    <section className="pursuit-portfolio">
      <header><div><p className="eyebrow">Pre-award portfolio</p><h3>Qualified pursuits</h3></div><span>{pursuits.length} visible</span></header>
      <div className="pursuit-head"><span>Pursuit</span><span>Stage / owner</span><span>ROM estimate</span><span>Recommendation</span><span>Next action</span></div>
      {pursuits.map(item=><article className="pursuit-row" key={item.id}>
        <div><small>{item.id}</small><strong>{item.title}</strong><span>{item.client} · {item.source}</span></div>
        <div><b>{item.stage}</b><span>{item.owner} · {item.confidence}% evidence confidence</span></div>
        <div><strong>{formatMoney(item.estimate)}</strong><span>{item.estimateConfidence}% ROM confidence</span></div>
        <div><b>{item.bidDecision}</b><span>{item.recommendation}</span></div>
        <div><p>{item.nextAction}</p><small>{item.dueDate?`Due ${formatDate(item.dueDate)}`:"Date required"}</small><button type="button" onClick={()=>onOpenPursuit(item.id)}>{item.inActionQueue?"Open in Actions":"Start governed response"} →</button></div>
      </article>)}
      {!pursuits.length&&<div className="projects-empty"><strong>No qualified pursuits in this mode.</strong><span>Pipeline records appear here after they reach Qualification. Demonstration records remain hidden while Live governed data is active.</span></div>}
    </section>
    <div className="delivery-section-lead"><div><p className="eyebrow">Post-award portfolio</p><h3>Authorized delivery projects</h3></div><span>Contract and project-authorization gates required</span></div>
    <DeliveryControl data={delivery} demoMode={demoMode} embedded />
  </section>;
}

function ProjectMetric({label,value,note}:{label:string;value:number;note:string}) { return <article><span>{label}</span><strong>{String(value).padStart(2,"0")}</strong><small>{note}</small></article>; }
function formatMoney(value:number){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value);}
function formatDate(value:string){const date=new Date(`${value}T12:00:00Z`);return Number.isFinite(date.getTime())?new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(date):value;}
