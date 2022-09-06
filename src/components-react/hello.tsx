import React, { useState } from 'react';
import * as ReactDOM from "react-dom/client";
import reactToWebComponent from "react-to-webcomponent";
import styles from "./hello.css";

const Hello = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <style>{styles}</style>
      <div>
        <p className={'helloTest'}>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>
          Click me
        </button>
      </div>
    </>
  );
};

const BackendAiReactTestInternalView = reactToWebComponent((Hello as any), (React as any), (ReactDOM as any), {
  shadow: "open",
});
customElements.define('backend-ai-react-test-internal-view', (BackendAiReactTestInternalView as any));

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-react-test-internal-view': typeof BackendAiReactTestInternalView;
  }
}
