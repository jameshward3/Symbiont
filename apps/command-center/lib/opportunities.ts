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

export const verifiedOpportunitySnapshot: ScoutOpportunity[] = [
  {
    id: "OPP-2026-NYCOTI-85826P0003",
    issuer: "New York City Office of Technology and Innovation",
    issuerWebsite: "https://www.nyc.gov/content/oti/pages/",
    title: "Unified Communications System",
    solicitationNumber: "85826P0003",
    canonicalUrl: "https://a856-cityrecord.nyc.gov/RequestDetail/20260617041",
    publicationDate: "2026-06-25",
    deadlineAt: "2026-08-04T15:00:00-04:00",
    deadlineTimezone: "America/New_York",
    location: "New York City, NY",
    statedValue: null,
    procurementType: "RFP",
    scope: "Procurement, licensing, and implementation services—including cabling and electrical work—for Unified Communications System equipment, accessories, and network infrastructure hosted by NYC DoITT.",
    accessRequirements: "Solicitation documents are distributed through PASSPort; account access and platform terms are an owner boundary for AGT-009.",
    fitRationale: "Direct continuity with Symbiont's historical network, structured-cabling, voice, switching, implementation, and public-sector delivery evidence.",
    totalScore: 87,
    confidence: 93,
    freshness: "Official City Record notice verified July 21, 2026",
    risks: ["PASSPort account and terms boundary", "OEM or licensing authorization may be required", "Electrical scope may require a qualified delivery partner"],
    missingInformation: ["Contract value", "Complete minimum qualifications", "MWBE goals", "Prime versus subcontractor path"],
    nextAction: "AGT-002 to review prime/subcontractor fit and authorize an owner to retrieve the full PASSPort package; no contact or commitment has been made.",
    route: "sales_operations",
    handoffStatus: "Review — awaiting AGT-002 acceptance",
    observedAt: "2026-07-21T11:30:00.000Z",
    sourceKind: "Official NYC City Record notice",
    isDemonstration: false,
  },
  {
    id: "OPP-2026-NYSOGS-23311",
    issuer: "New York State Office of General Services",
    issuerWebsite: "https://ogs.ny.gov/",
    title: "Hourly Based Information Technology Services",
    solicitationNumber: "23311",
    canonicalUrl: "https://ogs.ny.gov/procurement/biddocuments/23311bid",
    publicationDate: "2026-01-30",
    deadlineAt: "2026-08-12T13:30:00-04:00",
    deadlineTimezone: "America/New_York",
    location: "New York statewide",
    statedValue: null,
    procurementType: "RFP",
    scope: "Statewide hourly information-technology services contract supported by defined job titles, skill levels, regions, qualifications, technical submission, subcontractor, and contract-use requirements.",
    accessRequirements: "Public bid documents are available; bidder qualifications, certifications, insurance, and submission requirements require authorized owner review.",
    fitRationale: "Strong match for Symbiont's historical IT consulting, technical staffing, implementation, requirements, program-management, and government-delivery evidence.",
    totalScore: 83,
    confidence: 95,
    freshness: "Official OGS bid page revised June 29 and verified July 21, 2026",
    risks: ["Mandatory minimum qualifications", "Staffing capacity and regional coverage", "Pricing and contract terms require human approval"],
    missingInformation: ["Eligible service categories", "Bidder qualification fit", "Teaming strategy", "Approved rate structure"],
    nextAction: "AGT-002 to review mandatory qualifications and determine prime, subcontractor, or no-bid path before the August 12 deadline.",
    route: "sales_operations",
    handoffStatus: "Review — awaiting AGT-002 acceptance",
    observedAt: "2026-07-21T11:35:00.000Z",
    sourceKind: "Official NYS OGS bid page",
    isDemonstration: false,
  },
  {
    id: "OPP-2026-RIOC-261379",
    issuer: "Roosevelt Island Operating Corporation",
    issuerWebsite: "https://rioc.ny.gov/",
    title: "Flood Risk Assessment",
    solicitationNumber: "26-1379",
    canonicalUrl: "https://d3olf8azjyqv1e.cloudfront.net/media/RFP%2026-1379%20Flood%20Risk%20Assessment.pdf",
    publicationDate: "2026-07-15",
    deadlineAt: "2026-08-14T15:00:00-04:00",
    deadlineTimezone: "America/New_York",
    location: "Roosevelt Island, New York, NY",
    statedValue: null,
    procurementType: "RFP",
    scope: "Flood-risk assessment with topographic, boundary, and utility survey requirements supporting resiliency planning.",
    accessRequirements: "Prime must maintain a New York office or authorization; proposal has a 30 percent M/WBE goal and professional-liability requirements.",
    fitRationale: "Strong fit for reality capture, surveying, GIS, and existing-condition documentation as a governed subconsultant pursuit.",
    totalScore: 83,
    confidence: 94,
    freshness: "Official RFP verified July 21, 2026",
    risks: ["Prime qualification and insurance requirements", "30 percent M/WBE participation goal", "Questions due July 29, 2026 at 3:00 PM ET"],
    missingInformation: ["Expected contract value", "Prime teaming strategy", "Required NY authorization confirmation"],
    nextAction: "AGT-002 to review fit and decide whether to pursue as a subconsultant; no contact or commitment has been made.",
    route: "sales_operations",
    handoffStatus: "Review — awaiting AGT-002 acceptance",
    observedAt: "2026-07-21T10:20:00.000Z",
    sourceKind: "Official issuer RFP",
    isDemonstration: false,
  },
  {
    id: "OPP-2026-NJDPP-T3163",
    issuer: "New Jersey Division of Purchase and Property",
    issuerWebsite: "https://www.nj.gov/treasury/purchase/",
    title: "Law Enforcement Equipment and Technology: Surveillance, Cameras, ALPR, UAS, Software and Services",
    solicitationNumber: "26DPP01263 / T3163",
    canonicalUrl: "https://www.nj.gov/treasury/purchase/specialnotices/NJDPP-26DPP01263-20260828-20260717_125804.pdf",
    publicationDate: "2026-07-17",
    deadlineAt: "2026-08-28T14:00:00-04:00",
    deadlineTimezone: "America/New_York",
    location: "New Jersey statewide",
    statedValue: null,
    procurementType: "RFP amendment",
    scope: "Statewide procurement covering surveillance, cameras, ALPR, unmanned aircraft systems, ancillary equipment, software, and related services; amendment 3 revises the quote-opening date.",
    accessRequirements: "Submission occurs through NJSTART; AGT-009 must not create accounts, authenticate, accept terms, or submit.",
    fitRationale: "Potential fit for security cameras, physical-security technology, UAS capture, and related consulting, but the underlying scope and participation path require qualification.",
    totalScore: 69,
    confidence: 72,
    freshness: "Official amendment verified July 21, 2026",
    risks: ["Only amendment 3 was verified in this run", "NJSTART access may require account and terms", "Underlying scope and vendor requirements need review"],
    missingInformation: ["Complete base RFP scope", "Contract value", "Vendor eligibility", "Teaming route"],
    nextAction: "Keep on watchlist; retrieve and verify the base solicitation through an authorized owner before any sales routing.",
    route: "watchlist",
    handoffStatus: "Watchlist",
    observedAt: "2026-07-21T10:20:00.000Z",
    sourceKind: "Official state procurement amendment",
    isDemonstration: false,
  },
];

export const activeMonitoringQueries: MonitoringQuery[] = [
  { id:"QRY-AGT009-NY-STATE", name:"New York state technology infrastructure", queryText:"Network cabling, fiber, switching, telephone or unified communications, access control, security cameras, IT consulting, 3D scanning, reality capture, BIM, and building-data procurements", sourceCategory:"NYS agencies, authorities, SUNY/CUNY, and official issuer sources", geography:"New York", cadence:"Weekdays 08:00 ET", status:"Active", lastCheckedAt:"2026-07-21T10:20:00.000Z", nextCheckAt:"2026-07-22T12:00:00.000Z", robotsPolicy:"Official public sources only; no account creation or terms acceptance", requiresAuthentication:false },
  { id:"QRY-AGT009-NY-LOCAL", name:"New York local technology projects", queryText:"Structured cabling, LAN or switching, voice systems, physical security, cameras, IT services, 3D scanning, BIM, and facilities-information notices", sourceCategory:"NYC, counties, municipalities, schools, transit, airports, and utilities", geography:"New York", cadence:"Weekdays 08:00 ET", status:"Active", lastCheckedAt:"2026-07-21T10:20:00.000Z", nextCheckAt:"2026-07-22T12:00:00.000Z", robotsPolicy:"Canonical issuer sources only; respect restricted-period contact rules", requiresAuthentication:false },
  { id:"QRY-AGT009-NJ-STATE", name:"New Jersey state technology infrastructure", queryText:"Network cabling, fiber, switching, telephone or VoIP, access control, surveillance cameras, ALPR, IT consulting, 3D scanning, reality capture, BIM, and facilities technology", sourceCategory:"NJ Treasury DPP, NJSTART public notices, NJDOT, NJ Transit, and official issuer sources", geography:"New Jersey", cadence:"Weekdays 08:00 ET", status:"Active", lastCheckedAt:"2026-07-21T10:20:00.000Z", nextCheckAt:"2026-07-22T12:00:00.000Z", robotsPolicy:"Stop at authentication, CAPTCHA, or click-through terms", requiresAuthentication:false },
  { id:"QRY-AGT009-NJ-LOCAL", name:"New Jersey local technology projects", queryText:"Structured cabling, network equipment, telephone, access control, CCTV, IT services, laser scanning, BIM, and asset-data notices", sourceCategory:"Counties, municipalities, schools, universities, authorities, and utilities", geography:"New Jersey", cadence:"Weekdays 08:00 ET", status:"Active", lastCheckedAt:"2026-07-21T10:20:00.000Z", nextCheckAt:"2026-07-22T12:00:00.000Z", robotsPolicy:"Official procurement and capital-plan sources only", requiresAuthentication:false },
];

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
