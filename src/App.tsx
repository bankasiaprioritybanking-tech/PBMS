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
import LoginPage from './views/LoginPage';
import { ThemeProvider } from './lib/ThemeContext';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Construction, Loader } from 'lucide-react';

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
          <Route path="*" element={<LoginPage />} />
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
