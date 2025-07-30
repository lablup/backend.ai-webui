# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `pnpm run server:d` - Start development server with watch mode
- `pnpm run build:d` - Build with watch mode for development
- `pnpm run wsproxy` - Start websocket proxy (required for local development)

### Build and Production
- `pnpm run build` - Full production build (cleans, copies resources, runs rollup)
- `pnpm run build:react-only` - Build only React components
- `pnpm run build:plugin` - Build plugins separately

### Quality Control
- `pnpm run lint` - Run ESLint (exits with 0 to not break builds)
- `pnpm run lint-fix` - Auto-fix ESLint issues
- `pnpm run format` - Check code formatting with Prettier
- `pnpm run format-fix` - Auto-fix code formatting

### Testing
- `pnpm run test` - Run Jest tests
- `pnpm run test` (in /react directory) - Run React-specific tests
- E2E tests require full Backend.AI cluster running first

### Electron App
- `pnpm run electron:d` - Run Electron app in development mode
- `make clean && make dep` - Prepare dependencies for Electron
- `make mac` / `make win` / `make linux` - Build platform-specific apps

## Architecture Overview

### Hybrid Architecture
This is a **hybrid web application** with two main UI frameworks:
- **Lit-Element Web Components** (`/src`) - Legacy UI components using TypeScript
- **React Components** (`/react`) - Modern UI components using React + Ant Design + Relay (GraphQL)

### Key Technologies
- **Build System**: Rollup for bundling, pnpm for package management
- **Styling**: Ant Design (React), Material Web Components (Lit)
- **State Management**: Redux (legacy), Relay (GraphQL for React)
- **GraphQL**: Relay compiler for React components
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Electron**: Desktop app wrapper with websocket proxy

### Project Structure
```
src/                    # Lit-Element web components (legacy)
  components/           # Main web components
  lib/                  # Shared libraries and utilities
  wsproxy/              # WebSocket proxy for desktop app
react/                  # React components (modern)
  src/                  # React application code
  components/           # React UI components
resources/              # Static assets, i18n files, themes
packages/               # Monorepo workspace packages
e2e/                    # End-to-end tests
```

### Development Workflow
1. **Dual Server Setup**: Run both `pnpm run server:d` and `pnpm run wsproxy` for full development
2. **Build Process**: Multi-stage build copying resources, running TypeScript, and bundling
3. **Testing**: Both Jest unit tests and Playwright E2E tests
4. **Linting**: ESLint + Prettier with pre-commit hooks via husky

# Additional Workflow Description
- All work items are created in Jira and serve as the starting point for understanding and resolving tasks.
- Work items are cloned as GitHub issues in the corresponding repository.
- GitHub PR titles follow this format:
  - prefix
    - feat: New features or feature improvements and changes
    - fix: Bug fixes
    - refactor: Refactoring
    - style: Design changes without functional changes
    - chore: Other small tasks
  - Format: `prefix(JIRA-ISSUE-NUMBER): title`
  - GitHub PR content starts with `Resolves #1234(FR-1234)` where #1234 is the cloned issue number and FR-1234 is the Jira issue number

- Use the gh command for detailed GitHub information.
- Use the Lablup Jira CLI command `lj` to find GitHub issues cloned from Jira issue numbers or to find dedicated Teams threads.
- Use Atlassian MCP command for detailed Jira issue information.
- Branch creation, commits, and pushes are done through graphite commands. Follow graphite's Stacked PR strategy. Write work by appropriately stacking individual PRs.


### Configuration
- Main config: `config.toml` (copied from `config.toml.sample`)
- Multiple environments supported via `configs/` directory
- Electron app config: `build/electron-app/app/config.toml`

### Key Libraries
- **@material/mwc-*** - Material Web Components for Lit elements
- **@vaadin/*** - Vaadin components
- **antd** - Ant Design for React components
- **lit** - Lit-Element framework
- **relay-runtime** - GraphQL client for React
- **electron** - Desktop app framework

### GraphQL/Relay Setup
- Schema files in `/data/`
- Relay compiler configured for React components
- Run `pnpm run relay` to compile GraphQL queries

### Internationalization
- JSON files in `resources/i18n/`
- Use `_t`, `_tr`, `_text` functions for translations
- Run `make i18n` to extract translation strings

### Build Output
- Production build: `build/rollup/`
- Electron app: `build/electron-app/`
- Static assets copied to build directories

## Important Notes
- Always run websocket proxy (`pnpm run wsproxy`) for local development
- Pre-commit hooks run linting and formatting automatically
- Use `make clean` before building if encountering issues
- Electron app requires special build process with `make dep`
- React components use Relay; ensure GraphQL schema is up to date


## Other guidelines
Read and follow below guides:
- @guides-for-ai/react-component-guide.md