import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  BriefcaseBusiness,
  FileText,
  Search,
  PlusCircle,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const stats = [
  { label: 'Today’s Visits', value: '5', icon: Calendar, color: 'text-[#D4AF37]' },
  { label: 'Visits This Month', value: '42', icon: BriefcaseBusiness, color: 'text-blue-600' },
  { label: 'Completed', value: '38', icon: CheckCircle2, color: 'text-emerald-600' },
  { label: 'Deposit Mobilized', value: 'BDT 5Cr', icon: TrendingUp, color: 'text-purple-600' },
];

export default function RMVisitDashboard() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-[#0F172A]">RM Visit Dashboard</h1>
           <p className="text-[#64748B]">Manage your customer visits and sales activities</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 bg-[#D4AF37] text-[#0F172A] px-6 py-3 rounded-full font-bold text-sm hover:bg-[#C5A02E]">
             <PlusCircle size={18} /> New Visit
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm"
          >
             <div className="flex items-center justify-between mb-4">
                <stat.icon className={stat.color} size={24} />
                <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Summary</span>
             </div>
             <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
             <h3 className="text-2xl font-bold text-[#0F172A]">{stat.value}</h3>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm">
        <h3 className="text-lg font-bold text-[#0F172A] mb-4">Visit Activity Overview</h3>
        <p className="text-sm text-[#64748B]">CRM data visualization will be implemented here for visit trends and pipeline analysis.</p>
      </div>
    </div>
  );
}
