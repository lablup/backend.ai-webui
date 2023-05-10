import reactToWebComponent from "./helper/react-to-webcomponent";
import React from "react";

const DefaultProviders = React.lazy(
  () => import("./components/DefaultProviders")
);
const Information = React.lazy(() => import("./components/Information"));
const Maintenance = React.lazy(() => import("./components/Maintenance"));

customElements.define(
  "backend-ai-react-maintenance",
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <Maintenance />
    </DefaultProviders>
  ))
);

customElements.define(
  "backend-ai-react-information",
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <Information />
    </DefaultProviders>
  ))
);
