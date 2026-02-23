# Product Requirements Document: {{PROJECT_NAME}}

## Document Info
- **Version:** {{version}}
- **Author:** PM Agent
- **Date:** {{date}}
- **Status:** {{Draft | In Review | Approved}}
- **Workflow:** {{workflow_name}}

---

## 1. Executive Summary
{{High-level summary of the product, its purpose, and key value proposition. 2-3 paragraphs max.}}

## 2. Product Vision and Goals

### Vision Statement
{{One sentence describing the long-term vision for this product.}}

### Goals
| # | Goal | Measurable Target | Priority |
|---|------|--------------------|----------|
| 1 | {{goal}} | {{target}} | {{Must/Should/Could}} |
| 2 | {{goal}} | {{target}} | {{Must/Should/Could}} |

### Non-Goals (Explicitly Out of Scope)
- {{what this product will NOT do}}

## 3. Target Audience

### Primary Users
- **Persona:** {{persona name}}
- **Description:** {{who they are}}
- **Pain Points:** {{what problems they face}}
- **Goals:** {{what they want to achieve}}

### Secondary Users
- {{secondary user descriptions}}

## 4. User Stories

### Epic: {{Epic Name}}

#### Story 1: {{Story Title}}
- **As a** {{user type}}
- **I want** {{action}}
- **So that** {{benefit}}
- **Priority:** {{Must | Should | Could | Won't}}
- **Acceptance Criteria:**
  - [ ] {{criterion 1}}
  - [ ] {{criterion 2}}
  - [ ] {{criterion 3}}

#### Story 2: {{Story Title}}
- **As a** {{user type}}
- **I want** {{action}}
- **So that** {{benefit}}
- **Priority:** {{Must | Should | Could | Won't}}
- **Acceptance Criteria:**
  - [ ] {{criterion 1}}
  - [ ] {{criterion 2}}

## 5. Feature Prioritization (MoSCoW)

### Must Have (MVP)
| Feature | Description | User Story Reference |
|---------|-------------|----------------------|
| {{feature}} | {{description}} | {{story ref}} |

### Should Have
| Feature | Description | User Story Reference |
|---------|-------------|----------------------|
| {{feature}} | {{description}} | {{story ref}} |

### Could Have
| Feature | Description | User Story Reference |
|---------|-------------|----------------------|
| {{feature}} | {{description}} | {{story ref}} |

### Won't Have (This Version)
| Feature | Reason for Exclusion |
|---------|----------------------|
| {{feature}} | {{reason}} |

## 6. Functional Requirements

### FR-001: {{Requirement Name}}
- **Description:** {{detailed description}}
- **Input:** {{expected input}}
- **Processing:** {{what happens}}
- **Output:** {{expected output}}
- **User Stories:** {{related stories}}

## 7. Non-Functional Requirements

### Performance
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Response Time | {{< X ms}} | {{method}} |
| Throughput | {{X req/sec}} | {{method}} |
| Availability | {{X%}} | {{method}} |

### Security
- Authentication: {{method}}
- Authorization: {{model}}
- Data Encryption: {{at rest / in transit}}
- Compliance: {{standards}}

### Scalability
- Concurrent Users: {{target}}
- Data Volume: {{target}}
- Growth Strategy: {{approach}}

## 8. UI/UX Flow Descriptions

### Flow 1: {{Flow Name}}
1. User lands on {{screen}}
2. User {{action}}
3. System {{response}}
4. User is directed to {{next screen}}

## 9. Data Requirements
- **Data Entities:** {{list key entities}}
- **Data Retention:** {{policy}}
- **Privacy Considerations:** {{GDPR, CCPA, etc.}}
- **Data Migration:** {{if applicable}}

## 10. Dependencies and Integrations
| Dependency | Type | Owner | Risk Level |
|------------|------|-------|------------|
| {{dependency}} | {{Internal/External}} | {{team/service}} | {{High/Medium/Low}} |

## 11. Risks and Mitigations
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| {{risk}} | {{H/M/L}} | {{H/M/L}} | {{mitigation strategy}} |

## 12. Timeline and Milestones
| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| Discovery Complete | {{date}} | Project brief, requirements |
| Architecture Approved | {{date}} | Architecture doc, tech stack |
| MVP Complete | {{date}} | Working product with must-haves |
| Beta Launch | {{date}} | Beta release with should-haves |
| GA Launch | {{date}} | Production release |

## 13. Success Metrics
| Metric | Baseline | Target | Measurement Frequency |
|--------|----------|--------|-----------------------|
| {{metric}} | {{current}} | {{goal}} | {{daily/weekly/monthly}} |

---

## Approval
| Role | Name | Date | Status |
|------|------|------|--------|
| PM | {{name}} | {{date}} | {{Approved/Pending}} |
| Architect | {{name}} | {{date}} | {{Approved/Pending}} |
| Stakeholder | {{name}} | {{date}} | {{Approved/Pending}} |
