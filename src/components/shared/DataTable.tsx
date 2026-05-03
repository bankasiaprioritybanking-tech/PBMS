import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Column<T> {
  header: string | React.ReactNode;
  accessor: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  selectedIds?: (string | number)[];
  onToggleSelect?: (id: string | number) => void;
  onToggleSelectAll?: () => void;
}

export default function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  isLoading, 
  searchPlaceholder = "Search...",
  onSearch,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-white/10 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
          <input 
            type="text" 
            placeholder={searchPlaceholder} 
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F1F5F9] dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0F172A]/5 dark:focus:ring-white/10 bg-[#F8FAFC] dark:bg-white/5 text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-[#94A3B8]"
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button className="p-2.5 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-[#E2E8F0] dark:hover:border-white/10">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E2E8F0] dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-white/5">
                {onToggleSelect && (
                  <th className="px-6 py-4 w-10">
                    <input type="checkbox" checked={selectedIds?.length === data.length && data.length > 0} onChange={onToggleSelectAll} />
                  </th>
                )}
                {columns.map((col, i) => (
                  <th 
                    key={i} 
                    className={`px-6 py-4 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + (onToggleSelect ? 1 : 0)} className="px-6 py-20 text-center text-[#94A3B8] italic text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                      Loading records...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onToggleSelect ? 1 : 0)} className="px-6 py-20 text-center text-[#94A3B8] italic text-sm">
                    No records found.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-white/5 transition-colors group cursor-default">
                    {onToggleSelect && (
                      <td className="px-6 py-5">
                        <input type="checkbox" checked={selectedIds?.includes(row.id)} onChange={() => onToggleSelect?.(row.id)} />
                      </td>
                    )}
                    {columns.map((col, i) => (
                      <td key={i} className={`px-6 py-5 ${col.className || ''}`}>
                        {col.render ? col.render(row) : (row[col.accessor as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && data.length > 0 && (
          <div className="px-6 py-4 border-t border-[#F1F5F9] dark:border-white/5 bg-[#F8FAFC] dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-[0.2em]">Showing {data.length} records</p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-white dark:hover:bg-white/10 border border-[#E2E8F0] dark:border-white/10 transition-all disabled:opacity-50 uppercase tracking-widest" disabled>Prev</button>
              <button className="w-8 h-8 rounded-xl text-xs font-bold bg-[#0F172A] text-[#D4AF37] border border-[#0F172A] shadow-lg shadow-[#0F172A]/10">1</button>
              <button className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-white dark:hover:bg-white/10 border border-[#E2E8F0] dark:border-white/10 transition-all uppercase tracking-widest">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
