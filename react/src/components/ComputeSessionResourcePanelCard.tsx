import { useUpdatableState } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAICard, { BAICardProps } from './BAICard';
import Flex from './Flex';
import ResourceGroupSelect from './ResourceGroupSelect';
import ResourceGroupSelectForCurrentProject from './ResourceGroupSelectForCurrentProject';
import { ComputeSessionResourcePanelCardQuery } from './__generated__/ComputeSessionResourcePanelCardQuery.graphql';
import { SyncOutlined } from '@ant-design/icons';
import { Button, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useDeferredValue, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface ComputeSessionResourcePanelCardProps extends BAICardProps {}

const ComputeSessionResourcePanelCard: React.FC<
  ComputeSessionResourcePanelCardProps
> = ({ ...baiCardProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentProject = useCurrentProjectValue();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial');
  const [selectedResourceGroup, setSelectedResourceGroup] = useState();
  const deferredSelectedResourceGroup = useDeferredValue(selectedResourceGroup);

  const [isPendingRefresh, startRefreshTransition] = useTransition();

  const { scaling_group } =
    useLazyLoadQuery<ComputeSessionResourcePanelCardQuery>(
      graphql`
        query ComputeSessionResourcePanelCardQuery($name: String) {
          scaling_group(name: $name) {
            name
            agent_total_resource_slots_by_status @since(version: "24.03.7")
          }
        }
      `,
      {
        name: selectedResourceGroup,
      },
      {
        fetchKey,
      },
    );
  console.log(scaling_group, selectedResourceGroup);

  return (
    <BAICard
      {...baiCardProps}
      title={t('session.AllocatedResources')}
      extra={
        <Flex gap="xs">
          <ResourceGroupSelectForCurrentProject
            showSearch
            onChange={(v) => setSelectedResourceGroup(v)}
            loading={selectedResourceGroup !== deferredSelectedResourceGroup}
            popupMatchSelectWidth={false}
            style={{
              minWidth: 100,
            }}
          />
          <Button
            type="link"
            icon={<SyncOutlined />}
            style={{ color: token.colorSuccess }}
            onClick={() => {
              startRefreshTransition(() => {
                updateFetchKey();
              });
            }}
          />
        </Flex>
      }
    ></BAICard>
  );
};

export default ComputeSessionResourcePanelCard;
