import React from 'react';
import { Send, Filter, ArrowRight } from 'lucide-react';
import useStore from '../lib/store';
import { AGENT_MAP } from '../lib/agents';

const FALLBACK_AGENTS = {
  user: { id: 'user', name: 'User', color: '#6B7280', icon: '\uD83D\uDC64' },
};
const getAgent = (id) => AGENT_MAP[id] || FALLBACK_AGENTS[id] || { id, name: id, color: '#6B7280', icon: '\uD83D\uDCA1' };

const MESSAGE_TYPE_STYLES = {
  handoff: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', label: 'Handoff' },
  directive: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Directive' },
  question: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Question' },
  response: { bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Response' },
  status: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Status' },
  info: { bg: 'bg-surface-500/10', border: 'border-surface-500/20', label: 'Info' },
};

export default function MessageFeed() {
  const messages = useStore((s) => s.messages);
  const agents = useStore((s) => s.agents);
  const addMessage = useStore((s) => s.addMessage);
  const feedRef = React.useRef(null);
  const [filterFrom, setFilterFrom] = React.useState('');
  const [filterTo, setFilterTo] = React.useState('');
  const [newMessage, setNewMessage] = React.useState({
    from: 'pm',
    to: 'developer',
    content: '',
    type: 'directive',
  });

  const filtered = messages.filter((m) => {
    if (filterFrom && m.from !== filterFrom) return false;
    if (filterTo && m.to !== filterTo) return false;
    return true;
  });

  React.useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.content.trim()) return;
    addMessage(newMessage);
    setNewMessage({ ...newMessage, content: '' });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="glass-panel flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/50">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
          Agent Communication
        </h2>
        <span className="text-xs text-surface-500">{filtered.length} messages</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-700/50">
        <Filter size={12} className="text-surface-500 shrink-0" />
        <select
          className="bg-surface-800 text-xs text-surface-300 rounded px-2 py-1 border border-surface-700/50 outline-none"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
        >
          <option value="">All senders</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.icon} {a.name}
            </option>
          ))}
        </select>
        <ArrowRight size={12} className="text-surface-600" />
        <select
          className="bg-surface-800 text-xs text-surface-300 rounded px-2 py-1 border border-surface-700/50 outline-none"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
        >
          <option value="">All recipients</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.icon} {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div ref={feedRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((msg) => {
          const fromAgent = getAgent(msg.from);
          const toAgent = getAgent(msg.to);
          const typeStyle = MESSAGE_TYPE_STYLES[msg.type] || MESSAGE_TYPE_STYLES.info;

          return (
            <div key={msg.id} className="animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: fromAgent.color + '20' }}
                >
                  {fromAgent.icon}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: fromAgent.color }}
                >
                  {fromAgent.name.split(' ')[0]}
                </span>
                <ArrowRight size={10} className="text-surface-600" />
                <span
                  className="text-xs font-medium"
                  style={{ color: toAgent.color }}
                >
                  {toAgent.name.split(' ')[0]}
                </span>
                <span
                  className={`text-xs px-1.5 py-0 rounded ${typeStyle.bg} border ${typeStyle.border}`}
                >
                  {typeStyle.label}
                </span>
                <span className="text-xs text-surface-600 ml-auto">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className="ml-7 message-bubble bg-surface-800/60 border border-surface-700/30">
                <p className="text-surface-300">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-full text-surface-600 text-sm">
            No messages found
          </div>
        )}
      </div>

      {/* Compose */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-surface-700/50"
      >
        <div className="flex items-center gap-2 mb-2">
          <select
            className="bg-surface-800 text-xs text-surface-300 rounded px-2 py-1 border border-surface-700/50 outline-none"
            value={newMessage.from}
            onChange={(e) =>
              setNewMessage({ ...newMessage, from: e.target.value })
            }
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name}
              </option>
            ))}
          </select>
          <ArrowRight size={12} className="text-surface-600" />
          <select
            className="bg-surface-800 text-xs text-surface-300 rounded px-2 py-1 border border-surface-700/50 outline-none"
            value={newMessage.to}
            onChange={(e) =>
              setNewMessage({ ...newMessage, to: e.target.value })
            }
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name}
              </option>
            ))}
          </select>
          <select
            className="bg-surface-800 text-xs text-surface-300 rounded px-2 py-1 border border-surface-700/50 outline-none"
            value={newMessage.type}
            onChange={(e) =>
              setNewMessage({ ...newMessage, type: e.target.value })
            }
          >
            <option value="directive">Directive</option>
            <option value="handoff">Handoff</option>
            <option value="question">Question</option>
            <option value="response">Response</option>
            <option value="status">Status</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Type a message..."
            value={newMessage.content}
            onChange={(e) =>
              setNewMessage({ ...newMessage, content: e.target.value })
            }
          />
          <button type="submit" className="btn-primary px-3">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
