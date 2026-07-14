/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PrometheusCategorySelectQuery } from '../__generated__/PrometheusCategorySelectQuery.graphql';
import { BAISelect, BAISelectProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Category picker for the Prometheus query preset editor. Fetches the category
 * list itself via `useLazyLoadQuery`, so it suspends until the list resolves —
 * the caller owns the `<Suspense>` boundary (see `PrometheusQueryPresetEditorModal`)
 * so it can scope the fallback to just this field and keep the rest of the form
 * interactive. Control props injected by the enclosing `Form.Item` flow through
 * to the underlying select.
 */
const PrometheusCategorySelect: React.FC<BAISelectProps> = (props) => {
  'use memo';
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

  return <BAISelect options={options} {...props} />;
};

export default PrometheusCategorySelect;
