/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AssignRoleModalQuery } from '../__generated__/AssignRoleModalQuery.graphql';
import { Select } from 'antd';
import { BAIModal, BAIModalProps, toLocalId } from 'backend.ai-ui';
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
        if (selectedUserIds.length > 0) {
          onAssign(selectedUserIds);
        }
      }}
      okButtonProps={{ disabled: selectedUserIds.length === 0 }}
      destroyOnClose
      afterClose={() => {
        setSelectedUserIds([]);
        setSearch('');
      }}
      {...baiModalProps}
    >
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder={t('rbac.SelectUsers')}
        value={selectedUserIds}
        onChange={(value) => setSelectedUserIds(value)}
        loading={deferredSearch !== search}
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
    </BAIModal>
  );
};

export default AssignRoleModal;
