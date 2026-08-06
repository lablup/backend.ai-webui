/**
 * PILOT 10 — isolation harness.
 *
 * The real page needs a Backend.AI cluster (Relay query + auth) which is not
 * reachable in this environment, so this renders the EXACT before/after JSX
 * shapes produced by the conversion, side by side, in light and dark.
 *
 * Left column  = antd 6 (the baseline the page had).
 * Right column = Astryx (what the converted page renders).
 */
import './probe.css';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';
import { Badge as ABadge } from '@astryxdesign/core/Badge';
import { Divider as ADivider } from '@astryxdesign/core/Divider';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Skeleton as ASkeleton } from '@astryxdesign/core/Skeleton';
import { Switch as ASwitch } from '@astryxdesign/core/Switch';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text as AText } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Toast } from '@astryxdesign/core/Toast';
import {
  Badge,
  ConfigProvider,
  Divider,
  Input,
  Radio,
  Skeleton,
  Switch,
  Tabs,
  Typography,
  theme,
} from 'antd';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const ORANGE = '#ff7a00';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="section">
    <div className="section-title">{title}</div>
    <div className="section-body">{children}</div>
  </div>
);

const Antd: React.FC<{ dark: boolean }> = ({ dark }) => {
  const [mode, setMode] = useState('all');
  const [usage, setUsage] = useState('general');
  const [tab, setTab] = useState('active');
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: ORANGE },
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="col">
        <div className="col-head">antd 6 — BEFORE</div>

        <Section title="BAITabs (Tabs type=card + Badge count)">
          <Tabs
            type="card"
            activeKey={tab}
            onChange={setTab}
            items={[
              {
                key: 'active',
                label: (
                  <span style={{ display: 'flex', gap: 10 }}>
                    Active
                    <Badge
                      count={12}
                      color={tab === 'active' ? ORANGE : 'rgba(0,0,0,.25)'}
                      size="small"
                      showZero
                      style={{ paddingInline: 8, fontSize: 10 }}
                    />
                  </span>
                ),
              },
              {
                key: 'deleted',
                label: (
                  <span style={{ display: 'flex', gap: 10 }}>
                    Trash Bin
                    <Badge
                      count={3}
                      color={tab === 'deleted' ? ORANGE : 'rgba(0,0,0,.25)'}
                      size="small"
                      showZero
                      style={{ paddingInline: 8, fontSize: 10 }}
                    />
                  </span>
                ),
              },
            ]}
          />
        </Section>

        <Section title="BAIRadioGroup (Radio.Group optionType=button solid)">
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            options={[
              { label: 'All', value: 'all' },
              { label: 'General', value: 'general' },
              { label: 'AutoMount', value: 'automount' },
              { label: 'Models', value: 'model' },
            ]}
          />
        </Section>

        <Section title="Form controls (Form.Item + Input / Radio / Switch)">
          <div className="field">
            <label className="lbl">
              <span className="req">*</span> Folder name
            </label>
            <Input placeholder="Up to 64 characters" />
          </div>
          <Divider />
          <div className="field">
            <label className="lbl">
              <span className="req">*</span> Usage mode
            </label>
            <Radio.Group value={usage} onChange={(e) => setUsage(e.target.value)}>
              <Radio value="general">General</Radio>
              <Radio value="model">Models</Radio>
              <Radio value="automount">AutoMount</Radio>
            </Radio.Group>
          </div>
          <Divider />
          <div className="field">
            <label className="lbl">Cloneable</label>
            <Switch />
          </div>
          <div className="field err">
            <label className="lbl">
              <span className="req">*</span> Type
            </label>
            <div>
              <Radio.Group value="project">
                <Radio value="user">User</Radio>
                <Radio value="project">Project</Radio>
              </Radio.Group>
              <div className="explain">
                Model folders can only be created in the exclusive project.
              </div>
            </div>
          </div>
        </Section>

        <Section title="Skeleton / Text / Divider">
          <Skeleton.Input active style={{ width: 240 }} />
          <div style={{ height: 8 }} />
          <Typography.Text>Move 3 folders to the trash bin?</Typography.Text>
          <br />
          <Typography.Text type="secondary">Mounted sessions</Typography.Text>
          <Divider />
        </Section>
      </div>
    </ConfigProvider>
  );
};

const Astryx: React.FC = () => {
  const [mode, setMode] = useState('all');
  const [usage, setUsage] = useState('general');
  const [tab, setTab] = useState('active');
  const [name, setName] = useState('');
  const [cloneable, setCloneable] = useState(false);
  return (
    <div className="col">
      <div className="col-head">Astryx — AFTER</div>

      <Section title="BAITabs (TabList/Tab + Badge endContent)">
        <TabList value={tab} onChange={setTab} hasDivider>
          <Tab
            value="active"
            label="Active"
            endContent={
              <ABadge label={12} variant={tab === 'active' ? 'info' : 'neutral'} />
            }
          />
          <Tab
            value="deleted"
            label="Trash Bin"
            endContent={
              <ABadge label={3} variant={tab === 'deleted' ? 'info' : 'neutral'} />
            }
          />
        </TabList>
      </Section>

      <Section title="BAIRadioGroup (SegmentedControl)">
        <SegmentedControl value={mode} onChange={setMode} label="Folder mode">
          <SegmentedControlItem value="all" label="All" />
          <SegmentedControlItem value="general" label="General" />
          <SegmentedControlItem value="automount" label="AutoMount" />
          <SegmentedControlItem value="model" label="Models" />
        </SegmentedControl>
      </Section>

      <Section title="Form controls (BAIFormItem + Astryx controls)">
        <div className="field">
          <label className="lbl">
            <span className="req">*</span> Folder name
          </label>
          <TextInput
            value={name}
            onChange={setName}
            label="Folder name"
            isLabelHidden
            placeholder="Up to 64 characters"
            width="100%"
          />
        </div>
        <ADivider />
        <div className="field">
          <label className="lbl">
            <span className="req">*</span> Usage mode
          </label>
          <RadioList
            value={usage}
            onChange={setUsage}
            label="Usage mode"
            isLabelHidden
            orientation="horizontal"
          >
            <RadioListItem value="general" label="General" />
            <RadioListItem value="model" label="Models" />
            <RadioListItem value="automount" label="AutoMount" />
          </RadioList>
        </div>
        <ADivider />
        <div className="field">
          <label className="lbl">Cloneable</label>
          <ASwitch
            value={cloneable}
            onChange={setCloneable}
            label="Cloneable"
            isLabelHidden
          />
        </div>
        <div className="field err">
          <label className="lbl">
            <span className="req">*</span> Type
          </label>
          <div>
            <RadioList
              value="project"
              onChange={() => {}}
              label="Type"
              isLabelHidden
              orientation="horizontal"
            >
              <RadioListItem value="user" label="User" />
              <RadioListItem value="project" label="Project" />
            </RadioList>
            <div className="explain">
              Model folders can only be created in the exclusive project.
            </div>
          </div>
        </div>
      </Section>

      <Section title="Skeleton / Text / Divider">
        <ASkeleton width={240} height={32} />
        <div style={{ height: 8 }} />
        <AText>Move 3 folders to the trash bin?</AText>
        <br />
        <AText color="secondary">Mounted sessions</AText>
        <ADivider />
      </Section>

      <Section title="App shim — message.error / modal.confirm">
        <Toast body="Failed to delete folder: permission denied" type="error" />
        <div style={{ height: 8 }} />
        <Toast body="Moved 3 folders to the trash bin" type="info" />
        <div style={{ height: 12 }} />
        <AlertDialog
          isInline
          isOpen
          onOpenChange={() => {}}
          title="Move to trash"
          description="my-training-data"
          actionLabel="Confirm"
          cancelLabel="Cancel"
          onAction={() => {}}
        />
      </Section>
    </div>
  );
};

const App: React.FC = () => {
  const dark =
    document.documentElement.getAttribute('data-theme') === 'dark';
  return (
    <div className="page">
      <Antd dark={dark} />
      <Astryx />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
