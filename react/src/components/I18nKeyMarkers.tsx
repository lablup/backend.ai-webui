/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIText } from 'backend.ai-ui';
import { GlobeIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Debug-mode i18n keys ride along in `t()` output as invisible Unicode tag
// characters (U+E0020–U+E007E mirror ASCII), so `t()` stays a plain string.
const MARKER_START = '\u{E0001}';
const MARKER_PATTERN = /\u{E0001}([\u{E0020}-\u{E007E}]+)/gu;
const MARKER_EVENT = 'bai:i18n-key-marker';
const SKIPPED_PARENTS = new Set([
  'TITLE',
  'OPTION',
  'TEXTAREA',
  'SCRIPT',
  'STYLE',
]);

let markerAnnounced = false;

export const appendI18nKeyMarker = (value: string, key: string) => {
  const encoded = Array.from(key)
    .filter((c) => c >= ' ' && c <= '~')
    .map((c) => String.fromCodePoint(0xe0000 + c.charCodeAt(0)))
    .join('');
  if (!markerAnnounced && typeof window !== 'undefined') {
    markerAnnounced = true;
    setTimeout(() => window.dispatchEvent(new Event(MARKER_EVENT)), 0);
  }
  return encoded ? `${value}${MARKER_START}${encoded}` : value;
};

const decodeKeys = (text: string) =>
  Array.from(text.matchAll(MARKER_PATTERN), (match) =>
    Array.from(match[1], (c) =>
      String.fromCharCode(c.codePointAt(0)! - 0xe0000),
    ).join(''),
  );

interface Anchor {
  container: HTMLSpanElement;
  keys: string[];
}

const ANCHOR_ATTR = 'data-i18n-key-anchor';

/**
 * Puts a copyable globe icon after every text node that carries a debug-mode
 * i18n key marker. Each icon renders through a portal into a span inserted
 * next to the text node, so React-owned nodes are never moved.
 */
const I18nKeyMarkers: React.FC = () => {
  'use memo';
  const [active, setActive] = useState(markerAnnounced);
  const [anchors, setAnchors] = useState<Anchor[]>([]);

  useEffect(() => {
    if (active) return;
    const activate = () => setActive(true);
    window.addEventListener(MARKER_EVENT, activate);
    return () => window.removeEventListener(MARKER_EVENT, activate);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const byTextNode = new Map<Text, Anchor>();
    let frame = 0;

    const scan = () => {
      frame = 0;
      const seen = new Set<Text>();
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node as Text;
        const parent = text.parentElement;
        if (
          !text.data.includes(MARKER_START) ||
          !parent ||
          !(parent instanceof HTMLElement) ||
          SKIPPED_PARENTS.has(parent.tagName) ||
          parent.closest(`[${ANCHOR_ATTR}]`)
        ) {
          continue;
        }
        seen.add(text);
        const keys = decodeKeys(text.data);
        const existing = byTextNode.get(text);
        if (existing) {
          if (text.nextSibling !== existing.container) {
            text.after(existing.container);
          }
          existing.keys = keys;
        } else {
          const container = document.createElement('span');
          container.setAttribute(ANCHOR_ATTR, '');
          text.after(container);
          byTextNode.set(text, { container, keys });
        }
      }
      for (const [text, anchor] of byTextNode) {
        if (!seen.has(text)) {
          anchor.container.remove();
          byTextNode.delete(text);
        }
      }
      setAnchors((prev) => {
        const next = Array.from(byTextNode.values());
        return prev.length === next.length &&
          prev.every(
            (a, i) =>
              a.container === next[i].container &&
              a.keys.join() === next[i].keys.join(),
          )
          ? prev
          : next.map((a) => ({ ...a }));
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(scan);
    };
    const observer = new MutationObserver((records) => {
      const relevant = records.some(
        (r) =>
          !(
            r.target instanceof Element ? r.target : r.target.parentElement
          )?.closest(`[${ANCHOR_ATTR}]`),
      );
      if (relevant) schedule();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    schedule();
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      byTextNode.forEach((anchor) => anchor.container.remove());
    };
  }, [active]);

  return (
    <>
      {anchors.map(({ container, keys }, anchorIndex) =>
        createPortal(
          keys.map((key, index) => (
            <BAIText
              key={index}
              style={{ marginLeft: 4 }}
              copyable={{
                text: key,
                tooltips: [key, key],
                icon: <GlobeIcon />,
              }}
            />
          )),
          container,
          String(anchorIndex),
        ),
      )}
    </>
  );
};

export default I18nKeyMarkers;
