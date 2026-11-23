/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { previewMarksOf } from './previewMarks';

const saved = new Set(['agents', 'sessions']);

describe('previewMarksOf', () => {
  it('marks hidden, added and changed cards', () => {
    const marks = previewMarksOf(saved, [
      { type: 'hide', id: 'agents' },
      { type: 'show', id: 'pendingSessions' },
      { type: 'resize', id: 'sessions', columnSpan: 2 },
      { type: 'moveToTop', id: 'sessions' },
      { type: 'resize', id: 'sessions', rowSpan: 3 },
    ]);
    expect(Object.fromEntries(marks)).toEqual({
      agents: { kind: 'hidden' },
      pendingSessions: { kind: 'added' },
      sessions: { kind: 'changed', changes: ['resized', 'moved'] },
    });
  });

  it('keeps a card added in the draft marked added, and drops it when hidden again', () => {
    const marks = previewMarksOf(saved, [
      { type: 'show', id: 'pendingSessions' },
      { type: 'resize', id: 'pendingSessions', columnSpan: 2 },
      { type: 'show', id: 'jobs' },
      { type: 'hide', id: 'jobs' },
    ]);
    expect(Object.fromEntries(marks)).toEqual({
      pendingSessions: { kind: 'added' },
    });
  });

  it('marks nothing after reset, and everything shown on a new board as added', () => {
    expect(
      previewMarksOf(saved, [{ type: 'hide', id: 'agents' }, { type: 'reset' }])
        .size,
    ).toBe(0);
    const marks = previewMarksOf(saved, [
      { type: 'createBoard', title: 'Incidents' },
      { type: 'show', id: 'agents' },
    ]);
    expect(marks.get('agents')).toEqual({ kind: 'added' });
  });
});
