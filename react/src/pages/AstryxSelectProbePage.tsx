/**
 * SPIKE — Astryx select architecture probe (cn-oss-removal ticket 12).
 * NOT FOR PRODUCTION. Route: /astryx-select-probe
 */
import {
  AstryxUserSelectComplex,
  AstryxUserTypeahead,
  AstryxUserTokenizer,
  type LabelInValue,
} from '../components/AstryxUserSelect';
import BAISelectAstryxShim from '../components/BAISelectAstryxShim';
import { Selector } from '@astryxdesign/core/Selector';
import { VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/theme-neutral/theme.css';
import { Form, Select, Typography } from 'antd';
import React, { Suspense, useState } from 'react';

/** 500 synthetic options — the virtualisation stress test. */
const BIG_OPTIONS = Array.from({ length: 500 }, (_v, i) => ({
  value: `opt-${i}`,
  label: `Option ${i} — cr.backend.ai/stable/python-ff:24.03-py310-cuda12`,
}));

const VolumeProbe: React.FC = () => {
  'use memo';
  const [astryxValue, setAstryxValue] = useState<string | null>(null);
  const [antdValue, setAntdValue] = useState<string>();
  return (
    <VStack gap={3}>
      <Text type="label">
        500-option volume test — Astryx Selector (no virtualisation) vs antd
        Select (rc-virtual-list). Open each and scroll.
      </Text>
      <div data-testid="astryx-500">
        <Selector
          label="Astryx Selector · 500 options"
          options={BIG_OPTIONS}
          hasClear
          value={astryxValue}
          onChange={setAstryxValue}
          hasSearch
          width={520}
        />
      </div>
      <div data-testid="antd-500" style={{ width: 520 }}>
        <Select
          style={{ width: '100%' }}
          placeholder="antd Select · 500 options"
          options={BIG_OPTIONS}
          showSearch
          value={antdValue}
          onChange={setAntdValue}
        />
      </div>
    </VStack>
  );
};

const AstryxSelectProbePage: React.FC = () => {
  'use memo';
  const [single, setSingle] = useState<LabelInValue | null>(null);
  const [multi, setMulti] = useState<LabelInValue[]>([]);
  const [tags, setTags] = useState<LabelInValue[]>([]);

  return (
    <VStack gap={5} padding={4}>
      <Typography.Title level={3}>
        Astryx select architecture probe
      </Typography.Title>

      <VStack gap={2}>
        <Text type="label">
          1. ComplexSelector + hand-built listbox — Relay `loadNext` on scroll
          (the `onPopupScroll` reimplementation)
        </Text>
        <Suspense fallback={<Text>loading…</Text>}>
          <AstryxUserSelectComplex
            label="Owner (single, scroll-paginated)"
            value={single}
            onChange={(v) => setSingle(v as LabelInValue | null)}
          />
        </Suspense>
        <Suspense fallback={<Text>loading…</Text>}>
          <AstryxUserSelectComplex
            label="Members (multiple, scroll-paginated)"
            multiple
            value={multi}
            onChange={(v) => setMulti((v ?? []) as LabelInValue[])}
          />
        </Suspense>
      </VStack>

      <VStack gap={2}>
        <Text type="label">
          2. Typeahead / Tokenizer — idiomatic Astryx `searchSource` (top-N per
          query; scrolling loads nothing)
        </Text>
        <AstryxUserTypeahead
          label="Owner (Typeahead)"
          value={single}
          onChange={setSingle}
        />
        <AstryxUserTokenizer
          label="Members (Tokenizer, free text allowed)"
          value={tags}
          onChange={setTags}
          allowFreeText
          maxCount={5}
        />
      </VStack>

      <VStack gap={2}>
        <Text type="label">
          3. BAISelect-as-adapter shim inside an antd Form.Item
        </Text>
        <Form layout="vertical" style={{ maxWidth: 520 }}>
          <Form.Item name="scalingGroup" label="Resource group (shim, single)">
            <BAISelectAstryxShim
              label="Resource group"
              options={[
                { label: 'default', value: 'default' },
                {
                  label: 'GPU pools',
                  options: [
                    { label: 'gpu-a100', value: 'gpu-a100' },
                    { label: 'gpu-h100', value: 'gpu-h100' },
                  ],
                },
              ]}
            />
          </Form.Item>
          <Form.Item name="mounts" label="Mounts (shim, multiple)">
            <BAISelectAstryxShim
              label="Mounts"
              mode="multiple"
              options={[
                { label: 'home', value: 'home' },
                { label: 'data', value: 'data' },
                { label: 'models', value: 'models' },
              ]}
            />
          </Form.Item>
        </Form>
      </VStack>

      <VolumeProbe />
    </VStack>
  );
};

export default AstryxSelectProbePage;
