# SessionLauncherPage

- Route: `/project/:projectName/session/start` (title "Start New Session"), any logged-in project member.
- Step form that launches compute sessions: session type and name, image and environment, resource allocation, storage and the rest of the steps, then a preview and launch (one session or several, `components/LaunchMultipleSessionsModal`). Form values can be saved to or loaded from a template (`components/SessionTemplateModal`).
- `SessionLauncherFormValue` and related types are exported from `SessionLauncherPage.tsx`; `react/src/hooks/useStartSession.tsx`, `react/src/components/ImageInstallModal.tsx` and `StartPage` import them from here.
- The resource allocation rules live in `react/src/components/SessionFormItems/resourceAllocationRules.ts` (ADR 0016), shared with the deployment revision modal.
