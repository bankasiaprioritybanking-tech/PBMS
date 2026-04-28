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
  PhoneCall
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import DashboardThumbnail from '../components/DashboardThumbnail';

const stats = [
  { label: 'Live VAS Requests', value: '42', icon: Clock, color: 'bg-amber-50 text-[#D4AF37]', trend: '+12%' },
  { label: 'Priority Members', value: '3,842', icon: Users, color: 'bg-[#F1F5F9] text-[#0F172A]', trend: '+8.4%' },
  { label: 'Appointments Today', value: '18', icon: Calendar, color: 'bg-emerald-50 text-emerald-600', trend: '0%' },
  { label: 'Approval Rate', value: '99.1%', icon: CheckCircle2, color: 'bg-blue-50 text-blue-600', trend: '+1.1%' },
];

const RoleDashboard = ({ roleName }: { roleName: string }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-[#0F172A]">{roleName} Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm"
          >
             <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
             <h3 className="text-3xl font-bold text-[#0F172A]">{stat.value}</h3>
          </motion.div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm">
        <h3 className="text-lg font-bold text-[#0F172A] mb-4">Approval Tasks</h3>
        <p className="text-sm text-[#64748B]">Approval queue for {roleName} role.</p>
      </div>
    </div>
  );
};

const QuickActionDesk = () => {
  const sections = [
    {
      title: 'A. Communication & Collaboration',
      links: [
        { label: 'Outlook', url: 'https://outlook.office.com' },
        { label: 'Teams', url: 'https://teams.microsoft.com' },
        { label: 'WhatsApp Web', url: 'https://web.whatsapp.com' },
        { label: 'Zoom/Meet', url: 'https://zoom.us' },
      ],
    },
    {
      title: 'B. Social Media Platforms',
      links: [
        { label: 'MetaSuite', url: '#' },
        { label: 'LinkedIn', url: 'https://linkedin.com' },
        { label: 'Canva', url: 'https://canva.com' },
        { label: 'Mailchimp', url: '#' },
      ],
    },
    {
      title: 'C. Lead & Relationship',
      links: [
        { label: 'Sales Nav', url: '#' },
        { label: 'Google Business', url: '#' },
        { label: 'QR Tracker', url: '#' },
      ],
    },
    {
      title: 'D. Service & Support',
      links: [
        { label: 'Zendesk', url: '#' },
        { label: 'Power BI', url: '#' },
        { label: 'SOP Library', url: '#' },
      ],
    },
  ];

  return (
    <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#0F172A]">Private Banker Quick Action Desk</h3>
      </div>
      
      {sections.map(section => (
        <div key={section.title} className="space-y-4">
          <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{section.title}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {section.links.map(link => (
              <DashboardThumbnail key={link.label} label={link.label} url={link.url} imageSrc="/placeholder.png" />
            ))}
          </div>
        </div>
      ))}
      
      <div className="p-6 bg-[#FEF9C3] rounded-2xl border border-[#FDE68A] text-[#854D0E] text-xs">
          <p className="font-bold mb-2">Compliance Note:</p>
          <p>Customer-sensitive information must not be shared through social media, public communication apps, or third-party campaign tools unless the channel, content, consent, and data-sharing process are approved by the Bank’s competent authority. RMs should use these tools only for approved communication, appointment coordination, public campaign engagement, and relationship development.</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const userRole = 'Priority Relationship Manager (PRM)';
  const tabs = [
      'RM Home', 'Customer 360°', 'Portfolio & Growth', 'Service Request', 'VAS Request', 
      'Card & Cheque Support', 'Complaint & Escalation', 'Important Links', 'Forms & Templates', 
      'Daily RM Checklist', 'Management MIS'
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#0F172A] rounded-[24px] flex items-center justify-center text-[#D4AF37] font-bold text-3xl shadow-xl shadow-[#D4AF37]/5 border border-white/5">
            P
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">The Pinnacle of Personalized Banking</h4>
            <h1 className="text-4xl font-display font-medium text-[#0F172A] italic">Good morning, <span className="not-italic font-bold">John Doe</span></h1>
            <p className="text-[#64748B] text-sm flex items-center gap-2">
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
                className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#0F172A] text-[#D4AF37]' : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#D4AF37]'}`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'RM Home' && <RoleDashboard roleName={userRole} />}
      {activeTab === 'Important Links' && <QuickActionDesk />}

      <p className="text-[11px] text-[#64748B] p-4 bg-[#F8FAFC] rounded-2xl italic border border-[#F1F5F9]">
        “Tools, resources, and policy links are centralized here for RM efficiency. Please ensure compliance and confirm information accuracy from official sources.”
      </p>
    </div>
  );
}

