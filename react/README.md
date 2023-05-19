# backend-ai-webui-react
This is a react project to integrate WebUI by wrapping web components.

## Steps to Create a React-based Web Component
1. Create a file under `/react/src/components` or `/react/src/pages` (e.g. `NewComponent`).
2. Define a web component using the `reactWebComponent` function in `/react/src/index.tsx`:
    ```tsx
    // You should import using React.lazy to reduce the initial JS bundle size.
    const NewComponent = React.lazy(() => import("./components/NewComponent"));

    customElements.define(
      "backend-ai-react-newcomponent",
      reactToWebComponent((props) => {
        return (
          // In most cases, you will need to access the backend.ai client and apply the same UI theme.
          // After wrapping `DefaultProvider`, you can use custom hooks such as `useSuspendedBackendaiClient`. 
          <DefaultProviders {...props}>
            <NewComponent />
          </DefaultProviders>
        );
      })
    );
    ```
3. You can now use your new React-based web component in a lit component.
4. If you want to use an existing web component as a child of your React-based web component, you have two options:
  - Option 1: After importing the existing web component in the web component that uses the React-based web component, you can use the existing web component directly in the React component file.
  - Option 2. You can use `<slot>` like this:
    ```jsx
    // In lit web component
    <backend-ai-react-newcomponent>
      <existing-web-component slot="hello"></existing-web-component> 
    </backend-ai-react-newcomponent>

    // In react component
    const NewComponent = ()=>{

      return <div>
        <h1> hello </h1>
        <slot name="hello"/> 
      </div>
    }
    ```

## Limitations & Recommendation
- static assets
  - put that file to `/resources`, and use the path directly.
    ```jsx
    // ✅ DO
    <img
      src="/manifest/backend.ai-brand-simple.svg"
      className="App-logo"
      alt="logo"
    />
    // ❌ DON'T 
    import logo from "./logo.svg";

    <img src={logo} className="App-logo" alt="logo" />
    ```
- css
  - If you want to customize the overall theme, you can use the Ant Design theme configuration. Please put your settings in /`resources/theme.json`. You can use [the theme editor](https://ant.design/theme-editor).
  - "Importing `.css` directly in a React file doesn't work, but you can use inline styles. Only injecting to the shadow DOM works properly.
    ```js
    // ✅ DO
    // inline or other css js library which can inject 
    <Button style={{width:100}}/>

    // ❌ DON'T 
    // Do not import .css and .module.css
    import './App.css';
    import './App.module.css';
    ```
  - To import the raw string from a CSS file, add the `?raw` prefix.
    ```jsx
    import customCss from "./ExampleComponent.css?raw";

    const Component = ()=>{
      return <div>
        <style>{customCss}</style>
      </div>
    }
    ```