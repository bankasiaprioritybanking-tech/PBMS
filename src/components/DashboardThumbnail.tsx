import React from 'react';

interface DashboardThumbnailProps {
  label: string;
  url: string;
  imageSrc?: string;
  subtitle?: string;
  external?: boolean;
}

const DashboardThumbnail: React.FC<DashboardThumbnailProps> = ({ 
  label, 
  url, 
  imageSrc,
  subtitle,
  external = true
}) => {
  const Component = external ? 'a' : 'div';
  const componentProps = external ? {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer'
  } : {};

  return (
    <Component
      {...componentProps}
      className="group block relative overflow-hidden rounded-2xl border border-[#E2E8F0] hover:border-[#D4AF37] transition-all bg-white hover:shadow-lg cursor-pointer"
    >
      {imageSrc ? (
        <>
          <img src={imageSrc} alt={label} className="w-full h-40 object-cover" />
          <div className="p-4">
            <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#D4AF37] transition-colors">{label}</h4>
            {subtitle && <p className="text-[10px] text-[#94A3B8] mt-1">{subtitle}</p>}
          </div>
        </>
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] flex items-center justify-center rounded-t-2xl">
          <p className="text-[#64748B] text-3xl">📦</p>
        </div>
      )}
    </Component>
  );
};

export default DashboardThumbnail;
