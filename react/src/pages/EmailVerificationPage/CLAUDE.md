# EmailVerificationPage

- Route: `/verify-email`, outside the main layout (no login required).
- Where a user lands from a sign-up verification e-mail link; renders `components/EmailVerificationView` next to `CSSTokenVariables` only. Nothing from the `MainLayout` subtree is available here (header, sider, project scope, logged-in client).
