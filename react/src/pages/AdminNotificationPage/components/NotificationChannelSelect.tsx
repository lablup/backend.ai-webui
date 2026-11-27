/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationChannelSelectPaginatedQuery } from '../../../__generated__/NotificationChannelSelectPaginatedQuery.graphql';
import { NotificationChannelSelectValueQuery } from '../../../__generated__/NotificationChannelSelectValueQuery.graphql';
import { useLazyPaginatedQuery } from '../../../hooks/usePaginatedQuery';
import {
  BAIComplexSelect,
  type BAIComplexSelectProps,
  useControllableValue,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type ChannelNode = NonNullable<
  NonNullable<
    NotificationChannelSelectPaginatedQuery['response']['adminNotificationChannels']
  >['edges'][number]
>['node'];

export interface NotificationChannelSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** The channel's UUID (`entityId`). */
  value?: string | null;
  onChange?: (value: string | undefined) => void;
}

/** Pages through every channel and searches them by name on the server. */
const NotificationChannelSelect: React.FC<NotificationChannelSelectProps> = ({
  isLoading,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [value, setValue] = useControllableValue<string | null | undefined>(
    selectProps as Record<string, unknown>,
  );
  const [open, setOpen] = useControllableValue<boolean>(
    selectProps as Record<string, unknown>,
    { valuePropName: 'open', trigger: 'onOpenChange' },
  );
  const deferredOpen = useDeferredValue(open);
  // Deferred so a pick never suspends the select out of its Form.Item mid-save.
  const deferredValue = useDeferredValue(value);
  const [searchStr, setSearchStr] = useState('');
  const deferredSearchStr = useDeferredValue(searchStr);

  const labelOf = (node: ChannelNode | null | undefined) =>
    node
      ? `${node.name} (${t(`externalNotification.channelTypes.${node.channelType}`)})`
      : undefined;

  // A chosen channel may sit on a page the popup has not loaded, so its name is read by id.
  const { adminNotificationChannels: selected } =
    useLazyLoadQuery<NotificationChannelSelectValueQuery>(
      graphql`
        query NotificationChannelSelectValueQuery(
          $filter: NotificationChannelFilter
          $skip: Boolean!
        ) {
          adminNotificationChannels(filter: $filter, limit: 1)
            @skip(if: $skip) {
            edges {
              node {
                id
                entityId
                name
                channelType
              }
            }
          }
        }
      `,
      {
        filter: deferredValue ? { entityId: { in: [deferredValue] } } : null,
        skip: !deferredValue,
      },
      { fetchPolicy: deferredValue ? 'store-or-network' : 'store-only' },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<NotificationChannelSelectPaginatedQuery, ChannelNode>(
      graphql`
        query NotificationChannelSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: NotificationChannelFilter
        ) {
          adminNotificationChannels(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                entityId
                name
                channelType
              }
            }
          }
        }
      `,
      { limit: 20 },
      {
        filter: deferredSearchStr
          ? { name: { iContains: deferredSearchStr } }
          : null,
      },
      { fetchPolicy: deferredOpen ? 'network-only' : 'store-only' },
      {
        getTotal: (r) => r.adminNotificationChannels?.count ?? undefined,
        getItem: (r) =>
          r.adminNotificationChannels?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.entityId,
      },
    );

  const selectedNode =
    _.find(paginationData, (node) => node?.entityId === value) ??
    _.find(selected?.edges, (edge) => edge?.node?.entityId === value)?.node;

  return (
    <BAIComplexSelect
      placeholder={t('externalNotification.SelectChannel')}
      {...selectProps}
      isLoading={
        isLoading ||
        (!!open && !deferredOpen) ||
        searchStr !== deferredSearchStr
      }
      isLoadingNext={isLoadingNext}
      total={result.adminNotificationChannels?.count ?? undefined}
      options={_.compact(
        _.map(paginationData, (node) =>
          node ? { value: node.entityId, label: labelOf(node) ?? '' } : null,
        ),
      )}
      value={value ? { value, label: labelOf(selectedNode) ?? value } : null}
      onChange={(next) => {
        const labeled = _.castArray(next ?? [])[0];
        setValue(labeled?.value);
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setOpen}
      endReached={loadNext}
    />
  );
};

export default NotificationChannelSelect;
