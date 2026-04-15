/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  VFolderListPageQuery,
  VFolderListPageQuery$data,
  VFolderListPageQuery$variables,
} from '../__generated__/VFolderListPageQuery.graphql';
import ActionItemContent from '../components/ActionItemContent';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import FolderCreateModal from '../components/FolderCreateModal';
import QuotaPerStorageVolumePanelCard from '../components/QuotaPerStorageVolumePanelCard';
import StorageStatusPanelCard from '../components/StorageStatusPanelCard';
import VFolderDeleteModalV2 from '../components/VFolderDeleteModalV2';
import VFolderList from '../components/VFolderList';
import VFolderRestoreModalV2 from '../components/VFolderRestoreModalV2';
import { handleRowSelectionChange } from '../helper';
import {
  getVFolderUsageModePresetFilter,
  isDeletedVFolderStatus,
  mergeVFolderFilters,
  VFOLDER_SORT_KEY_TO_ORDER_FIELD,
  VFOLDER_STATUS_CATEGORY_FILTERS,
  VFolderStatusCategory,
} from '../helper/vfolderFilters';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useVFolderInvitations } from '../hooks/useVFolderInvitations';
import { useToggle } from 'ahooks';
import {
  Badge,
  Button,
  Col,
  Grid,
  Row,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import {
  BAIAlertIconWithTooltip,
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINewFolderIcon,
  BAIRestoreIcon,
  BAISelectionLabel,
  BAITrashBinIcon,
  filterOutEmpty,
  filterOutNullAndUndefined,
  useUpdatableState,
  type GraphQLFilter,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  Suspense,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  JsonParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

type VFolderEdgeNode = NonNullable<
  VFolderListPageQuery$data['myVfolders']['edges'][number]
>['node'];

const CARD_MIN_HEIGHT = 200;

const VFolderListPage: React.FC = (props) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { lg } = Grid.useBreakpoint();
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();
  const [invitations] = useVFolderInvitations();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.VFolderListPage',
  );

  const [selectedFolderList, setSelectedFolderList] = useState<
    Array<VFolderEdgeNode>
  >([]);
  const [prevProjectId, setPrevProjectId] = useState(currentProject.id);
  if (prevProjectId !== currentProject.id) {
    setPrevProjectId(currentProject.id);
    setSelectedFolderList([]);
  }

  const [isOpenCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [isOpenDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const [isOpenRestoreModal, { toggle: toggleRestoreModal }] = useToggle(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: withDefault(JsonParam, undefined),
    statusCategory: withDefault(StringParam, 'active'),
    mode: withDefault(StringParam, 'all'),
  });

  const queryMapRef = useRef<
    Record<
      string,
      {
        queryParams: typeof queryParams;
        tablePaginationOption: typeof tablePaginationOption;
      }
    >
  >({
    [queryParams.statusCategory]: { queryParams, tablePaginationOption },
  });

  const usageModePresetFilter = getVFolderUsageModePresetFilter(
    queryParams.mode,
  );

  const statusCategory: VFolderStatusCategory =
    queryParams.statusCategory === 'deleted' ? 'deleted' : 'active';
  const statusCategoryFilter = VFOLDER_STATUS_CATEGORY_FILTERS[statusCategory];

  const combinedFilter: GraphQLFilter | undefined = mergeVFolderFilters(
    statusCategoryFilter,
    queryParams.filter as GraphQLFilter | undefined,
    usageModePresetFilter,
  );

  // Convert the legacy order-string (e.g. `-created_at`) into `VFolderOrderBy`.
  const orderBy = (() => {
    const raw = queryParams.order ?? '-created_at';
    const direction = raw.startsWith('-')
      ? ('DESC' as const)
      : ('ASC' as const);
    const key = raw.replace(/^-/, '');
    const field = VFOLDER_SORT_KEY_TO_ORDER_FIELD[key] ?? 'CREATED_AT';
    return [{ field, direction }];
  })();

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  const queryVariables: VFolderListPageQuery$variables = {
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: combinedFilter ?? null,
    orderBy,
    filterForActiveCount: VFOLDER_STATUS_CATEGORY_FILTERS.active,
    filterForDeletedCount: VFOLDER_STATUS_CATEGORY_FILTERS.deleted,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const onInvitationsChanged = useEffectEvent(() => {
    updateFetchKey();
  });
  useEffect(() => {
    // Update fetchKey when invitation count changes
    onInvitationsChanged();
  }, [invitations.length]);

  // FIXME(FR-2573): verify myVfolders includes project folders; if not,
  // compose with projectVfolders (projectId: currentProject.id).
  const { myVfolders, ...folderCounts } =
    useLazyLoadQuery<VFolderListPageQuery>(
      graphql`
        query VFolderListPageQuery(
          $offset: Int
          $first: Int
          $filter: VFolderFilter
          $orderBy: [VFolderOrderBy!]
          $filterForActiveCount: VFolderFilter
          $filterForDeletedCount: VFolderFilter
        ) {
          myVfolders(
            offset: $offset
            first: $first
            filter: $filter
            orderBy: $orderBy
          ) {
            edges {
              node {
                id @required(action: THROW)
                status
                ...VFolderListFragment
                ...VFolderDeleteModalV2Fragment
                ...VFolderRestoreModalV2Fragment
              }
            }
            count
          }
          active: myVfolders(
            first: 0
            offset: 0
            filter: $filterForActiveCount
          ) {
            count
          }
          deleted: myVfolders(
            first: 0
            offset: 0
            filter: $filterForDeletedCount
          ) {
            count
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchPolicy:
          deferredFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey:
          deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
      },
    );

  const vfolderNodes: ReadonlyArray<VFolderEdgeNode> =
    filterOutNullAndUndefined(_.map(myVfolders?.edges, 'node'));

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'} {...props}>
      <Row
        gutter={[16, 16]}
        align={'stretch'}
        style={{ minHeight: lg ? CARD_MIN_HEIGHT : undefined }}
      >
        <Col xs={24} md={8} xl={4} style={{ display: 'flex' }}>
          <BAICard
            style={{
              width: '100%',
              minHeight: lg ? CARD_MIN_HEIGHT : undefined,
            }}
          >
            <ActionItemContent
              title={
                <Typography.Text
                  style={{
                    maxWidth: lg ? 120 : undefined,
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                  }}
                >
                  {t('data.CreateFolderAndUploadFiles')}
                </Typography.Text>
              }
              buttonText={t('data.CreateFolder')}
              icon={<BAINewFolderIcon />}
              type="simple"
              onClick={() => toggleCreateModal()}
              style={{ height: '100%' }}
            />
          </BAICard>
        </Col>
        <Col xs={24} md={16} xl={8} style={{ display: 'flex' }}>
          <ErrorBoundary
            fallbackRender={() => (
              <BAICard
                style={{
                  width: '100%',
                  minHeight: lg ? CARD_MIN_HEIGHT : undefined,
                }}
                title={t('data.FolderStatus')}
                status="error"
                extra={
                  <BAIAlertIconWithTooltip title={t('error.UnexpectedError')} />
                }
              />
            )}
          >
            <Suspense
              fallback={
                <BAICard
                  style={{
                    width: '100%',
                    minHeight: lg ? CARD_MIN_HEIGHT : undefined,
                  }}
                  title={t('data.FolderStatus')}
                  loading
                />
              }
            >
              <StorageStatusPanelCard
                style={{
                  width: '100%',
                  minHeight: lg ? CARD_MIN_HEIGHT : undefined,
                }}
                fetchKey={deferredFetchKey}
                onRequestBadgeClick={() => {
                  webuiNavigate({
                    search: new URLSearchParams({
                      invitation: 'true',
                    }).toString(),
                  });
                }}
              />
            </Suspense>
          </ErrorBoundary>
        </Col>
        <Col xs={24} md={24} xl={12} style={{ display: 'flex' }}>
          <ErrorBoundary
            fallbackRender={() => (
              <BAICard
                style={{
                  width: '100%',
                  minHeight: lg ? CARD_MIN_HEIGHT : undefined,
                }}
                title={t('data.QuotaPerStorageVolume')}
                status="error"
                extra={
                  <BAIAlertIconWithTooltip title={t('error.UnexpectedError')} />
                }
              />
            )}
          >
            <Suspense
              fallback={
                <BAICard
                  style={{
                    width: '100%',
                    minHeight: lg ? CARD_MIN_HEIGHT : undefined,
                  }}
                  title={t('data.QuotaPerStorageVolume')}
                  loading
                />
              }
            >
              <QuotaPerStorageVolumePanelCard
                style={{
                  width: '100%',
                  minHeight: lg ? CARD_MIN_HEIGHT : undefined,
                }}
              />
            </Suspense>
          </ErrorBoundary>
        </Col>
      </Row>
      <BAICard
        variant="borderless"
        title={t('data.Folders')}
        extra={
          <Button type="primary" onClick={() => toggleCreateModal()}>
            {t('data.CreateFolder')}
          </Button>
        }
        styles={{
          header: { borderBottom: 'none' },
          body: { paddingTop: 0 },
        }}
      >
        <BAITabs
          activeKey={queryParams.statusCategory}
          onChange={(key) => {
            // Persist the current tab's query state before switching, so we
            // can restore it when the user comes back to this tab.
            queryMapRef.current[queryParams.statusCategory] = {
              queryParams,
              tablePaginationOption,
            };
            const storedQuery = queryMapRef.current[key] ?? undefined;
            setQuery(
              {
                ...(storedQuery?.queryParams ?? {}),
                statusCategory: key as VFolderStatusCategory,
              },
              'replace',
            );
            setTablePaginationOption(
              storedQuery?.tablePaginationOption ?? { current: 1 },
            );
            setSelectedFolderList([]);
          }}
          items={_.map(
            {
              active: t('data.Active'),
              deleted: t('data.folders.TrashBin'),
            },
            (label, key) => {
              const count =
                folderCounts[key as VFolderStatusCategory]?.count ?? 0;
              return {
                key,
                label: (
                  <BAIFlex justify="center" gap={10}>
                    {label}
                    {count > 0 && (
                      <Badge
                        count={count}
                        color={
                          queryParams.statusCategory === key
                            ? token.colorPrimary
                            : token.colorTextDisabled
                        }
                        size="small"
                        showZero
                        style={{
                          paddingRight: token.paddingXS,
                          paddingLeft: token.paddingXS,
                          fontSize: 10,
                        }}
                      />
                    )}
                  </BAIFlex>
                ),
              };
            },
          )}
        />
        <BAIFlex direction="column" align="stretch" gap={'sm'}>
          <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
              gap={'sm'}
              align="start"
              style={{ flexShrink: 1 }}
              wrap="wrap"
            >
              <BAIRadioGroup
                optionType="button"
                value={queryParams.mode}
                onChange={(e) => {
                  setQuery({ mode: e.target.value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedFolderList([]);
                }}
                options={filterOutEmpty([
                  { label: t('data.All'), value: 'all' },
                  { label: t('data.General'), value: 'general' },
                  baiClient?._config?.fasttrackEndpoint && {
                    label: t('data.Pipeline'),
                    value: 'pipeline',
                  },
                  { label: t('data.AutoMount'), value: 'automount' },
                  baiClient._config.enableModelFolders && {
                    label: t('data.Models'),
                    value: 'model',
                  },
                ])}
              />
              <BAIGraphQLPropertyFilter
                data-testid="vfolder-filter"
                combinationMode="AND"
                value={queryParams.filter as GraphQLFilter | undefined}
                onChange={(value) => {
                  setQuery({ filter: value ?? undefined }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedFolderList([]);
                }}
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('data.folders.Name'),
                    type: 'string',
                  },
                  {
                    key: 'host',
                    propertyLabel: t('data.folders.Location'),
                    type: 'string',
                  },
                  {
                    key: 'status',
                    propertyLabel: t('data.folders.Status'),
                    type: 'enum',
                    valueMode: 'operator',
                    operators: ['in', 'notIn'],
                    strictSelection: true,
                    options: [
                      { label: 'READY', value: 'READY' },
                      { label: 'CLONING', value: 'CLONING' },
                      { label: 'DELETE_PENDING', value: 'DELETE_PENDING' },
                      { label: 'DELETE_ONGOING', value: 'DELETE_ONGOING' },
                      { label: 'DELETE_COMPLETE', value: 'DELETE_COMPLETE' },
                      { label: 'DELETE_ERROR', value: 'DELETE_ERROR' },
                    ],
                  },
                  {
                    key: 'usageMode',
                    propertyLabel: t('data.UsageMode'),
                    type: 'enum',
                    valueMode: 'operator',
                    operators: ['in', 'notIn'],
                    strictSelection: true,
                    options: [
                      { label: t('data.General'), value: 'GENERAL' },
                      { label: t('data.Models'), value: 'MODEL' },
                      { label: t('webui.menu.Data'), value: 'DATA' },
                    ],
                  },
                  {
                    key: 'cloneable',
                    propertyLabel: t('data.folders.Cloneable'),
                    type: 'boolean',
                  },
                ]}
              />
            </BAIFlex>
            <BAIFlex gap={'sm'}>
              {selectedFolderList.length > 0 &&
                queryParams.statusCategory === 'active' && (
                  <>
                    <BAISelectionLabel
                      count={selectedFolderList.length}
                      onClearSelection={() => setSelectedFolderList([])}
                    />
                    <Tooltip title={t('data.folders.MoveToTrash')}>
                      <Button
                        style={{ borderColor: token.colorBorder }}
                        type="text"
                        variant="outlined"
                        icon={<BAITrashBinIcon />}
                        onClick={() => toggleDeleteModal()}
                      />
                    </Tooltip>
                  </>
                )}
              {selectedFolderList.length > 0 &&
                queryParams.statusCategory === 'deleted' && (
                  <>
                    <BAISelectionLabel
                      count={selectedFolderList.length}
                      onClearSelection={() => setSelectedFolderList([])}
                    />
                    <Tooltip title={t('data.folders.Restore')}>
                      <Button
                        style={{
                          color: token.colorInfo,
                          borderColor: token.colorBorder,
                        }}
                        type="text"
                        variant="outlined"
                        icon={<BAIRestoreIcon />}
                        onClick={() => toggleRestoreModal()}
                      />
                    </Tooltip>
                  </>
                )}
              <BAIFetchKeyButton
                loading={
                  deferredQueryVariables !== queryVariables ||
                  deferredFetchKey !== fetchKey
                }
                autoUpdateDelay={15_000}
                value={fetchKey}
                onChange={(newFetchKey) => updateFetchKey(newFetchKey)}
              />
            </BAIFlex>
          </BAIFlex>
          <VFolderList
            loading={deferredQueryVariables !== queryVariables}
            vfoldersFrgmt={vfolderNodes}
            rowSelection={{
              type: 'checkbox',
              preserveSelectedRowKeys: true,
              getCheckboxProps(record) {
                return {
                  disabled:
                    isDeletedVFolderStatus(record.status) &&
                    record.status !== 'DELETE_PENDING',
                };
              },
              onChange: (selectedRowKeys) => {
                handleRowSelectionChange(
                  selectedRowKeys,
                  vfolderNodes,
                  setSelectedFolderList,
                );
              },
              selectedRowKeys: _.map(selectedFolderList, (i) => i.id),
            }}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: myVfolders?.count ?? 0,
              onChange(current, pageSize) {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
              },
            }}
            order={queryParams.order}
            onChangeOrder={(nextOrder) => {
              setQuery({ order: nextOrder ?? undefined }, 'replaceIn');
            }}
            onRemoveRow={(removedId) => {
              setSelectedFolderList((prev) =>
                _.filter(prev, (folder) => folder.id !== removedId),
              );
              updateFetchKey();
            }}
            tableSettings={{
              columnOverrides,
              onColumnOverridesChange: setColumnOverrides,
            }}
          />
        </BAIFlex>
      </BAICard>
      <FolderCreateModal
        open={isOpenCreateModal}
        initialValues={{
          usage_mode:
            queryParams.mode === 'model'
              ? 'model'
              : queryParams.mode === 'automount'
                ? 'automount'
                : 'general',
        }}
        onRequestClose={(success) => {
          if (success) updateFetchKey();
          toggleCreateModal();
        }}
      />
      <VFolderDeleteModalV2
        vfolderFrgmts={selectedFolderList}
        open={isOpenDeleteModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
            setSelectedFolderList([]);
          }
          toggleDeleteModal();
        }}
      />
      <VFolderRestoreModalV2
        vfolderFrgmts={selectedFolderList}
        open={isOpenRestoreModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
            setSelectedFolderList([]);
          }
          toggleRestoreModal();
        }}
      />
    </BAIFlex>
  );
};

export default VFolderListPage;
