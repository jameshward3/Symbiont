export type ScoutOpportunity = {
  id: string;
  issuer: string;
  issuerWebsite?: string | null;
  title: string;
  solicitationNumber?: string | null;
  canonicalUrl: string;
  publicationDate?: string | null;
  deadlineAt?: string | null;
  deadlineTimezone?: string | null;
  location?: string | null;
  statedValue?: number | null;
  procurementType: string;
  scope: string;
  accessRequirements?: string | null;
  fitRationale: string;
  totalScore: number;
  confidence: number;
  freshness: string;
  risks: string[];
  missingInformation: string[];
  nextAction: string;
  route: "sales_operations" | "watchlist" | "archive";
  handoffStatus: string;
  observedAt: string;
  sourceKind: string;
  isDemonstration: boolean;
};

export type MonitoringQuery = {
  id: string;
  name: string;
  queryText: string;
  sourceCategory: string;
  geography?: string | null;
  cadence: string;
  status: string;
  lastCheckedAt?: string | null;
  nextCheckAt?: string | null;
  robotsPolicy: string;
  requiresAuthentication: boolean;
};

export const demonstrationOpportunities: ScoutOpportunity[] = [
  {
    id: "DEMO-OPP-009-001",
    issuer: "Demonstration Metro Airport Authority",
    issuerWebsite: "https://example.com/airport",
    title: "Terminal reality capture and BIM record model",
    solicitationNumber: "DEMO-RFQ-26-104",
    canonicalUrl: "https://example.com/airport/demo-rfq-26-104",
    publicationDate: "2026-07-16",
    deadlineAt: "2026-08-18T14:00:00-04:00",
    deadlineTimezone: "America/New_York",
    location: "Southeastern United States",
    statedValue: 425000,
    procurementType: "RFQ",
    scope: "Existing-conditions capture, coordinated BIM, asset tagging, and turnover data for a terminal modernization program.",
    accessRequirements: "Demonstration only; a real source may require public portal registration.",
    fitRationale: "Direct match for reality capture, BIM, and structured asset-information services in a repeatable campus environment.",
    totalScore: 86,
    confidence: 92,
    freshness: "Observed 4 days ago",
    risks: ["Insurance requirements not represented in demonstration record"],
    missingInformation: ["Final procurement schedule"],
    nextAction: "AGT-002 reviews qualification assumptions after an actual verified handoff.",
    route: "sales_operations",
    handoffStatus: "Demonstration — not sent",
    observedAt: "2026-07-16T15:24:00Z",
    sourceKind: "Official procurement portal pattern",
    isDemonstration: true,
  },
  {
    id: "DEMO-OPP-009-002",
    issuer: "Demonstration State University",
    issuerWebsite: "https://example.com/university",
    title: "Campus digital twin and utilities information pilot",
    solicitationNumber: "DEMO-RFI-2026-47",
    canonicalUrl: "https://example.com/university/demo-rfi-2026-47",
    publicationDate: "2026-07-11",
    deadlineAt: "2026-09-03T16:00:00-05:00",
    deadlineTimezone: "America/Chicago",
    location: "Midwestern United States",
    statedValue: null,
    procurementType: "RFI",
    scope: "Market research for integrating campus BIM, utilities, IoT telemetry, and facilities work-order context.",
    accessRequirements: "Public download represented for demonstration purposes only.",
    fitRationale: "Strong service and buyer fit, but value and near-term procurement intent remain unconfirmed.",
    totalScore: 68,
    confidence: 78,
    freshness: "Observed 9 days ago",
    risks: ["RFI may not convert to procurement"],
    missingInformation: ["Budget", "Procurement path"],
    nextAction: "Keep on watchlist; look for an official capital-plan or solicitation update.",
    route: "watchlist",
    handoffStatus: "Watchlist — demonstration",
    observedAt: "2026-07-11T19:42:00Z",
    sourceKind: "University procurement pattern",
    isDemonstration: true,
  },
  {
    id: "DEMO-OPP-009-003",
    issuer: "Demonstration Regional Health System",
    issuerWebsite: "https://example.com/health-system",
    title: "Facilities energy dashboard market signal",
    solicitationNumber: null,
    canonicalUrl: "https://example.com/health-system/demo-capital-plan",
    publicationDate: "2026-06-28",
    deadlineAt: null,
    deadlineTimezone: null,
    location: "Northeastern United States",
    statedValue: 180000,
    procurementType: "Capital plan signal",
    scope: "A demonstration capital-plan signal for building metering consolidation and energy-performance reporting.",
    accessRequirements: "No real source access occurred.",
    fitRationale: "Relevant facilities-technology theme, but no canonical buying event or public contact is represented.",
    totalScore: 44,
    confidence: 55,
    freshness: "Observed 22 days ago",
    risks: ["No active solicitation", "No verified buying authority"],
    missingInformation: ["Procurement owner", "Deadline", "Scope details"],
    nextAction: "Archive demonstration record until a verified procurement event appears.",
    route: "archive",
    handoffStatus: "Archived — demonstration",
    observedAt: "2026-06-28T13:00:00Z",
    sourceKind: "Official capital-plan pattern",
    isDemonstration: true,
  },
];

export const demonstrationQueries: MonitoringQuery[] = [
  { id: "DEMO-QRY-001", name: "Federal building data", queryText: "BIM OR digital twin OR reality capture", sourceCategory: "SAM.gov", geography: "United States", cadence: "Daily", status: "Demonstration — inactive", robotsPolicy: "Official API/terms check required", requiresAuthentication: true },
  { id: "DEMO-QRY-002", name: "Public campuses", queryText: "renovation AND (BIM OR asset information)", sourceCategory: "Universities + healthcare", geography: "United States", cadence: "Weekdays", status: "Demonstration — inactive", robotsPolicy: "Source-by-source review required", requiresAuthentication: false },
  { id: "DEMO-QRY-003", name: "Civic reality capture", queryText: "laser scan OR reality capture OR existing conditions", sourceCategory: "Municipalities + transit", geography: "Eastern United States", cadence: "Weekdays", status: "Demonstration — inactive", robotsPolicy: "Source-by-source review required", requiresAuthentication: false },
  { id: "DEMO-QRY-004", name: "Private expansion signals", queryText: "facility expansion OR new campus OR digital twin", sourceCategory: "Official company sources", geography: "United States", cadence: "Weekly", status: "Demonstration — inactive", robotsPolicy: "Public company pages only", requiresAuthentication: false },
];

export function safeJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
