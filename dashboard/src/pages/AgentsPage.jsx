import React from 'react';
import {
  Cpu,
  MessageSquare,
  ListTodo,
  Activity,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import useStore from '../lib/store';
import { STATUS_COLORS, PRIORITY_CONFIG, AGENT_MAP } from '../lib/agents';

export default function AgentsPage() {
  const agents = useStore((s) => s.agents);
  const tasks = useStore((s) => s.tasks);
  const messages = useStore((s) => s.messages);
  const [expandedAgent, setExpandedAgent] = React.useState(null);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Agent Management</h1>
          <p className="text-sm text-surface-400 mt-0.5">
            Monitor and manage your AI agent team
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500">
            {agents.filter((a) => a.status === 'working').length}/{agents.length} active
          </span>
          <div className="flex items-center gap-1 text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-full">
            <Activity size={12} className="animate-pulse" />
            System Online
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {agents.map((agent) => {
          const agentTasks = tasks.filter((t) => t.agent === agent.id);
          const agentMessages = messages.filter(
            (m) => m.from === agent.id || m.to === agent.id
          );
          const isExpanded = expandedAgent === agent.id;

          const tasksByStatus = {
            backlog: agentTasks.filter((t) => t.status === 'backlog').length,
            todo: agentTasks.filter((t) => t.status === 'todo').length,
            'in-progress': agentTasks.filter((t) => t.status === 'in-progress').length,
            review: agentTasks.filter((t) => t.status === 'review').length,
            done: agentTasks.filter((t) => t.status === 'done').length,
          };

          return (
            <div key={agent.id} className="glass-panel overflow-hidden">
              {/* Agent header */}
              <button
                onClick={() =>
                  setExpandedAgent(isExpanded ? null : agent.id)
                }
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-surface-800/30 transition-colors"
              >
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: agent.color + '20' }}
                  >
                    {agent.icon}
                  </div>
                  <div
                    className="status-indicator absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5"
                    style={{
                      backgroundColor: STATUS_COLORS[agent.status],
                    }}
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">
                      {agent.name}
                    </h3>
                    <span
                      className="text-xs capitalize px-2 py-0.5 rounded-full"
                      style={{
                        color: STATUS_COLORS[agent.status],
                        backgroundColor: STATUS_COLORS[agent.status] + '15',
                        borderColor: STATUS_COLORS[agent.status] + '30',
                        borderWidth: '1px',
                      }}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-sm text-surface-400 mt-0.5">
                    {agent.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">
                      {agentTasks.length}
                    </p>
                    <p className="text-xs text-surface-500">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">
                      {agentMessages.length}
                    </p>
                    <p className="text-xs text-surface-500">Messages</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 rounded-lg border border-surface-700/50">
                    <Cpu size={14} className="text-surface-400" />
                    <span className="text-sm text-surface-300 font-mono">
                      {agent.model}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-surface-500" />
                  ) : (
                    <ChevronDown size={18} className="text-surface-500" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-surface-700/50 animate-fade-in">
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {/* Capabilities */}
                    <div className="bg-surface-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400" />
                        Capabilities
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="text-xs px-2 py-1 rounded-full bg-surface-700/50 text-surface-300"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Task breakdown */}
                    <div className="bg-surface-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <ListTodo size={14} className="text-blue-400" />
                        Tasks by Status
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(tasksByStatus).map(
                          ([status, count]) => (
                            <div
                              key={status}
                              className="flex items-center justify-between"
                            >
                              <span className="text-xs text-surface-400 capitalize">
                                {status.replace('-', ' ')}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1 bg-surface-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{
                                      width: `${
                                        agentTasks.length > 0
                                          ? (count / agentTasks.length) * 100
                                          : 0
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-surface-300 w-4 text-right">
                                  {count}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Recent messages */}
                    <div className="bg-surface-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <MessageSquare size={14} className="text-green-400" />
                        Recent Messages
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {agentMessages.slice(-4).reverse().map((msg) => {
                          const otherAgent =
                            msg.from === agent.id
                              ? AGENT_MAP[msg.to]
                              : AGENT_MAP[msg.from];
                          const isOutgoing = msg.from === agent.id;
                          return (
                            <div
                              key={msg.id}
                              className="text-xs"
                            >
                              <span className="text-surface-500">
                                {isOutgoing ? 'To' : 'From'}{' '}
                              </span>
                              <span
                                className="font-medium"
                                style={{ color: otherAgent.color }}
                              >
                                {otherAgent.name.split(' ')[0]}
                              </span>
                              <p className="text-surface-400 truncate mt-0.5">
                                {msg.content}
                              </p>
                            </div>
                          );
                        })}
                        {agentMessages.length === 0 && (
                          <p className="text-xs text-surface-600">
                            No messages yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task list */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">
                      All Tasks
                    </h4>
                    <div className="bg-surface-800/30 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="text-xs text-surface-500 border-b border-surface-700/50">
                            <th className="text-left px-3 py-2 font-medium">
                              Task
                            </th>
                            <th className="text-left px-3 py-2 font-medium">
                              Status
                            </th>
                            <th className="text-left px-3 py-2 font-medium">
                              Priority
                            </th>
                            <th className="text-left px-3 py-2 font-medium">
                              Workflow
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {agentTasks.map((task) => {
                            const pCfg = PRIORITY_CONFIG[task.priority];
                            return (
                              <tr
                                key={task.id}
                                className="text-xs border-b border-surface-700/30 hover:bg-surface-800/50"
                              >
                                <td className="px-3 py-2 text-white">
                                  {task.title}
                                </td>
                                <td className="px-3 py-2">
                                  <span className="capitalize text-surface-400">
                                    {task.status.replace('-', ' ')}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`inline-flex items-center gap-1 ${pCfg.text}`}
                                  >
                                    <span
                                      className="priority-dot"
                                      style={{
                                        backgroundColor: pCfg.color,
                                      }}
                                    />
                                    {pCfg.label}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-surface-400">
                                  {task.workflow}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
