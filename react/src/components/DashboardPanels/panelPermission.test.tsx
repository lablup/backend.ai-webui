/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DashboardRefreshProvider,
  useDashboardRefreshScheduler,
} from './DashboardRefreshContext';
import { applyLayout, toBoardLayout } from './boardModel';
import { dashboardScopeKey } from './dashboardScope';
import {
  DeniedPanelsContext,
  PanelPermissionBoundary,
  PanelPermissionContext,
  PermissionDeniedError,
  deniedNoticeKeyOf,
  deniedPanelsForScope,
  isPermissionDenied,
  readPrimary,
  readSecondary,
  thrownPermissionDeniedCode,
  useDeniedPanels,
  withDeniedPanel,
} from './panelPermission';
import type { DashboardBoard, PanelDefinition } from './types';
import { act, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const denied = (code: string) => ({
  path: ['adminUsersV2'],
  extensions: { code },
});

describe('isPermissionDenied', () => {
  it('matches the RBAC and admin-only codes only', () => {
    expect(isPermissionDenied([denied('permission_access_forbidden')])).toBe(
      true,
    );
    expect(isPermissionDenied([denied('user_auth_forbidden')])).toBe(true);
    expect(isPermissionDenied([denied('internal_server_error')])).toBe(false);
    expect(isPermissionDenied([{ message: 'boom' }])).toBe(false);
    expect(isPermissionDenied(null)).toBe(false);
  });
});

describe('thrownPermissionDeniedCode', () => {
  it('reads a whole-request denial and never a 401', () => {
    expect(
      thrownPermissionDeniedCode({
        isError: true,
        error_code: 'user_auth_forbidden',
        statusCode: 400,
      }),
    ).toBe('user_auth_forbidden');
    expect(thrownPermissionDeniedCode({ isError: true, statusCode: 403 })).toBe(
      'forbidden',
    );
    expect(
      thrownPermissionDeniedCode({
        isError: true,
        error_code: 'user_auth_forbidden',
        statusCode: 401,
      }),
    ).toBeNull();
    expect(
      thrownPermissionDeniedCode({
        name: 'AuthorizationError',
        statusCode: 403,
      }),
    ).toBeNull();
    expect(thrownPermissionDeniedCode(new Error('boom'))).toBeNull();
    expect(
      thrownPermissionDeniedCode(
        new PermissionDeniedError('user_auth_forbidden'),
      ),
    ).toBe('user_auth_forbidden');
  });
});

describe('readPrimary / readSecondary', () => {
  it('throws on a denied primary field and reads other errors as null', () => {
    expect(readPrimary({ ok: true, value: 3 })).toBe(3);
    expect(readPrimary({ ok: false, errors: [{ message: 'x' }] })).toBeNull();
    expect(() =>
      readPrimary({
        ok: false,
        errors: [denied('permission_access_forbidden')],
      }),
    ).toThrow(PermissionDeniedError);
  });

  it('marks a denied secondary field instead of throwing', () => {
    expect(readSecondary({ ok: true, value: 3 })).toEqual({
      value: 3,
      denied: false,
    });
    expect(
      readSecondary({ ok: false, errors: [denied('user_auth_forbidden')] }),
    ).toEqual({ value: null, denied: true });
    expect(readSecondary({ ok: false, errors: [{ message: 'x' }] })).toEqual({
      value: null,
      denied: false,
    });
  });
});

describe('denied panels keying', () => {
  const projectA = dashboardScopeKey('projectAdmin', {
    kind: 'projects',
    projectIds: ['a'],
    domain: { id: 'd', name: 'default' },
  });
  const projectB = dashboardScopeKey('projectAdmin', {
    kind: 'projects',
    projectIds: ['b'],
    domain: { id: 'd', name: 'default' },
  });

  it('keys the scope by page and project or domain', () => {
    expect(projectA).not.toBe(projectB);
    expect(
      dashboardScopeKey('project', { kind: 'mine', projectId: 'a' }),
    ).not.toBe(projectA);
    expect(
      dashboardScopeKey('admin', {
        kind: 'projects',
        projectIds: 'all',
        domain: { id: 'd', name: 'default' },
      }),
    ).toBe('admin:domain:d');
  });

  it('starts another scope empty and ignores a stale scope report', () => {
    const inA = withDeniedPanel(
      deniedPanelsForScope({ scopeKey: null, panels: new Map() }, projectA),
      projectA,
      'users',
      'user_auth_forbidden',
    );
    expect(inA.panels.get('users')).toBe('user_auth_forbidden');
    expect(withDeniedPanel(inA, projectA, 'users', 'user_auth_forbidden')).toBe(
      inA,
    );
    const inB = deniedPanelsForScope(inA, projectB);
    expect(inB.panels.size).toBe(0);
    expect(withDeniedPanel(inB, projectA, 'users', 'user_auth_forbidden')).toBe(
      inB,
    );
  });

  it('clears on a manual refresh, not on an automatic one', () => {
    let scheduler: ReturnType<typeof useDashboardRefreshScheduler> = null;
    const { result } = renderHook(
      () => {
        scheduler = useDashboardRefreshScheduler();
        const state = useDeniedPanels();
        state.setScope(projectA);
        return state;
      },
      { wrapper: DashboardRefreshProvider },
    );
    act(() => result.current.reporterFor(projectA)('users', 'forbidden'));
    expect(result.current.deniedPanels.has('users')).toBe(true);
    act(() => scheduler?.tick());
    expect(result.current.deniedPanels.has('users')).toBe(true);
    act(() => scheduler?.refreshAll());
    expect(result.current.deniedPanels.size).toBe(0);
  });
});

describe('a denied panel on the board', () => {
  const card = (key: string): PanelDefinition => ({
    key,
    page: ['project'],
    group: 'other',
    titleKey: key,
    kind: 'custom',
    defaultSize: { columnSpan: 2, rowSpan: 2 },
    minSize: { columnSpan: 1, rowSpan: 1 },
  });
  const board: DashboardBoard = {
    panels: [
      { id: 'a', key: 'a', columnSpan: 2, rowSpan: 2 },
      { id: 'b', key: 'b', columnSpan: 2, rowSpan: 2 },
      { id: 'c', key: 'c', columnSpan: 2, rowSpan: 2 },
    ],
    knownKeys: ['a', 'b', 'c'],
  };
  const deniedIds = new Map([['b', 'user_auth_forbidden']]);

  it('is left out of the board items and kept in place in the stored board', () => {
    const layout = toBoardLayout(
      board,
      [card('a'), card('b'), card('c')],
      (panel) => !deniedIds.has(panel.id),
    );
    expect(layout.map((entry) => entry.id)).toEqual(['a', 'c']);
    const next = applyLayout(board, [
      { id: 'c', columnSpan: 4, rowSpan: 2 },
      { id: 'a', columnSpan: 2, rowSpan: 2 },
    ]);
    expect(next.panels.map((panel) => panel.id)).toEqual(['c', 'b', 'a']);
    expect(next.panels[1]).toEqual(board.panels[1]);
  });
});

describe('deniedNoticeKeyOf', () => {
  it('shows a notice when a setting narrows the card or on a user panel', () => {
    expect(
      deniedNoticeKeyOf({
        resourceGroups: ['gpu'],
        hasOtherSetting: false,
        isUserPanel: false,
      }),
    ).toBe('dashboard.permission.NoPermissionForResourceGroup');
    expect(
      deniedNoticeKeyOf({ hasOtherSetting: true, isUserPanel: false }),
    ).toBe('dashboard.permission.NoPermissionForScope');
    expect(
      deniedNoticeKeyOf({ hasOtherSetting: false, isUserPanel: true }),
    ).toBe('dashboard.permission.NoPermissionToView');
    expect(
      deniedNoticeKeyOf({ hasOtherSetting: false, isUserPanel: false }),
    ).toBeNull();
  });
});

describe('PanelPermissionBoundary', () => {
  const Denied: React.FC = () => {
    throw new PermissionDeniedError('user_auth_forbidden');
  };
  const Broken: React.FC = () => {
    throw new Error('boom');
  };
  const renderCard = (
    child: React.ReactNode,
    noticeKey: string | null,
    report = vi.fn(),
  ) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<span>card error</span>}>
        <DeniedPanelsContext value={report}>
          <PanelPermissionContext value={{ panelId: 'users', noticeKey }}>
            <PanelPermissionBoundary>{child}</PanelPermissionBoundary>
          </PanelPermissionContext>
        </DeniedPanelsContext>
      </ErrorBoundary>,
    );
    return report;
  };

  it('reports a denied card once, without a notice', () => {
    const report = renderCard(<Denied />, null);
    expect(report).toHaveBeenCalledWith('users', 'user_auth_forbidden');
    expect(report).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('dashboard-card-permission-notice')).toBeNull();
  });

  it('shows the notice instead when a setting narrows the card', () => {
    const report = renderCard(
      <Denied />,
      'dashboard.permission.NoPermissionForResourceGroup',
    );
    expect(report).not.toHaveBeenCalled();
    expect(
      screen.getByText('dashboard.permission.NoPermissionForResourceGroup'),
    ).toBeTruthy();
  });

  it('passes any other error on to the card boundary', () => {
    const report = renderCard(<Broken />, null);
    expect(report).not.toHaveBeenCalled();
    expect(screen.getByText('card error')).toBeTruthy();
  });
});
