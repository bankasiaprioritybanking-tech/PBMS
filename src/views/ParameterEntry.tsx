import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  Filter,
  MoreVertical,
  X,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const initialParameters = [
  { id: 1, name: 'Customer Type', description: 'Priority, Elite, Royal', status: 'Active', type: 'generic' },
  { id: 2, name: 'Center Location', description: 'Gulshan, Banani, Dhanmondi', status: 'Active', type: 'generic' },
  { id: 3, name: 'Service Priority', description: 'High, Medium, Low', status: 'Active', type: 'generic' },
  { id: 4, name: 'Blood Group', description: 'A+, B+, O+, AB+', status: 'Active', type: 'generic' },
  { id: 5, name: 'District', description: 'Dhaka, Chittagong, Sylhet', status: 'Inactive', type: 'generic' },
  { id: 6, name: 'Meet and Greet Service', description: 'Vendor, pricing, capacity and limits', status: 'Active', type: 'meet_and_greet_config' },
];

export default function ParameterEntry() {
  const [parameters] = useState(initialParameters);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<any>(null);
  
  // Specific config state for Meet and Greet
  const [mgConfig, setMgConfig] = useState({
    defaultVendor: 'Premium Airport Services Ltd',
    basePrice: 5000,
    serviceSlots: 10,
    slotType: 'trip',
    customerLimit: 2
  });

  const handleEdit = (param: any) => {
    setEditingParam(param);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    setIsEditModalOpen(false);
    setEditingParam(null);
    // In a real app, save to backend here
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Reference Data</h4>
          <h1 className="text-3xl font-display font-medium text-white italic">Parameter Entry</h1>
          <p className="text-[#94A3B8] text-sm">Manage system-wide reference data and service configurations.</p>
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
                    {param.type === 'meet_and_greet_config' && (
                      <p className="text-xs text-[#D4AF37] font-mono mt-1">Configurable limits & vendors</p>
                    )}
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
                      <button onClick={() => handleEdit(param)} className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-[#D4AF37] transition-all"><Edit3 size={16} /></button>
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

      <AnimatePresence>
        {isEditModalOpen && editingParam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative bg-[#0F172A] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Edit Parameter</h3>
                  <p className="text-sm text-[#94A3B8]">{editingParam.name}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8">
                {editingParam.type === 'meet_and_greet_config' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2 col-span-2">
                        <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">Default Vendor</label>
                        <select 
                          value={mgConfig.defaultVendor}
                          onChange={(e) => setMgConfig({...mgConfig, defaultVendor: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] outline-none"
                        >
                          <option value="Premium Airport Services Ltd">Premium Airport Services Ltd</option>
                          <option value="Sky Lounge Corp">Sky Lounge Corp</option>
                          <option value="Global Greet">Global Greet</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">Base Price (BDT)</label>
                        <input 
                          type="number" 
                          value={mgConfig.basePrice}
                          onChange={(e) => setMgConfig({...mgConfig, basePrice: Number(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">Capacity Period</label>
                        <select 
                          value={mgConfig.slotType}
                          onChange={(e) => setMgConfig({...mgConfig, slotType: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] outline-none"
                        >
                          <option value="daily">Per Day</option>
                          <option value="hourly">Per Hour</option>
                          <option value="trip">Per Trip</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">No of Trips ({mgConfig.slotType === 'daily' ? 'Per Day' : mgConfig.slotType === 'hourly' ? 'Per Hour' : 'Per Trip'})</label>
                        <input 
                          type="number" 
                          value={mgConfig.serviceSlots}
                          onChange={(e) => setMgConfig({...mgConfig, serviceSlots: Number(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">Customer Limit (Per Year)</label>
                        <input 
                          type="number" 
                          value={mgConfig.customerLimit}
                          onChange={(e) => setMgConfig({...mgConfig, customerLimit: Number(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-[#64748B]">
                    <p>Standard dropdown configuration interface</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-white/10 bg-black/20 flex justify-end gap-4">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-3 rounded-xl font-bold bg-[#D4AF37] text-[#0F172A] hover:bg-[#FDE047] transition-colors flex items-center gap-2 text-sm"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
