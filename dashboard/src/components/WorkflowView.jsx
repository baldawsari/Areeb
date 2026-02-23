import React from 'react';
import { GitBranch, CheckCircle2, Circle, PlayCircle, Clock } from 'lucide-react';
import useStore from '../lib/store';
import { AGENT_MAP, COLUMNS } from '../lib/agents';

const WORKFLOW_STAGES = ['backlog', 'todo', 'in-progress', 'review', 'done'];

export default function WorkflowView() {
  const getWorkflows = useStore((s) => s.getWorkflows);
  const workflows = getWorkflows();

  return (
    <div className="space-y-4">
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.name} workflow={workflow} />
      ))}
    </div>
  );
}

function WorkflowCard({ workflow }) {
  const [expanded, setExpanded] = React.useState(false);

  // Determine current stage - the most advanced active stage
  const stagePresence = WORKFLOW_STAGES.map((stage) =>
    workflow.tasks.some((t) => t.status === stage)
  );

  const currentStageIndex = stagePresence.lastIndexOf(true);

  const getStageIcon = (index) => {
    if (index < currentStageIndex) {
      return <CheckCircle2 size={16} className="text-green-400" />;
    }
    if (index === currentStageIndex) {
      return <PlayCircle size={16} className="text-blue-400 animate-pulse" />;
    }
    return <Circle size={16} className="text-surface-600" />;
  };

  return (
    <div className="glass-panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GitBranch size={18} className="text-blue-400" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">
              {workflow.name}
            </h3>
            <p className="text-xs text-surface-500">
              {workflow.total} tasks &middot; {workflow.agents.length} agents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Agent avatars */}
          <div className="flex -space-x-2">
            {workflow.agents.map((agentId) => {
              const agent = AGENT_MAP[agentId];
              return (
                <div
                  key={agentId}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-surface-900"
                  style={{ backgroundColor: agent.color + '30' }}
                  title={agent.name}
                >
                  {agent.icon}
                </div>
              );
            })}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-surface-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${workflow.progress}%`,
                  backgroundColor:
                    workflow.progress === 100 ? '#10B981' : '#3B82F6',
                }}
              />
            </div>
            <span className="text-xs font-medium text-surface-400 w-8 text-right">
              {workflow.progress}%
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-700/50 animate-fade-in">
          {/* Stage timeline */}
          <div className="flex items-center justify-between py-4 px-2">
            {WORKFLOW_STAGES.map((stage, index) => {
              const col = COLUMNS.find((c) => c.id === stage);
              const stageTasks = workflow.tasks.filter(
                (t) => t.status === stage
              );
              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center gap-1">
                    {getStageIcon(index)}
                    <span className="text-xs text-surface-400 font-medium">
                      {col.title}
                    </span>
                    <span className="text-xs text-surface-600">
                      {stageTasks.length} task{stageTasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {index < WORKFLOW_STAGES.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-2 ${
                        index < currentStageIndex
                          ? 'bg-green-500/40'
                          : 'bg-surface-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Task list by stage */}
          <div className="space-y-2">
            {workflow.tasks.map((task) => {
              const agent = AGENT_MAP[task.agent];
              const col = COLUMNS.find((c) => c.id === task.status);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2 bg-surface-800/50 rounded-lg"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="text-xs text-white flex-1 truncate">
                    {task.title}
                  </span>
                  <div
                    className="agent-badge shrink-0"
                    style={{
                      backgroundColor: agent.color + '15',
                      color: agent.color,
                    }}
                  >
                    <span className="text-xs">{agent.icon}</span>
                    <span>{agent.name.split(' ')[0]}</span>
                  </div>
                  <span className="text-xs text-surface-500 shrink-0 flex items-center gap-1">
                    <Clock size={10} />
                    {col.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
