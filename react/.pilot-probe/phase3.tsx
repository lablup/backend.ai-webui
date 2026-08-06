/**
 * PILOT 10 PHASE 3 / ticket 13 — brand-accent probe.
 *
 * Column 1: antd 6 with colorPrimary = #FF7A00  (the target look)
 * Column 2: Astryx under the STOCK neutral theme (the Phase 1/2 blocker)
 * Column 3: Astryx under `defineTheme({color:{accent:'#FF7A00'}})` via <Theme>
 * Column 4: same, but accent swapped LIVE to prove runtime override works
 */
import './probe.css';
import {
  BAI_ACCENT_DARK,
  BAI_ACCENT_LIGHT,
  buildBackendAiTheme,
} from '../src/astryx-theme/backendAiTheme';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Switch } from '@astryxdesign/core/Switch';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Theme } from '@astryxdesign/core/theme';
import { Toast } from '@astryxdesign/core/Toast';
import { neutralTheme } from '@astryxdesign/theme-neutral';
import { Button as AButton, ConfigProvider, Radio, Switch as ASwitch, Tabs, theme } from 'antd';
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

const ORANGE = '#FF7A00';
const PURPLE = '#8B5CF6';

/** Every Astryx control whose look is accent-driven, in one block. */
const AstryxControls: React.FC<{ id: string }> = ({ id }) => {
  const [tab, setTab] = useState('active');
  const [mode, setMode] = useState('all');
  const [usage, setUsage] = useState('general');
  const [on, setOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [text, setText] = useState('folder-name');
  return (
    <div>
      <div className="section">
        <div className="section-title">Button</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button label="Create folder" variant="primary" />
          <Button label="Cancel" variant="secondary" />
          <Button label="Delete" variant="destructive" />
        </div>
      </div>
      <div className="section">
        <div className="section-title">TabList + Badge</div>
        <TabList value={tab} onChange={setTab} hasDivider>
          <Tab
            value="active"
            label="Active"
            endContent={<Badge label={12} variant="info" />}
          />
          <Tab value="deleted" label="Trash Bin" />
        </TabList>
      </div>
      <div className="section">
        <div className="section-title">SegmentedControl</div>
        <SegmentedControl value={mode} onChange={setMode} label="mode">
          <SegmentedControlItem value="all" label="All" />
          <SegmentedControlItem value="general" label="General" />
          <SegmentedControlItem value="model" label="Models" />
        </SegmentedControl>
      </div>
      <div className="section">
        <div className="section-title">Radio / Checkbox / Switch</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <RadioList
            value={usage}
            onChange={setUsage}
            label="usage"
            isLabelHidden
            orientation="horizontal"
          >
            <RadioListItem value="general" label="General" />
            <RadioListItem value="model" label="Models" />
          </RadioList>
          <CheckboxInput
            value={checked}
            onChange={setChecked}
            label="Cloneable"
          />
          <Switch value={on} onChange={setOn} label="Auto" />
        </div>
      </div>
      <div className="section">
        <div className="section-title">TextInput (focus ring / caret)</div>
        <TextInput
          value={text}
          onChange={setText}
          label="Folder name"
          isLabelHidden
          width={260}
          hasAutoFocus={id === 'themed'}
        />
      </div>
      <div className="section">
        <div className="section-title">Toast</div>
        <Toast body="Moved 3 folders to the trash bin" type="info" />
      </div>
      <div className="section">
        <div className="section-title">Text color="accent"</div>
        <Text color="accent">Accent-coloured text</Text>
      </div>
    </div>
  );
};

const Col: React.FC<{ head: string; children: React.ReactNode }> = ({
  head,
  children,
}) => (
  <div className="col">
    <div className="col-head">{head}</div>
    {children}
  </div>
);

const AntdCol: React.FC<{ dark: boolean }> = ({ dark }) => {
  const [tab, setTab] = useState('active');
  const [mode, setMode] = useState('all');
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: ORANGE },
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Col head="1 · antd (target)">
        <div className="section">
          <div className="section-title">Button</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <AButton type="primary">Create folder</AButton>
            <AButton>Cancel</AButton>
            <AButton danger>Delete</AButton>
          </div>
        </div>
        <div className="section">
          <div className="section-title">Tabs</div>
          <Tabs
            activeKey={tab}
            onChange={setTab}
            items={[
              { key: 'active', label: 'Active' },
              { key: 'deleted', label: 'Trash Bin' },
            ]}
          />
        </div>
        <div className="section">
          <div className="section-title">Radio group</div>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            options={[
              { label: 'All', value: 'all' },
              { label: 'General', value: 'general' },
              { label: 'Models', value: 'model' },
            ]}
          />
        </div>
        <div className="section">
          <div className="section-title">Radio / Switch</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Radio checked>General</Radio>
            <ASwitch defaultChecked />
          </div>
        </div>
      </Col>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  // Derive from the OS/emulated preference, NOT from `data-theme` on <html>:
  // every root <Theme> syncs that attribute itself, so reading it back is a race.
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode = dark ? ('dark' as const) : ('light' as const);

  // #2 in the coordinator's list: a live accent swap, built at runtime.
  const [liveAccent, setLiveAccent] = useState(PURPLE);
  const brandTheme = useMemo(() => buildBackendAiTheme(), []);
  const liveTheme = useMemo(
    () =>
      buildBackendAiTheme({
        accentLight: liveAccent,
        accentDark: liveAccent,
      }),
    [liveAccent],
  );

  return (
    <div className="page page-4">
      <AntdCol dark={dark} />

      <Theme theme={neutralTheme} mode={mode}>
        <LayerProvider>
          <Col head="2 · Astryx stock neutral">
            <AstryxControls id="stock" />
          </Col>
        </LayerProvider>
      </Theme>

      <Theme theme={brandTheme} mode={mode}>
        <LayerProvider>
          <Col head={`3 · defineTheme accent ${BAI_ACCENT_LIGHT}/${BAI_ACCENT_DARK}`}>
            <AstryxControls id="themed" />
          </Col>
        </LayerProvider>
      </Theme>

      <Theme theme={liveTheme} mode={mode}>
        <LayerProvider>
          <Col head={`4 · runtime swap → ${liveAccent}`}>
            <div className="section">
              <button
                id="swap-accent"
                onClick={() =>
                  setLiveAccent((a) => (a === PURPLE ? '#0EA5E9' : PURPLE))
                }
              >
                swap accent
              </button>
            </div>
            <AstryxControls id="live" />
          </Col>
        </LayerProvider>
      </Theme>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
