# CliLoginPage

- Route: `/cli-login`, outside the main layout; any signed-in user (`LoginView` asks for sign-in first).
- Consent screen a CLI opens in the browser to borrow the signed-in WebUI session: shows the account and an attestation, and the user confirms or cancels (`CliLoginConsent`, covered by `CliLoginPage.test.tsx`).
