export type TargetStatus = "sbti-validated" | "sbti-committed" | "sbti-inherited" | "self-published" | "no-targets";

export interface Supplier {
  id: string;
  name: string;
  industry: string;
  description: string;
  tco2e: number;
  spend: number;
  targetStatus: TargetStatus;
  cdp: boolean;
  category: string;
  synced: "synced" | "warning" | "not-synced";
  emissionFactor: number;
  methodology: "Organisation specific" | "Industry benchmark" | "Input by User";
  calculationMethodology: "spend" | "tco2e" | "activity";
  activityData?: { factorId: string; quantity: number }[];
  hqCountry: string;
  website: string;
  sbtAligned: boolean;
  inheritedFrom?: string;
  influence?: number; // 1-5 scale: how much influence you have over this supplier
}

export function deriveSbtAligned(targetStatus: TargetStatus): { value: boolean; locked: boolean } {
  if (targetStatus === "sbti-validated" || targetStatus === "sbti-inherited") return { value: true, locked: true };
  if (targetStatus === "sbti-committed" || targetStatus === "no-targets") return { value: false, locked: true };
  return { value: false, locked: false }; // self-published: editable, default no
}

export interface YearData {
  year: number;
  suppliers: Supplier[];
}

const baseSuppliers: Supplier[] = [
  { id: "1", name: "Workday, Inc", industry: "Enterprise Software", description: "Cloud-based applications for finance and human resources. Workday provides enterprise-level financial management, human capital management, and analytics applications.", tco2e: 30.11, spend: 359295, targetStatus: "sbti-validated", cdp: true, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.427, methodology: "Organisation specific", calculationMethodology: "spend", hqCountry: "US", website: "https://www.workday.com", sbtAligned: true },
  { id: "2", name: "Wise Systems International", industry: "Route Optimization", description: "AI-powered delivery and routing solutions for logistics. Provides last-mile delivery optimization and fleet management tools.", tco2e: 20.93, spend: 288360, targetStatus: "no-targets", cdp: false, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.312, methodology: "Industry benchmark", calculationMethodology: "spend", hqCountry: "US", website: "https://www.wisesystems.com", sbtAligned: false },
  { id: "3", name: "TV SQUARED INC", industry: "Advertising Analytics", description: "Cross-platform TV analytics and attribution. Measures the impact of TV advertising on business outcomes across linear and streaming.", tco2e: 16.45, spend: 253915, targetStatus: "self-published", cdp: false, category: "Purchased goods & services", synced: "warning", emissionFactor: 0.198, methodology: "Industry benchmark", calculationMethodology: "spend", hqCountry: "GB", website: "https://www.tvsquared.com", sbtAligned: false },
  { id: "4", name: "TransUnion (TRU)", industry: "Financial Data & Analytics", description: "Global information and insights company providing consumer credit information and risk management solutions to businesses worldwide.", tco2e: 38.81, spend: 598894, targetStatus: "sbti-validated", cdp: true, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.541, methodology: "Organisation specific", calculationMethodology: "spend", hqCountry: "US", website: "https://www.transunion.com", sbtAligned: true },
  { id: "5", name: "Top Source Worldwide", industry: "Staffing & Recruitment", description: "Global workforce solutions and talent acquisition services. Specializes in IT staffing, managed services, and recruitment process outsourcing.", tco2e: 15.34, spend: 211399, targetStatus: "sbti-inherited", cdp: false, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.156, methodology: "Industry benchmark", calculationMethodology: "spend", hqCountry: "US", website: "https://www.topsourceworldwide.com", sbtAligned: true, inheritedFrom: "Allegis Group, Inc." },
  { id: "6", name: "The Barbershop Studios", industry: "Creative Services", description: "Full-service creative agency offering brand strategy, content production, and experiential marketing for enterprise clients.", tco2e: 15.91, spend: 142775, targetStatus: "no-targets", cdp: false, category: "Purchased goods & services", synced: "not-synced", emissionFactor: 0.089, methodology: "Industry benchmark", calculationMethodology: "spend", hqCountry: "US", website: "https://www.thebarbershopstudios.com", sbtAligned: false },
  { id: "7", name: "Switch Ltd", industry: "Data Center Infrastructure", description: "Technology infrastructure company providing colocation, cloud, and connectivity solutions with a focus on sustainable data centers.", tco2e: 203.88, spend: 1620834, targetStatus: "sbti-committed", cdp: false, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.782, methodology: "Organisation specific", calculationMethodology: "spend", hqCountry: "US", website: "https://www.switch.com", sbtAligned: false },
  { id: "8", name: "Snowflake Inc.", industry: "Cloud Data Platform", description: "Cloud-based data warehousing company enabling data storage, processing, and analytic solutions across multiple public clouds.", tco2e: 480.24, spend: 5730248, targetStatus: "sbti-validated", cdp: true, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.634, methodology: "Organisation specific", calculationMethodology: "spend", hqCountry: "US", website: "https://www.snowflake.com", sbtAligned: true },
  { id: "9", name: "SHOWPAD INC", industry: "Sales Enablement", description: "Revenue enablement platform that empowers sales and marketing teams to engage buyers through industry-leading training and coaching software.", tco2e: 12.62, spend: 150560, targetStatus: "no-targets", cdp: false, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.245, methodology: "Industry benchmark", calculationMethodology: "spend", hqCountry: "BE", website: "https://www.showpad.com", sbtAligned: false },
  { id: "10", name: "Semler Brossy Consulting", industry: "Compensation Consulting", description: "Independent executive compensation consulting firm advising boards and management teams on compensation strategy and governance.", tco2e: 12.94, spend: 199697, targetStatus: "self-published", cdp: false, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.178, methodology: "Industry benchmark", calculationMethodology: "spend", hqCountry: "US", website: "https://www.semlerbrossy.com", sbtAligned: false },
  { id: "11", name: "Scope3 PBC", industry: "Supply Chain Emissions", description: "Collaborative sustainability platform for the digital advertising industry, measuring and reducing carbon emissions from media and advertising.", tco2e: 14.3, spend: 220650, targetStatus: "sbti-committed", cdp: false, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.301, methodology: "Industry benchmark", calculationMethodology: "spend", hqCountry: "US", website: "https://www.scope3.com", sbtAligned: false },
  { id: "12", name: "Salesforce.com", industry: "CRM & Cloud Computing", description: "Global leader in CRM, providing cloud-based sales, service, marketing, and commerce solutions. Committed to net-zero across its full value chain.", tco2e: 75.14, spend: 896620, targetStatus: "sbti-validated", cdp: true, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.512, methodology: "Organisation specific", calculationMethodology: "spend", hqCountry: "US", website: "https://www.salesforce.com", sbtAligned: true },
  { id: "13", name: "SADA Systems Inc.", industry: "Cloud Consulting", description: "Google Cloud Premier Partner providing cloud computing, data analytics, machine learning, and enterprise application services.", tco2e: 18.38, spend: 219363, targetStatus: "sbti-validated", cdp: true, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.389, methodology: "Organisation specific", calculationMethodology: "spend", hqCountry: "US", website: "https://www.sada.com", sbtAligned: true },
  { id: "14", name: "RSM US LLP", industry: "Audit & Advisory", description: "Leading provider of audit, tax, and consulting services focused on the middle market, with deep industry expertise across multiple sectors.", tco2e: 25.63, spend: 583985, targetStatus: "sbti-inherited", cdp: false, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.267, methodology: "Industry benchmark", calculationMethodology: "spend", hqCountry: "US", website: "https://www.rsmus.com", sbtAligned: true, inheritedFrom: "RSM International Ltd." },
  { id: "15", name: "Redapt Inc", industry: "IT Infrastructure", description: "Technology solutions provider offering hybrid cloud, data analytics, and DevOps consulting to help enterprises modernize their IT infrastructure.", tco2e: 23.52, spend: 280701, targetStatus: "no-targets", cdp: false, category: "Purchased goods & services", synced: "synced", emissionFactor: 0.341, methodology: "Industry benchmark", calculationMethodology: "spend", hqCountry: "US", website: "https://www.redapt.com", sbtAligned: false },
];

export const initialYearData: YearData[] = [
  { year: 2024, suppliers: baseSuppliers },
  {
    year: 2025,
    suppliers: baseSuppliers.map((s) => ({
      ...s,
      tco2e: +(s.tco2e * (0.85 + Math.random() * 0.3)).toFixed(2),
      spend: Math.round(s.spend * (0.9 + Math.random() * 0.2)),
    })),
  },
];

export function getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/20x15/${countryCode.toLowerCase()}.png`;
}
