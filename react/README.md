# backend-ai-webui-react

Main React application for Backend.AI WebUI, built with React 19 + Ant Design 6 + Relay 20 (GraphQL).

## Project Structure

```
react/
  src/
    components/       # React UI components
    pages/            # Page-level components
    hooks/            # Custom React hooks
    helper/           # Utility functions
    __generated__/    # Relay compiler output
  craco.config.cjs    # Webpack customization via Craco
```

## Development

```console
$ pnpm run dev    # Start dev server (TypeScript watch + Relay watch + React dev server, default port: 9081)
$ pnpm run wsproxy    # Start websocket proxy (required for local dev)
```

## Static Assets

Put static files in `/resources` and reference them directly:

```jsx
// DO
<img src="/manifest/backend.ai-brand-simple.svg" alt="logo" />

// DON'T
import logo from "./logo.svg";
<img src={logo} alt="logo" />
```

## Styling

- Use Ant Design theme configuration via `/resources/theme.json` for global theming. You can use [the theme editor](https://ant.design/theme-editor).
- Use inline styles for component-specific values that tokens already cover.
- For rules inline styles cannot express (pseudo-classes, descendant selectors,
  media queries), add a **co-located `.css` file next to the component and import
  it there**, using `var(--…)` Astryx custom properties for every value. This
  replaced `antd-style` / `createStyles`, which to-astryx ticket 33 removed.

```jsx
// DO: inline styles for simple, token-backed values
<Button style={{ width: 100 }} />

// DO: a co-located stylesheet for selectors inline styles can't reach
import './MyComponent.css';
```

To import raw CSS strings:

```jsx
import customCss from "./ExampleComponent.css?raw";

const Component = () => {
  return (
    <div>
      <style>{customCss}</style>
    </div>
  );
};
```
