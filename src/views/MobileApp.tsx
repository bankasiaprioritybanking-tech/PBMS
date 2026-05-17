import { motion } from 'motion/react';
import { type FC } from 'react';
import { 
  Smartphone, Apple, Star, Shield, Zap, Bell, 
  CreditCard, TrendingUp, Users, Lock, ChevronRight,
  CheckCircle2, Download, Globe, MessageSquare
} from 'lucide-react';

const features = [
  { icon: CreditCard, title: 'Instant Transfers', desc: 'Zero-fee transfers between Priority Banking accounts in seconds', color: 'bg-amber-50 dark:bg-amber-900/20 text-[#D4AF37]' },
  { icon: TrendingUp, title: 'Portfolio Overview', desc: 'Real-time portfolio analytics and wealth tracking dashboard', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Customizable push notifications for transactions and market events', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  { icon: Lock, title: 'Biometric Security', desc: 'Face ID, fingerprint, and PIN security with 256-bit encryption', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
  { icon: Users, title: 'RM Connect', desc: 'Direct in-app messaging with your dedicated Relationship Manager', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' },
  { icon: Globe, title: 'Forex & Remittance', desc: 'Live FX rates and international remittance with competitive rates', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' },
];

const screenshots = [
  { label: 'Dashboard', color: 'from-[#0F172A] to-[#1E293B]', accent: '#D4AF37', content: ['Portfolio: ৳ 42.8L', 'Today +1.2%', 'VAS Requests: 3', 'Appointments: 2 Today'] },
  { label: 'Payments', color: 'from-blue-900 to-indigo-950', accent: '#60A5FA', content: ['Quick Transfer', 'Bill Pay', 'FX Exchange', 'QR Pay'] },
  { label: 'Analytics', color: 'from-emerald-900 to-teal-950', accent: '#34D399', content: ['Savings Growth ↑12%', 'Investment ROI 8.4%', 'Expense Tracker', 'Goal Progress'] },
];

const reviews = [
  { name: 'Rafiqul Islam', role: 'Priority Gold Member', rating: 5, text: 'The app is incredibly smooth. Being able to message my RM directly and see all my accounts in one place is exactly what I needed.' },
  { name: 'Fatema Begum', role: 'Priority Platinum Member', rating: 5, text: 'The biometric login and instant notification features give me complete peace of mind. Best banking app in Bangladesh.' },
  { name: 'Asif Rahman', role: 'Priority Silver Member', rating: 5, text: 'FX rates are excellent and the transfer speed is unmatched. The Priority Banking app has changed how I manage my finances.' },
];

interface AppScreen { label: string; color: string; accent: string; content: string[]; }
const PhoneMockup: FC<{ screen: AppScreen; index: number }> = ({ screen, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 + index * 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="relative"
      style={{ marginTop: index === 1 ? '-32px' : index === 2 ? '-16px' : 0 }}
    >
      <div className={`relative w-52 rounded-[44px] bg-gradient-to-b ${screen.color} shadow-2xl shadow-black/40 overflow-hidden border-4 border-white/10`}>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-10" />
        <div className="pt-12 pb-8 px-4 min-h-[400px]">
          <div className="text-center mb-4">
            <p className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: screen.accent }}>Priority Banking</p>
            <p className="text-lg font-bold text-white">{screen.label}</p>
          </div>
          <div className="space-y-2">
            {screen.content.map(item => (
              <div key={item} className="bg-white/10 rounded-2xl px-3 py-2.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: screen.accent }} />
                <span className="text-white/80 text-[10px] font-medium">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="bg-white/5 rounded-xl h-8 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full" />
      </div>
    </motion.div>
  );
}

export default function MobileApp() {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-[28px] sm:rounded-[40px] overflow-hidden p-6 sm:p-10 lg:p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[100px]" style={{ background: '#D4AF37' }} />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-[80px]" style={{ background: '#6366f1' }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 w-full">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-4">
                <Smartphone size={20} className="text-[#D4AF37]" />
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.4em]">Mobile Banking App</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white italic mb-4 leading-tight">
                Priority Banking<br /><span className="not-italic text-[#D4AF37]">In Your Pocket</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md">
                The Bank Asia Priority Banking app brings the full power of private banking to your fingertips — secure, intelligent, and beautifully designed for iOS and Android.
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 bg-white text-[#0F172A] px-5 py-3 sm:px-6 sm:py-4 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl transition-all"
                >
                  <Apple size={22} />
                  <div>
                    <p className="text-[9px] text-[#64748B] leading-none mb-0.5">Download on the</p>
                    <p className="text-sm font-bold leading-none">App Store</p>
                  </div>
                </motion.a>

                <motion.a
                  href="#"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 bg-[#D4AF37] text-[#0F172A] px-5 py-3 sm:px-6 sm:py-4 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl transition-all"
                >
                  <PlayIcon />
                  <div>
                    <p className="text-[9px] text-[#0F172A]/60 leading-none mb-0.5">Get it on</p>
                    <p className="text-sm font-bold leading-none">Google Play</p>
                  </div>
                </motion.a>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 mt-8">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-[#D4AF37] fill-[#D4AF37]" />)}
                  </div>
                  <p className="text-white font-bold text-sm">4.9</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">App Store</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-white font-bold text-lg">50K+</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">Downloads</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-white font-bold text-lg">99.9%</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">Uptime</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Phone mockups — show 1 on mobile, 2 on sm, 3 on lg */}
          <div className="flex items-end gap-4 shrink-0">
            {screenshots.map((screen, i) => (
              <div
                key={screen.label}
                className={i === 0 ? 'block' : i === 1 ? 'hidden sm:block' : 'hidden lg:block'}
              >
                <PhoneMockup screen={screen} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.4em] mb-2">Capabilities</p>
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white">Everything You Need</h2>
          <p className="text-[#64748B] dark:text-slate-400 text-sm mt-2 max-w-md mx-auto">Designed to make every banking interaction fast, secure, and effortless.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-[#1E293B] rounded-[28px] border border-[#E2E8F0] dark:border-white/10 p-8 hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl ${feat.color} flex items-center justify-center mb-4`}>
                <feat.icon size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[32px] p-10 border border-white/10"
      >
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Bank-Grade Security</p>
                <h3 className="text-xl font-bold text-white">Built for Protection</h3>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">Your security is our highest priority. The app employs military-grade encryption, biometric authentication, and real-time fraud monitoring to keep your assets safe.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {['256-bit Encryption', 'Biometric Auth', 'Real-time Monitoring', 'PCI DSS Compliant', '2FA Security', 'Secure Enclave'].map(item => (
              <div key={item} className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-3">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span className="text-white/80 text-[11px] font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Reviews */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.4em] mb-2">Member Reviews</p>
          <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white">What Our Members Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-[#1E293B] rounded-[28px] border border-[#E2E8F0] dark:border-white/10 p-8 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                ))}
              </div>
              <p className="text-sm text-[#334155] dark:text-slate-300 leading-relaxed mb-6 italic">"{review.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F172A] dark:bg-white/10 flex items-center justify-center font-bold text-[#D4AF37] text-xs">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white">{review.name}</p>
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Download CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-[32px] p-12 text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-[#0F172A] flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Download size={36} className="text-[#D4AF37]" />
        </div>
        <h2 className="text-3xl font-bold text-[#0F172A] mb-3">Download Today</h2>
        <p className="text-[#0F172A]/70 text-sm mb-8 max-w-md mx-auto">Join 50,000+ Priority Banking members already experiencing banking excellence on mobile.</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <motion.a href="#" whileHover={{ scale: 1.05 }} className="flex items-center gap-3 bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all">
            <Apple size={22} />
            App Store
          </motion.a>
          <motion.a href="#" whileHover={{ scale: 1.05 }} className="flex items-center gap-3 bg-white text-[#0F172A] px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all">
            <PlayIcon dark />
            Google Play
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

function PlayIcon({ dark }: { dark?: boolean }) {
  return (
    <svg width="20" height="22" viewBox="0 0 24 24" fill={dark ? '#0F172A' : 'currentColor'}>
      <path d="M5 3l14 9-14 9V3z" />
    </svg>
  );
}
