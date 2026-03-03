# Backend.AI Platform Guide

This package contains comprehensive documentation for the Backend.AI platform, covering installation, configuration, administration, and advanced usage scenarios. It is a multilingual documentation system supporting English, Japanese, Korean, and Thai.

## Documentation Structure

```
src/
├── book.config.yaml          # Navigation config for all languages
├── en/                       # English (primary reference)
├── ja/                       # Japanese
├── ko/                       # Korean
└── th/                       # Thai
```

Each language directory mirrors the same structure:
```
{lang}/
├── introduction/introduction.md
├── getting-started/getting-started.md
├── images/                   # Screenshots (shared naming across languages)
└── [additional sections to be added]
```

## Target Audience

This guide serves multiple user types:
- **System Administrators**: Deployment, configuration, and cluster management
- **Developers**: API integration, custom environment creation, and SDK usage
- **Researchers**: ML workflow optimization and research-specific features
- **End Users**: Platform capabilities and best practices

## Content Focus

Unlike the WebUI User Manual, this guide focuses on:
- **Installation and Deployment**: Docker Compose, Kubernetes, source installation
- **System Administration**: User management, resource allocation, monitoring
- **Advanced Configuration**: Custom environments, API integration
- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Performance optimization, security guidelines

## AI Agent Workflow

Four agents handle the documentation lifecycle:

1. **docs-update-planner** - Analyzes requirements or PR changes to create documentation update plans (`.agent-output/docs-update-plan-{topic}.md`)
2. **docs-update-writer** - Writes documentation content across all 4 languages following the plan
3. **docs-update-reviewer** - Reviews for accuracy, consistency, style, and translation quality; auto-fixes issues (`.agent-output/docs-review-report-{topic}.md`)
4. **docs-screenshot-capturer** - Captures screenshots using Playwright MCP by navigating the live application

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
- **Build Settings**: `docs-toolkit.config.yaml` - PDF generation, preview settings, agent configuration
- **Adding a new page**: Create the `.md` file under each language directory, then add navigation entries for all 4 languages in `book.config.yaml`

## Quick Rules

- Always write English (`en/`) first, then translate to other languages
- Use terminology from `TERMINOLOGY.md` consistently
- Follow `DOCUMENTATION-STYLE-GUIDE.md` for all formatting
- Images are shared naming across languages: `![](images/filename.png)`
- Keep all 4 language versions structurally identical
- Focus on platform administration and advanced usage, not basic WebUI operations

## Differences from WebUI User Manual

| Backend.AI Guide | WebUI User Manual |
|------------------|-------------------|
| Platform administration | End-user interface |
| Installation procedures | Feature usage |
| System configuration | Step-by-step UI walkthroughs |
| API integration | WebUI functionality |
| Deployment scenarios | User workflows |

This guide complements the WebUI User Manual by providing comprehensive platform documentation for administrators, developers, and advanced users.