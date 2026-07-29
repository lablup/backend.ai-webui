/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AllResourceGroupSelectQuery } from '../__generated__/AllResourceGroupSelectQuery.graphql';
import TextHighlighter from './TextHighlighter';
import { useControllableValue } from 'ahooks';
import { BAISelect, BAISelectProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useEffect, useEffectEvent, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface AllResourceGroupSelectProps extends Omit<BAISelectProps, 'options'> {
  /**
   * When no value is selected yet, automatically select the first resource
   * group (fires `onChange`) so consumers always have a valid value.
   */
  autoSelectFirst?: boolean;
  fetchKey?: string;
}

/**
 * Resource group select listing ALL resource groups (superadmin view) via the
 * root `scaling_groups` GraphQL field, independent of any project.
 *
 * Unlike `SharedResourceGroupSelectForCurrentProject`, this component does not
 * read the ambient current-project state; selection is fully controlled by the
 * parent through `value`/`onChange`.
 */
const AllResourceGroupSelect: React.FC<AllResourceGroupSelectProps> = ({
  autoSelectFirst,
  fetchKey,
  showSearch,
  ...selectProps
}) => {
  'use memo';

  const [value, setValue] = useControllableValue<string | undefined>(
    selectProps,
  );
  const [searchValue, setSearchValue] = useState<string>();

  const { scaling_groups } = useLazyLoadQuery<AllResourceGroupSelectQuery>(
    graphql`
      query AllResourceGroupSelectQuery($is_active: Boolean) {
        scaling_groups(is_active: $is_active) {
          name
        }
      }
    `,
    {
      is_active: true,
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey,
    },
  );

  const resourceGroupNames = _.compact(
    _.map(scaling_groups, (resourceGroup) => resourceGroup?.name),
  );

  const autoSelectFirstEffectEvent = useEffectEvent(() => {
    if (autoSelectFirst && _.isEmpty(value) && !_.isEmpty(resourceGroupNames)) {
      setValue(resourceGroupNames[0]);
    }
  });
  useEffect(() => {
    autoSelectFirstEffectEvent();
  }, [value, resourceGroupNames]);

  return (
    <BAISelect
      options={_.map(resourceGroupNames, (name) => ({
        value: name,
        label: name,
      }))}
      optionRender={(option) => (
        <TextHighlighter keyword={searchValue}>
          {option.data.value?.toString()}
        </TextHighlighter>
      )}
      showSearch={
        showSearch
          ? {
              searchValue,
              onSearch: setSearchValue,
            }
          : undefined
      }
      {...selectProps}
      value={value}
      onChange={(nextValue, option) => {
        setValue(nextValue, option);
      }}
    />
  );
};

export default AllResourceGroupSelect;
