/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// EnvVarFormList.test.tsx
import '../../__test__/matchMedia.mock.js';
import { Form } from '../form-engine';
import EnvVarFormList, { sanitizeSensitiveEnv } from './EnvVarFormList';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

// Astryx's popover layer measures its anchor; jsdom implements neither.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

const OPTIONAL_ENV_VARS = [
  { variable: 'HF_TOKEN', placeholder: 'Your Hugging Face access token' },
];

const ADD_LABEL = 'session.launcher.AddEnvironmentVariable';
const SUGGEST_LABEL = 'session.launcher.AddSuggestedEnvironmentVariable';
const VARIABLE_LABEL = 'session.launcher.EnvironmentVariable';

const Harness = () => {
  const [form] = Form.useForm();
  return (
    <Form form={form}>
      <EnvVarFormList name="environ" optionalEnvVars={OPTIONAL_ENV_VARS} />
    </Form>
  );
};

// The suggestion menu is what replaced the antd `AutoComplete` dropdown the
// Astryx migration removed (W2A-3). It has to both pre-fill the name and drop
// it from the menu once used — otherwise picking twice would build the
// duplicate the `variable` rule rejects.
describe('EnvVarFormList suggested variables', () => {
  it('adds a row with the picked variable pre-filled', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: SUGGEST_LABEL }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'HF_TOKEN', hidden: true }),
    );

    expect(screen.getByDisplayValue('HF_TOKEN')).toBeInTheDocument();
  });

  it('stops offering a variable that is already in the list', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: SUGGEST_LABEL }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'HF_TOKEN', hidden: true }),
    );

    // HF_TOKEN was the only suggestion, so the trigger itself goes away.
    expect(
      screen.queryByRole('button', { name: SUGGEST_LABEL }),
    ).not.toBeInTheDocument();
  });
});

// Regression guard: computing the placeholder inline from
// `form.getFieldValue(...)` left the element stale even with `dependencies`
// set, because `Form.Item` re-renders the Field but not the element object
// captured on the previous outer render. `EnvVarValueInput`'s `Form.useWatch`
// is what makes it follow the sibling field.
describe('EnvVarFormList value placeholder', () => {
  it('follows a variable chosen from the suggestion menu', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: SUGGEST_LABEL }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'HF_TOKEN', hidden: true }),
    );

    expect(
      screen.getByPlaceholderText('Your Hugging Face access token'),
    ).toBeInTheDocument();
  });

  it('follows a variable typed by hand', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: ADD_LABEL }));
    await user.type(screen.getByLabelText(VARIABLE_LABEL), 'HF_TOKEN');

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
