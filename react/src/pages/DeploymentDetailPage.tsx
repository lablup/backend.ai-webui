import AccessTokenList from '../components/AccessTokenList';
import ActiveRevisionSettingModal from '../components/ActiveRevisionSettingModal';
import DeploymentRevisionList from '../components/DeploymentRevisionList';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Descriptions, Tag, Tooltip, Typography } from 'antd';
import type { DescriptionsProps } from 'antd';
import { BAICard, BAIFlex, filterOutNullAndUndefined } from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import {
  DeploymentDetailPageQuery,
  DeploymentDetailPageQuery$data,
} from 'src/__generated__/DeploymentDetailPageQuery.graphql';
import DeploymentTokenGenerationModal from 'src/components/DeploymentTokenGenerationModal';
import RevisionCreationModal from 'src/components/RevisionCreationModal';
import { useFetchKey } from 'src/hooks';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const tabParam = withDefault(StringParam, 'revisionHistory');

type RevisionNodeType = NonNullableNodeOnEdges<
  NonNullable<DeploymentDetailPageQuery$data['deployment']>['revisionHistory']
>;

const DeploymentDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { deploymentId } = useParams<{ deploymentId: string }>();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [selectedRevision, setSelectedRevision] =
    useState<RevisionNodeType | null>(null);
  const [revisionToSetActive, setRevisionToSetActive] =
    useState<RevisionNodeType | null>(null);
  const [isRevisionCreationModalOpen, { toggle: toggleRevisionCreationModal }] =
    useToggle();
  const [isTokenGenerationModalOpen, { toggle: toggleTokenGenerationModal }] =
    useToggle();
  const [
    isActiveRevisionSettingModalOpen,
    { toggle: toggleActiveRevisionSettingModal },
  ] = useToggle();

  const { deployment } = useLazyLoadQuery<DeploymentDetailPageQuery>(
    graphql`
      query DeploymentDetailPageQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          id
          metadata {
            name
            status
            createdAt
            tags
          }
          networkAccess {
            endpointUrl
            openToPublic
            accessTokens {
              edges {
                node {
                  ...AccessTokenListFragment
                }
              }
            }
          }
          defaultDeploymentStrategy {
            type
          }
          revision {
            id
            name
            # image {
            #   ...ImageNodeSimpleTagFragment
            # }
            modelRuntimeConfig {
              runtimeVariant
              inferenceRuntimeConfig
              environ
            }
            createdAt
          }
          replicaState {
            desiredReplicaCount
            # replicas {
            #   edges {
            #     node {
            #       routings {
            #         ...DeploymentRoutingTableFragment
            #       }
            #     }
            #   }
            # }
          }
          revision {
            id
          }
          revisionHistory {
            edges {
              node {
                id
                name
                ...DeploymentRevisionListFragment
                ...RevisionCreationModalFragment
                ...ActiveRevisionSettingModalFragment
              }
            }
          }
          createdUser {
            email
          }
        }
      }
    `,
    { deploymentId: deploymentId || '' },
    { fetchKey: fetchKey || undefined, fetchPolicy: 'store-and-network' },
  );

  const deploymentInfoItems: DescriptionsProps['items'] = [
    {
      key: 'name',
      label: t('deployment.DeploymentName'),
      children: deployment?.metadata.name,
    },
    {
      key: 'tags',
      label: t('deployment.Tags'),
      span: 2,
      children: _.isEmpty(deployment?.metadata.tags) ? (
        '-'
      ) : (
        <BAIFlex gap={'xxs'} wrap="wrap">
          {_.map(deployment?.metadata.tags, (tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </BAIFlex>
      ),
    },
    {
      key: 'status',
      label: t('deployment.Status'),
      children: deployment?.metadata.status,
    },
    {
      key: 'createdAt',
      label: t('deployment.CreatedAt'),
      children: dayjs(deployment?.metadata.createdAt).format('LLL'),
    },
    {
      key: 'defaultDeploymentStrategy',
      label: t('deployment.DefaultDeploymentStrategy'),
      children: deployment?.defaultDeploymentStrategy.type,
    },
    {
      key: 'createdBy',
      label: t('deployment.CreatedBy'),
      children: (
        <Typography.Text copyable={!!deployment?.createdUser?.email}>
          {deployment?.createdUser?.email || '-'}
        </Typography.Text>
      ),
    },
    {
      key: 'endpointUrl',
      label: t('deployment.EndpointURL'),
      children: (
        <Typography.Text copyable={!!deployment?.networkAccess?.endpointUrl}>
          {deployment?.networkAccess?.endpointUrl || '-'}
        </Typography.Text>
      ),
    },
    {
      key: 'public',
      label: t('deployment.Public'),
      children: deployment?.networkAccess?.openToPublic ? 'Yes' : 'No',
    },
    {
      key: 'replicaCount',
      label: t('deployment.NumberOfDesiredReplicas'),
      children: deployment?.replicaState?.desiredReplicaCount || '-',
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      {/* Header with title and refresh button */}
      <BAIFlex direction="row" justify="between">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {deployment?.metadata?.name || ''}
        </Typography.Title>
        <BAIFlex gap={'xxs'}>
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={isPendingRefetch}
              icon={<ReloadOutlined />}
              onClick={() => {
                startRefetchTransition(() => {
                  updateFetchKey();
                });
              }}
            />
          </Tooltip>
        </BAIFlex>
      </BAIFlex>

      {/* Deployment Info Card */}
      <BAICard title={t('deployment.DeploymentInfo')}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
          items={deploymentInfoItems}
        />
      </BAICard>

      {/* Tabbed Detail Card */}
      <BAICard
        activeTabKey={curTabKey}
        onTabChange={setCurTabKey}
        tabList={[
          {
            key: 'revisionHistory',
            label: t('deployment.RevisionHistory'),
          },
          {
            key: 'accessTokens',
            label: t('deployment.AccessTokens'),
          },
          {
            key: 'autoScalingRules',
            label: t('deployment.AutoScalingRules'),
          },
          {
            key: 'routes',
            label: t('deployment.RoutesInfo'),
          },
        ]}
      >
        <Suspense
          fallback={
            <FlexActivityIndicator
              style={{ height: 'calc(100vh - 145px)' }}
              spinSize="large"
            />
          }
        >
          {curTabKey === 'revisionHistory' && (
            <BAIFlex direction="column" align="stretch" gap="sm">
              <BAIFlex direction="row" justify="end">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    toggleRevisionCreationModal();
                  }}
                >
                  {t('deployment.CreateRevision')}
                </Button>
              </BAIFlex>
              <DeploymentRevisionList
                activeRevisionId={deployment?.revision?.id || ''}
                revisionsFrgmt={_.map(
                  deployment?.revisionHistory?.edges,
                  (edge) => edge.node,
                )}
                onRevisionSelect={(revision, action) => {
                  const foundRevision =
                    _.find(
                      deployment?.revisionHistory?.edges,
                      (edge) => edge.node.id === revision.id,
                    )?.node || null;

                  if (action === 'createFrom') {
                    setSelectedRevision(foundRevision);
                    toggleRevisionCreationModal();
                  } else if (action === 'setActive') {
                    setRevisionToSetActive(foundRevision);
                    toggleActiveRevisionSettingModal();
                  }
                }}
              />
            </BAIFlex>
          )}
          {curTabKey === 'accessTokens' && (
            <BAIFlex direction="column" align="stretch" gap="sm">
              <BAIFlex direction="row" justify="end">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    toggleTokenGenerationModal();
                  }}
                >
                  {t('deployment.GenerateToken')}
                </Button>
              </BAIFlex>
              <BAIFlex direction="column" align="stretch" gap="sm">
                <AccessTokenList
                  accessTokensFrgmt={filterOutNullAndUndefined(
                    _.map(
                      deployment?.networkAccess?.accessTokens?.edges,
                      (edge) => edge.node,
                    ),
                  )}
                />
              </BAIFlex>
            </BAIFlex>
          )}
          {curTabKey === 'autoScalingRules' && (
            <div>TODO: implement table or description</div>
          )}
          {curTabKey === 'routes' && (
            <div>TODO: implement replica state management UI</div>
          )}
        </Suspense>
      </BAICard>
      <Suspense>
        <RevisionCreationModal
          open={isRevisionCreationModalOpen && !!deploymentId}
          deploymentId={deploymentId || ''}
          revisionFrgmt={selectedRevision}
          onRequestClose={(success) => {
            if (success) {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }
            setSelectedRevision(null);
            toggleRevisionCreationModal();
          }}
        />
      </Suspense>
      <Suspense>
        <ActiveRevisionSettingModal
          open={isActiveRevisionSettingModalOpen && !!deploymentId}
          deploymentId={deploymentId || ''}
          revisionFrgmt={revisionToSetActive}
          onRequestClose={(success) => {
            if (success) {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }
            setRevisionToSetActive(null);
            toggleActiveRevisionSettingModal();
          }}
        />
      </Suspense>
      <DeploymentTokenGenerationModal
        open={isTokenGenerationModalOpen && !!deploymentId}
        deploymentId={deploymentId || ''}
        onRequestClose={(success) => {
          if (success) {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }
          toggleTokenGenerationModal();
        }}
      />
    </BAIFlex>
  );
};

export default DeploymentDetailPage;
