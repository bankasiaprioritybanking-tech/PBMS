import React, { useState } from 'react';
import { Settings, Save, X, Plus, Trash2 } from 'lucide-react';

type ParameterType = 'string' | 'number' | 'boolean' | 'enum';

interface Parameter {
  id: string;
  name: string;
  value: string;
  description: string;
  type: ParameterType;
}

export const ParameterEditor: React.FC = () => {
  const [params, setParams] = useState<Parameter[]>([
    { id: '1', name: 'Max Service Requests', value: '50', description: 'Maximum active service requests per user.', type: 'number' },
    { id: '2', name: 'Enable Audit Logging', value: 'true', description: 'Enable/disable detailed audit trail.', type: 'boolean' },
  ]);

  const handleUpdate = (id: string, field: keyof Parameter, value: string) => {
    setParams(params.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F0] shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-[#0F172A] flex items-center gap-3">
          <Settings className="text-[#D4AF37]" />
          System Parameter Editor
        </h3>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#1E293B]">
          <Plus size={14} /> Add Parameter
        </button>
      </div>
      <p className="text-[#64748B]">Granular control panel for system configuration. Changes take effect on next server sync.</p>
      
      <div className="space-y-4">
        {params.map(param => (
          <div key={param.id} className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">{param.name}</h4>
              <p className="text-[10px] text-[#64748B]">{param.description}</p>
            </div>
            <select 
              value={param.type}
              onChange={(e) => handleUpdate(param.id, 'type', e.target.value as ParameterType)}
              className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-sm"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="enum">Enum</option>
            </select>
            <input 
              value={param.value}
              onChange={(e) => handleUpdate(param.id, 'value', e.target.value)}
              className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-sm"
            />
            <div className="flex justify-end gap-2">
              <button className="p-3 text-[#64748B] hover:text-[#D4AF37]"><Save size={18} /></button>
              <button className="p-3 text-[#64748B] hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
