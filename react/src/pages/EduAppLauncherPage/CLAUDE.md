# EduAppLauncherPage

- Routes: `/edu-applauncher` and `/applauncher`, outside the main layout; anyone with a valid `sToken` in the URL or an existing login session.
- Logs in with an `sToken` from the URL and launches an app session directly (`components/EduAppLauncher`), for education deployments that link users straight into an app.
- `EduAppLauncher` reads `config.toml` by a path relative to the served page, not to the source file; do not change that path when moving the file.
