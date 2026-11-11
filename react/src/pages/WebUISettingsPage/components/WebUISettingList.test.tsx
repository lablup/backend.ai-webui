/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getDefaultLoginConfig } from '../../../helper/loginConfig';
import { loginConfigState } from '../../../hooks/useWebUIConfig';
import WebUISettingList from './WebUISettingList';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const modalError = vi.fn();
vi.mock('../../../app-shim', () => ({
  App: {
    useApp: () => ({
      modal: { error: modalError, confirm: vi.fn() },
      message: { success: vi.fn(), error: vi.fn() },
    }),
  },
}));

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// A wide viewport, so the list renders every group instead of the narrow nav.
vi.mock('backend.ai-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('backend.ai-ui')>()),
  useBAIBreakpoint: () => ({
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true,
  }),
}));

vi.mock('../../../hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../hooks')>()),
  useCurrentDomainValue: () => 'default',
}));

type Write = (
  key: string,
  update: (current: unknown) => unknown,
) => Promise<boolean>;
const domainWrite = vi.fn<Write>();
const publicWrite = vi.fn<Write>();
vi.mock('../../../hooks/useAppConfig', () => ({
  useUpdateDomainAppConfig: () => domainWrite,
  useUpdatePublicDomainAppConfig: () => publicWrite,
}));

vi.mock('../../../components/AnnouncementEditModal', () => ({
  default: () => null,
}));
vi.mock('./SettingsJsonModal', () => ({ default: () => null }));
vi.mock('./MenuKeySelector', () => ({ default: () => null }));
vi.mock('./PluginPathInput', () => ({ default: () => null }));

const deferred = () => {
  let resolveWith!: (refetched: boolean) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<boolean>((res, rej) => {
    resolveWith = res;
    reject = rej;
  });
  const resolve = () => resolveWith(true);
  return { promise, resolve, reject };
};

// The document a write would store, given an empty stored document.
const writtenDoc = (write: typeof domainWrite, call: number) =>
  write.mock.calls[call][1](undefined);

const renderList = (store = createStore()) => {
  if (!store.get(loginConfigState)) {
    store.set(loginConfigState, getDefaultLoginConfig());
  }
  const view = render(
    <MemoryRouter>
      <JotaiProvider store={store}>
        <WebUISettingList savedDomainSettings={{}} savedPublicSettings={{}} />
      </JotaiProvider>
    </MemoryRouter>,
  );
  return Object.assign(store, { unmount: view.unmount });
};

const checkboxOf = (key: string) =>
  within(screen.getByTestId(`webui-setting-${key}`)).getByRole('checkbox');

describe('WebUISettingList', () => {
  // jsdom has no ResizeObserver; the setting list's layout measures with it.
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  beforeEach(() => {
    domainWrite.mockReset();
    publicWrite.mockReset();
    modalError.mockReset();
  });
  afterEach(() => vi.clearAllMocks());

  it('shows a change in the row and the atom before the write resolves', async () => {
    const write = deferred();
    domainWrite.mockReturnValue(write.promise);
    const store = renderList();

    expect(checkboxOf('hideAgents')).toBeChecked();
    fireEvent.click(checkboxOf('hideAgents'));

    expect(checkboxOf('hideAgents')).not.toBeChecked();
    expect(store.get(loginConfigState)?.hideAgents).toBe(false);
    expect(domainWrite).toHaveBeenCalledTimes(1);
    expect(writtenDoc(domainWrite, 0)).toEqual({ hideAgents: false });
    expect(publicWrite).not.toHaveBeenCalled();

    await act(async () => write.resolve());
    expect(store.get(loginConfigState)?.hideAgents).toBe(false);
    expect(modalError).not.toHaveBeenCalled();
  });

  it('rolls the row and the atom back when the write fails', async () => {
    domainWrite.mockRejectedValue(new Error('denied'));
    const store = renderList();

    await act(async () => {
      fireEvent.click(checkboxOf('hideAgents'));
    });

    expect(checkboxOf('hideAgents')).toBeChecked();
    expect(store.get(loginConfigState)?.hideAgents).toBe(true);
    expect(modalError).toHaveBeenCalledTimes(1);
  });

  it('writes one scope at a time, the latest values last', async () => {
    const first = deferred();
    domainWrite.mockReturnValueOnce(first.promise).mockResolvedValue(true);
    const store = renderList();

    fireEvent.click(checkboxOf('hideAgents'));
    fireEvent.click(checkboxOf('enableReservoir'));
    expect(domainWrite).toHaveBeenCalledTimes(1);
    expect(store.get(loginConfigState)?.enableReservoir).toBe(true);

    await act(async () => first.resolve());
    expect(domainWrite).toHaveBeenCalledTimes(2);
    expect(writtenDoc(domainWrite, 1)).toEqual({
      hideAgents: false,
      enableReservoir: true,
    });
  });

  it('writes a public setting to the public document only', async () => {
    publicWrite.mockResolvedValue(true);
    const store = renderList();

    await act(async () => {
      fireEvent.click(checkboxOf('debug'));
    });

    expect(store.get(loginConfigState)?.debug).toBe(true);
    expect(publicWrite).toHaveBeenCalledTimes(1);
    expect(writtenDoc(publicWrite, 0)).toEqual({ debug: true });
    expect(domainWrite).not.toHaveBeenCalled();
  });

  it('a remount during a write starts from the values being written', async () => {
    const write = deferred();
    domainWrite.mockReturnValueOnce(write.promise).mockResolvedValue(true);
    const store = renderList();

    fireEvent.click(checkboxOf('hideAgents'));
    store.unmount();
    // The cached document is still the old one while the write is in flight.
    renderList(store);
    expect(checkboxOf('hideAgents')).not.toBeChecked();

    fireEvent.click(checkboxOf('enableReservoir'));
    await act(async () => write.resolve());
    expect(writtenDoc(domainWrite, domainWrite.mock.calls.length - 1)).toEqual({
      hideAgents: false,
      enableReservoir: true,
    });
  });
});
