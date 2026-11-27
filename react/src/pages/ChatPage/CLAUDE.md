# ChatPage

- Route: `/project/:projectName/chat/:id?` (menu "Chat"), any logged-in project member.
- LLM chat against model-serving endpoints or AI agents, with chat history. The chat building blocks live in `react/src/components/Chat/`, and `StartPage`'s notebook import uses `Chat/CopyButton`.
- Page-only styles are in `ChatPage.css`.
