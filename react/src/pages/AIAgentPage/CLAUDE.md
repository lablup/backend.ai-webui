# AIAgentPage

- Route: `/project/:projectName/ai-agent` (menu "AI Agents"), any logged-in project member with the `experimental_ai_agents` user setting on; otherwise the menu item is gone and the route redirects to `/start`.
- Lists the AI agents a user can chat with as cards, and lets the user create, edit and delete them (`components/AgentEditorModal`). Agents come from `react/src/hooks/useAIAgent`, not from GraphQL.
- Opening an agent goes to the chat page (`ChatPage`).
