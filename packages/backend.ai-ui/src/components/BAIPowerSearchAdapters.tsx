/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx TICKET 28 — shared plumbing for the two property filters that are
 now built on Astryx `PowerSearch` (`BAIPropertyFilter`, the Backend.AI
 queryfilter-DSL one, and `BAIGraphQLPropertyFilter`, the GraphQL object one).

 Both filters are **translating frontiers**: their external props keep the
 antd-era shape (`value` / `onChange` / `filterProperties`) so that the ~40
 call sites do not move, while the inside is Astryx. Everything in this file
 is the part of that translation the two share:

   - `toEnumItems`        BUI option lists      -> PowerSearch `EnumItem[]`
   - `toSearchSource`     BUI option lists      -> Typeahead `SearchSource`
   - `useRenderInputEditors`  BUI `renderInput` -> a `custom` operator value

 ## Why `renderInput` needs a component cache

 `CustomOperatorValue.Editor` is a **component type**. PowerSearch mounts it
 inside the edit popover, so a new function identity on every render would
 unmount and remount the consumer's control (a Relay-backed select) on every
 keystroke. Call sites declare `renderInput` inline, so its identity DOES
 change every render.

 `useRenderInputEditors` therefore keeps one stable component per property key
 for the lifetime of the host, and routes it to the LATEST `renderInput`
 through a ref that is refreshed on each render. The component identity is
 stable; the behaviour is current.
*/
import type {
  CustomOperatorValue,
  EnumItem,
} from '@astryxdesign/core/PowerSearch';
import type { SearchSource } from '@astryxdesign/core/Typeahead';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import type { ComponentType, ReactNode } from 'react';

/**
 * The option shape both filters accept. Structurally the subset of antd's
 * `DefaultOptionType` that the call sites actually populate — declared here so
 * neither filter has to import an antd type just to describe its own props.
 */
export type FilterPropertyOption = {
  label?: ReactNode;
  value?: string | number | null;
  disabled?: boolean;
};

/** The `renderInput` escape hatch shared by both filters (FR-3011 / FR-3258). */
export type FilterRenderInput = (props: {
  onAddCondition: (value: string | undefined, label?: string) => void;
}) => ReactNode;

/** Only string-ish labels survive into a token; anything else falls back. */
export const optionLabelToString = (
  label: ReactNode,
  fallback: string,
): string =>
  _.isString(label) || _.isNumber(label) ? _.toString(label) : fallback;

/** BUI option list -> PowerSearch enum items (both fields are required there). */
export function toEnumItems(
  options: ReadonlyArray<FilterPropertyOption> | undefined,
): Array<EnumItem> {
  return _.compact(
    _.map(options, (option) => {
      if (_.isNil(option?.value)) return null;
      const value = _.toString(option.value);
      return { value, label: optionLabelToString(option.label, value) };
    }),
  );
}

/**
 * BUI option list -> Typeahead `SearchSource`, used for properties that offer
 * suggestions but still accept free text (`options` without `strictSelection`).
 * The antd `AutoComplete` matched on the option LABEL, so this does too.
 */
export function toSearchSource(
  options: ReadonlyArray<FilterPropertyOption> | undefined,
): SearchSource | undefined {
  const items = toEnumItems(options);
  if (_.isEmpty(items)) return undefined;
  const searchable = _.map(items, (item) => ({
    id: item.value,
    label: item.label,
  }));
  return {
    bootstrap: () => searchable,
    search: (query: string) =>
      _.filter(searchable, (item) =>
        _.includes(_.toLower(item.label), _.toLower(query)),
      ),
  };
}

export interface RenderInputEditorsOptions {
  /** `${propertyKey}::${value}` -> human readable label, e.g. UUID -> email. */
  recordLabel: (property: string, value: string, label: string) => void;
  /** Reverse lookup used by the token's display string. */
  resolveLabel: (property: string, value: string) => string;
}

export interface RenderInputEditors {
  /**
   * Returns the `custom` operator value for a property that supplies
   * `renderInput`, or `undefined` when it does not.
   */
  operatorValueFor: (
    propertyKey: string,
    renderInput: FilterRenderInput | undefined,
  ) => CustomOperatorValue | undefined;
}

type EditorProps = {
  isDisabled?: boolean;
  onChange: (value: string | null) => void;
  placeholder: string;
  value: string | null;
};

/**
 * Builds (and caches) one `custom` operator value per `renderInput` property.
 *
 * PILOT-DECISION: the antd filter committed a condition the instant the
 * control emitted a value. PowerSearch owns the commit (its popover has an
 * Apply button), so the control now stages the value and the user confirms.
 * One extra click; the alternative was reimplementing the popover.
 */
export function useRenderInputEditors({
  recordLabel,
  resolveLabel,
}: RenderInputEditorsOptions): RenderInputEditors {
  // Latest `renderInput` per property key. Written during render on purpose:
  // the cached Editor components below must see the CURRENT closure (a call
  // site's `renderInput` captures fresh props), and an effect would leave the
  // first paint stale.
  const latestRenderInputRef = useRef<Record<string, FilterRenderInput>>({});
  const editorCacheRef = useRef<Map<string, CustomOperatorValue>>(new Map());

  const operatorValueFor = (
    propertyKey: string,
    renderInput: FilterRenderInput | undefined,
  ): CustomOperatorValue | undefined => {
    if (!renderInput) return undefined;
    latestRenderInputRef.current[propertyKey] = renderInput;

    const cached = editorCacheRef.current.get(propertyKey);
    if (cached) return cached;

    const Editor: ComponentType<EditorProps> = ({ onChange }) => {
      const render = latestRenderInputRef.current[propertyKey];
      return (
        // The consumer's control is very often an antd Select whose dropdown
        // lives in a body portal. Stop pointer events from bubbling out of the
        // editor so the popover's dismiss-on-outside-click does not fire while
        // the user is picking an option.
        <div
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {render?.({
            onAddCondition: (value, label) => {
              // Truthy guard: an empty label would blank the token.
              if (value != null && label) {
                recordLabel(propertyKey, value, label);
              }
              onChange(value ?? null);
            },
          })}
        </div>
      );
    };
    Editor.displayName = `BAIPropertyFilterRenderInput(${propertyKey})`;

    const operatorValue: CustomOperatorValue = {
      type: 'custom',
      Editor,
      getString: (value: string) => resolveLabel(propertyKey, value),
    };
    editorCacheRef.current.set(propertyKey, operatorValue);
    return operatorValue;
  };

  return { operatorValueFor };
}

/**
 * Chrome props both filters expose on top of their antd-era contract. They are
 * pass-throughs to `PowerSearch`; every one of them has a BUI-catalog default
 * so that an untouched call site still renders translated chrome.
 */
export interface BAIPowerSearchChromeProps {
  /** Accessible label for the search input. */
  label?: string;
  /** Placeholder shown while no token is present. */
  placeholder?: string;
  /** Label of the edit popover's confirm button. */
  applyLabel?: string;
  /**
   * Pre-formatted result count. Passed to PowerSearch as a STRING so the host's
   * own pluralisation wins over Astryx's "N results".
   */
  resultCount?: string;
  /**
   * Property key that bare, un-prefixed text is committed against. Defaults to
   * the first free-text property, which reproduces the antd filter's
   * "the first property is preselected" behaviour.
   */
  contentSearchFieldKey?: string;
  /** Disables the whole control. */
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  className?: string;
  'data-testid'?: string;
}
