---
name: storybook-guide
description: >
  Comprehensive Storybook story writing guidelines for Backend.AI UI components.
  Covers CSF 3 format, meta configuration, argTypes, story patterns (args-based,
  stateful, Relay fragment, form integration), naming conventions, sample data,
  decorators, JSDoc, documentation best practices, anti-patterns, and checklists.
---

# Storybook Story Guide for Backend.AI UI

## Activation Triggers

- "Create a storybook story for [component]"
- "Write stories for [component]"
- "Update storybook for [component]"
- "Add autodocs to [component]"
- "CSF 3 story"
- Working on `*.stories.tsx` or `*.stories.ts` files
- Using `/manage-bui-component-story` or `/enhance-component-docs` or `/update-storybook-autodoc` commands

## Quick Reference

- **Story location**: Colocated with components in `packages/backend.ai-ui/src/components/`
- **Format**: CSF 3 with TypeScript
- **Framework**: `@storybook/react-vite`
- **Run**: `cd packages/backend.ai-ui && pnpm run storybook` (port 6006)

## Essential Rules

1. Always include `tags: ['autodocs']` in meta
2. Every story must have `parameters.docs.description.story`
3. Required stories: Default (name: 'Basic'), Loading, Empty, Error states
4. Use PascalCase for exports, descriptive feature-focused names
5. Define reusable sample data at top of file with `sample*` naming
6. Add JSDoc comment above meta configuration
7. Use `control: false` for complex types (ReactNode, functions)
8. Use `action` for callback props

## Detailed Guidelines

Read the full storybook guidelines for detailed patterns, templates, and checklists:

@.github/instructions/storybook.instructions.md
