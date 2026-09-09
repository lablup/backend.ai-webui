/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 THE acceptance suite for the self-hosted form engine (to-astryx ticket 34).

 29 tests distilled from `answers/08 §5` (plus contract 30, added for
 FR-3705) — the semantics this repository
 actually depends on, each traced to a real call site.

 STATUS (final switch): antd is UNINSTALLED. This suite used to run TWICE —
 `describe.each([['antd', AntdForm], ['engine', EngineForm]])` — so that "the
 replacement behaves like the thing it replaces" was asserted rather than
 asserted-about, with the antd row acting as a live oracle and a green antd
 row proving the tests described antd rather than the engine. The plan
 recorded here from the start was that the antd row is dropped when the
 package goes and the engine row becomes a plain regression suite. That is
 what happened; the assertions themselves are unchanged, and they carry the
 oracle's verdict forward because they passed against real antd on every run
 up to this commit.

 The companion `it('the form-engine alias resolves to the self-hosted engine,
 not antd')` guard went with it — it compared `EngineForm` against
 `AntdForm`, and with no antd to compare against there is nothing the alias
 could forward to.

 Rules for editing this file:
   - Assert through the FormInstance API and rendered TEXT only, NOT on class
     names or BAI `data-*` anchors. That rule outlives the two-row setup it
     was written for: it is what keeps these tests about form semantics rather
     than about one implementation's DOM.
   - When a test needs specific message text, pass `message` explicitly.
     Pinning generated English here would make the suite a locale test.
 */
// Through the ALIAS on purpose (ticket 35): this is the module every one of
// the 115 form call sites resolves, so the suite pins the wiring as well as
// the engine.
import { Form as EngineForm, type FormInstance } from '../form-engine';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

/**
 * `any` on purpose, carried over from the two-row setup: the assertions below
 * reach for `Form.List` / `Form.Item` render-prop shapes that the engine's
 * precise prop types express differently per overload, and tightening them
 * here would rewrite 29 tests for no additional coverage.
 */
type AnyForm = any;

const IMPLEMENTATIONS: [name: string, Form: AnyForm][] = [
  ['engine', EngineForm],
];

/** Plain controlled input, so no Astryx control is in the test path. */
const Input: React.FC<any> = ({ value = '', onChange, ...rest }) => (
  <input value={value} onChange={(e) => onChange?.(e)} {...rest} />
);

/** Checkbox-shaped control for `valuePropName="checked"` coverage. */
const Check: React.FC<any> = ({ checked = false, onChange, ...rest }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange?.(e)}
    {...rest}
  />
);

/** Flush the engine's macrotask-batched watcher + validation queues. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

describe.each(IMPLEMENTATIONS)('form engine acceptance [%s]', (_name, Form) => {
  /**
   * `Form.useForm()` plus a post-mount handoff of the instance to the test body.
   *
   * The obvious `form = instance;` inside the component would be a render-time
   * write to a binding the component does not own — which the React Compiler
   * lint rejects, correctly. Here the write lives in the TEST's own closure and
   * runs from an effect, so the component stays pure and the instance is in
   * hand before the first assertion (effects flush inside `render`).
   */
  function useTestForm(onReady: (form: FormInstance) => void) {
    const [instance] = Form.useForm();
    React.useEffect(() => {
      onReady(instance);
    }, [instance, onReady]);
    return instance;
  }

  // ==========================================================================
  // A. dependencies re-validation
  // ==========================================================================

  // 1. ResourceAllocationFormItems.tsx:1085-1089 — the accelerator field's
  //    ENTIRE rules array is swapped based on a dependency (6 rules <-> none).
  //    Two halves, both measured against antd:
  //      a) once the rules are gone, validation stops producing the error;
  //      b) the error ALREADY on the field is not swept away by re-validating
  //         (a field with no rules is skipped entirely, so nothing clears it)
  //         — it is cleared by the `setFieldValue` the page issues next.
  //    Getting (b) "more correct" would silently change what the page shows.
  it('1. swapping the rules array via `dependencies` retires the old rule set', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{ acceleratorType: 'cuda', accelerator: 0 }}
        >
          <Form.Item name="acceleratorType">
            <Input />
          </Form.Item>
          <Form.Item
            noStyle
            dependencies={['acceleratorType']}
            shouldUpdate={() => true}
          >
            {({ getFieldValue }: FormInstance) => (
              <Form.Item
                name="accelerator"
                label="Accelerator"
                rules={
                  getFieldValue('acceleratorType') === 'cuda'
                    ? [{ required: true, message: 'accelerator required' }]
                    : []
                }
              >
                <Input />
              </Form.Item>
            )}
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    form.setFieldValue('accelerator', undefined);
    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [
        { name: ['accelerator'], errors: ['accelerator required'] },
      ],
    });
    await settle();
    expect(form.getFieldError('accelerator')).toEqual(['accelerator required']);

    // Swap the dependency: the rule set becomes empty.
    await act(async () => {
      form.setFieldValue('acceleratorType', 'none');
    });
    await settle();

    // (a) The retired rule no longer fires.
    await expect(form.validateFields()).resolves.toBeTruthy();
    await settle();
    // (b) A rule-less field is skipped by validation, so the previous error
    //     survives until the value is written again.
    expect(form.getFieldError('accelerator')).toEqual(['accelerator required']);

    await act(async () => {
      form.setFieldValue('accelerator', 0);
    });
    await settle();
    expect(form.getFieldError('accelerator')).toEqual([]);
  });

  // 2. ResourceAllocationFormItems.tsx:1602-1607 — cluster_size depends on
  //    four fields and carries a `warningOnly` capacity rule.
  it('2. a multi-dependency field re-validates and reports warnings separately', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{
            cpu: 1,
            mem: 1,
            gpu: 0,
            mode: 'single',
            cluster_size: 1,
          }}
        >
          {['cpu', 'mem', 'gpu', 'mode'].map((field) => (
            <Form.Item key={field} name={field}>
              <Input />
            </Form.Item>
          ))}
          <Form.Item
            name="cluster_size"
            label="Cluster size"
            dependencies={['cpu', 'mem', 'gpu', 'mode']}
            rules={[
              ({ getFieldValue }: FormInstance) => ({
                warningOnly: true,
                validator: (_: unknown, value: number) =>
                  Number(value) * Number(getFieldValue('cpu')) > 8
                    ? Promise.reject(new Error('over capacity'))
                    : Promise.resolve(),
              }),
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    await act(async () => {
      form.setFieldValue('cluster_size', 10);
      form.setFieldValue('cpu', 4);
    });
    await settle();
    // A warning never blocks: validateFields resolves.
    await expect(form.validateFields()).resolves.toBeTruthy();
    await settle();
    expect(form.getFieldWarning('cluster_size')).toEqual(['over capacity']);
    expect(form.getFieldError('cluster_size')).toEqual([]);
  });

  // 3. SessionLauncherPage.tsx:909-937 — one function rule reading two
  //    dependencies, rejecting WITHOUT a message: error state, no text.
  it('3. a function rule may reject without a message (error state, no text)', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{ enabled: true, timeout: 5, timeoutUnit: 's' }}
        >
          <Form.Item name="enabled" valuePropName="checked">
            <Check />
          </Form.Item>
          <Form.Item name="timeout">
            <Input />
          </Form.Item>
          <Form.Item
            name="timeoutUnit"
            dependencies={['enabled', 'timeout']}
            rules={[
              ({ getFieldValue }: FormInstance) => ({
                validator: () =>
                  getFieldValue('enabled') && !getFieldValue('timeout')
                    ? Promise.reject()
                    : Promise.resolve(),
              }),
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    form.setFieldValue('timeout', '');
    await expect(form.validateFields()).rejects.toBeTruthy();
    await settle();

    const errors = form.getFieldError('timeoutUnit');
    expect(errors).toHaveLength(1);
    // Whatever placeholder the implementation uses, it must be blank to a user.
    expect(String(errors[0]).trim()).toBe('');
  });

  // 4. EnvVarFormList.tsx:225 — `dependencies` inside a Form.List is an
  //    ABSOLUTE path including the numeric row index.
  it('4. `dependencies` inside Form.List uses absolute, index-bearing paths', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{ envs: [{ key: '', value: '' }] }}
        >
          <Form.List name="envs">
            {(fields: any[]) =>
              fields.map((field) => (
                <React.Fragment key={field.key}>
                  <Form.Item {...field} name={[field.name, 'key']}>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'value']}
                    dependencies={[['envs', field.name, 'key']]}
                    rules={[
                      ({ getFieldValue }: FormInstance) => ({
                        validator: (_: unknown, value: string) =>
                          getFieldValue(['envs', field.name, 'key']) && !value
                            ? Promise.reject(new Error('value required'))
                            : Promise.resolve(),
                      }),
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </React.Fragment>
              ))
            }
          </Form.List>
        </Form>
      );
    };
    render(<Demo />);

    await act(async () => {
      form.setFieldValue(['envs', 0, 'key'], 'HOME');
    });
    await settle();

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: ['envs', 0, 'value'], errors: ['value required'] }],
    });
  });

  // 5. ResourceAllocationFormItems.tsx:1611-1624 — a validator reads a field
  //    that is NOT in its `dependencies`. "Not re-validated" is the CURRENT,
  //    intended behaviour; becoming more correct here would change the UI.
  it('5. an undeclared cross-reference does NOT trigger re-validation', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const validator = vi.fn(() => Promise.resolve());
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ mode: 'single', size: 1 }}>
          <Form.Item name="mode">
            <Input />
          </Form.Item>
          <Form.Item name="size" rules={[{ validator }]}>
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    // Make `size` dirty so it WOULD be eligible for dependency re-validation.
    await act(async () => {
      form.setFieldValue('size', 2);
    });
    await settle();
    validator.mockClear();

    await act(async () => {
      form.setFieldValue('mode', 'multi');
    });
    await settle();

    expect(validator).not.toHaveBeenCalled();
  });

  // ==========================================================================
  // B. shouldUpdate
  // ==========================================================================

  // 6. ResourceAllocationFormItems.tsx:678-680 — a comparator watching ONE
  //    field gates a very large subtree.
  it('6. a single-field `shouldUpdate` comparator gates its subtree', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const renderSpy = vi.fn();
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ preset: 'a', unrelated: 1 }}>
          <Form.Item
            noStyle
            shouldUpdate={(prev: any, next: any) => prev.preset !== next.preset}
          >
            {({ getFieldValue }: FormInstance) => {
              renderSpy();
              return <div data-testid="preset">{getFieldValue('preset')}</div>;
            }}
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);
    await settle();
    renderSpy.mockClear();

    await act(async () => {
      form.setFieldValue('unrelated', 99);
    });
    await settle();
    expect(renderSpy).not.toHaveBeenCalled();

    await act(async () => {
      form.setFieldValue('preset', 'b');
    });
    await settle();
    expect(renderSpy).toHaveBeenCalled();
    expect(screen.getByTestId('preset')).toHaveTextContent('b');
  });

  // 7. ResourceAllocationFormItems.tsx:1521-1530 — a comparator over six values.
  it('7. a six-value `shouldUpdate` comparator fires on any of them', async () => {
    const watched = ['a', 'b', 'c', 'd', 'e', 'f'];
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const renderSpy = vi.fn();
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={Object.fromEntries(watched.map((k) => [k, 0]))}
        >
          <Form.Item
            noStyle
            shouldUpdate={(prev: any, next: any) =>
              watched.some((key) => prev[key] !== next[key])
            }
          >
            {() => {
              renderSpy();
              return <div />;
            }}
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);
    await settle();

    for (const key of watched) {
      renderSpy.mockClear();
      await act(async () => {
        form.setFieldValue(key, 1);
      });
      await settle();
      expect(renderSpy, `changing ${key} should re-render`).toHaveBeenCalled();
    }
  });

  // 8. AdminDeploymentPresetSettingPageContent.tsx:1106 — the repo's only
  //    boolean `shouldUpdate`, whose consumer reads UNREGISTERED fields via
  //    `getFieldsValue(true)`.
  it('8. boolean `shouldUpdate` re-renders on any change and sees unregistered fields', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{ registered: 1, ghost: 'from-initial' }}
        >
          <Form.Item name="registered">
            <Input />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldsValue }: FormInstance) => (
              <div data-testid="all">
                {JSON.stringify(getFieldsValue(true))}
              </div>
            )}
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);
    await settle();

    // `ghost` has no Form.Item, so only getFieldsValue(true) can see it.
    expect(screen.getByTestId('all')).toHaveTextContent('from-initial');
    expect(form.getFieldsValue()).not.toHaveProperty('ghost');

    await act(async () => {
      form.setFieldValue('registered', 7);
    });
    await settle();
    expect(screen.getByTestId('all')).toHaveTextContent('"registered":7');
  });

  // ==========================================================================
  // C. nested paths
  // ==========================================================================

  // 9. AdminDeploymentPresetModelConfigItem.tsx:126 — seven segments, two of
  //    them numeric indices.
  it('9. a seven-segment path with two numeric indices round-trips', async () => {
    const path = [
      'modelDefinition',
      'models',
      0,
      'service',
      'preStartActions',
      1,
      'action',
    ];
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance}>
          <Form.Item name={path} label="Deep">
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    await act(async () => {
      form.setFieldValue(path, 'echo hi');
    });
    await settle();

    expect(form.getFieldValue(path)).toBe('echo hi');
    const values = form.getFieldsValue();
    // Numeric segments must have produced ARRAYS, not objects with '0' keys.
    expect(Array.isArray(values.modelDefinition.models)).toBe(true);
    expect(
      Array.isArray(values.modelDefinition.models[0].service.preStartActions),
    ).toBe(true);
    expect(
      values.modelDefinition.models[0].service.preStartActions[1].action,
    ).toBe('echo hi');
  });

  // 10. AdminDeploymentPresetModelConfigItem.tsx:189-206 — inside a
  //     Form.List, `name` is RELATIVE while `dependencies` is ABSOLUTE.
  //     If the engine loses this asymmetry, nested cross-validation dies
  //     silently.
  it('10. inside Form.List, `name` is relative but `dependencies` is absolute', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{
            models: [{ enableHealthCheck: false, health: { path: '' } }],
          }}
        >
          <Form.List name="models">
            {(fields: any[]) =>
              fields.map((field) => (
                <React.Fragment key={field.key}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'enableHealthCheck']}
                    valuePropName="checked"
                  >
                    <Check />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    // RELATIVE: resolved against the list's prefix.
                    name={[field.name, 'health', 'path']}
                    // ABSOLUTE: the full path from the form root.
                    dependencies={[['models', field.name, 'enableHealthCheck']]}
                    rules={[
                      ({ getFieldValue }: FormInstance) => ({
                        required: !!getFieldValue([
                          'models',
                          field.name,
                          'enableHealthCheck',
                        ]),
                        message: 'health path required',
                      }),
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </React.Fragment>
              ))
            }
          </Form.List>
        </Form>
      );
    };
    render(<Demo />);

    // Health check off: the relative field is optional.
    await expect(form.validateFields()).resolves.toBeTruthy();

    await act(async () => {
      form.setFieldValue(['models', 0, 'enableHealthCheck'], true);
    });
    await settle();

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [
        {
          name: ['models', 0, 'health', 'path'],
          errors: ['health path required'],
        },
      ],
    });
  });

  // 11. AdminDeploymentPresetResourceFields.tsx:42 — `useWatch` on an
  //     absolute, index-bearing path, resolving the form from CONTEXT.
  it('11. `useWatch` resolves the form from context and takes absolute paths', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Watcher = () => {
      const value = Form.useWatch(['rows', 0, 'slot']);
      return <div data-testid="watched">{String(value)}</div>;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ rows: [{ slot: 'cpu' }] }}>
          <Form.List name="rows">
            {(fields: any[]) =>
              fields.map((field) => (
                <Form.Item
                  key={field.key}
                  {...field}
                  name={[field.name, 'slot']}
                >
                  <Input />
                </Form.Item>
              ))
            }
          </Form.List>
          <Watcher />
        </Form>
      );
    };
    render(<Demo />);
    await settle();
    expect(screen.getByTestId('watched')).toHaveTextContent('cpu');

    await act(async () => {
      form.setFieldValue(['rows', 0, 'slot'], 'cuda');
    });
    await settle();
    expect(screen.getByTestId('watched')).toHaveTextContent('cuda');
  });

  // 12. ResourceAllocationFormItems.tsx:291,296,359,454,516,570 —
  //     `setFieldsValue` MERGES nested objects; it does not replace them.
  it('12. `setFieldsValue` merges nested objects instead of replacing them', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{
            resource: { cpu: 1, mem: '4g', shmem: '1g' },
            name: 'x',
          }}
        >
          <Form.Item name={['resource', 'cpu']}>
            <Input />
          </Form.Item>
          <Form.Item name={['resource', 'mem']}>
            <Input />
          </Form.Item>
          <Form.Item name={['resource', 'shmem']}>
            <Input />
          </Form.Item>
          <Form.Item name="name">
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    await act(async () => {
      form.setFieldsValue({ resource: { cpu: 8 } });
    });
    await settle();

    expect(form.getFieldsValue()).toEqual({
      resource: { cpu: 8, mem: '4g', shmem: '1g' },
      name: 'x',
    });
  });

  // ==========================================================================
  // D. Form.List
  // ==========================================================================

  // 13. AdminDeploymentPresetModelConfigItem.tsx:114-173 — a NESTED list whose
  //     `add()` carries an initial row value.
  it('13. a nested Form.List adds rows with an initial value', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    let outerAdd!: (v?: any) => void;
    let innerAdd!: (v?: any) => void;
    const captureOuter = (ops: any) => {
      outerAdd = ops.add;
    };
    const captureInner = (ops: any) => {
      innerAdd = ops.add;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{ models: [{ preStartActions: [] }] }}
        >
          <Form.List name="models">
            {(models: any[], ops: any) => {
              captureOuter(ops);
              return models.map((model) => (
                <Form.List
                  key={model.key}
                  name={[model.name, 'preStartActions']}
                >
                  {(actions: any[], innerOps: any) => {
                    captureInner(innerOps);
                    return actions.map((action) => (
                      <Form.Item
                        key={action.key}
                        {...action}
                        name={[action.name, 'action']}
                      >
                        <Input />
                      </Form.Item>
                    ));
                  }}
                </Form.List>
              ));
            }}
          </Form.List>
        </Form>
      );
    };
    render(<Demo />);

    await act(async () => {
      innerAdd({ action: '', args: '{}' });
    });
    await settle();

    expect(form.getFieldValue(['models', 0, 'preStartActions'])).toEqual([
      { action: '', args: '{}' },
    ]);

    await act(async () => {
      outerAdd({ preStartActions: [] });
    });
    await settle();
    expect(form.getFieldValue('models')).toHaveLength(2);
  });

  // 14. EnvVarFormList.tsx:98-129,253 — list-level `rules` surfaced through
  //     `Form.ErrorList`.
  it('14. list-level rules render through Form.ErrorList', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ envs: [] }}>
          <Form.List
            name="envs"
            rules={[
              {
                validator: async (_: unknown, value: unknown[]) => {
                  if (!value || value.length < 1) {
                    return Promise.reject(new Error('at least one env'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields: any[], _ops: any, { errors }: any) => (
              <>
                {fields.map((field) => (
                  <Form.Item
                    key={field.key}
                    {...field}
                    name={[field.name, 'key']}
                  >
                    <Input />
                  </Form.Item>
                ))}
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </Form>
      );
    };
    render(<Demo />);

    await expect(form.validateFields()).rejects.toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('at least one env')).toBeInTheDocument();
    });
  });

  // 15. RoleFormModal.tsx:580-590 — a list-level validator that rejects the
  //     empty array, and stops rejecting once a row exists.
  it('15. a list-level validator rejecting an empty array clears once a row is added', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    let add!: (v?: any) => void;
    const captureOps = (ops: any) => {
      add = ops.add;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ scopes: [] }}>
          <Form.List
            name="scopes"
            rules={[
              {
                validator: async (_: unknown, value: unknown[]) =>
                  value && value.length
                    ? Promise.resolve()
                    : Promise.reject(new Error('scope required')),
              },
            ]}
          >
            {(fields: any[], ops: any) => {
              captureOps(ops);
              return fields.map((field) => (
                <Form.Item key={field.key} {...field} name={[field.name, 'id']}>
                  <Input />
                </Form.Item>
              ));
            }}
          </Form.List>
        </Form>
      );
    };
    render(<Demo />);

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: ['scopes'], errors: ['scope required'] }],
    });

    await act(async () => {
      add({});
    });
    await settle();
    await expect(form.validateFields()).resolves.toBeTruthy();
  });

  // 16. EnvVarFormList.tsx:240-245 — the row `add()` created must be mounted
  //     by the next macrotask, which is when the call site focuses its ref.
  it('16. a row added by `add()` is mounted on the next macrotask', async () => {
    let add!: (v?: any) => void;
    const captureOps = (ops: any) => {
      add = ops.add;
    };
    const Demo = () => {
      const [instance] = Form.useForm();
      return (
        <Form form={instance} initialValues={{ envs: [] }}>
          <Form.List name="envs">
            {(fields: any[], ops: any) => {
              captureOps(ops);
              return fields.map((field) => (
                <Form.Item
                  key={field.key}
                  {...field}
                  name={[field.name, 'key']}
                >
                  <Input data-testid={`row-${field.name}`} />
                </Form.Item>
              ));
            }}
          </Form.List>
        </Form>
      );
    };
    render(<Demo />);

    const mounted = await new Promise<boolean>((resolve) => {
      act(() => {
        add();
      });
      setTimeout(() => resolve(!!screen.queryByTestId('row-0')), 0);
    });
    expect(mounted).toBe(true);
  });

  // 17. `remove(index)` must shift the SURVIVING rows' errors, not leave them
  //     pinned to the old index. This is the classic Form.List failure.
  it('17. `remove(index)` shifts remaining rows and their errors correctly', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    let remove!: (index: number) => void;
    const captureOps = (ops: any) => {
      remove = ops.remove;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{
            rows: [{ key: 'ok-1' }, { key: '' }, { key: 'ok-3' }],
          }}
        >
          <Form.List name="rows">
            {(fields: any[], ops: any) => {
              captureOps(ops);
              return fields.map((field) => (
                <Form.Item
                  key={field.key}
                  {...field}
                  name={[field.name, 'key']}
                  rules={[{ required: true, message: 'key required' }]}
                >
                  <Input />
                </Form.Item>
              ));
            }}
          </Form.List>
        </Form>
      );
    };
    render(<Demo />);

    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: ['rows', 1, 'key'], errors: ['key required'] }],
    });
    await settle();

    // Drop the FIRST row. The invalid row slides from index 1 to index 0.
    await act(async () => {
      remove(0);
    });
    await settle();

    expect(form.getFieldValue('rows')).toEqual([{ key: '' }, { key: 'ok-3' }]);
    await expect(form.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: ['rows', 0, 'key'], errors: ['key required'] }],
    });
    await settle();
    expect(form.getFieldError(['rows', 1, 'key'])).toEqual([]);
  });

  // ==========================================================================
  // E. preserve
  // ==========================================================================

  // 18. DeploymentAddRevisionModal.tsx:1704,1728-1730,1940 — a dependency
  //     UNMOUNTS a field group, and the default `preserve: true` keeps its
  //     value alive so the modal can still read and re-show it.
  //     Note the boundary: the value stays in the STORE, but a field that is
  //     not mounted is not part of `getFieldsValue()` (nor of what
  //     `validateFields()` resolves) — those project the REGISTERED fields.
  //     Reads of unmounted values go through `getFieldValue` /
  //     `getFieldsValue(true)`, which is exactly what the call site does.
  it('18. with default preserve, an unmounted field keeps its value', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      const show = Form.useWatch('show', instance);
      return (
        <Form form={instance} initialValues={{ show: true, secret: 'kept' }}>
          <Form.Item name="show" valuePropName="checked">
            <Check />
          </Form.Item>
          {show ? (
            <Form.Item name="secret">
              <Input />
            </Form.Item>
          ) : null}
        </Form>
      );
    };
    render(<Demo />);
    await settle();

    await act(async () => {
      form.setFieldValue('show', false);
    });
    await settle();

    expect(form.getFieldValue('secret')).toBe('kept');
    expect(form.getFieldsValue(true)).toMatchObject({ secret: 'kept' });
    expect(form.getFieldsValue()).not.toHaveProperty('secret');

    // Re-showing the group brings the value back into the registered set.
    await act(async () => {
      form.setFieldValue('show', true);
    });
    await settle();
    expect(form.getFieldsValue()).toMatchObject({ secret: 'kept' });
    await expect(form.validateFields()).resolves.toMatchObject({
      secret: 'kept',
    });
  });

  // 19. The 28 modal forms that pass `preserve={false}`: an unmounted field's
  //     value disappears from `getFieldsValue()` KEYS, not just its value.
  it('19. `preserve={false}` drops the key of an unmounted field', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      const show = Form.useWatch('show', instance);
      return (
        <Form form={instance} preserve={false} initialValues={{ show: true }}>
          <Form.Item name="show" valuePropName="checked">
            <Check />
          </Form.Item>
          {show ? (
            <Form.Item name="secret">
              <Input />
            </Form.Item>
          ) : null}
        </Form>
      );
    };
    render(<Demo />);
    await settle();

    await act(async () => {
      form.setFieldValue('secret', 'typed');
    });
    await settle();
    expect(form.getFieldsValue()).toHaveProperty('secret');

    await act(async () => {
      form.setFieldValue('show', false);
    });
    await settle();

    expect(form.getFieldsValue()).not.toHaveProperty('secret');
  });

  // 20. DeploymentAddRevisionModal.tsx:390-395 — the call site's comment
  //     states that `setFieldsValue` for an UNREGISTERED field is ignored.
  //     It is written into the raw store but never surfaces through
  //     `getFieldsValue()`, which is the read the code performs.
  it('20. `setFieldsValue` on an unregistered field does not surface in getFieldsValue()', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance}>
          <Form.Item name="known">
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    await act(async () => {
      form.setFieldsValue({ known: 'a', unknown: 'b' } as any);
    });
    await settle();

    expect(form.getFieldsValue()).toEqual({ known: 'a' });
    expect(form.getFieldsValue(true)).toMatchObject({ unknown: 'b' });
  });

  // ==========================================================================
  // F. timing / triggers
  // ==========================================================================

  // 21. SessionLauncherPage.tsx:1027-1033 -> EnvVarFormList.tsx:177 — the
  //     form-level `validateTrigger` reaches nested items.
  it('21. a form-level `validateTrigger` propagates to nested items', async () => {
    const user = userEvent.setup();
    const Demo = () => {
      const [instance] = Form.useForm();
      return (
        <Form form={instance} validateTrigger={['onChange', 'onBlur']}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'email required' }]}
          >
            <Input data-testid="email" />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    const input = screen.getByTestId('email');
    await user.type(input, 'a');
    await user.clear(input);
    await waitFor(() => {
      expect(screen.getByText('email required')).toBeInTheDocument();
    });
  });

  // 22. SessionLauncherPage.tsx:658-667 — the guard against an infinite
  //     validate loop: re-validate only while the field has no error.
  it('22. re-validating only while the error list is empty terminates', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const runs = { count: 0 };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ a: '' }}>
          <Form.Item
            name="a"
            rules={[{ required: true, message: 'a required' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    // Simulate the call site's loop: validate while no error is recorded.
    for (let i = 0; i < 5; i += 1) {
      if (form.getFieldError('a').length) break;
      runs.count += 1;
      await form.validateFields(['a']).catch(() => undefined);
      await settle();
    }
    expect(runs.count).toBe(1);
    expect(form.getFieldError('a')).toEqual(['a required']);
  });

  // 23. ResourceAllocationFormItems.tsx:476,537,585 — `recursive: true`
  //     validates everything nested under the requested prefix.
  it('23. `validateFields([prefix], {recursive: true})` reaches nested fields', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form
          form={instance}
          initialValues={{ resource: { cpu: '' }, other: '' }}
        >
          <Form.Item
            name={['resource', 'cpu']}
            rules={[{ required: true, message: 'cpu required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="other"
            rules={[{ required: true, message: 'other required' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    // Without `recursive`, the prefix matches no field exactly.
    await expect(form.validateFields(['resource'])).resolves.toBeTruthy();

    await expect(
      form.validateFields(['resource'], { recursive: true }),
    ).rejects.toMatchObject({
      errorFields: [{ name: ['resource', 'cpu'], errors: ['cpu required'] }],
    });
  });

  // 24. AdminDeploymentPresetSettingPageContent.tsx:548-564 — `resetFields()`
  //     restores the `initialValues` AS OF THE CALL, not as of mount.
  it('24. `resetFields()` applies the initialValues in effect at call time', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = ({ initial }: { initial: string }) => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ title: initial }}>
          <Form.Item name="title">
            <Input />
          </Form.Item>
        </Form>
      );
    };
    const { rerender } = render(<Demo initial="first" />);
    expect(form.getFieldValue('title')).toBe('first');

    await act(async () => {
      form.setFieldValue('title', 'edited');
    });
    // A new `initialValues` prop must not clobber the user's edit...
    rerender(<Demo initial="second" />);
    await settle();
    expect(form.getFieldValue('title')).toBe('edited');

    // ...but it IS what a later reset restores.
    await act(async () => {
      form.resetFields();
    });
    await settle();
    expect(form.getFieldValue('title')).toBe('second');
  });

  // 25. SessionLauncherPage.tsx:550-556 — the page uses `Form.Provider
  //     onFormChange` INSTEAD of `onValuesChange`, with the comment
  //     "onValuesChange will not be triggered when form is changed
  //     programmatically". The distinction is the channel each is wired to:
  //     `onValuesChange` fires only from a control's own trigger, while
  //     `onFormChange` rides `onFieldsChange`, which also fires from
  //     validation — the path a programmatic edit reaches.
  it('25. Form.Provider onFormChange is the broader channel; onValuesChange is user input only', async () => {
    const user = userEvent.setup();
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const onFormChange = vi.fn();
    const onValuesChange = vi.fn();
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form.Provider onFormChange={onFormChange}>
          <Form
            form={instance}
            name="launcher"
            onValuesChange={onValuesChange}
            initialValues={{ a: '1' }}
          >
            <Form.Item
              name="a"
              rules={[{ required: true, message: 'a required' }]}
            >
              <Input data-testid="a" />
            </Form.Item>
          </Form>
        </Form.Provider>
      );
    };
    render(<Demo />);
    await settle();
    onFormChange.mockClear();
    onValuesChange.mockClear();

    // User input reaches BOTH.
    await user.type(screen.getByTestId('a'), '2');
    await settle();
    expect(onValuesChange).toHaveBeenCalled();
    expect(onFormChange).toHaveBeenCalled();
    expect(onFormChange.mock.calls[0][0]).toBe('launcher');

    onFormChange.mockClear();
    onValuesChange.mockClear();

    // A programmatic edit reaches ONLY onFormChange.
    await act(async () => {
      form.setFieldValue('a', 'programmatic');
    });
    await form.validateFields().catch(() => undefined);
    await settle();

    expect(onFormChange).toHaveBeenCalled();
    expect(onValuesChange).not.toHaveBeenCalled();
  });

  // 25b. FR-3530 — SessionLauncherPage's real `<Form>` carries NO `name`, and
  //      its URL sync rides `Form.Provider onFormChange`. rc-field-form fires
  //      the callback for unnamed forms too (`name` undefined); a name guard
  //      here silently killed the page's `formValues` query-param sync.
  it('25b. Form.Provider onFormChange fires for unnamed forms, with name undefined', async () => {
    const user = userEvent.setup();
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const onFormChange = vi.fn();
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form.Provider onFormChange={onFormChange}>
          <Form form={instance} initialValues={{ a: '1' }}>
            {/* Rule required: the programmatic leg reaches onFieldsChange via
                validation, and a rule-less field is skipped there (test 1). */}
            <Form.Item
              name="a"
              rules={[{ required: true, message: 'a required' }]}
            >
              <Input data-testid="a" />
            </Form.Item>
          </Form>
        </Form.Provider>
      );
    };
    render(<Demo />);
    await settle();
    onFormChange.mockClear();

    // User input fires the channel even without a form name.
    await user.type(screen.getByTestId('a'), '2');
    await settle();
    expect(onFormChange).toHaveBeenCalled();
    expect(onFormChange.mock.calls[0][0]).toBeUndefined();

    onFormChange.mockClear();

    // So does a programmatic edit — the path SessionLauncherPage depends on.
    await act(async () => {
      form.setFieldValue('a', 'programmatic');
    });
    await form.validateFields().catch(() => undefined);
    await settle();
    expect(onFormChange).toHaveBeenCalled();
  });

  // ==========================================================================
  // G. error channels
  // ==========================================================================

  // 26. SessionLauncherPage.tsx:392-395 — the Launch button is disabled from
  //     `getFieldsError()`. A `warningOnly` rule leaking into `errors` would
  //     disable it permanently.
  it('26. `warningOnly` populates warnings and leaves getFieldsError() errors empty', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ mem: 999 }}>
          <Form.Item
            name="mem"
            rules={[
              {
                warningOnly: true,
                max: 8,
                type: 'number',
                message: 'too much memory',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    await expect(form.validateFields()).resolves.toBeTruthy();
    await settle();

    const [entry] = form.getFieldsError();
    expect(entry.name).toEqual(['mem']);
    expect(entry.errors).toEqual([]);
    expect(entry.warnings).toEqual(['too much memory']);
    // The Launch-button predicate the page actually runs.
    expect(form.getFieldsError().some(({ errors }) => errors.length)).toBe(
      false,
    );
  });

  // 27. The nine server-error injection sites: `setFields` writes errors that
  //     survive until `resetFields()` clears them.
  it('27. `setFields` injects server errors and `resetFields()` clears them', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ name: 'taken' }}>
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    await act(async () => {
      form.setFields([{ name: 'name', errors: ['already exists'] }]);
    });
    await settle();

    expect(form.getFieldError('name')).toEqual(['already exists']);
    expect(screen.getByText('already exists')).toBeInTheDocument();

    await act(async () => {
      form.resetFields();
    });
    await settle();
    expect(form.getFieldError('name')).toEqual([]);
  });

  // 28. AdminDeploymentPresetResourceFields.tsx:70,86,136,148 (+5 more) —
  //     `{ required: true, message: '' }` means "error state, no text", which
  //     is NOT the same as omitting `message`.
  it('28. an empty `message` differs from an omitted one', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ silent: '', spoken: '' }}>
          <Form.Item
            name="silent"
            label="Silent"
            rules={[{ required: true, message: '' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="spoken" label="Spoken" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      );
    };
    render(<Demo />);

    await expect(form.validateFields()).rejects.toBeTruthy();
    await settle();

    expect(form.getFieldError('silent')).toEqual(['']);
    const spoken = form.getFieldError('spoken');
    expect(spoken).toHaveLength(1);
    expect(spoken[0].length).toBeGreaterThan(0);
  });

  // 29. answers/08 §4 — the exact reject object 74 `.catch()` sites read.
  it('29. validateFields rejects with {message, values, errorFields, outOfDate}', async () => {
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      return (
        <Form form={instance} initialValues={{ tags: [{ key: '' }], max: '' }}>
          <Form.Item
            name="max"
            rules={[{ required: true, message: 'Max is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.List name="tags">
            {(fields: any[]) =>
              fields.map((field) => (
                <Form.Item
                  key={field.key}
                  {...field}
                  name={[field.name, 'key']}
                  rules={[{ required: true, message: 'Key is required' }]}
                >
                  <Input />
                </Form.Item>
              ))
            }
          </Form.List>
        </Form>
      );
    };
    render(<Demo />);

    const info = await form.validateFields().then(
      () => {
        throw new Error('should have rejected');
      },
      (e: any) => e,
    );

    expect(Object.keys(info).sort()).toEqual([
      'errorFields',
      'message',
      'outOfDate',
      'values',
    ]);
    // Not an Error instance — code that expects `instanceof Error` would break.
    expect(info instanceof Error).toBe(false);
    // `message` is the first error of the first failing field, in REGISTRATION
    // order (`max` registers before the list rows).
    expect(info.message).toBe('Max is required');
    expect(info.outOfDate).toBe(false);
    expect(info.values).toMatchObject({ max: '', tags: [{ key: '' }] });
    expect(info.errorFields).toEqual([
      { name: ['max'], errors: ['Max is required'], warnings: [] },
      { name: ['tags', 0, 'key'], errors: ['Key is required'], warnings: [] },
    ]);
  });

  // 30. ContainerRegistryEditorModal.tsx (FR-3705) — a trap that cost real
  //     debugging time: a Suspense hide counts as an unmount, so a boundary
  //     ABOVE the form resets every `preserve={false}` field to its initial
  //     value on the hide/show cycle. Keep suspending children behind a
  //     boundary INSIDE the form.
  it('30. a Suspense hide/show cycle above a `preserve={false}` form resets its fields', async () => {
    let settled = false;
    let resolveChild!: () => void;
    const childPromise = new Promise<void>((res) => {
      resolveChild = () => {
        settled = true;
        res();
      };
    });
    const SuspendingChild: React.FC<any> = (props) => {
      if (!settled) throw childPromise;
      return <Input data-testid="lazy-child" {...props} />;
    };
    let form!: FormInstance;
    const captureForm = (instance: FormInstance) => {
      form = instance;
    };
    const Demo = () => {
      const instance = useTestForm(captureForm);
      const show = Form.useWatch('show', instance);
      return (
        <Form
          form={instance}
          preserve={false}
          initialValues={{ show: false, keep: 'initial' }}
        >
          <Form.Item name="show" valuePropName="checked">
            <Check />
          </Form.Item>
          <Form.Item name="keep">
            <Input />
          </Form.Item>
          {show ? (
            <Form.Item name="lazy">
              <SuspendingChild />
            </Form.Item>
          ) : null}
        </Form>
      );
    };
    render(
      <React.Suspense fallback={null}>
        <Demo />
      </React.Suspense>,
    );
    await settle();

    await act(async () => {
      form.setFieldValue('keep', 'typed');
    });
    await settle();
    expect(form.getFieldValue('keep')).toBe('typed');

    // Mounting the suspending child hides the whole form behind the outer
    // boundary until the promise resolves.
    await act(async () => {
      form.setFieldValue('show', true);
    });
    await settle();
    await act(async () => {
      resolveChild();
      await childPromise;
    });
    await settle();

    // EVERY field reset to initial — including `show`, so the lazy item is
    // gone again and the child never re-renders.
    expect(form.getFieldValue('keep')).toBe('initial');
    expect(form.getFieldValue('show')).toBe(false);
    expect(screen.queryByTestId('lazy-child')).not.toBeInTheDocument();
  });
});
