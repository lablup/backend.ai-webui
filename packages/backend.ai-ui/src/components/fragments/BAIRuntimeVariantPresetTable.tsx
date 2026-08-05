import {
  BAIRuntimeVariantPresetTableFragment$data,
  BAIRuntimeVariantPresetTableFragment$key,
} from '../../__generated__/BAIRuntimeVariantPresetTableFragment.graphql';
import { filterOutEmpty, filterOutNullAndUndefined } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIFlex from '../BAIFlex';
import BAIId from '../BAIId';
import BAIText from '../BAIText';
import BooleanTag from '../BooleanTag';
import {
  BAIColumnsType,
  BAIColumnType,
  BAITable,
  BAITableProps,
} from '../Table';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip, theme } from 'antd';
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
  const { token } = theme.useToken();
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
        rank
        targetSpec {
          presetTarget
          valueType
          defaultValue
          key
        }
        required @since(version: "26.4.4")
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
      isRuntimeVariantFieldSupported && {
        key: 'runtimeVariant',
        title: t('comp:BAIRuntimeVariantPresetTable.RuntimeVariant'),
        render: (__, record) => record.runtimeVariant?.name ?? '-',
      },
      {
        key: 'runtimeVariantId',
        title: t('comp:BAIRuntimeVariantPresetTable.RuntimeVariantId'),
        dataIndex: 'runtimeVariantId',
        sorter: isEnableSorter('runtimeVariantId'),
        onCell: () => ({ style: { maxWidth: 120 } }),
        render: (runtimeVariantId: string) => <BAIId uuid={runtimeVariantId} />,
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
      {
        key: 'defaultValue',
        title: t('comp:BAIRuntimeVariantPresetTable.DefaultValue'),
        sorter: isEnableSorter('defaultValue'),
        defaultHidden: true,
        render: (__, record) => record.targetSpec?.defaultValue ?? '-',
      },
      {
        key: 'key',
        title: t('comp:BAIRuntimeVariantPresetTable.Key'),
        sorter: isEnableSorter('key'),
        render: (__, record) =>
          record.targetSpec?.key ? (
            <BAIText code copyable>
              {record.targetSpec.key}
            </BAIText>
          ) : (
            '-'
          ),
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
            <Tooltip title={t('comp:BAIRuntimeVariantPresetTable.RankTooltip')}>
              <QuestionCircleOutlined
                style={{ color: token.colorTextDescription }}
              />
            </Tooltip>
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
      rowKey="id"
      dataSource={filterOutNullAndUndefined(presets)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
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
