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

// MODERN TECH VIBE - Blues, Purples, Contemporary
export default function LoginModernTech() {
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
      case 1: return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
      case 2: return { label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-500' };
      case 3: return { label: 'Strong', color: 'bg-blue-500', text: 'text-blue-500' };
      case 4: return { label: 'V. Strong', color: 'bg-cyan-500', text: 'text-cyan-500' };
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Modern gradient background */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px] opacity-10 animate-pulse" />
         <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[180px] opacity-10 animate-pulse" />
      </div>

      <div className="w-full max-w-[460px] relative z-10 flex flex-col gap-10">
        {/* Modern branding */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-blue-500 rounded-[32px] blur-3xl opacity-15" />
             <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-600 rounded-[40px] mx-auto flex items-center justify-center text-white font-bold text-7xl shadow-2xl shadow-blue-500/40 border-4 border-white/20 transform hover:scale-105 transition-transform">
               <span className="drop-shadow-lg">P</span>
               <div className="absolute inset-2 border border-white/30 rounded-[32px] pointer-events-none" />
             </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl tracking-tight text-white flex flex-col items-center justify-center gap-1">
              <span className="font-sans font-bold text-5xl uppercase tracking-[0.1em]">Priority</span> 
              <span className="text-cyan-400 font-bold text-3xl uppercase tracking-wider -mt-1">Banking</span>
            </h1>
            <p className="text-blue-300 text-[9px] font-bold uppercase tracking-[0.6em] opacity-80">Modern Banking Platform</p>
          </div>
        </motion.div>

        {/* Modern login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/40 backdrop-blur-xl p-12 rounded-[32px] shadow-2xl border border-blue-500/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
          
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
                  <h2 className="text-2xl font-bold text-white tracking-tight uppercase">LOGIN</h2>
                  <p className="text-sm text-blue-300">Enter your credentials to continue</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em] ml-2">Access Username</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                      <input 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@bankasia-bd.com"
                        className="w-full pl-14 pr-6 py-5 bg-slate-800/50 border border-blue-500/30 rounded-[20px] outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 transition-all text-sm font-medium text-white placeholder-blue-300/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em]">Secure Password</label>
                      <button type="button" onClick={() => setForgotPasswordStep(1)} className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest hover:underline">Forgot Access?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-6 py-5 bg-slate-800/50 border border-blue-500/30 rounded-[20px] outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 transition-all text-sm font-medium text-white placeholder-blue-300/50"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-5 rounded-[20px] font-bold text-sm flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all group disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      Enter Secure Environment
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
                  <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl mx-auto flex items-center justify-center text-cyan-400 mb-2 border border-cyan-500/20">
                    <ShieldCheck size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Security Protocol</h2>
                  <p className="text-sm text-blue-300 leading-relaxed mx-auto max-w-[280px]">Update your password to continue</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs font-medium border border-red-500/20">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em]">New Password</label>
                    <input 
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-7 py-5 bg-slate-800/50 border border-blue-500/30 rounded-[20px] outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 transition-all text-sm font-medium text-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em]">Confirm Password</label>
                    <input 
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-7 py-5 bg-slate-800/50 border border-blue-500/30 rounded-[20px] outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 transition-all text-sm font-medium text-white"
                    />
                  </div>
                  <button 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-5 rounded-[20px] font-bold text-sm flex items-center justify-center gap-3 hover:shadow-2xl transition-all disabled:opacity-70"
                  >
                     {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Modern footer */}
        <div className="flex items-center justify-between px-8">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.2em]">System Active</span>
           </div>
           <p className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.2em]">v2.0</p>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-2">
        <Building2 size={16} className="text-white/5" />
        <p className="text-[10px] text-white/20 font-medium uppercase tracking-[0.3em]">Bank Asia PLC • Priority Banking Division • 2026</p>
      </div>
    </div>
  );
}
