import Flex from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import {
  BaseImageTags,
  BaseVersionTags,
  ConstraintTags,
  LangTags,
} from '../components/ImageTags';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import {
  getImageFullName,
  useBackendAIImageMetaData,
  useUpdatableState,
} from '../hooks';
import { MyEnvironmentPageForgetAndUntagMutation } from './__generated__/MyEnvironmentPageForgetAndUntagMutation.graphql';
import {
  MyEnvironmentPageQuery,
  MyEnvironmentPageQuery$data,
} from './__generated__/MyEnvironmentPageQuery.graphql';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { App, Button, Card, Popconfirm, Table, theme } from 'antd';
import { ColumnsType } from 'antd/es/table';
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
type AdditionalImageColumnTypes = {
  key: string;
  imageFullName: string;
  namespace: string;
  lang: string;
  baseversion: string;
  baseimage: string;
  constraint: string[];
};

export type CommittedImage = NonNullable<
  MyEnvironmentPageQuery$data['customized_images']
>[number];

type CustomizedImages = CommittedImage & AdditionalImageColumnTypes;

const MyEnvironmentPage: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [selectedTab] = useState<TabKey>('images');
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [myEnvironmentFetchKey, updateMyEnvironmentFetchKey] =
    useUpdatableState('initial-fetch');
  const [
    ,
    {
      getNamespace,
      getImageLang,
      getBaseVersion,
      getBaseImage,
      getFilteredRequirementsTags,
    },
  ] = useBackendAIImageMetaData();

  const { customized_images } = useLazyLoadQuery<MyEnvironmentPageQuery>(
    graphql`
      query MyEnvironmentPageQuery {
        customized_images {
          id
          ImageNode_id
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
      mutation MyEnvironmentPageForgetAndUntagMutation(
        $image_id: String!
        $id: String!
      ) {
        forget_image_by_id(image_id: $image_id) {
          ok
          msg
        }
        untag_image_from_registry(id: $id) {
          ok
          msg
        }
      }
    `);

  const processedImages = _.map(customized_images, (image) => {
    const key = image?.id;
    const imageFullName = getImageFullName(image) || '';
    const namespace = getNamespace(imageFullName);
    const lang = getImageLang(imageFullName);
    const baseversion = getBaseVersion(imageFullName);
    const baseimage = getBaseImage(imageFullName);
    const constraint = getFilteredRequirementsTags(imageFullName);

    return {
      ...image,
      key,
      imageFullName,
      namespace,
      lang,
      baseversion,
      baseimage,
      constraint,
    };
  });

  const columns: ColumnsType<CustomizedImages> = [
    {
      title: t('environment.Registry'),
      dataIndex: 'registry',
      key: 'registry',
      sorter: (a, b) =>
        a.registry && b.registry ? a.registry.localeCompare(b.registry) : 0,
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
      sorter: (a, b) =>
        a.architecture && b.architecture
          ? a.architecture.localeCompare(b.architecture)
          : 0,
    },
    {
      title: t('environment.Namespace'),
      dataIndex: 'namespace',
      key: 'namespace',
      sorter: (a, b) =>
        a.namespace && b.namespace ? a.namespace.localeCompare(b.namespace) : 0,
    },
    {
      title: t('environment.Language'),
      dataIndex: 'lang',
      key: 'lang',
      sorter: (a, b) => (a.lang && b.lang ? a.lang.localeCompare(b.lang) : 0),
      render: (text, row) => (
        <LangTags image={row?.imageFullName} color="green" />
      ),
    },
    {
      title: t('environment.Version'),
      dataIndex: 'baseversion',
      key: 'baseversion',
      sorter: (a, b) =>
        a.baseversion && b.baseversion
          ? a.baseversion.localeCompare(b.baseversion)
          : 0,
      render: (text, row) => (
        <BaseVersionTags image={row?.imageFullName} color="green" />
      ),
    },
    {
      title: t('environment.Base'),
      dataIndex: 'baseimage',
      key: 'baseimage',
      sorter: (a, b) =>
        a.baseimage && b.baseimage ? a.baseimage.localeCompare(b.baseimage) : 0,
      render: (text, row) => <BaseImageTags image={row?.imageFullName} />,
    },
    {
      title: t('environment.Constraint'),
      dataIndex: 'constraint',
      key: 'constraint',
      render: (text, row) => (
        <ConstraintTags
          image={row?.imageFullName}
          labels={row?.labels as { key: string; value: string }[]}
        />
      ),
      sorter: (a, b) =>
        a.constraint && b.constraint
          ? a.constraint.join('').localeCompare(b.constraint.join(''))
          : 0,
    },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      sorter: (a, b) =>
        a.digest && b.digest ? a.digest.localeCompare(b.digest) : 0,
    },
    {
      title: t('general.Control'),
      dataIndex: 'controls',
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
              console.log(row.key);
              if (row.key) {
                commitForgetAndUntag({
                  variables: {
                    image_id: row.key,
                    id: row.key,
                  },
                  onCompleted(data) {
                    startRefetchTransition(() => {
                      updateMyEnvironmentFetchKey();
                    });
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
              loading={isInflightForgetAndUntag}
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
              columns={columns.filter((column) =>
                displayedColumnKeys?.includes(_.toString(column.key)),
              )}
              dataSource={processedImages as unknown as CustomizedImages[]}
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
