/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIComplexSelect — the Astryx-based select foundation (to-astryx ticket 26).

 WHY THIS EXISTS (cn-oss-removal ticket 12 / MIGRATION-SPEC §0 "Select"):
 none of Astryx's four ready-made select components can express this repo's
 dominant select shape — a Relay connection paged 10 rows at a time, loaded
 further by scrolling the popup, searched server-side, carrying
 `{label, value}` (antd `labelInValue`) as its value:

   - `Selector` / `MultiSelector` mount EVERY option into the DOM even while
     closed (measured: 500 options -> 2,513 nodes) and carry no label in
     their value;
   - `Typeahead` / `Tokenizer` do take label-in-value items, but their
     `SearchSource` REPLACES the result list on every query and hard-slices
     it to `maxMenuItems`. There is no append path and no scroll callback,
     so `loadNext` has nothing to attach to.

 `ComplexSelector` is the escape hatch: it owns the field, trigger, popover,
 focus restore and async change flow, and hands the popup BODY back as a
 render prop. That makes the popup ours, which is the only way
 `onPopupScroll -> loadNext` survives. This component is that popup body,
 written once so the ~18 Relay-backed `*Select` wrappers can share it
 (ticket 27).

 VALUE CONTRACT — deliberately identical to antd `labelInValue`:
 `{ label: string; value: string }`, single object (or `null`) in single
 mode, an array in multiple mode. That is byte-for-byte what `BAISelect`
 emits today with `labelInValue` set, so `Form.Item` / `BAIFormItem` keep
 working with no `getValueProps` / `normalize` at the call site, and mutation
 payloads are unchanged.

 PILOT-DECISIONs (simplicity policy — antd parity is NOT the goal):

  - P26-1 VIRTUALIZATION IS DEFERRED (settled). The popup renders one DOM row
    per loaded option. The pagination window (10-20 rows) is what keeps that
    bounded — which is exactly why the infinite-scroll UX had to be preserved
    rather than replaced by "top N per query".
  - P26-2 KEYBOARD/ARIA IS A REASONABLE SUBSET, not a re-implementation of
    rc-select. Implemented: ArrowDown opens (ComplexSelector's own trigger
    handler), Up/Down/Home/End roving highlight, Enter/Space commits,
    Escape closes (popover), `role="listbox"` + `role="option"` +
    `aria-selected` + `aria-activedescendant` on the search box, highlight
    scrolled into view, polite live region on the result count. NOT
    implemented, and not planned: printable-character type-ahead jumping
    (the search box supersedes it), PageUp/PageDown, shift+arrow range
    selection, and `aria-owns`-style trigger/listbox coupling — the popup is
    `role="dialog"` because ComplexSelector hardcodes that on its popover, so
    this is a dialog containing a listbox rather than a true ARIA combobox.
  - P26-3 `optionRender`/`labelRender` DO NOT return to ReactNode labels.
    `label` is a `string` (Astryx needs a string for the trigger, the
    accessible name and the live region); rich per-row content goes in the
    separate `description` / `extra` slots. This is the one antd affordance
    the value contract could not keep.
  - P26-4 NO `tagRender`, and the multiple-mode chips in the trigger are
    DISPLAY-ONLY. They render as Astryx `Token`s with a fixed overflow rule
    (`maxTriggerTokens`, default 3, then "+N") and carry no remove button:
    `ComplexSelector` renders `triggerLabel` inside its own `<button>`, so a
    removable Token nests a button in a button. Deselecting is a second click
    on the option row (antd's chip "x" is dropped).
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import { ComplexSelector } from '@astryxdesign/core/ComplexSelector';
import type {
  ComplexSelectorSize,
  ComplexSelectorStatus,
} from '@astryxdesign/core/ComplexSelector';
import { Item } from '@astryxdesign/core/Item';
import { Spinner } from '@astryxdesign/core/Spinner';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Token } from '@astryxdesign/core/Token';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import type { SizeValue } from '@astryxdesign/core/utils';
import * as _ from 'lodash-es';
import { Check } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

/**
 * antd `labelInValue` shape, kept verbatim. `BAISelect` consumers already
 * build and consume exactly this object.
 */
export interface BAILabeledValue {
  label: string;
  value: string;
}

export type BAIComplexSelectValue =
  BAILabeledValue | Array<BAILabeledValue> | null;

export interface BAIComplexSelectOption {
  value: string;
  /** MUST be a string (P26-3) — it is the trigger text and accessible name. */
  label: string;
  /** Secondary line under the label (antd `optionRender` subtitle shape). */
  description?: React.ReactNode;
  /** Trailing rich content (badges, tags, meta) — the other half of P26-3. */
  extra?: React.ReactNode;
  disabled?: boolean;
}

export interface BAIComplexSelectProps {
  /** Accessible name. Required by every Astryx field. */
  label: string;
  /** Hide the rendered label — set this inside a `Form.Item`/`BAIFormItem`. */
  isLabelHidden?: boolean;
  /** `labelInValue`-shaped. Array iff `multiple`. */
  value?: BAIComplexSelectValue;
  onChange?: (value: BAIComplexSelectValue) => void;
  options?: Array<BAIComplexSelectOption>;
  multiple?: boolean;
  placeholder?: string;
  /** antd `showSearch`. */
  hasSearch?: boolean;
  /** Controlled search text (server-side search). */
  searchValue?: string;
  /** antd `onSearch` — fires on every keystroke; debounce upstream. */
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  /** antd `loading` — spinner on the trigger. */
  isLoading?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isOptional?: boolean;
  description?: string;
  status?: ComplexSelectorStatus;
  size?: ComplexSelectorSize;
  width?: SizeValue;
  /**
   * antd `BAISelect.endReached` — fired once each time the option list is
   * scrolled to within `atBottomThreshold` px of the bottom. Wire this to
   * Relay's `loadNext`.
   */
  endReached?: () => void;
  /** antd `BAISelect.atBottomThreshold`. */
  atBottomThreshold?: number;
  /** antd `BAISelect.atBottomStateChange`. */
  atBottomStateChange?: (atBottom: boolean) => void;
  /** Spinner next to the count while the next page is in flight. */
  isLoadingNext?: boolean;
  /** Total row count from the connection — renders the "Total N items" foot. */
  total?: number;
  /** antd `BAISelect.header` (rendered above the option list). */
  header?: React.ReactNode;
  /** antd `BAISelect.footer` (rendered below the option list). */
  footer?: React.ReactNode;
  /** antd `notFoundContent`. */
  emptyContent?: React.ReactNode;
  /**
   * Reports popup open/close. `BAIUserSelect` and friends use this to flip
   * `fetchPolicy` between `network-only` (open) and `store-only` (closed).
   */
  onOpenChange?: (open: boolean) => void;
  /** Scroll-viewport height of the option list. */
  listMaxHeight?: number;
  /** Chips shown in the trigger before collapsing to "+N" (P26-4). */
  maxTriggerTokens?: number;
  'data-testid'?: string;
}

const toArray = (value: BAIComplexSelectValue): Array<BAILabeledValue> =>
  _.compact(_.castArray(value ?? []));

/**
 * `ComplexSelector` always renders its popup subtree (the native `popover`
 * attribute does the hiding), so an effect here observes BOTH edges of the
 * open state. Reporting it from inside the render prop is the only way out:
 * `ComplexSelector` keeps `isOpen` to itself.
 */
const OpenStateReporter: React.FC<{
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}> = ({ isOpen, onOpenChange }) => {
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);
  return null;
};

const BAIComplexSelect: React.FC<BAIComplexSelectProps> = ({
  label,
  isLabelHidden,
  value = null,
  onChange,
  options = [],
  multiple = false,
  placeholder,
  hasSearch = true,
  searchValue,
  onSearch,
  searchPlaceholder,
  isLoading,
  isDisabled,
  isRequired,
  isOptional,
  description,
  status,
  size,
  width = '100%',
  endReached,
  atBottomThreshold = 30,
  atBottomStateChange,
  isLoadingNext,
  total,
  header,
  footer,
  emptyContent,
  onOpenChange,
  listMaxHeight = 260,
  maxTriggerTokens = 3,
  'data-testid': testId,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const selected = toArray(value);
  const listboxId = useId();
  const optionIdPrefix = useId();
  // Mirrors BAISelect's `isAtBottom` ref: `endReached` fires on the
  // false -> true EDGE only, never on every scroll event.
  const isAtBottom = useRef(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  // Uncontrolled fallback so the box is usable without a `searchValue` prop.
  const [internalSearch, setInternalSearch] = useState('');
  const search = searchValue ?? internalSearch;

  const optionIdOf = (index: number) => `${optionIdPrefix}-opt-${index}`;

  // Keep the highlight inside the list as pages append / the query changes.
  const clampedIndex =
    options.length === 0
      ? -1
      : _.clamp(highlightedIndex, 0, options.length - 1);

  useLayoutEffect(() => {
    if (clampedIndex < 0) return;
    // `useId()` values contain `:`, which is not a valid CSS selector without
    // escaping — `getElementById` sidesteps that entirely.
    document
      .getElementById(optionIdOf(clampedIndex))
      ?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedIndex]);

  /**
   * antd `onPopupScroll` -> `endReached`, re-implemented on a scroll
   * container we own. The predicate is BAISelect's, unchanged.
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!endReached && !atBottomStateChange) return;
    const el = e.currentTarget;
    const isAtBottomNow =
      el.scrollHeight - el.scrollTop - el.clientHeight <= atBottomThreshold;
    if (isAtBottomNow !== isAtBottom.current) {
      isAtBottom.current = isAtBottomNow;
      atBottomStateChange?.(isAtBottomNow);
      if (isAtBottomNow) endReached?.();
    }
  };

  const isSelectedValue = (optionValue: string) =>
    _.some(selected, (s) => s.value === optionValue);

  const commit = useCallback(
    (
      option: BAIComplexSelectOption,
      emit: (next: BAIComplexSelectValue) => void,
      close: () => void,
    ) => {
      const next: BAILabeledValue = {
        label: option.label,
        value: option.value,
      };
      if (!multiple) {
        emit(next);
        close();
        return;
      }
      emit(
        isSelectedValue(option.value)
          ? _.filter(selected, (s) => s.value !== option.value)
          : [...selected, next],
      );
    },
    // `selected` is derived from `value` each render; recreating on change is
    // intended (the closure must see the current selection).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [multiple, value],
  );

  const handleSearchKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    emit: (next: BAIComplexSelectValue) => void,
    close: () => void,
  ) => {
    if (options.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
      case 'Enter': {
        e.preventDefault();
        const option = options[clampedIndex];
        if (option && !option.disabled) commit(option, emit, close);
        break;
      }
      default:
        break;
    }
  };

  const triggerLabel = (() => {
    if (selected.length === 0) return undefined;
    if (!multiple) return selected[0].label;
    return (
      <HStack gap={0.5} vAlign="center" wrap="wrap">
        {_.map(_.take(selected, maxTriggerTokens), (s) => (
          // P26-4: display-only. `ComplexSelector` renders `triggerLabel`
          // INSIDE its own `<button>`, so a Token with `onRemove` nests a
          // button in a button — invalid HTML, and React says so at runtime
          // (measured in the ticket-26 probe). Deselection is a second click
          // on the row instead.
          <Token key={s.value} label={s.label} size="sm" />
        ))}
        {selected.length > maxTriggerTokens ? (
          <Text color="secondary">{`+${selected.length - maxTriggerTokens}`}</Text>
        ) : null}
      </HStack>
    );
  })();

  return (
    <ComplexSelector<BAIComplexSelectValue>
      label={label}
      isLabelHidden={isLabelHidden}
      value={value}
      onChange={(next) => onChange?.(next)}
      triggerLabel={triggerLabel}
      placeholder={placeholder}
      description={description}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isRequired={isRequired}
      isOptional={isOptional}
      status={status}
      size={size}
      width={width}
      data-testid={testId}
    >
      {(_value, emit, close, state) => (
        <VStack gap={1} hAlign="stretch">
          <OpenStateReporter
            isOpen={state.isOpen}
            onOpenChange={onOpenChange}
          />
          {hasSearch ? (
            <TextInput
              label={searchPlaceholder ?? t('comp:BAIComplexSelect.Search')}
              isLabelHidden
              size="sm"
              value={search}
              placeholder={
                searchPlaceholder ?? t('comp:BAIComplexSelect.Search')
              }
              hasClear
              onChange={(next) => {
                setInternalSearch(next);
                setHighlightedIndex(0);
                onSearch?.(next);
              }}
              onKeyDown={(e) => handleSearchKeyDown(e, emit, close)}
              role="combobox"
              aria-expanded
              aria-controls={listboxId}
              aria-activedescendant={
                clampedIndex >= 0 ? optionIdOf(clampedIndex) : undefined
              }
            />
          ) : null}
          {header}
          <div
            id={listboxId}
            role="listbox"
            aria-label={label}
            aria-multiselectable={multiple || undefined}
            onScroll={handleScroll}
            style={{ maxHeight: listMaxHeight, overflowY: 'auto' }}
            data-testid={testId ? `${testId}-listbox` : undefined}
          >
            {options.length === 0
              ? (emptyContent ?? (
                  <Text color="secondary">
                    {t('comp:BAIComplexSelect.NoResults')}
                  </Text>
                ))
              : _.map(options, (option, index) => (
                  <Item
                    key={option.value}
                    id={optionIdOf(index)}
                    role="option"
                    density="compact"
                    label={option.label}
                    description={option.description}
                    endContent={
                      <HStack gap={1} vAlign="center">
                        {option.extra}
                        {isSelectedValue(option.value) ? (
                          <Check size={14} aria-hidden />
                        ) : null}
                      </HStack>
                    }
                    isSelected={isSelectedValue(option.value)}
                    isHighlighted={index === clampedIndex}
                    isDisabled={option.disabled}
                    onClick={() => {
                      if (option.disabled) return;
                      setHighlightedIndex(index);
                      commit(option, emit, close);
                    }}
                  />
                ))}
          </div>
          {footer ??
            (_.isNumber(total) && total > 0 ? (
              <HStack gap={1} vAlign="center" hAlign="end">
                {isLoadingNext ? <Spinner size="sm" /> : null}
                <Text color="secondary">
                  {t('general.TotalItems', { total })}
                </Text>
              </HStack>
            ) : null)}
          <VisuallyHidden as="div" aria-live="polite">
            {t('general.TotalItems', { total: options.length })}
          </VisuallyHidden>
        </VStack>
      )}
    </ComplexSelector>
  );
};

export default BAIComplexSelect;
