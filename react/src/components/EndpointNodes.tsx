/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  EndpointNodesFragment$data,
  EndpointNodesFragment$key,
} from '../__generated__/EndpointNodesFragment.graphql';
import EndpointStatusTag from './EndpointStatusTag';
import ImageNodeSimpleTag from './ImageNodeSimpleTag';
import { PushpinFilled, PushpinOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import {
  BAIColumnType,
  BAIFlex,
  BAILink,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type EndpointNodeInList = NonNullable<
  EndpointNodesFragment$data[number]
>;

interface EndpointNodesProps extends Omit<
  BAITableProps<EndpointNodeInList>,
  'dataSource' | 'columns'
> {
  endpointsFrgmt: EndpointNodesFragment$key;
  onClickEndpointName?: (endpoint: EndpointNodeInList) => void;
  pinnedIds?: string[];
  onTogglePin?: (endpointId: string) => void;
}

const EndpointNodes: React.FC<EndpointNodesProps> = ({
  endpointsFrgmt,
  onClickEndpointName,
  pinnedIds = [],
  onTogglePin,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const endpoints = useFragment(
    graphql`
      fragment EndpointNodesFragment on Endpoint @relay(plural: true) {
        endpoint_id
        name
        status
        created_at
        resource_slots
        resource_group
        replicas @since(version: "24.12.0")
        image_object @since(version: "23.09.9") {
          ...ImageNodeSimpleTagFragment
        }
        runtime_variant @since(version: "24.03.5") {
          name
          human_readable_name
        }
        ...EndpointStatusTagFragment
      }
    `,
    endpointsFrgmt,
  );

  const filteredEndpoints = filterOutNullAndUndefined(endpoints);

  const columns = _.map(
    filterOutEmpty<BAIColumnType<EndpointNodeInList>>([
      {
        key: 'name',
        title: t('modelService.ServiceName'),
        dataIndex: 'name',
        render: (name: string, endpoint) => {
          return onClickEndpointName ? (
            <BAILink
              type="hover"
              onClick={() => {
                onClickEndpointName(endpoint);
              }}
            >
              {name}
            </BAILink>
          ) : (
            name
          );
        },
        fixed: 'left',
      },
      {
        key: 'image',
        title: t('modelService.Image'),
        render: (__, endpoint) => {
          return endpoint.image_object ? (
            <ImageNodeSimpleTag
              imageFrgmt={endpoint.image_object}
              copyable={false}
              withoutTag
            />
          ) : (
            '-'
          );
        },
      },
      {
        key: 'resources',
        title: t('modelService.Resources'),
        render: (__, endpoint) => {
          const slots = JSON.parse(endpoint.resource_slots || '{}');
          return (
            <BAIFlex gap={'xs'} wrap="wrap">
              {_.map(slots, (value: string, type) => (
                <BAIResourceNumberWithIcon
                  key={type}
                  type={type}
                  value={value}
                />
              ))}
            </BAIFlex>
          );
        },
      },
      {
        key: 'status',
        title: t('modelService.Status'),
        render: (__, endpoint) => {
          return <EndpointStatusTag endpointFrgmt={endpoint} />;
        },
      },
      onTogglePin
        ? {
            key: 'pin',
            title: '',
            width: 40,
            render: (__, endpoint) => {
              const isPinned = _.includes(pinnedIds, endpoint.endpoint_id);
              return (
                <Button
                  type="text"
                  size="small"
                  icon={isPinned ? <PushpinFilled /> : <PushpinOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (endpoint.endpoint_id) {
                      onTogglePin(endpoint.endpoint_id);
                    }
                  }}
                />
              );
            },
          }
        : undefined,
    ]),
    (column) => ({
      ...column,
      key: column.key,
    }),
  );

  return (
    <BAITable<EndpointNodeInList>
      rowKey="endpoint_id"
      dataSource={filteredEndpoints}
      columns={columns}
      pagination={false}
      size="small"
      {...tableProps}
    />
  );
};

export default EndpointNodes;
