import { SessionOwnerSetterCardQuery } from '../__generated__/SessionOwnerSetterCardQuery.graphql';
import { useCurrentUserRole } from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import HiddenFormItem from './HiddenFormItem';
import ResourceGroupSelect from './ResourceGroupSelect';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Row,
  Select,
  Switch,
  theme,
} from 'antd';
import { CardProps } from 'antd/lib';
import { BAICard, BAICardProps, BAIFlex, BAISelect } from 'backend.ai-ui';
import _ from 'lodash';
import { CheckIcon } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, fetchQuery, useRelayEnvironment } from 'react-relay';

export interface SessionOwnerSetterFormValues {
  owner?:
    | {
        email: string;
        accesskey: string;
        project: string;
        resourceGroup: string;
        enabled: true;
        domainName: string;
      }
    | {
        email?: string;
        accesskey?: string;
        project?: string;
        resourceGroup?: string;
        enabled: false;
        domainName?: string;
      };
}

const SessionOwnerSetterCard: React.FC<CardProps> = (props) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const form = Form.useFormInstance<SessionOwnerSetterFormValues>();

  const isActive = Form.useWatch(['owner', 'enabled'], form);

  const [fetchingEmail, setFetchingEmail] = useState<string>();
  const relayEvn = useRelayEnvironment();

  const { data, isFetching } = useTanQuery({
    queryKey: ['SessionOwnerSetterCard', 'ownerInfo', fetchingEmail],
    queryFn: () => {
      const email = form.getFieldValue(['owner', 'email']);
      if (!email) return;

      const query = graphql`
        query SessionOwnerSetterCardQuery($email: String!) {
          keypairs(email: $email) {
            access_key
          }
          user(email: $email) {
            domain_name
            groups {
              name
              id
            }
          }
        }
      `;
      return fetchQuery<SessionOwnerSetterCardQuery>(relayEvn, query, {
        email,
      }).toPromise();
    },
    enabled: !!fetchingEmail,
  });

  const ownerKeypairs = form.getFieldValue(['owner', 'email'])
    ? data?.keypairs
    : undefined;
  const owner = form.getFieldValue(['owner', 'email']) ? data?.user : undefined;

  const nonExistentOwner = !isFetching && fetchingEmail && !owner;

  return (
    <Card
      title={t('session.launcher.SetSessionOwner')}
      extra={
        <Form.Item name={['owner', 'enabled']} valuePropName="checked" noStyle>
          <Switch />
        </Form.Item>
      }
      styles={
        isActive
          ? undefined
          : {
              header: {
                borderBottom: 'none',
              },
              body: {
                display: isActive ? 'block' : 'none',
              },
            }
      }
      {...props}
    >
      <HiddenFormItem
        name={['owner', 'domainName']}
        value={owner?.domain_name}
      />
      <Form.Item dependencies={[['owner', 'enabled']]} noStyle>
        {({ getFieldValue }) => {
          return (
            <>
              <BAIFlex>
                <Form.Item
                  name={['owner', 'email']}
                  label={t('session.launcher.OwnerEmail')}
                  rules={[
                    {
                      required: isActive,
                    },
                    {
                      type: 'email',
                      message: t('general.validation.InvalidEmailAddress'),
                    },
                  ]}
                  style={{ flex: 1 }}
                  validateStatus={nonExistentOwner ? 'error' : undefined}
                  help={
                    nonExistentOwner
                      ? t('credential.NoUserToDisplay')
                      : undefined
                  }
                >
                  <Input.Search
                    onSearch={(v) => {
                      // startTransition(()=>{
                      form
                        .validateFields([['owner', 'email']])
                        .then(() => {
                          setFetchingEmail(v);
                        })
                        .catch(() => {});
                      // })
                    }}
                    onChange={() => {
                      setFetchingEmail('');
                      form.setFieldsValue({
                        owner: {
                          accesskey: '',
                          project: undefined,
                          resourceGroup: undefined,
                        },
                      });
                    }}
                    loading={isFetching}
                    enterButton={
                      !isFetching && owner ? (
                        <Button icon={<CheckIcon />} />
                      ) : undefined
                    }
                  />
                </Form.Item>
              </BAIFlex>
              <Form.Item
                name={['owner', 'accesskey']}
                label={t('session.launcher.OwnerAccessKey')}
                rules={[
                  {
                    required: getFieldValue(['owner', 'enabled']),
                  },
                ]}
              >
                <BAISelect
                  options={_.map(ownerKeypairs, (k) => {
                    return {
                      label: k?.access_key,
                      value: k?.access_key,
                    };
                  })}
                  autoSelectOption
                  disabled={_.isEmpty(fetchingEmail) || isFetching}
                  // defaultActiveFirstOption
                />
              </Form.Item>
              <Row gutter={token.marginSM}>
                <Col span={12}>
                  <Form.Item
                    name={['owner', 'project']}
                    label={t('session.launcher.OwnerGroup')}
                    rules={[
                      {
                        required: getFieldValue(['owner', 'enabled']),
                      },
                    ]}
                  >
                    <BAISelect
                      options={_.map(owner?.groups, (g) => {
                        return {
                          label: g?.name,
                          value: g?.name,
                        };
                      })}
                      autoSelectOption
                      disabled={_.isEmpty(fetchingEmail) || isFetching}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item dependencies={[['owner', 'project']]} noStyle>
                    {({ getFieldValue }) => {
                      return (
                        <Suspense
                          fallback={
                            <Form.Item
                              label={t('session.launcher.OwnerResourceGroup')}
                              rules={[
                                {
                                  required: getFieldValue(['owner', 'enabled']),
                                },
                              ]}
                            >
                              <Select loading />
                            </Form.Item>
                          }
                        >
                          <Form.Item
                            name={['owner', 'resourceGroup']}
                            label={t('session.launcher.OwnerResourceGroup')}
                            rules={[
                              {
                                required: getFieldValue(['owner', 'enabled']),
                              },
                            ]}
                          >
                            {getFieldValue(['owner', 'project']) ? (
                              <ResourceGroupSelect
                                projectName={getFieldValue([
                                  'owner',
                                  'project',
                                ])}
                                disabled={
                                  _.isEmpty(fetchingEmail) || isFetching
                                }
                                autoSelectDefault
                              />
                            ) : (
                              <Select disabled />
                            )}
                          </Form.Item>
                        </Suspense>
                      );
                    }}
                  </Form.Item>
                </Col>
              </Row>
            </>
          );
        }}
      </Form.Item>
    </Card>
  );
};

export const SessionOwnerSetterPreviewCard: React.FC<BAICardProps> = (
  props,
) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const isActive = Form.useWatch(['owner', 'enabled'], form);
  const currentUserRole = useCurrentUserRole();
  return (
    (currentUserRole === 'admin' || currentUserRole === 'superadmin') &&
    isActive && (
      <BAICard
        title={t('session.launcher.SetSessionOwner')}
        showDivider
        size="small"
        status={
          form.getFieldError(['owner', 'email']).length > 0 ||
          form.getFieldError(['owner', 'accesskey']).length > 0 ||
          form.getFieldError(['owner', 'project']).length > 0 ||
          form.getFieldError(['owner', 'resourceGroup']).length > 0
            ? 'error'
            : undefined
        }
        extraButtonTitle={t('button.Edit')}
        {...props}
      >
        <Descriptions size="small" column={1}>
          <Descriptions.Item label={t('session.launcher.OwnerEmail')}>
            {form.getFieldValue(['owner', 'email'])}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.OwnerAccessKey')}>
            {form.getFieldValue(['owner', 'accesskey'])}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.OwnerGroup')}>
            {form.getFieldValue(['owner', 'project'])}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.OwnerResourceGroup')}>
            {form.getFieldValue(['owner', 'resourceGroup'])}
          </Descriptions.Item>
        </Descriptions>
      </BAICard>
    )
  );
};

export default SessionOwnerSetterCard;
