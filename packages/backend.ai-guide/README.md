# Backend.AI Guide

Comprehensive documentation for the Backend.AI platform, covering installation, configuration, administration, and advanced usage scenarios.

## Overview

This package contains the official Backend.AI platform guide, providing detailed information for system administrators, developers, researchers, and end users. The documentation is multilingual, supporting English, Japanese, Korean, and Thai.

## Documentation Structure

```
src/
├── book.config.yaml          # Navigation config for all languages
├── en/                       # English (primary reference)
├── ja/                       # Japanese
├── ko/                       # Korean
└── th/                       # Thai
```

Each language directory contains:
- **introduction/**: Platform overview and getting started information
- **getting-started/**: Quick start guide and basic setup instructions
- **images/**: Screenshots and diagrams
- Additional sections to be added based on requirements

## Development Commands

### Build Documentation

```bash
# Build the toolkit first
pnpm run build:toolkit

# Generate PDF for all languages
pnpm run pdf:all

# Generate PDF for specific language
pnpm run pdf:en
pnpm run pdf:ko
pnpm run pdf:ja
pnpm run pdf:th
```

### Preview Documentation

```bash
# Preview as web document (English)
pnpm run preview:doc

# Preview specific language
pnpm run preview:doc:ko
pnpm run preview:doc:ja
pnpm run preview:doc:th

# Preview as HTML
pnpm run preview:html
pnpm run preview:html:ko
pnpm run preview:html:ja
pnpm run preview:html:th
```

### AI Agents

```bash
# Launch documentation agents
pnpm run agents

# Force launch agents (bypass permission checks)
pnpm run agents:force
```

## Documentation Standards

This project follows strict documentation standards. Please refer to these files before contributing:

- **DOCUMENTATION-STYLE-GUIDE.md**: Formatting, structure, and writing conventions
- **TERMINOLOGY.md**: Standardized Backend.AI terminology across all languages
- **TRANSLATION-GUIDE.md**: Language-specific translation rules and workflows
- **SCREENSHOT-GUIDELINES.md**: Screenshot capture, naming, and maintenance standards

## AI-Powered Workflow

Four specialized agents handle the documentation lifecycle:

1. **docs-update-planner**: Analyzes requirements and creates documentation plans
2. **docs-update-writer**: Writes content across all 4 languages following the plan
3. **docs-update-reviewer**: Reviews for accuracy, consistency, and translation quality
4. **docs-screenshot-capturer**: Captures screenshots using automated browser testing

## Key Features

- **Multilingual Support**: English, Japanese, Korean, and Thai
- **PDF Generation**: High-quality PDF output for each language
- **Web Preview**: Interactive HTML preview with navigation
- **AI-Assisted Workflow**: Automated content creation and maintenance
- **Consistent Terminology**: Standardized terms across all languages
- **Screenshot Automation**: Automated capture and maintenance of screenshots

## Dependencies

- **backend.ai-docs-toolkit**: Core documentation build engine
- **playwright**: Browser automation for screenshot capture

## License

Licensed under LGPL-3.0-or-later - see the LICENSE file in the root directory for details.

## Contributing

1. Always write English content first
2. Follow the style guide and terminology standards
3. Ensure all 4 language versions are structurally identical
4. Use the AI agents for consistent content creation
5. Test PDF generation and web preview before submitting changes

For detailed contribution guidelines, see the translation guide and style guide.