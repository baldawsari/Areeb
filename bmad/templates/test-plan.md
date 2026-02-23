# Test Plan: {{PROJECT_NAME}}

## Document Info
- **Version:** {{version}}
- **Author:** Tester Agent
- **Date:** {{date}}
- **Status:** {{Draft | In Review | Approved}}
- **PRD Reference:** {{prd link}}
- **Architecture Reference:** {{architecture link}}

---

## 1. Introduction

### Purpose
{{Brief description of what this test plan covers and its objectives.}}

### Scope
- **In Scope:** {{what will be tested}}
- **Out of Scope:** {{what will NOT be tested and why}}

### References
| Document | Version | Location |
|----------|---------|----------|
| PRD | {{version}} | {{link}} |
| Architecture Doc | {{version}} | {{link}} |
| API Design | {{version}} | {{link}} |
| User Stories | {{version}} | {{link}} |

## 2. Test Strategy

### Testing Levels
| Level | Description | Responsibility | Automation |
|-------|-------------|---------------|------------|
| Unit | Individual functions and methods | Developer | Fully automated |
| Integration | Component interactions | Developer + Tester | Mostly automated |
| System | End-to-end user workflows | Tester | Partially automated |
| Acceptance | Business requirement validation | Tester + PM | Manual + automated |

### Testing Types
| Type | Approach | Tools | Priority |
|------|----------|-------|----------|
| Functional | {{approach}} | {{tools}} | {{H/M/L}} |
| Performance | {{approach}} | {{tools}} | {{H/M/L}} |
| Security | {{approach}} | {{tools}} | {{H/M/L}} |
| Usability | {{approach}} | {{tools}} | {{H/M/L}} |
| Compatibility | {{approach}} | {{tools}} | {{H/M/L}} |
| Regression | {{approach}} | {{tools}} | {{H/M/L}} |

### Risk-Based Prioritization
| Risk Area | Probability | Impact | Test Priority |
|-----------|-------------|--------|---------------|
| {{area}} | {{H/M/L}} | {{H/M/L}} | {{Critical/High/Medium/Low}} |

## 3. Test Environment

### Environment Configuration
| Component | Specification | Version |
|-----------|--------------|---------|
| OS | {{operating system}} | {{version}} |
| Browser(s) | {{browsers}} | {{versions}} |
| Database | {{database}} | {{version}} |
| API Server | {{server}} | {{version}} |
| Dependencies | {{external services}} | {{versions}} |

### Test Data Strategy
- **Data Source:** {{how test data is generated or sourced}}
- **Data Setup:** {{how data is prepared before tests}}
- **Data Cleanup:** {{how data is cleaned up after tests}}
- **Sensitive Data:** {{how PII/sensitive data is handled in test environments}}

### Environment Setup Steps
1. {{step 1}}
2. {{step 2}}
3. {{step 3}}

## 4. Entry and Exit Criteria

### Entry Criteria
- [ ] Development is code-complete for the features under test
- [ ] Unit tests are passing with >80% coverage
- [ ] Test environment is provisioned and accessible
- [ ] Test data is loaded and verified
- [ ] All test dependencies are available
- [ ] Architecture and PRD documents are approved

### Exit Criteria
- [ ] All critical and high-priority test cases have been executed
- [ ] No open critical or high-severity defects
- [ ] Test coverage meets the defined threshold
- [ ] Performance targets are met
- [ ] Security scan shows no critical vulnerabilities
- [ ] Test summary report is reviewed and approved

### Suspension Criteria
- {{conditions under which testing should be paused}}

### Resumption Criteria
- {{conditions required to resume testing after suspension}}

## 5. Functional Test Cases

### Feature: {{Feature Name}}

#### TC-001: {{Test Case Title}}
- **Priority:** {{Critical | High | Medium | Low}}
- **Type:** {{Positive | Negative | Boundary}}
- **Preconditions:** {{setup required before executing}}
- **Test Steps:**
  1. {{action 1}}
  2. {{action 2}}
  3. {{action 3}}
- **Expected Result:** {{what should happen}}
- **Postconditions:** {{state after test execution}}
- **Test Data:** {{specific data needed}}
- **Automation Status:** {{Automated | To Automate | Manual}}

#### TC-002: {{Test Case Title}}
- **Priority:** {{Critical | High | Medium | Low}}
- **Type:** {{Positive | Negative | Boundary}}
- **Preconditions:** {{setup required}}
- **Test Steps:**
  1. {{action 1}}
  2. {{action 2}}
- **Expected Result:** {{what should happen}}
- **Postconditions:** {{state after test}}
- **Automation Status:** {{Automated | To Automate | Manual}}

## 6. API Test Cases

### Endpoint: {{METHOD /api/v1/resource}}

#### API-TC-001: {{Test Case Title}}
- **Request:**
  ```
  {{METHOD}} {{URL}}
  Headers: {{headers}}
  Body: {{request body}}
  ```
- **Expected Response:**
  ```
  Status: {{status code}}
  Body: {{expected response body}}
  ```
- **Validation Points:**
  - [ ] Status code is correct
  - [ ] Response schema matches specification
  - [ ] Response time is within threshold
  - [ ] {{additional validations}}

## 7. Integration Test Scenarios

### Scenario: {{Integration Scenario Name}}
- **Components:** {{which components interact}}
- **Data Flow:** {{how data moves between components}}
- **Test Steps:**
  1. {{step 1}}
  2. {{step 2}}
  3. {{step 3}}
- **Expected Outcome:** {{end-to-end expected result}}
- **Failure Modes Tested:** {{what failures are simulated}}

## 8. Performance Test Plan

### Load Test Scenarios
| Scenario | Virtual Users | Ramp-Up | Duration | Target Response Time |
|----------|--------------|---------|----------|----------------------|
| {{scenario}} | {{count}} | {{period}} | {{duration}} | {{< X ms}} |

### Stress Test Scenarios
| Scenario | Max Load | Expected Behavior |
|----------|----------|-------------------|
| {{scenario}} | {{load}} | {{graceful degradation details}} |

### Performance Acceptance Criteria
- [ ] P95 response time < {{X ms}} under {{Y}} concurrent users
- [ ] Throughput > {{X}} requests per second
- [ ] Error rate < {{X%}} under normal load
- [ ] CPU utilization < {{X%}} under normal load
- [ ] Memory utilization < {{X%}} under normal load
- [ ] No memory leaks detected in {{X hour}} endurance test

## 9. Security Test Plan

### OWASP Top 10 Coverage
| Vulnerability | Test Approach | Tools | Status |
|---------------|--------------|-------|--------|
| Injection | {{approach}} | {{tool}} | {{Planned/Done}} |
| Broken Authentication | {{approach}} | {{tool}} | {{Planned/Done}} |
| Sensitive Data Exposure | {{approach}} | {{tool}} | {{Planned/Done}} |
| XML External Entities | {{approach}} | {{tool}} | {{Planned/Done}} |
| Broken Access Control | {{approach}} | {{tool}} | {{Planned/Done}} |
| Security Misconfiguration | {{approach}} | {{tool}} | {{Planned/Done}} |
| Cross-Site Scripting | {{approach}} | {{tool}} | {{Planned/Done}} |
| Insecure Deserialization | {{approach}} | {{tool}} | {{Planned/Done}} |
| Known Vulnerabilities | {{approach}} | {{tool}} | {{Planned/Done}} |
| Insufficient Logging | {{approach}} | {{tool}} | {{Planned/Done}} |

### Security Test Cases
- [ ] Authentication bypass attempts are blocked
- [ ] Authorization checks enforce role-based access
- [ ] SQL injection attempts are prevented
- [ ] XSS payloads are sanitized
- [ ] CSRF tokens are validated
- [ ] Sensitive data is encrypted in transit and at rest
- [ ] Rate limiting prevents brute force attacks
- [ ] Session management is secure (timeout, invalidation)

## 10. Regression Test Suite

### Critical Path Tests (Run Every Build)
| ID | Test Case | Feature Area | Estimated Duration |
|----|-----------|-------------|-------------------|
| REG-001 | {{test name}} | {{area}} | {{X min}} |
| REG-002 | {{test name}} | {{area}} | {{X min}} |

### Full Regression (Run Before Release)
| ID | Test Case | Feature Area | Estimated Duration |
|----|-----------|-------------|-------------------|
| REG-F001 | {{test name}} | {{area}} | {{X min}} |

### Estimated Regression Execution Time
- **Critical path:** {{X minutes}}
- **Full regression:** {{X hours}}

## 11. Requirements Traceability Matrix

| Requirement ID | Requirement Description | Test Case IDs | Coverage Status |
|----------------|------------------------|---------------|-----------------|
| {{REQ-001}} | {{description}} | {{TC-001, TC-002}} | {{Covered/Partial/Not Covered}} |

## 12. Defect Management

### Severity Definitions
| Severity | Definition | Response Time |
|----------|-----------|---------------|
| Critical | System crash, data loss, security breach | Immediate |
| High | Major feature broken, no workaround | Within 4 hours |
| Medium | Feature partially broken, workaround exists | Within 24 hours |
| Low | Minor issue, cosmetic, enhancement | Next sprint |

### Defect Lifecycle
1. **New** - Defect reported
2. **Triaged** - Severity and priority assigned
3. **Assigned** - Developer assigned
4. **In Progress** - Fix being developed
5. **Fixed** - Fix implemented
6. **Verified** - Fix verified by tester
7. **Closed** - Defect resolved

## 13. Test Schedule

| Phase | Start Date | End Date | Deliverables |
|-------|-----------|----------|--------------|
| Test Planning | {{date}} | {{date}} | Test plan document |
| Test Case Design | {{date}} | {{date}} | Test cases |
| Environment Setup | {{date}} | {{date}} | Ready environment |
| Test Execution | {{date}} | {{date}} | Test results |
| Defect Resolution | {{date}} | {{date}} | Fixed defects |
| Regression Testing | {{date}} | {{date}} | Regression report |
| Test Summary | {{date}} | {{date}} | Final test report |

## 14. Test Deliverables
- [ ] Test plan (this document)
- [ ] Test cases (functional, API, integration)
- [ ] Test data sets
- [ ] Test environment documentation
- [ ] Test execution results
- [ ] Defect reports
- [ ] Performance test results
- [ ] Security test results
- [ ] Test summary report
- [ ] Traceability matrix

---

## Approval
| Role | Name | Date | Status |
|------|------|------|--------|
| Tester | {{name}} | {{date}} | {{Approved/Pending}} |
| PM | {{name}} | {{date}} | {{Approved/Pending}} |
| Developer | {{name}} | {{date}} | {{Approved/Pending}} |
