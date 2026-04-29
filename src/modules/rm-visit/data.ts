import { Customer, Prospect, Visit } from './types';

export const sampleCustomers: Customer[] = [
  { id: 'C1', name: 'John Doe', cif: '12345', branch: 'Gulshan', rm: 'Sabiha', priority: 'VIP', casaBalance: 500000, fdrBalance: 1000000 },
  { id: 'C2', name: 'Jane Smith', cif: '67890', branch: 'Banani', rm: 'Sultana', priority: 'Priority', casaBalance: 200000, fdrBalance: 500000 },
];

export const sampleProspects: Prospect[] = [
  { id: 'P1', name: 'Alice Jones', mobile: '01711000000', profession: 'Doctor', leadSource: 'Referral', potentialDeposit: 2000000, status: 'Lead Created' },
];

export const sampleVisits: Visit[] = [
  { id: 'V1', customerName: 'John Doe', type: 'Existing', date: '2026-05-01', purpose: 'Deposit Growth', status: 'Planned', branch: 'Gulshan', rm: 'Sabiha' },
  { id: 'V2', customerName: 'Alice Jones', type: 'New', date: '2026-05-03', purpose: 'New CASA', status: 'Completed', branch: 'Banani', rm: 'Sultana' },
];
