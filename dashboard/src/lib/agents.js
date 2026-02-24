export const AGENTS = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    model: 'sonnet-4.6',
    color: '#6366F1',
    icon: '\uD83C\uDFAF',
    status: 'idle',
    description: 'Front-door agent that triages incoming messages and routes to specialist agents.',
    capabilities: ['Message Triage', 'Intent Classification', 'Agent Routing', 'Clarification'],
  },
  {
    id: 'analyst',
    name: 'Business Analyst',
    model: 'sonnet-4.6',
    color: '#8B5CF6',
    icon: '\uD83D\uDD0D',
    status: 'idle',
    description: 'Analyzes business requirements, gathers stakeholder input, and defines project scope.',
    capabilities: ['Requirements Analysis', 'Stakeholder Interviews', 'Market Research', 'Gap Analysis'],
  },
  {
    id: 'pm',
    name: 'Product Manager',
    model: 'sonnet-4.6',
    color: '#3B82F6',
    icon: '\uD83D\uDCCB',
    status: 'idle',
    description: 'Manages product roadmap, prioritizes features, and coordinates cross-team efforts.',
    capabilities: ['Roadmap Planning', 'Feature Prioritization', 'Sprint Planning', 'Stakeholder Communication'],
  },
  {
    id: 'architect',
    name: 'Solutions Architect',
    model: 'opus-4.6',
    color: '#10B981',
    icon: '\uD83C\uDFD7\uFE0F',
    status: 'idle',
    description: 'Designs system architecture, selects technology stack, and ensures scalability.',
    capabilities: ['System Design', 'API Design', 'Database Schema', 'Infrastructure Planning'],
  },
  {
    id: 'developer',
    name: 'Senior Developer',
    model: 'sonnet-4.6',
    color: '#F59E0B',
    icon: '\uD83D\uDCBB',
    status: 'idle',
    description: 'Implements features, writes production code, and handles integrations.',
    capabilities: ['Full-Stack Development', 'Code Review', 'API Integration', 'Performance Optimization'],
  },
  {
    id: 'tester',
    name: 'QA Engineer',
    model: 'sonnet-4.6',
    color: '#EF4444',
    icon: '\uD83E\uDDEA',
    status: 'idle',
    description: 'Creates test plans, runs test suites, and ensures quality standards.',
    capabilities: ['Test Planning', 'Automated Testing', 'Performance Testing', 'Bug Tracking'],
  },
  {
    id: 'scrum-master',
    name: 'Scrum Master',
    model: 'sonnet-4.6',
    color: '#EC4899',
    icon: '\uD83D\uDCCA',
    status: 'idle',
    description: 'Facilitates agile ceremonies, removes blockers, and tracks team velocity.',
    capabilities: ['Sprint Facilitation', 'Blocker Resolution', 'Velocity Tracking', 'Retrospectives'],
  },
];

export const AGENT_MAP = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

export const STATUS_COLORS = {
  idle: '#10B981',
  working: '#3B82F6',
  blocked: '#EF4444',
  reviewing: '#F59E0B',
};

export const PRIORITY_CONFIG = {
  critical: { color: '#EF4444', bg: 'bg-red-500/10', text: 'text-red-400', label: 'Critical' },
  high: { color: '#F97316', bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'High' },
  medium: { color: '#EAB308', bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Medium' },
  low: { color: '#22C55E', bg: 'bg-green-500/10', text: 'text-green-400', label: 'Low' },
};

export const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#64748B' },
  { id: 'todo', title: 'To Do', color: '#8B5CF6' },
  { id: 'in-progress', title: 'In Progress', color: '#3B82F6' },
  { id: 'review', title: 'Review', color: '#F59E0B' },
  { id: 'done', title: 'Done', color: '#10B981' },
];
