# Backend.AI WebUI User Manual

This package contains the official user manual for Backend.AI WebUI. It is a multilingual documentation system supporting English, Japanese, Korean, and Thai.

## Documentation Structure

```
src/
├── book.config.yaml          # Navigation config for all languages
├── en/                        # English (primary reference)
├── ja/                        # Japanese
├── ko/                        # Korean
└── th/                        # Thai
```

Each language directory mirrors the same structure:
```
{lang}/
├── quickstart.md
├── disclaimer.md
├── overview/overview.md
├── installation/installation.md
├── login/login.md
├── header/header.md
├── start/start.md
├── dashboard/dashboard.md
├── summary/summary.md
├── vfolder/vfolder.md
├── session_page/session_page.md
├── sessions_all/sessions_all.md
├── mount_vfolder/mount_vfolder.md
├── share_vfolder/share_vfolder.md
├── deployment/deployment.md
├── chat/chat.md
├── import_run/import_run.md
├── my_environments/my_environments.md
├── agent_summary/agent_summary.md
├── statistics/statistics.md
├── sftp_to_container/sftp_to_container.md
├── user_settings/user_settings.md
├── cluster_session/cluster_session.md
├── admin_menu/admin_menu.md
├── trouble_shooting/trouble_shooting.md
├── appendix/appendix.md
├── license_agreement/license_agreement.md
├── references/references.md
└── images/                    # Screenshots (shared naming across languages)
```

## AI Agent Workflow

**Single entry point**: For any docs work (updates, periodic health checks, terminology cleanup, translation parity), invoke the **`docs-lead`** skill from the main context. docs-lead runs `docs-lint` for diagnosis, surfaces a prioritized work queue via `AskUserQuestion`, and then orchestrates the four workers below with explicit approval gates. **Do not invoke the workers directly** — go through docs-lead so prior state, lint findings, and worker hand-offs stay coherent.

The full agent set:

- **`docs-lead`** (skill, main context) — Triage, prioritization, decision gates, worker orchestration, accumulating state in `.agent-output/docs-state.md`. The single entry point. Adopts Karpathy's LLM Wiki Ingest + Lint operations (Query is intentionally not adopted — the manual stays human-curated).
- **`docs-lint`** (subagent, diagnosis-only) — Health diagnosis across five checks: terminology drift (parses `TERMINOLOGY.md` "Terms to Avoid"), translation parity gap, stale screenshot candidates, broken cross-ref / image link, PR coverage gap. Writes `.agent-output/docs-lint-report.md` with a 10-run rolling history. **Never modifies docs.**
- **`docs-update-planner`** (subagent) — Analyzes PR changes or feature descriptions to create a documentation update plan (`.agent-output/docs-update-plan-{topic}.md`)
- **`docs-update-writer`** (subagent) — Writes documentation content across all 4 languages following the plan
- **`docs-update-reviewer`** (subagent) — Reviews for accuracy, consistency, style, and translation quality; auto-fixes issues (`.agent-output/docs-review-report-{topic}.md`)
- **`docs-screenshot-capturer`** (subagent) — Captures screenshots using Playwright MCP by navigating the live application, saves to all language image directories

### Agent Working Files

Agent output files (plans, review reports, lint reports, state) are stored in `.agent-output/` (gitignored). Files use topic-specific names where applicable to avoid collisions:
- `.agent-output/docs-state.md` — docs-lead's accumulating work log (last 30 entries; older entries rotated to `.agent-output/archive/docs-state-YYYY-QN.md`)
- `.agent-output/docs-lint-report.md` — last 10 lint runs (rewrite-with-rotation, 256 KB cap)
- `.agent-output/docs-update-plan-{topic}.md` — Documentation update plans
- `.agent-output/docs-review-report-{topic}.md` — Review reports

## Key References

Read these before writing or editing documentation:

- @DOCUMENTATION-STYLE-GUIDE.md - Formatting, structure, and writing conventions
- @TERMINOLOGY.md - Standardized Backend.AI terminology across all languages
- @TRANSLATION-GUIDE.md - Language-specific translation rules and workflows
- @SCREENSHOT-GUIDELINES.md - Screenshot capture, naming, and maintenance

## Configuration

- **Navigation**: `src/book.config.yaml` - Defines page ordering and titles for each language
- **Adding a new page**: Create the `.md` file under each language directory, then add navigation entries for all 4 languages in `book.config.yaml`

## Quick Rules

- Always write English (`en/`) first, then translate to other languages
- Use terminology from `TERMINOLOGY.md` consistently
- Follow `DOCUMENTATION-STYLE-GUIDE.md` for all formatting
- Check `resources/i18n/{lang}.json` in the main project for actual UI label translations
- Images are shared naming across languages: `![](images/filename.png)`
- Keep all 4 language versions structurally identical

### Code blocks (cheat sheet)

- ` ```bash ` for runnable commands. **No** decorative `$ ` prefix; the snippet must be ready to copy-and-paste.
- ` ```shellsession ` for terminal *transcripts* (commands + program output / nested prompts). The toolkit hides the `$` / `#` from the clipboard automatically.
- Avoid unquoted `<placeholder>` in a bash block — bash parses `<` as input redirection unless it is quoted, even in the middle of a token. Use `${VARIABLE}` (with an `export VAR="<placeholder>"` companion) or quote the placeholder.
- **Translate inline `# …` comments inside code blocks** to the locale's language. The shell command itself stays unchanged.
- See `DOCUMENTATION-STYLE-GUIDE.md` → "Code Blocks" for the full convention, examples, and authoring checklist.
