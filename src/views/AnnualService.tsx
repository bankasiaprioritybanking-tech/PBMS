import { 
  Gift, 
  PartyPopper, 
  Wine, 
  Palmtree,
  Calendar,
  Search,
  Filter,
  Plus,
  ChevronRight,
  User,
  MoreHorizontal,
  Bell,
  X,
  Check,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

const serviceTypes = [
  { id: 'birthday', label: 'Birth Day', icon: PartyPopper, color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'anniversary', label: 'Anniversary', icon: Gift, color: 'from-amber-500/20 to-orange-500/20' },
  { id: 'dinner', label: 'Dinner Coupon', icon: Wine, color: 'from-purple-500/20 to-indigo-500/20' },
  { id: 'lifestyle', label: 'Life Style', icon: Palmtree, color: 'from-emerald-500/20 to-teal-500/20' },
];

export default function AnnualService() {
  const [activeTab, setActiveTab] = useState('birthday');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenReminderModal = (member: any) => {
    setSelectedMember(member);
    setIsReminderModalOpen(true);
    setReminderDate('');
    setReminderMessage(`Congratulate ${member.name} on their upcoming birthday.`);
  };

  const handleSetReminder = async () => {
    if (!reminderDate || !reminderMessage) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'birthdayReminders'), {
        customerId: selectedMember.id,
        customerName: selectedMember.name,
        reminderDate,
        message: reminderMessage,
        status: 'pending',
        createdById: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      });
      
      setIsReminderModalOpen(false);
      alert('Reminder set successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'birthdayReminders');
    } finally {
      setIsSubmitting(false);
    }
  };

  const eliteMembers = [1, 2, 3, 4, 5].map(i => ({
    id: `CB-00${1000 + i}`,
    name: `Elite Member ${i}`,
    contact: '017XX-XXXXXX',
    date: `2${i} January`,
    daysIn: `In ${i+1} days`
  }));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Customer Care</h4>
        <h1 className="text-3xl font-display font-medium text-white italic">Annual Service Manager</h1>
        <p className="text-[#94A3B8]">Track and manage special occasions for elite members.</p>
      </div>

      {/* Grid of Service Types as Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveTab(type.id)}
            className={`p-6 rounded-[32px] border transition-all text-left relative overflow-hidden group ${
              activeTab === type.id 
                ? 'bg-white/10 border-[#D4AF37] shadow-xl shadow-[#D4AF37]/5' 
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity ${type.color} ${activeTab === type.id ? 'opacity-100' : 'opacity-0'}`} />
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl transition-all ${activeTab === type.id ? 'bg-[#D4AF37] text-[#0F172A]' : 'bg-white/5 text-white/30'}`}>
                <type.icon size={24} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${activeTab === type.id ? 'text-[#D4AF37]' : 'text-white/20'}`}>Select</span>
            </div>
            <h3 className="relative z-10 text-lg font-bold text-white">{type.label}</h3>
          </button>
        ))}
      </div>

      {/* List Area */}
      <motion.div 
        layout
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden"
      >
        <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Calendar className="text-[#D4AF37]" size={20} />
            <h2 className="text-lg font-bold text-white italic font-display">Upcoming {serviceTypes.find(t => t.id === activeTab)?.label} Alerts</h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input placeholder="Search members..." className="pl-10 pr-4 py-2 bg-white/5 rounded-xl text-sm border-none outline-none text-white focus:ring-1 focus:ring-[#D4AF37] w-64" />
             </div>
             <button className="flex items-center gap-2 bg-[#D4AF37] text-[#0F172A] px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all shadow-[#D4AF37]/10">
               <Plus size={16} />
               Add Entry
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Customer Details</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Contact</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Date</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Action Plan</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {eliteMembers.map(member => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#D4AF37] border border-white/10">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{member.name}</p>
                        <p className="text-[10px] font-mono text-[#64748B] uppercase">{member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm text-[#94A3B8]">{member.contact}</td>
                  <td className="px-10 py-6">
                    <div className="text-sm font-bold text-white">{member.date}</div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">{member.daysIn}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                       <select className="bg-white/5 border border-white/10 text-white/70 text-xs rounded-lg px-3 py-1 outline-none">
                          <option>Send Bouquet</option>
                          <option>Call Customer</option>
                          <option>Send Gift Coupon</option>
                       </select>
                       {activeTab === 'birthday' && (
                         <button 
                           onClick={() => handleOpenReminderModal(member)}
                           className="p-1.5 bg-white/5 hover:bg-[#D4AF37] hover:text-[#0F172A] text-[#D4AF37] rounded-lg transition-all"
                           title="Set Reminder"
                         >
                           <Bell size={14} />
                         </button>
                       )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-2 text-white/30 hover:text-white transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
           <p className="text-xs text-[#64748B]">Showing 5 upcoming events</p>
           <button className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] hover:underline">View Calendar Schedule</button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isReminderModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0F172A]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1E293B] w-full max-w-lg rounded-[40px] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white italic font-display">Birthday Reminder</h3>
                    <p className="text-xs text-[#94A3B8]">Set a follow-up alert for {selectedMember?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsReminderModalOpen(false)}
                  className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
                      <Info size={16} className="text-[#D4AF37] mt-0.5" />
                      <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                        Reminders will be logged to the Relationship Manager's dashboard on the specified date.
                      </p>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] ml-2">Reminder Date</label>
                     <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                          type="date"
                          value={reminderDate}
                          onChange={(e) => setReminderDate(e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-white text-sm"
                        />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] ml-2">Reminder Message</label>
                     <textarea 
                        rows={3}
                        value={reminderMessage}
                        onChange={(e) => setReminderMessage(e.target.value)}
                        placeholder="Enter message..."
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-white text-sm resize-none"
                     />
                   </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setIsReminderModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 text-white/50 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all font-display italic"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSetReminder}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0F172A] rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" />
                    ) : (
                      <>
                        Set Reminder
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
