---
applyTo: "packages/backend.ai-webui-docs/**/*.md"
---

# Documentation Guidelines for Backend.AI WebUI User Manual

These instructions apply to user manual documentation in `packages/backend.ai-webui-docs/`.

## Reference Files

Always consult these before writing or editing documentation:
- `packages/backend.ai-webui-docs/TERMINOLOGY.md` - Standardized terminology
- `packages/backend.ai-webui-docs/DOCUMENTATION-STYLE-GUIDE.md` - Formatting conventions
- `packages/backend.ai-webui-docs/TRANSLATION-GUIDE.md` - Translation rules per language
- `packages/backend.ai-webui-docs/SCREENSHOT-GUIDELINES.md` - Image conventions

## Quick Rules

### Structure
- One H1 (`#`) per file as the page title
- H2 (`##`) for major sections, H3 (`###`) for subsections
- Never skip heading levels
- Always introduce a feature before showing procedures

### Formatting
- Step-by-step procedures use numbered lists
- Form fields use bullet lists with bold field names: `- **Field Name**: Description`
- Notes/warnings are indented blocks (3 spaces) with no prefix markers
- Images: `![](images/filename.png)` placed after introductory text
- Cross-references: `[Text <anchor>](#Text <anchor>)`
- Inline code for UI elements, paths, config values: backticks

### Terminology
- Use "compute session" (not "container" for runtime)
- Use "storage folder" / "vfolder" (not "data folder")
- Use "resource group" (not "scaling group")
- Use "keypair" (one word, no hyphen)
- Use "domain" (not "organization")
- Use "project" (not "group")
- Write "fractional GPU (fGPU)" on first mention, then "fGPU"

### Multilingual
- Always write English (`en/`) first
- Keep all 4 language versions structurally identical
- Verify UI labels against `resources/i18n/{lang}.json`
- Images are shared across languages (same filenames)
- New pages require navigation entries in `book.config.yaml` for all languages

### Content Quality
- Write from the user's perspective (second person: "You can...")
- Use active voice
- Explain what a feature does and why before showing how
- Document all form fields in dialogs
- Mark admin-only features clearly
- Cross-reference related documentation sections

### What NOT to Do
- Do not hard-code UI labels without checking i18n files
- Do not use "Note:" or "Warning:" prefixes for callouts
- Do not place images before introductory text
- Do not use inconsistent terminology across sections
- Do not leave untranslated English in non-English files
- Do not skip languages when adding or updating content
