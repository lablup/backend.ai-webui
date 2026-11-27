/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardAssistantAction } from './assistantActions';

export type PreviewChange = 'moved' | 'resized' | 'range' | 'edited';

/** How a card on the preview differs from the saved board. */
export type PreviewMark =
  | { kind: 'added' }
  | { kind: 'hidden' }
  | { kind: 'changed'; changes: ReadonlyArray<PreviewChange> };

const CHANGE_OF: Partial<
  Record<DashboardAssistantAction['type'], PreviewChange>
> = {
  moveToTop: 'moved',
  moveToBottom: 'moved',
  resize: 'resized',
  setRange: 'range',
  editPanel: 'edited',
};

/**
 * The mark of every card the draft changes, by card id. `savedIds` are the
 * cards on the saved board; after `reset` the whole board differs, so nothing
 * is marked, and after `createBoard` every card shown is new.
 */
export const previewMarksOf = (
  savedIds: ReadonlySet<string>,
  actions: ReadonlyArray<DashboardAssistantAction>,
): Map<string, PreviewMark> => {
  const marks = new Map<string, PreviewMark>();
  let isNewBoard = false;
  for (const action of actions) {
    if (action.type === 'reset') {
      marks.clear();
      continue;
    }
    if (action.type === 'createBoard') {
      marks.clear();
      isNewBoard = true;
      continue;
    }
    const id = action.type === 'addPanel' ? action.panel.id : action.id;
    const current = marks.get(id);
    const wasSaved = !isNewBoard && savedIds.has(id);
    if (action.type === 'addPanel') {
      marks.set(id, { kind: 'added' });
    } else if (action.type === 'show') {
      if (!wasSaved) marks.set(id, { kind: 'added' });
      else if (current?.kind === 'hidden') marks.delete(id);
    } else if (action.type === 'hide') {
      if (current?.kind === 'added' || !wasSaved) marks.delete(id);
      else marks.set(id, { kind: 'hidden' });
    } else {
      const change = CHANGE_OF[action.type];
      if (!change || current?.kind === 'added' || current?.kind === 'hidden')
        continue;
      const changes = current?.kind === 'changed' ? current.changes : [];
      marks.set(id, {
        kind: 'changed',
        changes: changes.includes(change) ? changes : [...changes, change],
      });
    }
  }
  return marks;
};
