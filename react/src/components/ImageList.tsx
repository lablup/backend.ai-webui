/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ImageListQuery,
  ImageListQuery$data,
  ImageListQuery$variables,
} from '../__generated__/ImageListQuery.graphql';
import { App } from '../app-shim';
import { getImageFullName } from '../helper';
import { useBackendAIImageMetaData } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import { ProjectContext } from '../types/projectContext';
import { theme } from '../theme-shim';
import AliasedImageDoubleTags from './AliasedImageDoubleTags';
import ImageInstallModal from './ImageInstallModal';
import ManageAppsModal from './ManageAppsModal';
import ManageImageResourceLimitModal from './ManageImageResourceLimitModal';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import BAICopyableText from './astryx-bui/BAICopyableText';
import BAISelectionLabel from './astryx-bui/BAISelectionLabel';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIFlex,
  BAIPropertyFilter,
  BAIResourceNumberWithIcon,
  BAITableAstryx,
  INITIAL_FETCH_KEY,
  badgeVariantForTagColor,
  filterOutEmpty,
  filterOutNullAndUndefined,
  type BAIColumnType,
  useFetchKey,
  useToggle,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  LayoutGrid,
  RotateCw,
  Settings,
  ArrowDownToLine,
  SquarePenIcon,
} from 'lucide-react';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Key, useDeferredValue, useState, useTransition } from 'react';
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
   * decides the project; this component never reads the ambient current
   * project. Non-null by type: the page renders a "pick a project" empty state
   * instead of mounting this list when nothing is chosen, because the image
   * scope argument has no cheap "all projects" form (see the ADR).
   */
  project: ProjectContext;
  style?: React.CSSProperties;
}

const ImageList: React.FC<ImageListProps> = ({ project, style }) => {
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

  const columns: Array<BAIColumnType<EnvironmentImage>> = filterOutEmpty([
    {
      title: t('environment.Status'),
      dataIndex: 'installed',
      key: 'installed',
      // antd `Tag color="gold"` -> Astryx Badge via the repo-global Tag
      // lookup (ticket 13 policy): gold -> yellow.
      render: (_text, row) =>
        row?.id && installingImages.includes(row.id) ? (
          <Badge
            variant={badgeVariantForTagColor('gold')}
            label={t('environment.Installing')}
          />
        ) : row?.installed ? (
          <Badge
            variant={badgeVariantForTagColor('gold')}
            label={t('environment.Installed')}
          />
        ) : null,
    },
    {
      title: t('environment.FullImagePath'),
      key: 'fullImagePath',
      // The record arrives as `render`'s SECOND argument — this column is
      // computed and has no `dataIndex`, so the first argument (the cell
      // value) is `undefined`. Reading the row off the first argument is an
      // rc-table quirk that `BAITableAstryx` does not reproduce; taking it
      // from the second is the Astryx/antd `(value, record, index)` contract.
      render: (_value, row) => (
        // `maxLines={1}` for the same reason as the Digest column below:
        // Astryx's table cell is `white-space: nowrap; overflow: hidden`, so an
        // untruncated path is CLIPPED rather than wrapped as it was under antd.
        // One line plus Astryx's built-in truncation tooltip keeps the whole
        // value reachable and keeps the copy control inside the cell.
        <BAICopyableText maxLines={1} copyLabel={t('sourceCodeViewer.Copy')}>
          {getImageFullName(row) || ''}
        </BAICopyableText>
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
        // antd `Text ellipsis={{tooltip}} maxWidth 200` -> Astryx Text
        // maxLines (truncate tooltip built in); width lives on the BAIFlex
        // wrapper because Astryx Text has no style/width prop.
        <BAIFlex style={{ maxWidth: 200 }} align="stretch">
          <Text maxLines={1}>{row.digest ?? ''}</Text>
        </BAIFlex>
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
          {/* PILOT-DECISION: antd text Buttons with token.colorInfo-tinted
              icons -> Astryx ghost IconButtons. IconButton's variant enum is
              closed, so the info-blue icon tint is dropped (P5/P11);
              accessible labels reuse the modal titles they open (P8).
              QA-FINDINGS Q-37 — SUPERSEDED for the colour half. The report
              "/admin/environment 페이지의 control 버튼 색상이 default 입니다"
              is precisely this drop: measured rgb(20,20,20) light /
              rgb(255,255,255) dark against antd's `colorInfo` #028DF2/#0387BF.
              The closed enum still has no colour slot, but `className` does:
              `--color-text-accent` on this route resolves through
              `AstryxAdminTheme` to #028DF2/#0387bf, i.e. `colorInfo` exactly,
              so the class restores the tint without a per-route read. The
              `type="text"` hover wash (`colorBgTextHover` rgba(0,0,0,0.06)) is
              already what Astryx's ghost `:hover` paints, so it is untouched.
              See `packages/backend.ai-ui/src/styles/actionAccent.css`. */}
          <IconButton
            className="bai-action-accent"
            variant="ghost"
            icon={<SquarePenIcon />}
            label={t('environment.ModifyMinimumImageResourceLimit')}
            tooltip={t('environment.ModifyMinimumImageResourceLimit')}
            onClick={() => setManagingResourceLimit(row)}
          />
          <IconButton
            className="bai-action-accent"
            variant="ghost"
            icon={<LayoutGrid size="1em" />}
            label={t('environment.ManageApps')}
            tooltip={t('environment.ManageApps')}
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
        <BAIFlex justify="between">
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
          <BAIFlex gap={'xs'}>
            {selectedRows.length > 0 ? (
              <BAISelectionLabel
                count={selectedRows.length}
                onClearSelection={() => setSelectedRows([])}
              />
            ) : null}
            <IconButton
              label={t('button.Refresh')}
              tooltip={t('button.Refresh')}
              icon={<RotateCw size="1em" />}
              isLoading={isPendingRefreshTransition}
              onClick={() => {
                setSelectedRows([]);
                startRefreshTransition(() => updateFetchKey());
              }}
            />
            {/* PILOT-DECISION: the hand-painted primary button
                (style backgroundColor token.colorPrimary) becomes Astryx
                `Button variant="primary"` — the brand accent comes from the
                theme layer, not an inline style (P5). */}
            <Button
              variant="primary"
              icon={<ArrowDownToLine size="1em" />}
              label={t('environment.InstallImage')}
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
            />
          </BAIFlex>
        </BAIFlex>
        <BAITableAstryx
          resizable
          rowKey="id"
          pagination={{
            total: image_nodes?.count ?? undefined,
            ...tablePaginationOption,
            onChange: (page, pageSize) => {
              setTablePaginationOption({ current: page, pageSize });
            },
            extraContent: (
              <IconButton
                variant="ghost"
                icon={<Settings size="1em" />}
                label={t('table.SettingTable')}
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
