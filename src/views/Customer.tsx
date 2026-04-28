import { 
  User, 
  Building2, 
  Users, 
  PhoneCall, 
  Star, 
  FileSearch, 
  Coffee, 
  MoreHorizontal,
  Save,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const tabs = [
  { id: 'personal', label: 'Personal Information', icon: User },
  { id: 'banking', label: 'Banking Information', icon: Building2 },
  { id: 'family', label: 'Family Information', icon: Users },
  { id: 'contact', label: 'Contact Information', icon: PhoneCall },
  { id: 'interest', label: 'Interest Information', icon: Star },
  { id: 'docs', label: 'Scanned Documents', icon: FileSearch },
  { id: 'llc', label: 'LLC (Lifestyle)', icon: Coffee },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
];

export default function Customer() {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-bold text-[#0F172A]">Customer Profile</h1>
          <p className="text-[#64748B]">Comprehensive management of priority customer data and relationship insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white border border-[#E2E8F0] text-[#64748B] rounded-2xl font-bold flex items-center gap-2 hover:bg-[#F8FAFC] transition-all">
            <Trash2 size={18} />
            Discard
          </button>
          <button className="px-8 py-3 bg-[#0F172A] text-[#D4AF37] rounded-2xl font-bold flex items-center gap-2 hover:shadow-xl hover:shadow-[#0F172A]/10 transition-all">
            <Save size={18} />
            Save Profile
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-[#0F172A] p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] rounded-full blur-[100px] opacity-10" />
        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 relative z-10">
          <User size={48} className="text-[#D4AF37]" />
        </div>
        <div className="flex-1 text-center md:text-left relative z-10">
          <h2 className="text-2xl font-bold mb-1">New Customer Entry</h2>
          <p className="text-[#94A3B8] text-sm mb-4">Complete all required fields below to register a priority member.</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span className="px-3 py-1 bg-white/10 rounded-lg text-[11px] font-bold uppercase tracking-widest border border-white/5">Status: Draft</span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-[11px] font-bold uppercase tracking-widest border border-white/5">Created by: John Doe (Admin)</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-[#0F172A] shadow-lg shadow-[#0F172A]/5 border border-[#E2E8F0]' 
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-[#D4AF37]' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[40px] border border-[#E2E8F0] shadow-sm p-10 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="pb-6 border-b border-[#F1F5F9]">
              <h3 className="text-xl font-bold text-[#0F172A]">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-sm text-[#64748B] mt-1">Please provide accurate information as per Finacle & Tranzware records.</p>
            </div>

            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Customer CB No. <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input placeholder="Search CB..." className="flex-1 px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#D4AF37] transition-all text-sm" />
                    <button className="px-4 py-2 bg-[#0F172A] text-white rounded-xl font-bold text-xs">Load</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Customer Name <span className="text-red-500">*</span></label>
                  <input placeholder="Full Name" className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#D4AF37] transition-all text-sm font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Nationality</label>
                  <select className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none text-sm">
                    <option>Bangladeshi</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Blood Group</label>
                  <select className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none text-sm">
                    <option>Select</option>
                    <option>A+</option>
                    <option>B+</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Date of Birth</label>
                  <input type="date" className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase ml-1">Relationship Manager</label>
                  <input readOnly value="Auto-assigned" className="w-full px-5 py-3.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl outline-none text-sm text-[#94A3B8] cursor-not-allowed" />
                </div>
              </div>
            )}

            {activeTab !== 'personal' && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center text-[#E2E8F0]">
                  <Plus size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-[#0F172A]">No {tabs.find(t => t.id === activeTab)?.label} Found</h4>
                  <p className="text-sm text-[#64748B] max-w-xs mx-auto mt-2">Start by adding entries to complete this customer's profile record.</p>
                </div>
                <button className="px-6 py-2.5 bg-[#0F172A] text-[#D4AF37] rounded-xl font-bold text-sm">Add Entry</button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
