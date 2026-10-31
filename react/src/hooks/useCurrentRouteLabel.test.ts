/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { routeLabelOf } from './useCurrentRouteLabel';
import type { UIMatch } from 'react-router-dom';

const match = (handle: unknown): UIMatch =>
  ({ id: 'x', pathname: '/', params: {}, data: undefined, handle }) as UIMatch;

const t = (key: string) => `t(${key})`;

describe('routeLabelOf', () => {
  it('uses the deepest labelled match', () => {
    expect(
      routeLabelOf(
        [
          match({ labelKey: 'webui.menu.Sessions' }),
          match({ labelKey: 'session.launcher.StartNewSession' }),
          match(undefined),
        ],
        t,
      ),
    ).toBe('t(session.launcher.StartNewSession)');
  });

  it('prefers handle.title over labelKey', () => {
    expect(routeLabelOf([match({ title: 'Plugin', labelKey: 'x' })], t)).toBe(
      'Plugin',
    );
  });

  it('returns undefined when no match is labelled', () => {
    expect(routeLabelOf([match({ hideBreadcrumb: true })], t)).toBeUndefined();
  });
});
