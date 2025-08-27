import AccessTokenList from '../components/AccessTokenList';
import BAIConfirmModalWithInput from '../components/BAIConfirmModalWithInput';
import DeploymentRevisionList from '../components/DeploymentRevisionList';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import {
  CheckOutlined,
  CloseOutlined,
  DownOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  App,
  Button,
  Descriptions,
  Dropdown,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import {
  BAICard,
  BAIFlex,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ExternalLinkIcon } from 'lucide-react';
import { Suspense, useState, useTransition } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { useParams } from 'react-router-dom';
import { DeploymentDetailPageDeleteAutoScalingRuleMutation } from 'src/__generated__/DeploymentDetailPageDeleteAutoScalingRuleMutation.graphql';
import { DeploymentDetailPageDeleteMutation } from 'src/__generated__/DeploymentDetailPageDeleteMutation.graphql';
import {
  DeploymentDetailPageQuery,
  DeploymentDetailPageQuery$data,
} from 'src/__generated__/DeploymentDetailPageQuery.graphql';
import { DeploymentDetailPageSetActiveRevisionMutation } from 'src/__generated__/DeploymentDetailPageSetActiveRevisionMutation.graphql';
import { DeploymentDetailPageSyncReplicasMutation } from 'src/__generated__/DeploymentDetailPageSyncReplicasMutation.graphql';
import AutoScalingRuleList from 'src/components/AutoScalingRuleList';
import AutoScalingRuleSettingModal from 'src/components/AutoScalingRuleSettingModal';
import DeploymentModifyModal from 'src/components/DeploymentModifyModal';
import DeploymentTokenGenerationModal from 'src/components/DeploymentTokenGenerationModal';
import ReplicaList from 'src/components/ReplicaList';
import RevisionCreationModal from 'src/components/RevisionCreationModal';
import { useFetchKey } from 'src/hooks';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const tabParam = withDefault(StringParam, 'revisionHistory');

type RevisionNodeType = NonNullableNodeOnEdges<
  NonNullable<DeploymentDetailPageQuery$data['deployment']>['revisionHistory']
>;

type AutoScalingRuleNodeType = NonNullable<
  NonNullable<
    NonNullable<DeploymentDetailPageQuery$data['deployment']>['scalingRule']
  >['autoScalingRules']
>[number];

const DeploymentDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const { deploymentId } = useParams<{ deploymentId: string }>();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [selectedRevision, setSelectedRevision] =
    useState<RevisionNodeType | null>(null);
  const [selectedAutoScalingRule, setSelectedAutoScalingRule] =
    useState<AutoScalingRuleNodeType | null>(null);
  const [isRevisionCreationModalOpen, { toggle: toggleRevisionCreationModal }] =
    useToggle();
  const [isTokenGenerationModalOpen, { toggle: toggleTokenGenerationModal }] =
    useToggle();
  const [isModifyModalOpen, { toggle: toggleModifyModal }] = useToggle();
  const [isDeleteModalOpen, { toggle: toggleDeleteModal }] = useToggle();
  const [
    isSetAutoScalingRuleModalOpen,
    { toggle: toggleSetAutoScalingRuleModal },
  ] = useToggle();

  const { deployment } = useLazyLoadQuery<DeploymentDetailPageQuery>(
    graphql`
      query DeploymentDetailPageQuery($deploymentId: ID!) {
        deployment(id: $deploymentId) {
          id @required(action: THROW)
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
          replicaState {
            desiredReplicaCount
            replicas {
              edges {
                node {
                  id
                  ...ReplicaListFragment
                }
              }
            }
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
              }
            }
          }
          createdUser {
            email
          }
          scalingRule {
            autoScalingRules {
              id
              ...AutoScalingRuleListFragment
              ...AutoScalingRuleSettingModalFragment
            }
          }
          ...DeploymentModifyModalFragment
        }
      }
    `,
    { deploymentId: deploymentId || '' },
    { fetchKey: fetchKey || undefined, fetchPolicy: 'store-and-network' },
  );

  const [commitSetCurrentRevision, isInFlightSetCurrentRevision] =
    useMutation<DeploymentDetailPageSetActiveRevisionMutation>(graphql`
      mutation DeploymentDetailPageSetActiveRevisionMutation(
        $input: UpdateModelDeploymentInput!
      ) {
        updateModelDeployment(input: $input) {
          deployment {
            revision {
              id
            }
          }
        }
      }
    `);

  const [commitSyncReplicas, isInFlightSyncReplicas] =
    useMutation<DeploymentDetailPageSyncReplicasMutation>(graphql`
      mutation DeploymentDetailPageSyncReplicasMutation(
        $input: SyncReplicaInput!
      ) {
        syncReplicas(input: $input) {
          ... on SyncReplicaPayload {
            success
          }
        }
      }
    `);

  const [commitDeleteDeployment, isInFlightDeleteDeployment] =
    useMutation<DeploymentDetailPageDeleteMutation>(graphql`
      mutation DeploymentDetailPageDeleteMutation(
        $input: DeleteModelDeploymentInput!
      ) {
        deleteModelDeployment(input: $input) {
          deployment {
            id
          }
        }
      }
    `);

  const [commitDeleteAutoScalingRule, isInFlightDeleteAutoScalingRule] =
    useMutation<DeploymentDetailPageDeleteAutoScalingRuleMutation>(graphql`
      mutation DeploymentDetailPageDeleteAutoScalingRuleMutation(
        $input: DeleteAutoScalingRuleInput!
      ) {
        deleteAutoScalingRule(input: $input) {
          id
        }
      }
    `);

  const deploymentInfoItems: DescriptionsProps['items'] = [
    {
      key: 'name',
      label: t('deployment.DeploymentName'),
      children: deployment?.metadata.name,
    },
    {
      key: 'endpointUrl',
      label: t('deployment.EndpointURL'),
      children: deployment?.networkAccess?.endpointUrl ? (
        <BAIFlex gap={'xxs'}>
          <Typography.Text>
            {deployment?.networkAccess?.endpointUrl}
          </Typography.Text>
          <Typography.Text
            copyable={{ text: deployment?.networkAccess?.endpointUrl }}
          />
          <a
            href={deployment?.networkAccess?.endpointUrl}
            title=""
            target="_blank"
            rel="noopener noreferrer"
          >
            <Tooltip title={t('common.OpenInNewTab')}>
              <ExternalLinkIcon />
            </Tooltip>
          </a>
        </BAIFlex>
      ) : (
        '-'
      ),
    },
    {
      key: 'status',
      label: t('deployment.Status'),
      children: deployment?.metadata.status,
    },
    {
      key: 'tags',
      label: t('deployment.Tags'),
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
      key: 'replicaCount',
      label: t('deployment.NumberOfDesiredReplicas'),
      children: deployment?.replicaState?.desiredReplicaCount || '-',
    },
    {
      key: 'public',
      label: t('deployment.Public'),
      children: deployment?.networkAccess?.openToPublic ? (
        <CheckOutlined style={{ color: token.colorSuccess }} />
      ) : (
        <CloseOutlined style={{ color: token.colorTextSecondary }} />
      ),
    },
    {
      key: 'defaultDeploymentStrategy',
      label: t('deployment.DefaultDeploymentStrategy'),
      children: (
        <Tag
          color={
            deployment?.defaultDeploymentStrategy.type === 'ROLLING'
              ? 'default'
              : deployment?.defaultDeploymentStrategy.type === 'BLUE_GREEN'
                ? 'blue'
                : 'yellow'
          }
        >
          {deployment?.defaultDeploymentStrategy.type}
        </Tag>
      ),
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
      key: 'createdAt',
      label: t('deployment.CreatedAt'),
      children: dayjs(deployment?.metadata.createdAt).format('LLL'),
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      {/* Header with title and refresh button */}
      <BAIFlex direction="row" justify="between">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {deployment?.metadata?.name || ''}
        </Typography.Title>
        <BAIFlex gap={'xs'}>
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
          <Button
            onClick={() => {
              toggleModifyModal();
            }}
          >
            {t('button.Edit')}
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'delete',
                  label: t('button.Delete'),
                  onClick: () => {
                    toggleDeleteModal();
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <Button>
              <BAIFlex gap={'xxs'}>
                {t('button.Action')}
                <DownOutlined />
              </BAIFlex>
            </Button>
          </Dropdown>
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
            key: 'replicas',
            label: t('deployment.Replicas'),
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
                    if (!foundRevision?.id) {
                      message.error(t('message.FailedToUpdate'));
                      return;
                    }
                    modal.confirm({
                      title: t('deployment.SetAsActiveRevision'),
                      content: (
                        <Trans
                          i18nKey="deployment.ConfirmUpdateActiveRevision"
                          values={{ name: foundRevision?.name || '' }}
                        />
                      ),
                      okButtonProps: {
                        loading: isInFlightSetCurrentRevision,
                      },
                      onOk: () => {
                        commitSetCurrentRevision({
                          variables: {
                            input: {
                              activeRevisionId: toLocalId(foundRevision.id),
                              id: deploymentId || '',
                            },
                          },
                          onCompleted: (res, errors) => {
                            const resultID =
                              res?.updateModelDeployment?.deployment?.revision
                                ?.id;
                            if (
                              _.isEmpty(resultID) ||
                              resultID !== foundRevision.id
                            ) {
                              message.error(
                                t('deployment.launcher.DeploymentUpdateFailed'),
                              );
                              return;
                            }
                            if (errors && errors.length > 0) {
                              const errorMsgList = _.map(
                                errors,
                                (error) => error.message,
                              );
                              for (const error of errorMsgList) {
                                message.error(error);
                              }
                            } else {
                              message.success(t('message.SuccessfullyUpdated'));
                              startRefetchTransition(() => {
                                updateFetchKey();
                              });
                            }
                          },
                          onError: (err) => {
                            message.error(
                              err.message ||
                                t('deployment.launcher.DeploymentUpdateFailed'),
                            );
                          },
                        });
                      },
                    });
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
            <AutoScalingRuleList
              autoScalingRulesFrgmt={deployment?.scalingRule?.autoScalingRules}
              onRequestSettingAutoScalingRule={(record) => {
                if (record) {
                  setSelectedAutoScalingRule(
                    _.find(
                      deployment?.scalingRule?.autoScalingRules,
                      (rule) => rule.id === record.id,
                    ) || null,
                  );
                }
                toggleSetAutoScalingRuleModal();
              }}
              onRequestDelete={(record) => {
                if (!record?.id) {
                  message.error(
                    t('message.FailedToDelete', {
                      name: t('deployment.AutoScalingRule'),
                    }),
                  );
                  return;
                }
                modal.confirm({
                  title: t('deployment.DeleteAutoScalingRule'),
                  content: t('dialog.ask.DoYouWantToDeleteSomething', {
                    name: record?.metricName || t('deployment.AutoScalingRule'),
                  }),
                  okButtonProps: {
                    loading: isInFlightDeleteAutoScalingRule,
                    danger: true,
                  },
                  okText: t('button.Delete'),
                  onOk: () => {
                    commitDeleteAutoScalingRule({
                      variables: {
                        input: {
                          id: toLocalId(record.id),
                        },
                      },
                      onCompleted: (res, errors) => {
                        if (!res?.deleteAutoScalingRule?.id) {
                          message.error(
                            t('message.FailedToDelete', {
                              name: t('deployment.AutoScalingRule'),
                            }),
                          );
                          return;
                        }
                        if (errors && errors.length > 0) {
                          const errorMsgList = _.map(
                            errors,
                            (error) => error.message,
                          );
                          for (const error of errorMsgList) {
                            message.error(error);
                          }
                        } else {
                          message.success(
                            t('message.SuccessfullyDeleted', {
                              name: t('deployment.AutoScalingRule'),
                            }),
                          );
                          startRefetchTransition(() => {
                            updateFetchKey();
                          });
                        }
                      },
                      onError: (err) => {
                        message.error(
                          err.message ||
                            t('message.FailedToDelete', {
                              name: t('deployment.AutoScalingRule'),
                            }),
                        );
                      },
                    });
                  },
                });
              }}
            />
          )}
          {curTabKey === 'replicas' && (
            <BAIFlex direction="column" align="stretch" gap="sm">
              <BAIFlex direction="row" justify="end">
                <Button
                  type="primary"
                  loading={isInFlightSyncReplicas}
                  onClick={() => {
                    commitSyncReplicas({
                      variables: {
                        input: {
                          modelDeploymentId: deploymentId || '',
                        },
                      },
                      onCompleted: (res, errors) => {
                        if (res?.syncReplicas?.success !== true) {
                          message.error(t('deployment.SyncReplicasFailed'));
                          return;
                        }
                        if (errors && errors.length > 0) {
                          const errorMsgList = _.map(
                            errors,
                            (error) => error.message,
                          );
                          for (const error of errorMsgList) {
                            message.error(error);
                          }
                        } else {
                          message.success(
                            t('deployment.SyncReplicasRequested'),
                          );
                          startRefetchTransition(() => {
                            updateFetchKey();
                          });
                        }
                      },
                      onError: (err) => {
                        message.error(
                          err.message || t('deployment.SyncReplicasFailed'),
                        );
                      },
                    });
                  }}
                >
                  {t('deployment.SyncReplicas')}
                </Button>
              </BAIFlex>
              <BAIFlex direction="column" align="stretch" gap="sm">
                <ReplicaList
                  replicasFrgmt={filterOutNullAndUndefined(
                    _.map(
                      deployment?.replicaState?.replicas?.edges,
                      (edge) => edge.node,
                    ),
                  )}
                />
              </BAIFlex>
            </BAIFlex>
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

      <Suspense>
        <DeploymentModifyModal
          deploymentFrgmt={deployment}
          open={isModifyModalOpen}
          onRequestClose={(success) => {
            if (success) {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }
            toggleModifyModal();
          }}
        />
      </Suspense>
      <Suspense>
        <AutoScalingRuleSettingModal
          open={isSetAutoScalingRuleModalOpen}
          deploymentId={deploymentId}
          autoScalingRuleFrgmt={selectedAutoScalingRule}
          onRequestClose={(success) => {
            if (success) {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }
            setSelectedAutoScalingRule(null);
            toggleSetAutoScalingRuleModal();
          }}
        />
      </Suspense>
      <BAIConfirmModalWithInput
        open={isDeleteModalOpen}
        onOk={() => {
          commitDeleteDeployment({
            variables: {
              input: {
                id: deploymentId || '',
              },
            },
            onCompleted: (res, errors) => {
              if (!res?.deleteModelDeployment?.deployment?.id) {
                message.error(
                  t('message.FailedToDelete', {
                    name: t('deployment.AutoScalingRule'),
                  }),
                );
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
              } else {
                message.success(
                  t('message.SuccessfullyDeleted', {
                    name: t('deployment.AutoScalingRule'),
                  }),
                );
              }
            },
            onError: (err) => {
              message.error(
                err.message ||
                  t('message.FailedToDelete', {
                    name: t('deployment.AutoScalingRule'),
                  }),
              );
            },
          });
          toggleDeleteModal();
        }}
        onCancel={() => {
          toggleDeleteModal();
        }}
        confirmText={deployment?.metadata?.name ?? ''}
        content={
          <BAIFlex
            direction="column"
            gap="md"
            align="stretch"
            style={{ marginBottom: token.marginXS, width: '100%' }}
          >
            <Alert
              type="warning"
              message={t('dialog.warning.DeleteForeverDesc')}
              style={{ width: '100%' }}
            />
            <BAIFlex>
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('deployment.TypeDeploymentNameToDelete')}
              </Typography.Text>
              (
              <Typography.Text code>
                {deployment?.metadata?.name}
              </Typography.Text>
              )
            </BAIFlex>
          </BAIFlex>
        }
        title={t('deployment.DeleteDeployment')}
        okText={t('button.Delete')}
        okButtonProps={{
          loading: isInFlightDeleteDeployment,
        }}
      />
    </BAIFlex>
  );
};

export default DeploymentDetailPage;
