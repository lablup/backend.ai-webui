---
name: i18n-guide
description: >
  Internationalization guidelines for Backend.AI WebUI. Covers translation key
  structures, key casing rules, translation functions by framework (React/Lit),
  language-specific rules (Korean, Japanese, Chinese), placeholder handling,
  common mistakes, and code review checklists.
---

# i18n Guide for Backend.AI WebUI

## Activation Triggers

- "Add translations for [component]"
- "Fill out i18n" or "translate"
- "Add i18n keys"
- "Fix missing translations"
- Working on `resources/i18n/` or `packages/backend.ai-ui/src/locale/` files
- Using `/fill-out-i18n` command
- Questions about translation key naming or casing

## Quick Reference

### Translation Functions

- **React** (`/react`): `const { t } = useTranslation()` → `t('key')`
- **Lit** (`/src`): `import { translate as _t, get as _text } from 'lit-translate'`

### Key Format

- **Main WebUI** (`resources/i18n/`): `category.key` (e.g., `button.submit`)
- **BAI UI package** (`packages/backend.ai-ui/src/locale/`): `comp:ComponentName.Key` (e.g., `comp:BAIModal.ConfirmTitle`)

### Key Casing Rules

- **String values** (leaf keys) → Uppercase start (PascalCase): `"Title": "Example"`
- **Object values** (namespace keys) → lowercase start (camelCase): `"general": { ... }`

### Critical Rules

- Never hard-code user-facing text
- Never concatenate translated strings (use placeholders: `{{variable}}`)
- Always preserve placeholders exactly
- Use `comp:` prefix for backend.ai-ui package keys

## Detailed Guidelines

Read the full i18n guidelines for language-specific rules, common mistakes, and checklists:

@.github/instructions/i18n.instructions.md
