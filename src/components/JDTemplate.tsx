import React from 'react';

const JDTemplate: React.FC<{ jobTitle: string }> = ({ jobTitle }) => {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm space-y-8 max-w-4xl mx-auto">
      <div className="border-b border-[#F1F5F9] pb-6">
        <h2 className="text-3xl font-bold text-[#0F172A]">{jobTitle}</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {[
          { label: "Line Manager's Title", value: "" },
          { label: "Division/Function", value: "" },
          { label: "Department", value: "" },
          { label: "Job Location", value: "" },
          { label: "Date", value: "" },
        ].map((field) => (
          <div key={field.label} className="space-y-1">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">{field.label}</label>
            <div className="h-10 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]"></div>
          </div>
        ))}
      </div>

      <Section title="Job Purpose">
        <textarea className="w-full h-24 p-4 border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]" placeholder="Enter job purpose..." />
      </Section>

      <Section title="Head Count Supervised">
        <div className="grid grid-cols-2 gap-6">
            <div><label className="text-[10px] font-bold text-[#64748B]">Direct:</label><input type="number" className="w-full ml-2 border-b border-[#E2E8F0] p-1" /></div>
            <div><label className="text-[10px] font-bold text-[#64748B]">Indirect:</label><input type="number" className="w-full ml-2 border-b border-[#E2E8F0] p-1" /></div>
        </div>
      </Section>

      <Section title="Key Responsibilities & Accountabilities">
        <textarea className="w-full h-48 p-4 border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]" placeholder="Enter responsibilities..." />
      </Section>

      <Section title="Key Stakeholders">
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-xs font-bold text-[#64748B]">Internal</label><textarea className="w-full h-20 p-2 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]" /></div>
            <div className="space-y-2"><label className="text-xs font-bold text-[#64748B]">External</label><textarea className="w-full h-20 p-2 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]" /></div>
        </div>
      </Section>

      <Section title="Job Requirements">
        <textarea className="w-full h-32 p-4 border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]" placeholder="Enter requirements & skills..." />
        <div className="mt-4"><label className="text-xs font-bold text-[#64748B]">Minimum Education required</label><input type="text" className="w-full border-b border-[#E2E8F0] p-2 mt-1" /></div>
      </Section>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#F1F5F9] pb-2">{title}</h3>
    {children}
  </div>
);

export default JDTemplate;
