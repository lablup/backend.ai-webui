import { DatePicker, Select, Tooltip, Button, Drawer, Modal } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useWebComponentInfo } from './DefaultProviders';

const ProjectSelector = () => {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const {
    props: { shadowRoot },
  } = useWebComponentInfo();

  const { t } = useTranslation();
  return (
    <>
    {t('webui.menu.WelcomeMessage')}<br/>
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
          getContainer={shadowRoot}
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
        </>
  )
}

export default ProjectSelector