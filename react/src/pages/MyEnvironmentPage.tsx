import Flex from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import {
  BaseImageTags,
  BaseVersionTags,
  ConstraintTags,
  LangTags,
} from '../components/ImageTags';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import { getImageFullName } from '../helper';
import { useBackendAIImageMetaData, useUpdatableState } from '../hooks';
import { MyEnvironmentPageForgetAndUntagMutation } from './__generated__/MyEnvironmentPageForgetAndUntagMutation.graphql';
import {
  MyEnvironmentPageQuery,
  MyEnvironmentPageQuery$data,
} from './__generated__/MyEnvironmentPageQuery.graphql';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { App, Button, Card, Popconfirm, Table, theme } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, {
  PropsWithChildren,
  Suspense,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

type TabKey = 'images';

export type CommittedImage = NonNullable<
  MyEnvironmentPageQuery$data['customized_images']
>[number];

const MyEnvironmentPage: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [selectedTab] = useState<TabKey>('images');
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [myEnvironmentFetchKey, updateMyEnvironmentFetchKey] =
    useUpdatableState('initial-fetch');
  const [inFlightImageId, setInFlightImageId] = useState<string>();
  const [
    ,
    {
      getNamespace,
      getImageLang,
      getBaseVersion,
      getBaseImage,
      getCustomTag,
      getFilteredRequirementsTags,
    },
  ] = useBackendAIImageMetaData();

  const { customized_images } = useLazyLoadQuery<MyEnvironmentPageQuery>(
    graphql`
      query MyEnvironmentPageQuery {
        customized_images {
          id
          name
          humanized_name
          tag
          registry
          architecture
          digest
          labels {
            key
            value
          }
          supported_accelerators
        }
      }
    `,
    {},
    {
      fetchPolicy:
        myEnvironmentFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey: myEnvironmentFetchKey,
    },
  );

  const [commitForgetAndUntag, isInflightForgetAndUntag] =
    useMutation<MyEnvironmentPageForgetAndUntagMutation>(graphql`
      mutation MyEnvironmentPageForgetAndUntagMutation($id: String!) {
        untag_image_from_registry(image_id: $id) {
          ok
          msg
        }
        forget_image_by_id(image_id: $id) {
          ok
          msg
        }
      }
    `);

  const columns: ColumnsType<CommittedImage> = [
    {
      title: t('environment.Registry'),
      dataIndex: 'registry',
      key: 'registry',
      sorter: (a, b) =>
        a?.registry && b?.registry ? a.registry.localeCompare(b.registry) : 0,
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
      sorter: (a, b) =>
        a?.architecture && b?.architecture
          ? a.architecture.localeCompare(b.architecture)
          : 0,
    },
    {
      title: t('environment.Namespace'),
      key: 'namespace',
      sorter: (a, b) => {
        const namespaceA = getNamespace(getImageFullName(a) || '');
        const namespaceB = getNamespace(getImageFullName(b) || '');
        return namespaceA && namespaceB
          ? namespaceA.localeCompare(namespaceB)
          : 0;
      },
      render: (text, row) => (
        <span>{getNamespace(getImageFullName(row) || '')}</span>
      ),
    },
    {
      title: t('environment.Language'),
      key: 'lang',
      sorter: (a, b) => {
        const langA = getImageLang(getImageFullName(a) || '');
        const langB = getImageLang(getImageFullName(b) || '');
        return langA && langB ? langA.localeCompare(langB) : 0;
      },
      render: (text, row) => (
        <LangTags image={getImageFullName(row) || ''} color="green" />
      ),
    },
    {
      title: t('environment.Version'),
      key: 'baseversion',
      sorter: (a, b) => {
        const baseversionA = getBaseVersion(getImageFullName(a) || '');
        const baseversionB = getBaseVersion(getImageFullName(b) || '');
        return baseversionA && baseversionB
          ? baseversionA.localeCompare(baseversionB)
          : 0;
      },
      render: (text, row) => (
        <BaseVersionTags image={getImageFullName(row) || ''} color="green" />
      ),
    },
    {
      title: t('environment.Base'),
      key: 'baseimage',
      sorter: (a, b) => {
        const baseimageA = getBaseImage(getImageFullName(a) || '');
        const baseimageB = getBaseImage(getImageFullName(b) || '');
        return baseimageA && baseimageB
          ? baseimageA.localeCompare(baseimageB)
          : 0;
      },
      render: (text, row) => (
        <BaseImageTags image={getImageFullName(row) || ''} />
      ),
    },
    {
      title: t('environment.Constraint'),
      key: 'constraint',
      sorter: (a, b) => {
        const getConstraint = (item: any) => {
          const imageFullName = getImageFullName(item) || '';
          const labels = _.get(item, 'labels', []);
          return (
            getFilteredRequirementsTags(imageFullName).join('') +
            'Customized' +
            getCustomTag(labels as { key: string; value: string }[])
          );
        };
        const constraintA = getConstraint(a);
        const constraintB = getConstraint(b);
        return constraintA && constraintB
          ? constraintA.localeCompare(constraintB)
          : 0;
      },
      render: (text, row) => (
        <ConstraintTags
          image={getImageFullName(row) || ''}
          labels={row?.labels as { key: string; value: string }[]}
        />
      ),
    },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      sorter: (a, b) =>
        a?.digest && b?.digest ? a.digest.localeCompare(b.digest) : 0,
    },
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'right',
      render: (text, row) => (
        <Flex direction="row" align="stretch">
          <Popconfirm
            title={t('dialog.ask.DoYouWantToProceed')}
            description={t('dialog.warning.CannotBeUndone')}
            okType="danger"
            okText={t('button.Delete')}
            onConfirm={() => {
              if (row?.id) {
                setInFlightImageId(row.id + myEnvironmentFetchKey);
                commitForgetAndUntag({
                  variables: {
                    id: row.id,
                  },
                  onCompleted(data, errors) {
                    if (errors) {
                      message.error(errors[0]?.message);
                      return;
                    }
                    startRefetchTransition(() => {
                      updateMyEnvironmentFetchKey();
                    });
                    message.success(
                      t('environment.CustomizedImageSuccessfullyDeleted'),
                    );
                  },
                  onError(err) {
                    message.error(err?.message);
                  },
                });
              }
            }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              loading={inFlightImageId === row?.id + myEnvironmentFetchKey}
              disabled={
                isInflightForgetAndUntag &&
                inFlightImageId !== row?.id + myEnvironmentFetchKey
              }
            />
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  const [displayedColumnKeys, setDisplayedColumnKeys] = useLocalStorageState(
    'backendaiwebui.MyEnvironmentPage.displayedColumnKeys',
    {
      defaultValue: columns.map((column) => _.toString(column.key)),
    },
  );

  return (
    <Flex direction="column" align="stretch" gap={'xs'}>
      <Flex direction="column" align="stretch">
        <Card
          tabList={[{ key: 'images', label: t('environment.Images') }]}
          activeTabKey={selectedTab}
          styles={{
            body: {
              padding: 0,
              paddingTop: 1,
            },
          }}
        >
          <Suspense fallback={<FlexActivityIndicator />}>
            <Table
              loading={isRefetchPending}
              columns={
                columns.filter((column) =>
                  displayedColumnKeys?.includes(_.toString(column.key)),
                ) as ColumnType<AnyObject>[]
              }
              dataSource={customized_images as readonly AnyObject[] | undefined}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              pagination={false}
            />
            <Flex
              justify="end"
              style={{
                padding: token.paddingXXS,
              }}
            >
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => {
                  setIsOpenColumnsSetting(true);
                }}
              />
            </Flex>
          </Suspense>
        </Card>
      </Flex>
      <TableColumnsSettingModal
        open={isOpenColumnsSetting}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setDisplayedColumnKeys(values?.selectedColumnKeys);
          setIsOpenColumnsSetting(!isOpenColumnsSetting);
        }}
        columns={columns}
        displayedColumnKeys={displayedColumnKeys ? displayedColumnKeys : []}
      />
    </Flex>
  );
};

export default MyEnvironmentPage;
