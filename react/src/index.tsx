import reactToWebComponent from "./helper/react-to-webcomponent";
import React from "react";

const DefaultProviders = React.lazy(
  () => import("./components/DefaultProviders")
);
const Information = React.lazy(() => import("./components/Information"));
const SessionList = React.lazy(() => import("./pages/SessionList"));

customElements.define(
  "backend-ai-react-information",
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <Information />
      </DefaultProviders>
    );
  })
);

customElements.define(
  "backend-ai-react-session-list",
  reactToWebComponent((props) => {
    return (
      <DefaultProviders {...props}>
        <SessionList>{props.children}</SessionList>
      </DefaultProviders>
    );
  })
);
