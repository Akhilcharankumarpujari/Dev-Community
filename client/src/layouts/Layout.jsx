import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import {
  Sun,
  Moon,
  Search,
  Bell,
  Plus,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Home,
  Bookmark,
  TrendingUp,
  Shield,
  HelpCircle,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const res = await notificationsAPI.getAll();
          const unreads = res.data.notifications.filter(n => !n.isRead).length;
          setUnreadCount(unreads);
        } catch (err) {
          console.error(err);
        }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000); // Poll notifications every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setDropdownOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const mainNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Trending', path: '/trending', icon: TrendingUp },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark, protected: true },
    { name: 'Notifications', path: '/notifications', icon: Bell, protected: true, badge: unreadCount },
    { name: 'Settings', path: '/settings', icon: Settings, protected: true },
  ];

  if (user && user.role === 'admin') {
    mainNavItems.push({ name: 'Admin Dashboard', path: '/admin', icon: Shield });
  }

  return (
    <div className="min-h-screen flex flex-col bg-dev-bg dark:bg-dev-bg-dark text-dev-text dark:text-dev-text-dark font-sans">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-dev-card-dark border-b border-dev-border dark:border-dev-border-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded-md text-lg font-black font-mono">
                DEV
              </span>
              <span className="hidden sm:inline font-semibold">Community</span>
            </Link>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search posts, tags or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-transparent border border-dev-border dark:border-dev-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-dev-brand/50 focus:border-dev-brand text-sm transition-all"
            />
            <Search className="absolute left-3 text-gray-400" size={18} />
          </form>

          {/* Action elements / User account settings */}
          <div className="flex items-center gap-3">
            {/* Search icon triggers route on mobile */}
            <Link
              to="/search"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-850 md:hidden text-gray-600 dark:text-gray-300"
            >
              <Search size={20} />
            </Link>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                <Link
                  to="/new"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent border border-dev-brand text-dev-brand hover:bg-dev-brand hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-slate-900 rounded-md font-medium text-sm transition-all shadow-sm"
                >
                  <Plus size={16} />
                  <span>Create Post</span>
                </Link>

                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                    className="flex items-center gap-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-dev-border dark:border-dev-border-dark"
                    />
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-dev-card-dark border border-dev-border dark:border-dev-border-dark rounded-md shadow-lg py-1 z-50 text-sm">
                      <div className="px-4 py-2 border-b border-dev-border dark:border-dev-border-dark">
                        <p className="font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                      </div>

                      <Link
                        to={`/u/${user.username}`}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-850"
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/new"
                        className="flex sm:hidden items-center gap-2 px-4 py-2 text-slate-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-850"
                      >
                        <Plus size={16} />
                        <span>Create Post</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-850"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut size={16} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/enter"
                  className="px-3.5 py-1.5 text-slate-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-md font-medium text-sm transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/enter?signup=true"
                  className="px-3.5 py-1.5 bg-dev-brand hover:bg-dev-brand-hover text-white rounded-md font-semibold text-sm transition-colors shadow-sm"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid Layout Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex gap-6 relative">
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="hidden md:block w-56 shrink-0 space-y-4">
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              if (item.protected && !user) return null;
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                    isActive
                      ? 'bg-white dark:bg-slate-850 text-dev-brand dark:text-blue-400 shadow-sm'
                      : 'text-slate-700 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Left Sidebar Community Footer Info Box */}
          <div className="p-4 bg-white dark:bg-dev-card-dark rounded-lg border border-dev-border dark:border-dev-border-dark space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">DEV Community</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              A constructive and inclusive social network for software developers. With you every step of your journey.
            </p>
            <div className="text-xs font-semibold text-gray-400">
              © 2026 DEV Community.
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Sidebar Navigation */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Drawer menu content */}
          <div className="relative w-64 bg-white dark:bg-dev-card-dark h-full flex flex-col p-5 border-r border-dev-border dark:border-dev-border-dark">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg">Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md hover:bg-gray-150 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              {mainNavItems.map((item) => {
                if (item.protected && !user) return null;
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-850 text-dev-brand dark:text-blue-400'
                        : 'text-slate-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 ? (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
