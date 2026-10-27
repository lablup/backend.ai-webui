/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  ContainerRegistriesPanelQuery,
  ContainerRegistriesPanelQuery$data,
} from '../../../__generated__/ContainerRegistriesPanelQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import ScopedCard from '../cards/ScopedCard';
import type { PanelComponentProps } from '../types';
import { Token } from '@lablup/ui-common/Token';
import {
  BAIBooleanToken,
  BAITable,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type RegistryRow = NonNullable<
  NonNullable<
    NonNullable<
      ContainerRegistriesPanelQuery$data['registries']
    >['edges'][number]
  >['node']
>;

const RegistryList: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  const variables = {
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<ContainerRegistriesPanelQuery>(
    graphql`
      query ContainerRegistriesPanelQuery($limit: Int!, $offset: Int!) {
        registries: adminContainerRegistriesV2(
          orderBy: [{ field: REGISTRY_NAME, direction: ASC }]
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              registryName
              url
              type
              project
              isGlobal
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return (
    <BAITable<RegistryRow>
      size="small"
      rowKey="id"
      dataSource={filterOutNullAndUndefined(
        data.registries?.edges.map((edge) => edge?.node),
      )}
      loading={deferredVariables !== variables}
      scroll={{ x: 'max-content' }}
      columns={[
        {
          key: 'registryName',
          title: t('registry.Hostname'),
          render: (_value, row) => row.registryName,
        },
        {
          key: 'url',
          title: t('registry.RegistryURL'),
          render: (_value, row) => row.url,
        },
        {
          key: 'type',
          title: t('registry.Type'),
          render: (_value, row) => <Token label={row.type} />,
        },
        {
          key: 'project',
          title: t('registry.ProjectName'),
          render: (_value, row) => row.project ?? '-',
        },
        {
          key: 'isGlobal',
          title: t('dashboard.card.Global'),
          render: (_value, row) => <BAIBooleanToken value={!!row.isGlobal} />,
        },
      ]}
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        total: data.registries?.count ?? 0,
        onChange: (current, pageSize) =>
          setTablePaginationOption({ current, pageSize }),
      }}
    />
  );
};

/** The cluster's container registries. */
const ContainerRegistriesPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = { title: t('dashboard.card.ContainerRegistries') };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(_cardScope, key) => <RegistryList fetchKey={key} />}
    </ScopedCard>
  );
};

export default ContainerRegistriesPanel;
