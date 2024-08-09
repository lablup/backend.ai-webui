import {
  bytesToGB,
  filterEmptyItem,
  localeCompare,
  numberSorterWithInfinityValue,
} from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import Flex from './Flex';
import ProjectResourcePolicySettingModal from './ProjectResourcePolicySettingModal';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import { ProjectResourcePolicyListMutation } from './__generated__/ProjectResourcePolicyListMutation.graphql';
import {
  ProjectResourcePolicyListQuery,
  ProjectResourcePolicyListQuery$data,
} from './__generated__/ProjectResourcePolicyListQuery.graphql';
import { ProjectResourcePolicySettingModalFragment$key } from './__generated__/ProjectResourcePolicySettingModalFragment.graphql';
import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { Button, message, Popconfirm, Table, theme, Typography } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

type ProjectResourcePolicies = NonNullable<
  ProjectResourcePolicyListQuery$data['project_resource_policies']
>[number];

interface ProjectResourcePolicyListProps {}

const ProjectResourcePolicyList: React.FC<
  ProjectResourcePolicyListProps
> = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [projectResourcePolicyFetchKey, updateProjectResourcePolicyFetchKey] =
    useUpdatableState('initial-fetch');
  const [isCreatingPolicySetting, setIsCreatingPolicySetting] = useState(false);
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [inFlightResourcePolicyName, setInFlightResourcePolicyName] =
    useState<string>();
  const [editingProjectResourcePolicy, setEditingProjectResourcePolicy] =
    useState<ProjectResourcePolicySettingModalFragment$key | null>();

  const baiClient = useSuspendedBackendaiClient();
  const supportMaxVfolderCount = baiClient?.supports(
    'max-vfolder-count-in-user-and-project-resource-policy',
  );
  const supportMaxQuotaScopeSize = baiClient?.supports('max-quota-scope-size');

  const { project_resource_policies } =
    useLazyLoadQuery<ProjectResourcePolicyListQuery>(
      graphql`
        query ProjectResourcePolicyListQuery {
          project_resource_policies {
            id
            name
            created_at
            # follows version of https://github.com/lablup/backend.ai/pull/1993
            # --------------- START --------------------
            max_vfolder_count @since(version: "23.09.6")
            max_quota_scope_size @since(version: "23.09.2")
            # ---------------- END ---------------------
            ...ProjectResourcePolicySettingModalFragment
          }
        }
      `,
      {},
      {
        fetchPolicy:
          projectResourcePolicyFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey: projectResourcePolicyFetchKey,
      },
    );

  const [commitDelete, isInflightDelete] =
    useMutation<ProjectResourcePolicyListMutation>(graphql`
      mutation ProjectResourcePolicyListMutation($name: String!) {
        delete_project_resource_policy(name: $name) {
          ok
          msg
        }
      }
    `);

  const columns = filterEmptyItem<ColumnType<ProjectResourcePolicies>>([
    {
      title: t('resourcePolicy.Name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      sorter: (a, b) => localeCompare(a?.name, b?.name),
    },
    supportMaxVfolderCount && {
      title: t('resourcePolicy.MaxVFolderCount'),
      dataIndex: 'max_vfolder_count',
      render: (text: ProjectResourcePolicies) =>
        _.toNumber(text) === 0 ? '∞' : text,
      sorter: (a, b) =>
        numberSorterWithInfinityValue(
          a?.max_vfolder_count,
          b?.max_vfolder_count,
          0,
        ),
    },
    supportMaxQuotaScopeSize && {
      title: t('resourcePolicy.MaxQuotaScopeSize'),
      dataIndex: 'max_quota_scope_size',
      render: (text) => (text === -1 ? '∞' : bytesToGB(text)),
      sorter: (a, b) =>
        numberSorterWithInfinityValue(
          a?.max_quota_scope_size,
          b?.max_quota_scope_size,
          -1,
        ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      sorter: (a, b) => localeCompare(a?.id, b?.id),
    },
    {
      title: t('resourcePolicy.CreatedAt'),
      dataIndex: 'created_at',
      render: (text) => dayjs(text).format('lll'),
      sorter: (a, b) => localeCompare(a?.created_at, b?.created_at),
    },
    {
      title: t('general.Control'),
      fixed: 'right',
      render: (text: any, row: ProjectResourcePolicies) => (
        <Flex direction="row" align="stretch">
          <Button
            type="text"
            icon={<SettingOutlined />}
            style={{
              color: token.colorInfo,
            }}
            onClick={() => {
              setEditingProjectResourcePolicy(row);
            }}
          />
          <Popconfirm
            title={t('dialog.ask.DoYouWantToProceed')}
            description={t('dialog.warning.CannotBeUndone')}
            okType="danger"
            okText={t('button.Delete')}
            onConfirm={() => {
              if (row?.name) {
                setInFlightResourcePolicyName(
                  row.name + projectResourcePolicyFetchKey,
                );
                commitDelete({
                  variables: {
                    name: row.name,
                  },
                  onCompleted: (res, errors) => {
                    if (!res?.delete_project_resource_policy?.ok) {
                      message.error(res?.delete_project_resource_policy?.msg);
                      return;
                    }
                    if (errors && errors?.length > 0) {
                      const errorMsgList = _.map(
                        errors,
                        (error) => error.message,
                      );
                      for (const error of errorMsgList) {
                        message.error(error, 2.5);
                      }
                    } else {
                      startRefetchTransition(() =>
                        updateProjectResourcePolicyFetchKey(),
                      );
                      message.success(t('resourcePolicy.SuccessfullyDeleted'));
                    }
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
              icon={
                <DeleteOutlined
                  style={{
                    color: token.colorError,
                  }}
                />
              }
              loading={
                isInflightDelete &&
                inFlightResourcePolicyName ===
                  row?.name + projectResourcePolicyFetchKey
              }
              disabled={
                isInflightDelete &&
                inFlightResourcePolicyName !==
                  row?.name + projectResourcePolicyFetchKey
              }
            />
          </Popconfirm>
        </Flex>
      ),
    },
  ]);

  const [displayedColumnKeys, setDisplayedColumnKeys] = useLocalStorageState(
    'backendaiwebui.ProjectResourcePolicyList.displayedColumnKeys',
    {
      defaultValue: columns.map((column) => _.toString(column.key)),
    },
  );

  return (
    <Flex direction="column" align="stretch">
      <Flex
        direction="row"
        justify="between"
        wrap="wrap"
        gap={'xs'}
        style={{
          padding: token.paddingContentVertical,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
      >
        <Flex direction="column" align="start">
          <Typography.Text style={{ margin: 0, padding: 0 }}>
            {t('resourcePolicy.ProjectResourcePolicy')}
          </Typography.Text>
        </Flex>
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Flex gap={'xs'}>
            <Button
              icon={<ReloadOutlined />}
              loading={isRefetchPending}
              onClick={() => {
                startRefetchTransition(() =>
                  updateProjectResourcePolicyFetchKey(),
                );
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsCreatingPolicySetting(true);
              }}
            >
              {t('button.Create')}
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Table
        rowKey="id"
        showSorterTooltip={false}
        columns={
          _.filter(columns, (column) =>
            displayedColumnKeys?.includes(_.toString(column.key)),
          ) as ColumnType<AnyObject>[]
        }
        dataSource={
          project_resource_policies as readonly AnyObject[] | undefined
        }
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
      <TableColumnsSettingModal
        open={isOpenColumnsSetting}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setDisplayedColumnKeys(values?.selectedColumnKeys);
          setIsOpenColumnsSetting(false);
        }}
        columns={columns}
        displayedColumnKeys={displayedColumnKeys ? displayedColumnKeys : []}
      />
      <ProjectResourcePolicySettingModal
        existingPolicyNames={_.map(project_resource_policies, 'name')}
        open={!!editingProjectResourcePolicy || isCreatingPolicySetting}
        projectResourcePolicyFrgmt={editingProjectResourcePolicy || null}
        onRequestClose={(success) => {
          if (success) {
            startRefetchTransition(() => updateProjectResourcePolicyFetchKey());
          }
          setEditingProjectResourcePolicy(null);
          setIsCreatingPolicySetting(false);
        }}
      />
    </Flex>
  );
};

export default ProjectResourcePolicyList;
