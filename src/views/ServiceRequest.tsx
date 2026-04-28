import { 
  Utensils, 
  PlaneTakeoff, 
  Users, 
  Car, 
  ShoppingBag, 
  Ticket, 
  HeartPulse, 
  Hotel, 
  Ship,
  Search,
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const vasServices = [
  { id: 'lunch', name: 'Lunch in Center', icon: Utensils, quota: 'Monthly' },
  { id: 'airport-greet', name: 'Airport Meet and Greet', icon: PlaneTakeoff, quota: 'Per Request' },
  { id: 'meeting', name: 'Meeting in Center', icon: Users, quota: 'Hourly' },
  { id: 'limo', name: 'Airport Limousines', icon: Car, quota: 'Per Trip' },
  { id: 'lifestyle', name: 'Lifestyle Services', icon: ShoppingBag, quota: 'Per Event' },
  { id: 'ticket', name: 'Travel Ticket', icon: Ticket, quota: 'Per Request' },
  { id: 'health', name: 'Health Services', icon: HeartPulse, quota: 'Annual' },
  { id: 'hotel', name: 'Travel Hotel', icon: Hotel, quota: 'Per Stay' },
  { id: 'cruise', name: 'Travel Cruise', icon: Ship, quota: 'Per Request' },
];

export default function ServiceRequest() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'queue'>('catalog');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display font-bold text-[#0F172A]">Service Request (VAS)</h1>
        <p className="text-[#64748B]">Manage value added services and customer experience workflows.</p>
      </div>

      {/* Internal Navigation */}
      <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'catalog' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Service Catalog
        </button>
        <button 
          onClick={() => setActiveTab('queue')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'queue' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Live Request Queue
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'catalog' ? (
          <motion.div 
            key="catalog"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {vasServices.map((service, i) => (
              <motion.button
                key={service.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedService(service.id)}
                className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all text-left flex flex-col group justify-between h-[220px]"
              >
                <div>
                  <div className="w-14 h-14 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#94A3B8] group-hover:bg-[#0F172A] group-hover:text-[#D4AF37] transition-all mb-6">
                    <service.icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">{service.name}</h3>
                  <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">{service.quota}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9]">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">New entry</span>
                  <div className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#D4AF37] group-hover:text-white transition-all">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="queue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-[#F1F5F9] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-bold text-[#0F172A]">Request Tracking</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                <input placeholder="Search queue..." className="pl-10 pr-4 py-2 bg-[#F8FAFC] rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-[#D4AF37]/20 w-full md:w-64" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left ">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] w-[140px]">Ref No.</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Customer</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Service</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Stage</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {[1, 2, 3, 4].map(i => (
                    <tr key={i} className="hover:bg-[#FDFCFB] transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs font-bold text-[#334155]">VAS-2026-00{i}</span>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-[#0F172A]">Customer Name {i}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <PlaneTakeoff size={14} className="text-[#94A3B8]" />
                          <span className="text-sm text-[#64748B]">Airport Meet</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-[#0F172A]">CM Approval</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">Processing</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="text-sm font-bold text-[#D4AF37] hover:underline">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry Modal Overlay (Conceptual) */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-[#F1F5F9] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0F172A] rounded-2xl text-[#D4AF37]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A]">Entry: {vasServices.find(s => s.id === selectedService)?.name}</h2>
                    <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-widest mt-1">Capture customer request details</p>
                  </div>
                </div>
                <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-[#F1F5F9] rounded-xl transition-colors">
                  <PlusCircle className="rotate-45 text-[#94A3B8]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
                    Customer Identification
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Customer CB No.</label>
                      <input placeholder="Enter CB Number" className="w-full px-6 py-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#D4AF37] outline-none transition-all text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Service Ref No.</label>
                      <input readOnly value="CBL/PBMS/LNCH/1110" className="w-full px-6 py-4 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#94A3B8] font-mono cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-[#D4AF37]/30" />
                    Request Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Request Date & Time</label>
                      <input type="datetime-local" className="w-full px-6 py-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Preferred Center</label>
                      <select className="w-full px-6 py-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm outline-none">
                        <option>Gulshan Center</option>
                        <option>Banani Center</option>
                        <option>Dhanmondi Center</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Special Requirements</label>
                      <textarea rows={3} placeholder="Dietary restrictions, preferences etc." className="w-full px-6 py-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm outline-none resize-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-end gap-4">
                <button 
                  onClick={() => setSelectedService(null)}
                  className="px-8 py-4 text-sm font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  Discard
                </button>
                <button className="px-10 py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-[#D4AF37]/10 transition-all">
                  Submit Request
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
