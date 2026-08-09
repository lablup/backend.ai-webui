/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Form parity harness (to-astryx ticket 05, re-aimed by ticket 35).

 Serves at `/theme-probe/form.html` under the standalone theme-probe Vite
 config (same reason as brand.html: the app dev server always re-renders the
 app template for any .html):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts
   -> http://127.0.0.1:9198/theme-probe/form.html

 Renders the SAME representative form twice, from the SAME source body:
 once on antd's whole form stack (antd `<Form>` + antd `<Form.Item>`), once
 on the self-hosted engine (`../src/form-engine`, whose `Form.Item` IS
 `BAIFormItem`). Ticket 05 compared two ITEM renderers over one engine;
 ticket 34 replaced the engine, so the meaningful comparison is now stack vs
 stack — same props in, same pixels and same validation text out.

 The form body is lifted from the real
 `react/src/components/AutoScalingRuleEditorModal.tsx` (mid complexity:
 cross-field validation via `dependencies` + `getFieldValue`, nested
 `noStyle` items inside a layout item, declarative + custom + async
 validators, conditional field mounting via `shouldUpdate`, `valuePropName`,
 `Form.List`). Relay/i18n/BAI deps stubbed.

 Both columns get the app's `requiredMark` FUNCTION — antd's through
 `<ConfigProvider form>`, the engine's through `<FormConfigProvider>` — so
 the probe exercises the real product contract (no asterisks; "(Optional)"
 appended to non-required labels) rather than the library defaults.

 Mounted inside the ticket-02 brand `Theme` with `../src/index.css`, so the
 engine's visual shell resolves the same Astryx tokens the migrated app
 provides.

 URL params:
   ?variant=antd|bai|both   which column(s) to render (default both)
   ?mode=light|dark         theme mode (default light). Applied to BOTH
                            switches: Astryx `Theme mode` and antd's
                            `ConfigProvider theme.algorithm`, so the two
                            columns are comparable in dark.
   ?layout=vertical|horizontal  `<Form layout>` for both columns.
   ?strip=form|all          drop antd's injected CSS after mount, simulating
                            the post-theme-removal world where antd's
                            cssinjs layer is gone. `form` drops only rules
                            mentioning `.ant-form`. The engine column must be
                            pixel-unchanged by this; the antd column collapses.
   ?state=pristine|error    error = run validateFields() on mount
   ?lang=en|ko|ja|…         switches BOTH message tables: antd's via
                            `ConfigProvider locale`, the engine's via BUI's
                            i18next (which `FormConfigProvider` reads). The
                            `{ required: true }` rules below carry no explicit
                            `message`, so their text comes from those tables
                            and nowhere else — which is what makes this probe
                            a check on ticket 35's ported catalogs.

 Exposed handles (read by measure-05-form-item.mjs):
   window.form_antd / form_bai / validate_antd / validate_bai
   window.stripAntdStyles(mode) / window.__stripped
 */
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import { Form as EngineForm, FormConfigProvider } from '../src/form-engine';
import { buiLanguages } from '../src/helper/bui-language';
import '../src/index.css';
// The probe resolves `backend.ai-ui` to its BUILT package (unlike the app dev
// server, which aliases it to source and therefore processes each component's
// own `import './x.css'`). Pull the built stylesheet in explicitly, or the
// engine's `FormItemVisual.css` — the one rule that stretches block controls
// to the full control width — never reaches the page and the engine column
// mis-measures.
import 'backend.ai-ui/styles.css';
import { Theme } from '@astryxdesign/core/theme';
import {
  Button,
  ConfigProvider,
  Divider,
  Form as AntdForm,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  Typography,
  theme as antdTheme,
} from 'antd';
import type { FormInstance } from 'antd';
import { BAIConfigProvider } from 'backend.ai-ui';
import { CircleMinus, Info, Plus } from 'lucide-react';
import React from 'react';
import { createRoot } from 'react-dom/client';

const params = new URLSearchParams(location.search);
const VARIANT = params.get('variant') ?? 'both';
const MODE = params.get('mode') === 'dark' ? 'dark' : 'light';
const STRIP = params.get('strip');
const STATE = params.get('state') ?? 'pristine';
const LAYOUT = params.get('layout') === 'horizontal' ? 'horizontal' : 'vertical';
const LANG = (params.get('lang') ?? 'en') as keyof typeof buiLanguages;

/**
 * The app's product contract (`react/src/components/DefaultProviders.tsx`):
 * a FUNCTION `requiredMark` suppresses the asterisk everywhere and appends
 * "(Optional)" to non-required labels instead.
 */
const requiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    {label}
    {!required && (
      <span style={{ marginLeft: 4, opacity: 0.45, wordBreak: 'keep-all' }}>
        (Optional)
      </span>
    )}
  </>
);

/** Either whole form stack; `any` because the two prop types are separate. */
type FormComponent = any;
type ItemComponent = any;

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
  /** The stack under test — `Form.Item` / `Form.List` come off this. */
  Form: FormComponent;
  form: FormInstance;
}

/** Lifted from AutoScalingRuleEditorModal.tsx (props preserved verbatim). */
const AutoScalingRuleFormBody: React.FC<BodyProps> = ({ Form, form }) => {
  'use memo';
  const Item: ItemComponent = Form.Item;
  const [conditionMode, setConditionMode] = React.useState<
    'scale_in' | 'scale_out' | 'scale_in_out'
  >('scale_in_out');

  return (
    <>
      <Item
        label="Metric source"
        name="metricSource"
        rules={[{ required: true }]}
        tooltip={<Info size="1em" />}
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
      <Item label="Condition" required tooltip={<Info size="1em" />}>
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
        tooltip={<Info size="1em" />}
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
                  icon={<CircleMinus size="1em" />}
                  onClick={() => remove(field.name)}
                  style={{ marginTop: 28 }}
                />
              </Row>
            ))}
            <Button
              type="dashed"
              icon={<Plus size="1em" />}
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

const Column: React.FC<{ title: string; Form: FormComponent; id: string }> = ({
  title,
  Form,
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
        layout={LAYOUT}
        preserve={false}
        initialValues={{
          metricSource: 'kernel',
          conditionMode: 'scale_in_out',
          enabled: true,
          tags: [{ key: 'env', value: 'prod' }],
        }}
        onFinish={() => {}}
      >
        <AutoScalingRuleFormBody Form={Form} form={form} />
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
        <ConfigProvider form={{ requiredMark }}>
          <Column
            id="antd"
            title="antd stack (Form + Form.Item) — reference"
            Form={AntdForm}
          />
        </ConfigProvider>
      )}
      {VARIANT !== 'antd' && (
        <FormConfigProvider requiredMark={requiredMark}>
          <Column
            id="bai"
            title="self-hosted engine (Form + Form.Item = BAIFormItem)"
            Form={EngineForm}
          />
        </FormConfigProvider>
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <Theme theme={backendAiBrandTheme} mode={MODE}>
    {/* ONE `BAIConfigProvider` for BOTH columns, exactly as `DefaultProviders`
        mounts it in the app. It is doing two jobs here:

        - theme: every antd control on the page reads this algorithm, including
          the ones nested inside engine form items. Scoping it to the antd
          column would leave the engine column light-themed in dark mode and
          report a difference the app cannot produce.
        - language: it drives BOTH message tables from one `locale` prop —
          antd's through its own `ConfigProvider locale`, and the engine's
          because it calls `buiI18n.changeLanguage`, which is what
          `FormConfigProvider` reads. That is what makes `?lang=` a real
          comparison of antd's locale bundle against BUI's ported catalogs. */}
    <BAIConfigProvider
      locale={buiLanguages[LANG]}
      theme={{
        algorithm:
          MODE === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <Probe />
    </BAIConfigProvider>
  </Theme>,
);
