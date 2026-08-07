/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// EnvVarFormList.test.tsx
import '../../__test__/matchMedia.mock.js';
import EnvVarFormList, { sanitizeSensitiveEnv } from './EnvVarFormList';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

// antd's Select/AutoComplete dropdown positioning uses rc-resize-observer,
// which jsdom doesn't implement.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

const OPTIONAL_ENV_VARS = [
  { variable: 'HF_TOKEN', placeholder: 'Your Hugging Face access token' },
];

const Harness = () => {
  const [form] = Form.useForm();
  return (
    <Form form={form}>
      <EnvVarFormList name="environ" optionalEnvVars={OPTIONAL_ENV_VARS} />
    </Form>
  );
};

describe('EnvVarFormList value placeholder', () => {
  it('updates the Value input placeholder as soon as a suggested variable is picked', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByText('session.launcher.AddEnvironmentVariable'),
    );

    const variableInput = screen.getByRole('combobox');
    await user.click(variableInput);
    await user.type(variableInput, 'HF_TOKEN');

    const option = await screen.findByRole('option', { name: 'HF_TOKEN' });
    await user.click(option);

    expect(
      screen.getByPlaceholderText('Your Hugging Face access token'),
    ).toBeInTheDocument();
  });
});

describe('emptySensitiveEnv', () => {
  it('should empty the value of sensitive environment variables', () => {
    const envs = [
      { variable: 'SECRET_KEY', value: '12345' },
      { variable: 'API_KEY', value: 'abcdef' },
      { variable: 'NON_SENSITIVE', value: 'value' },
    ];

    const result = sanitizeSensitiveEnv(envs);

    expect(result).toEqual([
      { variable: 'SECRET_KEY', value: '' },
      { variable: 'API_KEY', value: '' },
      { variable: 'NON_SENSITIVE', value: 'value' },
    ]);
  });

  it('should not change non-sensitive environment variables', () => {
    const envs = [{ variable: 'NON_SENSITIVE', value: 'value' }];
    const result = sanitizeSensitiveEnv(envs);

    expect(result).toEqual([{ variable: 'NON_SENSITIVE', value: 'value' }]);
  });

  it('should handle an empty array', () => {
    const envs: any[] = [];

    const result = sanitizeSensitiveEnv(envs);

    expect(result).toEqual([]);
  });
});
