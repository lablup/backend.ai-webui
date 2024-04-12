import DoubleTag from '../components/DoubleTag';
import Flex from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import { useBackendAIImageMetaData, useUpdatableState } from '../hooks';
import { MyEnvironmentPageForgetAndUntagMutation } from './__generated__/MyEnvironmentPageForgetAndUntagMutation.graphql';
import {
  MyEnvironmentPageQuery,
  MyEnvironmentPageQuery$data,
} from './__generated__/MyEnvironmentPageQuery.graphql';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { App, Button, Card, Popconfirm, Table, Tag, theme } from 'antd';
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
  namespace: string;
  lang: string;
  baseversion: string;
  baseimage: string[];
  constraint: string[];
};
type CustomizedImages = NonNullable<
  MyEnvironmentPageQuery$data['customized_images']
>[number] &
  AdditionalImageColumnTypes;

const MyEnvironmentPage: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [selectedTab] = useState<TabKey>('images');
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [myEnvironmentFetchKey, updateMyEnvironmentFetchKey] =
    useUpdatableState('initial-fetch');
  const [metadata] = useBackendAIImageMetaData();

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
          aliases
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

  const _humanizeName = (value: string) => {
    return metadata?.tagAlias[value] ?? value;
  };

  const processedImages = _.map(customized_images, (image) => {
    const key = image?.id;
    const tags = image?.tag?.split('-');
    const names = image?.name?.split('/');
    const namespace = names?.[1] ? names[0] : '';
    const baseversion = tags?.[0] ?? '';
    const additionalReq = _humanizeName(
      tags?.slice(2, _.indexOf(tags, 'customized_'))?.join('-') ?? '',
    );
    const customizedNameLabel = _.find(image?.labels, {
      key: 'ai.backend.customized-image.name',
    })?.value;
    const constraint = [additionalReq, customizedNameLabel];

    let langs =
      (names?.[1] ? names.slice(1).join('') : names?.[0])?.split('-') ?? '';
    let baseimage = tags?.[1] ? [_humanizeName(tags[1])] : [];
    let lang = _humanizeName(langs[langs.length - 1]);

    if (langs.length > 1) {
      if (langs[0] === 'r') {
        lang = _humanizeName(langs[0]);
        baseimage.push(_humanizeName(langs[0]));
      } else {
        lang = _humanizeName(langs[1]);
        baseimage.push(_humanizeName(langs[0]));
      }
    } else {
      lang = _humanizeName(lang);
    }

    return {
      ...image,
      key,
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
    },
    {
      title: t('environment.Version'),
      dataIndex: 'baseversion',
      key: 'baseversion',
      sorter: (a, b) =>
        a.baseversion && b.baseversion
          ? a.baseversion.localeCompare(b.baseversion)
          : 0,
    },
    {
      title: t('environment.Base'),
      dataIndex: 'baseimage',
      key: 'baseimage',
      render: (baseimages: string[]) => {
        return (
          <>
            {_.map(baseimages, (baseimage) => (
              <Tag key={baseimage} color="blue">
                {baseimage}
              </Tag>
            ))}
          </>
        );
      },
      sorter: (a, b) =>
        a.baseimage && b.baseimage
          ? a.baseimage.join('').localeCompare(b.baseimage.join(''))
          : 0,
    },
    {
      title: t('environment.Constraint'),
      dataIndex: 'constraint',
      key: 'constraint',
      render: (constraint: string[]) => {
        return (
          <Flex>
            <Tag color="green">{constraint?.[0]}</Tag>
            {constraint?.length > 1 ? (
              <DoubleTag
                key={constraint?.[1]}
                values={[
                  {
                    label: 'Customized',
                    color: 'cyan',
                  },
                  {
                    label: constraint?.[1],
                    color: 'cyan',
                  },
                ]}
              />
            ) : null}
          </Flex>
        );
      },
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
              if (row?.id) {
                commitForgetAndUntag({
                  variables: {
                    image_id: row.id,
                    id: row.id,
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
              dataSource={processedImages as CustomizedImages[]}
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
