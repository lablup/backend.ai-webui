# ComputeSessionListPage

- Route: `/project/:projectName/session` (menu "Sessions"), any logged-in project member; lazy-loaded in `routes.tsx` but pre-warmed in `vite.config.ts` as a first screen.
- The user's compute session list for the current project: status tabs kept in the URL, resource summary card (`components/ConfigurableResourceCard`), session table and terminate actions.
- Its admin twin is `AdminSessionPage`'s `AdminComputeSessionList`; the session table (`SessionNodes`) is shared and stays in `react/src/components`.
- `components/WebMCPSessionListTools` (the WebMCP read tools, ADR 0025) is shared with `AdminSessionPage`.
