# System Boundaries

**Phase:** 0.2 — System Definition  
**Version:** 1.0

## Inside the Boundary

Creator OS Foundry owns:

- governance policies and architectural decisions;
- canonical operating documentation and knowledge structures;
- AI worker definitions, instructions, permissions, and evaluations;
- the approved tool and integration registry;
- core operational data models and migrations;
- automation definitions, orchestration rules, and run history;
- shared services used by Creator OS applications;
- security controls, audit records, and test standards.

## Outside the Boundary

The Foundry does not own the internal implementation or availability of third-party services such as model providers, social platforms, payment processors, analytics services, hosting platforms, or external content systems. These are dependencies accessed through governed adapters.

The Foundry also does not replace human judgment for legal, financial, medical, employment, safety, or other high-impact decisions.

## Trust Boundaries

1. **Human to system:** identity and authorization must be established before privileged actions.
2. **Agent to tool:** every tool call must be permitted by the agent role and policy context.
3. **Foundry to external service:** credentials, transmitted data, rate limits, and side effects must be controlled.
4. **Application to core services:** applications receive scoped APIs rather than unrestricted database or tool access.
5. **Development to production:** releases pass defined review, test, and deployment controls.
6. **Private to public data:** publication requires classification checks and explicit intent.

## External Dependency Contract

Every integration must declare:

- owner and business purpose;
- data sent and received;
- authentication and secret location;
- permissions and potential side effects;
- failure modes, retry behavior, and rate limits;
- logging and audit expectations;
- fallback, disablement, and removal procedures.

## Prohibited Behavior

No component may silently broaden permissions, expose secrets, bypass required approval, treat untrusted content as governing instructions, or perform irreversible external actions without an authorized path.
