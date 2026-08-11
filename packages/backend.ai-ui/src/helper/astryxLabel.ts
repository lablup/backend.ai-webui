/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Accessible-name helper for the antd -> Astryx migration (to-astryx phase 3,
 wave 2 / ticket W2-D).

 Astryx's universal contract #1: `label` is a **required `string`** that the
 control renders (or announces) itself. antd took a `ReactNode` in the same
 slot — `children`, `title`, `text`, `label` — so every frontier wrapper that
 keeps an antd-shaped surface has to flatten a node into a name.

 Casting `node as string` compiles, renders, and poisons `aria-label` with
 `[object Object]` (P2). This module does the flattening properly: it walks
 string/number leaves through fragments, arrays and elements and joins them.
 A node built only from non-textual leaves (an icon, an `<img>`) yields `''`,
 which callers must treat as "no name available" — either `isLabelHidden` plus
 an `endContent` render (Token/Badge), or an explicit translated fallback.
*/
import React from 'react';
import type { ReactNode } from 'react';

const MAX_DEPTH = 6;

const walk = (node: ReactNode, depth: number, out: Array<string>): void => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return;
  }
  if (typeof node === 'string') {
    if (node.trim() !== '') out.push(node);
    return;
  }
  if (typeof node === 'number') {
    out.push(String(node));
    return;
  }
  if (depth >= MAX_DEPTH) {
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((child) => walk(child as ReactNode, depth + 1, out));
    return;
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: ReactNode } | undefined;
    walk(props?.children, depth + 1, out);
  }
};

/**
 * Flatten a `ReactNode` into the plain string Astryx wants for `label`.
 * Returns `''` when the node carries no text (icon-only content) — the caller
 * decides what to do with that, and MUST NOT pass an empty name to a control
 * whose only affordance is the icon (P8).
 */
export const nodeToAccessibleLabel = (node: ReactNode): string => {
  const out: Array<string> = [];
  walk(node, 0, out);
  return out.join(' ').replace(/\s+/g, ' ').trim();
};

/**
 * `nodeToAccessibleLabel` with a fallback chain — the shape every frontier
 * wrapper needs: prefer an explicit `aria-label`/`title` the call site already
 * wrote, then the rendered text, then a caller-supplied default.
 */
export const resolveAccessibleLabel = (
  ...candidates: Array<ReactNode | undefined>
): string => {
  for (const candidate of candidates) {
    const label = nodeToAccessibleLabel(candidate ?? null);
    if (label !== '') return label;
  }
  return '';
};
