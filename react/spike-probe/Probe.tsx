/**
 * SPIKE probe — cn-oss-removal ticket 08.
 *
 * Renders the SAME form twice: once with antd `Form.Item`, once with
 * `BAIFormItem` (own visual layer + `<Form.Item noStyle>` state engine).
 *
 * The form body is lifted from the real
 * `react/src/components/AutoScalingRuleEditorModal.tsx` (mid complexity:
 * cross-field validation via `dependencies` + `getFieldValue`, nested
 * `noStyle` items inside a layout item, declarative + custom validators,
 * conditional field mounting, `Form.List`). Relay/i18n/BAI deps stubbed.
 *
 * URL params:
 *   ?variant=antd|bai|both   which column(s) to render (default both)
 *   ?strip=form|all          drop antd's injected CSS after mount, simulating
 *                            the post-06 world where antd's theme/cssinjs layer
 *                            is gone. `form` drops only `.ant-form-*` rules.
 *   ?state=pristine|error    error = run validateFields() on mount
 */
import {
  InfoCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import type { FormInstance } from 'antd';
import { BAIFormItem, BAIFlex } from 'backend.ai-ui';
import React from 'react';

const params = new URLSearchParams(location.search);
const VARIANT = params.get('variant') ?? 'both';
const STRIP = params.get('strip');
const STATE = params.get('state') ?? 'pristine';

type ItemComponent = typeof Form.Item;

const SIGNED_32BIT_MAX_INT = 2147483647;

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
          the visual/engine split interesting. */}
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
          <BAIFlex direction="column" gap="xs" align="stretch">
            <BAIFlex align="center" gap="xs">
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
            </BAIFlex>
            <BAIFlex align="center" gap="xs">
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
            </BAIFlex>
          </BAIFlex>
        ) : (
          <BAIFlex align="center" gap="xs">
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
          </BAIFlex>
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
          <BAIFlex direction="column" align="stretch" gap="xs">
            {fields.map((field) => (
              <BAIFlex key={field.key} align="start" gap="xs">
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
              </BAIFlex>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add({ key: '', value: '' })}
            >
              Add tag
            </Button>
          </BAIFlex>
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
            JSON.stringify(info.errorFields?.map((f: any) => f.name)) +
            ' outOfDate=' +
            String(info.outOfDate),
        );
      });
  };

  React.useEffect(() => {
    (window as any)[`validate_${id}`] = validate;
    (window as any)[`form_${id}`] = form;
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
    (window as any).stripAntdStyles = stripAntdStyles;
    if (STRIP) {
      // let antd's cssinjs flush first
      setTimeout(() => {
        const n = stripAntdStyles(STRIP);
        (window as any).__stripped = n;
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

export default Probe;
