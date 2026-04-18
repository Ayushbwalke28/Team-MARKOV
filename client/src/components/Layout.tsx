import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Briefcase, Calendar, Lightbulb, MessageSquare, Bot, BarChart3, Settings, Bell, Search, Menu, X, LogOut, Users } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} fixed h-screen left-0 top-0 bg-[#0A1628] text-white flex flex-col transition-all duration-300 z-20`}>
        {/* Logo */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-6'} h-16 border-b border-white/10`}>
          {!sidebarCollapsed && (
            <Link to="/home" className="flex items-center gap-3">
              <img src="/logo.png" alt="Worksphere" className="w-8 h-8" />
              <div>
                <h1 className="text-base font-bold tracking-tight">Worksphere</h1>
                <p className="text-[10px] text-white/50 tracking-wider uppercase">Professional Ledger</p>
              </div>
            </Link>
          )}
          {sidebarCollapsed && <img src="/logo.png" alt="Worksphere" className="w-8 h-8" />}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className={`${sidebarCollapsed ? 'mx-auto mt-2' : 'ml-auto'} p-1 rounded hover:bg-white/10 transition-colors`}>
            {sidebarCollapsed ? <Menu size={16} /> : <X size={16} className="text-white/50" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={`p-4 border-t border-white/10 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs shrink-0 ring-2 ring-white/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate capitalize">{user?.name || 'User'}</p>
                <p className="text-[10px] text-white/40">{user?.roles?.includes('company_owner') ? 'Company Owner' : 'Verified Professional'}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={handleLogout} className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 flex flex-col min-h-screen`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#e0e3e5] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex-1 max-w-lg relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d]" size={18} />
            <input
              type="text"
              placeholder="Search people, companies, or opportunities..."
              className="w-full bg-[#f2f4f6] text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white border border-transparent focus:border-[#2563EB]/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-5">
            <button className="relative text-[#75777d] hover:text-[#191c1e] transition-colors p-2 rounded-lg hover:bg-[#f2f4f6]">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
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
