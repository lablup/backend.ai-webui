/**
 * Preloads commonly needed lazy chunks so they are ready by the time the user
 * finishes logging in.  Call this once from the login screen (e.g. on mount)
 * so the downloads run in parallel with the user typing credentials and the
 * subsequent network authentication calls.
 *
 * Uses `requestIdleCallback` where available so the preloads don't compete
 * with the critical rendering path of the login form itself.
 *
 * This module is intentionally kept separate from routes.tsx to avoid circular
 * imports (routes → LoginView → routes).
 */
export function preloadPostLoginChunks() {
  const load = () => {
    // Common first pages after login
    import('./pages/DashboardPage');
    import('./pages/StartPage');
    // Always-rendered lazy components at root route
    import('./components/FolderExplorerOpener');
    import('./components/FolderInvitationResponseModalOpener');
    import('./components/FileUploadManager');
  };

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(load);
  } else {
    setTimeout(load, 200);
  }
}
