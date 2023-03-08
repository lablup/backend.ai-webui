import ExampleComponent from "./components/ExampleComponent";
import { reactToWebComponentWithDefault } from "./helper";

customElements.define(
  "backend-ai-webui-react-example",
  reactToWebComponentWithDefault(ExampleComponent)
);
