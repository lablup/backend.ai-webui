// import Information from "./components/Information";


import reactToWebComponent from "./helper/react-to-webcomponent";
import React from "react";
// customElements.define(
//   "backend-ai-webui-react-example",
//   reactToWebComponentWithDefault(ExampleComponent)
// );

const DefaultProviders = React.lazy(() => import("./components/DefaultProviders"));
const ExampleComponent = React.lazy(() => import("./components/ExampleComponent"));
const Information = React.lazy(() => import("./components/Information"));
const ProjectSelect = React.lazy(() => import("./components/ProjectSelect"));
const ResourceMonitor = React.lazy(() => import("./components/ResourceMonitor"));
const Maintenance = React.lazy(() => import("./components/Maintenance"));

// import DefaultProviders from "./components/DefaultProviders";
// import ExampleComponent from "./components/ExampleComponent";
// import ProjectSelect from "./components/ProjectSelect";
// import ResourceMonitor from "./components/ResourceMonitor";
// import Maintenance from "./components/Maintenance";


customElements.define(
  "backend-ai-webui-react-example",
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <ExampleComponent />
    </DefaultProviders>
  ))
);

customElements.define(
  "backend-ai-webui-react-resource-monitor",
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <ResourceMonitor />
    </DefaultProviders>
  ))
);

customElements.define(
  "backend-ai-webui-react-project-select",
  reactToWebComponent((props) => {
    
    return (
      <DefaultProviders {...props}>
        <ProjectSelect/>
      </DefaultProviders>
    );
  })
);

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
