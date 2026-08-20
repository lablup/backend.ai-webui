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
  - QA2-B-1 `triggerDisplay` DEFAULTS TO `'labels'`, matching Astryx
    `MultiSelector`'s vocabulary so every multi-select in the app reads the
    same way. The trigger shows the first `maxTriggerTokens` (3) selected
    LABELS comma-joined, then `, +N` — byte-identical to what
    `MultiSelector triggerDisplay="labels"` renders, so a user cannot tell
    which of the two engines is behind a given field. `'badges'` keeps the
    former `Token` chips (P26-4) for call sites that want them. The chips were
    visually closer to antd's tag pills, but they wrap and grow the trigger's
    height, which is exactly what Astryx's own guidance warns against for
    fields sitting in toolbars and form rows; a single-line label list is the
    closest thing to legacy that keeps the control one row tall.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAIComplexSelect.css';
import { ComplexSelector } from '@astryxdesign/core/ComplexSelector';
import type {
  ComplexSelectorSize,
  ComplexSelectorStatus,
} from '@astryxdesign/core/ComplexSelector';
import { Divider } from '@astryxdesign/core/Divider';
import { InputClearButton } from '@astryxdesign/core/Field';
import { Icon } from '@astryxdesign/core/Icon';
import { useIndicator } from '@astryxdesign/core/Indicator';
import { SelectorOption } from '@astryxdesign/core/Selector';
import { Spinner } from '@astryxdesign/core/Spinner';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { themeProps } from '@astryxdesign/core/utils';
import type { SizeValue } from '@astryxdesign/core/utils';
import * as _ from 'lodash-es';
import React, {
  useCallback,
  useEffect,
  useEffectEvent,
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

/**
 * How the trigger renders the selection in `multiple` mode. Mirrors Astryx
 * `MultiSelector`'s prop of the same name, minus `'count'` — "N selected"
 * hides the very information the trigger exists to show (QA2-B-1).
 */
export type BAIComplexSelectTriggerDisplay = 'labels' | 'badges';

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
  /**
   * Multiple-mode trigger rendering. Defaults to `'labels'` — the selected
   * labels, comma-joined (QA2-B-1). `'badges'` renders them as `Token` chips.
   */
  triggerDisplay?: BAIComplexSelectTriggerDisplay;
  /** Labels/chips shown in the trigger before collapsing to "+N" (P26-4). */
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
  'use memo';
  const report = useEffectEvent(() => {
    onOpenChange?.(isOpen);
  });
  useEffect(() => {
    report();
  }, [isOpen]);
  return null;
};

/**
 * Astryx's `utils/interactionModality`, which the package does not export.
 * `:focus-visible` matches a text input focused by POINTER too, and the panel
 * autofocuses its search box on open — so the CSS condition alone would ring
 * the field on every mouse-driven open. Defaults to `keyboard`, like Astryx's:
 * with no interaction yet, showing a ring is the safe error.
 */
let lastModality: 'keyboard' | 'pointer' = 'keyboard';
let isModalityTracked = false;
const trackInteractionModality = () => {
  if (isModalityTracked || typeof document === 'undefined') return;
  isModalityTracked = true;
  document.addEventListener('pointerdown', () => (lastModality = 'pointer'), {
    capture: true,
    passive: true,
  });
  document.addEventListener(
    'keydown',
    (e) => {
      // Modifier-only presses are not navigation — holding Shift before a
      // click must not turn that click into "keyboard".
      if (e.metaKey || e.altKey || e.ctrlKey) return;
      lastModality = 'keyboard';
    },
    { capture: true, passive: true },
  );
};

/**
 * Astryx `Field/PanelSearchInput`, rebuilt — it is used by `Selector` but not
 * exported from the package. Magnifier, borderless input and the shared clear
 * button, in a rounded box shaped like the option rows beneath it. The clear
 * button renders AFTER the input so forward-Tab reaches it while the popup
 * stays open.
 */
const PanelSearchRow: React.FC<{
  label: string;
  clearLabel: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  'aria-controls'?: string;
  'aria-activedescendant'?: string;
}> = ({
  label,
  clearLabel,
  placeholder,
  value,
  onValueChange,
  onKeyDown,
  ...ariaProps
}) => {
  'use memo';
  const inputRef = useRef<HTMLInputElement>(null);
  const [isKeyboardFocus, setIsKeyboardFocus] = useState(false);

  useEffect(() => {
    trackInteractionModality();
  }, []);

  return (
    <div className="bai-complex-select__search">
      <div
        className="bai-complex-select__search-field"
        data-keyboard-focus={isKeyboardFocus ? 'true' : undefined}
      >
        <Icon
          icon="search"
          size="sm"
          color="secondary"
          className="bai-complex-select__search-icon"
        />
        <input
          ref={inputRef}
          type="text"
          className="bai-complex-select__search-input"
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setIsKeyboardFocus(lastModality === 'keyboard')}
          onBlur={() => setIsKeyboardFocus(false)}
          role="combobox"
          aria-expanded
          aria-autocomplete="list"
          {...ariaProps}
        />
        {value !== '' && (
          <InputClearButton
            label={clearLabel}
            onClick={() => {
              onValueChange('');
              inputRef.current?.focus();
            }}
          />
        )}
      </div>
    </div>
  );
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
  triggerDisplay = 'labels',
  maxTriggerTokens = 3,
  'data-testid': testId,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  // Resolved from the theme, so a theme that maps `check` to another indicator
  // changes every selected-option mark in the app through this one lookup —
  // the same hook `Selector` uses, which is why its check is accent-coloured
  // and the hardcoded `lucide` glyph this replaced was not.
  const SelectionMark = useIndicator('check');
  const selected = toArray(value);
  const listboxId = useId();
  const optionIdPrefix = useId();
  // Mirrors BAISelect's `isAtBottom` ref: `endReached` fires on the
  // false -> true EDGE only, never on every scroll event.
  const isAtBottom = useRef(false);
  // -1, not 0: a freshly opened Astryx `Selector` panel highlights NOTHING
  // until the pointer or an arrow key picks a row (measured). Starting at 0
  // painted the hover wash on the first row of every panel on open, which is
  // the difference a user sees side by side with a `BAISelect` (FR-3603).
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // Uncontrolled fallback so the box is usable without a `searchValue` prop.
  const [internalSearch, setInternalSearch] = useState('');
  const search = searchValue ?? internalSearch;

  const optionIdOf = (index: number) => `${optionIdPrefix}-opt-${index}`;

  // Keep the highlight inside the list as pages append / the query changes.
  const clampedIndex =
    options.length === 0 || highlightedIndex < 0
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
    const shown = _.take(selected, maxTriggerTokens);
    const remaining = selected.length - shown.length;
    if (triggerDisplay === 'badges') {
      return (
        <HStack gap={0.5} vAlign="center" wrap="wrap">
          {_.map(shown, (s) => (
            // P26-4: display-only. `ComplexSelector` renders `triggerLabel`
            // INSIDE its own `<button>`, so a Token with `onRemove` nests a
            // button in a button — invalid HTML, and React says so at runtime
            // (measured in the ticket-26 probe). Deselection is a second click
            // on the row instead.
            <Token key={s.value} label={s.label} size="sm" />
          ))}
          {remaining > 0 ? (
            <Text color="secondary">{`+${remaining}`}</Text>
          ) : null}
        </HStack>
      );
    }
    // QA2-B-1 default: the same string `MultiSelector triggerDisplay="labels"`
    // builds, so the two select engines are indistinguishable in the trigger.
    const joined = _.map(shown, 'label').join(', ');
    return remaining > 0 ? `${joined}, +${remaining}` : joined;
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
        <div>
          <OpenStateReporter
            isOpen={state.isOpen}
            onOpenChange={(open) => {
              // Astryx drops its highlight when the panel closes, so the next
              // open starts clean. Without this the row committed last time
              // comes back wearing the hover wash (FR-3603).
              if (!open) setHighlightedIndex(-1);
              onOpenChange?.(open);
            }}
          />
          {hasSearch ? (
            <>
              <PanelSearchRow
                label={t('comp:BAIComplexSelect.SearchOptions')}
                clearLabel={t('comp:BAIComplexSelect.ClearSearch')}
                value={search}
                placeholder={
                  searchPlaceholder ?? t('comp:BAIComplexSelect.Search')
                }
                onValueChange={(next) => {
                  setInternalSearch(next);
                  // Deliberately 0, not -1: Astryx leaves the highlight alone
                  // while typing, but this panel is the searchable one, and
                  // type-then-Enter is worth keeping. Only affects a panel the
                  // user is already typing into, never its resting look.
                  setHighlightedIndex(0);
                  onSearch?.(next);
                }}
                onKeyDown={(e) => handleSearchKeyDown(e, emit, close)}
                aria-controls={listboxId}
                aria-activedescendant={
                  clampedIndex >= 0 ? optionIdOf(clampedIndex) : undefined
                }
              />
              {/* Spans the panel: the search row and the listbox each hold
                  their own inline padding, the line does not, so it reads as
                  the panel's own edge. */}
              <Divider />
            </>
          ) : null}
          {header}
          <div
            id={listboxId}
            role="listbox"
            aria-label={label}
            aria-multiselectable={multiple || undefined}
            onScroll={handleScroll}
            className="bai-complex-select__listbox"
            style={{ maxHeight: listMaxHeight }}
            data-testid={testId ? `${testId}-listbox` : undefined}
          >
            {options.length === 0
              ? (emptyContent ?? (
                  <div className="bai-complex-select__empty">
                    <Text color="secondary">
                      {t('comp:BAIComplexSelect.NoResults')}
                    </Text>
                  </div>
                ))
              : _.map(options, (option, index) => {
                  const isSelected = isSelectedValue(option.value);
                  return (
                    <div
                      key={option.value}
                      id={optionIdOf(index)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                      className="bai-complex-select__option"
                      data-size={size === 'sm' ? 'sm' : undefined}
                      data-selected={isSelected ? 'true' : undefined}
                      data-highlighted={
                        index === clampedIndex ? 'true' : undefined
                      }
                      data-disabled={option.disabled ? 'true' : undefined}
                      onClick={() => {
                        if (option.disabled) return;
                        setHighlightedIndex(index);
                        commit(option, emit, close);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span className="bai-complex-select__option-content">
                        <SelectorOption
                          label={option.label}
                          description={option.description}
                          endContent={option.extra}
                        />
                      </span>
                      {/* Rendered unconditionally with the state passed down:
                          the default check draws nothing when unchecked, but a
                          theme that swaps `check` for a radio needs the
                          unselected state to draw its empty circle. */}
                      <span className="bai-complex-select__option-mark">
                        <SelectionMark
                          state={isSelected ? 'checked' : 'unchecked'}
                          size="sm"
                          isDisabled={option.disabled ?? false}
                          {...themeProps('selector-check')}
                        />
                      </span>
                    </div>
                  );
                })}
          </div>
          {footer ??
            (_.isNumber(total) && total > 0 ? (
              <HStack
                gap={1}
                vAlign="center"
                hAlign="end"
                className="bai-complex-select__foot"
              >
                {isLoadingNext ? <Spinner size="sm" /> : null}
                <Text color="secondary" size="sm">
                  {t('general.TotalItems', { total })}
                </Text>
              </HStack>
            ) : null)}
          <VisuallyHidden as="div" aria-live="polite">
            {t('general.TotalItems', { total: options.length })}
          </VisuallyHidden>
        </div>
      )}
    </ComplexSelector>
  );
};

export default BAIComplexSelect;
