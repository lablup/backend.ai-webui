import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import ResourceGroupFairShareSettingModal from './ResourceGroupFairShareSettingModal';
import { SettingOutlined } from '@ant-design/icons';
import { Button, theme, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  BAIFlex,
  BAILink,
  BAIProgressWithLabel,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  BAIUnmountAfterClose,
  convertToBinaryUnit,
  ResourceTypeIcon,
  toFixedFloorWithoutTrailingZeros,
  useResourceSlotsDetails,
} from 'backend.ai-ui';
import _ from 'lodash';
import { ChevronRight } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  ResourceGroupFairShareTableFragment$data,
  ResourceGroupFairShareTableFragment$key,
} from 'src/__generated__/ResourceGroupFairShareTableFragment.graphql';

type ResourceGroup = NonNullable<
  ResourceGroupFairShareTableFragment$data[number]
>;

const availableResourceGroupSorterKeys = ['name'] as const;
export const availableResourceGroupSorterValues = [
  ...availableResourceGroupSorterKeys,
  ...availableResourceGroupSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) => {
  return _.includes(availableResourceGroupSorterKeys, key);
};

interface ResourceGroupFairShareTableProps
  extends BAITableProps<ResourceGroup> {
  resourceGroupNodeFragment: ResourceGroupFairShareTableFragment$key | null;
  onClickGroupName?: (resourceGroupName: string) => void;
}

const ResourceGroupFairShareTable: React.FC<
  ResourceGroupFairShareTableProps
> = ({ resourceGroupNodeFragment, onClickGroupName, ...tableProps }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const { mergedResourceSlots } = useResourceSlotsDetails();

  const [selectedResourceGroup, setSelectedResourceGroup] =
    useState<ResourceGroup | null>(null);

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableResourceGroupSorterValues),
      filter: parseAsString,
    },
    {
      history: 'replace',
    },
  );

  const resourceGroups = useFragment(
    graphql`
      fragment ResourceGroupFairShareTableFragment on ResourceGroup
      @relay(plural: true) {
        id
        name
        fairShareSpec {
          halfLifeDays
          lookbackDays
          decayUnitDays
          defaultWeight
          resourceWeights {
            entries {
              resourceType
              quantity
            }
          }
        }
        resourceInfo {
          capacity {
            entries {
              resourceType
              quantity
            }
          }
          used {
            entries {
              resourceType
              quantity
            }
          }
        }

        ...ResourceGroupFairShareSettingModalFragment
      }
    `,
    resourceGroupNodeFragment,
  );

  const columns: ColumnsType<ResourceGroup> = [
    {
      title: t('fairShare.Name'),
      key: 'name',
      fixed: 'left',
      dataIndex: 'name',
      sorter: isEnableSorter('name'),
      render: (name) => (
        <BAIFlex gap="xxs" align="center">
          <Tooltip
            title={t('fairShare.GoToSubComponent', {
              sub: t('fairShare.Domain'),
            })}
          >
            <BAILink
              icon={<ChevronRight />}
              onClick={() => onClickGroupName?.(name)}
            >
              {name}
            </BAILink>
          </Tooltip>
        </BAIFlex>
      ),
    },
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'left',
      render: (_text, record) => (
        <BAIFlex direction="row" gap="xxs">
          <Button
            type="text"
            icon={<SettingOutlined style={{ color: token.colorInfo }} />}
            onClick={() => setSelectedResourceGroup(record)}
          />
        </BAIFlex>
      ),
    },
    {
      title: t('fairShare.Allocations'),
      key: 'allocations',
      width: 300,
      render: (_value, record) => {
        const capacityEntries = record?.resourceInfo?.capacity?.entries;
        const usedEntries = record?.resourceInfo?.used?.entries;
        return _.isEmpty(capacityEntries)
          ? '-'
          : _.map(capacityEntries, ({ resourceType, quantity }) => {
              const percent =
                quantity === 0
                  ? 0
                  : ((usedEntries?.find((e) => e.resourceType === resourceType)
                      ?.quantity ?? 0) /
                      quantity) *
                    100;
              return (
                <BAIFlex
                  key={resourceType}
                  justify="between"
                  style={{ minWidth: 220 }}
                >
                  <BAIFlex gap="xxs">
                    <ResourceTypeIcon key={resourceType} type={resourceType} />
                    <Typography.Text>
                      {resourceType === 'mem'
                        ? `${convertToBinaryUnit(usedEntries?.find((e) => e.resourceType === resourceType)?.quantity ?? 0, 'g', 0)?.numberFixed ?? 0} / ${convertToBinaryUnit(quantity, 'g', 0)?.numberFixed ?? 0}`
                        : `${usedEntries?.find((e) => e.resourceType === resourceType)?.quantity ?? 0} / ${quantity}`}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: token.sizeXS }}
                    >
                      {mergedResourceSlots?.[resourceType]?.display_unit}
                    </Typography.Text>
                  </BAIFlex>
                  <BAIProgressWithLabel
                    percent={percent}
                    strokeColor={
                      percent > 80 ? token.colorError : token.colorSuccess
                    }
                    width={120}
                    valueLabel={
                      toFixedFloorWithoutTrailingZeros(percent, 1) + ' %'
                    }
                  />
                </BAIFlex>
              );
            });
      },
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.DecayUnitDays')}
          <QuestionIconWithTooltip
            title={t('fairShare.DecayUnitDaysDescription')}
          />
        </BAIFlex>
      ),
      key: 'decayUnitDays',
      sorter: isEnableSorter('decayUnitDays'),
      dataIndex: ['fairShareSpec', 'decayUnitDays'],
      render: (value) => <BAIFlex>{t('general.Days', { num: value })}</BAIFlex>,
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.HalfLifeDays')}
          <QuestionIconWithTooltip
            title={t('fairShare.HalfLifeDaysDescription')}
          />
        </BAIFlex>
      ),
      key: 'halfLifeDays',
      dataIndex: ['fairShareSpec', 'halfLifeDays'],
      render: (value) => <BAIFlex>{t('general.Days', { num: value })}</BAIFlex>,
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.LookbackDays')}
          <QuestionIconWithTooltip
            title={t('fairShare.LookbackDaysDescription')}
          />
        </BAIFlex>
      ),
      key: 'lookbackDays',
      sorter: isEnableSorter('lookbackDays'),
      dataIndex: ['fairShareSpec', 'lookbackDays'],
      render: (value) => <BAIFlex>{t('general.Days', { num: value })}</BAIFlex>,
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.DefaultWeight')}
          <QuestionIconWithTooltip
            title={t('fairShare.DefaultWeightDescription')}
          />
        </BAIFlex>
      ),
      key: 'defaultWeight',
      sorter: isEnableSorter('defaultWeight'),
      dataIndex: ['fairShareSpec', 'defaultWeight'],
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.ResourceWeights')}
          <QuestionIconWithTooltip
            title={t('fairShare.ResourceWeightsDescription')}
          />
        </BAIFlex>
      ),
      key: 'resourceWeights',
      sorter: isEnableSorter('resourceWeights'),
      dataIndex: ['fairShareSpec', 'resourceWeights', 'entries'],
      render: (entries) => {
        return _.isEmpty(entries)
          ? '-'
          : _.map(entries, (rw: any) => (
              <BAIResourceNumberWithIcon
                key={rw.resourceType}
                type={rw.resourceType}
                value={rw.quantity}
              />
            ));
      },
    },
  ];

  return (
    <>
      <BAITable
        rowKey={'id'}
        scroll={{ x: 'max-content' }}
        {...tableProps}
        dataSource={resourceGroups || []}
        columns={columns}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({
            order:
              (order as (typeof availableResourceGroupSorterValues)[number]) ||
              null,
          });
        }}
      />

      <BAIUnmountAfterClose>
        <ResourceGroupFairShareSettingModal
          resourceGroupNodeFrgmt={selectedResourceGroup}
          open={!!selectedResourceGroup}
          onRequestClose={() => setSelectedResourceGroup(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default ResourceGroupFairShareTable;
