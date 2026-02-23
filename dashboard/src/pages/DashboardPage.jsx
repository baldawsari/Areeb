import React from 'react';
import { X, Filter, BarChart3, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import AgentPanel from '../components/AgentPanel';
import MessageFeed from '../components/MessageFeed';
import useStore from '../lib/store';
import { AGENT_MAP } from '../lib/agents';

export default function DashboardPage() {
  const tasks = useStore((s) => s.tasks);
  const filterAgent = useStore((s) => s.filterAgent);
  const filterWorkflow = useStore((s) => s.filterWorkflow);
  const clearFilters = useStore((s) => s.clearFilters);
  const [showMessages, setShowMessages] = React.useState(true);

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    critical: tasks.filter((t) => t.priority === 'critical' && t.status !== 'done').length,
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <StatCard
          icon={<BarChart3 size={16} />}
          label="Total Tasks"
          value={stats.total}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatCard
          icon={<Clock size={16} />}
          label="In Progress"
          value={stats.inProgress}
          color="text-yellow-400"
          bg="bg-yellow-500/10"
        />
        <StatCard
          icon={<CheckCircle2 size={16} />}
          label="Completed"
          value={stats.done}
          color="text-green-400"
          bg="bg-green-500/10"
        />
        <StatCard
          icon={<AlertCircle size={16} />}
          label="Critical"
          value={stats.critical}
          color="text-red-400"
          bg="bg-red-500/10"
        />

        {/* Active filters */}
        {(filterAgent || filterWorkflow) && (
          <div className="flex items-center gap-2 ml-auto">
            <Filter size={14} className="text-surface-500" />
            {filterAgent && (
              <span className="inline-flex items-center gap-1 text-xs bg-surface-800 border border-surface-700 rounded-full px-2.5 py-1 text-surface-300">
                {AGENT_MAP[filterAgent].icon} {AGENT_MAP[filterAgent].name}
                <button
                  onClick={clearFilters}
                  className="ml-1 text-surface-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filterWorkflow && (
              <span className="inline-flex items-center gap-1 text-xs bg-surface-800 border border-surface-700 rounded-full px-2.5 py-1 text-surface-300">
                {filterWorkflow}
                <button
                  onClick={clearFilters}
                  className="ml-1 text-surface-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Toggle messages */}
        <button
          onClick={() => setShowMessages(!showMessages)}
          className={`btn-ghost ml-auto ${showMessages ? 'text-blue-400' : ''}`}
        >
          {showMessages ? 'Hide' : 'Show'} Messages
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Kanban */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <KanbanBoard />
        </div>

        {/* Right panel */}
        {showMessages && (
          <div className="w-96 shrink-0 flex flex-col gap-4 min-h-0 hidden xl:flex">
            <div className="flex-1 min-h-0">
              <MessageFeed />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="glass-panel px-4 py-2.5 flex items-center gap-3">
      <div className={`p-1.5 rounded-lg ${bg}`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-surface-500">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
