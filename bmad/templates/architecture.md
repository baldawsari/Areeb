# Architecture Document: {{PROJECT_NAME}}

## Document Info
- **Version:** {{version}}
- **Author:** Architect Agent
- **Date:** {{date}}
- **Status:** {{Draft | In Review | Approved}}
- **PRD Reference:** {{prd link}}

---

## 1. Executive Summary
{{Brief overview of the architecture, key design decisions, and rationale. 2-3 paragraphs.}}

## 2. Architectural Goals and Constraints

### Quality Attributes
| Attribute | Priority | Target | Rationale |
|-----------|----------|--------|-----------|
| Performance | {{H/M/L}} | {{target}} | {{why}} |
| Scalability | {{H/M/L}} | {{target}} | {{why}} |
| Security | {{H/M/L}} | {{target}} | {{why}} |
| Maintainability | {{H/M/L}} | {{target}} | {{why}} |
| Availability | {{H/M/L}} | {{target}} | {{why}} |
| Reliability | {{H/M/L}} | {{target}} | {{why}} |

### Constraints
- **Technical:** {{constraint}}
- **Business:** {{constraint}}
- **Regulatory:** {{constraint}}
- **Timeline:** {{constraint}}

## 3. System Overview

### Architectural Style
{{Monolith | Microservices | Serverless | Hybrid | Event-Driven}}

**Justification:** {{why this style was chosen}}

### High-Level Architecture Diagram
```
{{ASCII diagram or description of the system architecture}}

[Client Layer]
    |
[API Gateway / Load Balancer]
    |
[Service Layer]
    |         \
[Database]  [Cache]  [Message Queue]
    |
[External Services]
```

### Component Overview
| Component | Responsibility | Technology | Communication |
|-----------|---------------|------------|---------------|
| {{component}} | {{what it does}} | {{tech}} | {{REST/gRPC/events}} |

## 4. Technology Stack

### Frontend
| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Framework | {{e.g., React}} | {{version}} | {{why}} |
| State Management | {{e.g., Redux}} | {{version}} | {{why}} |
| Styling | {{e.g., Tailwind}} | {{version}} | {{why}} |
| Build Tool | {{e.g., Vite}} | {{version}} | {{why}} |

### Backend
| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Runtime | {{e.g., Node.js}} | {{version}} | {{why}} |
| Framework | {{e.g., Express}} | {{version}} | {{why}} |
| ORM | {{e.g., Prisma}} | {{version}} | {{why}} |
| Validation | {{e.g., Zod}} | {{version}} | {{why}} |

### Data Storage
| Store | Technology | Purpose | Justification |
|-------|-----------|---------|---------------|
| Primary DB | {{e.g., PostgreSQL}} | {{purpose}} | {{why}} |
| Cache | {{e.g., Redis}} | {{purpose}} | {{why}} |
| Object Storage | {{e.g., S3}} | {{purpose}} | {{why}} |

### Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Hosting | {{e.g., AWS/GCP/Azure}} | {{purpose}} |
| Containers | {{e.g., Docker}} | {{purpose}} |
| Orchestration | {{e.g., Kubernetes}} | {{purpose}} |
| CI/CD | {{e.g., GitHub Actions}} | {{purpose}} |
| Monitoring | {{e.g., Datadog}} | {{purpose}} |

## 5. Component Design

### Component: {{Component Name}}
- **Responsibility:** {{what this component does}}
- **Interfaces:** {{APIs it exposes}}
- **Dependencies:** {{what it depends on}}
- **Data Ownership:** {{what data it owns}}
- **Scaling Strategy:** {{how it scales}}

```
{{Internal structure or class diagram description}}
```

## 6. Data Architecture

### Entity Relationship Model
```
{{ASCII ER diagram or description}}

[User] 1---* [Order] *---* [Product]
                |
            [Payment]
```

### Data Model
| Entity | Key Attributes | Storage | Indexes |
|--------|---------------|---------|---------|
| {{entity}} | {{attributes}} | {{table/collection}} | {{indexes}} |

### Data Flow
1. {{Step 1: data enters system via...}}
2. {{Step 2: data is validated and transformed...}}
3. {{Step 3: data is persisted to...}}
4. {{Step 4: data is cached in...}}

### Data Migration Strategy
{{How data will be migrated from existing systems, if applicable.}}

## 7. API Design

### API Style
{{REST | GraphQL | gRPC | Hybrid}}

### Endpoint Summary
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| {{GET/POST/PUT/DELETE}} | {{/api/v1/resource}} | {{description}} | {{Yes/No}} |

### Authentication and Authorization
- **Authentication:** {{JWT / OAuth2 / API Key}}
- **Authorization:** {{RBAC / ABAC / Policy-based}}
- **Token Lifecycle:** {{expiry, refresh strategy}}

### API Versioning
- **Strategy:** {{URL path / Header / Query param}}
- **Deprecation Policy:** {{how old versions are retired}}

### Error Handling
```json
{
  "error": {
    "code": "{{ERROR_CODE}}",
    "message": "{{Human-readable message}}",
    "details": "{{Additional context}}",
    "request_id": "{{trace id}}"
  }
}
```

### Rate Limiting
| Tier | Rate Limit | Burst Limit |
|------|-----------|-------------|
| {{tier}} | {{X req/min}} | {{X req/sec}} |

## 8. Security Architecture

### Threat Model (STRIDE)
| Threat | Category | Mitigation |
|--------|----------|------------|
| {{threat}} | {{S/T/R/I/D/E}} | {{mitigation}} |

### Security Controls
- **Input Validation:** {{approach}}
- **Output Encoding:** {{approach}}
- **CSRF Protection:** {{approach}}
- **CORS Policy:** {{configuration}}
- **Content Security Policy:** {{directives}}
- **Secret Management:** {{tool/approach}}

### Data Protection
- **Encryption at Rest:** {{algorithm, key management}}
- **Encryption in Transit:** {{TLS version, cert management}}
- **PII Handling:** {{anonymization, masking strategy}}
- **Audit Logging:** {{what is logged, retention}}

## 9. Infrastructure and Deployment

### Deployment Architecture
```
{{ASCII deployment diagram}}

[CDN] -> [Load Balancer] -> [App Servers (Auto-scaling Group)]
                                    |
                            [Database (Primary-Replica)]
                                    |
                            [Redis Cluster]
```

### CI/CD Pipeline
1. **Source:** Code pushed to feature branch
2. **Build:** Compile, lint, type-check
3. **Test:** Unit tests, integration tests
4. **Security:** SAST/DAST scan
5. **Stage:** Deploy to staging environment
6. **Approve:** Manual approval gate
7. **Deploy:** Blue-green deployment to production
8. **Verify:** Smoke tests and health checks

### Environment Strategy
| Environment | Purpose | Infrastructure | Data |
|-------------|---------|---------------|------|
| Development | Local development | Local/Docker | Seed data |
| Staging | Pre-production testing | Cloud (scaled down) | Anonymized prod data |
| Production | Live system | Cloud (full scale) | Real data |

### Monitoring and Observability
- **Metrics:** {{what metrics are collected}}
- **Logging:** {{structured logging approach, log aggregation}}
- **Tracing:** {{distributed tracing approach}}
- **Alerting:** {{alert rules, escalation policy}}
- **Dashboards:** {{key dashboards}}

## 10. Architecture Decision Records (ADRs)

### ADR-001: {{Decision Title}}
- **Date:** {{date}}
- **Status:** {{Accepted | Superseded | Deprecated}}
- **Context:** {{What is the issue or situation requiring a decision?}}
- **Options Considered:**
  1. {{Option A}} - {{pros/cons}}
  2. {{Option B}} - {{pros/cons}}
  3. {{Option C}} - {{pros/cons}}
- **Decision:** {{Which option was chosen}}
- **Rationale:** {{Why this option was selected}}
- **Consequences:** {{What are the implications of this decision?}}

## 11. Failure Modes and Recovery

### Failure Scenarios
| Scenario | Impact | Detection | Recovery | RTO |
|----------|--------|-----------|----------|-----|
| {{failure}} | {{impact}} | {{how detected}} | {{recovery steps}} | {{time}} |

### Backup and Disaster Recovery
- **Backup Frequency:** {{schedule}}
- **Backup Retention:** {{policy}}
- **Recovery Point Objective (RPO):** {{target}}
- **Recovery Time Objective (RTO):** {{target}}
- **DR Strategy:** {{Active-Active | Active-Passive | Pilot Light}}

## 12. Cost Estimation

### Monthly Infrastructure Cost
| Resource | Specification | Monthly Cost |
|----------|--------------|-------------|
| {{resource}} | {{spec}} | {{$X}} |
| **Total** | | **{{$X}}** |

### Scaling Cost Projections
| Scale | Users | Monthly Cost |
|-------|-------|-------------|
| Launch | {{X}} | {{$X}} |
| 6 Months | {{X}} | {{$X}} |
| 12 Months | {{X}} | {{$X}} |

---

## Approval
| Role | Name | Date | Status |
|------|------|------|--------|
| Architect | {{name}} | {{date}} | {{Approved/Pending}} |
| PM | {{name}} | {{date}} | {{Approved/Pending}} |
| Tech Lead | {{name}} | {{date}} | {{Approved/Pending}} |
