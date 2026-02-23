import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Activity, Search } from 'lucide-react';
import useStore from '../lib/store';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/agents', label: 'Agents' },
  { path: '/workflows', label: 'Workflows' },
  { path: '/memory', label: 'Memory' },
  { path: '/settings', label: 'Settings' },
];

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const messages = useStore((s) => s.messages);
  const tasks = useStore((s) => s.tasks);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const activeTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const recentMessages = messages.slice(-3).reverse();

  return (
    <header className="h-14 border-b border-surface-700/50 bg-surface-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <span className="text-lg font-semibold text-white hidden sm:block">
            AI Agent Team
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1 ml-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ? 'nav-link-active' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-800 rounded-lg border border-surface-700/50">
          <Search size={14} className="text-surface-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="bg-transparent text-sm text-white placeholder-surface-500 outline-none w-40"
          />
        </div>

        {activeTasks > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Activity size={14} className="text-blue-400 animate-pulse" />
            <span className="text-xs font-medium text-blue-400">
              {activeTasks} active
            </span>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 glass-panel shadow-xl shadow-black/30 p-1 z-50">
              <div className="px-3 py-2 border-b border-surface-700/50">
                <span className="text-sm font-medium text-white">
                  Recent Activity
                </span>
              </div>
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="px-3 py-2 hover:bg-surface-800/50 rounded-lg cursor-pointer"
                >
                  <p className="text-xs text-surface-400">
                    <span className="text-white font-medium">{msg.from}</span>
                    {' -> '}
                    <span className="text-white font-medium">{msg.to}</span>
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5 truncate">
                    {msg.content}
                  </p>
                </div>
              ))}
              <div className="px-3 py-2 border-t border-surface-700/50">
                <Link
                  to="/"
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={() => setShowNotifications(false)}
                >
                  View all messages
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
