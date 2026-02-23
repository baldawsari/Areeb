# Agent Team Coordination Protocol

## Team Structure
This workspace runs a BMAD-method agent team. Each agent has a specific role and can communicate with others via `sessions_send`.

## Communication Protocol

### Message Routing
- **New Project**: User → Analyst → PM → Architect → Developer → Tester → Scrum Master
- **Bug Report**: User → Tester → Developer → Tester (verification)
- **Status Update**: Any Agent → Scrum Master
- **Architecture Decision**: Developer/PM → Architect
- **Requirement Clarification**: Any Agent → Analyst

### Handoff Format
When handing off work to another agent, use this format:
```
HANDOFF TO: [agent-id]
FROM: [your-agent-id]
TYPE: [task|review|question|blocker]
PRIORITY: [critical|high|medium|low]
CONTEXT: [brief description]
ARTIFACTS: [list of files/docs created]
```

### Status Reporting
All agents must report status changes to the scrum-master agent:
```
STATUS UPDATE:
TASK: [task description]
STATUS: [todo|in-progress|review|done|blocked]
BLOCKERS: [any blockers]
```

## Shared Resources
- Memory files in `workspace/memory/` are shared across all agents
- Each agent maintains private memory in their own workspace
- Project artifacts go in `workspace/memory/projects/`

## Escalation Rules
1. If blocked for more than 2 exchanges, escalate to scrum-master
2. Architecture disputes escalate to architect
3. Requirement ambiguity escalates to analyst then to user
4. Critical bugs escalate to developer with priority override
