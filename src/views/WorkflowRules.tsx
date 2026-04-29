import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Settings, 
  Workflow, 
  Briefcase, 
  MoreVertical, 
  Play, 
  Pause, 
  Edit2, 
  Trash2 
} from 'lucide-react';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  is_active: boolean;
  conditions: {
    service_categories: string[];
    service_types: string[];
    priority_levels: string[];
  };
  actions: {
    assign_to: string;
    set_priority?: string;
    add_tag?: string;
    send_notification?: boolean;
  };
}

export default function WorkflowRules() {
  const [rules, setRules] = useState<WorkflowRule[]>([
    {
      id: '1',
      name: 'High Priority Annual Services',
      description: 'Route all urgent annual services to the VIP manager',
      priority: 100,
      is_active: true,
      conditions: {
        service_categories: ['annual_service'],
        service_types: [],
        priority_levels: ['urgent']
      },
      actions: {
        assign_to: 'vip.manager@bankasia.com',
        send_notification: true,
        add_tag: 'VIP-URGENT'
      }
    },
    {
      id: '2',
      name: 'Default Meet & Greet Routing',
      description: 'Standard routing for airport services',
      priority: 50,
      is_active: true,
      conditions: {
        service_categories: ['on_request'],
        service_types: ['airport-greet'],
        priority_levels: []
      },
      actions: {
        assign_to: 'operations@bankasia.com',
        set_priority: 'medium'
      }
    }
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-medium text-[#0F172A] italic">Workflow Rules</h1>
          <p className="text-[#64748B]">Manage automated routing and assignments for service requests.</p>
        </div>
        <button className="px-6 py-3 bg-[#0F172A] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1E293B] shadow-lg shadow-[#0F172A]/10 transition-all">
          <Plus size={18} />
          <span>Create Rule</span>
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[40px] overflow-hidden shadow-xl shadow-[#0F172A]/5 relative">
        <div className="p-8 border-b border-[#E2E8F0] flex flex-col md:flex-row items-center gap-4 justify-between bg-gradient-to-br from-[#F8FAFC] to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#0F172A]/10">
              <Workflow size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Active Rules</h2>
              <p className="text-[#64748B] text-sm">Processed in order of priority (highest sequence first)</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
            <input 
              type="text"
              placeholder="Search rules..." 
              className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-8 py-5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] whitespace-nowrap">Priority ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] w-1/3">Rule Conditions</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] w-1/3">Actions Executed</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#F8FAFC]/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${rule.is_active ? 'bg-green-500' : 'bg-[#94A3B8]'}`} />
                      <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                        {rule.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex bg-[#F1F5F9] w-max px-3 py-1.5 rounded-lg border border-[#E2E8F0] items-center gap-2">
                       <span className="text-[#94A3B8] inline-block"><Settings size={14} /></span>
                       <span className="text-xs font-mono font-bold text-[#0F172A]">{rule.priority}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-[#0F172A] mb-1">{rule.name}</p>
                    <p className="text-xs text-[#64748B] mb-3 line-clamp-1">{rule.description}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-medium tracking-wide uppercase">
                      {rule.conditions.service_categories.length > 0 && (
                        <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#B8942A] rounded border border-[#D4AF37]/20">
                          {rule.conditions.service_categories.join(', ')}
                        </span>
                      )}
                      {rule.conditions.service_types.length > 0 && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100">
                          {rule.conditions.service_types.join(', ')}
                        </span>
                      )}
                      {rule.conditions.priority_levels.length > 0 && (
                        <span className="px-2 py-1 bg-red-50 text-red-600 rounded border border-red-100">
                           {rule.conditions.priority_levels.join(', ')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm">
                         <div className="w-6 h-6 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                            <Briefcase size={12} />
                         </div>
                         <span className="text-[#0F172A] truncate flex-1">{rule.actions.assign_to}</span>
                      </div>
                      <div className="flex gap-2">
                        {rule.actions.set_priority && (
                          <span className="text-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-2 py-1 rounded-md">
                            Priority: {rule.actions.set_priority}
                          </span>
                        )}
                        {rule.actions.send_notification && (
                           <span className="text-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-2 py-1 rounded-md">
                             Send Notify
                           </span>
                        )}
                        {rule.actions.add_tag && (
                           <span className="text-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-2 py-1 rounded-md">
                             Tag: {rule.actions.add_tag}
                           </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 text-[#94A3B8]">
                        <button className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors hover:text-[#0F172A]" title={rule.is_active ? 'Pause Rule' : 'Activate Rule'}>
                           {rule.is_active ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors hover:text-[#0F172A]" title="Edit Rule">
                           <Edit2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Delete Rule">
                           <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
