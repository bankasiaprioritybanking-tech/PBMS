import { 
  Lock, 
  User as UserIcon, 
  ChevronRight, 
  ShieldCheck,
  Building2,
  AlertCircle
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
import { useAuth } from '../lib/AuthContext';

// WARM & APPROACHABLE VIBE - Oranges, warm browns, friendly
export default function LoginWarmApproach() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); 
  const navigate = useNavigate();
  const { user } = useAuth();

  const ALLOWED_DOMAIN = 'bankasia-bd.com';
  const ADMIN_EXCEPTION = 'bankasia.prioritybanking@gmail.com';

  useEffect(() => {
    if (user) {
      const checkUserStatus = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const lastChanged = data.passwordLastChanged?.toDate() || new Date(0);
            const daysSinceChange = (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24);
            
            if (data.mustChangePassword || daysSinceChange > 30) {
              setStep(2);
            } else {
              navigate('/');
            }
          }
        } catch (err) {
          console.error("Auth check error:", err);
        }
      };
      checkUserStatus();
    }
  }, [user, navigate]);

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

  const validatePassword = (pass: string) => {
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
    if (score <= 2) return 1;
    if (score <= 4) return 2;
    if (score <= 5) return 3;
    return 4;
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1: return { label: 'Weak', color: 'bg-orange-400', text: 'text-orange-600' };
      case 2: return { label: 'Medium', color: 'bg-amber-400', text: 'text-amber-600' };
      case 3: return { label: 'Strong', color: 'bg-green-500', text: 'text-green-600' };
      case 4: return { label: 'V. Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
      default: return { label: '', color: 'bg-gray-200', text: 'text-gray-400' };
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
        
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Warm background ambience */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-amber-400 rounded-full blur-[180px] opacity-10 animate-pulse" />
         <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-orange-400 rounded-full blur-[180px] opacity-10 animate-pulse" />
      </div>

      <div className="w-full max-w-[460px] relative z-10 flex flex-col gap-10">
        {/* Warm branding */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-amber-500 rounded-[32px] blur-3xl opacity-20" />
             <div className="relative w-32 h-32 bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-500 rounded-[40px] mx-auto flex items-center justify-center text-white font-bold text-7xl shadow-2xl shadow-amber-400/40 border-4 border-white/30 transform hover:scale-105 transition-transform">
               <span className="drop-shadow-lg">P</span>
               <div className="absolute inset-2 border border-white/40 rounded-[32px] pointer-events-none" />
             </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl tracking-tight text-amber-900 flex flex-col items-center justify-center gap-1">
              <span className="font-serif italic text-5xl">Priority</span> 
              <span className="text-orange-600 font-bold text-3xl uppercase tracking-wider -mt-1">Banking</span>
            </h1>
            <p className="text-amber-700 text-[9px] font-bold uppercase tracking-[0.6em] opacity-80">Trusted Banking Experience</p>
          </div>
        </motion.div>

        {/* Warm login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm p-12 rounded-[48px] shadow-2xl border border-orange-200/50 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-amber-900 tracking-tight uppercase">Welcome Back</h2>
                  <p className="text-sm text-amber-700">Sign in to your banking account</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em] ml-2">Email Address</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                      <input 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@bankasia-bd.com"
                        className="w-full pl-14 pr-6 py-5 bg-amber-50 border border-amber-200 rounded-[24px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-200/50 transition-all text-sm font-medium text-amber-900 placeholder-amber-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em]">Password</label>
                      <button type="button" onClick={() => setForgotPasswordStep(1)} className="text-[9px] font-bold text-orange-600 uppercase tracking-widest hover:underline">Need Help?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-6 py-5 bg-amber-50 border border-amber-200 rounded-[24px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-200/50 transition-all text-sm font-medium text-amber-900 placeholder-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-5 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-orange-300/30 transition-all group disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In Securely
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-white" />
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
                  <div className="w-20 h-20 bg-orange-100 rounded-3xl mx-auto flex items-center justify-center text-orange-600 mb-2 border border-orange-200">
                    <ShieldCheck size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-amber-900 tracking-tight">Update Your Password</h2>
                  <p className="text-sm text-amber-700 leading-relaxed mx-auto max-w-[280px]">Create a new secure password to continue</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-200">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em]">New Password</label>
                    <input 
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-7 py-5 bg-amber-50 border border-amber-200 rounded-[24px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-200/50 transition-all text-sm font-medium text-amber-900"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.2em]">Confirm Password</label>
                    <input 
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-7 py-5 bg-amber-50 border border-amber-200 rounded-[24px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-200/50 transition-all text-sm font-medium text-amber-900"
                    />
                  </div>
                  <button 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-5 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 hover:shadow-2xl transition-all disabled:opacity-70"
                  >
                     {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Confirm & Continue"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Warm footer */}
        <div className="flex items-center justify-between px-8">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-amber-700 uppercase tracking-[0.2em]">Ready to help</span>
           </div>
           <p className="text-[9px] font-bold text-amber-700 uppercase tracking-[0.2em]">Est. 2010</p>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-2">
        <Building2 size={16} className="text-amber-900/10" />
        <p className="text-[10px] text-amber-800/30 font-medium uppercase tracking-[0.3em]">Bank Asia PLC • Priority Banking Division • 2026</p>
      </div>
    </div>
  );
}
