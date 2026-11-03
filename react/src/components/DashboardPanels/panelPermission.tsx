/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useDashboardRefreshScheduler } from './DashboardRefreshContext';
import { Text } from '@lablup/ui-common/Text';
import { useBAILogger } from 'backend.ai-ui';
import React, { createContext, use, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import type { Result } from 'relay-runtime';

/** The error codes a field or request the viewer may not read comes back with. */
export const PERMISSION_DENIED_CODES: ReadonlyArray<string> = [
  'permission_access_forbidden',
  'user_auth_forbidden',
];

const deniedCodeOf = (error: unknown): string | null => {
  const code = (error as { extensions?: { code?: unknown } } | null)?.extensions
    ?.code;
  return typeof code === 'string' && PERMISSION_DENIED_CODES.includes(code)
    ? code
    : null;
};

/** The permission code among a field's errors (`@catch(to: RESULT)`), or null. */
export const permissionDeniedCode = (
  errors: ReadonlyArray<unknown> | null | undefined,
): string | null => {
  for (const error of errors ?? []) {
    const code = deniedCodeOf(error);
    if (code) return code;
  }
  return null;
};

export const isPermissionDenied = (
  errors: ReadonlyArray<unknown> | null | undefined,
): boolean => permissionDeniedCode(errors) !== null;

/** Thrown by a card whose primary field is denied, for its permission boundary. */
export class PermissionDeniedError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(`Permission denied: ${code}`);
    this.name = 'PermissionDeniedError';
    this.code = code;
  }
}

/**
 * The permission code of a thrown error: a card's {@link PermissionDeniedError},
 * or a whole-request failure `RelayEnvironment` throws (`{ isError, error_code,
 * statusCode }`). A 401 is a lost session, never a denial.
 */
export const thrownPermissionDeniedCode = (error: unknown): string | null => {
  if (error instanceof PermissionDeniedError) return error.code;
  if (!error || typeof error !== 'object') return null;
  const { statusCode, error_code, name } = error as {
    statusCode?: unknown;
    error_code?: unknown;
    name?: unknown;
  };
  if (statusCode === 401 || name === 'AuthorizationError') return null;
  if (
    typeof error_code === 'string' &&
    PERMISSION_DENIED_CODES.includes(error_code)
  )
    return error_code;
  return statusCode === 403 ? 'forbidden' : null;
};

type Caught<T> = Result<T, unknown> | null | undefined;

/**
 * A card's primary field: its value, or null on another error (as before
 * `@catch`). A permission denial throws, so the card is hidden or shows a notice.
 */
export const readPrimary = <T,>(result: Caught<T>): T | null => {
  if (!result) return null;
  if (result.ok) return result.value;
  const code = permissionDeniedCode(result.errors);
  if (code) throw new PermissionDeniedError(code);
  return null;
};

/** A secondary field (an extra count, a previous range): `denied` makes the card show "-". */
export interface SecondaryValue<T> {
  value: T | null;
  denied: boolean;
}

export const readSecondary = <T,>(result: Caught<T>): SecondaryValue<T> => {
  if (!result) return { value: null, denied: false };
  if (result.ok) return { value: result.value, denied: false };
  return { value: null, denied: isPermissionDenied(result.errors) };
};

/** A count, or "-" when any part it is made of is denied. */
export const formatDeniable = (
  value: number | string | null | undefined,
  denied: boolean,
): number | string => (denied ? '-' : (value ?? 0));

/** Denied panel ids and their codes, for one page scope (`dashboardScopeKey`). */
export interface DeniedPanelsState {
  scopeKey: string | null;
  panels: ReadonlyMap<string, string>;
}

const NO_DENIED_PANELS: ReadonlyMap<string, string> = new Map();

/** Adds a denial of `scopeKey`; the same state back when it is known or the scope has moved on. */
export const withDeniedPanel = (
  state: DeniedPanelsState,
  scopeKey: string,
  panelId: string,
  code: string,
): DeniedPanelsState =>
  state.scopeKey !== scopeKey || state.panels.get(panelId) === code
    ? state
    : { scopeKey, panels: new Map(state.panels).set(panelId, code) };

/** The state for `scopeKey`: unchanged in the same scope, empty in another. */
export const deniedPanelsForScope = (
  state: DeniedPanelsState,
  scopeKey: string,
): DeniedPanelsState =>
  state.scopeKey === scopeKey ? state : { scopeKey, panels: NO_DENIED_PANELS };

const DENIED_PANELS_SUBSCRIBER = 'denied-panels';

/**
 * The panels of one dashboard page the viewer may not read. Call `setScope`
 * on every render: another scope starts empty. A manual refresh clears them,
 * so a permission granted since shows again; each panel is logged once.
 */
export const useDeniedPanels = () => {
  'use memo';
  const { logger } = useBAILogger();
  const scheduler = useDashboardRefreshScheduler();
  const [state, setState] = useState<DeniedPanelsState>({
    scopeKey: null,
    panels: NO_DENIED_PANELS,
  });
  const loggedRef = useRef(new Set<string>());
  useEffect(() => {
    if (!scheduler) return;
    return scheduler.register(DENIED_PANELS_SUBSCRIBER, {
      refresh: (_at, manual) => {
        if (manual)
          setState((prev) =>
            prev.panels.size ? { ...prev, panels: NO_DENIED_PANELS } : prev,
          );
      },
    });
  }, [scheduler]);
  return {
    deniedPanels: state.panels,
    setScope: (scopeKey: string) => {
      // Adjusting state while rendering: the stale scope's set never commits.
      if (state.scopeKey !== scopeKey)
        setState(deniedPanelsForScope(state, scopeKey));
    },
    reporterFor:
      (scopeKey: string) =>
      (panelId: string, code: string): void => {
        const logKey = `${scopeKey}/${panelId}`;
        if (!loggedRef.current.has(logKey)) {
          loggedRef.current.add(logKey);
          logger.info(`Dashboard card ${logKey} is not readable: ${code}`);
        }
        setState((prev) => withDeniedPanel(prev, scopeKey, panelId, code));
      },
  };
};

/** Where a card reports that its data is denied; set by the board. */
export const DeniedPanelsContext = createContext<
  ((panelId: string, code: string) => void) | null
>(null);

export interface PanelPermission {
  panelId: string;
  /**
   * The notice a denied card shows in its body instead of being hidden: when a
   * card setting narrows what it reads, or on a user-made panel. Null hides it.
   */
  noticeKey: string | null;
}

/** Set per card by `DashboardPanelContent`. */
export const PanelPermissionContext = createContext<PanelPermission | null>(
  null,
);

/** The notice a denied card shows, from what narrows it; null hides the card. */
export const deniedNoticeKeyOf = ({
  resourceGroups,
  hasOtherSetting,
  isUserPanel,
}: {
  resourceGroups?: ReadonlyArray<string>;
  hasOtherSetting: boolean;
  isUserPanel: boolean;
}): string | null => {
  if (resourceGroups?.length)
    return 'dashboard.permission.NoPermissionForResourceGroup';
  if (hasOtherSetting) return 'dashboard.permission.NoPermissionForScope';
  return isUserPanel ? 'dashboard.permission.NoPermissionToView' : null;
};

const DeniedPanelBody: React.FC<{ code: string }> = ({ code }) => {
  'use memo';
  const { t } = useTranslation();
  const permission = use(PanelPermissionContext);
  const report = use(DeniedPanelsContext);
  const hides = !!permission && !permission.noticeKey && !!report;
  useEffect(() => {
    if (hides) report?.(permission.panelId, code);
  }, [hides, report, permission?.panelId, code]);
  if (hides) return null;
  return (
    <Text type="supporting" data-testid="dashboard-card-permission-notice">
      {t(permission?.noticeKey ?? 'dashboard.permission.NoPermissionToView')}
    </Text>
  );
};

export interface PanelPermissionBoundaryProps {
  /** A change in any of these renders the card again, such as a new header pick. */
  resetKeys?: Array<unknown>;
  /** Wraps the notice when the boundary sits outside the card's own frame. */
  frame?: (body: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
}

/**
 * Catches a card's permission denial: reports it so the board hides the card,
 * or shows the notice in its place. Any other error goes on to the card's
 * error boundary.
 */
export const PanelPermissionBoundary: React.FC<
  PanelPermissionBoundaryProps
> = ({ resetKeys, frame, children }) => (
  <ErrorBoundary
    resetKeys={resetKeys}
    fallbackRender={({ error }) => {
      const code = thrownPermissionDeniedCode(error);
      if (!code) throw error;
      const body = <DeniedPanelBody code={code} />;
      return frame ? frame(body) : body;
    }}
  >
    {children}
  </ErrorBoundary>
);
