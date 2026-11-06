/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { checkEndpoint } from '../helper/electronEndpoint';
import { useElectronEndpointStep } from './useElectronEndpointStep';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../helper/electronEndpoint', () => ({ checkEndpoint: vi.fn() }));

const ok = (endpoint: string, hasDomain = true) => ({
  ok: true as const,
  endpoint,
  hasDomain,
});

const render = (props: {
  isElectron?: boolean;
  isPanelOpen?: boolean;
  storedEndpoint?: string;
  onConfirmed?: (endpoint: string) => void;
}) =>
  renderHook(
    (p: typeof props) =>
      useElectronEndpointStep({
        isElectron: p.isElectron ?? true,
        isPanelOpen: p.isPanelOpen ?? true,
        storedEndpoint: p.storedEndpoint ?? '',
        onConfirmed: p.onConfirmed ?? (() => {}),
      }),
    { initialProps: props },
  );

describe('useElectronEndpointStep', () => {
  beforeEach(() => {
    vi.mocked(checkEndpoint).mockReset();
  });

  it('never opens the step outside Electron', () => {
    const { result } = render({
      isElectron: false,
      storedEndpoint: 'https://a',
    });
    expect(result.current.isStepOpen).toBe(false);
    expect(checkEndpoint).not.toHaveBeenCalled();
  });

  it('opens the step with no stored endpoint and waits for the user', () => {
    const { result } = render({});
    expect(result.current.isStepOpen).toBe(true);
    expect(result.current.isCheckingStored).toBe(false);
    expect(checkEndpoint).not.toHaveBeenCalled();
  });

  it('confirms a stored endpoint on its own when the panel opens, before the form shows', async () => {
    vi.mocked(checkEndpoint).mockResolvedValue(ok('https://a.example'));
    const onConfirmed = vi.fn();
    const { result, rerender } = render({
      isPanelOpen: false,
      storedEndpoint: 'https://a.example',
      onConfirmed,
    });
    expect(checkEndpoint).not.toHaveBeenCalled();

    // Start-up, and the panel the orchestrator opens right after a logout.
    rerender({
      isPanelOpen: true,
      storedEndpoint: 'https://a.example',
      onConfirmed,
    });
    expect(result.current.isCheckingStored).toBe(true);
    await waitFor(() => expect(result.current.isStepOpen).toBe(false));
    expect(result.current.isCheckingStored).toBe(false);
    expect(checkEndpoint).toHaveBeenCalledWith('https://a.example');
    expect(onConfirmed).toHaveBeenCalledWith('https://a.example');
  });

  it('keeps the step open with the error when the stored endpoint fails, and does not retry on its own', async () => {
    vi.mocked(checkEndpoint).mockResolvedValue({
      ok: false,
      error: 'unreachable',
    });
    const { result, rerender } = render({ storedEndpoint: 'https://down' });
    await waitFor(() => expect(result.current.error).toBe('unreachable'));
    expect(result.current.isStepOpen).toBe(true);
    expect(result.current.isCheckingStored).toBe(false);
    rerender({ isPanelOpen: false, storedEndpoint: 'https://down' });
    rerender({ isPanelOpen: true, storedEndpoint: 'https://down' });
    expect(checkEndpoint).toHaveBeenCalledTimes(1);
  });

  it('confirms a stored endpoint that appears while the panel is open', async () => {
    vi.mocked(checkEndpoint).mockResolvedValue(ok('https://a.example'));
    const { result, rerender } = render({ storedEndpoint: '' });
    expect(result.current.isCheckingStored).toBe(false);
    rerender({ storedEndpoint: 'https://a.example' });
    await waitFor(() => expect(result.current.isStepOpen).toBe(false));
    expect(result.current.isCheckingStored).toBe(false);
    expect(checkEndpoint).toHaveBeenCalledTimes(1);
  });

  it('reports a server without a domain after confirming it', async () => {
    vi.mocked(checkEndpoint).mockResolvedValue(ok('https://b.example', false));
    const { result } = render({});
    await act(() => result.current.continueWith('https://b.example'));
    expect(result.current.isStepOpen).toBe(false);
    expect(result.current.hasNoDomain).toBe(true);
  });

  it('"Change endpoint" reopens the step, and the new endpoint replaces the old one', async () => {
    vi.mocked(checkEndpoint)
      .mockResolvedValueOnce(ok('https://a.example'))
      .mockResolvedValueOnce(ok('https://b.example'));
    const onConfirmed = vi.fn();
    const { result } = render({
      storedEndpoint: 'https://a.example',
      onConfirmed,
    });
    await waitFor(() => expect(result.current.isStepOpen).toBe(false));

    act(() => result.current.changeEndpoint());
    expect(result.current.isStepOpen).toBe(true);
    await act(() => result.current.continueWith('https://b.example'));
    expect(result.current.isStepOpen).toBe(false);
    expect(onConfirmed).toHaveBeenLastCalledWith('https://b.example');
    expect(checkEndpoint).toHaveBeenCalledTimes(2);
  });

  it('shows an invalid address as an error and stays on the step', async () => {
    vi.mocked(checkEndpoint).mockResolvedValue({
      ok: false,
      error: 'invalidUrl',
    });
    const { result } = render({});
    await act(() => result.current.continueWith('a.example'));
    expect(result.current.isStepOpen).toBe(true);
    expect(result.current.error).toBe('invalidUrl');
  });
});
