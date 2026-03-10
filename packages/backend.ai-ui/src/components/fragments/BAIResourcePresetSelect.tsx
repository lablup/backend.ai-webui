/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIResourcePresetSelectQuery } from '../../__generated__/BAIResourcePresetSelectQuery.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIResourcePresetSelectProps extends Omit<
  BAISelectProps,
  'options'
> {}

const BAIResourcePresetSelect = ({
  ...selectProps
}: BAIResourcePresetSelectProps) => {
  'use memo';
  const { t } = useTranslation();
  const { resource_presets } = useLazyLoadQuery<BAIResourcePresetSelectQuery>(
    graphql`
      query BAIResourcePresetSelectQuery {
        resource_presets {
          name
        }
      }
    `,
    {},
    {},
  );

  return (
    <BAISelect
      showSearch
      filterOption={(input, option) =>
        (option?.label?.toString() ?? '')
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      placeholder={t('comp:BAIResourcePresetSelect.SelectResourcePreset')}
      options={_.map(_.sortBy(resource_presets, 'name'), (preset) => {
        return {
          label: preset?.name,
          value: preset?.name,
        };
      })}
      {...selectProps}
    />
  );
};

export default BAIResourcePresetSelect;
