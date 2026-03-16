export interface Supplier {
  id: string;
  name: string;
  industry: string;
  description: string;
  tco2e: number;
  spend: number;
  hasTargets: boolean;
  cdp: boolean;
  category: string;
  synced: boolean;
  emissionFactor: number;
  methodology: "Organisation specific" | "Industry benchmark";
  hqCountry: string;
  website: string;
}

export interface YearData {
  year: number;
  suppliers: Supplier[];
}

const baseSuppliers: Supplier[] = [
  { id: "1", name: "Workday, Inc", industry: "Enterprise Software", description: "Cloud-based applications for finance and human resources. Workday provides enterprise-level financial management, human capital management, and analytics applications.", tco2e: 30.11, spend: 359295, hasTargets: true, cdp: true, category: "Purchased goods & services", synced: true, emissionFactor: 0.427, methodology: "Supplier specific", hqCountry: "US", website: "https://www.workday.com" },
  { id: "2", name: "Wise Systems International", industry: "Route Optimization", description: "AI-powered delivery and routing solutions for logistics. Provides last-mile delivery optimization and fleet management tools.", tco2e: 20.93, spend: 288360, hasTargets: false, cdp: false, category: "Purchased goods & services", synced: true, emissionFactor: 0.312, methodology: "Industry benchmark", hqCountry: "US", website: "https://www.wisesystems.com" },
  { id: "3", name: "TV SQUARED INC", industry: "Advertising Analytics", description: "Cross-platform TV analytics and attribution. Measures the impact of TV advertising on business outcomes across linear and streaming.", tco2e: 16.45, spend: 253915, hasTargets: false, cdp: false, category: "Purchased goods & services", synced: true, emissionFactor: 0.198, methodology: "Industry benchmark", hqCountry: "GB", website: "https://www.tvsquared.com" },
  { id: "4", name: "TransUnion (TRU)", industry: "Financial Data & Analytics", description: "Global information and insights company providing consumer credit information and risk management solutions to businesses worldwide.", tco2e: 38.81, spend: 598894, hasTargets: true, cdp: true, category: "Purchased goods & services", synced: true, emissionFactor: 0.541, methodology: "Supplier specific", hqCountry: "US", website: "https://www.transunion.com" },
  { id: "5", name: "Top Source Worldwide", industry: "Staffing & Recruitment", description: "Global workforce solutions and talent acquisition services. Specializes in IT staffing, managed services, and recruitment process outsourcing.", tco2e: 15.34, spend: 211399, hasTargets: false, cdp: false, category: "Purchased goods & services", synced: true, emissionFactor: 0.156, methodology: "Industry benchmark", hqCountry: "US", website: "https://www.topsourceworldwide.com" },
  { id: "6", name: "The Barbershop Studios", industry: "Creative Services", description: "Full-service creative agency offering brand strategy, content production, and experiential marketing for enterprise clients.", tco2e: 15.91, spend: 142775, hasTargets: false, cdp: false, category: "Purchased goods & services", synced: false, emissionFactor: 0.089, methodology: "Industry benchmark", hqCountry: "US", website: "https://www.thebarbershopstudios.com" },
  { id: "7", name: "Switch Ltd", industry: "Data Center Infrastructure", description: "Technology infrastructure company providing colocation, cloud, and connectivity solutions with a focus on sustainable data centers.", tco2e: 203.88, spend: 1620834, hasTargets: true, cdp: false, category: "Purchased goods & services", synced: true, emissionFactor: 0.782, methodology: "Supplier specific", hqCountry: "US", website: "https://www.switch.com" },
  { id: "8", name: "Snowflake Inc.", industry: "Cloud Data Platform", description: "Cloud-based data warehousing company enabling data storage, processing, and analytic solutions across multiple public clouds.", tco2e: 480.24, spend: 5730248, hasTargets: true, cdp: true, category: "Purchased goods & services", synced: true, emissionFactor: 0.634, methodology: "Supplier specific", hqCountry: "US", website: "https://www.snowflake.com" },
  { id: "9", name: "SHOWPAD INC", industry: "Sales Enablement", description: "Revenue enablement platform that empowers sales and marketing teams to engage buyers through industry-leading training and coaching software.", tco2e: 12.62, spend: 150560, hasTargets: false, cdp: false, category: "Purchased goods & services", synced: true, emissionFactor: 0.245, methodology: "Industry benchmark", hqCountry: "BE", website: "https://www.showpad.com" },
  { id: "10", name: "Semler Brossy Consulting", industry: "Compensation Consulting", description: "Independent executive compensation consulting firm advising boards and management teams on compensation strategy and governance.", tco2e: 12.94, spend: 199697, hasTargets: false, cdp: false, category: "Purchased goods & services", synced: true, emissionFactor: 0.178, methodology: "Industry benchmark", hqCountry: "US", website: "https://www.semlerbrossy.com" },
  { id: "11", name: "Scope3 PBC", industry: "Supply Chain Emissions", description: "Collaborative sustainability platform for the digital advertising industry, measuring and reducing carbon emissions from media and advertising.", tco2e: 14.3, spend: 220650, hasTargets: false, cdp: false, category: "Purchased goods & services", synced: true, emissionFactor: 0.301, methodology: "Industry benchmark", hqCountry: "US", website: "https://www.scope3.com" },
  { id: "12", name: "Salesforce.com", industry: "CRM & Cloud Computing", description: "Global leader in CRM, providing cloud-based sales, service, marketing, and commerce solutions. Committed to net-zero across its full value chain.", tco2e: 75.14, spend: 896620, hasTargets: true, cdp: true, category: "Purchased goods & services", synced: true, emissionFactor: 0.512, methodology: "Supplier specific", hqCountry: "US", website: "https://www.salesforce.com" },
  { id: "13", name: "SADA Systems Inc.", industry: "Cloud Consulting", description: "Google Cloud Premier Partner providing cloud computing, data analytics, machine learning, and enterprise application services.", tco2e: 18.38, spend: 219363, hasTargets: true, cdp: true, category: "Purchased goods & services", synced: true, emissionFactor: 0.389, methodology: "Supplier specific", hqCountry: "US", website: "https://www.sada.com" },
  { id: "14", name: "RSM US LLP", industry: "Audit & Advisory", description: "Leading provider of audit, tax, and consulting services focused on the middle market, with deep industry expertise across multiple sectors.", tco2e: 25.63, spend: 583985, hasTargets: true, cdp: false, category: "Purchased goods & services", synced: true, emissionFactor: 0.267, methodology: "Industry benchmark", hqCountry: "US", website: "https://www.rsmus.com" },
  { id: "15", name: "Redapt Inc", industry: "IT Infrastructure", description: "Technology solutions provider offering hybrid cloud, data analytics, and DevOps consulting to help enterprises modernize their IT infrastructure.", tco2e: 23.52, spend: 280701, hasTargets: false, cdp: false, category: "Purchased goods & services", synced: true, emissionFactor: 0.341, methodology: "Industry benchmark", hqCountry: "US", website: "https://www.redapt.com" },
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
