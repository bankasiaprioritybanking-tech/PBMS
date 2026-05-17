/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ReactNode, type JSX } from 'react';
import PageBackground, { PageVariant } from './PageBackground';
import { 
  Users, 
  Settings, 
  ListTodo, 
  UserCircle, 
  CalendarClock, 
  Mail, 
  MessageSquare, 
  LayoutDashboard,
  Bell,
  HelpCircle,
  Menu,
  ChevronRight,
  LogOut,
  ChevronDown,
  Workflow,
  FileText,
  BarChart3,
  Handshake,
  Smartphone,
  Sun,
  Moon,
  Monitor,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';

function getPageVariant(pathname: string): PageVariant {
  if (pathname === '/') return 'dashboard';
  if (pathname.startsWith('/user-management')) return 'user-management';
  if (pathname.startsWith('/service-request')) return 'service-request';
  if (pathname.startsWith('/customer')) return 'customer';
  if (pathname.startsWith('/system-setup')) return 'system-setup';
  if (pathname.startsWith('/priority-alliance')) return 'customer';
  if (pathname.startsWith('/mobile-app')) return 'dashboard';
  return 'default';
}

const sidebarItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/' },
  { 
    id: 'user-mgmt', 
    label: 'User Management', 
    icon: Users, 
    path: '/user-management',
    subItems: ['User Group', 'User', 'Change Password', 'Right Group', 'Right Category', 'Right']
  },
  { 
    id: 'system-setup', 
    label: 'System Setup', 
    icon: Settings, 
    path: '/system-setup',
    subItems: ['Vas Service', 'Parameter', 'Alarm Clock Setup', 'Service Cost Setup']
  },
  { id: 'workflow-rules', label: 'Workflow Rules', icon: Workflow, path: '/workflow-rules' },
  { id: 'task-management', label: 'Task Mgmt', icon: ListTodo, path: '/task-management' },
  { id: 'parameter-entry', label: 'Parameter Entry', icon: ListTodo, path: '/parameter-entry' },
  { id: 'other', label: 'Other', icon: HelpCircle, path: '/other', subItems: ['News and Events'] },
  { 
    id: 'service-request', 
    label: 'Service Request', 
    icon: CalendarClock, 
    path: '/service-request',
    subItems: ['Value Added Service (VAS)', 'Manage Service Request', 'CM Approval', 'HOPB Approval']
  },
  { 
    id: 'bill-management', 
    label: 'Bill Management', 
    icon: FileText, 
    path: '/bill-management',
    subItems: ['Bill Generator', 'Charge Waiver Approval']
  },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { id: 'customer', label: 'Customer', icon: UserCircle, path: '/customer' },
  { 
    id: 'annual-service', 
    label: 'Annual Service', 
    icon: Bell, 
    path: '/annual-service',
    subItems: ['Birth Day', 'Anniversary', 'Dinner Coupon', 'Life Style']
  },
  { 
    id: 'appointments', 
    label: 'Appointment Management', 
    icon: CalendarClock, 
    path: '/appointments',
    subItems: ['Prospective Customer', 'Appointment']
  },
  { id: 'email', label: 'Email', icon: Mail, path: '/email' },
  { id: 'sms', label: 'SMS', icon: MessageSquare, path: '/sms' },
  { id: 'priority-alliance', label: 'Priority Alliance', icon: Handshake, path: '/priority-alliance' },
  { id: 'mobile-app', label: 'Mobile App', icon: Smartphone, path: '/mobile-app' },
];

type Theme = 'light' | 'dark' | 'system';

const themeOrder: Theme[] = ['light', 'dark', 'system'];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const icons: Record<Theme, JSX.Element> = {
    light: <Sun size={18} />,
    dark: <Moon size={18} />,
    system: <Monitor size={18} />,
  };

  const labels: Record<Theme, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${labels[theme]} — click to cycle`}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-white rounded-full transition-colors text-xs font-semibold"
    >
      {icons[theme]}
      <span className="hidden sm:inline">{labels[theme]}</span>
    </button>
  );
};

function SidebarContent({
  isSidebarOpen,
  setSidebarOpen,
  onNavClick,
}: {
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  onNavClick?: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      <div className="p-6 lg:p-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="w-11 h-11 bg-[#D4AF37] rounded-[18px] flex items-center justify-center text-[#0F172A] font-bold text-2xl shadow-lg shadow-[#D4AF37]/10 shrink-0">
            P
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col -space-y-1">
              <span className="text-xl text-white">
                <span className="font-serif italic text-2xl">Priority</span>
                <span className="text-[#D4AF37] font-bold ml-1 text-sm uppercase tracking-wider">Banking</span>
              </span>
              <span className="text-[7px] uppercase tracking-[0.3em] font-bold text-[#64748B]">Bank Asia Limited</span>
            </div>
          )}
        </div>
        {isSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-white/5 rounded-md text-[#64748B] hover:text-[#D4AF37] transition-all lg:block"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
        {!isSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-full flex justify-center mb-6 text-[#64748B] hover:text-[#D4AF37]"
          >
            <Menu size={24} />
          </button>
        )}
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isExpanded = expandedItems.includes(item.id);

            return (
              <li key={item.id} className="space-y-1">
                <div className="flex items-center group">
                  <Link
                    to={item.path}
                    onClick={onNavClick}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#1E293B] text-[#D4AF37] font-semibold'
                        : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} className={isActive ? 'text-[#D4AF37]' : 'group-hover:text-white transition-colors'} />
                    {isSidebarOpen && <span className="text-sm tracking-wide">{item.label}</span>}
                  </Link>
                  {isSidebarOpen && item.subItems && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={`p-2 text-[#64748B] hover:text-[#D4AF37] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <ChevronDown size={14} />
                    </button>
                  )}
                </div>

                {isSidebarOpen && item.subItems && (
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-11 space-y-1"
                      >
                        {item.subItems.map(sub => (
                          <li key={sub}>
                            <button className="w-full text-left px-3 py-2 text-[12px] text-[#64748B] hover:text-[#D4AF37] transition-colors uppercase tracking-widest font-bold">
                              {sub}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 lg:p-6 border-t border-white/5 shrink-0">
        {isSidebarOpen ? (
          <div className="flex flex-col gap-2">
            <Link to="/profile" onClick={onNavClick} className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5 group hover:bg-white/10 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37] flex items-center justify-center font-bold text-[#0F172A] text-xs shadow-lg shadow-[#D4AF37]/5">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-bold truncate text-white">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">Administrator</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#64748B] hover:text-red-400 hover:bg-red-400/5 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Link to="/profile" title={user?.email || 'Profile'} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#D4AF37] border border-white/5 hover:bg-white/10 transition-colors">
              <UserCircle size={20} />
            </Link>
            <button
              onClick={handleLogout}
              className="text-[#64748B] hover:text-red-400"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden font-sans text-[#1E293B] dark:text-[#F8FAFC]">

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex bg-[#0F172A] border-r border-[#1E293B] h-full flex-col z-20 shrink-0 overflow-hidden"
      >
        <SidebarContent
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </motion.aside>

      {/* Mobile Sidebar (slide-in overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 w-[280px] bg-[#0F172A] border-r border-[#1E293B] h-full flex flex-col z-50 lg:hidden overflow-hidden"
          >
            {/* Close button for mobile */}
            <button
              onClick={closeMobileMenu}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-md text-[#64748B] hover:text-[#D4AF37] transition-all"
            >
              <X size={18} />
            </button>
            <SidebarContent
              isSidebarOpen={true}
              setSidebarOpen={() => {}}
              onNavClick={closeMobileMenu}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-colors duration-300">
        {/* Header */}
        <header className="h-14 lg:h-16 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-white/5 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 transition-colors gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-white/5 rounded-lg transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-[#64748B] text-sm min-w-0">
            <span className="hidden sm:inline shrink-0">Home</span>
            {location.pathname !== '/' && (
              <>
                <ChevronRight size={14} className="hidden sm:block shrink-0" />
                <span className="text-[#0F172A] dark:text-white font-medium capitalize truncate">
                  {location.pathname.split('/').pop()?.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <button className="p-2 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-white/5 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0F172A]"></span>
            </button>
            <button className="hidden sm:flex p-2 text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-white/5 rounded-full transition-colors">
              <HelpCircle size={20} />
            </button>
          </div>
        </header>

        {/* View Surface */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors relative">
          <PageBackground variant={getPageVariant(location.pathname)} />
          <div className="max-w-7xl mx-auto h-full relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
