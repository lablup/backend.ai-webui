import {
  BAIRuntimeVariantPresetTableFragment$data,
  BAIRuntimeVariantPresetTableFragment$key,
} from '../../__generated__/BAIRuntimeVariantPresetTableFragment.graphql';
import { filterOutEmpty, filterOutNullAndUndefined } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAIId from '../BAIId';
import BAIQuestionIconWithTooltip from '../BAIQuestionIconWithTooltip';
import BAIText from '../BAIText';
import BooleanTag from '../BooleanTag';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
} from '../Table';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type RuntimeVariantPresetNodeInList = NonNullable<
  BAIRuntimeVariantPresetTableFragment$data[number]
>;

const availablePresetSorterKeys = ['name', 'rank', 'createdAt'] as const;

export const availablePresetSorterValues = [
  ...availablePresetSorterKeys,
  ...availablePresetSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availablePresetSorterKeys, key);
};

export interface BAIRuntimeVariantPresetTableProps extends Omit<
  BAITableProps<RuntimeVariantPresetNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  presetsFrgmt: BAIRuntimeVariantPresetTableFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnsType<RuntimeVariantPresetNodeInList>,
  ) => BAIColumnsType<RuntimeVariantPresetNodeInList>;
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof availablePresetSorterValues)[number] | null,
  ) => void;
}

const BAIRuntimeVariantPresetTable = ({
  presetsFrgmt,
  customizeColumns,
  disableSorter,
  onChangeOrder,
  ...tableProps
}: BAIRuntimeVariantPresetTableProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const baiClient = useConnectedBAIClient();
  const isRequiredSupported = baiClient.supports(
    'runtime-variant-preset-required',
  );
  const isRuntimeVariantFieldSupported = baiClient.supports(
    'runtime-variant-preset-runtime-variant-field',
  );

  const presets = useFragment<BAIRuntimeVariantPresetTableFragment$key>(
    graphql`
      fragment BAIRuntimeVariantPresetTableFragment on RuntimeVariantPreset
      @relay(plural: true) {
        id @required(action: NONE)
        runtimeVariantId
        runtimeVariant @since(version: "26.8.0") {
          name
        }
        name @required(action: NONE)
        description
        category
        displayName
        rank
        targetSpec {
          presetTarget
          valueType
          defaultValue
          key
        }
        required @since(version: "26.4.4")
        uiOption {
          uiType
        }
        createdAt
        updatedAt
      }
    `,
    presetsFrgmt,
  );

  const presetTargetLabels: Record<string, string> = {
    ENV: t('comp:BAIRuntimeVariantPresetTable.PresetTargetEnv'),
    ARGS: t('comp:BAIRuntimeVariantPresetTable.PresetTargetArgs'),
  };

  const valueTypeLabels: Record<string, string> = {
    STR: t('comp:BAIRuntimeVariantPresetTable.ValueTypeStr'),
    INT: t('comp:BAIRuntimeVariantPresetTable.ValueTypeInt'),
    FLOAT: t('comp:BAIRuntimeVariantPresetTable.ValueTypeFloat'),
    BOOL: t('comp:BAIRuntimeVariantPresetTable.ValueTypeBool'),
    FLAG: t('comp:BAIRuntimeVariantPresetTable.ValueTypeFlag'),
  };

  // Keyed by the READ spelling (lowercase), which is what `uiOption.uiType`
  // carries — it is an open `String!`, so a newer manager can serve a control
  // this build has no label for.
  const uiTypeLabels: Record<string, string> = {
    slider: t('comp:BAIRuntimeVariantPresetTable.UITypeSlider'),
    number_input: t('comp:BAIRuntimeVariantPresetTable.UITypeNumberInput'),
    select: t('comp:BAIRuntimeVariantPresetTable.UITypeSelect'),
    checkbox: t('comp:BAIRuntimeVariantPresetTable.UITypeCheckbox'),
    text_input: t('comp:BAIRuntimeVariantPresetTable.UITypeTextInput'),
  };

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<RuntimeVariantPresetNodeInList>>([
      {
        key: 'name',
        title: t('comp:BAIRuntimeVariantPresetTable.Name'),
        dataIndex: 'name',
        sorter: isEnableSorter('name'),
        fixed: 'left',
        // The Name column also hosts the per-row edit/delete actions, so keep
        // it always visible — hiding it via table settings would remove every
        // row action.
        required: true,
      },
      {
        key: 'description',
        title: t('comp:BAIRuntimeVariantPresetTable.Description'),
        dataIndex: 'description',
        sorter: isEnableSorter('description'),
        defaultHidden: true,
        render: (desc: string | null) => desc || '-',
      },
      // Read-only, so no capability gate: `category` / `displayName` ship with
      // the type since 26.4.2. Only WRITING them needs 26.9.0.
      {
        key: 'category',
        title: t('comp:BAIRuntimeVariantPresetTable.Category'),
        defaultHidden: true,
        render: (__, record) => record.category ?? '-',
      },
      {
        key: 'displayName',
        title: t('comp:BAIRuntimeVariantPresetTable.DisplayName'),
        defaultHidden: true,
        render: (__, record) => record.displayName ?? '-',
      },
      {
        // One column either way — the id and the name it carries are one
        // reference. The nested field only decides whether the id can be
        // qualified by that name. Not sortable in either mode: the manager's
        // `RuntimeVariantPresetOrderField` exposes NAME / RANK / CREATED_AT
        // only, which is what `availablePresetSorterKeys` mirrors.
        key: 'runtimeVariantId',
        title: isRuntimeVariantFieldSupported
          ? t('comp:BAIRuntimeVariantPresetTable.RuntimeVariantWithID')
          : t('comp:BAIRuntimeVariantPresetTable.RuntimeVariantId'),
        dataIndex: 'runtimeVariantId',
        sorter: isEnableSorter('runtimeVariantId'),
        // The qualified form adds a name and a pair of parens to the ~100px id
        // and its copy button; the bare id needs neither.
        width: isRuntimeVariantFieldSupported ? 240 : 160,
        minWidth: isRuntimeVariantFieldSupported ? 200 : 140,
        render: (runtimeVariantId: string, record) => {
          const name = record.runtimeVariant?.name;
          // Nothing to qualify without a name, so the id stands alone rather
          // than trailing an empty pair of parentheses.
          // A row, not sibling inlines: both halves carry a `maxWidth`, which
          // makes them wrap onto separate lines when laid out inline.
          return name ? (
            <BAIFlex direction="row" align="center" gap="xxs">
              {/* Shrinks but never grows, so the id stays next to the name
                  instead of being pushed to the far edge of the cell. */}
              <BAIText
                ellipsis={{ tooltip: name }}
                style={{ flexShrink: 1, minWidth: 0 }}
              >
                {name}
              </BAIText>
              <BAIFlex direction="row" align="center" style={{ flexShrink: 0 }}>
                <BAIText type="secondary">(</BAIText>
                <BAIId uuid={runtimeVariantId} copyable type="secondary" />
                <BAIText type="secondary">)</BAIText>
              </BAIFlex>
            </BAIFlex>
          ) : (
            <BAIId uuid={runtimeVariantId} copyable />
          );
        },
      },
      {
        key: 'presetTarget',
        title: t('comp:BAIRuntimeVariantPresetTable.PresetTarget'),
        sorter: isEnableSorter('presetTarget'),
        render: (__, record) =>
          record.targetSpec?.presetTarget
            ? (presetTargetLabels[record.targetSpec.presetTarget] ??
              record.targetSpec.presetTarget)
            : '-',
      },
      {
        key: 'valueType',
        title: t('comp:BAIRuntimeVariantPresetTable.ValueType'),
        sorter: isEnableSorter('valueType'),
        render: (__, record) =>
          record.targetSpec?.valueType
            ? (valueTypeLabels[record.targetSpec.valueType] ??
              record.targetSpec.valueType)
            : '-',
      },
      // Directly after the value type: the two describe one decision, and the
      // pairing is only legible when they sit side by side.
      {
        key: 'uiType',
        title: t('comp:BAIRuntimeVariantPresetTable.UIType'),
        render: (__, record) => {
          const stored = record.uiOption?.uiType;
          // An unrecognised control shows verbatim rather than as '-', so a
          // type this build predates is still visible to the admin.
          return stored ? (uiTypeLabels[stored] ?? stored) : '-';
        },
      },
      // Key before its default value, matching the setting modal: the key
      // names the parameter, the default is a property of it.
      {
        key: 'key',
        title: t('comp:BAIRuntimeVariantPresetTable.Key'),
        sorter: isEnableSorter('key'),
        render: (__, record) =>
          record.targetSpec?.key ? (
            <BAIText code copyable ellipsis={{ tooltip: true }}>
              {record.targetSpec.key}
            </BAIText>
          ) : (
            '-'
          ),
      },
      {
        key: 'defaultValue',
        title: t('comp:BAIRuntimeVariantPresetTable.DefaultValue'),
        sorter: isEnableSorter('defaultValue'),
        render: (__, record) => record.targetSpec?.defaultValue ?? '-',
      },
      isRequiredSupported && {
        key: 'required',
        title: t('comp:BAIRuntimeVariantPresetTable.Required'),
        sorter: isEnableSorter('required'),
        render: (__, record) => (
          <BooleanTag
            value={record.required ?? false}
            trueLabel={t('comp:BAIRuntimeVariantPresetTable.Required')}
            falseLabel={t('comp:BAIRuntimeVariantPresetTable.Optional')}
          />
        ),
      },
      {
        key: 'rank',
        title: (
          <BAIFlex gap="xs" align="center">
            {t('comp:BAIRuntimeVariantPresetTable.Rank')}
            <BAIQuestionIconWithTooltip
              title={t('comp:BAIRuntimeVariantPresetTable.RankTooltip')}
            />
          </BAIFlex>
        ),
        dataIndex: 'rank',
        sorter: isEnableSorter('rank'),
      },
      {
        key: 'createdAt',
        title: t('comp:BAIRuntimeVariantPresetTable.CreatedAt'),
        dataIndex: 'createdAt',
        sorter: isEnableSorter('createdAt'),
        render: (createdAt: string) =>
          createdAt ? dayjs(createdAt).format('lll') : '-',
      },
      {
        key: 'updatedAt',
        title: t('comp:BAIRuntimeVariantPresetTable.ModifiedAt'),
        dataIndex: 'updatedAt',
        sorter: isEnableSorter('updatedAt'),
        defaultHidden: true,
        render: (updatedAt: string | null | undefined) =>
          updatedAt ? dayjs(updatedAt).format('lll') : '-',
      },
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  const allColumns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable
      scroll={{ x: 'max-content' }}
      rowKey="id"
      dataSource={filterOutNullAndUndefined(presets)}
      columns={allColumns}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          (order as (typeof availablePresetSorterValues)[number]) || null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIRuntimeVariantPresetTable;
