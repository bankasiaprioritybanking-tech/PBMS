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

// MINIMAL & CLEAN VIBE - Neutral grays, whites, professional
export default function LoginMinimalClean() {
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
      case 1: return { label: 'Weak', color: 'bg-red-400', text: 'text-red-600' };
      case 2: return { label: 'Medium', color: 'bg-yellow-400', text: 'text-yellow-600' };
      case 3: return { label: 'Strong', color: 'bg-green-500', text: 'text-green-600' };
      case 4: return { label: 'V. Strong', color: 'bg-teal-500', text: 'text-teal-600' };
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Minimal geometric accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-200/20 rounded-full blur-3xl" />

      <div className="w-full max-w-[460px] relative z-10 flex flex-col gap-10">
        {/* Minimal branding */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="relative inline-block">
             <div className="relative w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-[20px] mx-auto flex items-center justify-center text-white font-bold text-7xl shadow-lg border-2 border-gray-300 transform hover:scale-105 transition-transform">
               <span className="drop-shadow-lg">P</span>
             </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl tracking-tight text-gray-900 flex flex-col items-center justify-center gap-1">
              <span className="font-sans font-bold text-5xl uppercase tracking-wider">Priority</span> 
              <span className="text-gray-600 font-medium text-3xl uppercase tracking-wider -mt-1">Banking</span>
            </h1>
            <div className="h-1 w-16 bg-gray-300 mx-auto" />
            <p className="text-gray-500 text-[11px] font-medium uppercase tracking-widest">Authentication Portal</p>
          </div>
        </motion.div>

        {/* Clean login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-12 rounded-[16px] shadow-sm border border-gray-200 relative overflow-hidden"
        >
          
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
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign In</h2>
                  <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@bankasia-bd.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-gray-400 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
                      <button type="button" onClick={() => setForgotPasswordStep(1)} className="text-xs font-semibold text-gray-600 hover:text-gray-900 uppercase tracking-wider">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-gray-400 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ChevronRight size={16} />
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
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto flex items-center justify-center text-gray-700">
                    <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Update Password</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mx-auto max-w-xs">Create a new password to continue</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">New Password</label>
                    <input 
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-gray-400 transition-all text-sm font-medium text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Confirm Password</label>
                    <input 
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-gray-400 transition-all text-sm font-medium text-gray-900"
                    />
                  </div>
                  <button 
                    disabled={isLoading}
                    className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-70"
                  >
                     {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Update & Continue"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Minimal footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
           <span className="uppercase tracking-widest font-medium">Priority Banking</span>
           <span className="uppercase tracking-widest font-medium">v1.0</span>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-2">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Bank Asia PLC • 2026</p>
      </div>
    </div>
  );
}
