import React from 'react';

export const VisitOutcomeSection = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold">Visit Outcome</h3>
    <div className="grid grid-cols-2 gap-2 text-sm">
      {[
        'Relationship strengthened',
        'Deposit commitment received',
        'CASA growth opportunity identified',
        'Follow-up required',
        'Customer may reduce balance',
        'Visit rescheduled'
      ].map(outcome => (
        <label key={outcome} className="flex items-center gap-2">
          <input type="checkbox" className="rounded" /> {outcome}
        </label>
      ))}
    </div>
    <div className="space-y-2">
      <label className="block text-sm font-bold">Customer Remarks</label>
      <textarea className="w-full p-2 border rounded-xl" placeholder="Customer comments..." />
    </div>
    <div className="space-y-2">
      <label className="block text-sm font-bold">RM Internal Notes</label>
      <textarea className="w-full p-2 border rounded-xl" placeholder="Internal notes..." />
    </div>
  </div>
);

export const SalesOpportunitySection = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold">Sales Opportunity</h3>
    <div className="grid grid-cols-2 gap-4">
      <input type="text" placeholder="Category" className="p-2 border rounded-xl" />
      <input type="number" placeholder="Expected Value" className="p-2 border rounded-xl" />
      <select className="p-2 border rounded-xl">
        <option>Probability</option>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <input type="text" placeholder="Next Action" className="p-2 border rounded-xl" />
    </div>
  </div>
);

export const ProspectDetailsSection = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold">Prospect Details</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-bold">Follow-up Date</label>
        <input type="date" className="w-full p-2 border rounded-xl" />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-bold">Lead Priority</label>
        <select className="w-full p-2 border rounded-xl">
          <option value="">Select Priority</option>
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
        </select>
      </div>
    </div>
  </div>
);
