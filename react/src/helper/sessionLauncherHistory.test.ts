/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionLauncherFormValue } from '../pages/SessionLauncherPage/SessionLauncherPage';
import {
  launcherStepKeysOf,
  launcherValueFromHistory,
  reviewStepOf,
} from './sessionLauncherHistory';
import { describe, expect, it } from 'vitest';

describe('launcherStepKeysOf', () => {
  it('drops the storage step for an inference session', () => {
    expect(launcherStepKeysOf('inference')).toEqual([
      'sessionType',
      'environment',
      'network',
      'review',
    ]);
    expect(launcherStepKeysOf('interactive')).toContain('storage');
  });

  it('puts the review step last', () => {
    expect(reviewStepOf('inference')).toBe(3);
    expect(reviewStepOf('batch')).toBe(4);
  });
});

describe('launcherValueFromHistory', () => {
  it('resets optional fields and gives the session a fresh name', () => {
    const value = launcherValueFromHistory({
      sessionName: 'train',
      sessionType: 'interactive',
    } as unknown as SessionLauncherFormValue);
    expect(value.sessionName).toMatch(/^train-.{4}$/);
    expect(value).toMatchObject({
      ports: [],
      vfolderMounts: [],
      num_of_sessions: 1,
      agent: ['auto'],
    });
  });

  it('keeps an empty name empty', () => {
    expect(
      launcherValueFromHistory({
        sessionType: 'interactive',
      } as unknown as SessionLauncherFormValue).sessionName,
    ).toBe('');
  });
});
