import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, LayoutGrid, Rows } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';
type LayoutPair = 1 | 2;

function useDark(theme: ThemeMode): boolean {
  const [sysDark, setSysDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSysDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return sysDark;
}

function useWindowWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

// Bank Asia "infinity-P" logo SVG
function BankAsiaLogo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E0A3" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#7A5C00" />
        </linearGradient>
        <linearGradient id="gold2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5E0A3" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A7010" />
        </linearGradient>
      </defs>
      <path d="M 15 50 C 15 30 28 20 40 20 C 52 20 58 30 58 40 C 58 50 52 58 44 62 C 36 66 28 70 28 80 C 28 88 35 92 44 92 C 56 92 64 82 64 70" stroke="url(#gold1)" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M 60 20 L 60 80" stroke="url(#gold2)" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M 60 20 C 75 20 85 28 85 38 C 85 48 75 55 60 55" stroke="url(#gold2)" strokeWidth="9" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ─────────────────────────────────────────
// PAIR 1 — Compact Card  (dark + light)
// ─────────────────────────────────────────
function CompactCard({ dark, mobile }: { dark: boolean; mobile: boolean }) {
  const cardPadding = mobile ? '28px 20px' : '40px 44px';
  const logoSize = mobile ? 56 : 72;
  const titleSize = mobile ? 18 : 22;

  if (dark) {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 60%, #1a1200 0%, #0a0800 60%, #000 100%)' }}>
        {/* Gold particle glow effects — hidden on mobile to avoid overflow */}
        {!mobile && (
          <div className="absolute inset-0 pointer-events-none">
            <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 420, height: 220,
              background: 'radial-gradient(ellipse, rgba(212,175,55,0.28) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(18px)' }} />
            <div style={{ position: 'absolute', top: '30%', right: '8%', width: 260, height: 140,
              background: 'radial-gradient(ellipse, rgba(212,175,55,0.16) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(12px)' }} />
            <div style={{ position: 'absolute', top: '15%', left: '7%', width: 100, height: 220,
              background: 'rgba(212,175,55,0.06)', borderRadius: 8 }} />
            <div style={{ position: 'absolute', top: '25%', left: '14%', width: 70, height: 180,
              background: 'rgba(212,175,55,0.04)', borderRadius: 8 }} />
            <div style={{ position: 'absolute', top: '15%', right: '7%', width: 100, height: 220,
              background: 'rgba(212,175,55,0.06)', borderRadius: 8 }} />
            <div style={{ position: 'absolute', top: '25%', right: '14%', width: 70, height: 180,
              background: 'rgba(212,175,55,0.04)', borderRadius: 8 }} />
          </div>
        )}
        {/* Mobile-only subtle glow */}
        {mobile && (
          <div className="absolute inset-0 pointer-events-none">
            <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
              width: 280, height: 160,
              background: 'radial-gradient(ellipse, rgba(212,175,55,0.22) 0%, transparent 70%)',
              borderRadius: '50%', filter: 'blur(16px)' }} />
          </div>
        )}

        {/* Main card */}
        <div className="flex-1 flex items-center justify-center w-full" style={{ padding: mobile ? '48px 16px 24px' : '32px 16px' }}>
          <div style={{
            background: 'linear-gradient(145deg, #1a1500 0%, #111000 100%)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: mobile ? 16 : 20,
            padding: cardPadding,
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 0 60px rgba(212,175,55,0.12), 0 20px 60px rgba(0,0,0,0.8)',
            position: 'relative',
          }}>
            {/* Header */}
            <div className="flex flex-col items-center" style={{ marginBottom: mobile ? 24 : 32 }}>
              <BankAsiaLogo size={logoSize} />
              <div className="mt-3 text-center">
                <div style={{ color: '#D4AF37', fontSize: mobile ? 18 : 22, fontWeight: 800, letterSpacing: 1 }}>Bank Asia</div>
                <div style={{ color: '#8a7030', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' }}>Priority Banking</div>
              </div>
              <div style={{ marginTop: mobile ? 12 : 16, textAlign: 'center' }}>
                <h2 style={{ color: '#D4AF37', fontSize: titleSize, fontWeight: 700, letterSpacing: 0.5 }}>Priority Banking Login Portal</h2>
                <div style={{ margin: '8px auto 0', width: 100, height: 2,
                  background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
              </div>
            </div>

            {/* Sign In button */}
            <a href="/api/login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: mobile ? '13px 0' : '14px 0',
                background: 'linear-gradient(90deg, #D4AF37 0%, #B8860B 100%)',
                borderRadius: 8, color: '#000', fontWeight: 700, fontSize: mobile ? 14 : 15,
                letterSpacing: 0.5, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
                transition: 'opacity 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              🔐 Sign In with Replit
            </a>

            <a href="/api/login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: mobile ? '11px 0' : '12px 0', marginTop: 10,
                border: '1px solid #D4AF37', borderRadius: 8,
                color: '#D4AF37', fontWeight: 600, fontSize: mobile ? 13 : 14,
                textDecoration: 'none', transition: 'background 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.08)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              ✉ Secure Access Portal
            </a>

            <p style={{ marginTop: 14, color: '#6b5a20', fontSize: 11, textAlign: 'center' }}>
              ⓘ Authorized Bank Asia Priority Banking staff only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ paddingBottom: mobile ? 16 : 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 40, height: 1, background: '#D4AF37', opacity: 0.4 }} />
            <div style={{ color: '#D4AF37', opacity: 0.5 }}>⊞</div>
            <div style={{ width: 40, height: 1, background: '#D4AF37', opacity: 0.4 }} />
          </div>
          <p style={{ color: '#4a3e18', fontSize: 12 }}>Developed by Ahmed Mostafa</p>
        </div>
      </div>
    );
  }

  // Light compact
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0ede8' }}>
      <div style={{ height: 6, background: 'linear-gradient(90deg, #1a1a1a 0%, #1a1a1a 80%, #D4AF37 100%)' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: mobile ? '40px 16px 24px' : '24px 16px' }}>
        {/* Faint bg cards — desktop only to avoid clipping on mobile */}
        {!mobile && (
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '20%', left: '6%', width: 90, height: 140, background: '#e0dbd2', borderRadius: 6 }} />
            <div style={{ position: 'absolute', top: '30%', left: '12%', width: 70, height: 110, background: '#e5e0d8', borderRadius: 6 }} />
            <div style={{ position: 'absolute', top: '20%', right: '6%', width: 90, height: 140, background: '#e0dbd2', borderRadius: 6 }} />
            <div style={{ position: 'absolute', top: '30%', right: '12%', width: 70, height: 110, background: '#e5e0d8', borderRadius: 6 }} />
          </div>
        )}

        <div style={{
          background: '#fff', borderRadius: mobile ? 14 : 16,
          padding: mobile ? '28px 20px' : '40px 48px',
          width: '100%', maxWidth: 480,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          position: 'relative', zIndex: 1,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: mobile ? 20 : 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 10 : 12 }}>
              <BankAsiaLogo size={mobile ? 44 : 56} />
              <div>
                <div style={{ color: '#1a1a1a', fontSize: mobile ? 17 : 20, fontWeight: 800 }}>Bank Asia</div>
                <div style={{ color: '#8a7030', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>Priority Banking</div>
              </div>
            </div>
            <h2 style={{ marginTop: mobile ? 16 : 20, fontSize: mobile ? 17 : 22, fontWeight: 700, color: '#1a1a1a', textAlign: 'center' }}>
              Priority Banking Login Portal
            </h2>
            <div style={{ width: 60, height: 3, background: '#D4AF37', borderRadius: 2, marginTop: 8 }} />
          </div>

          {/* Sign In */}
          <a href="/api/login"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: mobile ? '13px 0' : '14px 0',
              background: '#1a1a1a', borderRadius: 8,
              color: '#fff', fontWeight: 700, fontSize: mobile ? 14 : 15, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)', transition: 'opacity 0.2s',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            🔐 Sign In with Replit
          </a>

          <a href="/api/login"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: mobile ? '11px 0' : '12px 0', marginTop: 10,
              border: '1.5px solid #D4AF37', borderRadius: 8,
              color: '#B8860B', fontWeight: 600, fontSize: mobile ? 13 : 14, textDecoration: 'none',
              transition: 'background 0.2s',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.07)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            ✉ Secure Access Portal
          </a>

          <p style={{ marginTop: 12, color: '#94A3B8', fontSize: 11, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span>ⓘ</span> Authorized Bank Asia Priority Banking staff only.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: '#1a1a1a', padding: mobile ? '14px 0' : '18px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 30, height: 1, background: '#D4AF37', opacity: 0.5 }} />
          <BankAsiaLogo size={22} />
          <div style={{ width: 30, height: 1, background: '#D4AF37', opacity: 0.5 }} />
        </div>
        <p style={{ color: '#6b6b6b', fontSize: 12 }}>Developed by Ahmed Mostafa</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PAIR 2 — Wide Layout  (dark + light)
// ─────────────────────────────────────────
function WideLayout({ dark, mobile }: { dark: boolean; mobile: boolean }) {
  if (dark) {
    // Mobile: compact centered card (no sidebar)
    if (mobile) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0e0c08' }}>
          {/* Slim top bar acts as brand strip */}
          <div style={{
            background: 'linear-gradient(90deg, #141008 0%, #0a0800 100%)',
            borderBottom: '1px solid rgba(212,175,55,0.2)',
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <BankAsiaLogo size={32} />
            <div>
              <div style={{ color: '#D4AF37', fontSize: 14, fontWeight: 800 }}>Bank Asia</div>
              <div style={{ color: '#6b5a20', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>Priority Banking</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
            <div style={{ width: '100%', maxWidth: 400 }}>
              <h1 style={{ color: '#D4AF37', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                Priority Banking Login Portal
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
                <div style={{ width: 24, height: 1, background: 'rgba(212,175,55,0.4)' }} />
                <div style={{ color: '#D4AF37', fontSize: 10 }}>◆</div>
                <div style={{ width: 24, height: 1, background: 'rgba(212,175,55,0.4)' }} />
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: 14, padding: '24px 20px',
              }}>
                <a href="/api/login"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '13px 0',
                    background: 'linear-gradient(90deg, #D4AF37 0%, #B8860B 100%)',
                    borderRadius: 8, color: '#000',
                    fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    boxShadow: '0 4px 24px rgba(212,175,55,0.3)',
                    transition: 'opacity 0.2s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                >
                  🔐 Sign In with Replit
                </a>

                <p style={{ marginTop: 14, color: '#5a4e30', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>ⓘ</span> Authorized Bank Asia Priority Banking staff only.
                </p>
              </div>

              {/* Mini nav links */}
              <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'center' }}>
                {['Security', 'Help & Support', 'Contact Us'].map(label => (
                  <span key={label} style={{ color: '#5a4e30', fontSize: 11, cursor: 'pointer' }}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: '#0a0800', borderTop: '1px solid rgba(212,175,55,0.1)', padding: '12px 0', textAlign: 'center' }}>
            <p style={{ color: '#4a3e18', fontSize: 12 }}>Developed by Ahmed Mostafa</p>
          </div>
        </div>
      );
    }

    // Desktop: sidebar layout
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0e0c08' }}>
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Left sidebar */}
          <div style={{
            width: 200, minHeight: '100%', flexShrink: 0,
            background: 'linear-gradient(180deg, #141008 0%, #0a0800 100%)',
            borderRight: '1px solid rgba(212,175,55,0.2)',
            display: 'flex', flexDirection: 'column', padding: '32px 0',
          }}>
            <div style={{ padding: '0 20px 32px', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BankAsiaLogo size={40} />
                <div>
                  <div style={{ color: '#D4AF37', fontSize: 14, fontWeight: 800 }}>Bank Asia</div>
                  <div style={{ color: '#6b5a20', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>Priority Banking</div>
                </div>
              </div>
            </div>

            <nav style={{ flex: 1, padding: '24px 0' }}>
              {[
                { icon: '→', label: 'Login', active: true },
                { icon: '🛡', label: 'Security', active: false },
                { icon: '?', label: 'Help & Support', active: false },
                { icon: '📞', label: 'Contact Us', active: false },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px', margin: '2px 8px',
                  borderRadius: 8, cursor: 'pointer',
                  background: item.active ? 'rgba(212,175,55,0.15)' : 'transparent',
                  borderLeft: item.active ? '3px solid #D4AF37' : '3px solid transparent',
                  color: item.active ? '#D4AF37' : '#5a4e30',
                  fontSize: 13, fontWeight: item.active ? 700 : 400,
                  transition: 'all 0.2s',
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: '#D4AF37', fontSize: 18 }}>🔒</span>
                <div>
                  <div style={{ color: '#8a7030', fontSize: 10 }}>Your security is</div>
                  <div style={{ color: '#8a7030', fontSize: 10 }}>our top priority</div>
                  <div style={{ color: '#D4AF37', fontSize: 10, marginTop: 2 }}>Bank Asia Priority Banking</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: 400, height: 250,
                background: 'radial-gradient(ellipse, rgba(212,175,55,0.2) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(24px)', transform: 'rotate(-20deg)' }} />
              <div style={{ position: 'absolute', top: '20%', right: '5%', width: 200, height: 120,
                background: 'radial-gradient(ellipse, rgba(212,175,55,0.1) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(12px)' }} />
              <div style={{ position: 'absolute', top: '18%', left: '8%', width: 120, height: 200, background: 'rgba(212,175,55,0.04)', borderRadius: 10 }} />
              <div style={{ position: 'absolute', top: '28%', left: '18%', width: 80, height: 160, background: 'rgba(212,175,55,0.03)', borderRadius: 10 }} />
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px' }}>
              <div style={{ width: '100%', maxWidth: 520 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                  <BankAsiaLogo size={56} />
                  <div>
                    <div style={{ color: '#D4AF37', fontSize: 22, fontWeight: 800 }}>Bank Asia</div>
                    <div style={{ color: '#6b5a20', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>Priority Banking</div>
                  </div>
                </div>

                <h1 style={{ color: '#D4AF37', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
                  Priority Banking Login Portal
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
                  <div style={{ width: 30, height: 1, background: 'rgba(212,175,55,0.4)' }} />
                  <div style={{ color: '#D4AF37', fontSize: 10 }}>◆</div>
                  <div style={{ width: 30, height: 1, background: 'rgba(212,175,55,0.4)' }} />
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 16, padding: '36px 40px',
                }}>
                  <a href="/api/login"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', padding: '15px 0',
                      background: 'linear-gradient(90deg, #D4AF37 0%, #B8860B 100%)',
                      borderRadius: 8, color: '#000',
                      fontWeight: 700, fontSize: 16, textDecoration: 'none',
                      boxShadow: '0 4px 24px rgba(212,175,55,0.3)',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                  >
                    🔐 Sign In with Replit
                  </a>

                  <p style={{ marginTop: 16, color: '#5a4e30', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>ⓘ</span> Authorized Bank Asia Priority Banking staff only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#0a0800', borderTop: '1px solid rgba(212,175,55,0.1)', padding: '14px 0', textAlign: 'center' }}>
          <p style={{ color: '#4a3e18', fontSize: 12 }}>Developed by Ahmed Mostafa</p>
        </div>
      </div>
    );
  }

  // Light split layout
  if (mobile) {
    // Mobile: stacked — compact brand header + form
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Compact brand banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1200 0%, #0e0c08 100%)',
          padding: '20px 20px 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle glow */}
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: 160, height: 100,
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.2) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(16px)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BankAsiaLogo size={44} />
              <div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>Bank Asia</div>
                <div style={{ color: '#8a7030', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>Priority Banking</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ width: 36, height: 3, background: '#D4AF37', marginBottom: 10 }} />
              <h2 style={{ color: '#D4AF37', fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>
                Premium Banking. Priority Service.
              </h2>
              <p style={{ color: '#6b5a20', fontSize: 12, marginTop: 6 }}>
                Exclusive solutions for your financial success.
              </p>
            </div>
          </div>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: 32, height: 32 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ background: '#D4AF37', borderRadius: 2, opacity: i === 0 || i === 3 ? 1 : 0.5 }} />
                ))}
              </div>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', marginBottom: 8 }}>
              Priority Banking Login Portal
            </h2>
            <div style={{ width: 50, height: 3, background: '#D4AF37', borderRadius: 2, margin: '0 auto 10px' }} />
            <p style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ color: '#D4AF37' }}>✓</span> Authorized staff access portal.
            </p>

            <a href="/api/login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '13px 0',
                background: 'linear-gradient(90deg, #D4AF37 0%, #9A7010 100%)',
                borderRadius: 10, color: '#fff',
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
                transition: 'opacity 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              🔐 Sign In with Replit
            </a>

            <p style={{ marginTop: 14, color: '#94A3B8', fontSize: 11, textAlign: 'center' }}>
              Authorized Bank Asia Priority Banking staff only.
            </p>
          </div>
        </div>

        <div style={{ background: '#1a1a1a', padding: '14px 0', textAlign: 'center' }}>
          <p style={{ color: '#6b6b6b', fontSize: 12 }}>Developed by Ahmed Mostafa</p>
        </div>
      </div>
    );
  }

  // Desktop light split layout
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left dark panel */}
        <div style={{
          width: '42%', minHeight: '100%', flexShrink: 0, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a1200 0%, #0e0c08 60%, #060500 100%)',
        }}>
          <div style={{ position: 'absolute', bottom: '20%', left: '-10%', width: 350, height: 200,
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.22) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '5%', top: '30%',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, transparent 60%)',
            borderRadius: '4px 4px 0 0' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '30%', left: '15%', width: '65%', height: '60%',
              backgroundImage: `repeating-linear-gradient(90deg, rgba(212,175,55,0.04) 0px, rgba(212,175,55,0.04) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(0deg, rgba(212,175,55,0.04) 0px, rgba(212,175,55,0.04) 1px, transparent 1px, transparent 20px)`,
            }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <BankAsiaLogo size={52} />
              <div>
                <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Bank Asia</div>
                <div style={{ color: '#8a7030', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>Priority Banking</div>
              </div>
            </div>

            <div style={{ flex: 1 }} />

            <div>
              <div style={{ width: 50, height: 3, background: '#D4AF37', marginBottom: 20 }} />
              <h2 style={{ color: '#D4AF37', fontSize: 28, fontWeight: 800, lineHeight: 1.3 }}>
                Premium Banking.<br />Priority Service.
              </h2>
              <p style={{ color: '#6b5a20', fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
                Exclusive solutions designed<br />around your financial success.
              </p>
            </div>

            <div style={{ marginTop: 40 }}>
              <div style={{ width: 100, height: 80, border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8 }} />
            </div>
          </div>
        </div>

        {/* Right light panel */}
        <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 60px' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: 36, height: 36 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ background: '#D4AF37', borderRadius: 2, opacity: i === 0 || i === 3 ? 1 : 0.5 }} />
                ))}
              </div>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', marginBottom: 8 }}>
              Priority Banking Login Portal
            </h2>
            <div style={{ width: 60, height: 3, background: '#D4AF37', borderRadius: 2, margin: '0 auto 12px' }} />
            <p style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ color: '#D4AF37' }}>✓</span> Authorized staff access portal.
            </p>

            <a href="/api/login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '15px 0',
                background: 'linear-gradient(90deg, #D4AF37 0%, #9A7010 100%)',
                borderRadius: 10, color: '#fff',
                fontWeight: 700, fontSize: 16, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              🔐 Sign In with Replit
            </a>

            <p style={{ marginTop: 16, color: '#CBD5E1', fontSize: 12, textAlign: 'right', cursor: 'pointer' }}>
              ✉ <span style={{ color: '#D4AF37' }}>Send Secure Code</span>
            </p>

            <p style={{ marginTop: 8, color: '#94A3B8', fontSize: 12, textAlign: 'center' }}>
              Authorized Bank Asia Priority Banking staff only.
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: '#1a1a1a', padding: '16px 0', textAlign: 'center' }}>
        <p style={{ color: '#6b6b6b', fontSize: 12 }}>Developed by Ahmed Mostafa</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main LoginPage with controls
// ─────────────────────────────────────────
export default function LoginPage() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('pbms_login_theme') as ThemeMode) || 'system';
  });
  const [layout, setLayout] = useState<LayoutPair>(() => {
    return (Number(localStorage.getItem('pbms_login_layout')) as LayoutPair) || 1;
  });

  const isDark = useDark(theme);
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const cycleTheme = () => {
    const next: ThemeMode = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    localStorage.setItem('pbms_login_theme', next);
  };

  const toggleLayout = () => {
    const next: LayoutPair = layout === 1 ? 2 : 1;
    setLayout(next);
    localStorage.setItem('pbms_login_layout', String(next));
  };

  const themeIcon = theme === 'light' ? <Sun size={14} /> : theme === 'dark' ? <Moon size={14} /> : <Monitor size={14} />;
  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 20, cursor: 'pointer',
    background: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.08)',
    border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(0,0,0,0.12)'}`,
    color: isDark ? '#D4AF37' : '#1a1a1a',
    fontSize: 12, fontWeight: 600,
    backdropFilter: 'blur(8px)',
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Floating controls — icon-only on mobile, labelled on desktop */}
      <div style={{
        position: 'fixed', top: 12, right: 12, zIndex: 9999,
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <button onClick={cycleTheme} title="Toggle theme"
          style={{ ...btnBase, gap: isMobile ? 0 : 6, padding: isMobile ? '8px' : '7px 12px' }}>
          {themeIcon}
          {!isMobile && themeLabel}
        </button>

        <button onClick={toggleLayout} title="Switch layout"
          style={{ ...btnBase, gap: isMobile ? 0 : 6, padding: isMobile ? '8px' : '7px 12px' }}>
          {layout === 1 ? <LayoutGrid size={14} /> : <Rows size={14} />}
          {!isMobile && `Layout ${layout === 1 ? '2' : '1'}`}
        </button>
      </div>

      {/* Render selected layout pair */}
      {layout === 1
        ? <CompactCard dark={isDark} mobile={isMobile} />
        : <WideLayout dark={isDark} mobile={isMobile} />
      }
    </div>
  );
}
