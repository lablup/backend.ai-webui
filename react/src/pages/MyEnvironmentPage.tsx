import DoubleTag from '../components/DoubleTag';
import Flex from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import TableColumnsSettingModal from '../components/TableColumnsSettingModal';
import { useBackendAIImageMetaData, useUpdatableState } from '../hooks';
import { MyEnvironmentPageForgetMutation } from './__generated__/MyEnvironmentPageForgetMutation.graphql';
import {
  MyEnvironmentPageQuery,
  MyEnvironmentPageQuery$data,
} from './__generated__/MyEnvironmentPageQuery.graphql';
import { MyEnvironmentPageUntagMutation } from './__generated__/MyEnvironmentPageUntagMutation.graphql';
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
  const [metadata] = useBackendAIImageMetaData();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const hasSelected = selectedRowKeys.length > 0;

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

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
      fetchPolicy: 'network-only',
    },
  );

  const [commitForgetImageById, isInflightForgetImageById] =
    useMutation<MyEnvironmentPageForgetMutation>(graphql`
      mutation MyEnvironmentPageForgetMutation($image_id: String!) {
        forget_image_by_id(image_id: $image_id) {
          ok
          msg
        }
      }
    `);

  const [commitUntagImageFromRegistry, isInflightUntagImageFromRegistry] =
    useMutation<MyEnvironmentPageUntagMutation>(graphql`
      mutation MyEnvironmentPageUntagMutation($id: String!) {
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
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
    },
    {
      title: t('environment.Namespace'),
      dataIndex: 'namespace',
      key: 'namespace',
    },
    {
      title: t('environment.Language'),
      dataIndex: 'lang',
      key: 'lang',
    },
    {
      title: t('environment.Version'),
      dataIndex: 'baseversion',
      key: 'baseversion',
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
    },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
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
            onConfirm={() => {
              if (row?.id) {
                commitForgetImageById({
                  variables: {
                    image_id: row.id,
                  },
                  onError(err) {
                    message.error(err?.message);
                  },
                });
                commitUntagImageFromRegistry({
                  variables: {
                    id: row.id,
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
                isInflightForgetImageById || isInflightUntagImageFromRegistry
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
              rowSelection={rowSelection}
              columns={columns.filter((column) =>
                displayedColumnKeys?.includes(_.toString(column.key)),
              )}
              dataSource={processedImages as CustomizedImages[]}
              scroll={{ x: 'max-content' }}
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
