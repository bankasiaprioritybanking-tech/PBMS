import React from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ModulePlaceholderProps {
  title?: string;
  message?: string;
}

export default function ModulePlaceholder({ 
  title = "Module Content Loading", 
  message = "We are preparing the latest data for your personalized banking experience. Please wait a moment." 
}: ModulePlaceholderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-12 bg-white/50 backdrop-blur-sm rounded-[40px] border border-dashed border-[#E2E8F0] dark:border-white/10 transition-all"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-[#F8FAFC] dark:bg-white/5 rounded-[32px] flex items-center justify-center text-[#94A3B8]">
          <ImageOff size={44} strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl flex items-center justify-center text-[#D4AF37] border border-[#F1F5F9] dark:border-white/5">
          <Loader2 size={20} className="animate-spin" />
        </div>
      </div>
      
      <div className="space-y-3 max-w-sm">
        <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white font-display italic">
          {title}
        </h3>
        <p className="text-sm text-[#64748B] leading-relaxed">
          {message}
        </p>
      </div>

      <div className="mt-10 flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-[#D4AF37]/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </motion.div>
  );
}
