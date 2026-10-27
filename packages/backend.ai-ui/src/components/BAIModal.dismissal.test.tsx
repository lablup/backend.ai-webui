/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `maskClosable` (or `mask.closable`) and `keyboard` gate the backdrop and
 Escape independently, as antd did.
*/
import BAIModal, { type BAIModalProps } from './BAIModal';
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

const mask = () =>
  document.querySelector<HTMLElement>('.uic-modal__mask') as HTMLElement;

const renderModal = (props: Partial<BAIModalProps>) => {
  const onCancel = vi.fn();
  render(
    <BAIModal open title="Credentials" onCancel={onCancel} {...props}>
      <span>Inside</span>
    </BAIModal>,
  );
  return onCancel;
};

describe('BAIModal dismissal', () => {
  it('closes on Escape and on the backdrop by default', async () => {
    const user = userEvent.setup();
    const onCancel = renderModal({});
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    await user.click(mask());
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('keyboard={false} ignores Escape but keeps the backdrop closable', async () => {
    const user = userEvent.setup();
    const onCancel = renderModal({ keyboard: false });
    await user.keyboard('{Escape}');
    expect(onCancel).not.toHaveBeenCalled();
    await user.click(mask());
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('mask={{ closable: false }} ignores the backdrop but keeps Escape', async () => {
    const user = userEvent.setup();
    const onCancel = renderModal({ mask: { closable: false } });
    await user.click(mask());
    expect(onCancel).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('maskClosable={false} with keyboard={false} ignores both', async () => {
    const user = userEvent.setup();
    const onCancel = renderModal({ maskClosable: false, keyboard: false });
    await user.keyboard('{Escape}');
    await user.click(mask());
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('keyboard={false} still lets Escape close a modal nested inside it', async () => {
    const user = userEvent.setup();
    const onOuterCancel = vi.fn();
    const onInnerCancel = vi.fn();
    render(
      <BAIModal open title="Outer" keyboard={false} onCancel={onOuterCancel}>
        <BAIModal open title="Inner" onCancel={onInnerCancel}>
          <span>Inner body</span>
        </BAIModal>
      </BAIModal>,
    );
    await user.keyboard('{Escape}');
    expect(onInnerCancel).toHaveBeenCalledTimes(1);
    expect(onOuterCancel).not.toHaveBeenCalled();
  });

  it('keyboard={false} does not swallow Escape for a modal opened after it', async () => {
    const user = userEvent.setup();
    const onFirstCancel = vi.fn();
    const onSecondCancel = vi.fn();
    const ui = (secondOpen: boolean) => (
      <>
        <BAIModal open title="First" keyboard={false} onCancel={onFirstCancel}>
          <span>First body</span>
        </BAIModal>
        <BAIModal open={secondOpen} title="Second" onCancel={onSecondCancel}>
          <span>Second body</span>
        </BAIModal>
      </>
    );
    const { rerender } = render(ui(false));
    rerender(ui(true));
    expect(screen.getByText('Second body')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onSecondCancel).toHaveBeenCalledTimes(1);
    expect(onFirstCancel).not.toHaveBeenCalled();
  });
});
