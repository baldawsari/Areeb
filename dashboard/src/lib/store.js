import { create } from 'zustand';
import { AGENTS } from './agents';
import gateway from './gateway';

const SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Gather requirements for user auth module',
    description: 'Interview stakeholders and document functional and non-functional requirements for the authentication system including OAuth2, SSO, and MFA flows.',
    status: 'done',
    agent: 'analyst',
    priority: 'high',
    workflow: 'Authentication System',
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-02-21T14:30:00Z',
  },
  {
    id: 'task-2',
    title: 'Define product roadmap for Q1',
    description: 'Create a detailed product roadmap covering features, milestones, and deliverables for Q1 2026 based on stakeholder input and market analysis.',
    status: 'review',
    agent: 'pm',
    priority: 'critical',
    workflow: 'Sprint Planning',
    createdAt: '2026-02-19T10:00:00Z',
    updatedAt: '2026-02-22T11:00:00Z',
  },
  {
    id: 'task-3',
    title: 'Design microservices architecture',
    description: 'Architect the system using microservices patterns. Define service boundaries, API contracts, data ownership, and communication protocols.',
    status: 'in-progress',
    agent: 'architect',
    priority: 'critical',
    workflow: 'Authentication System',
    createdAt: '2026-02-21T08:00:00Z',
    updatedAt: '2026-02-23T09:15:00Z',
  },
  {
    id: 'task-4',
    title: 'Implement JWT token service',
    description: 'Build the JWT token generation, validation, and refresh service with RS256 signing. Includes token blacklisting and rotation policies.',
    status: 'in-progress',
    agent: 'developer',
    priority: 'high',
    workflow: 'Authentication System',
    createdAt: '2026-02-22T09:00:00Z',
    updatedAt: '2026-02-23T10:30:00Z',
  },
  {
    id: 'task-5',
    title: 'Write integration tests for auth API',
    description: 'Create comprehensive integration test suite for authentication endpoints covering login, registration, token refresh, password reset, and MFA verification.',
    status: 'todo',
    agent: 'tester',
    priority: 'high',
    workflow: 'Authentication System',
    createdAt: '2026-02-22T14:00:00Z',
    updatedAt: '2026-02-22T14:00:00Z',
  },
  {
    id: 'task-6',
    title: 'Sprint retrospective - Sprint 4',
    description: 'Facilitate the sprint retrospective meeting. Collect team feedback, identify improvements, and create action items for Sprint 5.',
    status: 'todo',
    agent: 'scrum-master',
    priority: 'medium',
    workflow: 'Sprint Planning',
    createdAt: '2026-02-23T08:00:00Z',
    updatedAt: '2026-02-23T08:00:00Z',
  },
  {
    id: 'task-7',
    title: 'Database schema design for user profiles',
    description: 'Design the relational database schema for user profiles, roles, permissions, and session management with proper indexing strategies.',
    status: 'review',
    agent: 'architect',
    priority: 'high',
    workflow: 'Authentication System',
    createdAt: '2026-02-20T11:00:00Z',
    updatedAt: '2026-02-22T16:00:00Z',
  },
  {
    id: 'task-8',
    title: 'Build user registration flow',
    description: 'Implement the complete user registration flow including email verification, input validation, and welcome email integration.',
    status: 'todo',
    agent: 'developer',
    priority: 'medium',
    workflow: 'Authentication System',
    createdAt: '2026-02-23T07:00:00Z',
    updatedAt: '2026-02-23T07:00:00Z',
  },
  {
    id: 'task-9',
    title: 'Competitive analysis report',
    description: 'Research competitor products, compile feature comparison matrix, and provide recommendations for differentiation strategy.',
    status: 'backlog',
    agent: 'analyst',
    priority: 'low',
    workflow: 'Market Research',
    createdAt: '2026-02-18T09:00:00Z',
    updatedAt: '2026-02-18T09:00:00Z',
  },
  {
    id: 'task-10',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions workflows for automated testing, linting, building, and deployment to staging and production environments.',
    status: 'backlog',
    agent: 'developer',
    priority: 'medium',
    workflow: 'DevOps',
    createdAt: '2026-02-17T10:00:00Z',
    updatedAt: '2026-02-17T10:00:00Z',
  },
  {
    id: 'task-11',
    title: 'Performance test plan',
    description: 'Create a comprehensive performance testing plan including load testing, stress testing, and endurance testing strategies for the auth system.',
    status: 'backlog',
    agent: 'tester',
    priority: 'low',
    workflow: 'Authentication System',
    createdAt: '2026-02-19T15:00:00Z',
    updatedAt: '2026-02-19T15:00:00Z',
  },
  {
    id: 'task-12',
    title: 'Define sprint velocity metrics',
    description: 'Establish velocity tracking metrics, burndown chart parameters, and team capacity planning formulas for sprint forecasting.',
    status: 'done',
    agent: 'scrum-master',
    priority: 'medium',
    workflow: 'Sprint Planning',
    createdAt: '2026-02-16T08:00:00Z',
    updatedAt: '2026-02-19T12:00:00Z',
  },
];

const SAMPLE_MESSAGES = [
  {
    id: 'msg-1',
    from: 'analyst',
    to: 'pm',
    content: 'Requirements document for the auth module is finalized. Key stakeholders approved the MFA and SSO requirements. Ready for roadmap prioritization.',
    timestamp: '2026-02-23T09:00:00Z',
    type: 'handoff',
  },
  {
    id: 'msg-2',
    from: 'pm',
    to: 'architect',
    content: 'Auth module is our top priority for Q1. Please start with the microservices architecture design. We need OAuth2 + OIDC support from day one.',
    timestamp: '2026-02-23T09:15:00Z',
    type: 'directive',
  },
  {
    id: 'msg-3',
    from: 'architect',
    to: 'developer',
    content: 'Architecture design is in progress. Starting with the JWT token service - I\'ve shared the API contract in the shared memory. Use RS256 for signing.',
    timestamp: '2026-02-23T09:30:00Z',
    type: 'handoff',
  },
  {
    id: 'msg-4',
    from: 'developer',
    to: 'architect',
    content: 'Got it. Quick question - should we use a separate Redis instance for token blacklisting, or can we leverage the existing cache layer?',
    timestamp: '2026-02-23T09:45:00Z',
    type: 'question',
  },
  {
    id: 'msg-5',
    from: 'architect',
    to: 'developer',
    content: 'Use a dedicated Redis instance for token blacklisting. We need isolation for security-critical operations. I\'ll update the infra diagram.',
    timestamp: '2026-02-23T10:00:00Z',
    type: 'response',
  },
  {
    id: 'msg-6',
    from: 'scrum-master',
    to: 'pm',
    content: 'Sprint 4 velocity is tracking at 34 story points. We\'re on pace to complete all committed items. Retrospective scheduled for Friday.',
    timestamp: '2026-02-23T10:15:00Z',
    type: 'status',
  },
  {
    id: 'msg-7',
    from: 'tester',
    to: 'developer',
    content: 'I\'ve prepared the integration test framework for the auth API. Will need access to a test environment once the JWT service is ready.',
    timestamp: '2026-02-23T10:30:00Z',
    type: 'info',
  },
  {
    id: 'msg-8',
    from: 'pm',
    to: 'scrum-master',
    content: 'Great velocity numbers! Let\'s discuss capacity for Sprint 5 in the retro. We have the registration flow and CI/CD pipeline to plan.',
    timestamp: '2026-02-23T10:45:00Z',
    type: 'response',
  },
];

const initialAgents = AGENTS.map((agent) => {
  const currentTask = SAMPLE_TASKS.find(
    (t) => t.agent === agent.id && t.status === 'in-progress'
  );
  const isWorking = currentTask !== undefined;
  const isReviewing = SAMPLE_TASKS.some(
    (t) => t.agent === agent.id && t.status === 'review'
  );
  return {
    ...agent,
    status: isWorking ? 'working' : isReviewing ? 'reviewing' : 'idle',
    currentTask: currentTask ? currentTask.id : null,
    messageCount: SAMPLE_MESSAGES.filter(
      (m) => m.to === agent.id || m.from === agent.id
    ).length,
  };
});

// Map a gateway session event to a dashboard message
function mapSessionMessage(payload) {
  const agentId = payload.agentId || payload.agent || 'analyst';
  const isFromUser = payload.role === 'user';
  return {
    id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    from: isFromUser ? 'user' : agentId,
    to: isFromUser ? agentId : 'user',
    content: typeof payload.content === 'string'
      ? payload.content
      : payload.text || JSON.stringify(payload.content || ''),
    timestamp: payload.timestamp || new Date().toISOString(),
    type: isFromUser ? 'directive' : 'response',
    live: true,
  };
}

const useStore = create((set, get) => ({
  // Gateway connection
  connectionStatus: 'disconnected',
  gatewayInfo: null,

  // Data
  agents: initialAgents,
  tasks: SAMPLE_TASKS,
  messages: SAMPLE_MESSAGES,
  filterAgent: null,
  filterWorkflow: null,
  selectedTask: null,

  // Gateway actions
  connectGateway: (url, token) => {
    gateway.onStatusChange((status) => {
      set({ connectionStatus: status });
    });

    gateway.on('connected', async () => {
      try {
        const [health, channels] = await Promise.allSettled([
          gateway.health(),
          gateway.channelsStatus(),
        ]);
        set({
          gatewayInfo: {
            health: health.status === 'fulfilled' ? health.value : null,
            channels: channels.status === 'fulfilled' ? channels.value : null,
          },
        });
      } catch {}

      // Fetch sessions and build live message history
      try {
        const sessions = await gateway.listSessions();
        if (sessions?.sessions?.length) {
          const liveMessages = [];
          for (const session of sessions.sessions.slice(0, 10)) {
            try {
              const history = await gateway.sessionHistory(session.key || session.id);
              if (history?.messages) {
                for (const msg of history.messages) {
                  liveMessages.push(mapSessionMessage({ ...msg, agentId: session.agentId }));
                }
              }
            } catch {}
          }
          if (liveMessages.length > 0) {
            liveMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            set({ messages: liveMessages });
          }
        }
      } catch {}
    });

    // Live event: new session message
    gateway.on('session.message', (payload) => {
      const msg = mapSessionMessage(payload);
      set((state) => ({ messages: [...state.messages, msg] }));
    });

    // Live event: agent activity
    gateway.on('agent.turn.start', (payload) => {
      const agentId = payload?.agentId;
      if (agentId) {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, status: 'working' } : a
          ),
        }));
      }
    });

    gateway.on('agent.turn.end', (payload) => {
      const agentId = payload?.agentId;
      if (agentId) {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, status: 'idle' } : a
          ),
        }));
      }
    });

    gateway.connect(url, token);
  },

  disconnectGateway: () => {
    gateway.disconnect();
    set({
      connectionStatus: 'disconnected',
      gatewayInfo: null,
      messages: SAMPLE_MESSAGES,
    });
  },

  // Task actions
  addTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      ),
    })),

  updateTaskStatus: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      ),
    })),

  setSelectedTask: (taskId) => set({ selectedTask: taskId }),

  // Message actions
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  // Agent actions
  updateAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status } : a
      ),
    })),

  // Filter actions
  setFilterAgent: (agentId) =>
    set({ filterAgent: agentId === get().filterAgent ? null : agentId }),

  setFilterWorkflow: (workflow) =>
    set({ filterWorkflow: workflow === get().filterWorkflow ? null : workflow }),

  clearFilters: () => set({ filterAgent: null, filterWorkflow: null }),

  // Derived data helpers
  getTasksByStatus: (status) => {
    const state = get();
    let tasks = state.tasks.filter((t) => t.status === status);
    if (state.filterAgent) {
      tasks = tasks.filter((t) => t.agent === state.filterAgent);
    }
    if (state.filterWorkflow) {
      tasks = tasks.filter((t) => t.workflow === state.filterWorkflow);
    }
    return tasks;
  },

  getAgentById: (id) => get().agents.find((a) => a.id === id),

  getWorkflows: () => {
    const tasks = get().tasks;
    const workflowMap = {};
    tasks.forEach((t) => {
      if (!workflowMap[t.workflow]) {
        workflowMap[t.workflow] = { name: t.workflow, tasks: [], agents: new Set() };
      }
      workflowMap[t.workflow].tasks.push(t);
      workflowMap[t.workflow].agents.add(t.agent);
    });
    return Object.values(workflowMap).map((w) => ({
      ...w,
      agents: Array.from(w.agents),
      total: w.tasks.length,
      done: w.tasks.filter((t) => t.status === 'done').length,
      inProgress: w.tasks.filter((t) => t.status === 'in-progress').length,
      progress: Math.round(
        (w.tasks.filter((t) => t.status === 'done').length / w.tasks.length) * 100
      ),
    }));
  },
}));

export default useStore;
