# ChangePasswordPage

- Route: `/change-password`, outside the main layout (no login required).
- Where a user lands from a password-change e-mail link; renders `components/ChangePasswordView` next to `CSSTokenVariables` only. Nothing from the `MainLayout` subtree is available here (header, sider, project scope, logged-in client).
