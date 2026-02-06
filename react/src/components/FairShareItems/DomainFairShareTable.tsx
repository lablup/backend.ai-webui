import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import FairShareWeightSettingModal from './FairShareWeightSettingModal';
import { SettingOutlined } from '@ant-design/icons';
import { Button, theme, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  BAIFlex,
  BAILink,
  BAIResourceNumberWithIcon,
  BAITable,
  BAITableProps,
  BAIUnmountAfterClose,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ChevronRight } from 'lucide-react';
import { parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  DomainFairShareTableFragment$data,
  DomainFairShareTableFragment$key,
} from 'src/__generated__/DomainFairShareTableFragment.graphql';

export type DomainFairShare = NonNullable<
  DomainFairShareTableFragment$data[number]
>;

const availableDomainFairShareSorterKeys = [
  'domainName',
  'fairShareFactor',
  'createdAt',
] as const;
export const availableDomainFairShareSorterValues = [
  ...availableDomainFairShareSorterKeys,
  ...availableDomainFairShareSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) => {
  return _.includes(availableDomainFairShareSorterKeys, key);
};

interface DomainFairShareTableProps extends BAITableProps<DomainFairShare> {
  domainFairShareNodeFragment: DomainFairShareTableFragment$key | null;
  openBulkSettingModal: boolean;
  selectedRows: Array<DomainFairShare>;
  onRowSelect: (rowKeys: Array<DomainFairShare>) => void;
  afterWeightUpdate?: (success: boolean) => void;
  onClickDomainName?: (domainName: string) => void;
}

const DomainFairShareTable: React.FC<DomainFairShareTableProps> = ({
  domainFairShareNodeFragment,
  openBulkSettingModal: openBulkWeightSettingModal,
  selectedRows,
  onRowSelect,
  onClickDomainName,
  afterWeightUpdate,
  ...tableProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedDomain, setSelectedDomain] = useState<DomainFairShare | null>(
    null,
  );
  const [openWeightSettingModal, setOpenWeightSettingModal] = useState(false);

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableDomainFairShareSorterValues),
    },
    {
      history: 'replace',
    },
  );

  const domainFairShares = useFragment(
    graphql`
      fragment DomainFairShareTableFragment on DomainFairShare
      @relay(plural: true) {
        id
        resourceGroup
        domainName
        spec {
          weight
        }
        calculationSnapshot {
          fairShareFactor
          totalDecayedUsage {
            entries {
              resourceType
              quantity
            }
          }
        }
        createdAt
        updatedAt

        ...FairShareWeightSettingModal_DomainFragment
      }
    `,
    domainFairShareNodeFragment,
  );

  const columns: ColumnsType<DomainFairShare> = [
    {
      title: t('fairShare.Name'),
      key: 'domainName',
      fixed: 'left',
      dataIndex: 'domainName',
      sorter: isEnableSorter('domainName'),
      render: (name) => (
        <BAIFlex gap="xxs" align="center">
          <Tooltip
            title={t('fairShare.GoToSubComponent', {
              sub: t('fairShare.Project'),
            })}
          >
            <BAILink
              icon={<ChevronRight />}
              onClick={() => onClickDomainName?.(name)}
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
            onClick={() => {
              setSelectedDomain(record);
              setOpenWeightSettingModal(true);
            }}
          />
        </BAIFlex>
      ),
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.Weight')}
          <QuestionIconWithTooltip title={t('fairShare.WeightDescription')} />
        </BAIFlex>
      ),
      key: 'weight',
      dataIndex: ['spec', 'weight'],
      render: (weight) =>
        weight ? toFixedFloorWithoutTrailingZeros(weight, 1) : '-',
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.FairShareFactor')}
          <QuestionIconWithTooltip
            title={t('fairShare.FairShareFactorDescription')}
          />
        </BAIFlex>
      ),
      key: 'fairShareFactor',
      dataIndex: ['calculationSnapshot', 'fairShareFactor'],
      sorter: isEnableSorter('fairShareFactor'),
      render: (fairShareFactor) =>
        fairShareFactor !== null && fairShareFactor !== undefined
          ? toFixedFloorWithoutTrailingZeros(fairShareFactor, 2)
          : '-',
    },
    {
      title: (
        <BAIFlex gap="xxs">
          {t('fairShare.TotalUsage')}
          <QuestionIconWithTooltip
            title={t('fairShare.TotalUsageDescription')}
          />
        </BAIFlex>
      ),
      key: 'totalUsage',
      dataIndex: ['calculationSnapshot', 'totalDecayedUsage', 'entries'],
      render: (entries) => {
        return _.isEmpty(entries) ? (
          '-'
        ) : (
          <BAIFlex wrap="wrap" gap="sm">
            {_.map(
              entries,
              (entry: { resourceType: string; quantity: number }) => (
                <BAIResourceNumberWithIcon
                  key={entry.resourceType}
                  type={entry.resourceType}
                  value={toFixedFloorWithoutTrailingZeros(entry.quantity, 2)}
                />
              ),
            )}
          </BAIFlex>
        );
      },
    },
    {
      title: t('general.ModifiedAt'),
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      render: (date) => dayjs(date).format('lll'),
    },
    {
      title: t('general.CreatedAt'),
      key: 'createdAt',
      dataIndex: 'createdAt',
      sorter: isEnableSorter('createdAt'),
      render: (date) => dayjs(date).format('lll'),
    },
  ];

  return (
    <>
      <BAITable
        rowKey={'domainName'}
        scroll={{ x: 'max-content' }}
        {...tableProps}
        dataSource={domainFairShares || []}
        columns={columns}
        rowSelection={{
          type: 'checkbox',
          onChange: (_selectedRowKeys, selectedRows) => {
            onRowSelect(selectedRows);
          },
          selectedRowKeys: _.map(selectedRows, 'domainName'),
        }}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({
            order:
              (order as (typeof availableDomainFairShareSorterValues)[number]) ||
              null,
          });
        }}
      />

      <BAIUnmountAfterClose>
        <FairShareWeightSettingModal
          domainFairShareFrgmt={
            openBulkWeightSettingModal
              ? selectedRows
              : selectedDomain
                ? [selectedDomain]
                : null
          }
          isBulkEdit={openBulkWeightSettingModal}
          open={openWeightSettingModal || openBulkWeightSettingModal}
          onRequestClose={(success) => {
            if (success) {
              afterWeightUpdate?.(true);
            }
            setSelectedDomain(null);
            setOpenWeightSettingModal(false);
            afterWeightUpdate?.(false);
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default DomainFairShareTable;
