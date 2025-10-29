import { Tag, Typography } from 'antd';
import {
  BAITable,
  filterOutNullAndUndefined,
  filterOutEmpty,
  BAIColumnType,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  AccessTokenListFragment$key,
  AccessTokenListFragment$data,
} from 'src/__generated__/AccessTokenListFragment.graphql';

export type AccessTokenInList = NonNullable<
  NonNullable<AccessTokenListFragment$data>[number]
>;

interface AccessTokenListProps {
  accessTokensFrgmt?: AccessTokenListFragment$key;
}

const AccessTokenList: React.FC<AccessTokenListProps> = ({
  accessTokensFrgmt,
}) => {
  const { t } = useTranslation();

  const accessTokens = useFragment(
    graphql`
      fragment AccessTokenListFragment on AccessToken @relay(plural: true) {
        id
        token
        createdAt
        validUntil
      }
    `,
    accessTokensFrgmt,
  );

  const filteredAccessTokens = filterOutNullAndUndefined(accessTokens);

  const columns = filterOutEmpty<BAIColumnType<AccessTokenInList>>([
    {
      key: 'token',
      title: t('deployment.Token'),
      dataIndex: 'token',
      fixed: 'left',
      render: (token) => (
        <Typography.Text ellipsis copyable style={{ width: 150 }}>
          {token}
        </Typography.Text>
      ),
    },
    {
      title: t('modelService.Status'),
      render: (text, row) => {
        const isExpired = dayjs.utc(row.validUntil).isBefore();
        return (
          <Tag color={isExpired ? 'red' : 'green'}>
            {isExpired ? 'Expired' : 'Valid'}
          </Tag>
        );
      },
    },
    {
      key: 'validUntil',
      title: t('deployment.ExpirationDate'),
      dataIndex: 'validUntil',
      render: (value) => dayjs(value).format('LLL'),
    },
    {
      key: 'createdAt',
      title: t('deployment.CreatedAt'),
      dataIndex: 'createdAt',
      render: (value) => dayjs(value).format('LLL'),
    },
  ]);

  return (
    <>
      <BAITable
        resizable
        columns={columns}
        dataSource={filteredAccessTokens}
        rowKey="id"
        size="small"
      />
    </>
  );
};

export default AccessTokenList;
