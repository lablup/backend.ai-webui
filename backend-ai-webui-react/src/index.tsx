import DefaultProviders from "./components/DefaultProviders";
import ExampleComponent from "./components/ExampleComponent";
import ProjectSelect from "./components/ProjectSelect";
import ResourceMonitor from "./components/ResourceMonitor";
import reactToWebComponent from "./helper/react-to-webcomponent";
// customElements.define(
//   "backend-ai-webui-react-example",
//   reactToWebComponentWithDefault(ExampleComponent)
// );

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
  reactToWebComponent((props) => (
    <DefaultProviders {...props}>
      <ProjectSelect />
    </DefaultProviders>
  ))
);
