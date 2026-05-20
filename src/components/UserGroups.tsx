import React from 'react';
import { ShieldCheck, Edit, Plus, Trash2 } from 'lucide-react';

interface UserGroup {
  id: string;
  name: string;
  description?: string;
}

interface UserGroupsProps {
  userGroups: UserGroup[];
  onEditGroup: (group: UserGroup) => void;
  onCreateGroup: () => void;
  onDeleteGroup: (group: UserGroup) => void;
}

export const UserGroups: React.FC<UserGroupsProps> = ({ userGroups, onEditGroup, onCreateGroup, onDeleteGroup }) => {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#0F172A]">User Groups Management</h3>
        <button 
          onClick={onCreateGroup}
          className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#1E293B] transition-all"
        >
          <Plus size={14} />
          Create New Group
        </button>
      </div>
      <p className="text-[#64748B] mb-8">Manage user groups and assign permissions based on the principle of least privilege.</p>
      
      <div className="space-y-4">
        {userGroups.map(group => (
          <div key={group.id} className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-[#0F172A]">{group.name}</h4>
              <p className="text-xs text-[#64748B]">{group.description || 'No description provided.'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onEditGroup(group)}
                className="px-6 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs font-bold uppercase tracking-widest hover:border-[#D4AF37] transition-all flex items-center gap-2"
              >
                <Edit size={14} />
                Modify Rights
              </button>
              <button 
                onClick={() => onDeleteGroup(group)}
                className="p-3 bg-white border border-[#E2E8F0] rounded-2xl text-red-500 hover:border-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
