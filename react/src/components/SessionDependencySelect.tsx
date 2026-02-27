/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionDependencySelectQuery } from '../__generated__/SessionDependencySelectQuery.graphql';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useControllableValue } from 'ahooks';
import { Select, type SelectProps, Tag, Typography } from 'antd';
import { BAIFlex, filterOutNullAndUndefined, toLocalId } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface SessionDependencySelectProps extends Omit<
  SelectProps,
  'options' | 'mode'
> {
  fetchKey?: string;
}

const SESSION_STATUS_COLORS: Record<string, string> = {
  PENDING: 'gold',
  PREPARING: 'blue',
  RUNNING: 'green',
  PULLING: 'cyan',
};

// Sanitize user input for use in GraphQL filter strings to prevent filter injection.
// Strips characters that could break out of the ilike pattern context.
const sanitizeFilterInput = (input: string): string => {
  return input.replace(/[\\"%&|()[\]]/g, '');
};

const SessionDependencySelect: React.FC<SessionDependencySelectProps> = ({
  fetchKey,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [value, setValue] = useControllableValue(selectProps);
  const [searchStr, setSearchStr] = useState<string | undefined>(undefined);
  const deferredSearchStr = useDeferredValue(searchStr);
  const currentProject = useCurrentProjectValue();

  const sanitizedSearchStr = deferredSearchStr
    ? sanitizeFilterInput(deferredSearchStr)
    : undefined;

  const { compute_session_nodes } =
    useLazyLoadQuery<SessionDependencySelectQuery>(
      graphql`
        query SessionDependencySelectQuery(
          $scopeId: ScopeField
          $filter: String
          $first: Int
        ) {
          compute_session_nodes(
            scope_id: $scopeId
            filter: $filter
            first: $first
            order: "-created_at"
          ) {
            edges {
              node {
                id
                row_id
                name
                status
                type
              }
            }
          }
        }
      `,
      {
        scopeId: `project:${currentProject.id}`,
        filter: sanitizedSearchStr
          ? `(status in ["PENDING","PREPARING","RUNNING","PULLING"]) & (name ilike "%${sanitizedSearchStr}%")`
          : 'status in ["PENDING","PREPARING","RUNNING","PULLING"]',
        first: 30,
      },
      {
        fetchPolicy: 'network-only',
        fetchKey,
      },
    );

  const sessionOptions = filterOutNullAndUndefined(
    compute_session_nodes?.edges?.map((edge) => {
      const node = edge?.node;
      if (!node?.row_id || !node?.name) return null;
      const sessionId = toLocalId(node.id);
      return {
        label: (
          <BAIFlex direction="row" justify="between" gap="xs">
            <Typography.Text ellipsis style={{ flex: 1 }}>
              {node.name}
            </Typography.Text>
            <BAIFlex direction="row" gap="xxs">
              <Tag
                color={SESSION_STATUS_COLORS[node.status || ''] || 'default'}
              >
                {node.status}
              </Tag>
              {node.type && <Tag>{node.type}</Tag>}
            </BAIFlex>
          </BAIFlex>
        ),
        value: sessionId,
        searchValue: node.name,
      };
    }) ?? [],
  );

  return (
    <Select
      mode="multiple"
      loading={searchStr !== deferredSearchStr}
      showSearch={{
        searchValue: searchStr,
        onSearch: (v) => {
          setSearchStr(v);
        },
        filterOption: false,
      }}
      options={sessionOptions}
      optionFilterProp="searchValue"
      placeholder={t('session.launcher.SelectDependencySessions')}
      {...selectProps}
      onChange={(val, option) => {
        setValue(val, option);
      }}
      value={value}
    />
  );
};

export default SessionDependencySelect;
