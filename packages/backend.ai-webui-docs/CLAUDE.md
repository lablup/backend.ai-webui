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
├── model_serving/model_serving.md
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

Four agents handle the documentation lifecycle:

1. **docs-update-planner** - Analyzes PR changes or feature descriptions to create a documentation update plan (`.agent-output/docs-update-plan-{topic}.md`)
2. **docs-update-writer** - Writes documentation content across all 4 languages following the plan
3. **docs-update-reviewer** - Reviews for accuracy, consistency, style, and translation quality; auto-fixes issues (`.agent-output/docs-review-report-{topic}.md`)
4. **docs-screenshot-capturer** - Captures screenshots using Playwright MCP by navigating the live application, saves to all language image directories

### Agent Working Files

Agent output files (plans, review reports) are stored in `.agent-output/` (gitignored). Files use topic-specific names to avoid collisions:
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
