# InteractiveLoginPage

- Route: `/interactive-login`, outside the main layout; any signed-in user (`LoginView` asks for sign-in first).
- Sign-in page for an external application that delegates authentication to the Backend.AI webserver (`BAIInteractiveLoginButton` on the other side): the user confirms or picks another account, then the page redirects to the `callback` URL.
- The redirect carries nothing back, so the calling app must be same-site with the webserver (see `BAIInteractiveLoginButton.doc.ts`).
