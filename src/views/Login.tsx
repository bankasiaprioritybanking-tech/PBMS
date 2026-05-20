import { 
  Lock, 
  User as UserIcon, 
  ChevronRight, 
  ShieldCheck,
  Building2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  updatePassword, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function Login({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState(() => localStorage.getItem('pbms_user_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('pbms_user_email'));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState(1); // 1: Credentials, 2: Change Password (First/Expired)
  
  // Persist email
  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem('pbms_user_email', email);
    } else {
      localStorage.removeItem('pbms_user_email');
    }
  }, [rememberMe, email]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); 
  const navigate = useNavigate();

  // Domain lock constant
  const ALLOWED_DOMAIN = 'bankasia-bd.com';
  const ADMIN_EXCEPTION = 'bankasia.prioritybanking@gmail.com';

  useEffect(() => {
    // Check if user is already logged in and needs redirect or has expired password
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const lastChanged = data.passwordLastChanged?.toDate() || new Date(0);
            const daysSinceChange = (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24);
            
            if (data.mustChangePassword || daysSinceChange > 30) {
              setStep(2);
            } else {
              localStorage.setItem('pbms_auth', 'true');
              if (onLogin) onLogin();
              navigate('/');
            }
          }
        } catch (err) {
          console.error("Auth check error:", err);
        }
      }
    });
    return unsubscribe;
  }, [navigate, onLogin]);

  const handleForgotPassword = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (forgotPasswordStep === 1) {
        setForgotPasswordStep(2);
      } else {
        setForgotPasswordStep(0);
        setStep(1);
      }
    }, 1000);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (pass: string) => {
    // 1 Cap, 1 small, 1 numeric, min 8 chars
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(pass);
  };

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return 1; // Weak
    if (score <= 4) return 2; // Medium
    if (score <= 5) return 3; // Strong
    return 4; // Very Strong
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1: return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
      case 2: return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3: return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
      case 4: return { label: 'V. Strong', color: 'bg-indigo-500', text: 'text-indigo-500' };
      default: return { label: '', color: 'bg-gray-200', text: 'text-gray-400' };
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // Validate Domain
    if (!email.endsWith(ALLOWED_DOMAIN) && email !== ADMIN_EXCEPTION) {
      setError(`Access restricted to @${ALLOWED_DOMAIN} accounts.`);
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        setError("Unauthorized user profile. Please contact IT.");
        setIsLoading(false);
        return;
      }

      const data = userDoc.data();
      const lastChanged = data.passwordLastChanged?.toDate() || new Date(0);
      const daysSinceChange = (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24);

      if (data.mustChangePassword || daysSinceChange > 30) {
        setStep(2);
      } else {
        localStorage.setItem('pbms_auth', 'true');
        if (onLogin) onLogin();
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 number.");
      setIsLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        await updateDoc(doc(db, 'users', user.uid), {
          mustChangePassword: false,
          passwordLastChanged: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        localStorage.setItem('pbms_auth', 'true');
        if (onLogin) onLogin();
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-black">
         <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-[#D4AF37] rounded-full blur-[180px] opacity-5 animate-pulse" />
         <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-[#D4AF37] rounded-full blur-[180px] opacity-5 animate-pulse" />
      </div>

      <div className="w-full max-w-[460px] relative z-10 flex flex-col gap-10">
        {/* Branding Section - Updated to match screenshot */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-[#D4AF37] rounded-[32px] blur-3xl opacity-20" />
             <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
               <img src="/logo.png" alt="Bank Asia Logo" className="w-full h-full object-contain" />
             </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl tracking-tight text-white flex flex-col items-center justify-center gap-1">
              <span className="font-serif italic text-5xl uppercase tracking-[0.1em]">Priority</span> 
              <span className="text-[#D4AF37] font-bold text-3xl uppercase tracking-wider -mt-1">Banking</span>
            </h1>
            <p className="text-[#94A3B8] text-[9px] font-bold uppercase tracking-[0.6em] opacity-80">The Pinnacle of Personalized Banking</p>
          </div>
        </motion.div>

        {/* Login Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-12 rounded-[56px] shadow-2xl border border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
          
          <AnimatePresence mode="wait">
            {forgotPasswordStep === 1 ? (
              <motion.form
                key="forgot-step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleForgotPassword}
                className="space-y-8"
              >
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Recover Access</h2>
                    <p className="text-sm text-[#64748B]">Enter credentials to reset</p>
                  </div>
                  <div className="space-y-6">
                    {error && (
                      <div role="alert" className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium border border-red-100">
                        <AlertCircle size={14} />
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">User ID</label>
                      <input required className="w-full px-7 py-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Email Address</label>
                      <input type="email" required className="w-full px-7 py-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-[#0F172A] text-white py-5 rounded-[24px] font-bold">
                    {isLoading ? "Processing..." : "Next"}
                  </button>
              </motion.form>
            ) : forgotPasswordStep === 2 ? (
                <motion.form
                  key="forgot-step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleForgotPassword}
                  className="space-y-8"
                >
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Set New Password</h2>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end px-2">
                          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">New Password</label>
                          {newPassword && (
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-black uppercase tracking-widest ${getStrengthLabel(calculateStrength(newPassword)).text}`}>
                                {getStrengthLabel(calculateStrength(newPassword)).label}
                              </span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4].map((step) => (
                                  <div 
                                    key={step}
                                    className={`w-3 h-1 rounded-full transition-all duration-500 ${
                                      calculateStrength(newPassword) >= step 
                                        ? getStrengthLabel(calculateStrength(newPassword)).color 
                                        : 'bg-gray-100'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <input 
                          type="password" 
                          required 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-7 py-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none focus:border-[#D4AF37] transition-all" 
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-2">
                          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Confirm New Password</label>
                          {confirmPassword && newPassword === confirmPassword && (
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Match Verified</span>
                          )}
                        </div>
                        <input 
                          type="password" 
                          required 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-7 py-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none focus:border-[#D4AF37] transition-all" 
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-[#0F172A] text-white py-5 rounded-[24px] font-bold">
                      {isLoading ? "Reseting..." : "Submit Reset"}
                    </button>
                </motion.form>
            ) : step === 1 ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight uppercase">LOGIN</h2>
                  <p className="text-sm text-[#64748B]">Authenticated system entry for relationship staff</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Access Username</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                      <input 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ex: user@bankasia-bd.com"
                        className="w-full pl-14 pr-6 py-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Secure Password</label>
                      <button type="button" onClick={() => setForgotPasswordStep(1)} className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest hover:underline">Forgot Access?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        aria-label="Password"
                        className="w-full pl-14 pr-16 py-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-[#64748B]">Remember Me</label>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-[#0F172A] text-white py-5 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all group disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-[#D4AF37] rounded-full animate-spin" />
                  ) : (
                    <>
                      Enter Secure Environment
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-[#D4AF37]" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="first-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-3xl mx-auto flex items-center justify-center text-[#D4AF37] mb-2 border border-[#D4AF37]/20">
                    <ShieldCheck size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Security Protocol</h2>
                  <p className="text-sm text-[#64748B] leading-relaxed mx-auto max-w-[280px]">Your credentials have expired or this is your first session. Please establish a new secure password.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium border border-red-100">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end px-2">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Establish New Password</label>
                      {newPassword && (
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest ${getStrengthLabel(calculateStrength(newPassword)).text}`}>
                            {getStrengthLabel(calculateStrength(newPassword)).label}
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((step) => (
                              <div 
                                key={step}
                                className={`w-3 h-1 rounded-full transition-all duration-500 ${
                                  calculateStrength(newPassword) >= step 
                                    ? getStrengthLabel(calculateStrength(newPassword)).color 
                                    : 'bg-gray-100'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <input 
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars + uppercase + number"
                      className="w-full px-7 py-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Verify Password</label>
                      {confirmPassword && newPassword === confirmPassword && (
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Match Verified</span>
                      )}
                    </div>
                    <input 
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-7 py-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-sm font-medium"
                    />
                  </div>
                  <button 
                    disabled={isLoading}
                    className="w-full bg-[#0F172A] text-white py-5 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 hover:shadow-2xl transition-all disabled:opacity-70"
                  >
                     {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-[#D4AF37] rounded-full animate-spin" />
                    ) : (
                      "Activate Elite Account"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Status Indicators */}
        <div className="flex items-center justify-between px-8">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Authenticating Elite Access...</span>
           </div>
           <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-[0.2em]">System ID // B8192</p>
        </div>
      </div>
      
      {/* Bottom Legal Section */}
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-2">
        <Building2 size={16} className="text-white/10" />
        <p className="text-[10px] text-white/20 font-medium uppercase tracking-[0.3em]">Bank Asia PLC • Priority Banking Division • 2026</p>
      </div>
    </div>
  );
}
