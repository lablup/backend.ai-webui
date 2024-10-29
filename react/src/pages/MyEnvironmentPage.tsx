import Flex from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import {
  BaseImageTags,
  BaseVersionTags,
  ConstraintTags,
  LangTags,
} from '../components/ImageTags';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import { getImageFullName, localeCompare } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from '../hooks';
import { MyEnvironmentPageForgetAndUntagMutation } from './__generated__/MyEnvironmentPageForgetAndUntagMutation.graphql';
import {
  MyEnvironmentPageQuery,
  MyEnvironmentPageQuery$data,
} from './__generated__/MyEnvironmentPageQuery.graphql';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { App, Button, Card, Popconfirm, Table, theme, Typography } from 'antd';
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
  const baiClient = useSuspendedBackendaiClient();
  const supportExtendedImageInfo = baiClient?.supports('extended-image-info');

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
      getConstraints,
    },
  ] = useBackendAIImageMetaData();

  const { customized_images } = useLazyLoadQuery<MyEnvironmentPageQuery>(
    graphql`
      query MyEnvironmentPageQuery {
        customized_images {
          id
          name @deprecatedSince(version: "24.09.1.")
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
          namespace @since(version: "24.09.1.")
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
      sorter: (a, b) => localeCompare(a?.registry, b?.registry),
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
      sorter: (a, b) => localeCompare(a?.architecture, b?.architecture),
    },
    ...(supportExtendedImageInfo
      ? [
          {
            title: t('environment.Namespace'),
            key: 'namespace',
            dataIndex: 'namespace',
            sorter: (a: CommittedImage, b: CommittedImage) =>
              localeCompare(a?.namespace, b?.namespace),
          },
        ]
      : [
          {
            title: t('environment.Namespace'),
            key: 'name',
            dataIndex: 'name',
            sorter: (a: CommittedImage, b: CommittedImage) =>
              localeCompare(
                getNamespace(getImageFullName(a) || ''),
                getNamespace(getImageFullName(b) || ''),
              ),
            render: (text: string, row: CommittedImage) => (
              <span>{getNamespace(getImageFullName(row) || '')}</span>
            ),
          },
        ]),
    {
      title: t('environment.Language'),
      key: 'lang',
      sorter: (a, b) =>
        localeCompare(
          getImageLang(getImageFullName(a) || ''),
          getImageLang(getImageFullName(b) || ''),
        ),

      render: (text, row) => (
        <LangTags image={getImageFullName(row) || ''} color="green" />
      ),
    },
    {
      title: t('environment.Version'),
      key: 'baseversion',
      sorter: (a, b) =>
        localeCompare(
          getBaseVersion(getImageFullName(a) || ''),
          getBaseVersion(getImageFullName(b) || ''),
        ),
      render: (text, row) => (
        <BaseVersionTags image={getImageFullName(row) || ''} color="green" />
      ),
    },
    {
      title: t('environment.Base'),
      key: 'baseimage',
      sorter: (a, b) =>
        localeCompare(
          getBaseImage(getImageFullName(a) || ''),
          getBaseImage(getImageFullName(b) || ''),
        ),
      render: (text, row) => (
        <BaseImageTags image={getImageFullName(row) || ''} />
      ),
    },
    {
      title: t('environment.Constraint'),
      key: 'constraint',
      sorter: (a, b) => {
        const requirementA =
          a?.tag && b?.labels
            ? getConstraints(
                a?.tag,
                a?.labels as { key: string; value: string }[],
              )[0] || ''
            : '';
        const requirementB =
          b?.tag && b?.labels
            ? getConstraints(
                b?.tag,
                b?.labels as { key: string; value: string }[],
              )[0] || ''
            : '';
        return localeCompare(requirementA, requirementB);
      },
      render: (text, row) =>
        row?.tag ? (
          <ConstraintTags
            tag={row.tag}
            labels={row?.labels as { key: string; value: string }[]}
          />
        ) : null,
    },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      sorter: (a, b) => localeCompare(a?.digest || '', b?.digest || ''),
    },
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'right',
      render: (text, row) => (
        <Flex direction="row" align="stretch" justify="center" gap="xxs">
          <Typography.Text
            copyable={{
              text: getImageFullName(row) || '',
            }}
            style={{
              paddingTop: token.paddingXXS,
              paddingBottom: token.paddingXXS,
            }}
          />
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
              loading={
                isInflightForgetAndUntag &&
                inFlightImageId === row?.id + myEnvironmentFetchKey
              }
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
