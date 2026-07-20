export type ScoutScores = {
  serviceFit: number;
  buyerFit: number;
  timing: number;
  value: number;
  evidence: number;
  access: number;
  recurrence: number;
};

const weights: Record<keyof ScoutScores, number> = {
  serviceFit: 0.25,
  buyerFit: 0.15,
  timing: 0.15,
  value: 0.10,
  evidence: 0.15,
  access: 0.10,
  recurrence: 0.10,
};

export function scoreScoutOpportunity(scores: ScoutScores) {
  for (const [name, value] of Object.entries(scores)) {
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error(`INVALID_SCOUT_SCORE:${name}`);
  }
  const total = Math.round((Object.keys(weights) as Array<keyof ScoutScores>).reduce((sum, key) => sum + scores[key] * weights[key], 0));
  const route = total >= 70 ? "sales_operations" : total >= 50 ? "watchlist" : "archive";
  return { total, route } as const;
}

export function normalizeScoutTitle(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function opportunityDedupeKey(input: { issuer:string; title:string; solicitationNumber?:string|null; canonicalUrl:string; deadlineAt?:string|null; geography:string }) {
  const url = new URL(input.canonicalUrl);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|source$|ref$)/i.test(key)) url.searchParams.delete(key);
  const parts = [input.issuer, normalizeScoutTitle(input.title), input.solicitationNumber || "", url.toString(), input.deadlineAt || "", input.geography];
  return parts.map(part => part.toLowerCase().trim()).join("|");
}
