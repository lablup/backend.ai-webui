# Editable AI Agent - Implementation Plan

> Supersedes [PR #3356](https://github.com/lablup/backend.ai-webui/pull/3356) (FR-857)

## Goal

Users can create, edit, and delete custom AI agents stored in localStorage, alongside built-in agents from `ai-agents.json`. Custom agents can connect to external LLM APIs (not just Backend.AI endpoints) and specify a default model.

## PR Stack

| # | Title | Scope |
|---|-------|-------|
| 1 | Schema & Type Extensions | `AIAgent` interface, schema.json, `UserSettings` |
| 2 | useAIAgent Hook CRUD | Merge logic, `upsertAgent`, `deleteAgent` |
| 3 | AgentEditorModal | Create/edit form modal + i18n keys |
| 4 | AIAgentPage Edit/Delete UI | Add/edit/delete buttons, custom agent badge |
| 5 | Chat Integration | External endpoint URL, API key, default model |

## Architecture

### Data Flow

```
Built-in agents (ai-agents.json)  ──┐
                                     ├── useAIAgent() ── merged agents[]
User-created agents (localStorage) ──┘
```

### Agent Types

| Type | Source | Editable | Deletable |
|------|--------|----------|-----------|
| Built-in | `ai-agents.json` | Yes (creates override) | No |
| Custom | `localStorage` | Yes | Yes |
| Overridden | Built-in + user edit | Yes | Reset to default |

### External Endpoint Support

When an agent has `endpoint_url`:
- Skip Backend.AI endpoint GraphQL query (use `store-only` fetch policy)
- Construct `baseURL` from `endpoint_url` instead of `endpoint.url`
- Use `endpoint_token` as Bearer token
- Hide EndpointSelect in ChatHeader
- Pre-select `config.default_model` if available

## Key Design Decisions

1. **Merge strategy**: User agents with same ID override built-in agents (supports "edit built-in" flow)
2. **Storage**: `useBAISetting('extra_ai_agents')` — localStorage via Jotai atoms
3. **Agent IDs**: `crypto.randomUUID()` for new custom agents
4. **No server dependency**: All agent management is client-side
5. **Backward compatible**: Existing `ai-agents.json` format unchanged; new fields are optional
