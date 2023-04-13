import { Button, DatePicker, Drawer, Modal, Select, Tooltip } from "antd";
import { useState } from "react";
import DefaultProviders from "./components/DefaultProviders";
import ExampleComponent from "./components/ExampleComponent";
import ProjectSelect from "./components/ProjectSelect";
import ResourceMonitor from "./components/ResourceMonitor";
import reactToWebComponent from "./helper/react-to-webcomponent";
import { useTranslation } from "react-i18next";
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
  reactToWebComponent((props) => {
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    
    const { t } = useTranslation();
    
    return (
      <DefaultProviders {...props}>
        {t('Welcome to React')}<br/>
        <DatePicker transitionName="" />
        <Select
          options={[
            { label: "option2", value: "option2" },
            { label: "option1", value: "option1" },
          ]}
          placeholder="please select one"
          transitionName=""
          choiceTransitionName=""
        ></Select>
        <Tooltip title="Hey!" transitionName="">
          <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        </Tooltip>
        <Button onClick={() => setOpen2(true)}>Open Modal</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          getContainer={props.shadowRoot}
        ></Drawer>
        <div id="hello"></div>
        <Modal
          open={open2}
          onCancel={() => setOpen2(false)}
          transitionName=""
          maskTransitionName=""
        >
          Modal
        </Modal>
      </DefaultProviders>
    );
  })
);
