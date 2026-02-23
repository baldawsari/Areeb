import React from 'react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  Clock,
  Plus,
  AlertTriangle,
  X,
} from 'lucide-react';
import WorkflowView from '../components/WorkflowView';
import useStore from '../lib/store';
import { AGENT_MAP, COLUMNS } from '../lib/agents';

const AVAILABLE_WORKFLOWS = [
  {
    name: 'Feature Development',
    description:
      'Full lifecycle feature development from requirements to deployment.',
    stages: [
      'Requirements Analysis',
      'Design',
      'Implementation',
      'Testing',
      'Deployment',
    ],
    agents: ['analyst', 'architect', 'developer', 'tester'],
  },
  {
    name: 'Bug Fix Pipeline',
    description:
      'Rapid bug triage, investigation, fix, and verification cycle.',
    stages: ['Triage', 'Investigation', 'Fix', 'Verification'],
    agents: ['tester', 'developer', 'scrum-master'],
  },
  {
    name: 'Sprint Ceremony',
    description:
      'Sprint ceremony coordination including planning, standups, and retrospectives.',
    stages: ['Backlog Grooming', 'Sprint Planning', 'Execution', 'Review', 'Retro'],
    agents: ['scrum-master', 'pm', 'developer'],
  },
  {
    name: 'Technical Spike',
    description:
      'Time-boxed research and prototyping for technical feasibility assessment.',
    stages: ['Research', 'Prototyping', 'Documentation', 'Decision'],
    agents: ['architect', 'developer'],
  },
];

export default function WorkflowsPage() {
  const getWorkflows = useStore((s) => s.getWorkflows);
  const workflows = getWorkflows();
  const [showNewWorkflow, setShowNewWorkflow] = React.useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Workflows</h1>
          <p className="text-sm text-surface-400 mt-0.5">
            Manage active and available workflows
          </p>
        </div>
        <button
          onClick={() => setShowNewWorkflow(!showNewWorkflow)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch size={16} className="text-blue-400" />
            <span className="text-xs text-surface-500">Active Workflows</span>
          </div>
          <p className="text-2xl font-bold text-white">{workflows.length}</p>
        </div>
        <div className="glass-panel px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Play size={16} className="text-green-400" />
            <span className="text-xs text-surface-500">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {workflows.filter((w) => w.progress > 0 && w.progress < 100).length}
          </p>
        </div>
        <div className="glass-panel px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-xs text-surface-500">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {workflows.filter((w) => w.progress === 100).length}
          </p>
        </div>
        <div className="glass-panel px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-yellow-400" />
            <span className="text-xs text-surface-500">Avg. Progress</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {workflows.length > 0
              ? Math.round(
                  workflows.reduce((acc, w) => acc + w.progress, 0) /
                    workflows.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Active workflows */}
      <div>
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
          Active Workflows
        </h2>
        <WorkflowView />
      </div>

      {/* Available workflow templates */}
      {showNewWorkflow && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
              Available Templates
            </h2>
            <button
              onClick={() => setShowNewWorkflow(false)}
              className="text-surface-500 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_WORKFLOWS.map((wf) => (
              <div
                key={wf.name}
                className="glass-panel p-4 hover:border-blue-500/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {wf.description}
                    </p>
                  </div>
                  <button className="btn-ghost text-xs flex items-center gap-1">
                    <Play size={12} />
                    Start
                  </button>
                </div>

                {/* Stages */}
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  {wf.stages.map((stage, i) => (
                    <React.Fragment key={stage}>
                      <span className="text-xs px-2 py-0.5 rounded bg-surface-800 text-surface-400">
                        {stage}
                      </span>
                      {i < wf.stages.length - 1 && (
                        <span className="text-surface-700 text-xs">
                          &rarr;
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Assigned agents */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-surface-500 mr-1">
                    Agents:
                  </span>
                  <div className="flex -space-x-1.5">
                    {wf.agents.map((agentId) => {
                      const agent = AGENT_MAP[agentId];
                      return (
                        <div
                          key={agentId}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-surface-900"
                          style={{
                            backgroundColor: agent.color + '30',
                          }}
                          title={agent.name}
                        >
                          {agent.icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
