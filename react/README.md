# backend-ai-webui-react
This is a react project to integrate WebUI by wrapping web components.


## Limitations & Recommendation
- static assets
  - put that file to `/resources`, and use the path directly.
    ```jsx
    // DO
    <img
      src="/manifest/backend.ai-brand-simple.svg"
      className="App-logo"
      alt="logo"
    />
    // DON'T 
    import logo from "./logo.svg";

    <img src={logo} className="App-logo" alt="logo" />
    ```
- css
  - If you can, [ant design theme features](https://ant.design/docs/react/customize-theme#overridetoken).
  ```js
  // DO
  // inline or other css js library which can inject 
  
  // DON'T 
  // Do not import .css and .module.css
  import './App.css';
  import './App.module.css';
  ```