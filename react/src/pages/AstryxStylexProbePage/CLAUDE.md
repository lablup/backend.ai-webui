# AstryxStylexProbePage

- Route: `/project/:projectName/stylex-probe`; no menu entry, any logged-in project member by URL.
- Probe page for the StyleX build: its `sentinel` style must end up in the entry stylesheet. `scripts/verify.sh` (`check_stylex_injection`) greps the build output for it, so keep the sentinel value in sync with `STYLEX_SENTINEL` there.
