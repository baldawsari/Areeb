# AI Agent Team - Architecture Overview

## System Overview

```
                          +---------------------+
                          |   External Channels  |
                          | (Telegram/Slack/Web) |
                          +----------+----------+
                                     |
                                     v
+------------------------------------------------------------------+
|                     OpenClaw Gateway (:18789)                     |
|                                                                  |
|  +------------------+  +------------------+  +-----------------+ |
|  | Channel Router   |  | Agent Scheduler  |  | Memory Manager  | |
|  +------------------+  +------------------+  +-----------------+ |
+------------------------------------------------------------------+
         |                        |                       |
         v                        v                       v
+------------------------------------------------------------------+
|                        Agent Team (BMAD)                          |
|                                                                  |
|  +-----------+  +-----+  +-----------+  +-----------+            |
|  |  Analyst  |  |  PM |  | Architect |  | Developer |            |
|  +-----------+  +-----+  +-----------+  +-----------+            |
|                                                                  |
|  +-----------+  +--------------+                                 |
|  |  Tester   |  | Scrum Master |                                 |
|  +-----------+  +--------------+                                 |
+------------------------------------------------------------------+
         |                        |                       |
         v                        v                       v
+------------------------------------------------------------------+
|                        Shared Services                            |
|                                                                  |
|  +------------------+  +------------------+  +-----------------+ |
|  | QMD Memory Store |  | Kanban Dashboard |  |  Model Router   | |
|  |    (:9876)       |  |    (:3000)       |  |                 | |
|  +------------------+  +------------------+  +-----------------+ |
+------------------------------------------------------------------+
```

## Component Descriptions

### OpenClaw Gateway
The central orchestration layer that manages all communication between external
channels, agents, and shared services. It runs as a WebSocket server on port
18789 and handles message routing, agent lifecycle management, and
configuration.

### Agent Team (BMAD Roles)

| Agent        | Role                     | Responsibility                                                        |
|--------------|--------------------------|-----------------------------------------------------------------------|
| Analyst      | Business Analyst         | Gathers requirements, writes user stories, defines acceptance criteria |
| PM           | Project Manager          | Prioritizes backlog, manages sprints, tracks progress                  |
| Architect    | Technical Architect      | Designs system architecture, defines technical standards and patterns  |
| Developer    | Software Developer       | Implements features, writes code, creates pull requests                |
| Tester       | QA Engineer              | Writes test plans, executes tests, reports bugs                        |
| Scrum Master | Scrum Master/Facilitator | Coordinates team, removes blockers, facilitates ceremonies             |

### Kanban Dashboard
A React-based web interface that provides real-time visibility into the agent
team's work. Displays task cards across swim lanes (Backlog, In Progress,
Review, Done) and shows agent activity, message logs, and system health.

### QMD Memory Store
A vector-based memory service powered by Bun that provides persistent context
across agent interactions. Stores conversation history, project artifacts,
decisions, and learned patterns so agents can reference prior work.

### Model Router
Handles assignment of LLM providers and models to individual agents based on
their role requirements. Allows mixing models (e.g., Claude for architecture
decisions, GPT-4 for code generation) to optimize cost and capability.

## Data Flow Between Agents

```
User Request
     |
     v
[Analyst] --requirements--> [PM] --prioritized tasks--> [Architect]
                                                              |
                                                     design decisions
                                                              |
                                                              v
                                                        [Developer]
                                                              |
                                                        code changes
                                                              |
                                                              v
                                                         [Tester]
                                                              |
                                                        test results
                                                              |
                                                              v
                                                       [Scrum Master]
                                                              |
                                                     status updates,
                                                     blocker resolution
                                                              |
                                                              v
                                                        Dashboard
```

### Typical Workflow

1. A user submits a request through an external channel (Telegram, Slack, or
   the web dashboard).
2. The **Analyst** interprets the request, breaks it into user stories, and
   defines acceptance criteria.
3. The **PM** prioritizes the stories, assigns them to a sprint, and moves
   cards onto the Kanban board.
4. The **Architect** reviews stories that need technical design and produces
   architecture decisions, component diagrams, or API contracts.
5. The **Developer** picks up tasks from the board, implements code changes,
   and submits them for review.
6. The **Tester** validates the implementation against acceptance criteria,
   runs automated tests, and files bugs if needed.
7. The **Scrum Master** monitors overall progress, resolves blockers between
   agents, and posts status summaries to the dashboard and channels.

## Memory Architecture

```
+---------------------------------------------+
|              QMD Memory Store                |
|                                             |
|  +---------------+  +--------------------+  |
|  | Vector Index  |  | Document Store     |  |
|  | (embeddings)  |  | (raw artifacts)    |  |
|  +---------------+  +--------------------+  |
|                                             |
|  +---------------+  +--------------------+  |
|  | Session Cache |  | Long-Term Memory   |  |
|  | (short-lived) |  | (persisted)        |  |
|  +---------------+  +--------------------+  |
+---------------------------------------------+
```

### Memory Layers

- **Session Cache**: Short-lived context for the current conversation or task.
  Automatically expires after the session ends. Used for immediate context
  such as the current user request and in-flight agent responses.

- **Long-Term Memory**: Persisted project knowledge including architecture
  decisions, coding standards, resolved bugs, and learned patterns. Agents
  query this store to avoid repeating past mistakes and to maintain
  consistency across sessions.

- **Vector Index**: Embedding-based search over all stored artifacts. Allows
  agents to find semantically related content (e.g., "find all prior
  decisions about authentication") without exact keyword matches.

- **Document Store**: Raw storage for full artifacts such as PRDs, design
  documents, test plans, and code snippets. Referenced by ID from the vector
  index.

### Memory Access by Agent

Each agent reads from and writes to shared memory through the OpenClaw gateway.
The gateway enforces access patterns:

- **Analyst** writes: requirements, user stories, acceptance criteria
- **PM** writes: sprint plans, priority rankings, status updates
- **Architect** writes: design decisions, ADRs, component diagrams
- **Developer** writes: implementation notes, code references, PR links
- **Tester** writes: test results, bug reports, coverage data
- **Scrum Master** reads: all of the above; writes: retrospectives, blockers

## Channel Routing

```
+------------+       +------------------+       +---------+
| Telegram   | ----> |                  | ----> | Analyst |
+------------+       |                  |       +---------+
                     |  Channel Router  |
+------------+       |                  |       +---------+
| Slack      | ----> |  (in Gateway)    | ----> | PM      |
+------------+       |                  |       +---------+
                     |                  |
+------------+       |                  |       +---------+
| Web UI     | ----> |                  | ----> | Any     |
+------------+       +------------------+       +---------+
```

### Routing Rules

- **Default**: All incoming messages route to the Analyst for initial triage.
- **Direct mention**: Messages that mention a specific agent by name or role
  (e.g., "@architect") are routed directly to that agent.
- **Thread context**: Replies within an existing thread are routed to the agent
  that owns that thread's conversation context.
- **Escalation**: If an agent cannot handle a request, it escalates to the
  Scrum Master, who re-routes to the appropriate agent.
- **Broadcast**: Status updates and sprint summaries are broadcast to all
  subscribed channels simultaneously.

## Model Assignment Strategy

Each agent can be assigned a different LLM provider and model to balance
capability, cost, and latency.

| Agent        | Recommended Model          | Rationale                                      |
|--------------|----------------------------|-------------------------------------------------|
| Analyst      | Claude Opus 4              | Strong reasoning for requirements analysis       |
| PM           | Claude Sonnet 4            | Fast, good at structured output and planning     |
| Architect    | Claude Opus 4              | Deep technical reasoning for design decisions    |
| Developer    | Claude Sonnet 4 / GPT-4    | Code generation with good speed/quality balance  |
| Tester       | Claude Sonnet 4            | Structured test plan generation                  |
| Scrum Master | Claude Haiku               | Lightweight coordination, status aggregation     |

### Configuration

Model assignments are defined in `openclaw/config.yaml` under each agent's
`model` field. The gateway's Model Router reads this configuration at startup
and directs API calls accordingly. Models can be changed at runtime via the
dashboard or CLI:

```bash
openclaw agents update developer --model claude-sonnet-4-20250514
```

### Cost Optimization

- Use lighter models (Haiku) for routine coordination tasks.
- Reserve heavier models (Opus) for tasks requiring deep reasoning.
- Enable response caching in QMD to avoid redundant LLM calls.
- Set token budgets per agent per sprint in the gateway configuration.
