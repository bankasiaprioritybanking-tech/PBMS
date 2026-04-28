import React from 'react';
import { CheckCircle2, XCircle, Lock, Ban, Clock, ShieldCheck } from 'lucide-react';

type StatusType = 'active' | 'inactive' | 'locked' | 'blocked' | 'approved' | 'pending';

interface StatusBadgeProps {
  status: StatusType | string;
  children?: React.ReactNode;
  className?: string;
}

export default function StatusBadge({ status, children, className = "" }: StatusBadgeProps) {
  const s = status.toLowerCase();
  
  const config: Record<string, { style: string, icon: React.ReactNode }> = {
    active: { 
      style: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
      icon: <CheckCircle2 size={12} /> 
    },
    approved: { 
      style: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
      icon: <ShieldCheck size={12} /> 
    },
    inactive: { 
      style: 'bg-slate-50 text-slate-700 border-slate-100', 
      icon: <XCircle size={12} /> 
    },
    locked: { 
      style: 'bg-amber-50 text-amber-700 border-amber-100', 
      icon: <Lock size={12} /> 
    },
    blocked: { 
      style: 'bg-red-50 text-red-700 border-red-100', 
      icon: <Ban size={12} /> 
    },
    pending: { 
      style: 'bg-blue-50 text-blue-700 border-blue-100', 
      icon: <Clock size={12} /> 
    },
  };

  const current = config[s] || { 
    style: 'bg-slate-50 text-slate-700 border-slate-100', 
    icon: null 
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-all hover:shadow-md ${current.style} ${className}`}>
      {current.icon}
      {children || status}
    </span>
  );
}
