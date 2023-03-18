import ExampleComponent from "./components/ExampleComponent";
import ResourceMonitor from "./components/ResourceMonitor";
import { reactToWebComponentWithDefault } from "./helper";

customElements.define(
  "backend-ai-webui-react-example",
  reactToWebComponentWithDefault(ExampleComponent)
);
customElements.define(
  "backend-ai-webui-react-resource-monitor",
  //@ts-ignore
  reactToWebComponentWithDefault(ResourceMonitor)
);
