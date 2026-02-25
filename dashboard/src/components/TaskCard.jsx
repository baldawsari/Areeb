import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical, X, RefreshCw, Trash2 } from 'lucide-react';
import { AGENT_MAP, PRIORITY_CONFIG } from '../lib/agents';
import useStore from '../lib/store';

export default function TaskCard({ task, overlay = false }) {
  const selectedTask = useStore((s) => s.selectedTask);
  const setSelectedTask = useStore((s) => s.setSelectedTask);
  const dismissTask = useStore((s) => s.dismissTask);
  const agent = AGENT_MAP[task.agent];
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isExpanded = selectedTask === task.id;

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (overlay) {
    return (
      <div className="task-card task-card-dragging">
        <CardContent
          task={task}
          agent={agent}
          priorityConfig={priorityConfig}
          formatTime={formatTime}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card group ${isDragging ? 'task-card-dragging' : ''}`}
    >
      <div className="flex items-start gap-1">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 rounded text-surface-600 hover:text-surface-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <GripVertical size={14} />
        </button>
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setSelectedTask(isExpanded ? null : task.id)}
        >
          <CardContent
            task={task}
            agent={agent}
            priorityConfig={priorityConfig}
            formatTime={formatTime}
            isExpanded={isExpanded}
          />
        </div>
        {task.source === 'agent' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissTask(task.id);
            }}
            className="mt-0.5 p-0.5 rounded text-surface-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            title="Dismiss synced task"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <ExpandedDetails
          task={task}
          agent={agent}
          formatTime={formatTime}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

function CardContent({ task, agent, priorityConfig, formatTime, isExpanded }) {
  return (
    <>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="priority-dot"
            style={{ backgroundColor: priorityConfig.color }}
          />
          <span className={`text-xs font-medium ${priorityConfig.text}`}>
            {priorityConfig.label}
          </span>
        </div>
        <span className="text-xs text-surface-500 flex items-center gap-1">
          {task.source === 'agent' && (
            <RefreshCw size={10} className="text-violet-400" title="Synced from agent board" />
          )}
          <Clock size={10} />
          {formatTime(task.updatedAt)}
        </span>
      </div>

      <h4 className="text-sm font-medium text-white mb-1.5 leading-snug">
        {task.title}
      </h4>

      {!isExpanded && task.description && (
        <p className="text-xs text-surface-500 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div
          className="agent-badge"
          style={{
            backgroundColor: agent.color + '15',
            color: agent.color,
          }}
        >
          <span className="text-xs">{agent.icon}</span>
          <span>{agent.name.split(' ')[0]}</span>
        </div>

        <span className="text-xs px-2 py-0.5 rounded bg-surface-700/50 text-surface-400">
          {task.workflow}
        </span>
      </div>
    </>
  );
}

function ExpandedDetails({ task, agent, formatTime, onClose }) {
  return (
    <div className="mt-3 pt-3 border-t border-surface-700/50 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          Details
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-surface-500 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <p className="text-xs text-surface-400 mb-3 leading-relaxed">
        {task.description}
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-surface-500">Agent</span>
          <p className="text-white mt-0.5">
            {agent.icon} {agent.name}
          </p>
        </div>
        <div>
          <span className="text-surface-500">Model</span>
          <p className="text-white mt-0.5">{agent.model}</p>
        </div>
        <div>
          <span className="text-surface-500">Created</span>
          <p className="text-white mt-0.5">{formatTime(task.createdAt)}</p>
        </div>
        <div>
          <span className="text-surface-500">Updated</span>
          <p className="text-white mt-0.5">{formatTime(task.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
