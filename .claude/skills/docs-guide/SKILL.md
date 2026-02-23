---
name: docs-guide
description: >
  Documentation guidelines for Backend.AI WebUI user manual. Covers structure,
  formatting, RST-to-Markdown conversion, cross-references, terminology,
  multilingual rules (en/ko/ja/th), Korean language rules, and content quality.
---

# Documentation Guide for Backend.AI WebUI User Manual

## Activation Triggers

- "Write documentation for [feature]"
- "Update user manual"
- "Add docs for [feature]"
- "Translate documentation"
- Working on `packages/backend.ai-webui-docs/` files
- Using docs-update-planner, docs-update-writer, docs-update-reviewer, or docs-screenshot-capturer agents

## Quick Reference

### Reference Files (always consult before writing)

- `packages/backend.ai-webui-docs/TERMINOLOGY.md` - Standardized terminology
- `packages/backend.ai-webui-docs/DOCUMENTATION-STYLE-GUIDE.md` - Formatting conventions
- `packages/backend.ai-webui-docs/TRANSLATION-GUIDE.md` - Translation rules per language
- `packages/backend.ai-webui-docs/SCREENSHOT-GUIDELINES.md` - Image conventions

### Key Terminology

- "compute session" (not "container"), "storage folder" / "vfolder" (not "data folder")
- "resource group" (not "scaling group"), "keypair" (one word)
- "domain" (not "organization"), "project" (not "group")
- "fractional GPU (fGPU)" on first mention, then "fGPU"

### Multilingual Rules

- Always write English (`en/`) first
- Keep all 4 language versions structurally identical
- Images are shared across languages
- Anchors must always be in English (only translate display text)

## Detailed Guidelines

Read the full documentation guidelines for formatting, RST conversion, and content quality rules:

@.github/instructions/docs.instructions.md
