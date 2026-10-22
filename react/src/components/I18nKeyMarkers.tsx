/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './I18nKeyMarkers.css';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { CheckIcon, GlobeIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
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

// `execCommand` covers plain HTTP and contexts where the Clipboard API is denied.
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
};

interface HoveredKey {
  id: number;
  anchorRef: React.RefObject<HTMLElement | null>;
  i18nKey: string;
}

let hoverSequence = 0;

const I18nKeyIcon: React.FC<{
  i18nKey: string;
  onHoverChange: (hovered: HoveredKey | null) => void;
}> = ({ i18nKey, onHoverChange }) => {
  'use memo';
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <span
      className="i18n-key-marker"
      role="img"
      aria-label={i18nKey}
      onMouseEnter={(e) =>
        onHoverChange({
          id: ++hoverSequence,
          anchorRef: { current: e.currentTarget },
          i18nKey,
        })
      }
      onMouseLeave={() => onHoverChange(null)}
      // The icon often sits inside a link or a button; keep the click here.
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void copyText(i18nKey).then(() => {
          setCopied(true);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? <CheckIcon aria-hidden /> : <GlobeIcon aria-hidden />}
    </span>
  );
};

/**
 * Puts a copyable globe icon after every text node that carries a debug-mode
 * i18n key marker. Each icon renders through a portal into a span inserted
 * next to the text node, so React-owned nodes are never moved.
 */
const I18nKeyMarkers: React.FC = () => {
  'use memo';
  const [active, setActive] = useState(markerAnnounced);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [hovered, setHovered] = useState<HoveredKey | null>(null);

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
            <I18nKeyIcon key={index} i18nKey={key} onHoverChange={setHovered} />
          )),
          container,
          String(anchorIndex),
        ),
      )}
      {/* One shared tooltip rendered here: a per-icon Tooltip inside a link
          or button portals into the label's text-only parent element. */}
      {hovered && (
        <Tooltip
          key={hovered.id}
          anchorRef={hovered.anchorRef}
          content={hovered.i18nKey}
          delay={0}
          isOpen
        />
      )}
    </>
  );
};

export default I18nKeyMarkers;
