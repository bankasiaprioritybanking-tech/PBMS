import { 
  Calendar, 
  Users, 
  Clock, 
  ChevronRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
];

export default function Appointments() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'prospective'>('schedule');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Management</h4>
          <h1 className="text-3xl font-display font-medium text-white italic">Appointment Center</h1>
          <p className="text-[#94A3B8] text-sm">Schedule and manage elite customer engagements.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'schedule' ? 'bg-[#D4AF37] text-[#0F172A]' : 'text-white/50 hover:text-white'
            }`}
          >
            Schedule
          </button>
          <button 
            onClick={() => setActiveTab('prospective')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'prospective' ? 'bg-[#D4AF37] text-[#0F172A]' : 'text-white/50 hover:text-white'
            }`}
          >
            Prospective
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'schedule' ? (
          <motion.div 
            key="schedule"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Calendar Mini View */}
            <div className="space-y-6">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">January 2026</h3>
                    <div className="flex gap-2">
                      <button className="text-white/30 hover:text-white transition-colors"><ChevronRight className="rotate-180" size={16} /></button>
                      <button className="text-white/30 hover:text-white transition-colors"><ChevronRight size={16} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                      <div key={d} className="text-[10px] font-bold text-[#D4AF37] py-2">{d}</div>
                    ))}
                    {Array.from({ length: 31 }).map((_, i) => (
                      <button 
                        key={i} 
                        className={`text-xs py-2 rounded-lg transition-all ${
                          i === 19 ? 'bg-[#D4AF37] text-[#0F172A] font-bold shadow-lg' : 'text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px]">
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-white/50">Total Today</span>
                        <span className="text-sm font-bold text-white">12</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-white/50">Confirmed</span>
                        <span className="text-sm font-bold text-[#D4AF37]">8</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Time Slots Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
               {timeSlots.map((time, i) => (
                 <div 
                  key={time}
                  className={`p-6 rounded-3xl border transition-all relative group overflow-hidden ${
                    i % 4 === 0 
                      ? 'bg-white/10 border-[#D4AF37]/30' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                 >
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                         <Clock size={16} className={i % 4 === 0 ? 'text-[#D4AF37]' : 'text-white/30'} />
                         <span className="text-sm font-bold text-white">{time}</span>
                       </div>
                       {i % 4 === 0 && (
                         <span className="px-2 py-0.5 bg-[#D4AF37] text-[#0F172A] text-[9px] font-bold rounded-md uppercase tracking-wider">Booked</span>
                       )}
                    </div>
                    
                    {i % 4 === 0 ? (
                      <div>
                        <p className="text-base font-bold text-white">Nadeem Zahid</p>
                        <p className="text-xs text-[#94A3B8] mt-1">Portfolio Review & Wealth Management</p>
                      </div>
                    ) : (
                      <button className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={14} />
                        Create Appointment
                      </button>
                    )}
                 </div>
               ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="prospective"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden"
          >
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white italic font-display">Prospective Customer Log</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input placeholder="Search leads..." className="pl-10 pr-4 py-2 bg-white/5 rounded-xl text-sm border-none outline-none text-white focus:ring-1 focus:ring-[#D4AF37]" />
                </div>
                <button className="p-2 border border-white/10 rounded-xl text-white/50 hover:text-[#D4AF37] transition-all"><Filter size={18} /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Lead Name</th>
                    <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Contact</th>
                    <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Initial Interest</th>
                    <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Status</th>
                    <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'Arif Ahmed', contact: '01712-3XXX', interest: 'Premium Card', status: 'Follow up' },
                    { name: 'Farzana Khan', contact: '01844-4XXX', interest: 'Fixed Deposit', status: 'Meeting Set' },
                    { name: 'M. Rahman', contact: '01911-5XXX', interest: 'Business Loan', status: 'New' },
                  ].map((lead, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-10 py-6">
                        <p className="text-sm font-bold text-white">{lead.name}</p>
                      </td>
                      <td className="px-10 py-6 text-sm text-[#94A3B8]">{lead.contact}</td>
                      <td className="px-10 py-6 text-sm text-white/70">{lead.interest}</td>
                      <td className="px-10 py-6">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                          lead.status === 'Follow up' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                          lead.status === 'Meeting Set' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          'bg-white/5 text-white/50 border border-white/10'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button className="text-xs font-bold text-[#D4AF37] hover:underline uppercase tracking-widest">Convert</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
