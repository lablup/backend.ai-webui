/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupSettingModalAssociateDomainMutation } from '../__generated__/ResourceGroupSettingModalAssociateDomainMutation.graphql';
import { ResourceGroupSettingModalCreateMutation } from '../__generated__/ResourceGroupSettingModalCreateMutation.graphql';
import { ResourceGroupSettingModalFragment$key } from '../__generated__/ResourceGroupSettingModalFragment.graphql';
import { ResourceGroupSettingModalUpdateMutation } from '../__generated__/ResourceGroupSettingModalUpdateMutation.graphql';
import { newLineToBrElement } from '../helper';
import { useCurrentDomainValue } from '../hooks';
import { ScalingGroupOpts } from './ResourceGroupList';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  App,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  ModalProps,
  Row,
  Select,
  Skeleton,
  Switch,
  Tooltip,
  theme,
} from 'antd';
import {
  BAIModal,
  omitNullAndUndefinedFields,
  BAICard,
  BAIFlex,
  BAIDomainSelect,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Suspense, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type FormInputType = {
  name: string;
  domain: string;
  description: string;
  allowedSessionTypes: string[];
  wsProxyAddress: string;
  wsProxyAPIToken: string;
  active: boolean;
  public: boolean;
  scheduler: string;
  pendingTimeout: number;
  retriesToSkip: number;
};

interface ResourceGroupCreateModalProps extends ModalProps {
  resourceGroupFrgmt?: ResourceGroupSettingModalFragment$key | null | undefined;
  onRequestClose?: (success: boolean) => void;
}

const ResourceGroupSettingModal: React.FC<ResourceGroupCreateModalProps> = ({
  resourceGroupFrgmt,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const currentDomain = useCurrentDomainValue();
  const formRef = useRef<FormInstance>(null);

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupSettingModalFragment on ScalingGroup {
        name @required(action: NONE)
        description
        is_active
        is_public
        wsproxy_addr
        wsproxy_api_token
        scheduler
        scheduler_opts
      }
    `,
    resourceGroupFrgmt,
  );
  const [commitUpdateResourceGroup, isInFlightCommitUpdateResourceGroup] =
    useMutation<ResourceGroupSettingModalUpdateMutation>(graphql`
      mutation ResourceGroupSettingModalUpdateMutation(
        $name: String!
        $input: ModifyScalingGroupInput!
      ) {
        modify_scaling_group(name: $name, props: $input) {
          ok
          msg
        }
      }
    `);
  const [commitCreateResourceGroup, isInFlightCommitCreateResourceGroup] =
    useMutation<ResourceGroupSettingModalCreateMutation>(graphql`
      mutation ResourceGroupSettingModalCreateMutation(
        $name: String!
        $input: CreateScalingGroupInput!
      ) {
        create_scaling_group(name: $name, props: $input) {
          ok
          msg
        }
      }
    `);
  const [commitAssociateDomain, isInFlightCommitAssociateDomain] =
    useMutation<ResourceGroupSettingModalAssociateDomainMutation>(graphql`
      mutation ResourceGroupSettingModalAssociateDomainMutation(
        $domain: String!
        $scaling_group: String!
      ) {
        associate_scaling_group_with_domain(
          domain: $domain
          scaling_group: $scaling_group
        ) {
          ok
          msg
        }
      }
    `);

  const schedulerOpts: Partial<ScalingGroupOpts> = useMemo(
    () => JSON.parse(resourceGroup?.scheduler_opts || '{}'),
    [resourceGroup?.scheduler_opts],
  );

  const INITIAL_FORM_VALUES = omitNullAndUndefinedFields({
    name: resourceGroup?.name,
    description: resourceGroup?.description,
    domain: currentDomain,
    scheduler: resourceGroup?.scheduler ?? 'fifo',
    allowedSessionTypes: schedulerOpts?.allowed_session_types ?? [
      'batch',
      'interactive',
    ],
    active: resourceGroup?.is_active ?? true,
    public: resourceGroup?.is_public ?? true,
    pendingTimeout: schedulerOpts?.pending_timeout
      ? _.toNumber(schedulerOpts?.pending_timeout)
      : null,
    retriesToSkip: schedulerOpts?.config?.num_retries_to_skip
      ? _.toNumber(schedulerOpts?.config?.num_retries_to_skip)
      : null,
    wsProxyAddress: resourceGroup?.wsproxy_addr,
    wsProxyAPIToken: resourceGroup?.wsproxy_api_token,
  });

  return (
    <BAIModal
      destroyOnHidden
      title={
        resourceGroup
          ? t('resourceGroup.ModifyResourceGroup')
          : t('resourceGroup.CreateResourceGroup')
      }
      onCancel={() => {
        onRequestClose?.(false);
      }}
      okText={resourceGroup ? t('button.Update') : t('button.Create')}
      okButtonProps={{
        loading:
          isInFlightCommitCreateResourceGroup ||
          isInFlightCommitAssociateDomain ||
          isInFlightCommitUpdateResourceGroup,
      }}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values: FormInputType) => {
            const input = {
              driver: 'static',
              scheduler: values.scheduler,
              description: values.description ?? null,
              driver_opts: '{}',
              scheduler_opts: JSON.stringify({
                allowed_session_types: values.allowedSessionTypes,
                ...(values.pendingTimeout && {
                  pending_timeout: values.pendingTimeout,
                }),
                ...(values.retriesToSkip && {
                  config: {
                    num_retries_to_skip: values.retriesToSkip,
                  },
                }),
              }),
              is_public: values.public,
              is_active: values.active,
              wsproxy_addr: values.wsProxyAddress,
              wsproxy_api_token: values.wsProxyAPIToken,
            };

            if (resourceGroup) {
              commitUpdateResourceGroup({
                variables: {
                  name: resourceGroup.name,
                  input: input,
                },
                onCompleted: ({ modify_scaling_group: res }, errors) => {
                  if (!res?.ok) {
                    message.error(res?.msg);
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
                    return;
                  }
                  message.success(t('resourceGroup.ResourceGroupModified'));
                  onRequestClose?.(true);
                },
                onError: (err) => {
                  message.error(err.message);
                },
              });
              return;
            }

            commitCreateResourceGroup({
              variables: {
                name: values.name,
                input: input,
              },
              onCompleted: ({ create_scaling_group: res }, errors) => {
                if (errors && errors.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                  }
                  return;
                }

                if (!res?.ok) {
                  message.error(res?.msg);
                  return;
                }

                commitAssociateDomain({
                  variables: {
                    domain: values.domain,
                    scaling_group: values.name,
                  },
                  onCompleted: (
                    { associate_scaling_group_with_domain: res },
                    errors,
                  ) => {
                    if (!res?.ok) {
                      message.error(res?.msg);
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
                      return;
                    }

                    message.success(t('resourceGroup.ResourceGroupCreated'));
                    onRequestClose?.(true);
                  },
                  onError: (err) => {
                    message.error(err.message);
                  },
                });
              },
              onError: (err) => {
                message.error(err.message);
              },
            });
          })
          .catch(() => {});
      }}
      {...modalProps}
    >
      <Suspense fallback={<Skeleton active />}>
        <Form
          ref={formRef}
          initialValues={INITIAL_FORM_VALUES}
          layout="vertical"
        >
          <Form.Item
            label={t('resourceGroup.Name')}
            name="name"
            rules={[
              {
                required: true,
                message: t('general.ValueRequired', {
                  name: t('resourceGroup.Name'),
                }),
              },
            ]}
          >
            <Input disabled={!!resourceGroup} />
          </Form.Item>
          {!resourceGroup ? (
            <Form.Item
              label={t('resourceGroup.Domain')}
              name="domain"
              rules={[
                {
                  required: true,
                  message: t('general.ValueRequired', {
                    name: t('resourceGroup.Domain'),
                  }),
                },
              ]}
            >
              <BAIDomainSelect />
            </Form.Item>
          ) : null}
          <Form.Item label={t('resourceGroup.Description')} name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label={t('resourceGroup.AllowedSessionTypes')}
            name="allowedSessionTypes"
            rules={[
              {
                required: true,
                message: t('general.ValueRequired', {
                  name: t('resourceGroup.AllowedSessionTypes'),
                }),
              },
            ]}
          >
            <Select
              mode="multiple"
              options={[
                { label: 'Batch', value: 'batch' },
                { label: 'Interactive', value: 'interactive' },
                { label: 'Inference', value: 'inference' },
                { label: 'System', value: 'system' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={t('resourceGroup.WsproxyAddress')}
            name="wsProxyAddress"
            rules={[{ type: 'url', message: t('error.InvalidUrl') }]}
          >
            <Input placeholder="http://localhost:10200" />
          </Form.Item>
          <Form.Item
            label={t('resourceGroup.WsproxyAPIToken')}
            name="wsProxyAPIToken"
          >
            <Input.Password placeholder={t('resourceGroup.EnterAPIToken')} />
          </Form.Item>
          <Row>
            <Col span={12}>
              <Form.Item
                layout="horizontal"
                label={t('resourceGroup.Active')}
                name="active"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                layout="horizontal"
                label={t('resourceGroup.Public')}
                name="public"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('resourceGroup.Scheduler')}
            name="scheduler"
            rules={[
              {
                required: true,
                message: t('general.ValueRequired', {
                  name: t('resourceGroup.Scheduler'),
                }),
              },
            ]}
          >
            <Select
              options={[
                {
                  label: 'FIFO',
                  value: 'fifo',
                },
                {
                  label: 'LIFO',
                  value: 'lifo',
                },
                {
                  label: 'DRF',
                  value: 'drf',
                },
                {
                  label: 'Fair Share',
                  value: 'fair-share',
                },
              ]}
            />
          </Form.Item>
          <Form.Item label={t('resourceGroup.SchedulerOptions')}>
            <BAICard styles={{ body: { paddingBottom: 0 } }}>
              <Form.Item
                label={
                  <BAIFlex gap="xxs">
                    {t('resourceGroup.PendingTimeout')}
                    <Tooltip
                      title={newLineToBrElement(
                        t('resourceGroup.PendingTimeoutDesc'),
                      )}
                    >
                      <QuestionCircleOutlined
                        style={{ color: token.colorTextSecondary }}
                      />
                    </Tooltip>
                  </BAIFlex>
                }
                name="pendingTimeout"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  suffix={t('resourceGroup.TimeoutSeconds')}
                  min={0}
                />
              </Form.Item>
              <Form.Item
                label={
                  <BAIFlex style={{ whiteSpace: 'pre' }}>
                    {t('resourceGroup.RetriesToSkipDesc')}
                  </BAIFlex>
                }
                name="retriesToSkip"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  suffix={t('resourceGroup.RetriesToSkip')}
                  min={0}
                />
              </Form.Item>
            </BAICard>
          </Form.Item>
        </Form>
      </Suspense>
    </BAIModal>
  );
};

export default ResourceGroupSettingModal;
