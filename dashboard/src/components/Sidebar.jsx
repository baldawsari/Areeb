import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Brain,
  Settings,
  Plus,
  MessageSquare,
  ChevronLeft,
  Filter,
  X,
} from 'lucide-react';
import useStore from '../lib/store';
import { AGENT_MAP, STATUS_COLORS } from '../lib/agents';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/agents', label: 'Agents', icon: Users },
  { path: '/workflows', label: 'Workflows', icon: GitBranch },
  { path: '/memory', label: 'Memory', icon: Brain },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const agents = useStore((s) => s.agents);
  const filterAgent = useStore((s) => s.filterAgent);
  const setFilterAgent = useStore((s) => s.setFilterAgent);
  const clearFilters = useStore((s) => s.clearFilters);
  const [showNewTask, setShowNewTask] = React.useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface-900 border-r border-surface-700/50 flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-0 lg:overflow-hidden'
        }`}
      >
        {/* Sidebar header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-surface-700/50 shrink-0">
          <span className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            Navigation
          </span>
          <button
            onClick={onToggle}
            className="p-1 rounded text-surface-500 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-surface-700/50 my-2" />

        {/* Agent list */}
        <div className="px-3 py-2 flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              Agents
            </span>
            {filterAgent && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <X size={10} />
                Clear
              </button>
            )}
          </div>

          <div className="space-y-0.5">
            {agents.map((agent) => {
              const isFiltered = filterAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setFilterAgent(agent.id)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all duration-150 ${
                    isFiltered
                      ? 'bg-surface-800 ring-1 ring-surface-600'
                      : 'hover:bg-surface-800/60'
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: agent.color + '20',
                      }}
                    >
                      {agent.icon}
                    </div>
                    <div
                      className="status-indicator absolute -bottom-0.5 -right-0.5"
                      style={{
                        backgroundColor: STATUS_COLORS[agent.status],
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{agent.name}</p>
                    <p className="text-xs text-surface-500 capitalize">
                      {agent.status}
                    </p>
                  </div>
                  {agent.sessionCount > 0 && (
                    <span className="text-xs bg-surface-700 text-surface-300 px-1.5 py-0.5 rounded-full" title="Active sessions">
                      {agent.sessionCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="p-3 border-t border-surface-700/50 space-y-1.5 shrink-0">
          <button
            onClick={() => setShowNewTask(true)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            New Task
          </button>
          <button className="w-full btn-ghost flex items-center justify-center gap-2">
            <MessageSquare size={16} />
            Send Message
          </button>
        </div>

        {/* New Task Modal */}
        {showNewTask && (
          <NewTaskModal onClose={() => setShowNewTask(false)} />
        )}
      </aside>
    </>
  );
}

function NewTaskModal({ onClose }) {
  const addTask = useStore((s) => s.addTask);
  const agents = useStore((s) => s.agents);
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    agent: 'developer',
    priority: 'medium',
    workflow: 'Authentication System',
    status: 'backlog',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">New Task</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-surface-400 mb-1">Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="Task title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-surface-400 mb-1">
              Description
            </label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="Task description..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-surface-400 mb-1">
                Assign To
              </label>
              <select
                className="input-field"
                value={form.agent}
                onChange={(e) => setForm({ ...form, agent: e.target.value })}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">
                Priority
              </label>
              <select
                className="input-field"
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-surface-400 mb-1">
                Workflow
              </label>
              <input
                type="text"
                className="input-field"
                value={form.workflow}
                onChange={(e) =>
                  setForm({ ...form, workflow: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-1">
                Status
              </label>
              <select
                className="input-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
