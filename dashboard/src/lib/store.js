import { create } from 'zustand';
import { AGENTS } from './agents';
import gateway from './gateway';

// --- localStorage persistence for tasks ---
const TASKS_STORAGE_KEY = 'areeb-dashboard-tasks';

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

function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw) {
      const tasks = JSON.parse(raw);
      if (Array.isArray(tasks) && tasks.length > 0) return tasks;
    }
  } catch {}
  return SAMPLE_TASKS;
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

// Build initial agent state from static AGENTS list
const initialAgents = AGENTS.map((agent) => ({
  ...agent,
  status: 'idle',
  currentTask: null,
  messageCount: 0,
  sessionCount: 0,
}));

const useStore = create((set, get) => ({
  // Gateway connection
  connectionStatus: 'disconnected',
  gatewayInfo: null,

  // Data
  agents: initialAgents,
  tasks: loadTasks(),
  messages: [],
  filterAgent: null,
  filterWorkflow: null,
  selectedTask: null,

  // Gateway actions
  connectGateway: (url, token) => {
    gateway.onStatusChange((status) => {
      set({ connectionStatus: status });
    });

    // On successful connect, populate from snapshot
    gateway.on('connected', (helloOk) => {
      const snapshot = helloOk?.snapshot;
      if (!snapshot) return;

      // Update agents with live data from snapshot
      const liveAgents = snapshot.health?.agents || [];
      set((state) => ({
        gatewayInfo: {
          version: helloOk.server?.version,
          uptime: snapshot.uptimeMs,
          authMode: snapshot.authMode,
          channels: snapshot.health?.channels || {},
          channelOrder: snapshot.health?.channelOrder || [],
        },
        agents: state.agents.map((agent) => {
          const live = liveAgents.find((a) => a.agentId === agent.id);
          if (!live) return agent;
          return {
            ...agent,
            sessionCount: live.sessions?.count || 0,
            heartbeatEnabled: live.heartbeat?.enabled || false,
          };
        }),
      }));
    });

    // Live event: health updates (channels, agents)
    gateway.on('health', (payload) => {
      const liveAgents = payload?.agents || [];
      set((state) => ({
        gatewayInfo: {
          ...state.gatewayInfo,
          channels: payload?.channels || state.gatewayInfo?.channels,
        },
        agents: state.agents.map((agent) => {
          const live = liveAgents.find((a) => a.agentId === agent.id);
          if (!live) return agent;
          return {
            ...agent,
            sessionCount: live.sessions?.count || 0,
          };
        }),
      }));
    });

    // Live event: agent activity (processing messages)
    gateway.on('agent', (payload) => {
      const agentId = payload?.agentId;
      if (!agentId) return;
      // agent events include: turn start/end, tool use, etc.
      const isActive = payload?.type === 'turn.start' || payload?.type === 'processing';
      const isDone = payload?.type === 'turn.end' || payload?.type === 'done' || payload?.type === 'idle';
      if (isActive) {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, status: 'working' } : a
          ),
        }));
      } else if (isDone) {
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, status: 'idle' } : a
          ),
        }));
      }
    });

    // Live event: chat messages (streaming from agent processing)
    gateway.on('chat', (payload) => {
      // chat events contain streaming message data
      // Only capture final/complete messages, not deltas
      if (!payload) return;
      const content = payload.text || payload.content;
      if (!content || typeof content !== 'string') return;
      // Skip very short delta fragments
      if (content.length < 5 && !payload.final) return;

      const agentId = payload.agentId || payload.agent || 'orchestrator';
      const isFromUser = payload.role === 'user';
      const msg = {
        id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from: isFromUser ? 'user' : agentId,
        to: isFromUser ? agentId : 'user',
        content,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: isFromUser ? 'directive' : 'response',
        live: true,
      };
      set((state) => ({ messages: [...state.messages, msg] }));
    });

    // Live event: heartbeat results
    gateway.on('heartbeat', (payload) => {
      const agentId = payload?.agentId;
      if (!agentId) return;
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, lastHeartbeat: payload.ts || Date.now() } : a
        ),
      }));
    });

    gateway.connect(url, token);
  },

  disconnectGateway: () => {
    gateway.disconnect();
    set({
      connectionStatus: 'disconnected',
      gatewayInfo: null,
      messages: [],
      agents: initialAgents,
    });
  },

  // Task actions (persisted to localStorage)
  addTask: (task) =>
    set((state) => {
      const tasks = [
        ...state.tasks,
        {
          ...task,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      saveTasks(tasks);
      return { tasks };
    }),

  moveTask: (taskId, newStatus) =>
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      );
      saveTasks(tasks);
      return { tasks };
    }),

  updateTaskStatus: (taskId, updates) =>
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      );
      saveTasks(tasks);
      return { tasks };
    }),

  deleteTask: (taskId) =>
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== taskId);
      saveTasks(tasks);
      return { tasks };
    }),

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
