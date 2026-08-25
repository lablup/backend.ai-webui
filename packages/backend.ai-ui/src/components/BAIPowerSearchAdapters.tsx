/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Shared plumbing for the two property filters built on Astryx `PowerSearch`
 (`BAIPropertyFilter`, the Backend.AI queryfilter-DSL one, and
 `BAIGraphQLPropertyFilter`, the GraphQL object one). Both are translating
 frontiers: their external props keep the antd-era shape (`value` /
 `onChange` / `filterProperties`) so the ~40 call sites do not move, while the
 inside is Astryx. Everything the two share in that translation lives here.

 `CustomOperatorValue.Editor` is a COMPONENT TYPE that PowerSearch mounts
 inside its edit popover, so a fresh identity on every render would remount the
 consumer's control on every keystroke — and call sites declare `renderInput` /
 `entitySource` inline. Both editor factories below therefore keep one
 component per property key for the host's lifetime and route it to the LATEST
 props through a ref refreshed during render.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import type {
  CustomOperatorValue,
  EnumItem,
} from '@astryxdesign/core/PowerSearch';
import { Tokenizer } from '@astryxdesign/core/Tokenizer';
import { Typeahead, TypeaheadItem } from '@astryxdesign/core/Typeahead';
import type {
  SearchableItem,
  SearchSource,
} from '@astryxdesign/core/Typeahead';
import * as _ from 'lodash-es';
import React, { useEffect, useRef, useState } from 'react';
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
  /** The value staged in the popover (an existing token's value in edit mode). */
  value: string | null;
  isDisabled?: boolean;
}) => ReactNode;

/** One selectable entity: the opaque id the filter serializes plus its label. */
export interface FilterEntity {
  id: string;
  label: string;
  description?: string;
}

/**
 * Declarative replacement for `renderInput` on properties whose value is an
 * opaque id. The host builds it, so Relay stays outside these components.
 */
export interface FilterEntitySource {
  /** Per-keystroke lookup; debounced by the editor (150 ms). */
  search: (query: string) => Promise<Array<FilterEntity>> | Array<FilterEntity>;
  /** Shown when the editor opens with an empty query. Enables entries-on-focus. */
  bootstrap?: () => Promise<Array<FilterEntity>> | Array<FilterEntity>;
  /** id -> label for ids restored from the URL. Omit and tokens show the raw id. */
  resolve?: (ids: ReadonlyArray<string>) => Promise<Array<FilterEntity>>;
  /** Abort in-flight work; forwarded to Typeahead/Tokenizer. */
  cancel?: () => void;
}

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

export interface EntityLabelCache {
  record: (propertyKey: string, id: string, label: string) => void;
  recordMany: (
    propertyKey: string,
    entities: ReadonlyArray<FilterEntity>,
  ) => void;
  resolveLabel: (propertyKey: string, id: string) => string;
  /** Fires `source.resolve` once per unseen id; failures fall back to the raw id. */
  ensureResolved: (
    propertyKey: string,
    source: FilterEntitySource | undefined,
    ids: ReadonlyArray<string>,
  ) => void;
}

const labelKey = (propertyKey: string, id: string) => `${propertyKey}::${id}`;

/**
 * `${propertyKey}::${id}` -> human readable label, e.g. a user UUID -> email.
 * State, not just a ref: PowerSearch recomputes its token strings only when
 * the `config` identity changes, which needs a re-render.
 */
export function useEntityLabelCache(): EntityLabelCache {
  'use memo';
  const [labels, setLabels] = useState<Record<string, string>>({});
  // Write-through mirror so writes within one tick accumulate and
  // `ensureResolved` never re-requests an id that just landed.
  const labelsRef = useRef<Record<string, string>>(labels);
  const requestedRef = useRef<Set<string>>(new Set());

  const merge = (entries: Record<string, string>) => {
    const next = { ...labelsRef.current, ...entries };
    if (_.isEqual(next, labelsRef.current)) return;
    labelsRef.current = next;
    setLabels(next);
  };

  const record = (propertyKey: string, id: string, label: string) => {
    if (_.isEmpty(id) || _.isEmpty(label)) return;
    merge({ [labelKey(propertyKey, id)]: label });
  };

  const recordMany = (
    propertyKey: string,
    entities: ReadonlyArray<FilterEntity>,
  ) => {
    const entries: Record<string, string> = {};
    _.forEach(entities, (entity) => {
      if (_.isEmpty(entity?.id) || _.isEmpty(entity?.label)) return;
      entries[labelKey(propertyKey, entity.id)] = entity.label;
    });
    if (_.isEmpty(entries)) return;
    merge(entries);
  };

  // State first so this closure changes identity when a label lands (that is
  // what repaints tokens); the mirror covers a cached closure holding an older
  // `labels` and writes not committed yet.
  const resolveLabel = (propertyKey: string, id: string) => {
    const key = labelKey(propertyKey, id);
    return labels[key] ?? labelsRef.current[key] ?? id;
  };

  const ensureResolved = (
    propertyKey: string,
    source: FilterEntitySource | undefined,
    ids: ReadonlyArray<string>,
  ) => {
    const resolve = source?.resolve;
    if (!resolve) return;
    const pending = _.filter(_.uniq(_.compact(ids)), (id) => {
      const key = labelKey(propertyKey, id);
      return !labelsRef.current[key] && !requestedRef.current.has(key);
    });
    if (_.isEmpty(pending)) return;
    // Marked before awaiting: StrictMode's double-invoke and a rejecting
    // resolver must not be able to loop.
    _.forEach(pending, (id) =>
      requestedRef.current.add(labelKey(propertyKey, id)),
    );
    Promise.resolve(resolve(pending))
      .then((entities) => recordMany(propertyKey, entities))
      .catch(() => {
        // Leave the raw-id fallback in place.
      });
  };

  return { record, recordMany, resolveLabel, ensureResolved };
}

type FilterEntityItem = SearchableItem<{ description?: string }>;

const toEntityItems = (
  entities: ReadonlyArray<FilterEntity> | undefined,
): Array<FilterEntityItem> =>
  _.map(entities, (entity) => ({
    id: entity.id,
    label: entity.label,
    auxiliaryData: { description: entity.description },
  }));

/** Multi values ride as a JSON array — Astryx stores custom values as strings. */
export const encodeEntityIds = (
  ids: ReadonlyArray<string>,
  isMulti: boolean,
): string | null =>
  isMulti ? JSON.stringify([...ids]) : (_.first(ids) ?? null);

/** Malformed input yields an empty selection rather than throwing. */
export const decodeEntityIds = (
  value: string | null | undefined,
  isMulti: boolean,
): Array<string> => {
  if (_.isNil(value) || value === '') return [];
  if (!isMulti) return [value];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!_.isArray(parsed)) return [];
    return _.filter(parsed, _.isString);
  } catch {
    return [];
  }
};

export interface BAIPowerSearchEntityEditorProps {
  /** Namespaces the label cache; the filter property this editor edits. */
  propertyKey: string;
  source: FilterEntitySource | undefined;
  labels: EntityLabelCache;
  /** List operators (`in` / `notIn`) get a Tokenizer, everything else a Typeahead. */
  isMulti: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

/**
 * Controlled editor behind a PowerSearch `custom` operator value: it stages the
 * picked id(s) and the popover's Apply commits them.
 */
export const BAIPowerSearchEntityEditor = ({
  propertyKey,
  source,
  labels,
  isMulti,
  value,
  onChange,
  placeholder,
  isDisabled,
}: BAIPowerSearchEntityEditorProps) => {
  'use memo';
  const { t } = useBAIi18n();

  // BaseTypeahead calls `searchSource.cancel()` from an effect keyed on the
  // source identity, so an unstable object would abort every in-flight search.
  const sourceRef = useRef<FilterEntitySource | undefined>(source);
  useEffect(() => {
    sourceRef.current = source;
  }, [source]);
  const [searchSource] = useState<SearchSource<FilterEntityItem>>(() => ({
    search: async (query: string) =>
      toEntityItems(await sourceRef.current?.search(query)),
    bootstrap: async () =>
      toEntityItems(await sourceRef.current?.bootstrap?.()),
    cancel: () => sourceRef.current?.cancel?.(),
  }));

  const selected: Array<FilterEntityItem> = _.map(
    decodeEntityIds(value, isMulti),
    (id) => ({ id, label: labels.resolveLabel(propertyKey, id) }),
  );

  const commonProps = {
    label: t('comp:BAIPowerSearchEntityEditor.SelectValue'),
    isLabelHidden: true,
    searchSource,
    placeholder: placeholder ?? t('comp:BAIPowerSearchEntityEditor.Search'),
    hasEntriesOnFocus: !_.isNil(source?.bootstrap),
    isDisabled,
    renderItem: (item: FilterEntityItem) => (
      <TypeaheadItem
        item={item}
        description={item.auxiliaryData?.description}
      />
    ),
  };

  if (isMulti) {
    return (
      <Tokenizer<FilterEntityItem>
        {...commonProps}
        value={selected}
        onChange={(items) => {
          labels.recordMany(propertyKey, items);
          onChange(encodeEntityIds(_.map(items, 'id'), true));
        }}
      />
    );
  }

  return (
    <Typeahead<FilterEntityItem>
      {...commonProps}
      value={_.first(selected) ?? null}
      // `PowerSearchValueEditor`'s CustomEditor drops `onChange(null)`, so a
      // staged single value cannot be cleared — do not offer a dead control.
      hasClear={false}
      onChange={(item) => {
        if (!item) {
          onChange(null);
          return;
        }
        labels.recordMany(propertyKey, [item]);
        onChange(item.id);
      }}
    />
  );
};

export interface EntityEditorsOptions {
  labels: EntityLabelCache;
}

export interface EntityEditors {
  /**
   * Returns the `custom` operator value for a property that supplies
   * `entitySource`, or `undefined` when it does not.
   */
  operatorValueFor: (
    propertyKey: string,
    source: FilterEntitySource | undefined,
    isMulti: boolean,
  ) => CustomOperatorValue | undefined;
}

type EditorProps = {
  isDisabled?: boolean;
  onChange: (value: string | null) => void;
  placeholder: string;
  value: string | null;
};

/** Builds (and caches) one `custom` operator value per `${key}::${arity}`. */
export function useEntityEditors({
  labels,
}: EntityEditorsOptions): EntityEditors {
  const latestRef = useRef<
    Record<
      string,
      { source: FilterEntitySource | undefined; labels: EntityLabelCache }
    >
  >({});
  const editorCacheRef = useRef<Map<string, CustomOperatorValue>>(new Map());

  const operatorValueFor = (
    propertyKey: string,
    source: FilterEntitySource | undefined,
    isMulti: boolean,
  ): CustomOperatorValue | undefined => {
    if (!source) return undefined;
    const cacheKey = `${propertyKey}::${isMulti ? 'multi' : 'single'}`;
    latestRef.current[cacheKey] = { source, labels };

    const cached = editorCacheRef.current.get(cacheKey);
    if (cached) return cached;

    const Editor: ComponentType<EditorProps> = ({
      onChange,
      value,
      isDisabled,
      placeholder,
    }) => {
      const latest = latestRef.current[cacheKey];
      return (
        <BAIPowerSearchEntityEditor
          propertyKey={propertyKey}
          source={latest?.source}
          labels={latest?.labels ?? labels}
          isMulti={isMulti}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          isDisabled={isDisabled}
        />
      );
    };
    Editor.displayName = `BAIPropertyFilterEntity(${cacheKey})`;

    const operatorValue: CustomOperatorValue = {
      type: 'custom',
      Editor,
      getString: (value: string) => {
        const cache = latestRef.current[cacheKey]?.labels ?? labels;
        const ids = decodeEntityIds(value, isMulti);
        if (_.isEmpty(ids)) return value;
        return _.join(
          _.map(ids, (id) => cache.resolveLabel(propertyKey, id)),
          ', ',
        );
      },
    };
    editorCacheRef.current.set(cacheKey, operatorValue);
    return operatorValue;
  };

  return { operatorValueFor };
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

    const Editor: ComponentType<EditorProps> = ({
      onChange,
      value,
      isDisabled,
    }) => {
      const render = latestRenderInputRef.current[propertyKey];
      return (
        // The consumer's control may open a floating layer of its own; keep
        // pointer events inside so the popover's light dismiss does not fire
        // while the user is picking an option.
        <div
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {render?.({
            value,
            isDisabled,
            onAddCondition: (committed, label) => {
              // Truthy guard: an empty label would blank the token.
              if (committed != null && label) {
                recordLabel(propertyKey, committed, label);
              }
              onChange(committed ?? null);
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
   *
   * @deprecated FR-3588 — Power search shows no result count. Kept only so the
   * published API stays source-compatible; drop it in the next major.
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
