/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FULL-SURFACE form parity matrix (to-astryx ticket 34 hardening pass).

 `form.html` (ticket 05/34) renders ONE representative form twice and proves
 the stacks agree on it. This page is the complement: many SMALL cases, one
 antd cell and one engine cell each, driven from a single `CASES` table so
 both cells provably receive the same props. Every case is a prop or state
 the census (`.scratch/astryx-migration/form-prop-census.txt`) found at a real
 call site, plus the layout/validation surface those call sites implicitly
 depend on.

 Serve it with the standalone probe config (the app dev server rewrites any
 .html to the app template):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts
   -> http://127.0.0.1:9198/theme-probe/formmatrix.html

 URL params:
   ?mode=light|dark   theme mode; applied to BOTH the Astryx `Theme` and
                      antd's algorithm, with the SAME seeds `DefaultProviders`
                      feeds antd from `resources/theme.json`. Feeding antd the
                      library default seeds instead is what made an earlier
                      dark-mode measurement report a colour difference the app
                      cannot actually produce (antd's `darkAlgorithm` derives
                      #dc4446 from the LIGHT seed #ff4d4f, which is precisely
                      the value theme.json already declares as the DARK seed).
   ?only=<caseId>     render a single case.

 Read by `.scratch/astryx-migration/probe-form-matrix.mjs`.
 */
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import { Form as EngineForm, FormConfigProvider } from '../src/form-engine';
import '../src/index.css';
import { Theme } from '@astryxdesign/core/theme';
import {
  Button,
  ConfigProvider,
  Form as AntdForm,
  Input,
  InputNumber,
  Select,
  Switch,
  theme as antdTheme,
} from 'antd';
import type { FormInstance } from 'antd';
import 'backend.ai-ui/styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

const params = new URLSearchParams(location.search);
const MODE = params.get('mode') === 'dark' ? 'dark' : 'light';
const ONLY = params.get('only');

/**
 * `resources/theme.json` → the exact `token` blocks `DefaultProviders` hands
 * antd's `ConfigProvider`, so the antd column here is the antd the app ships.
 */
const THEME_JSON_TOKENS = {
  light: {
    colorPrimary: '#FF7A00',
    colorLink: '#FF7A00',
    colorText: '#141414',
    colorInfo: '#028DF2',
    colorError: '#FF4D4F',
    colorSuccess: '#00BD9B',
  },
  dark: {
    colorPrimary: '#DC6B03',
    colorLink: '#DC6B03',
    colorText: '#FFF',
    colorInfo: '#009BDD',
    colorError: '#DC4446',
    colorSuccess: '#03A487',
    colorFillSecondary: '#262626',
  },
} as const;

/** The app's product contract (`react/src/components/DefaultProviders.tsx`). */
const appRequiredMark = (
  label: React.ReactNode,
  { required }: { required: boolean },
) => (
  <>
    {label}
    {!required && (
      <span style={{ marginLeft: 4, opacity: 0.45, wordBreak: 'keep-all' }}>
        (Optional)
      </span>
    )}
  </>
);

type AnyForm = any;

interface Case {
  id: string;
  /** What the cell is pinning; echoed into the report. */
  note: string;
  /** Props spread onto `<Form>` in BOTH columns. */
  formProps?: Record<string, unknown>;
  /** `<ConfigProvider form>` / `<FormConfigProvider>` value. */
  requiredMark?: unknown;
  body: (Form: AnyForm) => React.ReactNode;
  /** Run `validateFields()` after mount so the error state is measurable. */
  validate?: boolean;
  /** Extra imperative step after mount (before validate). */
  act?: (form: FormInstance) => void;
}

const CASES: Case[] = [
  {
    id: 'vertical-basic',
    note: 'label + control, no state',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item label="Metric name" name="a">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-required-asterisk',
    note: 'default requiredMark → asterisk glyph, colour, spacing',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item label="Metric name" name="a" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-requiredmark-fn',
    note: "the app's function requiredMark: no asterisk, '(Optional)' suffix",
    formProps: { layout: 'vertical' },
    requiredMark: appRequiredMark,
    body: (Form) => (
      <>
        <Form.Item label="Required one" name="a" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Optional one" name="b">
          <Input />
        </Form.Item>
      </>
    ),
  },
  {
    id: 'vertical-requiredmark-optional',
    note: "requiredMark='optional' → antd's own optional suffix",
    formProps: { layout: 'vertical', requiredMark: 'optional' },
    body: (Form) => (
      <>
        <Form.Item label="Required one" name="a" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Optional one" name="b">
          <Input />
        </Form.Item>
      </>
    ),
  },
  {
    id: 'vertical-requiredmark-false',
    note: 'requiredMark={false} → asterisk suppressed (QuotaSettingModal)',
    formProps: { layout: 'vertical', requiredMark: false },
    body: (Form) => (
      <Form.Item label="Hard limit" name="a" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-error',
    note: 'error text colour + item height (margin-offset, no layout jump)',
    formProps: { layout: 'vertical' },
    validate: true,
    body: (Form) => (
      <>
        <Form.Item
          label="Metric name"
          name="a"
          rules={[{ required: true, message: 'Metric name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Neighbour" name="z">
          <Input />
        </Form.Item>
      </>
    ),
  },
  {
    id: 'vertical-warning',
    note: 'warningOnly rule → warning colour, no asterisk',
    formProps: { layout: 'vertical' },
    validate: true,
    body: (Form) => (
      <Form.Item
        label="Metric name"
        name="a"
        rules={[
          { required: true, message: 'Better fill this in', warningOnly: true },
        ]}
      >
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-multi-error',
    note: 'two failing rules on one field → two explain rows',
    formProps: { layout: 'vertical' },
    validate: true,
    body: (Form) => (
      <Form.Item
        label="Metric name"
        name="a"
        validateFirst={false}
        rules={[
          { required: true, message: 'Required' },
          { min: 5, message: 'At least five characters' },
        ]}
      >
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-help',
    note: 'help replaces explain; colour is colorTextDescription, not error',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item label="Metric name" name="a" help="Pick a Prometheus metric.">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-extra',
    note: 'extra block: colour, font size, reserved height',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item
        label="Metric name"
        name="a"
        extra="The metric the rule observes."
      >
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-help-and-extra',
    note: 'both blocks stacked in the documented order',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item
        label="Metric name"
        name="a"
        help="Help line."
        extra="Extra line."
      >
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-error-and-extra',
    note: 'explain + extra together (the tallest item shape)',
    formProps: { layout: 'vertical' },
    validate: true,
    body: (Form) => (
      <Form.Item
        label="Metric name"
        name="a"
        extra="Extra line."
        rules={[{ required: true, message: 'Required' }]}
      >
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-tooltip',
    note: 'tooltip slot next to the label',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item
        label="Metric name"
        name="a"
        tooltip="Where the metric comes from"
      >
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'vertical-hidden',
    note: 'hidden item occupies no space',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <>
        <Form.Item label="Hidden" name="a" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="Visible" name="b">
          <Input />
        </Form.Item>
      </>
    ),
  },
  {
    id: 'vertical-select-stretch',
    note: 'block controls stretch to the control width',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <>
        <Form.Item label="Source" name="a">
          <Select options={[{ label: 'Kernel', value: 'kernel' }]} />
        </Form.Item>
        <Form.Item label="Count" name="b">
          <InputNumber />
        </Form.Item>
      </>
    ),
  },
  {
    id: 'vertical-disabled',
    note: 'Form disabled propagates into every control',
    formProps: { layout: 'vertical', disabled: true },
    body: (Form) => (
      <>
        <Form.Item label="Metric name" name="a">
          <Input />
        </Form.Item>
        <Form.Item label="Enabled" name="b" valuePropName="checked">
          <Switch />
        </Form.Item>
      </>
    ),
  },

  // ============================== horizontal ==============================
  {
    id: 'horizontal-basic',
    note: 'no labelCol: label column is CONTENT width, colon rendered',
    formProps: { layout: 'horizontal' },
    body: (Form) => (
      <>
        <Form.Item label="Name" name="a">
          <Input />
        </Form.Item>
        <Form.Item label="Cooldown (seconds)" name="b">
          <Input />
        </Form.Item>
      </>
    ),
  },
  {
    id: 'horizontal-default-layout',
    note: "<Form> with NO layout prop — antd's default is horizontal",
    body: (Form) => (
      <Form.Item label="Name" name="a">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'horizontal-labelcol-8',
    note: 'FolderCreateModalV2 shape: form-level labelCol span 8',
    formProps: { layout: 'horizontal', labelCol: { span: 8 } },
    body: (Form) => (
      <>
        <Form.Item label="Usage mode" name="a">
          <Input />
        </Form.Item>
        <Form.Item label="Cooldown (seconds)" name="b">
          <Input />
        </Form.Item>
      </>
    ),
  },
  {
    id: 'horizontal-labelcol-wrappercol',
    note: 'QuotaSettingModal shape: labelCol 6 + wrapperCol 20',
    formProps: {
      layout: 'horizontal',
      labelCol: { span: 6 },
      wrapperCol: { span: 20 },
    },
    body: (Form) => (
      <Form.Item label="Hard limit" name="a">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'horizontal-item-labelcol',
    note: 'labelCol declared on the ITEM, overriding the form',
    formProps: { layout: 'horizontal', labelCol: { span: 4 } },
    body: (Form) => (
      <Form.Item label="Hard limit" name="a" labelCol={{ span: 12 }}>
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'horizontal-colon-false',
    note: 'colon={false} keeps the width but drops the glyph',
    formProps: { layout: 'horizontal', colon: false },
    body: (Form) => (
      <Form.Item label="Name" name="a">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'horizontal-labelalign-left',
    note: 'labelAlign="left" flips the label text alignment',
    formProps: {
      layout: 'horizontal',
      labelCol: { span: 8 },
      labelAlign: 'left',
    },
    body: (Form) => (
      <Form.Item label="Name" name="a">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'horizontal-labelwrap',
    note: 'labelWrap lets a long label wrap instead of being clipped',
    formProps: { layout: 'horizontal', labelCol: { span: 6 }, labelWrap: true },
    body: (Form) => (
      <Form.Item label="A very long label that cannot fit" name="a">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'horizontal-error',
    note: 'explain sits under the CONTROL column, not under the label',
    formProps: { layout: 'horizontal', labelCol: { span: 8 } },
    validate: true,
    body: (Form) => (
      <>
        <Form.Item
          label="Name"
          name="a"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Neighbour" name="z">
          <Input />
        </Form.Item>
      </>
    ),
  },
  {
    id: 'horizontal-item-level',
    note: 'ResourceGroupSettingModal shape: item-level layout inside a vertical form',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item
        label="Active"
        name="a"
        layout="horizontal"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    ),
  },

  // ================================ inline ================================
  {
    id: 'inline-basic',
    note: 'inline layout: items flow on one row, no bottom margin',
    formProps: { layout: 'inline' },
    body: (Form) => (
      <>
        <Form.Item label="Name" name="a">
          <Input />
        </Form.Item>
        <Form.Item label="Count" name="b">
          <Input />
        </Form.Item>
      </>
    ),
  },

  // ================================= size =================================
  {
    id: 'size-small',
    note: "CustomModelForm shape: <Form size='small'>",
    formProps: { layout: 'horizontal', size: 'small' },
    body: (Form) => (
      <Form.Item label="Base path" name="a">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'size-large',
    note: "<Form size='large'>",
    formProps: { layout: 'vertical', size: 'large' },
    body: (Form) => (
      <Form.Item label="Base path" name="a">
        <Input />
      </Form.Item>
    ),
  },

  // ============================ validate status ============================
  {
    id: 'validatestatus-error',
    note: 'explicit validateStatus with no rules (UpdateUsersModal shape)',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item label="Owner" name="a" validateStatus="error" help="Not found">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'validatestatus-warning',
    note: 'explicit validateStatus="warning"',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item label="Owner" name="a" validateStatus="warning" help="Careful">
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'hasfeedback-success',
    note: 'LoginFormPanel shape: hasFeedback with a passing rule',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item
        label="E-mail"
        name="a"
        hasFeedback
        validateStatus="success"
        initialValue="a@b.c"
      >
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'hasfeedback-error',
    note: 'SignupModal shape: hasFeedback on a failing field',
    formProps: { layout: 'vertical' },
    validate: true,
    body: (Form) => (
      <Form.Item
        label="Password"
        name="a"
        hasFeedback
        rules={[{ required: true, message: 'Required' }]}
      >
        <Input />
      </Form.Item>
    ),
  },
  {
    id: 'hasfeedback-validating',
    note: 'hasFeedback while an async validator is in flight',
    formProps: { layout: 'vertical' },
    body: (Form) => (
      <Form.Item
        label="Password"
        name="a"
        hasFeedback
        validateStatus="validating"
      >
        <Input />
      </Form.Item>
    ),
  },

  // ============================== aggregation ==============================
  {
    id: 'nostyle-aggregation',
    note: 'layout-only item aggregating two noStyle children',
    formProps: { layout: 'vertical' },
    validate: true,
    body: (Form) => (
      <Form.Item label="Threshold" required>
        <Form.Item
          name="min"
          noStyle
          rules={[{ required: true, message: 'Min required' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="max"
          noStyle
          rules={[{ required: true, message: 'Max required' }]}
        >
          <InputNumber />
        </Form.Item>
      </Form.Item>
    ),
  },
  {
    id: 'form-list',
    note: 'Form.List with one seeded row + an add button',
    formProps: { layout: 'vertical', initialValues: { rows: [{ k: 'a' }] } },
    body: (Form) => (
      <Form.List name="rows">
        {(fields: any[], { add, remove }: any) => (
          <>
            {fields.map((field: any) => (
              <Form.Item
                {...field}
                key={field.key}
                label={`Row ${field.name}`}
                name={[field.name, 'k']}
                rules={[{ required: true, message: 'Row required' }]}
              >
                <Input />
              </Form.Item>
            ))}
            <Button onClick={() => add({ k: '' })}>add</Button>
            <Button onClick={() => remove(fields.length - 1)}>remove</Button>
          </>
        )}
      </Form.List>
    ),
  },
  {
    id: 'dependencies-revalidate',
    note: 'cross-field validator; error appears without shifting the neighbour',
    formProps: { layout: 'vertical', initialValues: { min: 5, max: 1 } },
    validate: true,
    body: (Form) => (
      <>
        <Form.Item label="Min" name="min">
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="Max"
          name="max"
          dependencies={['min']}
          rules={[
            ({ getFieldValue }: any) => ({
              validator(_: unknown, value: number) {
                const min = getFieldValue('min');
                if (min != null && value != null && min >= value) {
                  return Promise.reject(new Error('Min must be less than max'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item label="Neighbour" name="z">
          <Input />
        </Form.Item>
      </>
    ),
  },
];

const CELL_WIDTH = 420;

const Cell: React.FC<{
  caseDef: Case;
  impl: 'antd' | 'engine';
}> = ({ caseDef, impl }) => {
  const Form = impl === 'antd' ? AntdForm : EngineForm;
  const formRef = React.useRef<FormInstance>(null);

  React.useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    caseDef.act?.(form);
    if (caseDef.validate) {
      form.validateFields().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inner = (
    <Form ref={formRef} {...caseDef.formProps}>
      {caseDef.body(Form)}
    </Form>
  );

  return (
    <div
      data-case={caseDef.id}
      data-impl={impl}
      style={{ width: CELL_WIDTH, boxSizing: 'border-box' }}
    >
      {caseDef.requiredMark === undefined ? (
        inner
      ) : impl === 'antd' ? (
        <ConfigProvider form={{ requiredMark: caseDef.requiredMark as never }}>
          {inner}
        </ConfigProvider>
      ) : (
        <FormConfigProvider requiredMark={caseDef.requiredMark as never}>
          {inner}
        </FormConfigProvider>
      )}
    </div>
  );
};

const Matrix: React.FC = () => {
  const cases = ONLY ? CASES.filter((c) => c.id === ONLY) : CASES;
  return (
    <div
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}
    >
      {cases.map((c) => (
        <section key={c.id}>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              opacity: 0.6,
              marginBottom: 8,
            }}
          >
            {c.id} — {c.note}
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <Cell caseDef={c} impl="antd" />
            <Cell caseDef={c} impl="engine" />
          </div>
        </section>
      ))}
    </div>
  );
};

(window as any).__caseIds = CASES.map((c) => c.id);

createRoot(document.getElementById('root')!).render(
  <Theme theme={backendAiBrandTheme} mode={MODE}>
    <ConfigProvider
      theme={{
        token: THEME_JSON_TOKENS[MODE],
        algorithm:
          MODE === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <Matrix />
    </ConfigProvider>
  </Theme>,
);
