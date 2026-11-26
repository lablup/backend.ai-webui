/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Flattens a `ReactNode` into the plain string Astryx wants for a required
 `label`. Casting `node as string` renders `[object Object]` into `aria-label`;
 this walks the string and number leaves instead. A node with no text (an icon)
 yields `''`, which callers treat as "no name available". Text carried in props
 (`Badge label=`) is invisible to the walk, so such call sites pass it explicitly.
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
