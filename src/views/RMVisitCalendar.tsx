import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sampleVisits } from '../modules/rm-visit/data';

export default function RMVisitCalendar() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Visit Calendar</h2>
        <div className="flex gap-2">
           <button onClick={() => setView('day')} className={`px-4 py-2 rounded-full ${view === 'day' ? 'bg-[#0F172A] text-white' : 'bg-white border'}`}>Day</button>
           <button onClick={() => setView('week')} className={`px-4 py-2 rounded-full ${view === 'week' ? 'bg-[#0F172A] text-white' : 'bg-white border'}`}>Week</button>
           <button onClick={() => setView('month')} className={`px-4 py-2 rounded-full ${view === 'month' ? 'bg-[#0F172A] text-white' : 'bg-white border'}`}>Month</button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0]">
        {view === 'month' && (
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold text-[#64748B] p-2">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const dateStr = `2026-05-${(i + 1).toString().padStart(2, '0')}`;
              const visit = sampleVisits.find(v => v.date === dateStr);
              return (
                <div key={i} className="h-24 border rounded-xl p-2 relative">
                  <span className="text-sm font-bold text-[#0F172A]">{i + 1}</span>
                  {visit && (
                    <div className={`mt-2 text-[10px] p-1 rounded ${visit.type === 'Existing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {visit.customerName} - {visit.status}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {view !== 'month' && <div className="text-center py-20">Not implemented in this prototype.</div>}
      </div>
    </div>
  );
}
