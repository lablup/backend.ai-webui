/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RecentServiceSpecsFragment$key } from '../__generated__/RecentServiceSpecsFragment.graphql';
import { convertToBinaryUnit } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import EndpointNodes, { EndpointNodeInList } from './EndpointNodes';
import { AUTOMATIC_DEFAULT_SHMEM } from './SessionFormItems/ResourceAllocationFormItems';
import { theme } from 'antd';
import {
  BAIFetchKeyButton,
  BAIBoardItemTitle,
  BAIFlex,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

export interface ServiceSpecFromEndpoint {
  resource: {
    cpu: number;
    mem?: string;
    shmem?: string;
    acceleratorType?: string;
    accelerator?: number;
  };
  resourceGroup?: string;
  replicas: number;
  environments: {
    environment?: string;
    version: string;
    image?: {
      name?: string | null;
      namespace?: string | null;
      humanized_name?: string | null;
      tag?: string | null;
      registry?: string | null;
      architecture?: string | null;
    } | null;
  };
  runtimeVariant?: string;
  allocationPreset: string;
  cluster_mode: 'single-node' | 'multi-node';
  cluster_size?: number;
}

interface RecentServiceSpecsProps {
  queryRef: RecentServiceSpecsFragment$key;
  isRefetching?: boolean;
  onSelectSpec: (spec: ServiceSpecFromEndpoint) => void;
}

const RecentServiceSpecs: React.FC<RecentServiceSpecsProps> = ({
  queryRef,
  isRefetching,
  onSelectSpec,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [pinnedIds, setPinnedIds] = useBAISettingUserState(
    'pinnedServiceEndpointIds',
  );

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment RecentServiceSpecsFragment on Query
      @argumentDefinitions(project: { type: "UUID" })
      @refetchable(queryName: "RecentServiceSpecsRefetchQuery") {
        endpoint_list(
          limit: 5
          offset: 0
          order: "-created_at"
          project: $project
          filter: "lifecycle_stage == \"created\""
        ) {
          items {
            endpoint_id
            name
            resource_slots
            resource_opts
            resource_group
            replicas @since(version: "24.12.0")
            desired_session_count @deprecatedSince(version: "24.12.0")
            cluster_mode
            cluster_size
            image_object @since(version: "23.09.9") {
              name @deprecatedSince(version: "24.12.0")
              namespace @since(version: "24.12.0")
              humanized_name
              tag
              registry
              architecture
            }
            runtime_variant @since(version: "24.03.5") {
              name
            }
            ...EndpointNodesFragment
          }
        }
      }
    `,
    queryRef,
  );

  const items = filterOutNullAndUndefined(data.endpoint_list?.items);

  // Sort: pinned first, then by original order (already -created_at from server)
  const currentPinnedIds = pinnedIds || [];
  // Auto-clean pinned IDs that are no longer in the list
  const validPinnedIds = currentPinnedIds.filter((id) =>
    items.some((item) => item.endpoint_id === id),
  );

  const sortedItems = _.sortBy(items, (item) =>
    _.includes(validPinnedIds, item.endpoint_id) ? 0 : 1,
  );

  const handleTogglePin = (endpointId: string) => {
    const current = pinnedIds || [];
    if (_.includes(current, endpointId)) {
      setPinnedIds(current.filter((id) => id !== endpointId));
    } else {
      setPinnedIds([...current, endpointId]);
    }
  };

  const getAIAcceleratorWithStringifiedKey = (resourceSlot: any) => {
    if (Object.keys(resourceSlot).length <= 0) {
      return undefined;
    }
    const keyName: string = Object.keys(resourceSlot)[0];
    return {
      acceleratorType: keyName,
      accelerator:
        typeof resourceSlot[keyName] === 'string'
          ? keyName === 'cuda.shares'
            ? parseFloat(resourceSlot[keyName])
            : parseInt(resourceSlot[keyName])
          : resourceSlot[keyName],
    };
  };

  const handleSelectEndpoint = (endpoint: EndpointNodeInList) => {
    // Find the full item from data (which has resource_slots, resource_opts, etc.)
    const fullItem = items.find(
      (item) => item.endpoint_id === endpoint.endpoint_id,
    );
    if (!fullItem) return;

    const resourceSlots = JSON.parse(fullItem.resource_slots || '{}');
    const resourceOpts = JSON.parse(fullItem.resource_opts || '{}');

    const spec: ServiceSpecFromEndpoint = {
      resource: {
        cpu: parseInt(resourceSlots.cpu),
        mem: convertToBinaryUnit(resourceSlots.mem, 'g', 3, true)?.value,
        shmem: convertToBinaryUnit(
          resourceOpts.shmem || AUTOMATIC_DEFAULT_SHMEM,
          'g',
          3,
          true,
        )?.value,
        ...getAIAcceleratorWithStringifiedKey(
          _.omit(resourceSlots, ['cpu', 'mem']),
        ),
      },
      resourceGroup: fullItem.resource_group ?? undefined,
      replicas: fullItem.replicas ?? fullItem.desired_session_count ?? 1,
      environments: {
        environment:
          (fullItem.image_object?.namespace ?? fullItem.image_object?.name) ||
          undefined,
        version: `${fullItem.image_object?.registry}/${fullItem.image_object?.namespace ?? fullItem.image_object?.name}:${fullItem.image_object?.tag}@${fullItem.image_object?.architecture}`,
        image: fullItem.image_object,
      },
      runtimeVariant: fullItem.runtime_variant?.name ?? undefined,
      allocationPreset: 'custom',
      cluster_mode:
        fullItem.cluster_mode === 'MULTI_NODE' ? 'multi-node' : 'single-node',
      cluster_size: fullItem.cluster_size ?? undefined,
    };

    onSelectSpec(spec);
  };

  if (items.length === 0) return null;

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingBottom: token.paddingMD,
      }}
    >
      <BAIBoardItemTitle
        title={t('modelService.RecentServices')}
        tooltip={t('modelService.RecentServicesTooltip', { count: 5 })}
        extra={
          <BAIFetchKeyButton
            size="small"
            loading={isPendingRefetch || isRefetching}
            value=""
            onChange={() => {
              startRefetchTransition(() => {
                refetch(
                  {},
                  {
                    fetchPolicy: 'network-only',
                  },
                );
              });
            }}
            type="text"
            style={{
              backgroundColor: 'transparent',
            }}
          />
        }
      />
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          maxHeight: 250,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <EndpointNodes
          endpointsFrgmt={sortedItems}
          onClickEndpointName={handleSelectEndpoint}
          pinnedIds={validPinnedIds}
          onTogglePin={handleTogglePin}
          style={{ overflowY: 'hidden' }}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default RecentServiceSpecs;
