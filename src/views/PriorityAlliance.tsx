import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useRef, useState, type FC } from 'react';
import { 
  Star, Globe, Award, Handshake, Users, TrendingUp, 
  ChevronRight, ExternalLink, Building2, Newspaper, 
  Share2, Heart, MessageCircle, Bookmark, Play,
  Crown, Gem, Zap, Shield
} from 'lucide-react';

const partners = [
  {
    name: 'Visa International',
    category: 'Card Network',
    logo: '💳',
    color: 'from-blue-600 to-blue-800',
    description: 'Exclusive Visa Infinite & Signature card programs for Priority Banking members with global concierge access.',
    benefits: ['Lounge Access', 'Travel Insurance', 'Purchase Protection', 'Concierge 24/7'],
    since: '2019',
    status: 'Active'
  },
  {
    name: 'Pan Pacific Hotels',
    category: 'Hospitality',
    logo: '🏨',
    color: 'from-amber-600 to-orange-700',
    description: 'Preferred partner for Priority Banking members with exclusive rates and complimentary upgrades across 50+ properties.',
    benefits: ['Room Upgrades', 'Late Checkout', '20% F&B Discount', 'Early Check-in'],
    since: '2021',
    status: 'Active'
  },
  {
    name: 'Emirates Business Class',
    category: 'Aviation',
    logo: '✈️',
    color: 'from-red-700 to-rose-900',
    description: 'Complimentary Business Class upgrades and bonus Skywards miles for Priority Banking members on select routes.',
    benefits: ['Business Upgrades', 'Bonus Miles', 'Priority Boarding', 'Lounge Access'],
    since: '2020',
    status: 'Active'
  },
  {
    name: 'American Express',
    category: 'Financial Services',
    logo: '💎',
    color: 'from-slate-600 to-slate-800',
    description: 'Co-branded Priority Banking Platinum Card with exclusive dining and entertainment privileges in Bangladesh.',
    benefits: ['Dining Benefits', 'Entertainment', 'Reward Points', 'Global Acceptance'],
    since: '2022',
    status: 'Active'
  },
  {
    name: 'Raffles Medical Group',
    category: 'Healthcare',
    logo: '🏥',
    color: 'from-emerald-600 to-teal-800',
    description: 'Priority health checkups and specialist consultations with dedicated Priority Banking health concierge.',
    benefits: ['Annual Checkups', 'Priority Queue', 'Specialist Access', 'Health Concierge'],
    since: '2023',
    status: 'Active'
  },
  {
    name: 'Four Seasons Dhaka',
    category: 'Luxury Lifestyle',
    logo: '🌟',
    color: 'from-purple-600 to-indigo-800',
    description: 'Exclusive dining credits, spa access, and event hosting facilities for Priority Banking clients.',
    benefits: ['Dining Credits', 'Spa Access', 'Event Hosting', 'VIP Events'],
    since: '2024',
    status: 'Active'
  }
];

const edms = [
  {
    title: 'Q1 2026 Exclusive Offers',
    subtitle: 'Priority Banking Elite Benefits',
    tag: 'Limited Time',
    tagColor: 'bg-amber-500',
    bg: 'from-[#0F172A] to-[#1E293B]',
    accent: '#D4AF37',
    content: 'Enjoy zero-fee international transfers, premium lounge access at 1,300+ airports, and a complimentary Visa Infinite card upgrade this quarter.',
    cta: 'Explore Benefits',
    date: 'Valid until March 31, 2026'
  },
  {
    title: 'Travel in Style',
    subtitle: 'Aviation & Hotel Partner Week',
    tag: 'Partner Offer',
    tagColor: 'bg-blue-500',
    bg: 'from-blue-900 to-indigo-950',
    accent: '#60A5FA',
    content: 'Book your next business trip and receive complimentary Business Class upgrades courtesy of our Emirates partnership, plus 3 nights free at Pan Pacific.',
    cta: 'Book Now',
    date: 'February 2026'
  },
  {
    title: 'Wellness Advantage',
    subtitle: 'Raffles Medical Priority Program',
    tag: 'Health',
    tagColor: 'bg-emerald-500',
    bg: 'from-emerald-950 to-teal-950',
    accent: '#34D399',
    content: 'Complimentary executive health screening worth BDT 45,000 for all Priority Banking Platinum members. Book your appointment today.',
    cta: 'Schedule Now',
    date: 'March 2026'
  }
];

const socialPosts = [
  {
    platform: 'LinkedIn',
    platformIcon: '💼',
    platformColor: 'bg-blue-700',
    author: 'Bank Asia Priority Banking',
    handle: '@BankAsiaPriority',
    date: '2 days ago',
    content: 'We\'re proud to announce our expanded partnership with Visa International, bringing even more exclusive benefits to our Priority Banking members. From Infinite card upgrades to global concierge services — your banking experience just got elevated. 🌐💳',
    tags: ['#PriorityBanking', '#BankAsia', '#VisaInfinite', '#LuxuryBanking'],
    likes: '1.2K',
    comments: '89',
    shares: '234',
    image: '🤝'
  },
  {
    platform: 'Facebook',
    platformIcon: '📘',
    platformColor: 'bg-blue-600',
    author: 'Bank Asia Priority Banking',
    handle: '@BankAsiaPriorityBD',
    date: '5 days ago',
    content: 'Experience banking redefined. Our Priority Alliance network now spans 6 premier partners across hospitality, aviation, healthcare, and financial services — all curated exclusively for you. ✨\n\nVisit your nearest Priority Banking Centre today.',
    tags: ['#BankAsia', '#PriorityAlliance', '#ExclusiveBanking'],
    likes: '3.4K',
    comments: '156',
    shares: '512',
    image: '🏆'
  },
  {
    platform: 'Instagram',
    platformIcon: '📸',
    platformColor: 'bg-gradient-to-br from-purple-600 to-pink-500',
    author: 'bankasia.priority',
    handle: '@bankasia.priority',
    date: '1 week ago',
    content: 'Where luxury meets banking. 🥂 Our partnership with Four Seasons Dhaka means your financial milestones deserve to be celebrated in the most extraordinary way. Exclusive dining credits + spa access = the Priority Banking lifestyle.',
    tags: ['#FourSeasonsDhaka', '#PriorityBanking', '#LuxuryLifestyle', '#BankAsiaElite'],
    likes: '8.7K',
    comments: '312',
    shares: '1.1K',
    image: '🌸'
  }
];

const newsArticles = [
  {
    source: 'The Daily Star',
    date: 'January 15, 2026',
    headline: 'Bank Asia Priority Banking Redefines Wealth Management with Six-Partner Alliance Network',
    excerpt: 'Bank Asia\'s Priority Banking division announces a groundbreaking alliance with six premier partners spanning aviation, hospitality, and healthcare, setting a new benchmark for private banking in Bangladesh.',
    category: 'Finance'
  },
  {
    source: 'Prothom Alo Business',
    date: 'January 28, 2026',
    headline: 'ব্যাংক এশিয়া প্রায়োরিটি ব্যাংকিং-এর নতুন অংশীদারিত্ব কর্মসূচি উন্মোচন',
    excerpt: 'ব্যাংক এশিয়া লিমিটেড তার প্রায়োরিটি ব্যাংকিং বিভাগের জন্য ছয়টি বিশ্বমানের প্রতিষ্ঠানের সাথে কৌশলগত অংশীদারিত্ব চুক্তি স্বাক্ষর করেছে।',
    category: 'ব্যবসা'
  },
  {
    source: 'Financial Express BD',
    date: 'February 3, 2026',
    headline: 'Emirates Business Class Upgrades Now Available for Bank Asia Priority Members',
    excerpt: 'A landmark aviation partnership between Bank Asia and Emirates Airlines will provide Priority Banking customers with exclusive Business Class upgrade privileges on select routes.',
    category: 'Partnerships'
  },
  {
    source: 'Dhaka Tribune',
    date: 'February 12, 2026',
    headline: 'Bank Asia, Raffles Medical Join Forces for Priority Banking Wellness Program',
    excerpt: 'Priority Banking Platinum members will now enjoy complimentary executive health screenings and priority specialist consultations under the new wellness partnership.',
    category: 'Banking'
  }
];

interface Partner { name: string; category: string; logo: string; color: string; description: string; benefits: string[]; since: string; status: string; }
const PartnerCard: FC<{ partner: Partner; index: number }> = ({ partner, index }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative bg-white dark:bg-[#1E293B] rounded-[32px] border border-[#E2E8F0] dark:border-white/10 overflow-hidden group cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-500"
    >
      <div className={`h-2 w-full bg-gradient-to-r ${partner.color}`} />
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="text-5xl">{partner.logo}</div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">
              {partner.status}
            </span>
            <span className="text-[10px] text-[#94A3B8] font-bold">Since {partner.since}</span>
          </div>
        </div>

        <div className="mb-1">
          <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">{partner.category}</p>
        </div>
        <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">{partner.name}</h3>
        <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed mb-6">{partner.description}</p>

        <div className="grid grid-cols-2 gap-2">
          {partner.benefits.map(b => (
            <div key={b} className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-white/5 rounded-xl px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-[10px] font-bold text-[#334155] dark:text-slate-300">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface EDM { title: string; subtitle: string; tag: string; tagColor: string; bg: string; accent: string; content: string; cta: string; date: string; }
const EDMCard: FC<{ edm: EDM; index: number }> = ({ edm, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative bg-gradient-to-br ${edm.bg} rounded-[32px] overflow-hidden p-10 min-h-[340px] flex flex-col justify-between border border-white/10 shadow-2xl`}
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: edm.accent, filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: edm.accent, filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-3 py-1 ${edm.tagColor} text-white text-[9px] font-bold uppercase tracking-widest rounded-full`}>
            {edm.tag}
          </span>
          <span className="text-white/40 text-[10px]">{edm.date}</span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: edm.accent }}>
          {edm.subtitle}
        </p>
        <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{edm.title}</h3>
        <p className="text-white/70 text-sm leading-relaxed max-w-sm">{edm.content}</p>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-8">
        <button 
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-[#0F172A] transition-all hover:scale-105"
          style={{ background: edm.accent }}
        >
          {edm.cta}
          <ChevronRight size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all cursor-pointer">
            <Share2 size={14} />
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all cursor-pointer">
            <Bookmark size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface SocialPost { platform: string; platformIcon: string; platformColor: string; author: string; handle: string; date: string; content: string; tags: string[]; likes: string; comments: string; shares: string; image: string; }
const SocialCard: FC<{ post: SocialPost; index: number }> = ({ post, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="bg-white dark:bg-[#1E293B] rounded-[28px] border border-[#E2E8F0] dark:border-white/10 p-6 shadow-sm hover:shadow-xl transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-2xl ${post.platformColor} flex items-center justify-center text-white text-lg`}>
          {post.platformIcon}
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#0F172A] dark:text-white text-sm">{post.author}</p>
          <p className="text-[10px] text-[#94A3B8]">{post.handle} · {post.date}</p>
        </div>
        <span className="text-2xl">{post.image}</span>
      </div>

      <p className="text-sm text-[#334155] dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line">{post.content}</p>

      <div className="flex flex-wrap gap-1 mb-4">
        {post.tags.map(tag => (
          <span key={tag} className="text-[10px] font-bold text-[#D4AF37] hover:underline cursor-pointer">{tag}</span>
        ))}
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-[#F1F5F9] dark:border-white/10">
        <div className="flex items-center gap-1.5 text-[#64748B] hover:text-red-500 cursor-pointer transition-colors">
          <Heart size={15} />
          <span className="text-[11px] font-bold">{post.likes}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#64748B] hover:text-blue-500 cursor-pointer transition-colors">
          <MessageCircle size={15} />
          <span className="text-[11px] font-bold">{post.comments}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#64748B] hover:text-emerald-500 cursor-pointer transition-colors">
          <Share2 size={15} />
          <span className="text-[11px] font-bold">{post.shares}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PriorityAlliance() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const [activeSection, setActiveSection] = useState<'overview' | 'partners' | 'edm' | 'social' | 'press'>('overview');

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'partners', label: 'Partner Network' },
    { id: 'edm', label: 'Campaign EDMs' },
    { id: 'social', label: 'Social Media' },
    { id: 'press', label: 'Press Coverage' },
  ];

  return (
    <div ref={containerRef} className="space-y-12 pb-16">
      {/* Hero */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative rounded-[40px] overflow-hidden min-h-[320px] flex items-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ background: '#D4AF37' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10" style={{ background: '#6366f1' }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #D4AF37 0px, #D4AF37 1px, transparent 0px, transparent 50%)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row md:items-center gap-8 w-full">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF37] flex items-center justify-center shrink-0">
                  <Handshake size={20} className="text-[#0F172A]" />
                </div>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em] sm:tracking-[0.4em]">Strategic Alliance Program</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white italic mb-4 leading-tight">
                Priority <span className="not-italic text-[#D4AF37]">Alliance</span> Network
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                An elite ecosystem of global partnerships curated exclusively for Bank Asia Priority Banking members — spanning luxury hospitality, aviation, healthcare, lifestyle, and financial services.
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 sm:gap-6 flex-wrap"
          >
            {[
              { icon: Globe, label: 'Global Partners', value: '6+' },
              { icon: Users, label: 'Members Served', value: '12K+' },
              { icon: Award, label: 'Benefits', value: '40+' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#D4AF37] mx-auto mb-2 border border-white/10">
                  <stat.icon size={24} className="sm:w-7 sm:h-7" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Section Nav */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
              activeSection === s.id
                ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-[#0F172A] dark:border-white shadow-lg'
                : 'bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-slate-400 border-[#E2E8F0] dark:border-white/10 hover:border-[#D4AF37]/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview */}
        {activeSection === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Crown, color: 'from-amber-400 to-yellow-600', title: 'Proposition Pillars', desc: 'Our alliance is built on four pillars: Lifestyle, Travel, Wellness, and Financial Privilege — each designed to elevate every aspect of your banking and personal life.' },
                { icon: Gem, color: 'from-purple-500 to-indigo-700', title: 'Member Eligibility', desc: 'Available to all Priority Banking Platinum, Gold, and Silver tier members. Benefits scale with your tier, ensuring every client experiences the pinnacle of personalized service.' },
                { icon: Shield, color: 'from-emerald-500 to-teal-700', title: 'Partnership Governance', desc: 'Every alliance partner undergoes rigorous due diligence, quality benchmarking, and quarterly performance reviews to ensure consistent excellence for our members.' },
                { icon: Zap, color: 'from-blue-500 to-cyan-700', title: 'Activation', desc: 'Benefits are activated automatically upon eligibility. Simply present your Priority Banking card or quote your Member ID to unlock exclusive rates, upgrades, and privileges.' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-[#1E293B] rounded-[28px] border border-[#E2E8F0] dark:border-white/10 p-8 flex gap-6 hover:shadow-xl transition-all"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0`}>
                    <item.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Partnership Agreement Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-[32px] p-6 sm:p-10 flex flex-col md:flex-row md:items-center gap-8 border border-white/10"
            >
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">Partnership Framework</p>
                <h3 className="text-2xl font-bold text-white mb-3 leading-tight">Master Alliance Agreement</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  All partner relationships are governed by Bank Asia's Master Alliance Agreement — a comprehensive framework ensuring data protection, service standards, brand alignment, and member benefit delivery across all partners.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                {['Data Protection Protocol', 'Service Level Agreement', 'Brand Standards Guide', 'Member Benefit Charter'].map(doc => (
                  <div key={doc} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 cursor-pointer hover:bg-white/20 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#0F172A]">
                      <FileDoc />
                    </div>
                    <span className="text-sm font-medium text-white">{doc}</span>
                    <ExternalLink size={14} className="text-white/40 ml-auto" />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Partners */}
        {activeSection === 'partners' && (
          <motion.div key="partners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p, i) => <PartnerCard key={p.name} partner={p} index={i} />)}
          </motion.div>
        )}

        {/* EDM */}
        {activeSection === 'edm' && (
          <motion.div key="edm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {edms.map((edm, i) => <EDMCard key={edm.title} edm={edm} index={i} />)}
            </div>
            <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-[#E2E8F0] dark:border-white/10 p-8 text-center">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Campaign Archive</p>
              <p className="text-[#64748B] dark:text-slate-400 text-sm">All past EDM campaigns are archived in the Marketing Resource Center.</p>
            </div>
          </motion.div>
        )}

        {/* Social */}
        {activeSection === 'social' && (
          <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialPosts.map((post, i) => <SocialCard key={post.platform + i} post={post} index={i} />)}
            </div>
          </motion.div>
        )}

        {/* Press */}
        {activeSection === 'press' && (
          <motion.div key="press" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {newsArticles.map((article, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-[#E2E8F0] dark:border-white/10 p-4 sm:p-6 flex gap-4 sm:gap-6 hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:bg-[#D4AF37]/10 transition-colors">
                  <Newspaper size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">{article.source}</span>
                    <span className="text-[10px] text-[#94A3B8]">·</span>
                    <span className="text-[10px] text-[#94A3B8]">{article.date}</span>
                    <span className="px-2 py-0.5 bg-[#F1F5F9] dark:bg-white/10 text-[#64748B] dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider rounded-full">{article.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2 leading-snug group-hover:text-[#D4AF37] transition-colors">{article.headline}</h3>
                  <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed line-clamp-2">{article.excerpt}</p>
                </div>
                <ExternalLink size={16} className="text-[#94A3B8] group-hover:text-[#D4AF37] transition-colors shrink-0 mt-1" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FileDoc() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
