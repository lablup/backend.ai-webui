/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// EnvVarFormList.test.tsx
import '../../__test__/matchMedia.mock.js';
import { Form } from '../form-engine';
import EnvVarFormList, { sanitizeSensitiveEnv } from './EnvVarFormList';
import { fireEvent, render, screen } from '@testing-library/react';
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
const VARIABLE_LABEL = 'session.launcher.EnvironmentVariable';
const REQUIRED_MESSAGE = 'session.launcher.EnterEnvironmentVariable';

/** Focuses the field the way Tab-navigation would, ahead of typing into it. */
const openSuggestions = (input: HTMLElement) => fireEvent.focus(input);

const Harness = () => {
  const [form] = Form.useForm();
  return (
    <Form form={form}>
      <EnvVarFormList name="environ" optionalEnvVars={OPTIONAL_ENV_VARS} />
    </Form>
  );
};

// The suggestion list is what replaced the antd `AutoComplete` dropdown the
// Astryx migration removed (W2A-3), then the button-triggered menu this
// branch first shipped: it now lives inline on the `variable` field itself
// as a type-to-filter combobox, and has to both fill the name and drop it
// from its own list once used elsewhere — otherwise picking it twice would
// build the duplicate the `variable` rule rejects.
describe('EnvVarFormList suggested variables', () => {
  it('fills the variable field with the picked suggestion', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: ADD_LABEL }));
    const input = screen.getByLabelText(VARIABLE_LABEL);
    openSuggestions(input);
    await user.type(input, 'HF');
    await user.click(
      await screen.findByRole('option', { name: 'HF_TOKEN', hidden: true }),
    );

    expect(screen.getByDisplayValue('HF_TOKEN')).toBeInTheDocument();
    // Picking dismisses the list; the refocus it performs must not reopen it.
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  // Regression guard: `Form.List`'s render prop ignores `source: 'internal'`
  // store updates (typing), so without `EnvVarFormList`'s `Form.useWatch`
  // subscription the sibling rows' `suggestions` props recompute only on
  // add/remove — a name TYPED into row 0 stayed on offer in row 1.
  it('drops a typed sibling name from other rows without an add in between', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: ADD_LABEL }));
    await user.click(screen.getByRole('button', { name: ADD_LABEL }));
    const inputs = screen.getAllByLabelText(VARIABLE_LABEL);

    await user.type(inputs[0], 'HF_TOKEN');

    openSuggestions(inputs[1]);
    await user.type(inputs[1], 'HF');

    const row1ListboxId = inputs[1].getAttribute('aria-controls');
    expect(document.getElementById(row1ListboxId ?? '')).toBeNull();
  });

  it('stops offering a variable that is already used elsewhere in the list', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: ADD_LABEL }));
    await user.type(screen.getByLabelText(VARIABLE_LABEL), 'HF_TOKEN');

    await user.click(screen.getByRole('button', { name: ADD_LABEL }));
    const row1Input = screen.getAllByLabelText(VARIABLE_LABEL)[1];
    openSuggestions(row1Input);
    await user.type(row1Input, 'HF');

    // HF_TOKEN is the only suggestion, and row 0 already uses it, so row 1's
    // OWN list stays empty. Scoped by `aria-controls` rather than a global
    // role query: row 0's own listbox is self-inclusive (its current value
    // never excludes itself) and stays mounted with an "HF_TOKEN" option, so
    // a global query would still find THAT one.
    const row1ListboxId = row1Input.getAttribute('aria-controls');
    expect(document.getElementById(row1ListboxId ?? '')).toBeNull();
  });

  // Regression guard: the old button-triggered menu only ever ADDED a new
  // row, so picking a suggestion never went through the `variable` field's
  // own `onChange` — form validation for THAT field never ran. The inline
  // combobox routes both typing and picking through the same composed
  // `onChange` (Form.Item's store write + the cross-row duplicate
  // revalidation below it), so a required-field error raised by typing must
  // clear the same way when the fix is a picked suggestion instead.
  it('validates immediately after picking a suggestion, not just while typing', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: ADD_LABEL }));
    const input = screen.getByLabelText(VARIABLE_LABEL);

    await user.type(input, 'x');
    await user.clear(input);
    expect(await screen.findByText(REQUIRED_MESSAGE)).toBeInTheDocument();

    openSuggestions(input);
    await user.type(input, 'HF');
    await user.click(
      await screen.findByRole('option', { name: 'HF_TOKEN', hidden: true }),
    );

    expect(screen.getByDisplayValue('HF_TOKEN')).toBeInTheDocument();
    expect(screen.queryByText(REQUIRED_MESSAGE)).not.toBeInTheDocument();
  });
});

// Regression guard: computing the placeholder inline from
// `form.getFieldValue(...)` left the element stale even with `dependencies`
// set, because `Form.Item` re-renders the Field but not the element object
// captured on the previous outer render. `EnvVarValueInput`'s `Form.useWatch`
// is what makes it follow the sibling field.
describe('EnvVarFormList value placeholder', () => {
  it('follows a variable chosen from the suggestion list', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: ADD_LABEL }));
    const input = screen.getByLabelText(VARIABLE_LABEL);
    openSuggestions(input);
    await user.type(input, 'HF');
    await user.click(
      await screen.findByRole('option', { name: 'HF_TOKEN', hidden: true }),
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
