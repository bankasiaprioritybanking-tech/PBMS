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
  AlertCircle,
  X,
  CalendarDays,
  Info,
  Phone,
  MessageSquare,
  UserCheck,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const bookedAppointments = [
  {
    id: 'APT-001',
    customerName: 'Nadeem Zahid',
    customerContact: '+880 1712-3XXXXX',
    time: '08:00 AM',
    date: '2026-01-20',
    rmName: 'Sarah Jenkins',
    rmId: 'RM-442',
    subject: 'Portfolio Review & Wealth Management',
    notes: 'Customer is interested in exploring offshore wealth funds and dual-currency accounts. High priority lead.',
    status: 'booked'
  },
  {
    id: 'APT-002',
    customerName: 'Farhana Haq',
    customerContact: '+880 1811-9XXXXX',
    time: '12:00 PM',
    date: '2026-01-20',
    rmName: 'Sarah Jenkins',
    rmId: 'RM-442',
    subject: 'Locker Facility Allocation',
    notes: 'Inquiry for large-size locker availability at Gulshan-2 branch.',
    status: 'pending'
  }
];

const bangladeshHolidays = [
  { id: '1', date: '2026-02-21', name: 'Shaheed Day', fullName: 'Shaheed Day & International Mother Language Day', type: 'national', description: 'Commemorates the 1952 Language Movement where students sacrificed their lives for the recognition of Bengali as a state language.' },
  { id: '2', date: '2026-03-17', name: 'Sheikh Mujib Birthday', fullName: "Sheikh Mujibur Rahman's Birthday & Children's Day", type: 'national', description: "Celebrating the birth and legacy of the Father of the Nation, Bangabandhu Sheikh Mujibur Rahman." },
  { id: '3', date: '2026-03-20', name: 'Eid-ul-Fitr*', fullName: 'Eid-ul-Fitr (Estimated)', type: 'religious', description: 'Islamic festival marking the end of Ramadan. Subject to moon sighting.' },
  { id: '4', date: '2026-03-21', name: 'Eid-ul-Fitr*', fullName: 'Eid-ul-Fitr (Estimated)', type: 'religious', description: 'Islamic festival marking the end of Ramadan. Subject to moon sighting.' },
  { id: '5', date: '2026-03-22', name: 'Eid-ul-Fitr*', fullName: 'Eid-ul-Fitr (Estimated)', type: 'religious', description: 'Islamic festival marking the end of Ramadan. Subject to moon sighting.' },
  { id: '6', date: '2026-03-26', name: 'Independence Day', fullName: 'Independence & National Day', type: 'national', description: 'Marking the declaration of independence from Pakistan in 1971.' },
  { id: '7', date: '2026-04-14', name: 'Bengali New Year', fullName: 'Pahela Baishakh', type: 'national', description: 'The first day of the Bengali calendar, celebrated with colorful processions and traditional festivities.' },
  { id: '8', date: '2026-05-01', name: 'May Day', fullName: 'International Workers Day', type: 'national', description: 'Commemorating the historic struggles and gains made by workers and the labor movement.' },
  { id: '9', date: '2026-05-27', name: 'Eid-ul-Adha*', fullName: 'Eid-ul-Adha (Estimated)', type: 'religious', description: 'The Feast of Sacrifice, honoring the willingness of Ibrahim to sacrifice his son. Subject to moon sighting.' },
  { id: '10', date: '2026-05-28', name: 'Eid-ul-Adha*', fullName: 'Eid-ul-Adha (Estimated)', type: 'religious', description: 'The Feast of Sacrifice, honoring the willingness of Ibrahim to sacrifice his son. Subject to moon sighting.' },
  { id: '11', date: '2026-05-29', name: 'Eid-ul-Adha*', fullName: 'Eid-ul-Adha (Estimated)', type: 'religious', description: 'The Feast of Sacrifice, honoring the willingness of Ibrahim to sacrifice his son. Subject to moon sighting.' },
  { id: '12', date: '2026-07-01', name: 'Bank Holiday', fullName: 'Semi-Annual Bank Holiday', type: 'bank', description: 'Half-yearly closing of accounts for banks in Bangladesh.' },
  { id: '13', date: '2026-07-26', name: 'Ashura*', fullName: 'Holy Ashura (Estimated)', type: 'religious', description: 'Marking the 10th day of Muharram. Subject to moon sighting.' },
  { id: '14', date: '2026-08-26', name: 'Eid-e-Miladunnabi*', fullName: 'Eid-e-Miladunnabi (Estimated)', type: 'religious', description: 'Observance of the birthday of the Islamic prophet Muhammad. Subject to moon sighting.' },
  { id: '15', date: '2026-10-20', name: 'Durga Puja*', fullName: 'Bijoya Dashami (Estimated)', type: 'religious', description: 'The grand finale of the Durga Puja festival. Subject to moon sighting.' },
  { id: '16', date: '2026-12-16', name: 'Victory Day', fullName: 'Victory Day (Bijoy Dibosh)', type: 'national', description: 'Celebrating the victory of the allied forces over the Pakistani occupation forces in 1971.' },
  { id: '17', date: '2026-12-25', name: 'Christmas Day', fullName: 'Christmas Day (Boro Din)', type: 'religious', description: 'Annual festival commemorating the birth of Jesus Christ.' },
  { id: '18', date: '2026-12-31', name: 'Bank Holiday', fullName: 'Annual Bank Holiday', type: 'bank', description: 'Yearly closing of accounts for all banks in Bangladesh.' },
];

const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
];

export default function Appointments() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'prospective' | 'holidays'>('schedule');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedHoliday, setSelectedHoliday] = useState<any | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState('2026-01-20'); // Default to farhana/nadeem's date
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = Jan 2026

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

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
          <button 
            onClick={() => setActiveTab('holidays')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'holidays' ? 'bg-[#D4AF37] text-[#0F172A]' : 'text-white/50 hover:text-white'
            }`}
          >
            Holidays
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
            {/* Calendar View */}
            <div className="space-y-6 lg:col-span-1">
               <div className="bg-[#1E293B] backdrop-blur-xl border border-white/10 p-6 rounded-[32px]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-white italic font-display">January 2026</h3>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                      <div key={d} className="text-[10px] font-bold text-[#D4AF37] py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: getFirstDayOfMonth(0, 2026) }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: getDaysInMonth(0, 2026) }).map((_, i) => {
                      const d = i + 1;
                      const dateStr = `2026-01-${d.toString().padStart(2, '0')}`;
                      const hasAppointment = bookedAppointments.some(a => a.date === dateStr);
                      const isHoliday = bangladeshHolidays.some(h => h.date === dateStr);
                      const isSelected = selectedDate === dateStr;
                      
                      return (
                        <button 
                          key={d}
                          id={`calendar-date-${dateStr}`}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`text-xs w-8 h-8 rounded-xl transition-all relative flex flex-col items-center justify-center ${
                            isSelected ? 'bg-[#D4AF37] text-[#0F172A] font-bold shadow-lg shadow-[#D4AF37]/20' : 
                            'text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {d}
                          <div className="flex gap-0.5 mt-0.5">
                            {hasAppointment && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                            {isHoliday && <div className="w-1 h-1 rounded-full bg-rose-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
               </div>

               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px]">
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center" id="stat-total-today">
                        <span className="text-sm text-white/50">Total Today</span>
                        <span className="text-sm font-bold text-white">{bookedAppointments.filter(a => a.date === selectedDate).length}</span>
                     </div>
                     <div className="flex justify-between items-center" id="stat-confirmed">
                        <span className="text-sm text-white/50">Confirmed</span>
                        <span className="text-sm font-bold text-[#D4AF37]">
                           {bookedAppointments.filter(a => a.date === selectedDate && a.status === 'booked').length}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Time Slots Grid */}
            <div className="lg:col-span-3">
               <h3 className="text-sm font-bold text-white mb-4">Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric'})}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {timeSlots.map((time) => {
                   const appointment = bookedAppointments.find(a => a.time === time && a.date === selectedDate);
                   const isBooked = !!appointment;
                   const isHoliday = bangladeshHolidays.some(h => h.date === selectedDate);
                   const isDisabled = isHoliday;

                   return (
                     <div 
                      key={time}
                      onClick={() => !isDisabled && isBooked && setSelectedAppointment(appointment)}
                      className={`p-6 rounded-3xl border transition-all relative group overflow-hidden ${
                        isDisabled ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' :
                        isBooked 
                          ? 'bg-white/10 border-[#D4AF37]/30 cursor-pointer shadow-lg shadow-black/20' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                     >
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-3">
                             <Clock size={16} className={isBooked ? 'text-[#D4AF37]' : 'text-white/30'} />
                             <span className="text-sm font-bold text-white">{time}</span>
                           </div>
                           {isBooked && (
                             <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                               appointment.status === 'booked' ? 'bg-[#D4AF37] text-[#0F172A]' : 'bg-white/10 text-white/50'
                             }`}>
                               {appointment.status}
                             </span>
                           )}
                        </div>
                        
                        {isDisabled ? (
                            <span className="text-xs text-white/30 font-bold italic">Holiday - Closed</span>
                        ) : isBooked ? (
                          <div>
                            <p className="text-base font-bold text-white italic font-display">{appointment.customerName}</p>
                            <p className="text-xs text-[#94A3B8] mt-1 line-clamp-1">{appointment.subject}</p>
                            <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">View Engagement Dossier</span>
                              <ChevronRight size={14} className="text-[#D4AF37]" />
                            </div>
                          </div>
                        ) : (
                          <button className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={14} />
                            Create Appointment
                          </button>
                        )}
                     </div>
                   );
                 })}
               </div>
            </div>
          </motion.div>
        ) : activeTab === 'prospective' ? (
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
        ) : (
          <motion.div 
            key="holidays"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
             {/* Dynamic Calendar */}
             <div className="lg:col-span-2 bg-[#1E293B] border border-white/10 rounded-[40px] p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                      <CalendarDays size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white italic font-display">{monthNames[currentMonth]} 2026</h2>
                      <p className="text-xs text-[#94A3B8]">National & Bank Holidays</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentMonth(prev => Math.max(0, prev - 1))}
                      disabled={currentMonth === 0}
                      className="p-3 bg-white/5 rounded-xl text-white/50 hover:text-[#D4AF37] disabled:opacity-30 transition-all border border-white/5"
                    >
                      <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentMonth(prev => Math.min(11, prev + 1))}
                      disabled={currentMonth === 11}
                      className="p-3 bg-white/5 rounded-xl text-white/50 hover:text-[#D4AF37] disabled:opacity-30 transition-all border border-white/5"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-4 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] text-center">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-4">
                   {Array.from({ length: getFirstDayOfMonth(currentMonth, 2026) }).map((_, i) => (
                     <div key={`empty-${i}`} className="aspect-square" />
                   ))}
                   {Array.from({ length: getDaysInMonth(currentMonth, 2026) }).map((_, i) => {
                     const day = i + 1;
                     const dateStr = `2026-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                     const holiday = bangladeshHolidays.find(h => h.date === dateStr);
                     
                     return (
                       <button 
                         key={day}
                         onClick={() => holiday && setSelectedHoliday(holiday)}
                         className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group border ${
                           holiday 
                             ? holiday.type === 'national' 
                               ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white' 
                               : holiday.type === 'bank' 
                                 ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                                 : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                             : 'bg-white/[0.02] border-transparent text-white/30 hover:bg-white/5'
                         }`}
                       >
                         <span className="text-sm font-bold">{day}</span>
                         {holiday && (
                           <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current" />
                         )}
                         {holiday && (
                           <div className="absolute inset-x-2 bottom-1 truncate text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                             {holiday.name}
                           </div>
                         )}
                       </button>
                     );
                   })}
                </div>
             </div>

             {/* Holiday Sidebar */}
             <div className="space-y-6">
                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-[32px] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Info size={18} className="text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-white italic">Regional Compliance</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-xs text-white/70">National Holidays</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-xs text-white/70">Bank Closures</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-white/70">Religious Observances</span>
                     </div>
                  </div>
                  <p className="mt-8 text-[10px] text-[#94A3B8] leading-relaxed">
                    * Religious holidays are subject to the appearance of the moon and may vary by 1-2 days.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">All 2026 Holidays</h3>
                  <div className="space-y-3">
                    {bangladeshHolidays.map(h => (
                      <button 
                        key={h.id}
                        onClick={() => setSelectedHoliday(h)}
                        className="w-full text-left p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group"
                      >
                         <p className="text-[10px] font-bold text-[#D4AF37]">{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}</p>
                         <p className="text-xs font-bold text-white truncate group-hover:text-[#D4AF37]">{h.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-[#0F172A]/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-[#1E293B] w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-[#0F172A] to-[#1E293B] relative overflow-hidden flex items-end p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full -mr-32 -mt-32" />
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="absolute top-8 right-8 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-[#D4AF37] flex items-center justify-center text-[#0F172A] shadow-2xl border-4 border-white/10">
                    <Users size={36} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white italic font-display">{selectedAppointment.customerName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-emerald-500/20">Elite Client</span>
                      <span className="px-2 py-0.5 bg-white/10 text-white/50 text-[10px] font-bold rounded-lg uppercase tracking-widest">{selectedAppointment.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10">
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Engagement Details</label>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar size={14} className="text-[#94A3B8]" />
                          <span className="text-xs font-bold text-white">{new Date(selectedAppointment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={14} className="text-[#94A3B8]" />
                          <span className="text-xs font-bold text-white">{selectedAppointment.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Contact Protocol</label>
                        <div className="flex items-center gap-2">
                           <button className="flex-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5 group">
                              <Phone size={14} className="text-[#94A3B8] group-hover:text-[#D4AF37]" />
                              <span className="text-[10px] font-bold text-white/70 uppercase">Call</span>
                           </button>
                           <button className="flex-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5 group">
                              <MessageSquare size={14} className="text-[#94A3B8] group-hover:text-[#D4AF37]" />
                              <span className="text-[10px] font-bold text-white/70 uppercase">SMS</span>
                           </button>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Relationship Manager</label>
                      <div className="p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/20 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#0F172A] font-bold">
                          {selectedAppointment.rmName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{selectedAppointment.rmName}</p>
                          <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">{selectedAppointment.rmId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] ml-1">Strategic Scope</label>
                      <p className="text-xs text-white/70 leading-relaxed italic border-l-2 border-[#D4AF37]/40 pl-4">
                        {selectedAppointment.subject}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 mb-10">
                   <div className="flex items-start gap-3">
                      <Info size={16} className="text-[#D4AF37] mt-0.5" />
                      <div>
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-2">Internal Engagement Notes</h4>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                          {selectedAppointment.notes}
                        </p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                        alert(`Appointment ${selectedAppointment.id} confirmed.`);
                        setSelectedAppointment(null);
                    }}
                    className="flex-1 py-4 bg-[#D4AF37] text-[#0F172A] rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <UserCheck size={16} />
                    Confirm Attendance
                  </button>
                  <button 
                    onClick={() => {
                        alert(`Redirecting to rescheduling for ${selectedAppointment.id}.`);
                        setSelectedAppointment(null);
                    }}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5"
                  >
                    <Calendar size={16} />
                    Reschedule
                  </button>
                  <button 
                    onClick={() => {
                        if (confirm('Are you sure you want to cancel this engagement?')) {
                            alert(`Appointment ${selectedAppointment.id} cancelled.`);
                            setSelectedAppointment(null);
                        }
                    }}
                    className="group px-6 py-4 bg-white/5 hover:bg-rose-500/10 text-rose-500 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-white/5 hover:border-rose-500/30"
                  >
                    <XCircle size={18} className="transition-transform group-hover:rotate-90" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedHoliday && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-[#0F172A]/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1E293B] w-full max-w-md rounded-[48px] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-10 border-b border-white/5 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      selectedHoliday.type === 'national' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 
                      selectedHoliday.type === 'bank' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      <CalendarDays size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white italic font-display">Holiday Intelligence</h3>
                      <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] leading-none mt-1">
                        Priority Resource Module
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedHoliday(null)}
                    className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-8">
                 <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Observable Date</p>
                      <h4 className="text-lg font-bold text-white">
                        {new Date(selectedHoliday.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}
                      </h4>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                          selectedHoliday.type === 'national' ? 'bg-rose-500/20 text-rose-400' : 
                          selectedHoliday.type === 'bank' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {selectedHoliday.type} Holiday
                        </span>
                        {selectedHoliday.name.includes('*') && (
                          <span className="px-3 py-1 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-400 uppercase tracking-[0.2em]">
                            Subject to Moon Sighting
                          </span>
                        )}
                      </div>
                      <h4 className="text-2xl font-bold text-white leading-tight font-display">{selectedHoliday.fullName}</h4>
                    </div>
                 </div>

                 <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                    <div className="flex gap-4">
                      <div className="mt-1">
                        <Info size={16} className="text-[#D4AF37]" />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h5 className="text-[10px] font-bold text-white uppercase tracking-widest">Historical context</h5>
                          <p className="text-sm text-[#94A3B8] leading-relaxed italic">
                            "{selectedHoliday.description}"
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t border-white/5 space-y-3">
                           <h5 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Operational Directive</h5>
                           <div className="space-y-2">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                               <span className="text-xs text-white/70">All Priority Centers: <span className="font-bold text-rose-400">CLOSED</span></span>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                               <span className="text-xs text-white/70">Digital Concierge: <span className="font-bold text-emerald-400">ACTIVE</span></span>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="pt-2">
                   <button 
                    onClick={() => setSelectedHoliday(null)}
                    className="w-full py-5 bg-[#D4AF37] hover:bg-[#B8962F] text-[#0F172A] font-bold text-xs uppercase tracking-[0.2em] rounded-[24px] transition-all shadow-xl shadow-[#D4AF37]/10"
                   >
                     Acknowledge & Close
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
