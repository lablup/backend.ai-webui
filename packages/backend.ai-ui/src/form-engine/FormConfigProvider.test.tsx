/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 35 — the localized `validateMessages` table.

 Until this ticket the templates a user saw on a failed `required` / `type` /
 `max` rule came from `antd/es/locale/<lang>.Form.defaultValidateMessages`,
 injected through antd's `<ConfigProvider form>`. They now come from BUI's own
 catalogs (`src/locale/*.json`, key `form.validateMessages`) through the
 engine's `<FormConfigProvider>`, with no antd locale bundle in the path.

 What is pinned here:
   - the provider localizes WITHOUT the call site passing anything;
   - it re-resolves when BUI's i18next language changes;
   - `${label}` / `${max}` / `${type}` interpolation still runs against the
     translated string (i18next's own `{{ }}` interpolation must not eat them);
   - an explicit `validateMessages` prop still wins;
   - a locale with no `form` subtree falls back to English rather than to a
     dotted i18n key.
 */
import { i18n as buiI18n } from '../locale';
import { FormConfigProvider } from './FormConfigProvider';
import { Form } from './engine';
import type { FormInstance } from './interface';
import { act, render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

const Input: React.FC<any> = ({ value = '', onChange, ...rest }) => (
  <input value={value} onChange={onChange} {...rest} />
);

/** Validate a one-field form and return the messages it produced. */
async function messagesFor(
  ui: (formRef: (f: FormInstance) => void) => React.ReactElement,
) {
  let form: FormInstance | undefined;
  render(ui((f) => (form = f)));
  let errors: string[] = [];
  await act(async () => {
    await form!.validateFields().catch((info: any) => {
      errors = info.errorFields.flatMap((f: any) => f.errors);
    });
  });
  return errors;
}

const RequiredForm: React.FC<{
  onForm: (f: FormInstance) => void;
  validateMessages?: any;
}> = ({ onForm, validateMessages }) => {
  const [form] = Form.useForm();
  React.useEffect(() => {
    onForm(form);
  }, [form, onForm]);
  return (
    <FormConfigProvider validateMessages={validateMessages}>
      <Form form={form}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </FormConfigProvider>
  );
};

afterEach(async () => {
  await act(async () => {
    await buiI18n.changeLanguage('en');
  });
});

describe('FormConfigProvider — localized validateMessages', () => {
  it('localizes a message-less `required` rule from BUI catalogs', async () => {
    const errors = await messagesFor((onForm) => (
      <RequiredForm onForm={onForm} />
    ));
    // `en.json` -> form.validateMessages.Required = "Please enter ${label}"
    expect(errors).toEqual(['Please enter Name']);
  });

  it.each([
    ['ko', 'Name 값을 입력해 주세요'],
    ['ja', 'Nameを入力してください'],
    ['de', 'Bitte geben Sie Name an'],
    ['zh-CN', '请输入Name'],
  ])('follows BUI i18next into %s', async (lang, expected) => {
    await act(async () => {
      await buiI18n.changeLanguage(lang);
    });
    const errors = await messagesFor((onForm) => (
      <RequiredForm onForm={onForm} />
    ));
    expect(errors).toEqual([expected]);
  });

  it('interpolates ${max} / ${type} inside a translated template', async () => {
    await act(async () => {
      await buiI18n.changeLanguage('ko');
    });
    const Harness: React.FC<{ onForm: (f: FormInstance) => void }> = ({
      onForm,
    }) => {
      const [f] = Form.useForm();
      React.useEffect(() => {
        onForm(f);
      }, [f, onForm]);
      return (
        <FormConfigProvider>
          <Form form={f} initialValues={{ nickname: 'abcdef' }}>
            <Form.Item
              name="nickname"
              label="Nickname"
              rules={[{ type: 'string', max: 3 }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </FormConfigProvider>
      );
    };
    const errors = await messagesFor((onForm) => <Harness onForm={onForm} />);
    // `ko.json` -> string.Max = "${label} ${max}글자 이하여야 합니다"
    expect(errors).toEqual(['Nickname 3글자 이하여야 합니다']);
  });

  it('lets an explicit `validateMessages` prop win over the locale table', async () => {
    await act(async () => {
      await buiI18n.changeLanguage('ko');
    });
    const errors = await messagesFor((onForm) => (
      <RequiredForm
        onForm={onForm}
        validateMessages={{ required: 'CUSTOM ${label}' }}
      />
    ));
    expect(errors).toEqual(['CUSTOM Name']);
  });

  it('never surfaces a raw i18n key when a language lacks the subtree', async () => {
    // `cimode` returns the KEY for every lookup; the provider must treat that
    // as "not translated" and fall back to the engine's own English default.
    await act(async () => {
      await buiI18n.changeLanguage('cimode');
    });
    const errors = await messagesFor((onForm) => (
      <RequiredForm onForm={onForm} />
    ));
    expect(errors).toHaveLength(1);
    expect(errors[0]).not.toContain('form.validateMessages');
  });
});
