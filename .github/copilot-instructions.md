# GitHub Copilot Instructions for Backend.AI WebUI

This file provides custom instructions for GitHub Copilot when reviewing code and providing suggestions in this repository.

## Project Overview

Backend.AI WebUI is a **hybrid web application** with two main UI frameworks:
- **Lit-Element Web Components** (`/src`) - Legacy UI components using TypeScript
- **React Components** (`/react`) - Modern UI components using React + Ant Design + Relay (GraphQL)

### Key Technologies
- **Build System**: Rollup for bundling, pnpm for package management
- **Styling**: Ant Design (React), Material Web Components (Lit)
- **State Management**: Redux (legacy), Relay (GraphQL for React)
- **GraphQL**: Relay compiler for React components
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

### Architecture Awareness

When reviewing code:
- Recognize whether code is in `/src` (Lit-Element) or `/react` (React)
- Understand the hybrid nature requires different patterns for each framework
- Check that GraphQL queries use Relay conventions in React components
- Verify proper i18n usage with `_t`, `_tr`, `_text` functions

### Build and Development

- Development requires both `pnpm run server:d` and `pnpm run build:d`
- Build process: multi-stage with resource copying and TypeScript compilation
- Pre-commit hooks run linting and formatting automatically

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
