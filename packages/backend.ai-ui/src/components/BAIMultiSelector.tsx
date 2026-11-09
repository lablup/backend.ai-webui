/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `MultiSelector`, promoted from a re-export (ADR 0014) to name the
 whole selection in a tooltip when the closed trigger cannot show it (#10951).
*/
import {
  MultiSelector,
  type MultiSelectorOptionType,
  type MultiSelectorProps,
} from '@lablup/ui-common/MultiSelector';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { mergeRefs } from '@lablup/ui-common/utils';
import { useLayoutEffect, useRef, useState } from 'react';

export type BAIMultiSelectorProps<
  T extends MultiSelectorOptionType = MultiSelectorOptionType,
> = MultiSelectorProps<T>;

// Astryx's 'labels' trigger names the first three selections, then "+N".
const TRIGGER_LABEL_COUNT = 3;
const DEFAULT_MAX_BADGES = 3;

const labelOf = (options: MultiSelectorOptionType[], value: string) => {
  for (const option of options) {
    if (typeof option === 'string') {
      if (option === value) return option;
    } else if ('type' in option && option.type === 'section') {
      const found = option.options.find((item) => item.value === value);
      if (found) return found.label ?? found.value;
    } else if ('value' in option && option.value === value) {
      return option.label ?? option.value;
    }
  }
  return value;
};

function BAIMultiSelector<
  T extends MultiSelectorOptionType = MultiSelectorOptionType,
>({
  ref,
  value,
  defaultValue,
  onChange,
  onOpenChange,
  options,
  triggerDisplay = 'labels',
  maxBadges,
  formatValue,
  renderTrigger,
  disabled,
  ...props
}: BAIMultiSelectorProps<T>) {
  'use memo';
  const triggerRef = useRef<HTMLElement | null>(null);
  // Mirrors ui-common's useMergedValue: a cleared `value` (form reset) empties it.
  const [ownValue, setOwnValue] = useState(defaultValue);
  const [prevValue, setPrevValue] = useState(value);
  if (!Object.is(prevValue, value)) {
    setPrevValue(value);
    if (value === undefined) setOwnValue(undefined);
  }
  const selected = (value !== undefined ? value : ownValue) ?? [];
  const labels = selected.map((item) =>
    labelOf(options as MultiSelectorOptionType[], item),
  );
  const [isTextOverflowing, setIsTextOverflowing] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  // Astryx reads formatValue only for the 'labels' trigger; a custom text is unknown.
  const hasCustomTrigger =
    !!renderTrigger || (!!formatValue && triggerDisplay === 'labels');
  const visibleCount =
    triggerDisplay === 'count'
      ? 0
      : triggerDisplay === 'badges'
        ? (maxBadges ?? DEFAULT_MAX_BADGES)
        : TRIGGER_LABEL_COUNT;
  const isTruncated =
    !hasCustomTrigger &&
    selected.length > 0 &&
    (selected.length > visibleCount ||
      (triggerDisplay !== 'badges' && isTextOverflowing));

  const labelsKey = labels.join('\n');
  useLayoutEffect(() => {
    if (hasCustomTrigger) return;
    // The trigger's text span: button > content span > text span.
    const text = triggerRef.current?.firstElementChild?.firstElementChild;
    if (!(text instanceof HTMLElement)) return;
    const check = () =>
      setIsTextOverflowing(text.scrollWidth > text.clientWidth);
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(check);
    observer.observe(text);
    return () => observer.disconnect();
  }, [labelsKey, triggerDisplay, hasCustomTrigger]);

  // Mounted only when truncated: Tooltip writes aria-describedby on mount.
  const showsTooltip = isTruncated && !disabled;

  return (
    <>
      <MultiSelector<T>
        {...props}
        ref={mergeRefs<HTMLElement>(triggerRef, ref)}
        options={options}
        // Always controlled, so the trigger and the tooltip read one selection.
        value={selected}
        onChange={(next, change) => {
          if (value === undefined) setOwnValue(next);
          onChange?.(next, change);
        }}
        onOpenChange={(open) => {
          setIsListOpen(open);
          onOpenChange?.(open);
        }}
        triggerDisplay={triggerDisplay}
        maxBadges={maxBadges}
        formatValue={formatValue}
        renderTrigger={renderTrigger}
        disabled={disabled}
      />
      {showsTooltip && (
        <Tooltip
          anchorRef={triggerRef}
          // Held shut while the listbox is open; stays mounted so a later hover or focus still opens it.
          isOpen={isListOpen ? false : undefined}
          content={labels.join(', ')}
        />
      )}
    </>
  );
}

export default BAIMultiSelector;
