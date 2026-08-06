/**
 * SPIKE — Astryx select architecture probe (cn-oss-removal ticket 12).
 * NOT FOR PRODUCTION.
 *
 * Port of `packages/backend.ai-ui/src/components/fragments/BAIUserSelect.tsx`
 * — the hardest real select in the repo: Relay offset pagination with
 * scroll-driven `loadNext`, server-side search, `labelInValue`, and
 * single/multiple modes — onto Astryx primitives.
 *
 * Two implementations sit side by side so the two candidate models can be
 * compared against the same data layer:
 *
 *  - `AstryxUserSelectComplex` — `ComplexSelector` + a hand-built listbox.
 *    This is the only Astryx path that can reach `onPopupScroll` semantics,
 *    because the dropdown body is ours.
 *  - `AstryxUserTypeahead` / `AstryxUserTokenizer` — the idiomatic
 *    `Typeahead` / `Tokenizer` `searchSource` model. Included to show
 *    exactly where it stops (top-N per query, no growth).
 */
import {
  AstryxUserSelectPaginatedQuery,
  AstryxUserSelectPaginatedQuery$data,
} from '../__generated__/AstryxUserSelectPaginatedQuery.graphql';
import { AstryxUserSelectValueQuery } from '../__generated__/AstryxUserSelectValueQuery.graphql';
import { useLazyPaginatedQuery } from '../hooks/usePaginatedQuery';
import { ComplexSelector } from '@astryxdesign/core/ComplexSelector';
import { Item } from '@astryxdesign/core/Item';
import { Spinner } from '@astryxdesign/core/Spinner';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Token } from '@astryxdesign/core/Token';
import { Tokenizer } from '@astryxdesign/core/Tokenizer';
import { Typeahead } from '@astryxdesign/core/Typeahead';
import type { SearchSource } from '@astryxdesign/core/Typeahead';
import { toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  useDeferredValue,
  useRef,
  useState,
  useTransition,
} from 'react';
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';

/* ------------------------------------------------------------------ */
/* value contract                                                      */
/* ------------------------------------------------------------------ */

/**
 * antd's `labelInValue` shape. This is what 38 call sites in the repo pass
 * through `Form.Item` today, and what the mutation payloads are built from.
 */
export interface LabelInValue {
  label: string;
  value: string;
}

/**
 * Astryx's own item shape (`SearchableItem` from
 * `@astryxdesign/core/Typeahead`). Note it is *already* label-in-value: the
 * component's `value` prop carries the label, not just the key. The delta to
 * antd is a field rename (`value` → `id`) plus a widening restriction
 * (`label` must be a `string`, antd allows `ReactNode`).
 */
export interface AstryxItem {
  id: string;
  label: string;
  auxiliaryData?: { email?: string | null; role?: string | null };
}

export const toAstryxItem = (v: LabelInValue): AstryxItem => ({
  id: v.value,
  label: v.label,
});

export const toLabelInValue = (i: AstryxItem): LabelInValue => ({
  label: i.label,
  value: i.id,
});

/* ------------------------------------------------------------------ */
/* shared data layer (identical to BAIUserSelect's)                     */
/* ------------------------------------------------------------------ */

type UserNode = NonNullable<
  NonNullable<
    AstryxUserSelectPaginatedQuery$data['user_nodes']
  >['edges'][number]
>['node'];

const paginatedQuery = graphql`
  query AstryxUserSelectPaginatedQuery(
    $offset: Int!
    $limit: Int!
    $filter: String
    $order: String
  ) {
    user_nodes(offset: $offset, first: $limit, filter: $filter, order: $order) {
      count
      edges {
        node {
          id
          email
          username
          full_name
          status
          role
        }
      }
    }
  }
`;

const valueQuery = graphql`
  query AstryxUserSelectValueQuery(
    $selectedFilter: String
    $first: Int!
    $skipSelected: Boolean!
  ) {
    user_nodes(filter: $selectedFilter, first: $first)
      @skip(if: $skipSelected) {
      edges {
        node {
          id
          email
        }
      }
    }
  }
`;

const nodeToItem = (node: UserNode): AstryxItem => ({
  // `toLocalId` strips the Relay global-id envelope, matching
  // BAIUserSelect's `valuePropName: 'id'` branch.
  id: toLocalId(node?.id ?? '') ?? '',
  label: node?.email ?? '',
  auxiliaryData: { email: node?.email, role: node?.role },
});

const emailFilter = (q: string | undefined) =>
  q ? `email ilike "%${q}%"` : null;

/* ------------------------------------------------------------------ */
/* 1. ComplexSelector port — the infinite-scroll-preserving path        */
/* ------------------------------------------------------------------ */

export interface AstryxUserSelectComplexProps {
  label: string;
  /** `labelInValue`-shaped, exactly as the antd version. */
  value: LabelInValue[] | LabelInValue | null;
  onChange: (value: LabelInValue[] | LabelInValue | null) => void;
  multiple?: boolean;
  placeholder?: string;
  /** Injected purely for the 500-option volume test. */
  pageSize?: number;
}

/**
 * `ComplexSelector` gives us a field + trigger + popover shell and hands the
 * popup body back as a render prop. Everything inside — the search box, the
 * option rows, the scroll container, keyboard handling, the "N of M loaded"
 * footer — is ours. That is what makes `onPopupScroll` reimplementable, and
 * also what makes it expensive.
 */
export const AstryxUserSelectComplex: React.FC<
  AstryxUserSelectComplexProps
> = ({
  label,
  value,
  onChange,
  multiple = false,
  placeholder,
  pageSize = 10,
}) => {
  'use memo';
  const selected = _.castArray(value ?? []).filter(Boolean) as LabelInValue[];

  const [searchStr, setSearchStr] = useState('');
  const deferredSearch = useDeferredValue(searchStr);
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(false);

  const { paginationData, result, loadNext, hasNext, isLoadingNext } =
    useLazyPaginatedQuery<AstryxUserSelectPaginatedQuery, UserNode>(
      paginatedQuery,
      { limit: pageSize },
      { filter: emailFilter(deferredSearch), order: 'email' },
      { fetchPolicy: 'store-or-network' },
      {
        getTotal: (r) => r.user_nodes?.count ?? undefined,
        getItem: (r) => r.user_nodes?.edges?.map((e) => e?.node),
        getId: (item) => item?.id,
      },
    );

  const options = _.map(paginationData, (n) => nodeToItem(n as UserNode));
  const total = result.user_nodes?.count ?? 0;

  /**
   * The `onPopupScroll` reimplementation. Byte-for-byte the same predicate
   * BAISelect uses today (`scrollHeight - scrollTop - clientHeight <= 30`),
   * only attached to a div we own instead of antd's rc-virtual-list.
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottomNow =
      el.scrollHeight - el.scrollTop - el.clientHeight <= 30;
    if (isAtBottomNow !== atBottom.current) {
      atBottom.current = isAtBottomNow;
      if (isAtBottomNow) loadNext();
    }
  };

  const isSelected = (item: AstryxItem) =>
    selected.some((s) => s.value === item.id);

  const toggle = (item: AstryxItem, close: () => void) => {
    const lv = toLabelInValue(item);
    if (!multiple) {
      onChange(lv);
      close();
      return;
    }
    onChange(
      isSelected(item)
        ? selected.filter((s) => s.value !== item.id)
        : [...selected, lv],
    );
  };

  const triggerLabel =
    selected.length === 0 ? undefined : multiple ? (
      <HStack gap={1} wrap="wrap">
        {selected.slice(0, 3).map((s) => (
          <Token
            key={s.value}
            label={s.label}
            size="sm"
            onRemove={() =>
              onChange(selected.filter((x) => x.value !== s.value))
            }
          />
        ))}
        {selected.length > 3 ? (
          <Text type="supporting">+{selected.length - 3}</Text>
        ) : null}
      </HStack>
    ) : (
      selected[0].label
    );

  return (
    <ComplexSelector<LabelInValue[] | LabelInValue | null>
      label={label}
      value={value}
      onChange={onChange}
      triggerLabel={triggerLabel}
      placeholder={placeholder ?? 'Select user...'}
      width={360}
    >
      {(_v, _oc, close) => (
        <VStack gap={1} padding={2} width={360}>
          <TextInput
            label="Search users"
            isLabelHidden
            value={searchStr}
            onChange={setSearchStr}
            placeholder="Search by email..."
            hasClear
            size="sm"
          />
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{ maxHeight: 260, overflowY: 'auto' }}
            role="listbox"
            aria-multiselectable={multiple}
            data-testid="astryx-user-listbox"
          >
            {options.map((item) => (
              <Item
                key={item.id}
                label={item.label}
                description={item.auxiliaryData?.role ?? undefined}
                density="compact"
                onClick={() => toggle(item, close)}
                endContent={isSelected(item) ? <Text>✓</Text> : undefined}
              />
            ))}
            {options.length === 0 ? (
              <Text type="supporting">No results found</Text>
            ) : null}
          </div>
          <HStack gap={2} vAlign="center">
            {isLoadingNext ? <Spinner size="sm" /> : null}
            <Text type="supporting">
              {options.length} / {total}
              {hasNext ? ' — scroll for more' : ''}
            </Text>
          </HStack>
        </VStack>
      )}
    </ComplexSelector>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Typeahead / Tokenizer port — the idiomatic Astryx model           */
/* ------------------------------------------------------------------ */

/**
 * Bridges Relay to Astryx's `SearchSource`. This is the honest version of
 * "can `searchSource` be fed from Relay": yes for *query → results*, because
 * `search()` may return a Promise. It is an imperative `fetchQuery`, not a
 * `usePaginationFragment` — the hook form cannot be used because `search()`
 * is called from an event handler inside Astryx, outside React's render.
 *
 * `pageSize` here is a *hard ceiling*, not a page: `BaseTypeahead` does
 * `results.slice(0, maxMenuItems)` and replaces its internal `results` state
 * wholesale on every search. There is no append path and no scroll callback,
 * so `loadNext` has nothing to hook onto.
 */
const useRelaySearchSource = (pageSize: number): SearchSource<AstryxItem> => {
  'use memo';
  const environment = useRelayEnvironment();

  const run = async (query: string): Promise<AstryxItem[]> => {
    const data = await fetchQuery<AstryxUserSelectPaginatedQuery>(
      environment,
      paginatedQuery,
      {
        offset: 0,
        limit: pageSize,
        filter: emailFilter(query || undefined),
        order: 'email',
      },
    ).toPromise();
    return (
      data?.user_nodes?.edges?.map((e) => nodeToItem(e?.node as UserNode)) ?? []
    );
  };

  return {
    search: (query: string) => run(query),
    bootstrap: () => run(''),
  };
};

export interface AstryxUserTypeaheadProps {
  label: string;
  value: LabelInValue | null;
  onChange: (value: LabelInValue | null) => void;
  pageSize?: number;
}

export const AstryxUserTypeahead: React.FC<AstryxUserTypeaheadProps> = ({
  label,
  value,
  onChange,
  pageSize = 10,
}) => {
  'use memo';
  const searchSource = useRelaySearchSource(pageSize);
  return (
    <Typeahead<AstryxItem>
      label={label}
      searchSource={searchSource}
      value={value ? toAstryxItem(value) : null}
      onChange={(item) => onChange(item ? toLabelInValue(item) : null)}
      hasEntriesOnFocus
      maxMenuItems={pageSize}
      debounceMs={200}
      placeholder="Search users..."
      width={360}
    />
  );
};

export interface AstryxUserTokenizerProps {
  label: string;
  value: LabelInValue[];
  onChange: (value: LabelInValue[]) => void;
  pageSize?: number;
  /** antd `mode="tags"` — free text becomes a token. */
  allowFreeText?: boolean;
  maxCount?: number;
}

export const AstryxUserTokenizer: React.FC<AstryxUserTokenizerProps> = ({
  label,
  value,
  onChange,
  pageSize = 10,
  allowFreeText = false,
  maxCount,
}) => {
  'use memo';
  const searchSource = useRelaySearchSource(pageSize);
  return (
    <Tokenizer<AstryxItem>
      label={label}
      searchSource={searchSource}
      value={value.map(toAstryxItem)}
      onChange={(items) => onChange(items.map(toLabelInValue))}
      hasCreate={allowFreeText}
      maxEntries={maxCount}
      hasEntriesOnFocus
      maxMenuItems={pageSize}
      debounceMs={200}
      hasClear
      placeholder="Search users..."
      width={360}
    />
  );
};

/* ------------------------------------------------------------------ */
/* 3. selected-value resolution (the labelInValue rehydration problem)  */
/* ------------------------------------------------------------------ */

/**
 * When a form is loaded from the server the value is a bare key
 * (`"user@example.com"`), not `{label, value}`. antd papers over this by
 * rendering the raw value in the trigger. Astryx cannot: `Selector` looks the
 * label up in `options` (and shows the placeholder when absent), and
 * `Typeahead`/`Tokenizer` take a whole item so a bare key does not typecheck
 * at all.
 *
 * So the "resolve the selected key to a label with a second query" trick that
 * BAIUserSelect currently uses as a *nicety* becomes **mandatory** under
 * Astryx. This hook is that machinery, isolated.
 */
export const useResolvedLabels = (
  keys: string[],
): { items: LabelInValue[]; isPending: boolean } => {
  'use memo';
  const [isPending] = useTransition();
  const deferredKeys = useDeferredValue(keys);
  const { user_nodes } = useLazyLoadQuery<AstryxUserSelectValueQuery>(
    valueQuery,
    {
      selectedFilter: deferredKeys.map((k) => `email == "${k}"`).join(' | '),
      first: Math.max(deferredKeys.length, 1),
      skipSelected: deferredKeys.length === 0,
    },
    { fetchPolicy: deferredKeys.length ? 'store-or-network' : 'store-only' },
  );

  const items = deferredKeys.map((k) => {
    const edge = user_nodes?.edges?.find((e) => e?.node?.email === k);
    // Fall back to echoing the key as its own label — this is the behaviour
    // antd gives for free and Astryx does not.
    return { label: edge?.node?.email ?? k, value: k };
  });

  return { items, isPending };
};
