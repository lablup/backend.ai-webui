/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { connectViaGQL } from './loginSessionAuth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Deferred = { resolve: (v: unknown) => void; reject: (e: unknown) => void };

const makeClient = () => {
  const pending: Record<string, Deferred> = {};
  const later = (key: string) =>
    new Promise((resolve, reject) => {
      pending[key] = { resolve, reject };
    });
  const client = {
    _config: { endpoint: 'https://manager.example' },
    query: vi.fn((q: string) =>
      later(q.includes('keypair') ? 'keypair' : 'user'),
    ),
    group: { list: vi.fn(() => later('groups')) },
    logout: vi.fn(async () => {}),
  };
  return { client, pending };
};

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('connectViaGQL', () => {
  beforeEach(() => {
    (globalThis as any).backendaiutils = {
      _readRecentProjectGroup: () => null,
    };
    (globalThis as any).backendaioptions = { set: vi.fn() };
  });
  afterEach(() => {
    delete (globalThis as any).backendaiclient;
    delete (globalThis as any).backendaiutils;
    delete (globalThis as any).backendaioptions;
  });

  it('issues the keypair, user and group reads before any of them resolves', async () => {
    const { client, pending } = makeClient();
    const done = connectViaGQL(client, {} as any, []);
    await flush();

    expect(Object.keys(pending).sort()).toEqual(['groups', 'keypair', 'user']);

    pending.keypair.resolve({
      keypair: { user_id: 'u@x', resource_policy: 'default', user: 'uuid-1' },
    });
    pending.user.resolve({
      user: {
        email: 'u@x',
        uuid: 'uuid-1',
        full_name: 'U',
        role: 'admin',
        domain_name: 'default',
        need_password_change: false,
        groups: [{ id: 'g1', name: 'default' }],
      },
    });
    pending.groups.resolve({
      groups: [
        { id: 'g1', name: 'default' },
        { id: 'g2', name: 'other' },
      ],
    });

    await expect(done).resolves.toEqual(['https://manager.example']);
    const bac = (globalThis as any).backendaiclient;
    expect(bac.is_admin).toBe(true);
    expect(bac.groups).toEqual(['default']);
    expect(bac.groupIds).toEqual({ default: 'g1', other: 'g2' });
    expect(bac.current_group).toBe('default');
  });

  it('logs out and throws when the keypair is missing, even if the other reads fail', async () => {
    const { client, pending } = makeClient();
    const done = connectViaGQL(client, {} as any, []);
    await flush();

    pending.keypair.resolve({ keypair: null });
    pending.user.reject(new Error('user read failed'));
    pending.groups.reject(new Error('group read failed'));

    await expect(done).rejects.toThrow('Keypair information is missing.');
    expect(client.logout).toHaveBeenCalledTimes(1);
  });

  it('rethrows the keypair error first when every read fails', async () => {
    const { client, pending } = makeClient();
    const done = connectViaGQL(client, {} as any, []);
    await flush();

    pending.keypair.reject(new Error('keypair read failed'));
    pending.user.reject(new Error('user read failed'));
    pending.groups.reject(new Error('group read failed'));

    await expect(done).rejects.toThrow('keypair read failed');
    expect(client.logout).not.toHaveBeenCalled();
  });
});
