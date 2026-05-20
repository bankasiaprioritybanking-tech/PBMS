import React from 'react';
import { motion } from 'motion/react';

interface DashboardThumbnailProps {
  label: string;
  url: string;
  imageSrc: string;
}

const DashboardThumbnail: React.FC<DashboardThumbnailProps> = ({ label, url, imageSrc }) => {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden rounded-2xl border border-[#E2E8F0] hover:border-[#D4AF37] transition-all bg-white"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <img src={imageSrc} alt={label} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#D4AF37] transition-colors">{label}</h4>
      </div>
    </motion.a>
  );
};

export default DashboardThumbnail;
