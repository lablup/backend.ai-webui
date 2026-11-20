/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardAssistantAction } from './assistantActions';
import type { DashboardChatContext } from './dashboardChat';
import { atom } from 'jotai';

/** The dashboard on screen, as the WebUI Assistant's chat reads and edits it. */
export interface DashboardAgent {
  /** The previewed board, so a follow-up request sees the earlier changes. */
  context: DashboardChatContext;
  /** Changes the board previews until Apply or Discard. */
  draft: ReadonlyArray<DashboardAssistantAction>;
  /** Adds changes to the preview and scrolls to the first one. */
  propose: (actions: ReadonlyArray<DashboardAssistantAction>) => void;
  apply: () => void;
  discard: () => void;
  highlight: (id: string | null) => void;
  reveal: (id: string) => void;
}

/** Set while a dashboard page is mounted; the assistant switches to its agent prompt then. */
export const dashboardAgentAtom = atom<DashboardAgent | null>(null);
