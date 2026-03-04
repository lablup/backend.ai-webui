# GitHub Copilot Instructions for Backend.AI WebUI

This file provides custom instructions for GitHub Copilot when reviewing code and providing suggestions in this repository.

## Project Overview

Backend.AI WebUI is a **React web application** using React 19 + Ant Design 6 + Relay 20 (GraphQL).

### Key Technologies

- **React Build**: Webpack via @craco/craco (Create React App with customizations)
- **Component Library Build**: Vite (`packages/backend.ai-ui/`)
- **Service Worker**: workbox-webpack-plugin (GenerateSW, integrated into Craco/Webpack build)
- **Package Manager**: pnpm with workspace monorepo
- **Styling**: Ant Design + antd-style
- **State Management**: Jotai (global UI state), Relay (server/GraphQL state)
- **GraphQL**: Relay compiler for React components and backend.ai-ui package
- **Testing**: Jest for unit tests, Playwright for E2E tests

## Code Review Guidelines

### General Principles

1. **Avoid Unnecessary Suggestions**

   - Do not suggest adding comments to code that is already self-explanatory
   - Focus on substantial issues (bugs, security vulnerabilities, performance problems)
   - Avoid stylistic nitpicks that don't affect code quality

2. **Security First**

   - Always check for OWASP Top 10 vulnerabilities
   - Review for command injection, XSS, SQL injection risks
   - Validate user input handling and sanitization

3. **TypeScript Best Practices**
   - Prefer explicit types over `any`
   - Use proper type inference when types are obvious
   - Leverage utility types (Pick, Omit, Partial, etc.)

### What NOT to comment on

1. **Do NOT comment on issues that have already been resolved** in the conversation thread
2. **Do NOT duplicate comments** that other reviewers have already made
3. **Do NOT bundle multiple unrelated issues** into a single review comment

### Before commenting

1. **Check if the issue was already addressed** in previous comments
2. **Check if the code was already fixed** in recent commits
3. **Check if another reviewer already mentioned** the same issue
4. Only leave a comment if it adds **NEW value** to the review
5. **Always check the PR conversation history** before commenting

### Architecture Awareness

When reviewing code:

- All UI code is in `/react` (React) and `/packages/backend.ai-ui/` (shared components)
- `/src` contains utilities and the websocket proxy
- Check that GraphQL queries use Relay conventions in React components
- Verify proper i18n usage with `useTranslation()` hook from `react-i18next`

### Build and Development

- Development requires both `pnpm run build:d` (TypeScript watch + Relay watch + React dev server) and `pnpm run wsproxy` (WebSocket proxy)
- Build process: multi-stage with resource copying and React build (Craco/Webpack with Workbox service worker generation)
- Pre-commit hooks run linting and formatting automatically via Husky + lint-staged

## Git Workflow

### Commit Message Format

Follow conventional commit format:

- `feat(JIRA-ISSUE): description` - New features or enhancements
- `fix(JIRA-ISSUE): description` - Bug fixes
- `refactor(JIRA-ISSUE): description` - Code refactoring
- `style(JIRA-ISSUE): description` - Design changes without functionality changes
- `chore(JIRA-ISSUE): description` - Maintenance tasks

### PR Guidelines

- PR titles follow format: `prefix(JIRA-ISSUE-NUMBER): title`
- PR description starts with: `Resolves #1234(FR-1234)`
- Use **Squash merge** as default merge strategy
- Follow Graphite's Stacked PR strategy for complex features

## Code Style

- Use ESLint and Prettier configurations defined in the repository
- Maintain consistency with existing code patterns
- Follow TypeScript strict mode guidelines
- Prefer functional programming patterns where appropriate

## Testing Requirements

- Unit tests required for new features
- E2E tests for critical user flows
- Run `pnpm run test` before committing
- Ensure tests pass in CI/CD pipeline

## Performance Considerations

- Be mindful of bundle size
- Use code splitting for large features
- Optimize GraphQL queries to avoid over-fetching
- Consider lazy loading for heavy components

## Accessibility

- Ensure proper ARIA attributes
- Maintain keyboard navigation support
- Test with screen readers when applicable
- Follow WCAG 2.1 AA guidelines
