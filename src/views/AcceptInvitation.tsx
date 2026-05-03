import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User as UserIcon, ShieldCheck, AlertCircle, CheckCircle2, Building2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  updatePassword
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const validatePassword = (pass: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass);

const calculateStrength = (pass: string) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score++;
  if (pass.length >= 12) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (score <= 2) return 1;
  if (score <= 4) return 2;
  if (score <= 5) return 3;
  return 4;
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

export default function AcceptInvitation() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [inviteeName, setInviteeName] = useState('');

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const tempHash = await sha256(tempPassword);

      const invitesRef = collection(db, 'invitations');
      const q = query(
        invitesRef,
        where('email', '==', email.toLowerCase().trim()),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setError('No pending invitation found for this email address. Please contact your administrator.');
        setIsLoading(false);
        return;
      }

      let matchedDoc: any = null;
      snap.forEach(d => {
        const data = d.data();
        if (data.tempPasswordHash === tempHash) {
          // expiresAt may be a Firestore Timestamp or an ISO string (server-written)
          let expiresAt: Date;
          if (data.expiresAt?.toDate) {
            expiresAt = data.expiresAt.toDate();
          } else if (typeof data.expiresAt === 'string') {
            expiresAt = new Date(data.expiresAt);
          } else {
            expiresAt = new Date(0);
          }
          if (expiresAt > new Date()) {
            matchedDoc = { id: d.id, ...data };
          }
        }
      });

      if (!matchedDoc) {
        setError('Invalid temporary password or invitation has expired. Please contact your administrator.');
        setIsLoading(false);
        return;
      }

      setInvitationId(matchedDoc.id);
      setInviteeName(matchedDoc.name);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 number.');
      setIsLoading(false);
      return;
    }

    try {
      if (!invitationId) throw new Error('Invitation session expired. Please start over.');

      const inviteDocSnap = await getDocs(query(
        collection(db, 'invitations'),
        where('status', '==', 'pending')
      ));
      const matchedInviteDoc = inviteDocSnap.docs.find(d => d.id === invitationId);
      if (!matchedInviteDoc) throw new Error('Invitation no longer valid.');

      const inviteData = matchedInviteDoc.data();

      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), tempPassword);
      const user = userCredential.user;

      await updatePassword(user, newPassword);

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        userId: inviteData.userId || '',
        name: inviteData.name,
        email: inviteData.email,
        phone: inviteData.phone || '',
        branch: inviteData.branch || '',
        division: inviteData.division || '',
        functionalDesignation: inviteData.functionalDesignation || '',
        roleIds: inviteData.roleIds || [],
        status: 'ACTIVE',
        isLocked: false,
        mustChangePassword: false,
        passwordLastChanged: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'invitations', invitationId), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'auditLogs'), {
        userId: user.uid,
        action: 'accept_invitation',
        description: `${inviteData.name} accepted invitation and activated account.`,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Temporary password mismatch. Please contact your administrator.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No Firebase account found. The invitation may not have been processed correctly. Please contact IT.');
      } else {
        setError(err.message || 'Failed to activate account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const strengthScore = calculateStrength(newPassword);
  const strengthInfo = getStrengthLabel(strengthScore);

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-[#D4AF37] rounded-full blur-[180px] opacity-10 animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[180px] opacity-5 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-[#D4AF37] rounded-full blur-[200px] opacity-5" />
      </div>

      <div className="w-full max-w-[460px] relative z-10 flex flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#D4AF37] rounded-[32px] blur-3xl opacity-20" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#D4AF37] via-[#F5E0A3] to-[#B8860B] rounded-[32px] mx-auto flex items-center justify-center text-[#0F172A] shadow-2xl shadow-[#D4AF37]/40 border-4 border-white/20">
              <ShieldCheck size={40} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl tracking-tight text-white font-bold">Accept Invitation</h1>
            <p className="text-[#94A3B8] text-sm">Bank Asia Priority Banking</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-10 rounded-[48px] shadow-2xl border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A]">Welcome Aboard!</h2>
                  <p className="text-sm text-[#64748B] mt-2">Your account has been activated successfully. You may now sign in.</p>
                </div>
                <Link
                  to="/"
                  className="block w-full bg-[#0F172A] text-white py-5 rounded-[24px] font-bold text-sm text-center hover:shadow-2xl transition-all"
                >
                  Go to Login
                </Link>
              </motion.div>
            ) : step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerify}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-[#0F172A]">Verify Your Invitation</h2>
                  <p className="text-sm text-[#64748B]">Enter your email and the temporary password provided by your administrator.</p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-100">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Email Address</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@bankasia-bd.com"
                        className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] ml-2">Temporary Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                      <input
                        required
                        type="password"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        placeholder="Provided by administrator"
                        className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0F172A] text-white py-5 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all group disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-[#D4AF37] rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify Invitation
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-[#D4AF37]" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSetPassword}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-[#0F172A]">Set Your Password</h2>
                  <p className="text-sm text-[#64748B]">
                    Welcome, <span className="font-bold text-[#0F172A]">{inviteeName}</span>. Please establish your personal password.
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-100">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end px-2">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">New Password</label>
                      {newPassword && (
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest ${strengthInfo.text}`}>
                            {strengthInfo.label}
                          </span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(n => (
                              <div
                                key={n}
                                className={`w-3 h-1 rounded-full transition-all duration-500 ${strengthScore >= n ? strengthInfo.color : 'bg-gray-100'}`}
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
                      className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em]">Confirm Password</label>
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
                      className="w-full px-6 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] outline-none focus:border-[#D4AF37] transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9] text-[10px] text-[#64748B] space-y-1">
                    <p className="font-bold text-[#334155] uppercase tracking-wider mb-2">Complexity Requirements</p>
                    <div className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-emerald-600' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-[#CBD5E1]'}`} />
                      Minimum 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? 'text-emerald-600' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-[#CBD5E1]'}`} />
                      At least 1 uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${/[a-z]/.test(newPassword) ? 'text-emerald-600' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-[#CBD5E1]'}`} />
                      At least 1 lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${/[0-9]/.test(newPassword) ? 'text-emerald-600' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-[#CBD5E1]'}`} />
                      At least 1 number
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(null); }}
                    className="px-6 py-5 bg-[#F8FAFC] text-[#64748B] rounded-[24px] font-bold text-xs uppercase tracking-widest hover:bg-[#F1F5F9] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#0F172A] text-white py-5 rounded-[24px] font-bold text-sm flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-[#D4AF37] rounded-full animate-spin" />
                    ) : 'Activate Account'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="text-center">
          <Link to="/" className="text-[#64748B] text-xs hover:text-[#D4AF37] transition-colors font-medium">
            ← Back to Login
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-2">
        <Building2 size={16} className="text-white/10" />
        <p className="text-[10px] text-white/20 font-medium uppercase tracking-[0.3em]">Bank Asia PLC • Priority Banking Division • 2026</p>
      </div>
    </div>
  );
}
