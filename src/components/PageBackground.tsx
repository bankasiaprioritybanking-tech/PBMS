import { useTheme } from '../lib/ThemeContext';

export type PageVariant = 'dashboard' | 'user-management' | 'service-request' | 'customer' | 'system-setup' | 'default';

interface PageBackgroundProps {
  variant: PageVariant;
}

const DotMatrix = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

const DiagonalGrid = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="diag-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="40" stroke="#D4AF37" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="40" y2="0" stroke="#D4AF37" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diag-grid)" />
  </svg>
);

export default function PageBackground({ variant }: PageBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (variant === 'dashboard') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.12) 0%, transparent 70%), #020617'
              : 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.08) 0%, transparent 70%), #F8FAFC',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.10) 0%, transparent 70%)',
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] animate-pulse"
          style={{
            background: 'rgba(212,175,55,0.05)',
            animationDuration: '6s',
            animationDelay: '1s',
          }}
        />
      </div>
    );
  }

  if (variant === 'user-management') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          }}
        />
        <DiagonalGrid />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'rgba(212,175,55,0.15)' }}
        />
      </div>
    );
  }

  if (variant === 'service-request') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(160deg, #042f2e 0%, #0f172a 60%, #0c1a2e 100%)'
              : 'linear-gradient(160deg, #f0fdfa 0%, #f8fafc 60%, #eff6ff 100%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-bold select-none"
          style={{
            color: isDark ? 'rgba(20,184,166,0.04)' : 'rgba(20,184,166,0.06)',
            lineHeight: 1,
          }}
        >
          ⚡
        </div>
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[150px]"
          style={{ background: isDark ? 'rgba(20,184,166,0.08)' : 'rgba(20,184,166,0.06)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[120px]"
          style={{ background: isDark ? 'rgba(15,23,42,0.5)' : 'rgba(239,246,255,0.8)' }}
        />
      </div>
    );
  }

  if (variant === 'customer') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%)'
              : 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ede9fe 100%)',
          }}
        />
        <div
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[160px]"
          style={{ background: isDark ? 'rgba(99,102,241,0.10)' : 'rgba(99,102,241,0.07)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[160px]"
          style={{ background: isDark ? 'rgba(139,92,246,0.10)' : 'rgba(139,92,246,0.07)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px]"
          style={{ background: isDark ? 'rgba(168,85,247,0.06)' : 'rgba(168,85,247,0.04)' }}
        />
      </div>
    );
  }

  if (variant === 'system-setup') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? '#0f172a'
              : '#f8fafc',
          }}
        />
        <div className="absolute inset-0 text-slate-400 dark:text-slate-700">
          <DotMatrix />
        </div>
        <div
          className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{ background: isDark ? 'rgba(100,116,139,0.08)' : 'rgba(148,163,184,0.12)' }}
        />
      </div>
    );
  }

  return null;
}
