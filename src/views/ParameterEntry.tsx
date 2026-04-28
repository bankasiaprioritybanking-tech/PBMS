import { 
  ListTodo, 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  Filter,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { motion } from 'motion/react';

const parameters = [
  { id: 1, name: 'Customer Type', description: 'Priority, Elite, Royal', status: 'Active' },
  { id: 2, name: 'Center Location', description: 'Gulshan, Banani, Dhanmondi', status: 'Active' },
  { id: 3, name: 'Service Priority', description: 'High, Medium, Low', status: 'Active' },
  { id: 4, name: 'Blood Group', description: 'A+, B+, O+, AB+', status: 'Active' },
  { id: 5, name: 'District', description: 'Dhaka, Chittagong, Sylhet', status: 'Inactive' },
];

export default function ParameterEntry() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Reference Data</h4>
          <h1 className="text-3xl font-display font-medium text-white italic">Parameter Entry</h1>
          <p className="text-[#94A3B8] text-sm">Manage system-wide reference data and dropdown values.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-[#0F172A] px-6 py-3 rounded-2xl font-bold hover:shadow-xl transition-all shadow-[#D4AF37]/10">
          <Plus size={20} />
          Create New Parameter
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input placeholder="Filter parameters..." className="pl-10 pr-4 py-2 bg-white/5 rounded-xl text-sm border-none outline-none text-white focus:ring-1 focus:ring-[#D4AF37] w-64" />
             </div>
             <button className="p-2 border border-white/10 rounded-xl text-white/50 hover:text-[#D4AF37] transition-all"><Filter size={18} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">ID</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Parameter Name</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Values / Description</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {parameters.map((param) => (
                <tr key={param.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6 text-xs font-mono text-[#64748B]">#{param.id.toString().padStart(3, '0')}</td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-bold text-white">{param.name}</p>
                  </td>
                  <td className="px-10 py-6 text-sm text-[#94A3B8]">{param.description}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${param.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                       <span className={`text-[10px] font-bold uppercase tracking-wider ${param.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>
                         {param.status}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-[#D4AF37] transition-all"><Edit3 size={16} /></button>
                      <button className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                      <button className="p-2 hover:bg-white/5 rounded-lg text-white/30"><MoreVertical size={16} /></button>
                    </div>
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
