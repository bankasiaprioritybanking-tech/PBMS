import { 
  MessageSquare, 
  Send, 
  History, 
  Settings2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function SmsGateway() {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">Communication</h4>
          <h1 className="text-3xl font-display font-medium text-white italic">SMS Gateway</h1>
          <p className="text-[#94A3B8] text-sm">Direct engagement with priority members via mobile network.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('send')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'send' ? 'bg-[#D4AF37] text-[#0F172A]' : 'text-white/50 hover:text-white'
            }`}
          >
            Direct Send
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'history' ? 'bg-[#D4AF37] text-[#0F172A]' : 'text-white/50 hover:text-white'
            }`}
          >
            Log History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {activeTab === 'send' ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 space-y-8"
             >
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Recipient Number</label>
                   <input placeholder="Ex: 88017XXXXXXXX" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all" />
                </div>
                
                <div className="space-y-2">
                   <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Message Content</label>
                      <span className="text-[10px] text-[#64748B] font-bold">0 / 160 Characters</span>
                   </div>
                   <textarea rows={6} placeholder="Type your priority message here..." className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all resize-none" />
                </div>

                <div className="flex flex-wrap gap-3">
                   {['Birthday Greeting', 'Appointment Reminder', 'VAS Confirmation'].map(tpl => (
                     <button key={tpl} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[11px] font-bold text-[#94A3B8] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                       Use Template: {tpl}
                     </button>
                   ))}
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-end">
                   <button className="flex items-center gap-3 bg-[#D4AF37] text-[#0F172A] px-10 py-5 rounded-2xl font-bold hover:shadow-2xl transition-all shadow-[#D4AF37]/10 group">
                     Broadcast SMS
                     <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                   </button>
                </div>
             </motion.div>
           ) : (
             <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden"
             >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-8 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Timestamp</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Recipient</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Content</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Gateway</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6 text-[11px] font-mono text-[#64748B]">2026-04-28 10:24</td>
                          <td className="px-8 py-6 text-sm text-white font-medium">880171XXXX{i}</td>
                          <td className="px-8 py-6 text-xs text-[#94A3B8] max-w-[200px] truncate">Your appointment at Gulshan Center is confirmed...</td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                               <CheckCircle2 size={14} className="text-emerald-400" />
                               <span className="text-[10px] font-bold text-emerald-400 uppercase">Delivered</span>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </motion.div>
           )}
        </div>

        <div className="space-y-8">
           <div className="bg-[#D4AF37] p-10 rounded-[40px] text-[#0F172A] shadow-2xl relative overflow-hidden group">
              <Settings2 className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity" />
              <h3 className="text-xl font-bold mb-4 italic font-display">Gateway Status</h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-b border-[#0F172A]/10 pb-2">
                    <span>Provider</span>
                    <span>Banglalink PB</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-b border-[#0F172A]/10 pb-2">
                    <span>Balance</span>
                    <span>42,104 SMS</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <span>API Latency</span>
                    <span className="text-emerald-700">124ms</span>
                 </div>
              </div>
           </div>

           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px]">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Clock size={18} className="text-[#D4AF37]" />
                Recent Alerts
              </h3>
              <div className="space-y-6">
                {[
                  { msg: 'Failed delivery to 88019...', type: 'error' },
                  { msg: 'System backup notification sent', type: 'info' },
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4">
                    <AlertCircle size={16} className={alert.type === 'error' ? 'text-red-400' : 'text-[#D4AF37]'} />
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{alert.msg}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
