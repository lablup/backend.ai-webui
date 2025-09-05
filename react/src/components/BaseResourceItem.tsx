import { ResourceSlotDetail } from '../hooks/backendai';
import { Empty, theme } from 'antd';
import {
  BAIFlex,
  BAIResourceWithSteppedProgress,
  BAIResourceWithSteppedProgressProps,
  BAIRowWrapWithDividers,
  compareNumberWithUnits,
  convertToBinaryUnit,
  getDisplayUnitToInputSizeUnit,
} from 'backend.ai-ui';
import _ from 'lodash';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface ResourceValues {
  current: number | string;
  total?: number | string;
  displayUnit?: string;
}

export interface AcceleratorSlotDetail {
  key: string;
  resourceSlot: ResourceSlotDetail;
  values: ResourceValues;
}

export interface BaseResourceItemProps {
  getResourceValue: (resource: string) => ResourceValues;
  acceleratorSlotsDetails: AcceleratorSlotDetail[];
  resourceSlotsDetails: any;
  progressProps?: Partial<BAIResourceWithSteppedProgressProps>;
  extraActions?: ReactNode;
}

const UNLIMITED_VALUES = [NaN, Infinity, Number.MAX_SAFE_INTEGER, undefined];
const UNLIMITED_VALUE_STRING = '∞';

const replaceUnlimitedValues = (value: string | number | undefined) => {
  if (_.includes(UNLIMITED_VALUES, value)) {
    return UNLIMITED_VALUE_STRING;
  }
  return value;
};

const BaseResourceItem: React.FC<BaseResourceItemProps> = ({
  getResourceValue,
  acceleratorSlotsDetails,
  resourceSlotsDetails,
  progressProps,
}) => {
  const { showProgress = true, steps } = progressProps || {};
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const renderResourceProgress = (
    values: ResourceValues,
    resourceSlot: ResourceSlotDetail,
  ) => {
    const convertBinaryValue = (v: number | string) =>
      resourceSlot.slot_name === 'ram' &&
      !_.isEqual(replaceUnlimitedValues(v), UNLIMITED_VALUE_STRING)
        ? convertToBinaryUnit(
            v,
            getDisplayUnitToInputSizeUnit(resourceSlot.display_unit),
          )
        : undefined;
    const currentValue =
      convertBinaryValue(values.current)?.value ||
      replaceUnlimitedValues(values.current) ||
      0;
    const progressProps: BAIResourceWithSteppedProgressProps = {
      current: currentValue,
      title: resourceSlot.human_readable_name,
      displayUnit: values.displayUnit || resourceSlot.display_unit,
      showProgress,
    };

    if (showProgress) {
      progressProps.total =
        convertBinaryValue(values.total ?? UNLIMITED_VALUE_STRING)?.value ||
        replaceUnlimitedValues(values.total) ||
        0;
      progressProps.steps = steps;
      progressProps.unlimitedValue = UNLIMITED_VALUE_STRING;
    }

    return <BAIResourceWithSteppedProgress {...progressProps} />;
  };

  const cpuValues = getResourceValue('cpu');
  const memValues = getResourceValue('mem');

  const shouldShowCpu =
    _.get(resourceSlotsDetails, 'resourceSlotsInRG.cpu') &&
    (_.isUndefined(cpuValues.total) ||
      (_.isNumber(cpuValues.total) && _.toNumber(cpuValues.total) > 0));

  const shouldShowMemory =
    _.get(resourceSlotsDetails, 'resourceSlotsInRG.mem') &&
    (_.isUndefined(memValues.total) ||
      compareNumberWithUnits(memValues.total, 0) > 0);

  const visibleAccelerators = _.filter(
    acceleratorSlotsDetails,
    ({ resourceSlot, values }) =>
      resourceSlot &&
      (_.isUndefined(values.total) ||
        (Number.isFinite(_.toNumber(values.total)) &&
          _.toNumber(values.total) > 0)),
  );

  const isEmpty =
    !shouldShowCpu && !shouldShowMemory && visibleAccelerators.length === 0;

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {isEmpty ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('statistics.prometheus.NoMetricsToDisplay')}
        />
      ) : (
        <BAIFlex direction="row" wrap="wrap" gap={'lg'}>
          <BAIRowWrapWithDividers
            rowGap={token.marginXL}
            columnGap={token.marginXXL}
            dividerWidth={1}
          >
            {shouldShowCpu && (
              <BAIStatisticItemWrap>
                {renderResourceProgress(
                  cpuValues,
                  resourceSlotsDetails.resourceSlotsInRG['cpu'],
                )}
              </BAIStatisticItemWrap>
            )}

            {shouldShowMemory && (
              <BAIStatisticItemWrap>
                {renderResourceProgress(
                  memValues,
                  resourceSlotsDetails.resourceSlotsInRG['mem'],
                )}
              </BAIStatisticItemWrap>
            )}
          </BAIRowWrapWithDividers>
          {visibleAccelerators.length > 0 && (
            <BAIRowWrapWithDividers
              rowGap={token.marginXL}
              columnGap={token.marginXXL}
              dividerColor={token.colorBorder}
              dividerWidth={1}
              style={{
                backgroundColor: token.colorSuccessBg,
                borderRadius: token.borderRadiusLG,
                padding: token.padding,
              }}
            >
              {_.map(visibleAccelerators, ({ key, resourceSlot, values }) => (
                <BAIStatisticItemWrap key={key}>
                  {renderResourceProgress(values, resourceSlot)}
                </BAIStatisticItemWrap>
              ))}
            </BAIRowWrapWithDividers>
          )}
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

export default BaseResourceItem;

export const BAIStatisticItemWrap: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <BAIFlex direction="row" align="stretch">
      <BAIFlex
        justify="start"
        align="start"
        style={{
          overflow: 'break-word',
          minWidth: 82,
          minHeight: 84,
        }}
      >
        {children}
      </BAIFlex>
    </BAIFlex>
  );
};
