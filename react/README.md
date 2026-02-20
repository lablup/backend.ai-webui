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
$ pnpm run server:d   # Start React dev server (default port: 9081)
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
- Use `antd-style` for styled components when Ant Design tokens alone aren't sufficient.
- Use inline styles or CSS-in-JS for component-specific styling.

```jsx
// DO: inline styles or antd-style
<Button style={{ width: 100 }} />

// DON'T: import .css or .module.css
import './App.css';
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
