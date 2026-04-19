import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Briefcase, Calendar, Lightbulb, MessageSquare, Bot, BarChart3, Settings, Bell, Search, LogOut, Users, ShieldCheck, Building2, TrendingUp, Sun, Moon } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Users, label: 'Network', path: '/network' },
    { icon: Lightbulb, label: 'Opportunities', path: '/opportunities' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: ShieldCheck, label: 'Verification', path: '/verify' },
    { icon: Building2, label: 'Company Hub', path: '/company' },
    { icon: TrendingUp, label: 'Investor Hub', path: '/investor' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`${sidebarExpanded ? 'w-72' : 'w-20'} fixed h-screen left-0 top-0 bg-surface-brand text-surface-brand-foreground flex flex-col transition-all duration-500 ease-out z-20 shadow-2xl scrollbar-none`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-surface-brand-foreground/10 ${sidebarExpanded ? 'px-5 justify-start' : 'px-0 justify-center'}`}>
          <Link to="/home" className={`flex items-center ${sidebarExpanded ? 'gap-3' : ''} transition-all duration-500`}>
            <img src="/logo.png" alt="Worksphere" className="w-8 h-8 shrink-0" />
            <div className={`overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100 translate-x-0 max-w-[220px]' : 'opacity-0 -translate-x-2 max-w-0'}`}>
              <h1 className="text-base font-bold tracking-tight">Worksphere</h1>
              <p className="text-[10px] text-surface-brand-foreground/50 tracking-wider uppercase">Professional Ledger</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`group relative flex items-center ${sidebarExpanded ? 'justify-start gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-lg text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-[1.01]'
                    : 'text-surface-brand-foreground/60 hover:bg-surface-brand-foreground/10 hover:text-surface-brand-foreground hover:translate-x-0.5'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100 translate-x-0 max-w-[180px]' : 'opacity-0 -translate-x-2 max-w-0'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={`p-4 border-t border-surface-brand-foreground/10 ${sidebarExpanded ? '' : 'flex justify-center'}`}>
          <div
            onClick={() => navigate('/settings')}
            className={`w-full text-left rounded-lg p-1 transition-all duration-300 hover:bg-surface-brand-foreground/10 cursor-pointer ${sidebarExpanded ? '' : 'max-w-[40px]'}`}
            title="Open profile settings"
          >
            <div className={`flex items-center ${sidebarExpanded ? 'gap-3' : 'justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0 ring-2 ring-surface-brand-foreground/20">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100 translate-x-0 max-w-[140px]' : 'opacity-0 -translate-x-2 max-w-0'}`}>
                <p className="text-sm font-semibold truncate capitalize">{user?.name || 'User'}</p>
                <p className="text-[10px] text-surface-brand-foreground/40">{user?.roles?.includes('company_owner') ? 'Company Owner' : 'Verified Professional'}</p>
              </div>
              {sidebarExpanded && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded hover:bg-surface-brand-foreground/10 text-surface-brand-foreground/40 hover:text-surface-brand-foreground transition-colors"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarExpanded ? 'ml-72' : 'ml-20'} transition-all duration-500 ease-out flex flex-col min-h-screen`}>
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex-1 max-w-lg relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search people, companies, or opportunities..."
              className="w-full bg-secondary text-foreground text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background border border-transparent focus:border-primary/30 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card"></span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-full bg-surface-brand flex items-center justify-center text-surface-brand-foreground font-bold text-xs shadow-sm uppercase hover:opacity-90 transition-opacity"
              title="Open profile settings"
            >
              {user?.name?.charAt(0) || 'U'}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
