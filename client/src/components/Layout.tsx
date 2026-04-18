import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Briefcase, Calendar, Lightbulb, MessageSquare, Bot, BarChart3, Settings, Bell, Search, LogOut, Users } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex font-sans">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`${sidebarExpanded ? 'w-72' : 'w-20'} fixed h-screen left-0 top-0 bg-[#0A1628] text-white flex flex-col transition-all duration-500 ease-out z-20 shadow-2xl shadow-[#0A1628]/30`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-white/10 ${sidebarExpanded ? 'px-5 justify-start' : 'px-0 justify-center'}`}>
          <Link to="/home" className={`flex items-center ${sidebarExpanded ? 'gap-3' : ''} transition-all duration-500`}>
            <img src="/logo.jpeg" alt="Worksphere" className="brand-logo w-8 h-8" />
            <div
              className={`overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100 translate-x-0 max-w-[220px]' : 'opacity-0 -translate-x-2 max-w-0'}`}
            >
              <div>
                <h1 className="text-base font-bold tracking-tight">Worksphere</h1>
                <p className="text-[10px] text-white/50 tracking-wider uppercase">Professional Ledger</p>
              </div>
            </div>
          </Link>
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
                className={`group relative flex items-center ${sidebarExpanded ? 'justify-start gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-lg text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30 scale-[1.01]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span
                  className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100 translate-x-0 max-w-[180px]' : 'opacity-0 -translate-x-2 max-w-0'}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={`p-4 border-t border-white/10 ${sidebarExpanded ? '' : 'flex justify-center'}`}>
          <div
            onClick={() => navigate('/settings')}
            className={`w-full text-left rounded-lg p-1 transition-all duration-300 hover:bg-white/10 cursor-pointer ${sidebarExpanded ? '' : 'max-w-[40px]'}`}
            title="Open profile settings"
          >
            <div className={`flex items-center ${sidebarExpanded ? 'gap-3' : 'justify-center'}`}>
              <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs shrink-0 ring-2 ring-white/20">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div
                className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'opacity-100 translate-x-0 max-w-[170px]' : 'opacity-0 -translate-x-2 max-w-0'}`}
              >
                <p className="text-sm font-semibold truncate capitalize">{user?.name || 'User'}</p>
                <p className="text-[10px] text-white/40">{user?.roles?.includes('company_owner') ? 'Company Owner' : 'Verified Professional'}</p>
              </div>
              {sidebarExpanded && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
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
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase hover:opacity-90 transition-opacity"
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
