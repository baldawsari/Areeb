import React from 'react';
import { Cpu, MessageSquare, ChevronRight } from 'lucide-react';
import useStore from '../lib/store';
import { STATUS_COLORS, PRIORITY_CONFIG } from '../lib/agents';

export default function AgentPanel() {
  const agents = useStore((s) => s.agents);
  const tasks = useStore((s) => s.tasks);
  const filterAgent = useStore((s) => s.filterAgent);
  const setFilterAgent = useStore((s) => s.setFilterAgent);

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
          Agent Status
        </h2>
        <span className="text-xs text-surface-500">
          {agents.filter((a) => a.status === 'working').length} active
        </span>
      </div>

      <div className="space-y-2">
        {agents.map((agent) => {
          const agentTasks = tasks.filter((t) => t.agent === agent.id);
          const activeTasks = agentTasks.filter(
            (t) => t.status === 'in-progress'
          );
          const currentTask = activeTasks[0];
          const isSelected = filterAgent === agent.id;

          return (
            <button
              key={agent.id}
              onClick={() => setFilterAgent(agent.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-150 ${
                isSelected
                  ? 'bg-surface-800 ring-1 ring-surface-600'
                  : 'hover:bg-surface-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: agent.color + '20' }}
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
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white truncate">
                      {agent.name}
                    </h4>
                    <ChevronRight
                      size={14}
                      className="text-surface-600 shrink-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <Cpu size={10} />
                      {agent.model}
                    </span>
                    <span
                      className="text-xs capitalize px-1.5 py-0 rounded"
                      style={{
                        color: STATUS_COLORS[agent.status],
                        backgroundColor: STATUS_COLORS[agent.status] + '15',
                      }}
                    >
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>

              {currentTask && (
                <div className="mt-2 ml-13 pl-[52px]">
                  <div className="text-xs text-surface-400 bg-surface-800/80 rounded px-2 py-1.5 border border-surface-700/50">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span
                        className="priority-dot"
                        style={{
                          backgroundColor:
                            PRIORITY_CONFIG[currentTask.priority].color,
                        }}
                      />
                      <span className="text-surface-500 font-medium">
                        Current:
                      </span>
                    </div>
                    <p className="text-surface-300 truncate">
                      {currentTask.title}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mt-2 pl-[52px]">
                <span className="text-xs text-surface-500">
                  {agentTasks.length} tasks
                </span>
                <span className="text-xs text-surface-600">|</span>
                <span className="text-xs text-surface-500 flex items-center gap-1">
                  <MessageSquare size={10} />
                  {agent.messageCount} msgs
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
