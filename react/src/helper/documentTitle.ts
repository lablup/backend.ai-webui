/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { devServerTitlePrefix } from './devServerTitle';

const FALLBACK_BASE_TITLE = 'Backend.AI';

// index.html's <title>, read at import: only this module writes it afterwards.
const baseTitle =
  (typeof document !== 'undefined' ? document.title : '') ||
  FALLBACK_BASE_TITLE;

export interface DocumentTitleParts {
  pageLabel?: string;
  actAsName?: string;
  attentionCount?: number;
}

/** `Sessions · Backend.AI`, or just the base title when there is no label. */
export const formatDocumentTitle = (
  pageLabel: string | undefined,
  base: string = baseTitle,
): string => (pageLabel ? `${pageLabel} · ${base}` : base);

/** `(2) [Alice] [fr-4073] Sessions · Backend.AI`; every part is optional. */
export const composeDocumentTitle = ({
  pageLabel,
  actAsName,
  attentionCount = 0,
}: DocumentTitleParts): string => {
  const badge = attentionCount > 0 ? `(${attentionCount}) ` : '';
  const actAs = actAsName ? `[${actAsName}] ` : '';
  return `${badge}${actAs}${devServerTitlePrefix()}${formatDocumentTitle(pageLabel)}`;
};

let currentParts: DocumentTitleParts = {};

/**
 * The only writer of `document.title`. Each caller owns one part, so the
 * parts survive one another's writes in any order.
 */
export const updateDocumentTitle = (parts: DocumentTitleParts = {}) => {
  currentParts = { ...currentParts, ...parts };
  document.title = composeDocumentTitle(currentParts);
};

export const applyRouteDocumentTitle = (pageLabel: string | undefined) => {
  updateDocumentTitle({ pageLabel });
};
