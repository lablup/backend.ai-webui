/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIFormItem measurement harness (to-astryx ticket 05, adapted from
 spike/astryx-form-split's `react/spike-probe/`).

 Serves at `/theme-probe/form.html` under the standalone theme-probe Vite
 config (same reason as brand.html: the app dev server always re-renders the
 app template for any .html):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts
   -> http://127.0.0.1:9198/theme-probe/form.html

 Renders the SAME representative form twice: once with antd `Form.Item`
 (baseline), once with `BAIFormItem` (own visual layer + `<Form.Item noStyle>`
 state engine). The form body is lifted from the real
 `react/src/components/AutoScalingRuleEditorModal.tsx` (mid complexity:
 cross-field validation via `dependencies` + `getFieldValue`, nested
 `noStyle` items inside a layout item, declarative + custom + async
 validators, conditional field mounting via `shouldUpdate`, `valuePropName`,
 `Form.List`). Relay/i18n/BAI deps stubbed.

 Mounted inside the ticket-02 brand `Theme` with `../src/index.css`, so
 BAIFormItem resolves the same Astryx tokens the migrated app will provide.

 URL params:
   ?variant=antd|bai|both   which column(s) to render (default both)
   ?mode=light|dark         Astryx theme mode (default light). NOTE: the
                            antd column has no ConfigProvider darkAlgorithm
                            here, so in dark mode it stays light — the
                            "independent dark-mode switches" frontier hazard,
                            on purpose (visual-compare.mjs reports it via
                            token compliance).
   ?strip=form|all          drop antd's injected CSS after mount, simulating
                            the post-theme-removal world where antd's
                            cssinjs layer is gone. `form` drops only rules
                            mentioning `.ant-form`.
   ?state=pristine|error    error = run validateFields() on mount

 Exposed handles (read by measure-05-form-item.mjs):
   window.form_antd / form_bai / validate_antd / validate_bai
   window.stripAntdStyles(mode) / window.__stripped
 */
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import BAIFormItem from '../src/components/BAIFormItem';
import '../src/index.css';
import {
  InfoCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Theme } from '@astryxdesign/core/theme';
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  Typography,
} from 'antd';
import type { FormInstance } from 'antd';
import React from 'react';
import { createRoot } from 'react-dom/client';

const params = new URLSearchParams(location.search);
const VARIANT = params.get('variant') ?? 'both';
const MODE = params.get('mode') === 'dark' ? 'dark' : 'light';
const STRIP = params.get('strip');
const STATE = params.get('state') ?? 'pristine';

type ItemComponent = typeof Form.Item;

const SIGNED_32BIT_MAX_INT = 2147483647;

const Col: React.FC<{
  gap?: number;
  children: React.ReactNode;
}> = ({ gap = 8, children }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap,
    }}
  >
    {children}
  </div>
);

const Row: React.FC<{
  align?: 'center' | 'start';
  children: React.ReactNode;
}> = ({ align = 'center', children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      gap: 8,
    }}
  >
    {children}
  </div>
);

interface BodyProps {
  Item: ItemComponent;
  form: FormInstance;
}

/** Lifted from AutoScalingRuleEditorModal.tsx (props preserved verbatim). */
const AutoScalingRuleFormBody: React.FC<BodyProps> = ({ Item, form }) => {
  'use memo';
  const [conditionMode, setConditionMode] = React.useState<
    'scale_in' | 'scale_out' | 'scale_in_out'
  >('scale_in_out');

  return (
    <>
      <Item
        label="Metric source"
        name="metricSource"
        rules={[{ required: true }]}
        tooltip={<InfoCircleOutlined />}
      >
        <Select
          options={[
            { label: 'Kernel', value: 'kernel' },
            { label: 'Inference framework', value: 'inference_framework' },
            { label: 'Prometheus', value: 'prometheus' },
          ]}
        />
      </Item>

      <Item
        label="Metric name"
        name="metricName"
        rules={[{ required: true, message: 'Metric name is required' }]}
        extra="The metric the rule observes."
      >
        <Input placeholder="e.g. cpu_util" />
      </Item>

      {/* Layout-only item with nested noStyle fields — the pattern that makes
          the visual/engine split interesting (NoStyleItemContext aggregation). */}
      <Item label="Condition" required tooltip={<InfoCircleOutlined />}>
        <Form.Item name="conditionMode" noStyle>
          <Radio.Group
            optionType="button"
            onChange={(e) => setConditionMode(e.target.value)}
            style={{ marginBottom: 8 }}
            options={[
              { label: 'Scale in', value: 'scale_in' },
              { label: 'Scale out', value: 'scale_out' },
              { label: 'Scale in & out', value: 'scale_in_out' },
            ]}
          />
        </Form.Item>

        {conditionMode === 'scale_in_out' ? (
          <Col>
            <Row>
              <Typography.Text style={{ flexShrink: 0 }}>
                {'Metric <'}
              </Typography.Text>
              <Form.Item
                name="minThreshold"
                noStyle
                rules={[
                  { required: true, message: 'Min threshold is required' },
                  {
                    type: 'number',
                    min: 0,
                    message: 'Threshold must be non-negative',
                  },
                ]}
              >
                <InputNumber
                  placeholder="Min threshold"
                  style={{ flex: 1, width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item
                name="maxThreshold"
                noStyle
                dependencies={['minThreshold']}
                rules={[
                  { required: true, message: 'Max threshold is required' },
                  {
                    type: 'number',
                    min: 0,
                    message: 'Threshold must be non-negative',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const min = getFieldValue('minThreshold');
                      if (min != null && value != null && min >= value) {
                        return Promise.reject(
                          new Error('Min must be less than max'),
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber
                  placeholder="Max threshold"
                  style={{ flex: 1, width: '100%' }}
                  min={0}
                />
              </Form.Item>
              <Typography.Text style={{ flexShrink: 0 }}>
                {'< Metric'}
              </Typography.Text>
            </Row>
          </Col>
        ) : (
          <Row>
            <Form.Item
              name="threshold"
              noStyle
              rules={[
                { required: true, message: 'Threshold is required' },
                {
                  type: 'number',
                  min: 0,
                  message: 'Threshold must be non-negative',
                },
              ]}
            >
              <InputNumber
                placeholder="Threshold"
                style={{ flex: 1, width: '100%' }}
                min={0}
              />
            </Form.Item>
          </Row>
        )}
      </Item>

      <Item
        label="Step size"
        name="stepSize"
        tooltip={<InfoCircleOutlined />}
        rules={[
          { required: true },
          { type: 'number', min: 1, max: SIGNED_32BIT_MAX_INT },
          {
            validator: (_, value) => {
              if (value % 1 !== 0) {
                return Promise.reject(
                  new Error('Only positive integers are allowed'),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <InputNumber min={1} step={1} style={{ width: '100%' }} />
      </Item>

      {/* async validator */}
      <Item
        label="Rule name"
        name="ruleName"
        rules={[
          { required: true },
          {
            validator: async (_, value) => {
              if (!value) return;
              await new Promise((r) => setTimeout(r, 50));
              if (String(value).startsWith('reserved-')) {
                throw new Error('This name is reserved');
              }
            },
          },
        ]}
        help={undefined}
      >
        <Input placeholder="rule name" />
      </Item>

      {/* valuePropName + conditional visibility driven by another field */}
      <Item label="Enabled" name="enabled" valuePropName="checked">
        <Switch />
      </Item>

      <Item noStyle shouldUpdate={(prev, cur) => prev.enabled !== cur.enabled}>
        {() =>
          form.getFieldValue('enabled') ? (
            <Item
              label="Cooldown (seconds)"
              name="cooldown"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Item>
          ) : null
        }
      </Item>

      <Divider />

      {/* Form.List with nested name paths */}
      <Form.List name="tags">
        {(fields, { add, remove }) => (
          <Col>
            {fields.map((field) => (
              <Row key={field.key} align="start">
                <Item
                  label="Key"
                  name={[field.name, 'key']}
                  rules={[{ required: true, message: 'Key is required' }]}
                  style={{ flex: 1, marginBottom: 8 }}
                >
                  <Input placeholder="key" />
                </Item>
                <Item
                  label="Value"
                  name={[field.name, 'value']}
                  style={{ flex: 1, marginBottom: 8 }}
                >
                  <Input placeholder="value" />
                </Item>
                <Button
                  type="text"
                  icon={<MinusCircleOutlined />}
                  onClick={() => remove(field.name)}
                  style={{ marginTop: 28 }}
                />
              </Row>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add({ key: '', value: '' })}
            >
              Add tag
            </Button>
          </Col>
        )}
      </Form.List>
    </>
  );
};

const Column: React.FC<{ title: string; Item: ItemComponent; id: string }> = ({
  title,
  Item,
  id,
}) => {
  'use memo';
  const [form] = Form.useForm();
  const [result, setResult] = React.useState<string>('');

  const validate = () => {
    form
      .validateFields()
      .then((values) => setResult('OK ' + JSON.stringify(values)))
      .catch((info) => {
        setResult(
          'REJECT keys=' +
            JSON.stringify(Object.keys(info)) +
            ' errorFields=' +
            JSON.stringify(
              info.errorFields?.map((f: { name: unknown }) => f.name),
            ) +
            ' outOfDate=' +
            String(info.outOfDate),
        );
      });
  };

  React.useEffect(() => {
    (window as unknown as Record<string, unknown>)[`validate_${id}`] = validate;
    (window as unknown as Record<string, unknown>)[`form_${id}`] = form;
    if (STATE === 'error') {
      setTimeout(validate, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id={id}
      style={{ flex: 1, minWidth: 0, padding: 16, border: '1px solid #eee' }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{
          metricSource: 'kernel',
          conditionMode: 'scale_in_out',
          enabled: true,
          tags: [{ key: 'env', value: 'prod' }],
        }}
        onFinish={() => {}}
      >
        <AutoScalingRuleFormBody Item={Item} form={form} />
      </Form>
      <Button onClick={validate}>Validate</Button>
      <pre
        data-result={id}
        style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#555' }}
      >
        {result}
      </pre>
    </div>
  );
};

function stripAntdStyles(mode: string) {
  let removed = 0;
  document.querySelectorAll('style').forEach((el) => {
    const txt = el.textContent ?? '';
    if (mode === 'all' ? txt.includes('.ant-') : txt.includes('.ant-form')) {
      el.remove();
      removed += 1;
    }
  });
  return removed;
}

const Probe: React.FC = () => {
  'use memo';
  React.useEffect(() => {
    (window as unknown as Record<string, unknown>).stripAntdStyles =
      stripAntdStyles;
    if (STRIP) {
      // let antd's cssinjs flush first
      setTimeout(() => {
        const n = stripAntdStyles(STRIP);
        (window as unknown as Record<string, unknown>).__stripped = n;
        // cssinjs re-injects on re-render; keep dropping.
        const mo = new MutationObserver(() => stripAntdStyles(STRIP));
        mo.observe(document.head, { childList: true });
      }, 300);
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: 16,
        alignItems: 'flex-start',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-surface, #fff)',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {VARIANT !== 'bai' && (
        <Column id="antd" title="antd Form.Item (baseline)" Item={Form.Item} />
      )}
      {VARIANT !== 'antd' && (
        <Column
          id="bai"
          title="BAIFormItem (own visual + Form.Item noStyle engine)"
          Item={BAIFormItem as unknown as ItemComponent}
        />
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <Theme theme={backendAiBrandTheme} mode={MODE}>
    <Probe />
  </Theme>,
);
