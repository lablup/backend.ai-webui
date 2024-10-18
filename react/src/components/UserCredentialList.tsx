import { useUpdatableState } from '../hooks';
import BAITable from './BAITable';
import Flex from './Flex';
import { UserCredentialListQuery } from './__generated__/UserCredentialListQuery.graphql';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Radio, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

const UserCredentialList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [userCredentailFetchKey, updateUserCredentialFetchKey] =
    useUpdatableState('initial-fetch');
  const [isPendingReload, startReloadTransition] = useTransition();
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
  const [isActiveTypePending, startActiveTypeTransition] = useTransition();

  const { keypair_list } = useLazyLoadQuery<UserCredentialListQuery>(
    graphql`
      query UserCredentialListQuery(
        $limit: Int!
        $offset: Int!
        $filter: String
        $order: String
        $domain_name: String
        $email: String
        $is_active: Boolean
      ) {
        keypair_list(
          limit: $limit
          offset: $offset
          filter: $filter
          order: $order
          domain_name: $domain_name
          email: $email
          is_active: $is_active
        ) {
          items {
            id
            user_id
            full_name
            access_key
            secret_key
            is_active
            is_admin
            resource_policy
            created_at
            last_used
            rate_limit
            num_queries

            rolling_count
            user
            projects
            ssh_public_key
          }
          total_count
        }
      }
    `,
    {
      limit: 100,
      offset: 0,
      is_active: activeType === 'active',
    },
    { fetchKey: userCredentailFetchKey },
  );

  console.log(keypair_list);

  return (
    <Flex direction="column">
      <Flex
        justify="between"
        style={{
          width: '100%',
          padding: token.paddingContentVertical,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
        align="start"
      >
        <Flex gap={token.marginXS} align="start">
          <Radio.Group
            value={activeType}
            onChange={(value) => {
              startActiveTypeTransition(() => {
                setActiveType(value.target.value);
              });
              // setPaginationState({
              //   current: 1,
              //   pageSize: paginationState.pageSize,
              // });
            }}
            optionType="button"
            buttonStyle="solid"
            options={[
              {
                label: t('credential.Active'),
                value: 'active',
              },
              {
                label: t('credential.Inactive'),
                value: 'inactive',
              },
            ]}
          />
        </Flex>
        <Flex gap={token.marginXS}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              startReloadTransition(() => {
                updateUserCredentialFetchKey();
              });
            }}
          />
          <Button type="primary">{t('credential.AddCredential')}</Button>
        </Flex>
      </Flex>
      <BAITable
        loading={{
          spinning: isActiveTypePending || isPendingReload,
          indicator: <LoadingOutlined />,
        }}
      />
    </Flex>
  );
};

export default UserCredentialList;
