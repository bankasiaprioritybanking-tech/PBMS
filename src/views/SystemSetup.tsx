import { 
  Settings, 
  Layers, 
  Sliders, 
  Watch, 
  DollarSign,
  Plus,
  Search,
  ChevronRight,
  Workflow
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const setupSections = [
  { id: 'vas', title: 'Vas Service', description: 'Configure customer service options and parameters.', icon: Layers, path: '/system-setup' },
  { id: 'param', title: 'Parameter', description: 'System-wide constants and configuration values.', icon: Sliders, path: '/system-setup' },
  { id: 'workflow', title: 'Workflow Rules', description: 'Manage automated routing and assignments for service requests.', icon: Workflow, path: '/workflow-rules' },
  { id: 'alarm', title: 'Alarm Clock Setup', description: 'Manage automated reminders and notifications.', icon: Watch, path: '/system-setup' },
  { id: 'cost', title: 'Service Cost Setup', description: 'Define pricing and resource costs for services.', icon: DollarSign, path: '/system-setup' },
];

export default function SystemSetup() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-medium text-white italic">System Setup</h1>
        <p className="text-[#94A3B8]">Configure core architecture and operational parameters of PBMS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {setupSections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(section.path)}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] group hover:bg-white/10 transition-all cursor-pointer shadow-2xl flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-[#D4AF37] rounded-2xl text-[#0F172A] shadow-lg shadow-[#D4AF37]/20">
                <section.icon size={24} />
              </div>
              <button className="p-2 border border-white/10 rounded-xl text-white/50 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/50 transition-all">
                <Plus size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{section.title}</h3>
            <p className="text-[#64748B] text-sm leading-relaxed mb-6 flex-1">{section.description}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37]">Management Interface</span>
              <ChevronRight size={18} className="text-[#64748B] group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Example Table for Parameter as per manual 4.2 */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden mt-12">
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Parameter Overview</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input placeholder="Search params..." className="pl-10 pr-4 py-2 bg-white/5 rounded-xl text-sm border-none outline-none text-white focus:ring-1 focus:ring-[#D4AF37]" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">SL</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Parameter Name</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Table Name</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { sl: '01', name: 'Age Range Group', table: 'ref_age_range_group', status: 'Active' },
                { sl: '02', name: 'Air Line', table: 'ref_air_line', status: 'Active' },
                { sl: '03', name: 'Airport Louge', table: 'ref_airport_louge', status: 'Active' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6 text-xs font-mono text-[#D4AF37]">{row.sl}</td>
                  <td className="px-8 py-6 text-sm text-white font-medium">{row.name}</td>
                  <td className="px-8 py-6 text-xs text-[#64748B] font-mono">{row.table}</td>
                  <td className="px-8 py-6">
                    <span className="px-2 py-1 bg-white/5 text-[#D4AF37] rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/10">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
