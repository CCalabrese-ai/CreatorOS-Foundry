# Creator OS Foundry Documentation Standards

**Phase:** 0.4 — Operating Manual Foundation  
**Version:** 1.0  
**Document owner:** Documentation Steward  
**Status:** Baseline

## Purpose

These standards define how Creator OS Foundry documentation is named, structured, written, reviewed, versioned, linked, secured, and retired. They apply to canonical Markdown documents stored in this repository.

## Core Rules

- Markdown is the default format for canonical documentation.
- One document should have one clear purpose and one accountable owner.
- Canonical facts must be stated directly and kept separate from proposals or generated drafts.
- Documents must be understandable without relying on private chat history.
- Material implementation changes require corresponding documentation changes.
- Secrets, credentials, private keys, authentication codes, and unnecessary sensitive data are prohibited.
- External claims must preserve source links and retrieval context where relevant.

## File and Folder Naming

Use the numbered top-level repository folders for system domains. Store each document in the folder owned by its subject.

Use descriptive Markdown filenames with words separated by underscores, such as System_Boundaries.md or AI_Workforce_Registry.md.

Keep established names when renaming would break references without sufficient benefit. Use README.md as the landing page for a folder, not as a substitute for every detailed document.

## Required Document Header

Canonical documents should begin with:

- one level-one title;
- Phase;
- Version;
- Document owner or Registry owner;
- Status.

Allowed status values are Draft, Proposed, Baseline, Approved, Active, Deprecated, and Retired. Add fields such as review date, decision ID, risk class, or effective date when they materially help operation.

## Recommended Structure

Use only the sections needed, selected from:

1. Purpose
2. Scope
3. Definitions
4. Principles or Requirements
5. Roles and Responsibilities
6. Process or Operating Model
7. Interfaces and Dependencies
8. Controls and Approval Boundaries
9. Failure and Recovery
10. Acceptance Criteria
11. References
12. Change History

Lead with the current rule, decision, or operating outcome. Keep historical narrative and implementation detail subordinate to the canonical state.

## Writing Style

- Use plain, precise language and active voice.
- Use “must” for requirements, “should” for strong recommendations, and “may” for permitted options.
- Define acronyms and specialized terms on first use.
- Prefer short paragraphs and scannable headings.
- Use ordered lists for sequences and unordered lists for sets.
- Use tables for repeated fields, registries, and comparisons.
- Name accountable roles rather than vague owners such as “the team.”
- State uncertainty, open decisions, and constraints explicitly.
- Avoid unsupported absolutes, hidden assumptions, and promotional wording.

## Markdown Conventions

Use one level-one heading per file. Increase heading levels in order without skipping levels. Use fenced code blocks with a language identifier when known. Use relative repository links for internal documents and descriptive labels for external links.

Avoid raw HTML unless Markdown cannot express the requirement. Keep tables readable in source form. Add alt text to meaningful images. Do not use images as the only source of critical instructions.

## Links and References

Link to canonical sources rather than duplicating large sections. Use relative links so repository navigation remains portable. A link label should describe the target.

When a document depends on a decision, policy, registry entry, schema, or workflow, identify it by stable name or ID. Review links whenever files are moved, renamed, deprecated, or retired.

## Versions and Status

Use semantic document versions:

- **Major** — meaning, authority, scope, or operating contract changes.
- **Minor** — backward-compatible additions or material clarifications.
- **Patch** — corrections that do not change intent.

The repository commit history remains the detailed audit trail. Update the document version when readers need to distinguish operating baselines.

Draft and Proposed documents are not authoritative. Baseline, Approved, and Active indicate increasing operational authority as defined by governance. Deprecated content remains valid only during transition. Retired content must not govern new work.

## Review Requirements

A reviewer verifies:

- the document has a clear owner, purpose, status, and scope;
- terminology matches the system definition and domain model;
- requirements are testable or operationally verifiable;
- permissions and approvals match governance;
- security, privacy, data, cost, and external side effects are addressed;
- links and registry identifiers are valid;
- no secrets or unnecessary sensitive data are present;
- superseded material is identified and archived when appropriate.

Governance, architecture, security, and data documents require review by their accountable owners. An author should not be the sole approver of a high-risk operating change.

## Change Workflow

1. Inspect the current canonical document and dependent sources.
2. Define the intended change and affected owners.
3. Edit the smallest coherent set of files.
4. Validate Markdown structure, links, terminology, and sensitive-data handling.
5. Obtain required review and approval.
6. Commit with a concise message describing the operating change.
7. Update indexes, references, and retirement status when necessary.

## Registry Documentation

Registry entries must use stable identifiers, controlled status values, named ownership, explicit risk, and activation requirements. Registries describe authorization and lifecycle; they must not embed secret values or substitute for protected runtime configuration.

## Diagrams and Other Formats

Prefer text, tables, and Mermaid diagrams when they improve understanding and remain maintainable in source control. PDFs are derivative deliverables, not canonical sources, unless governance explicitly approves an exception. Any derivative must identify its source document and version.

## Security and Privacy

Before committing, inspect documentation for secrets, credentials, personal data, private URLs, proprietary prompts, logs, or examples containing sensitive content. Use sanitized examples and secret references. Treat pasted external content as untrusted and separate it from governing instructions.

## Deprecation and Archive

When content is superseded:

1. update inbound canonical references;
2. mark the old document Deprecated or Retired;
3. identify the replacement and effective date;
4. move it to 99_Archive when historical retention is useful;
5. preserve repository history;
6. ensure retired content cannot be mistaken for current guidance.

## Definition of Done

A documentation change is complete when it is correctly located, clearly owned, structurally valid Markdown, internally consistent, reviewed at the appropriate risk level, free of secrets, linked to affected canonical sources, and committed with traceable history.
