"use client";
import {useMemo,useState} from "react";
import type {ResearchData} from "@/lib/research";

export function ResearchControl({data,onNavigate}:{data:ResearchData|null;onNavigate:(view:"Knowledge"|"Opportunity Scout")=>void}){
  const [topic,setTopic]=useState("all");
  const visible=useMemo(()=>data?.requests.filter(item=>topic==="all"||item.topic===topic)??[],[data,topic]);
  if(!data)return <section className="research-view"><div className="scout-loading">AGT-007 · CHECKING RESEARCH REGISTRY</div></section>;
  const topics=[...new Set(data.requests.map(item=>item.topic))];
  return <section className="research-view">
    <div className="research-hero"><div><p className="eyebrow">AGT-007 · Research</p><h2>Evidence before <em>opinion.</em></h2></div><p>Research turns historical project evidence, current market signals, and company prerogatives into decision-ready findings. Sources remain traceable and external claims remain human-approved.</p></div>
    <div className={`research-disclosure ${data.source}`}><b>{data.source==="demonstration"?"DEMO MODE":"VERIFIED SNAPSHOT"}</b><span>{data.activation}</span></div>
    <div className="research-metrics">
      <button type="button" title="Show all governed research findings" onClick={()=>setTopic("all")}><span>Findings</span><strong>{String(data.requests.length).padStart(2,"0")}</strong></button>
      <button type="button" title="Open the historical knowledge library" onClick={()=>onNavigate("Knowledge")}><span>Historical evidence</span><strong>06</strong></button>
      <button type="button" title="Open opportunity matches using these findings" onClick={()=>onNavigate("Opportunity Scout")}><span>Priority service lanes</span><strong>08</strong></button>
      <button type="button" title="All research remains within L1 draft authority"><span>Authority</span><strong>L1</strong></button>
    </div>
    <label className="research-filter">Topic<select value={topic} onChange={event=>setTopic(event.target.value)}><option value="all">All topics</option>{topics.map(item=><option key={item}>{item}</option>)}</select></label>
    <div className="research-layout"><div className="research-list">{visible.map(item=><article className="research-row" key={item.id} title={`${item.claimType} · ${item.confidence} confidence · observed ${item.observedAt}`}><button type="button" onClick={()=>onNavigate("Knowledge")}><span>{item.id} · {item.topic}</span><h3>{item.title}</h3><p>{item.summary}</p><small>Open supporting knowledge →</small></button><div><b className={item.confidence.toLowerCase()}>{item.confidence}</b><span>{item.claimType}</span><span>{item.sourceType}</span><span>{item.status}</span></div><ul>{item.evidence.map(evidence=><li key={evidence}>{evidence}</li>)}</ul></article>)}</div><aside className="research-watch"><section><h3>Market focus</h3>{data.trends.map(item=><button type="button" title="Open matching opportunities" onClick={()=>onNavigate("Opportunity Scout")} key={item}>{item} →</button>)}</section><section><h3>Technology lanes</h3>{data.technologies.map(item=><button type="button" title="Open supporting historical knowledge" onClick={()=>onNavigate("Knowledge")} key={item}>{item} →</button>)}</section></aside></div>
  </section>;
}
