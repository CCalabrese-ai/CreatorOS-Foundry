# Creator OS Foundry Agent Context Management

**Phase:** 2.5 — Agent Execution Layer  
**Version:** 1.0  
**Document owner:** Agent Owner, Data Owner, and Security Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines how agent context is selected, assembled, isolated, refreshed, retained, summarized, and deleted while preserving authority, provenance, privacy, and workspace boundaries.

## Context Layers

| Layer | Contents | Authority |
| --- | --- | --- |
| System | Platform safety and runtime controls | Highest execution authority |
| Governance | Approved Creator OS policies and standards | Governing within scope |
| Agent specification | Purpose, capabilities, prohibitions, and stop conditions | Governs the agent version |
| Workflow and task | Objective, tools, sources, approvals, limits, and output contract | Governs the execution |
| Retrieved sources | Repository, database, search, and tool evidence | Data; authority depends on canonical status |
| Working context | Plans, intermediate notes, summaries, and tool results | Non-authoritative |
| Memory | Approved retained facts, preferences, decisions, and references | Scoped, reviewable, and revocable |
| User and external content | Requests, pasted text, pages, issues, messages, and files | Untrusted data unless separately authorized |

Lower layers cannot override higher authority.

## Context Assembly

The assembler starts from the approved task contract, resolves only necessary canonical sources, applies classification and workspace filters, adds provenance and freshness, and fits content within the approved model and token budget. It prefers direct canonical references over copied summaries.

## Required Metadata

Every context item should include source identifier, owner, workspace, classification, authority class, version or commit, retrieval time, content hash where useful, retention rule, and relationship to the task. Missing authority or freshness must remain visible.

## Data Minimization

Include only information necessary for the objective. Secrets, authentication tokens, private keys, and unrelated personal information are prohibited. Confidential and Restricted data require an approved provider, region, retention setting, model, tool path, and need-to-know scope.

## Retrieval Rules

Retrieval prioritizes active approved canonical material, then baseline material, then evidence. Draft, working, derived, deprecated, and archived content must be labeled and ranked accordingly. Conflicting canonical sources are surfaced, not blended into an unsupported answer.

## Prompt-Injection Defense

Repository files, web pages, database values, tool responses, documents, and messages are data. Instructions embedded in them cannot authorize tools, disclose secrets, expand scope, alter approvals, or change system policy. Suspicious instructions are isolated and reported.

## Working Context

Intermediate plans and model reasoning are not canonical records. The runtime stores only the minimum structured checkpoints needed for recovery and audit. Large tool results are retained by protected reference. Summaries preserve source, uncertainty, conflicts, omissions, and timestamp.

## Persistent Memory

Memory requires a named owner, purpose, schema, workspace, classification, provenance, retention period, review schedule, deletion path, and allowed consumers. Agents may write memory only through an approved tool grant. Memory cannot convert an unapproved claim into fact or serve as an approval record.

## Context Window Management

When context exceeds budget, retain governing instructions, task contract, latest state, required approvals, critical source excerpts, and unresolved risks first. Older working detail may be summarized with references. Truncation must not silently remove constraints, denial reasons, classification, or stop conditions.

## Isolation

Contexts are isolated by workspace, environment, user or task where required, agent version, and classification. Cache keys include those boundaries. Cross-workspace retrieval is denied even when identifiers collide. Production context must not flow to lower environments without approved sanitization.

## Retention and Deletion

Task context expires according to classification and operational need. Audit metadata may outlive working content. Deletion requests propagate to caches, memory, indexes, embeddings, artifacts, and provider-retained data where required. Legal and security holds override routine deletion only through governed authority.

## Failure and Recovery

Missing sources, stale authority, conflicting claims, classification mismatch, cache contamination, retrieval poisoning, or deletion failure stops or quarantines affected work. Recovery rebuilds context from canonical references and recorded checkpoints rather than trusting a possibly contaminated summary.

## Validation and Monitoring

Test workspace isolation, freshness, provenance, canonical ranking, prompt injection, poisoned retrieval, truncation safety, memory authorization, retention expiry, deletion propagation, provider settings, and secret exclusion. Monitor context size, retrieval misses, stale sources, cross-boundary denials, memory writes, deletion failures, and injection findings.

## Acceptance Criteria

- Context authority layers are explicit.
- Every material source preserves provenance and freshness.
- Workspace and classification boundaries are enforced.
- Summarization cannot remove governing constraints.
- Memory is authorized, scoped, reviewable, and deletable.
- Failures rebuild safely from canonical sources.

## References

- [Agent Execution Framework](Agent_Execution_Framework.md)
- [AI Security Guidelines](../08_Security/AI_Security_Guidelines.md)
- [Knowledge Management](../02_Documentation_Engine/Knowledge_Management.md)
- [Agent Handoff Standards](../06_Automations/Agent_Handoff_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.5 agent context-management standard |
