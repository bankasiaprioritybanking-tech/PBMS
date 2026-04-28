import { useState, useEffect, FormEvent } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Monitor, 
  Bell, 
  Camera,
  Save,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useTheme } from '../lib/ThemeContext';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  branch?: string;
  avatarUrl?: string;
  displayPreferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

export default function Profile() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          if (data.displayPreferences?.theme) {
            setTheme(data.displayPreferences.theme);
          }
        } else {
          // Fallback or create if not exists
          const initialProfile: UserProfile = {
            name: user.displayName || 'Priority User',
            email: user.email || '',
            displayPreferences: { theme: 'light', notifications: true }
          };
          setProfile(initialProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !auth.currentUser) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ...profile,
        updatedAt: serverTimestamp()
      });
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-medium text-[#0F172A]">Account Settings</h1>
          <p className="text-[#64748B]">Personalize your Priority Banking dashboard experience.</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#0F172A] p-8 rounded-[40px] border border-[#E2E8F0] dark:border-white/5 shadow-sm text-center space-y-6 relative overflow-hidden group">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-[48px] bg-[#F1F5F9] dark:bg-white/5 mx-auto flex items-center justify-center text-[#0F172A] dark:text-[#D4AF37] font-bold text-4xl border-2 border-[#F1F5F9] dark:border-white/5 overflow-hidden">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    profile?.name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 p-3 bg-[#0F172A] text-[#D4AF37] rounded-2xl shadow-xl hover:scale-110 transition-transform border-4 border-white"
                >
                  <Camera size={18} />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">{profile?.name}</h3>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">{profile?.designation || 'Relationship Manager'}</p>
              </div>
              <div className="pt-6 border-t border-[#F1F5F9] dark:border-white/5 flex justify-center gap-4 text-[#94A3B8]">
                <Shield size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Access</span>
              </div>
            </div>

            <div className="bg-[#0F172A] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl" />
              <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#D4AF37] mb-4">Security Level</h4>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-2 bg-emerald-500 h-8 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <div>
                  <p className="text-xs font-bold">Two-Factor Active</p>
                  <p className="text-[9px] text-[#94A3B8] uppercase">Last verified 2h ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#0F172A] p-10 rounded-[48px] border border-[#E2E8F0] dark:border-white/5 shadow-sm space-y-10">
              {/* Profile Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-3">
                  <User size={20} className="text-[#D4AF37]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Full Name</label>
                    <input 
                      value={profile?.name || ''}
                      onChange={(e) => setProfile(p => p ? {...p, name: e.target.value} : null)}
                      className="w-full px-6 py-4 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/5 rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Designation</label>
                    <input 
                      value={profile?.designation || ''}
                      onChange={(e) => setProfile(p => p ? {...p, designation: e.target.value} : null)}
                      className="w-full px-6 py-4 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/5 rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                      <input 
                        disabled
                        value={profile?.email || ''}
                        className="w-full pl-14 pr-6 py-4 bg-[#F1F5F9] dark:bg-white/5 border border-[#E2E8F0] dark:border-white/5 rounded-2xl text-sm font-medium text-[#94A3B8] cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                      <input 
                        value={profile?.phone || ''}
                        onChange={(e) => setProfile(p => p ? {...p, phone: e.target.value} : null)}
                        placeholder="+880 1XXX XXXXXX"
                        className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/5 rounded-2xl outline-none focus:border-[#D4AF37] transition-all text-sm font-medium dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Preferences */}
              <div className="space-y-6 pt-6 border-t border-[#F1F5F9] dark:border-white/5">
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-3">
                  <Monitor size={20} className="text-[#D4AF37]" />
                  Display Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Active Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'system'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setProfile(p => p ? {...p, displayPreferences: {...p.displayPreferences!, theme: t as any}} : null);
                            setTheme(t as any);
                          }}
                          className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            (profile?.displayPreferences?.theme || 'system') === t 
                              ? 'bg-[#0F172A] text-[#D4AF37] border-[#0F172A] dark:bg-[#D4AF37] dark:text-[#0F172A] dark:border-[#D4AF37]' 
                              : 'bg-white dark:bg-white/5 text-[#64748B] border-[#E2E8F0] dark:border-white/5 hover:border-[#D4AF37]/30'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-[#F8FAFC] dark:bg-white/5 rounded-[32px] border border-[#F1F5F9] dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-[#0F172A] rounded-xl flex items-center justify-center text-[#D4AF37] shadow-sm">
                        <Bell size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E293B] dark:text-white">Notifications</p>
                        <p className="text-[10px] text-[#64748B] uppercase tracking-wider">System Alerts</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfile(p => p ? {...p, displayPreferences: {...p.displayPreferences!, notifications: !p.displayPreferences!.notifications}} : null)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${profile?.displayPreferences?.notifications ? 'bg-emerald-500' : 'bg-[#E2E8F0]'}`}
                    >
                      <motion.div 
                        animate={{ x: profile?.displayPreferences?.notifications ? 26 : 2 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-10 flex items-center justify-between gap-6">
                <AnimatePresence>
                  {successMessage && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 text-emerald-600 font-bold text-xs"
                    >
                      <CheckCircle size={16} />
                      Profile synchronized successfully
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  disabled={isSaving}
                  className="ml-auto flex items-center gap-3 bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-2xl hover:shadow-[#0F172A]/20 transition-all group disabled:opacity-70"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} className="group-hover:scale-110 transition-transform" />
                  )}
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
