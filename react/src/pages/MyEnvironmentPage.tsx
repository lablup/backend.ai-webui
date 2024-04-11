import DoubleTag from '../components/DoubleTag';
import Flex from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import { useBackendAIImageMetaData, useUpdatableState } from '../hooks';
import {
  MyEnvironmentPageQuery,
  MyEnvironmentPageQuery$data,
} from './__generated__/MyEnvironmentPageQuery.graphql';
import { MyEnvironmentPageUntagMutation } from './__generated__/MyEnvironmentPageUntagMutation.graphql';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Table, Tag, theme } from 'antd';
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

  const [selectedTab] = useState<TabKey>('images');
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [servicesFetchKey, updateServicesFetchKey] =
    useUpdatableState('initial-fetch');
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
      render: () => (
        <Flex direction="row" align="stretch">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            style={{ color: token.colorError }}
          />
        </Flex>
      ),
    },
  ];

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
        servicesFetchKey === 'initial-fetch'
          ? 'store-and-network'
          : 'network-only',
      fetchKey: servicesFetchKey,
    },
  );

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
              columns={columns}
              dataSource={processedImages as CustomizedImages[]}
              scroll={{ x: 'max-content' }}
            />
          </Suspense>
        </Card>
      </Flex>
    </Flex>
  );
};

export default MyEnvironmentPage;
