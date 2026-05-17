import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  BriefcaseBusiness,
  FileText,
  Search,
  Zap,
  PhoneCall,
  Video,
  MessageSquare,
  Link2,
  Globe,
  Mail,
  Building2,
  BookOpen,
  Linkedin,
  Smartphone,
  BarChart3,
  MessageCircle,
  Users2,
  CalendarPlus,
  Newspaper
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import DashboardThumbnail from '../components/DashboardThumbnail';
import ModulePlaceholder from '../components/shared/ModulePlaceholder';
import RMVisitDashboard from './RMVisitDashboard';
import RMVisitCalendar from './RMVisitCalendar';
import { thumbnailAssets } from '../config/thumbnails';

const stats = [
  { label: 'Live VAS Requests', value: '42', icon: Clock, color: 'bg-amber-50 dark:bg-amber-900/20 text-[#D4AF37]', trend: '+12%' },
  { label: 'Priority Members', value: '3,842', icon: Users, color: 'bg-[#F1F5F9] dark:bg-white/5 text-[#0F172A] dark:text-white', trend: '+8.4%' },
  { label: 'Appointments Today', value: '18', icon: Calendar, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', trend: '0%' },
  { label: 'Approval Rate', value: '99.1%', icon: CheckCircle2, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', trend: '+1.1%' },
];

const workspaceLinks = [
  {
    category: 'A. Communication Hub',
    icon: MessageSquare,
    links: [
      { label: 'Microsoft Outlook', url: 'https://outlook.office.com', icon: '📧', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', desc: 'Corporate Email' },
      { label: 'Microsoft Teams', url: 'https://teams.microsoft.com', icon: '💬', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400', desc: 'Team Collaboration' },
      { label: 'Zoom Workspace', url: 'https://zoom.us/wb', icon: '🎥', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400', desc: 'Video Meetings' },
      { label: 'WhatsApp Business', url: 'https://web.whatsapp.com', icon: '📱', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', desc: 'Messaging' },
      { label: 'Internal Chat Portal', url: '#/internal-chat', icon: '💭', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', desc: 'Staff Messaging', internal: true },
      { label: 'Schedule Meeting', url: 'https://teams.microsoft.com/l/meeting', icon: '📅', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400', desc: 'Teams/Zoom' },
    ]
  },
  {
    category: 'B. Bank Asia Official',
    icon: Building2,
    links: [
      { label: 'Bank Asia Smart App', url: 'https://bankasia-bd.com/smart-app', icon: '🏦', color: 'bg-amber-50 dark:bg-amber-900/20 text-[#D4AF37]', desc: 'Mobile Banking App' },
      { label: 'Bank Asia Website', url: 'https://bankasia-bd.com', icon: '🌐', color: 'bg-[#F8FAFC] dark:bg-white/5 text-[#0F172A] dark:text-white', desc: 'Main Website' },
      { label: 'Priority Banking Portal', url: 'https://priority.bankasia-bd.com', icon: '⭐', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', desc: 'Priority Portal' },
      { label: 'Annual Report', url: '#', icon: '📊', color: 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400', desc: '2025 Annual Report' },
    ]
  },
  {
    category: 'C. Regulatory & Compliance',
    icon: BookOpen,
    links: [
      { label: 'Bangladesh Bank', url: 'https://www.bb.org.bd', icon: '🏛️', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400', desc: 'Central Bank' },
      { label: 'BB Circulars & Regulations', url: 'https://www.bb.org.bd/en/index.php/mediaroom/circular', icon: '📜', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400', desc: 'All BB Circulars' },
      { label: 'IBB Website', url: 'https://www.ibb.org.bd', icon: '🏦', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', desc: 'Islamic Banking' },
      { label: 'BFIU Guidelines', url: 'https://bfiu.bb.org.bd', icon: '🔍', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400', desc: 'Anti-Money Laundering' },
      { label: 'SEC Bangladesh', url: 'https://www.secbd.org', icon: '📋', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', desc: 'Securities Commission' },
      { label: 'BTRC', url: 'https://www.btrc.gov.bd', icon: '📡', color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400', desc: 'Telecom Regulator' },
    ]
  },
  {
    category: 'D. Professional Network',
    icon: Linkedin,
    links: [
      { label: 'LinkedIn', url: 'https://linkedin.com', icon: '💼', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400', desc: 'Professional Network' },
      { label: 'Bank Asia LinkedIn', url: 'https://linkedin.com/company/bank-asia-limited', icon: '🏢', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', desc: 'Official Page' },
      { label: 'Meta Business Suite', url: 'https://business.facebook.com', icon: '📘', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400', desc: 'Social Management' },
      { label: 'Canva for Teams', url: 'https://canva.com', icon: '🎨', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', desc: 'Design Tool' },
    ]
  },
  {
    category: 'E. Analytics & Productivity',
    icon: BarChart3,
    links: [
      { label: 'Power BI Reports', url: 'https://app.powerbi.com', icon: '📈', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500', desc: 'Business Analytics' },
      { label: 'Google Workspace', url: 'https://workspace.google.com', icon: '🔧', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', desc: 'Productivity Suite' },
      { label: 'SOP Library', url: '#', icon: '📚', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', desc: 'Standard Procedures' },
      { label: 'Mailchimp', url: 'https://mailchimp.com', icon: '📧', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', desc: 'Email Campaigns' },
    ]
  }
];

const RoleDashboard = ({ roleName }: { roleName: string }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-[#1E293B] p-8 rounded-[32px] border border-[#E2E8F0] dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={22} />
            </div>
            <p className="text-[11px] font-bold text-[#94A3B8] dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-[#0F172A] dark:text-white">{stat.value}</h3>
              <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : stat.trend === '0%' ? 'text-[#94A3B8]' : 'text-red-500'}`}>{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[32px] border border-[#E2E8F0] dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-4">Pending Approval Tasks</h3>
        <p className="text-sm text-[#64748B] dark:text-slate-400">Approval queue for {roleName} role.</p>
      </div>
    </div>
  );
};

const PriorityModules = () => {
  const modules = [
    { label: 'RM Portfolio', subtitle: 'Dashboard', url: '#portfolio', thumb: thumbnailAssets.rmPortfolio },
    { label: 'Customer Search', subtitle: 'Priority Marking', url: '#customer', thumb: thumbnailAssets.customerSearch },
    { label: 'Service Request', subtitle: 'Tracker', url: '/service-request', thumb: thumbnailAssets.serviceRequest },
    { label: 'VAS Request', subtitle: 'Portal', url: '/appointments', thumb: thumbnailAssets.vasRequest },
    { label: 'Card Support', subtitle: 'ADC', url: '/bill-management', thumb: thumbnailAssets.cardSupport },
    { label: 'Cheque Book', subtitle: 'PSD Support', url: '#cheque', thumb: thumbnailAssets.chequeBook },
    { label: 'Call Center', subtitle: 'Escalation', url: '#escalation', thumb: thumbnailAssets.callCenter },
    { label: 'Flight Info', subtitle: 'Travel Assist', url: '#flight', thumb: thumbnailAssets.flightInfo },
    { label: 'Product & SOC', subtitle: 'Library', url: '#products', thumb: thumbnailAssets.productSOC },
    { label: 'FX Rate', subtitle: 'BB Circular', url: '#forex', thumb: thumbnailAssets.bbCircular },
  ];

  return (
    <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[32px] border border-[#E2E8F0] dark:border-white/10 shadow-sm space-y-8">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Priority Banking Modules</h3>
        <p className="text-sm text-[#64748B] dark:text-slate-400">Quick access to key relationship management tools and services</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {modules.map(module => (
          <a key={module.label} href={module.url} className="block group">
            <DashboardThumbnail
              label={module.label}
              subtitle={module.subtitle}
              url={module.url}
              imageSrc={module.thumb}
            />
          </a>
        ))}
      </div>
      <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30 text-amber-800 dark:text-amber-300 text-xs">
        <p className="font-bold mb-1.5">⚠️ Compliance Note</p>
        <p className="leading-relaxed">Customer-sensitive information must not be shared through social media, public communication apps, or third-party campaign tools unless the channel, content, consent, and data-sharing process are approved by the Bank's competent authority.</p>
      </div>
    </div>
  );
};

const InternalChatWidget = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sarah K.', text: 'Team, Q1 VAS targets are updated in the portal.', time: '9:41 AM', own: false },
    { id: 2, sender: 'You', text: 'Thanks Sarah! Will review shortly.', time: '9:43 AM', own: true },
    { id: 3, sender: 'Rahim A.', text: 'Priority center meeting at 2 PM today.', time: '10:15 AM', own: false },
  ]);

  const send = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'You', text: message, time: 'Now', own: true }]);
    setMessage('');
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-[#E2E8F0] dark:border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F1F5F9] dark:border-white/10 bg-[#0F172A]">
        <div className="w-9 h-9 rounded-xl bg-[#D4AF37] flex items-center justify-center">
          <MessageCircle size={18} className="text-[#0F172A]" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Priority Team Chat</p>
          <p className="text-[10px] text-slate-400">Staff Internal Messaging</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-slate-400">4 online</span>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[200px] overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.own ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.own ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] dark:bg-white/10 text-[#1E293B] dark:text-white'}`}>
              {!msg.own && <p className="text-[9px] font-bold text-[#D4AF37] mb-0.5">{msg.sender}</p>}
              <p className="text-xs">{msg.text}</p>
              <p className={`text-[9px] mt-1 ${msg.own ? 'text-white/40' : 'text-[#94A3B8]'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-[#F8FAFC] dark:bg-white/10 border border-[#E2E8F0] dark:border-white/10 rounded-xl text-xs font-medium outline-none focus:border-[#D4AF37] transition-all text-[#1E293B] dark:text-white placeholder:text-[#94A3B8]"
        />
        <button
          onClick={send}
          className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center hover:bg-[#D4AF37]/90 transition-all"
        >
          <ExternalLink size={16} className="text-[#0F172A] rotate-45" />
        </button>
      </div>
    </div>
  );
};

const DigitalWorkspace = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Zoom Meeting', icon: '🎥', url: 'https://zoom.us/start', color: 'from-blue-500 to-blue-700' },
          { label: 'WhatsApp', icon: '📱', url: 'https://web.whatsapp.com', color: 'from-emerald-500 to-emerald-700' },
          { label: 'Teams Call', icon: '💬', url: 'https://teams.microsoft.com', color: 'from-indigo-500 to-indigo-700' },
          { label: 'Schedule', icon: '📅', url: 'https://calendar.google.com', color: 'from-amber-500 to-amber-700' },
          { label: 'BB Portal', icon: '🏛️', url: 'https://www.bb.org.bd', color: 'from-rose-500 to-rose-700' },
          { label: 'Smart App', icon: '🏦', url: '#', color: 'from-[#D4AF37] to-[#B8860B]' },
        ].map(item => (
          <motion.a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.97 }}
            className={`bg-gradient-to-br ${item.color} p-4 rounded-2xl flex flex-col items-center gap-2 text-center shadow-lg hover:shadow-xl transition-all cursor-pointer`}
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.label}</span>
          </motion.a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InternalChatWidget />
        </div>
        <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-[#E2E8F0] dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] dark:bg-white/10 flex items-center justify-center text-[#D4AF37]">
              <CalendarPlus size={18} />
            </div>
            <p className="font-bold text-[#0F172A] dark:text-white text-sm">Quick Schedule</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Zoom Meeting', url: 'https://zoom.us/meeting/schedule', icon: '🎥' },
              { label: 'Teams Meeting', url: 'https://teams.microsoft.com', icon: '💬' },
              { label: 'Client Appointment', url: '#', icon: '🤝' },
              { label: 'Branch Visit', url: '#', icon: '🏦' },
            ].map(item => (
              <a
                key={item.label}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-white/5 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 border border-transparent transition-all cursor-pointer"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-bold text-[#334155] dark:text-slate-300">{item.label}</span>
                <ExternalLink size={12} className="ml-auto text-[#94A3B8]" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {workspaceLinks.map((section, si) => (
        <motion.div
          key={section.category}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: si * 0.05 }}
          className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-[#E2E8F0] dark:border-white/10 shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] dark:bg-white/10 flex items-center justify-center text-[#D4AF37]">
              <section.icon size={18} />
            </div>
            <h3 className="text-sm font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-[0.2em]">{section.category}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {section.links.map(link => (
              <motion.a
                key={link.label}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-[#F1F5F9] dark:border-white/10 hover:border-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/10 transition-all bg-[#F8FAFC] dark:bg-white/5 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl ${link.color} flex items-center justify-center text-2xl shadow-sm`}>
                  {link.icon}
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-[#0F172A] dark:text-white group-hover:text-[#D4AF37] transition-colors leading-tight">{link.label}</p>
                  <p className="text-[9px] text-[#94A3B8] mt-0.5">{link.desc}</p>
                </div>
                {link.internal && (
                  <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Internal</span>
                )}
              </motion.a>
            ))}
          </div>
        </motion.div>
      ))}

      <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30 text-amber-800 dark:text-amber-300 text-xs">
        <p className="font-bold mb-1.5">⚠️ Compliance Reminder</p>
        <p className="leading-relaxed">Customer-sensitive information must not be shared through social media, public communication apps, or third-party campaign tools unless approved by the Bank's competent authority. Use these tools only for approved communication, appointment coordination, and relationship development as per PB Policy v2.1.</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const userRole = 'Priority Relationship Manager (PRM)';
  const tabs = [
    'RM Home', 'Priority Modules', 'RM Visit Module', 'Visit Calendar', 'Customer 360°', 'Portfolio & Growth',
    'Service Request', 'VAS Request', 'Card & Cheque Support', 'Complaint & Escalation',
    'Digital Workspace', 'Important Links', 'Forms & Templates', 'Daily RM Checklist', 'Management MIS'
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0F172A] rounded-[20px] sm:rounded-[24px] flex items-center justify-center text-[#D4AF37] font-bold text-2xl sm:text-3xl shadow-xl shadow-[#D4AF37]/5 border border-white/5 shrink-0">
            P
          </div>
          <div className="space-y-1 min-w-0">
            <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-bold text-[#D4AF37]">The Pinnacle of Personalized Banking</h4>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-[#0F172A] dark:text-white italic">Good morning, <span className="not-italic font-bold">John Doe</span></h1>
            <p className="text-[#64748B] dark:text-slate-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              PBMS Secure // RM Session Active
            </p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-[#0F172A] dark:bg-white text-[#D4AF37] dark:text-[#0F172A]'
                : 'bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-white/10 hover:border-[#D4AF37]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'RM Home' && <RoleDashboard roleName={userRole} />}
      {activeTab === 'Priority Modules' && <PriorityModules />}
      {activeTab === 'RM Visit Module' && <RMVisitDashboard />}
      {activeTab === 'Visit Calendar' && <RMVisitCalendar />}
      {activeTab === 'Digital Workspace' && <DigitalWorkspace />}
      {activeTab === 'Important Links' && <DigitalWorkspace />}

      {!['RM Home', 'Priority Modules', 'Digital Workspace', 'Important Links', 'RM Visit Module', 'Visit Calendar'].includes(activeTab) && (
        <ModulePlaceholder
          title={`${activeTab} Interface`}
          message={`The digital environment for ${activeTab} is currently being synchronized with the backend systems. Full analytical capabilities will be available shortly.`}
        />
      )}

      <p className="text-[11px] text-[#64748B] dark:text-slate-500 p-4 bg-white dark:bg-[#1E293B] rounded-2xl italic border border-[#F1F5F9] dark:border-white/10">
        "Tools, resources, and policy links are centralized here for RM efficiency. Please ensure compliance and confirm information accuracy from official sources."
      </p>
    </div>
  );
}
