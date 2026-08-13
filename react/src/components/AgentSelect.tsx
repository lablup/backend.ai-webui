/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Phase 3 (wave 2 A) — rebuilt on `BAIComplexSelect` (ticket 26).

 MAPPING §3.1 routes this call site to `ComplexSelector`, not `Selector`: the
 source is a Relay-backed connection with SERVER-side search and rich (icon)
 option rows, and Astryx's `Selector` mounts every option into the DOM even
 while closed. `BAIComplexSelect` is the repo's single implementation of that
 popup, so this wrapper only maps agents to options and back.

 FRONTIER: the PUBLIC prop surface stays antd-shaped — plain `string` /
 `string[]` values, `mode="multiple"`, and the `labelRender` /
 `fallbackToAuto` props the single consumer (`ResourceAllocationFormItems`,
 inside `Form.Item name="agent"`) passes today. `labelInValue` lives strictly
 between this file and `BAIComplexSelect`, exactly as the 19 wrappers flipped
 in wave 1 do, so the form's stored value and the launcher's mutation payload
 are unchanged.

 PILOT-DECISIONs:
  - `labelRender` becomes a NO-OP prop. It existed to force the TRIGGER to show
    the agent id rather than the rich option node; `BAIComplexSelect` reads the
    trigger text from the value's `label`, which IS the agent id (P26-3
    requires a string label), so the override has nothing left to do. Kept in
    the interface rather than edited out of the consumer (frontier rule).
  - The per-option resource figures (`BAIResourceNumberWithIcon` ×N) move from
    the antd `label` ReactNode to `BAIComplexSelect`'s `extra` slot — the
    split P26-3 prescribes: `label` is the string, rich content goes beside it.
  - `allowClear` is not offered (P26-8); the field always holds a value, and
    `fallbackToAuto` is what resets it.
*/
import { AgentSelectQuery } from '../__generated__/AgentSelectQuery.graphql';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import {
  BAIComplexSelect,
  BAIFlex,
  BAIResourceNumberWithIcon,
  filterOutEmpty,
  mergeFilterValues,
  type BAIComplexSelectOption,
  type BAIComplexSelectValue,
  type BAILabeledValue,
  useControllableValue,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props {
  fallbackToAuto?: boolean;
  fetchKey?: string;
  resourceGroup?: string | null;
  /** Injected by `Form.Item`, or controlled by the caller. */
  value?: string | Array<string>;
  defaultValue?: string | Array<string>;
  onChange?: (value: string | Array<string> | undefined) => void;
  /** antd `Select mode`; only `"multiple"` is used by the live call site. */
  mode?: 'multiple' | 'tags';
  /** Accessible name. Hidden by default — a `Form.Item` prints the label. */
  label?: string;
  isLabelHidden?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Accepted and ignored — see the PILOT-DECISION in the header. The signature
   * mirrors antd's so the consumer's inline callback still type-checks.
   */
  labelRender?: (props: {
    label?: React.ReactNode;
    value?: string | number | null;
  }) => React.ReactNode;
}

const AgentSelect: React.FC<Props> = ({
  fetchKey,
  resourceGroup,
  fallbackToAuto,
  mode,
  label,
  isLabelHidden = true,
  placeholder,
  disabled,
  labelRender: _labelRender,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [value, setValue] = useControllableValue<
    string | Array<string> | undefined
  >(selectProps);
  const [searchStr, setSearchStr] = useState<string>('');
  const deferredSearchStr = useDeferredValue(searchStr);
  const multiple = mode === 'multiple';

  const { baiPaginationOption } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 50,
  });

  const { agent_summary_list } = useLazyLoadQuery<AgentSelectQuery>(
    graphql`
      query AgentSelectQuery(
        $limit: Int!
        $offset: Int!
        $status: String
        $filter: String
        $scaling_group: String
      ) {
        agent_summary_list(
          limit: $limit
          offset: $offset
          status: $status
          filter: $filter
          scaling_group: $scaling_group
        ) {
          items {
            id
            status
            schedulable
            available_slots
            occupied_slots
            architecture
          }
          total_count
        }
      }
    `,
    {
      limit: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
      status: 'ALIVE',
      filter: mergeFilterValues([
        'schedulable is true',
        deferredSearchStr ? `id ilike "%${deferredSearchStr}%"` : null,
      ]),
      scaling_group: resourceGroup,
    },
    {
      fetchPolicy: 'network-only',
      fetchKey,
    },
  );

  const agentOptions: Array<BAIComplexSelectOption> = _.compact(
    _.map(agent_summary_list?.items, (agent) => {
      if (!agent?.id) return null;
      const availableSlotsInfo: {
        [key in string]: string;
      } = JSON.parse(agent?.available_slots ?? '{}');
      const occupiedSlotsInfo: {
        [key in string]: string;
      } = JSON.parse(agent?.occupied_slots ?? '{}');
      const remainingSlotsInfo: {
        [key in string]: number;
      } = _.mapValues(availableSlotsInfo, (value, key) => {
        if (key.endsWith('.shares')) {
          return parseFloat(value) - parseFloat(occupiedSlotsInfo[key] ?? 0);
        } else {
          return parseInt(value) - parseInt(occupiedSlotsInfo[key] ?? 0);
        }
      });

      return {
        // P26-3: the label is the string that fills the trigger, the
        // accessible name and the live region; the figures go in `extra`.
        label: agent.id,
        value: agent.id,
        extra: (
          <BAIFlex direction="row" gap={'xxs'}>
            {_.map(remainingSlotsInfo, (slot, key) => {
              return (
                <BAIResourceNumberWithIcon
                  key={key}
                  // @ts-ignore
                  type={key}
                  value={slot.toString()}
                  hideTooltip
                />
              );
            })}
          </BAIFlex>
        ),
      };
    }),
  );

  const autoSelectIfMatch = _.includes(
    _.toLower(t('session.launcher.AutoSelect')),
    _.toLower(deferredSearchStr) ?? '',
  )
    ? { label: t('session.launcher.AutoSelect'), value: 'auto' }
    : undefined;

  const options = filterOutEmpty([autoSelectIfMatch, ...agentOptions]);

  const changeToAutoWhenInvalidValueEffectEvent = useEffectEvent(() => {
    // skip while searching
    if (_.isEmpty(searchStr) && fallbackToAuto && value) {
      const valueArray = _.castArray(value);
      const validValues = agentOptions.map((option) => option.value);
      const newValue = valueArray.filter((v) =>
        validValues.includes(v as string),
      );
      if (!_.isEqual(valueArray, newValue)) {
        setValue('auto');
      }
    }
  });

  useEffect(() => {
    changeToAutoWhenInvalidValueEffectEvent();
  }, [value, agentOptions]);

  // Plain keys -> `labelInValue` for the popup. The label is resolved from the
  // loaded options when possible and falls back to the key itself, which is
  // correct here because an agent's key IS its display name.
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(
      _.compact(_.castArray(value ?? [])),
      (key) => ({
        label:
          key === 'auto'
            ? t('session.launcher.AutoSelect')
            : (_.find(options, (option) => option.value === key)?.label ?? key),
        value: key,
      }),
    );
    return multiple ? labeled : (labeled[0] ?? null);
  })();

  return (
    <BAIComplexSelect
      label={label ?? t('session.launcher.SelectAgent')}
      isLabelHidden={isLabelHidden}
      placeholder={placeholder}
      isDisabled={disabled}
      multiple={multiple}
      isLoading={searchStr !== deferredSearchStr}
      searchValue={searchStr}
      onSearch={setSearchStr}
      total={agent_summary_list?.total_count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        let keys = _.map(_.compact(_.castArray(next ?? [])), (v) => v.value);
        if (multiple) {
          // "auto" is exclusive: selecting it clears the rest, and selecting a
          // real agent while "auto" leads drops "auto". Same rule the antd
          // implementation enforced in its `onChange`.
          if (_.last(keys) === 'auto' || keys.length === 0) {
            keys = ['auto'];
          } else if (keys[0] === 'auto' && keys.length > 1) {
            keys = keys.slice(1);
          }
        }
        setValue(multiple ? keys : keys[0], undefined);
      }}
    />
  );
};

export default AgentSelect;
