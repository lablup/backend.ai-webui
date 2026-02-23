# Editable AI Agent - Progress Tracker

> See [plan](./editable-ai-agent-plan.md) for full details

## Status: In Progress

### PR 1: Schema & Type Extensions
- [ ] Extend `AIAgent` interface with `endpoint_url`, `endpoint_token`, `isCustom`
- [ ] Add `default_model` to `AIAgentConfig`
- [ ] Update `ai-agents.schema.json` with new optional fields
- [ ] Add `extra_ai_agents` to `UserSettings` in `useBAISetting.tsx`

### PR 2: useAIAgent Hook CRUD
- [ ] Add `useBAISettingUserState('extra_ai_agents')` integration
- [ ] Implement merge logic (user agents override built-in by ID)
- [ ] Add `upsertAgent` function
- [ ] Add `deleteAgent` function
- [ ] Export `builtInAgents` for override detection

### PR 3: AgentEditorModal
- [ ] Create `AgentEditorModal.tsx` with BAIModal + Form pattern
- [ ] Form sections: Basic Info, System Prompt, Endpoint, LLM Parameters
- [ ] Connection type toggle (Backend.AI vs External)
- [ ] Add i18n keys for all 21 languages

### PR 4: AIAgentPage Edit/Delete UI
- [ ] Add "Add Agent" button in page header
- [ ] Add Dropdown menu on agent cards (Edit/Delete/Reset)
- [ ] Visual badge for custom agents ("Custom" tag)
- [ ] Visual badge for overridden agents ("Edited" tag)
- [ ] Delete confirmation modal
- [ ] Integrate AgentEditorModal

### PR 5: Chat Integration
- [ ] ChatCard: Use `agent.endpoint_url` for baseURL when available
- [ ] ChatCard: Use `agent.endpoint_token` for API key
- [ ] ChatCard: Pre-select `agent.config.default_model`
- [ ] ChatHeader: Hide EndpointSelect when agent has external URL
- [ ] ChatCard: Update `onChangeAgent` to propagate endpoint info

## Files Modified

| File | PRs |
|------|-----|
| `react/src/hooks/useAIAgent.ts` | 1, 2 |
| `react/src/hooks/useBAISetting.tsx` | 1 |
| `resources/ai-agents.schema.json` | 1 |
| `react/src/components/AgentEditorModal.tsx` | 3 (new) |
| `react/src/pages/AIAgentPage.tsx` | 4 |
| `react/src/components/Chat/ChatCard.tsx` | 5 |
| `react/src/components/Chat/ChatHeader.tsx` | 5 |
| `resources/i18n/*.json` | 3 |
