import { create } from 'zustand';
import { AGENTS } from './agents';
import gateway from './gateway';
import { parseBoard, mergeTaskSources } from './board-parser';

// --- localStorage persistence for tasks ---
const TASKS_STORAGE_KEY = 'areeb-dashboard-tasks';
const DISMISSED_STORAGE_KEY = 'areeb-dashboard-dismissed';

// --- Agent workspace file polling ---
const BOARD_POLL_INTERVAL_MS = 60_000; // poll every 60s
// OpenClaw gateway only allows whitelisted files: SOUL.md, AGENTS.md, MEMORY.md, etc.
// Board/task data lives in MEMORY.md (BOARD.md is NOT in the gateway whitelist).
const BOARD_FILE_NAME = 'MEMORY.md';

function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw) {
      const tasks = JSON.parse(raw);
      if (Array.isArray(tasks)) return tasks.filter((t) => t.source === 'agent');
    }
  } catch {}
  return [];
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

function loadDismissed() {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

function saveDismissed(dismissedSet) {
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...dismissedSet]));
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

let _boardPollTimer = null;
let _eventCleanups = [];

const useStore = create((set, get) => ({
  // Gateway connection
  connectionStatus: 'disconnected',
  gatewayInfo: null,

  // Data
  agents: initialAgents,
  tasks: loadTasks(),
  dismissedTaskIds: loadDismissed(),
  messages: [],
  filterAgent: null,
  filterWorkflow: null,
  selectedTask: null,

  // Gateway actions
  connectGateway: (url, token) => {
    // Clean up any previous event listeners to prevent duplicates
    _eventCleanups.forEach((fn) => fn());
    _eventCleanups = [];

    gateway.onStatusChange((status) => {
      set({ connectionStatus: status });
    });

    // On successful connect, populate from snapshot + fetch boards
    _eventCleanups.push(gateway.on('connected', (helloOk) => {
      const snapshot = helloOk?.snapshot;
      if (!snapshot) return;

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

      // Fetch agent MEMORY.md boards if we have read scope
      if (gateway.hasScope('operator.read')) {
        console.log('[store] operator.read scope available — fetching agent boards + chat history');
        get().fetchAgentBoards();
        get().fetchChatHistory();
        clearInterval(_boardPollTimer);
        _boardPollTimer = setInterval(() => get().fetchAgentBoards(), BOARD_POLL_INTERVAL_MS);
      } else {
        console.log('[store] No operator.read scope — agent board sync unavailable');
      }
    }));

    // Live event: health updates (channels, agents)
    _eventCleanups.push(gateway.on('health', (payload) => {
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
    }));

    // Live event: agent activity (processing messages)
    // Also generates inter-agent communication messages for the MessageFeed
    _eventCleanups.push(gateway.on('agent', (payload) => {
      const agentId = payload?.agentId;
      if (!agentId) return;
      const eventType = payload?.type;
      const isActive = eventType === 'turn.start' || eventType === 'processing';
      const isDone = eventType === 'turn.end' || eventType === 'done' || eventType === 'idle';

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

      // Generate activity messages for the MessageFeed from agent events.
      // This captures inter-agent routing (sessions_spawn) which does not emit
      // standard chat events visible to WebSocket observers.
      if (eventType === 'turn.start' || eventType === 'turn.end') {
        // Parse sessionKey to detect inter-agent sessions vs. user-facing sessions
        // Session key format: agent:{agentId}:{channel}:{chatType}:{identifier}
        const sessionKey = payload?.sessionKey || payload?.session || '';
        const channel = sessionKey.split(':')[2] || '';

        // For agent-to-agent spawned sessions the channel is typically 'main' or
        // contains the spawning agent's context. We generate an activity message
        // for all turn events to show agent activity in the feed.
        const toolName = payload?.tool || payload?.toolName || '';
        const isSpawn = toolName === 'sessions_spawn' || toolName === 'sessions_send';

        let content, msgType, from, to;

        if (eventType === 'turn.start') {
          content = `Agent activated${channel ? ` (session: ${channel})` : ''}`;
          msgType = 'status';
          from = agentId;
          to = 'orchestrator';
        } else if (eventType === 'turn.end') {
          content = `Agent completed turn${channel ? ` (session: ${channel})` : ''}`;
          msgType = 'status';
          from = agentId;
          to = 'orchestrator';
        }

        if (content) {
          const msg = {
            id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            from,
            to,
            content,
            timestamp: payload.timestamp || payload.ts || new Date().toISOString(),
            type: msgType,
            live: true,
          };
          set((state) => ({ messages: [...state.messages, msg] }));
        }
      }

      // Capture tool-use events that indicate inter-agent handoffs
      if (eventType === 'tool.start' || eventType === 'tool_use') {
        const toolName = payload?.tool || payload?.toolName || payload?.name || '';
        if (toolName === 'sessions_spawn' || toolName === 'sessions_send') {
          const targetAgent = payload?.input?.agentId || payload?.params?.agentId || 'unknown';
          const task = payload?.input?.task || payload?.params?.task || '';
          const preview = task.length > 120 ? task.slice(0, 120) + '...' : task;
          const msg = {
            id: `handoff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            from: agentId,
            to: targetAgent,
            content: preview || `Routing to ${targetAgent}`,
            timestamp: payload.timestamp || payload.ts || new Date().toISOString(),
            type: 'handoff',
            live: true,
          };
          set((state) => ({ messages: [...state.messages, msg] }));
        }
      }
    }));

    // Live event: chat messages
    // Captures both user-facing and inter-agent chat events
    _eventCleanups.push(gateway.on('chat', (payload) => {
      if (!payload) return;
      const content = payload.text || payload.content;
      if (!content || typeof content !== 'string') return;
      if (content.length < 5 && !payload.final) return;

      const agentId = payload.agentId || payload.agent || 'orchestrator';
      const isFromUser = payload.role === 'user';

      // Detect inter-agent sessions from sessionKey or provenance
      // Session key format: agent:{agentId}:{channel}:{chatType}:{identifier}
      const sessionKey = payload.sessionKey || payload.session || '';
      const sessionParts = sessionKey.split(':');
      const sessionChannel = sessionParts[2] || '';
      const provenanceKind = payload.provenance?.kind || '';
      const isInterAgent = provenanceKind === 'inter_session' ||
        (sessionChannel === 'main' && !isFromUser && agentId !== 'orchestrator');

      let msgType, from, to;
      if (isInterAgent) {
        // Inter-agent message: agent responding to a spawned session
        from = agentId;
        to = 'orchestrator';
        msgType = 'response';
      } else if (isFromUser) {
        from = 'user';
        to = agentId;
        msgType = 'directive';
      } else {
        from = agentId;
        to = 'user';
        msgType = 'response';
      }

      const msg = {
        id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from,
        to,
        content,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: msgType,
        live: true,
      };
      set((state) => ({ messages: [...state.messages, msg] }));
    }));

    // Live event: heartbeat results
    _eventCleanups.push(gateway.on('heartbeat', (payload) => {
      const agentId = payload?.agentId;
      if (!agentId) return;
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId ? { ...a, lastHeartbeat: payload.ts || Date.now() } : a
        ),
      }));
    }));

    gateway.connect(url, token);
  },

  disconnectGateway: () => {
    clearInterval(_boardPollTimer);
    _boardPollTimer = null;
    _eventCleanups.forEach((fn) => fn());
    _eventCleanups = [];
    gateway.disconnect();
    set({
      connectionStatus: 'disconnected',
      gatewayInfo: null,
      messages: [],
      agents: initialAgents,
    });
  },

  // Fetch MEMORY.md from agent workspaces and parse board/task sections
  fetchAgentBoards: async () => {
    if (!gateway.hasScope('operator.read')) return;

    const agentIds = AGENTS.map((a) => a.id);
    const allAgentTasks = [];

    // Fetch in parallel (all 7 agents at once) to reduce latency
    const results = await Promise.allSettled(
      agentIds.map(async (agentId) => {
        const result = await gateway.agentFilesGet(agentId, BOARD_FILE_NAME);
        if (result?.file && !result.file.missing && result.file.content) {
          return { agentId, content: result.file.content };
        }
        return null;
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        const tasks = parseBoard(r.value.content, r.value.agentId);
        allAgentTasks.push(...tasks);
      }
    }

    if (allAgentTasks.length > 0) {
      set((state) => {
        const merged = mergeTaskSources(state.tasks, allAgentTasks, state.dismissedTaskIds);
        saveTasks(merged);
        return { tasks: merged };
      });
      console.log(`[store] Synced ${allAgentTasks.length} tasks from agent boards`);
    }
  },

  fetchChatHistory: async () => {
    try {
      const sessionsResult = await gateway.sessionsList();
      const sessions = sessionsResult?.sessions || sessionsResult || [];
      if (!Array.isArray(sessions) || sessions.length === 0) {
        console.log('[store] No sessions found for chat history');
        return;
      }

      const recentSessions = sessions.slice(-25);
      const historyMessages = [];
      const seen = new Set();

      const results = await Promise.allSettled(
        recentSessions.map(async (session) => {
          const key = typeof session === 'string' ? session : session.sessionKey || session.key || '';
          if (!key) return null;
          try {
            const historyResult = await gateway.chatHistory(key);
            const messages = historyResult?.messages || historyResult || [];
            if (!Array.isArray(messages)) return null;
            return { sessionKey: key, messages };
          } catch {
            return null;
          }
        })
      );

      for (const r of results) {
        if (r.status !== 'fulfilled' || !r.value) continue;
        const { sessionKey, messages } = r.value;
        const keyParts = sessionKey.split(':');
        const agentId = keyParts[1] || 'orchestrator';

        for (const msg of messages) {
          const content = typeof msg.content === 'string'
            ? msg.content
            : Array.isArray(msg.content)
              ? msg.content.map((b) => (typeof b === 'string' ? b : b.text || '')).join('')
              : '';
          if (!content || content.length < 3) continue;

          const dedupKey = `${msg.role}-${agentId}-${content.slice(0, 80)}-${msg.timestamp || ''}`;
          if (seen.has(dedupKey)) continue;
          seen.add(dedupKey);

          const isUser = msg.role === 'user';
          const preview = content.length > 500 ? content.slice(0, 500) + '...' : content;

          historyMessages.push({
            id: `hist-${agentId}-${historyMessages.length}-${Math.random().toString(36).slice(2, 6)}`,
            from: isUser ? 'user' : agentId,
            to: isUser ? agentId : 'user',
            content: preview,
            timestamp: msg.timestamp || msg.ts || new Date().toISOString(),
            type: isUser ? 'directive' : 'response',
            live: false,
          });
        }
      }

      if (historyMessages.length > 0) {
        historyMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        set((state) => ({
          messages: [...historyMessages, ...state.messages.filter((m) => m.live)],
        }));
        console.log(`[store] Loaded ${historyMessages.length} historical messages from ${recentSessions.length} sessions`);
      }
    } catch (err) {
      console.warn('[store] Failed to fetch chat history:', err.message);
    }
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

  dismissTask: (taskId) =>
    set((state) => {
      const dismissedTaskIds = new Set(state.dismissedTaskIds);
      dismissedTaskIds.add(taskId);
      saveDismissed(dismissedTaskIds);
      const tasks = state.tasks.filter((t) => t.id !== taskId);
      saveTasks(tasks);
      return { tasks, dismissedTaskIds };
    }),

  restoreTask: (taskId) => {
    set((state) => {
      const dismissedTaskIds = new Set(state.dismissedTaskIds);
      dismissedTaskIds.delete(taskId);
      saveDismissed(dismissedTaskIds);
      return { dismissedTaskIds };
    });
    // Re-fetch boards so the restored task reappears
    if (gateway.hasScope('operator.read')) {
      get().fetchAgentBoards();
    }
  },

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
