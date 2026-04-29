export interface Customer {
  id: string;
  name: string;
  cif: string;
  branch: string;
  rm: string;
  priority: 'Normal' | 'VIP' | 'Priority';
  casaBalance: number;
  fdrBalance: number;
}

export interface Prospect {
  id: string;
  name: string;
  mobile: string;
  profession: string;
  leadSource: string;
  potentialDeposit: number;
  status: string;
}

export interface SalesOpportunity {
  category: string;
  expectedBusinessValue: number;
  expectedDepositAmount: number;
  probability: 'High' | 'Medium' | 'Low';
  interestLevel: 'Very Interested' | 'Interested' | 'Neutral' | 'Not Interested';
  objections: string;
  competitorInfo: string;
  nextAction: string;
}

export interface VisitOutcome {
  outcome: string;
}

export interface Visit {
  id: string;
  customerName: string;
  type: 'Existing' | 'New';
  date: string;
  purpose: string;
  status: 'Planned' | 'Completed' | 'Cancelled';
  branch: string;
  rm: string;
  outcome?: VisitOutcome;
  opportunity?: SalesOpportunity;
}
