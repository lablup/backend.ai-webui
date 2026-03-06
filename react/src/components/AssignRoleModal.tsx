/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AssignRoleModalQuery } from '../__generated__/AssignRoleModalQuery.graphql';
import { Form, Select, Tooltip, Typography } from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface AssignRoleModalProps extends BAIModalProps {
  onAssign: (userIds: string[]) => void;
}

const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  onAssign,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const [form] = Form.useForm();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const data = useLazyLoadQuery<AssignRoleModalQuery>(
    graphql`
      query AssignRoleModalQuery($filter: UserV2Filter, $first: Int) {
        adminUsersV2(filter: $filter, first: $first) {
          edges {
            node {
              id
              basicInfo {
                email
                fullName
              }
            }
          }
        }
      }
    `,
    {
      filter: deferredSearch ? { email: { contains: deferredSearch } } : null,
      first: 50,
    },
    {
      fetchPolicy: baiModalProps.open ? 'store-and-network' : 'store-only',
    },
  );

  const users = data.adminUsersV2?.edges?.map((edge) => edge?.node) ?? [];

  return (
    <BAIModal
      title={t('rbac.AssignUser')}
      okText={t('rbac.Assign')}
      onOk={() => {
        return form
          .validateFields()
          .then(() => {
            onAssign(selectedUserIds);
          })
          .catch((e) => {
            logger.debug(e);
          });
      }}
      destroyOnClose
      afterClose={() => {
        setSelectedUserIds([]);
        setSearch('');
        form.resetFields();
      }}
      {...baiModalProps}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="userIds"
          label={t('credential.Users')}
          rules={[{ required: true, message: t('rbac.PleaseSelectUsers') }]}
        >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={t('rbac.SelectUsers')}
            onChange={(value) => setSelectedUserIds(value)}
            loading={deferredSearch !== search}
            maxTagCount="responsive"
            allowClear
            maxTagPlaceholder={(omittedValues) => (
              <Tooltip
                title={
                  <BAIFlex direction="column" align="start" gap="xxs">
                    {omittedValues.map((v) => (
                      <Typography.Text
                        key={v.value}
                        style={{ color: 'inherit' }}
                      >
                        {v.label}
                      </Typography.Text>
                    ))}
                  </BAIFlex>
                }
              >
                <span>+{omittedValues.length} ...</span>
              </Tooltip>
            )}
            showSearch={{
              searchValue: search,
              onSearch: (v) => setSearch(v),
              filterOption: false,
            }}
            options={users.map((user) => ({
              value: user?.id ? toLocalId(user.id) : undefined,
              label: user?.basicInfo?.email || user?.id,
              description: user?.basicInfo?.fullName,
            }))}
            optionRender={(option) => (
              <div>
                <div>{option.label}</div>
                {option.data?.description && (
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {option.data.description}
                  </div>
                )}
              </div>
            )}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default AssignRoleModal;
