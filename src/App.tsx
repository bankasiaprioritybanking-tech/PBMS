/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import UserManagement from './views/UserManagement';
import ServiceRequest from './views/ServiceRequest';
import Customer from './views/Customer';
import SystemSetup from './views/SystemSetup';
import Appointments from './views/Appointments';
import AnnualService from './views/AnnualService';
import ParameterEntry from './views/ParameterEntry';
import WorkflowRules from './views/WorkflowRules';
import TaskManagement from './views/TaskManagement';
import Reports from './views/Reports';
import BillManagement from './views/BillManagement';
import SmsGateway from './views/SmsGateway';
import Profile from './views/Profile';
import AcceptInvitation from './views/AcceptInvitation';
import PriorityAlliance from './views/PriorityAlliance';
import MobileApp from './views/MobileApp';
import { ThemeProvider } from './lib/ThemeContext';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Construction, Loader, ShieldCheck } from 'lucide-react';

function ReplitLoginPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-[#D4AF37] rounded-full blur-[180px] opacity-10 animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-[#D4AF37] rounded-full blur-[180px] opacity-10 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <p className="text-white/[0.03] font-serif font-bold text-[180px] leading-none tracking-tight">P</p>
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center gap-10">
        {/* Brand */}
        <div className="text-center space-y-5">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#D4AF37] rounded-[32px] blur-3xl opacity-20" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-[#D4AF37] via-[#F5E0A3] to-[#B8860B] rounded-[36px] mx-auto flex items-center justify-center text-[#0F172A] font-bold text-6xl shadow-2xl shadow-[#D4AF37]/40 border-4 border-white/20">
              <span className="drop-shadow-lg">P</span>
            </div>
          </div>
          <div>
            <h1 className="text-white text-5xl font-serif italic tracking-tight">Priority</h1>
            <p className="text-[#D4AF37] font-bold text-2xl uppercase tracking-widest -mt-1">Banking</p>
            <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-[0.5em] mt-2">Bank Asia Limited · PBMS</p>
          </div>
        </div>

        {/* Login card */}
        <div className="w-full bg-white rounded-[40px] p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-[#0F172A] text-2xl font-bold tracking-tight">Secure Access Portal</h2>
            <p className="text-[#64748B] text-sm mt-1">Sign in with your Replit account to continue</p>
          </div>

          <a
            href="/api/login"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0F172A] font-bold text-base shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50 hover:scale-[1.02] transition-all duration-200"
          >
            <ShieldCheck size={20} />
            Sign in with Replit
          </a>

          <div className="mt-6 flex items-center gap-3 text-[#94A3B8] text-xs">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span>Secure · Encrypted · Trusted</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          <p className="mt-5 text-center text-[#94A3B8] text-xs">
            Access is restricted to authorized Bank Asia staff only.
          </p>
        </div>

        <p className="text-[#334155] text-xs text-center">
          © 2026 Bank Asia Limited. Priority Banking Division. All rights reserved.
        </p>
      </div>
    </div>
  );
}

const UnderConstruction = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-[#E2E8F0] dark:border-white/10">
    <div className="w-16 h-16 bg-[#F8FAFC] dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-[#94A3B8]">
      <Construction size={32} />
    </div>
    <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">{title}</h2>
    <p className="text-[#64748B] dark:text-slate-400 max-w-md mx-auto">
      This module is currently being redesigned for the modern PBMS Remix experience. 
      Please refer to the User Manual v1.0 for feature specifications.
    </p>
  </div>
);

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader size={48} className="text-[#D4AF37] animate-spin" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          <Route path="*" element={<ReplitLoginPage />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/system-setup" element={<SystemSetup />} />
            <Route path="/workflow-rules" element={<WorkflowRules />} />
            <Route path="/task-management" element={<TaskManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/parameter-entry" element={<ParameterEntry />} />
            <Route path="/service-request" element={<ServiceRequest />} />
            <Route path="/bill-management" element={<BillManagement />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/annual-service" element={<AnnualService />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/email" element={<UnderConstruction title="Email Templates" />} />
            <Route path="/sms" element={<SmsGateway />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/priority-alliance" element={<PriorityAlliance />} />
            <Route path="/mobile-app" element={<MobileApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
