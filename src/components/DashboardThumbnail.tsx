import React from 'react';

interface DashboardThumbnailProps {
  label: string;
  url: string;
  imageSrc: string;
}

const DashboardThumbnail: React.FC<DashboardThumbnailProps> = ({ label, url, imageSrc }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden rounded-2xl border border-[#E2E8F0] hover:border-[#D4AF37] transition-all bg-white"
    >
      <img src={imageSrc} alt={label} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#D4AF37] transition-colors">{label}</h4>
      </div>
    </a>
  );
};

export default DashboardThumbnail;
