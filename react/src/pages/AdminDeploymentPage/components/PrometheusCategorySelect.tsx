/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PrometheusCategorySelectQuery } from '../../../__generated__/PrometheusCategorySelectQuery.graphql';
import { BAISelect, BAISelectProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface PrometheusCategorySelectProps extends Omit<
  BAISelectProps,
  'options'
> {
  /** The chosen category, or `undefined` after a clear. */
  onSelectCategory?: (
    category: { id: string; name: string } | undefined,
  ) => void;
}

/**
 * Category picker for the Prometheus query preset editor. It suspends until the
 * category list resolves, so the caller owns the `<Suspense>` boundary; props
 * override its defaults (clearable, placeholder).
 */
const PrometheusCategorySelect: React.FC<PrometheusCategorySelectProps> = ({
  onSelectCategory,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const { prometheusQueryPresetCategories } =
    useLazyLoadQuery<PrometheusCategorySelectQuery>(
      graphql`
        query PrometheusCategorySelectQuery {
          prometheusQueryPresetCategories {
            id
            name
          }
        }
      `,
      {},
    );

  // The list query may legitimately return an empty array in dev environments
  // where no categories are seeded; the form must still submit fine with
  // categoryId left null.
  const options = _.map(prometheusQueryPresetCategories ?? [], (category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <BAISelect
      hasClear
      placeholder={t('prometheusQueryPreset.NoCategory')}
      options={options}
      {...props}
      onChange={(next) => {
        props.onChange?.(next);
        onSelectCategory?.(
          _.find(prometheusQueryPresetCategories, { id: next ?? '' }),
        );
      }}
    />
  );
};

export default PrometheusCategorySelect;
