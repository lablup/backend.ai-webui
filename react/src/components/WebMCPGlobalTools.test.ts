/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * FR-3764: `bai_open_resource` resolves a `ResourceRef` through `resourcePath`
 * and navigates the tab; anything the union does not accept comes back as an
 * `isError` result carrying a code.
 */
import type { BackendAIClient } from '../hooks';
import {
  createOpenResourceTool,
  createWhoamiTool,
  parseResourceRef,
  scopedResourceLocation,
} from './WebMCPGlobalTools';
import type { CallToolResult } from '@mcp-b/webmcp-types';
import type { NavigateFunction } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The component's `../hooks` import pulls the whole client bootstrap in; the
// tools under test only need its types.
vi.mock('../hooks', () => ({ useSuspendedBackendaiClient: () => ({}) }));

const navigate = vi.fn() as unknown as NavigateFunction;

const call = async (
  args: Record<string, unknown>,
  projectName = 'default',
): Promise<CallToolResult> =>
  (await createOpenResourceTool(navigate, projectName).execute(
    args,
    {} as never,
  )) as CallToolResult;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('parseResourceRef', () => {
  it('accepts every member of the ResourceRef union', () => {
    expect(parseResourceRef({ type: 'session', id: 'abc' })).toEqual({
      ref: { type: 'session', id: 'abc' },
    });
    expect(
      parseResourceRef({ type: 'deployment', id: 'd1', view: 'revisions' }),
    ).toEqual({ ref: { type: 'deployment', id: 'd1', view: 'revisions' } });
    expect(
      parseResourceRef({ type: 'vfolder', id: 'f1', path: 'a/b' }),
    ).toEqual({ ref: { type: 'vfolder', id: 'f1', path: 'a/b' } });
    expect(
      parseResourceRef({
        type: 'list',
        resource: 'user',
        statusCategory: 'INACTIVE',
      }),
    ).toEqual({
      ref: { type: 'list', resource: 'user', statusCategory: 'INACTIVE' },
    });
  });

  it('rejects an unknown type, a missing id and a bad view', () => {
    expect(parseResourceRef({ type: 'nope' })).toMatchObject({
      code: 'unknown_type',
    });
    expect(parseResourceRef({ type: 'session' })).toMatchObject({
      code: 'missing_id',
    });
    expect(
      parseResourceRef({ type: 'session', id: 'a', view: 'logs' }),
    ).toMatchObject({ code: 'invalid_view' });
    expect(
      parseResourceRef({ type: 'list', resource: 'sessions' }),
    ).toMatchObject({ code: 'unknown_list_resource' });
    expect(
      parseResourceRef({
        type: 'list',
        resource: 'model_card',
        statusCategory: 'x',
      }),
    ).toMatchObject({ code: 'invalid_status_category' });
  });
});

describe('scopedResourceLocation', () => {
  it('rebases project-scoped paths onto /project/<name>', () => {
    expect(
      scopedResourceLocation({ type: 'session', id: 'abc' }, 'ai'),
    ).toEqual({
      pathname: '/project/ai/session',
      search: 'sessionDetail=abc',
      hash: '',
    });
    expect(
      scopedResourceLocation({ type: 'deployment', id: 'd1' }, 'ai'),
    ).toEqual({ pathname: '/project/ai/deployments/d1', search: '', hash: '' });
  });

  it('leaves project-agnostic /admin paths alone', () => {
    expect(scopedResourceLocation({ type: 'role', id: 'r1' }, 'ai')).toEqual({
      pathname: '/admin/rbac',
      search: 'roleDetail=r1',
      hash: '',
    });
  });
});

describe('bai_open_resource', () => {
  it('navigates to the resourcePath location and reports it back', async () => {
    const result = await call({ type: 'session', id: 'abc' });

    expect(navigate).toHaveBeenCalledWith({
      pathname: '/project/default/session',
      search: 'sessionDetail=abc',
      hash: '',
    });
    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toMatchObject({
      path: '/project/default/session?sessionDetail=abc',
    });
  });

  it('answers an invalid ref with isError and a code, without navigating', async () => {
    const result = await call({ type: 'session' });

    expect(navigate).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({ code: 'missing_id' });
  });
});

describe('bai_whoami', () => {
  it('is read-only and reports the tab identity', () => {
    const tool = createWhoamiTool(
      {
        email: 'admin@lablup.com',
        is_superadmin: true,
        _config: { domainName: 'default', endpoint: 'http://127.0.0.1:8090' },
      } as unknown as BackendAIClient,
      'default',
    );

    expect(tool.annotations?.readOnlyHint).toBe(true);
    const result = tool.execute({}, {} as never) as CallToolResult;
    expect(result.structuredContent).toMatchObject({
      email: 'admin@lablup.com',
      role: 'superadmin',
      domain: 'default',
      endpoint: 'http://127.0.0.1:8090',
      project: 'default',
    });
  });
});
