# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

### Core Development Commands
- `pnpm i` - Install dependencies (required first-time setup)
- `make clean` - Clean temporary directories and compiled files
- `make compile_wsproxy` - Compile websocket proxy (required for first-time compilation)

### Development Server
- `pnpm run server:d` - Start development server (React + WebComponent dev mode)
- `pnpm run wsproxy` - Run websocket proxy (required for WebComponent development)
- `pnpm run build:d` - Watch mode compilation with live reload

### Building & Compilation
- `make compile` - Build production bundle to `build/rollup/`
- `pnpm run build` - Build both WebComponent and React components
- `pnpm run build:react-only` - Build only React components

### Testing Commands
- `pnpm run test` - Run Jest tests for WebComponents
- `cd react && pnpm run test` - Run Jest tests for React components  
- `pnpm run test` (from e2e) - Run Playwright E2E tests
- Playwright tests require a running Backend.AI cluster

### Linting & Formatting
- `pnpm run lint` - Lint WebComponent source code
- `cd react && pnpm run lint` - Lint React source code
- `pnpm run format-fix` - Auto-fix formatting for WebComponents
- `cd react && pnpm run format-fix` - Auto-fix formatting for React

### GraphQL & Relay
- `pnpm run relay` - Generate GraphQL types and queries
- `cd react && pnpm run relay:watch` - Watch mode for Relay compiler

### Electron App Development
- `pnpm run electron:d` - Run Electron app in development mode
- `make dep` - Prepare Electron app dependencies
- `make test_electron` - Run Electron app with debugging

## Code Architecture

### Hybrid Architecture
This codebase uses a unique **hybrid architecture** combining:
1. **LitElement WebComponents** (legacy) in `/src/` 
2. **React SPA** (modern) in `/react/src/`
3. **Shared UI Library** in `/packages/backend.ai-ui/`

### WebComponent Architecture (Legacy)
- **Entry Point**: `/src/backend-ai-webui.ts` - Main webcomponent shell
- **Components**: `/src/components/` - 45+ LitElement components
- **Base Class**: `BackendAIPage` extends `LitElement` for all page components
- **State Management**: Redux store + custom settings store
- **Styling**: CSS custom properties with Material Web Components

### React Architecture (Modern)
- **Entry Point**: `/react/src/App.tsx` - React Router v6 with lazy loading
- **State Management**: Jotai (atomic) + TanStack Query + Relay (GraphQL)
- **UI Framework**: Ant Design v5 with custom theme support
- **Integration**: `reactToWebComponent` helper for hybrid usage

### GraphQL Integration
- **Relay Environment**: `/react/src/RelayEnvironment.ts` with Backend.AI client
- **Schema**: Auto-generated types in `__generated__/` directories
- **Configuration**: Multi-project setup in `relay.config.js`

### Key Directories
- `/src/` - LitElement WebComponents and core logic
- `/react/src/` - React SPA components and pages
- `/packages/backend.ai-ui/` - Shared UI library
- `/resources/` - Static assets (icons, i18n, themes)
- `/e2e/` - Playwright E2E tests

## Development Patterns

### Component Creation
**React Components**: Follow the pattern in `/react/README.md` for creating React-based web components that integrate with the LitElement shell.

**WebComponents**: Extend `BackendAIPage` and use `@customElement` decorator.

### State Management
- **React**: Use Jotai atoms for global state, TanStack Query for server state
- **WebComponents**: Use Redux store connection via `connect(store)` mixin
- **Settings**: Use `useBAISetting` hooks for persisted configuration

### Styling Guidelines
- **React**: Use Ant Design components with CSS-in-JS (no external CSS imports)
- **WebComponents**: Use CSS custom properties and lit-element `css` templates
- **Theming**: Configure in `/resources/theme.json` for consistent theming

### Testing Approach
- **Unit Tests**: Jest for both React and WebComponent logic
- **E2E Tests**: Playwright with environment configuration in `/e2e/envs/`
- **Test Data**: Use GraphQL fragments and mock Backend.AI responses

### Internationalization
- **Location**: `/resources/i18n/` with JSON files per language
- **React**: Use `react-i18next` hooks
- **WebComponents**: Use `lit-translate` with `_t` and `_text` functions
- **Extraction**: Run `make i18n` to update translation resources

## Specialized Build Targets

### Electron App Building
- `make mac` / `make win` / `make linux` - Build platform-specific apps
- `make bundle` - Create web bundle ZIP file
- Code signing supported via environment variables (see Makefile)

### Docker Deployment
- `make build_docker` - Build Docker image
- Nginx configuration templates in `/docker_build/`
- Supports both HTTP and HTTPS deployment

## Configuration Management

### Environment Configuration
- **Development**: Uses `config.toml` (copy from `config.toml.sample`)
- **Site-specific**: Multiple configs in `/configs/` directory
- **Build-time**: `make web site=[CONFIG_NAME]` for custom builds

### Feature Flags
- Experimental features controlled via settings in React components
- Example: `experimental_neo_session_list`, `experimental_dashboard`

## Important Notes

### Websocket Proxy
The websocket proxy (`/src/wsproxy/`) is essential for development and must be running when developing WebComponents. React development can work independently.

### Migration Strategy
New features should be built in React when possible. The hybrid architecture allows gradual migration from LitElement to React while maintaining compatibility.

### GraphQL Schema Updates
After schema changes, run `pnpm run relay` to regenerate TypeScript types and ensure type safety across the application.