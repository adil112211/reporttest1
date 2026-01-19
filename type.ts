export type ProjectType = 'CAPEX' | 'OPEX' | 'HSE' | 'IT';
export type ProjectCategory = 'Large' | 'Medium' | 'Small';
export type ProjectStage = 'Idea' | 'Feasibility' | 'Planning' | 'Execution' | 'Commissioning' | 'Closed';
export type RiskLevel = 1 | 2 | 3; // 1=Low, 2=Med, 3=High
export type TaskStatus = 'Pending' | 'In Progress' | 'Done';

export interface ProjectComponent {
  id: string;
  name: string; // e.g., "Foundation Sector A", "Turbine Gen 1"
  type: 'Construction' | 'Equipment' | 'Design';
  progress: number; // 0-100
}

export interface ProjectTask {
  id: string;
  title: string;
  category: string; // e.g., "Engineering", "Procurement"
  status: TaskStatus;
  assignee?: string;
}

export interface Project {
  // Block: Project Passport
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  category: ProjectCategory;
  businessOwner: string;
  pm: string;
  stage: ProjectStage;

  // Block: Schedule
  startDatePlan: string;
  startDateFact: string;
  endDatePlan: string;
  endDateForecast: string;
  isCriticalPath: boolean;
  scheduleDeviationDays: number; // Calculated or Manual

  // Block: Cost (Currency in Millions)
  bac: number; // Budget at Completion
  eac: number; // Estimate at Completion
  costDeviation: number; // VAC (Variance at Completion)
  costReason: string;

  // Block: EVM & Progress
  designPercent: number; // % (Engineering/Design)
  smrPlan: number; // %
  smrFact: number; // % (Construction)
  pnrPercent: number; // % (Commissioning)
  equipmentPercent: number; // % (Procurement)
  
  // EVM Calculated Fields
  pv: number; // Planned Value
  ev: number; // Earned Value
  ac: number; // Actual Cost
  cpi: number; // Cost Performance Index
  spi: number; // Schedule Performance Index

  // Block: Risks & Constraints
  riskSchedule: RiskLevel;
  riskCost: RiskLevel;
  riskContract: RiskLevel;
  openIssuesCount: number;
  changeRequestsCount: number;

  // Block: Detailed Tracking
  components: ProjectComponent[];
  tasks: ProjectTask[];
}
