import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Activity, Search, Wifi, WifiOff, Loader2, Shield, ShieldCheck } from 'lucide-react';
import useStore from '../lib/store';
import gateway from '../lib/gateway';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/agents', label: 'Agents' },
  { path: '/workflows', label: 'Workflows' },
  { path: '/memory', label: 'Memory' },
  { path: '/settings', label: 'Settings' },
];

const CONNECTION_STATUS = {
  disconnected: { color: 'text-surface-500', bg: 'bg-surface-500/10', border: 'border-surface-500/20', label: 'Offline', Icon: WifiOff },
  connecting: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Connecting...', Icon: Loader2 },
  connected: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Live', Icon: Wifi },
  error: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Error', Icon: WifiOff },
};

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const messages = useStore((s) => s.messages);
  const tasks = useStore((s) => s.tasks);
  const connectionStatus = useStore((s) => s.connectionStatus);
  const connectGateway = useStore((s) => s.connectGateway);
  const disconnectGateway = useStore((s) => s.disconnectGateway);
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Auto-connect on mount
  React.useEffect(() => {
    const url = import.meta.env.VITE_GATEWAY_URL || 'ws://localhost:18789';
    const token = import.meta.env.VITE_GATEWAY_TOKEN || '';
    if (token) {
      connectGateway(url, token);
    }
    return () => disconnectGateway();
  }, []);

  const gatewayInfo = useStore((s) => s.gatewayInfo);
  const activeTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const recentMessages = messages.slice(-3).reverse();
  const telegramStatus = gatewayInfo?.channels?.telegram;

  const connCfg = CONNECTION_STATUS[connectionStatus] || CONNECTION_STATUS.disconnected;
  const ConnIcon = connCfg.Icon;

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
        {/* Connection status */}
        <button
          onClick={() => {
            if (connectionStatus === 'connected') {
              disconnectGateway();
            } else if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
              const url = import.meta.env.VITE_GATEWAY_URL || 'ws://localhost:18789';
              const token = import.meta.env.VITE_GATEWAY_TOKEN || '';
              connectGateway(url, token);
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 ${connCfg.bg} border ${connCfg.border} rounded-full cursor-pointer hover:opacity-80 transition-opacity`}
          title={connectionStatus === 'connected' ? 'Click to disconnect' : 'Click to connect to gateway'}
        >
          <ConnIcon size={14} className={`${connCfg.color} ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
          <span className={`text-xs font-medium ${connCfg.color}`}>
            {connCfg.label}
          </span>
        </button>

        {connectionStatus === 'connected' && (
          <div
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full ${
              gateway.hasScope('operator.read')
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-yellow-500/10 border border-yellow-500/20'
            }`}
            title={`Scopes: ${gateway.grantedScopes.join(', ') || 'none'}`}
          >
            {gateway.hasScope('operator.read') ? (
              <ShieldCheck size={12} className="text-green-400" />
            ) : (
              <Shield size={12} className="text-yellow-400" />
            )}
            <span className={`text-xs font-medium ${
              gateway.hasScope('operator.read') ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {gateway.hasScope('operator.read') ? 'Full' : 'Limited'}
            </span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-800 rounded-lg border border-surface-700/50">
          <Search size={14} className="text-surface-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="bg-transparent text-sm text-white placeholder-surface-500 outline-none w-40"
          />
        </div>

        {connectionStatus === 'connected' && telegramStatus && (
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              telegramStatus.running
                ? 'bg-green-500/10 border border-green-500/20'
                : telegramStatus.configured
                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                  : 'bg-surface-500/10 border border-surface-500/20'
            }`}
            title={telegramStatus.running ? 'Telegram bot active' : telegramStatus.configured ? 'Telegram configured but stopped' : 'Telegram not configured'}
          >
            <span className="text-xs">
              {telegramStatus.running ? '\u2705' : telegramStatus.configured ? '\u26A0\uFE0F' : '\u274C'}
            </span>
            <span className={`text-xs font-medium ${
              telegramStatus.running ? 'text-green-400' : telegramStatus.configured ? 'text-yellow-400' : 'text-surface-400'
            }`}>
              TG
            </span>
          </div>
        )}

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
            {messages.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}
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
