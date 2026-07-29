/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ImageListQuery,
  ImageListQuery$data,
  ImageListQuery$variables,
} from '../__generated__/ImageListQuery.graphql';
import { getImageFullName } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import { ProjectContext, ProjectContextOrNull } from '../types/projectContext';
import AliasedImageDoubleTags from './AliasedImageDoubleTags';
import ImageInstallModal from './ImageInstallModal';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  AppstoreOutlined,
  ReloadOutlined,
  SettingOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  App,
  Button,
  Empty,
  Skeleton,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIFlex,
  BAIPropertyFilter,
  BAISelectionLabel,
  BAITable,
  BAIResourceNumberWithIcon,
  useFetchKey,
  INITIAL_FETCH_KEY,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import {
  Key,
  Suspense,
  useDeferredValue,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type EnvironmentImage = NonNullableNodeOnEdges<
  ImageListQuery$data['image_nodes']
>;

const availableImageSorterKeys = [
  'registry',
  'architecture',
  'namespace',
  'base_image_name',
] as const;
const availableImageSorterValues = [
  ...availableImageSorterKeys,
  ...availableImageSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) =>
  _.includes(availableImageSorterKeys, key);

interface ImageListProps {
  /**
   * Explicit project prop contract (ADR-0001, FR-3415). The Environments page
   * owns the (URL-persisted) choice; this component never reads the ambient
   * current project. `null` means "nothing picked yet" — the list renders the
   * selector plus a "pick a project" empty state, because the image scope
   * argument has no cheap "all projects" form (see the ADR).
   */
  project: ProjectContextOrNull;
  /**
   * Reports the project the user picked in the in-list selector. The project
   * scopes what this list SHOWS, so the selector is a content-scoped control
   * and lives in this list's own filter row rather than in the page's card
   * header (`.claude/rules/use-bai-card.md`).
   */
  onChangeProject: (project: ProjectContext) => void;
  style?: React.CSSProperties;
}

const ImageList: React.FC<ImageListProps> = ({
  project,
  onChangeProject,
  style,
}) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const projectSelect = (
    <BAIFlex gap="xs" align="center" wrap="wrap">
      <Typography.Text type="secondary">{t('general.Project')}</Typography.Text>
      <Suspense fallback={<Skeleton.Input active size="small" />}>
        <ProjectSelectForAdminPage
          data-testid="environment-project-select"
          domain={baiClient._config.domainName}
          value={project?.id ?? undefined}
          style={{ minWidth: 180 }}
          onSelectProject={(projectInfo) => {
            onChangeProject({
              id: projectInfo.projectId,
              name: projectInfo.projectName,
            });
          }}
        />
      </Suspense>
    </BAIFlex>
  );

  // The scoped query below cannot run without a project, so the unselected
  // state is its own (query-free) branch. The selector is rendered in both
  // branches from the single definition above.
  if (!project) {
    return (
      <BAIFlex
        direction="column"
        align="stretch"
        gap="sm"
        style={{ flex: 1, ...style }}
      >
        <BAIFlex justify="between" gap="xs" wrap="wrap">
          {projectSelect}
        </BAIFlex>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('environment.SelectProjectToListImages')}
        />
      </BAIFlex>
    );
  }

  return (
    <ImageListInProject
      project={project}
      projectSelect={projectSelect}
      style={style}
    />
  );
};

interface ImageListInProjectProps {
  project: ProjectContext;
  /** The page-level project control, rendered inside the filter row. */
  projectSelect: React.ReactNode;
  style?: React.CSSProperties;
}

const ImageListInProject: React.FC<ImageListInProjectProps> = ({
  project,
  projectSelect,
  style,
}) => {
  'use memo';

  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<EnvironmentImage[]>([]);
  const [, { tagAlias }] = useBackendAIImageMetaData();
  const { token } = theme.useToken();
  const [managingApp, setManagingApp] = useState<EnvironmentImage | null>(null);
  const [managingResourceLimit, setManagingResourceLimit] =
    useState<EnvironmentImage | null>(null);
  const [isOpenInstallModal, setIsOpenInstallModal] = useState<boolean>(false);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [, startTransition] = useTransition();
  const [installingImages, setInstallingImages] = useState<string[]>([]);
  const { message } = App.useApp();
  const [imageFilter, setImageFilter] = useState('');
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [isPendingRefreshTransition, startRefreshTransition] = useTransition();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 20,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableImageSorterValues),
    },
    { history: 'replace' },
  );

  const queryVariables: ImageListQuery$variables = {
    scopeId: `project:${project.id}`,
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: imageFilter || undefined,
    order: queryParams.order || undefined,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { image_nodes } = useLazyLoadQuery<ImageListQuery>(
    graphql`
      query ImageListQuery(
        $scopeId: ScopeField!
        $offset: Int
        $first: Int
        $filter: String
        $order: String
      ) {
        image_nodes(
          scope_id: $scopeId
          offset: $offset
          first: $first
          filter: $filter
          order: $order
        ) {
          edges @required(action: THROW) {
            node @required(action: THROW) {
              id @required(action: THROW)
              name @deprecatedSince(version: "24.12.0")
              tag
              registry
              architecture
              digest
              installed
              labels {
                key
                value
              }
              humanized_name
              resource_limits {
                key
                min
                max
              }
              namespace @since(version: "24.12.0")
              base_image_name @since(version: "24.12.0")
              tags @since(version: "24.12.0") {
                key
                value
              }
              version @since(version: "24.12.0")
              ...AliasedImageDoubleTagsFragment
              ...ManageImageResourceLimitModal_image
              ...ManageAppsModal_image
            }
          }
          count
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  const imageData = filterOutNullAndUndefined(
    image_nodes?.edges?.map((edge) => edge?.node) ?? [],
  );

  const columns: Array<ColumnType<EnvironmentImage>> = filterOutEmpty([
    {
      title: t('environment.Status'),
      dataIndex: 'installed',
      key: 'installed',
      render: (_text, row) =>
        row?.id && installingImages.includes(row.id) ? (
          <Tag color="gold">{t('environment.Installing')}</Tag>
        ) : row?.installed ? (
          <Tag color="gold">{t('environment.Installed')}</Tag>
        ) : null,
    },
    {
      title: t('environment.FullImagePath'),
      key: 'fullImagePath',
      render: (row) => (
        <Typography.Text
          copyable={{
            text: getImageFullName(row) || '',
          }}
        >
          {getImageFullName(row) || ''}
        </Typography.Text>
      ),
      // Computed (`getImageFullName`) — not orderable on the server.
      width: token.screenXS,
    },
    {
      title: t('environment.Registry'),
      dataIndex: 'registry',
      key: 'registry',
      sorter: isEnableSorter('registry'),
    },
    {
      title: t('environment.Architecture'),
      dataIndex: 'architecture',
      key: 'architecture',
      sorter: isEnableSorter('architecture'),
    },
    {
      title: t('environment.Namespace'),
      key: 'namespace',
      dataIndex: 'namespace',
      sorter: isEnableSorter('namespace'),
    },
    {
      title: t('environment.BaseImageName'),
      key: 'base_image_name',
      dataIndex: 'base_image_name',
      sorter: isEnableSorter('base_image_name'),
      render: (text) => tagAlias(text),
    },
    {
      title: t('environment.Version'),
      key: 'version',
      dataIndex: 'version',
    },
    {
      title: t('environment.Tags'),
      key: 'tags',
      dataIndex: 'tags',
      render: (_text, row) => (
        <AliasedImageDoubleTags label="" color="blue" imageFrgmt={row} />
      ),
    },
    {
      title: t('environment.Digest'),
      dataIndex: 'digest',
      key: 'digest',
      render: (_text, row) => (
        <Typography.Text ellipsis={{ tooltip: true }} style={{ maxWidth: 200 }}>
          {row.digest}
        </Typography.Text>
      ),
    },
    {
      title: t('environment.ResourceLimit'),
      dataIndex: 'resource_limits',
      key: 'resource_limits',
      render: (_text, row) => (
        <BAIFlex direction="row" gap="xxs">
          {row?.resource_limits?.map((resource_limit) => (
            <BAIResourceNumberWithIcon
              key={resource_limit?.key}
              type={resource_limit?.key || ''}
              value={resource_limit?.min || '0'}
              max={resource_limit?.max || 'Infinity'}
            />
          ))}
        </BAIFlex>
      ),
    },
    {
      title: t('general.Control'),
      key: 'control',
      dataIndex: 'control',
      fixed: 'right',
      render: (_text, row) => (
        <BAIFlex
          direction="row"
          align="stretch"
          justify="center"
          gap="xxs"
          onClick={(e) => {
            // To prevent the click event from selecting the row
            e.stopPropagation();
          }}
        >
          <Button
            type="text"
            icon={
              <SquarePenIcon
                style={{
                  color: token.colorInfo,
                }}
              />
            }
            onClick={() => setManagingResourceLimit(row)}
          />
          <Button
            type="text"
            icon={
              <AppstoreOutlined
                style={{
                  color: token.colorInfo,
                }}
              />
            }
            onClick={() => {
              setManagingApp(row);
            }}
          />
        </BAIFlex>
      ),
    },
  ]);

  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('ImageList');

  return (
    <>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          ...style,
        }}
        gap="sm"
      >
        <BAIFlex justify="between" gap="xs" wrap="wrap">
          <BAIFlex gap="xs" align="center" wrap="wrap">
            {projectSelect}
            <BAIPropertyFilter
              filterProperties={filterOutEmpty([
                {
                  key: 'id',
                  propertyLabel: t('environment.ID'),
                  type: 'string',
                  defaultOperator: '==',
                },
                {
                  key: 'image',
                  propertyLabel: t('environment.Image'),
                  type: 'string',
                },
                {
                  key: 'name',
                  propertyLabel: t('environment.Name'),
                  type: 'string',
                },
                {
                  key: 'registry',
                  propertyLabel: t('environment.Registry'),
                  type: 'string',
                },
                {
                  key: 'architecture',
                  propertyLabel: t('environment.Architecture'),
                  type: 'string',
                  strictSelection: true,
                  defaultOperator: '==',
                  options: [
                    { label: 'x86_64', value: 'x86_64' },
                    { label: 'aarch64', value: 'aarch64' },
                  ],
                },
                {
                  key: 'namespace',
                  propertyLabel: t('environment.Namespace'),
                  type: 'string',
                },
                {
                  key: 'base_image_name',
                  propertyLabel: t('environment.BaseImageName'),
                  type: 'string',
                },
                {
                  key: 'tag',
                  propertyLabel: t('environment.Tags'),
                  type: 'string',
                },
                {
                  key: 'status',
                  propertyLabel: t('environment.Status'),
                  type: 'string',
                  strictSelection: true,
                  defaultOperator: '==',
                  options: [
                    { label: 'ALIVE', value: 'ALIVE' },
                    { label: 'DELETED', value: 'DELETED' },
                  ],
                },
                {
                  key: 'type',
                  propertyLabel: t('data.Type'),
                  type: 'string',
                  strictSelection: true,
                  defaultOperator: '==',
                  options: [
                    { label: 'COMPUTE', value: 'COMPUTE' },
                    { label: 'SERVICE', value: 'SERVICE' },
                    { label: 'SYSTEM', value: 'SYSTEM' },
                  ],
                },
                {
                  key: 'is_local',
                  propertyLabel: t('environment.Local'),
                  type: 'boolean',
                },
              ])}
              value={imageFilter || undefined}
              onChange={(value) => {
                setImageFilter(value || '');
                setTablePaginationOption({ current: 1 });
              }}
            />
          </BAIFlex>
          <BAIFlex gap={'xs'}>
            {selectedRows.length > 0 ? (
              <BAISelectionLabel
                count={selectedRows.length}
                onClearSelection={() => setSelectedRows([])}
              />
            ) : null}
            <Tooltip title={t('button.Refresh')}>
              <Button
                icon={<ReloadOutlined />}
                loading={isPendingRefreshTransition}
                onClick={() => {
                  setSelectedRows([]);
                  startRefreshTransition(() => updateFetchKey());
                }}
              />
            </Tooltip>

            <Button
              icon={<VerticalAlignBottomOutlined />}
              style={{ backgroundColor: token.colorPrimary, color: 'white' }}
              onClick={() => {
                if (selectedRows.length === 0) {
                  message.error(t('environment.NoImagesAreSelected'));
                  return;
                }
                if (selectedRows.some((image) => !image.installed)) {
                  setIsOpenInstallModal(true);
                  return;
                }
                message.error(t('environment.AlreadyInstalledImage'));
              }}
            >
              {t('environment.InstallImage')}
            </Button>
          </BAIFlex>
        </BAIFlex>
        <BAITable
          resizable
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            total: image_nodes?.count ?? undefined,
            ...tablePaginationOption,
            onChange: (page, pageSize) => {
              setTablePaginationOption({ current: page, pageSize });
            },
            extraContent: (
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => {
                  toggleColumnSettingModal();
                }}
              />
            ),
          }}
          dataSource={imageData}
          columns={_.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          )}
          loading={
            deferredFetchKey !== fetchKey ||
            deferredQueryVariables !== queryVariables
          }
          order={queryParams.order}
          onChangeOrder={(order) => {
            setQueryParams({
              order: order as
                (typeof availableImageSorterValues)[number] | null,
            });
            setTablePaginationOption({ current: 1 });
          }}
          rowSelection={{
            type: 'checkbox',
            onChange: (_, selectedRows) => {
              setSelectedRows(selectedRows);
            },
            selectedRowKeys: selectedRows.map((row) => row.id) as Key[],
          }}
          onRow={(record) => ({
            onClick: () => {
              // selected or deselect row
              if (selectedRows.find((row) => row.id === record.id)) {
                setSelectedRows((rows) =>
                  rows.filter((row) => row.id !== record.id),
                );
              } else {
                setSelectedRows((rows) => [...rows, record]);
              }
            },
          })}
          showSorterTooltip={false}
        />
      </BAIFlex>
      <ManageImageResourceLimitModal
        open={!!managingResourceLimit}
        onRequestClose={(success) => {
          setManagingResourceLimit(null);
          if (success)
            startTransition(() => {
              updateFetchKey();
            });
        }}
        imageFrgmt={managingResourceLimit}
      />
      <ManageAppsModal
        open={!!managingApp}
        onRequestClose={(success) => {
          setManagingApp(null);
          if (success)
            startTransition(() => {
              updateFetchKey();
            });
        }}
        imageFrgmt={managingApp}
      />
      <ImageInstallModal
        project={project}
        open={isOpenInstallModal}
        onRequestClose={() => {
          setIsOpenInstallModal(false);
        }}
        setInstallingImages={setInstallingImages}
        selectedRows={selectedRows}
      />
      <TableColumnsSettingModal
        open={visibleColumnSettingModal}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setHiddenColumnKeys(
              _.difference(
                columns.map((column) => _.toString(column.key)),
                values?.selectedColumnKeys,
              ),
            );
          toggleColumnSettingModal();
        }}
        columns={columns}
        hiddenColumnKeys={hiddenColumnKeys}
      />
    </>
  );
};

export default ImageList;
