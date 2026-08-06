/**
 * SPIKE harness — Astryx select architecture probe (cn-oss-removal ticket 12).
 * Standalone: no Relay, no backend. Answers the two DOM-level questions that
 * do not need a live API:
 *   A. can a hand-built listbox inside ComplexSelector drive scroll-triggered
 *      "loadNext"? (fake paginated source stands in for Relay)
 *   B. what does 500 options cost without virtualisation, vs antd?
 */
import { ComplexSelector } from '@astryxdesign/core/ComplexSelector';
import { Item } from '@astryxdesign/core/Item';
import { Selector } from '@astryxdesign/core/Selector';
import { VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Tokenizer } from '@astryxdesign/core/Tokenizer';
import { Typeahead } from '@astryxdesign/core/Typeahead';
import type {
  SearchSource,
  SearchableItem,
} from '@astryxdesign/core/Typeahead';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/theme-neutral/theme.css';
import { ConfigProvider, Select } from 'antd';
import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const ALL = Array.from({ length: 500 }, (_v, i) => ({
  id: `u-${i}`,
  label: `user${String(i).padStart(3, '0')}@lablup.com`,
}));

const OPTIONS = ALL.map((u) => ({ value: u.id, label: u.label }));

/** Fake Relay: offset pagination with a 10-per-page window. */
const PAGE = 10;

function ScrollPaginatedComplexSelector() {
  const [loaded, setLoaded] = useState(PAGE);
  const [value, setValue] = useState<{ label: string; value: string } | null>(
    null,
  );
  const atBottom = useRef(false);
  const [loadNextCalls, setLoadNextCalls] = useState(0);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const now = el.scrollHeight - el.scrollTop - el.clientHeight <= 30;
    if (now !== atBottom.current) {
      atBottom.current = now;
      if (now) {
        setLoadNextCalls((c) => c + 1);
        setLoaded((n) => Math.min(n + PAGE, ALL.length));
      }
    }
  };

  return (
    <div data-testid="complex-wrap">
      <span data-testid="loaded-count">{loaded}</span>
      <span data-testid="loadnext-calls">{loadNextCalls}</span>
      <ComplexSelector<{ label: string; value: string } | null>
        label="ComplexSelector + hand-built scroll listbox"
        value={value}
        onChange={setValue}
        triggerLabel={value?.label}
        placeholder="Select user..."
        width={420}
      >
        {(_v, _oc, close) => (
          <VStack gap={1} padding={2} width={420}>
            <div
              data-testid="listbox"
              role="listbox"
              onScroll={onScroll}
              style={{ maxHeight: 240, overflowY: 'auto' }}
            >
              {ALL.slice(0, loaded).map((u) => (
                <Item
                  key={u.id}
                  label={u.label}
                  density="compact"
                  onClick={() => {
                    setValue({ label: u.label, value: u.id });
                    close();
                  }}
                />
              ))}
            </div>
            <Text type="supporting">
              {loaded} / {ALL.length}
            </Text>
          </VStack>
        )}
      </ComplexSelector>
    </div>
  );
}

/** Astryx's own model: search → top-N, no growth. */
const source: SearchSource<SearchableItem> = {
  search: (q) =>
    ALL.filter((u) => u.label.includes(q)).map((u) => ({
      id: u.id,
      label: u.label,
    })),
  bootstrap: () => ALL.map((u) => ({ id: u.id, label: u.label })),
};

function App() {
  const [sel, setSel] = useState<string | null>(null);
  const [antd, setAntd] = useState<string>();
  const [ta, setTa] = useState<SearchableItem | null>(null);
  const [tok, setTok] = useState<SearchableItem[]>([]);

  return (
    <ConfigProvider>
      <VStack gap={4} padding={4}>
        <h2>Astryx select probe</h2>

        <ScrollPaginatedComplexSelector />

        <div data-testid="typeahead-wrap">
          <Typeahead<SearchableItem>
            label="Typeahead (searchSource, maxMenuItems=10)"
            searchSource={source}
            value={ta}
            onChange={setTa}
            hasEntriesOnFocus
            maxMenuItems={10}
            debounceMs={0}
            width={420}
          />
        </div>

        <div data-testid="tokenizer-wrap">
          <Tokenizer<SearchableItem>
            label="Tokenizer (tags, hasCreate)"
            searchSource={source}
            value={tok}
            onChange={(items) => setTok(items)}
            hasCreate
            hasEntriesOnFocus
            maxMenuItems={10}
            debounceMs={0}
            maxEntries={5}
            width={420}
          />
        </div>

        <div data-testid="astryx-500">
          <Selector
            label="Astryx Selector · 500 options (no virtualisation)"
            options={OPTIONS}
            hasClear
            value={sel}
            onChange={setSel}
            hasSearch
            width={420}
          />
        </div>

        <div data-testid="antd-500" style={{ width: 420 }}>
          <Select
            style={{ width: '100%' }}
            placeholder="antd Select · 500 options (rc-virtual-list)"
            options={OPTIONS}
            showSearch
            value={antd}
            onChange={setAntd}
          />
        </div>
      </VStack>
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

/**
 * Isolated mount benchmark: how long does React take to mount a single
 * 500-option select, and how many DOM nodes does it leave behind, for each
 * library? Mounted into a detached-but-attached scratch container so the
 * measurement excludes the rest of the page.
 */
declare global {
  interface Window {
    __bench: (which: 'astryx' | 'antd', n: number) => Promise<unknown>;
  }
}
window.__bench = async (which, n) => {
  const opts = Array.from({ length: n }, (_v, i) => ({
    value: `b-${i}`,
    label: `bench option ${i}`,
  }));
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  const t = performance.now();
  await new Promise<void>((resolve) => {
    root.render(
      which === 'astryx' ? (
        <Selector label="bench" options={opts} hasClear value={null} />
      ) : (
        <Select options={opts} style={{ width: 300 }} />
      ),
    );
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  const mountMs = Math.round(performance.now() - t);
  const domNodes = host.querySelectorAll('*').length;
  const optionNodes = host.querySelectorAll(
    '[role="option"], .ant-select-item-option',
  ).length;
  root.unmount();
  host.remove();
  return { which, n, mountMs, domNodes, optionNodes };
};
