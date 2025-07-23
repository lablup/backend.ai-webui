import { ResourceSlotDetail } from '../hooks/backendai';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { Empty, Segmented, theme, Typography } from 'antd';
import {
  Flex,
  BAIResourceWithSteppedProgress,
  BAIResourceWithSteppedProgressProps,
  compareNumberWithUnits,
} from 'backend.ai-ui';
import _ from 'lodash';
import { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

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
  title: ReactNode | string;
  tooltip?: string;
  isRefetching?: boolean;
  displayType: 'usage' | 'remaining';
  onDisplayTypeChange: (type: 'usage' | 'remaining') => void;
  onRefetch: () => void;
  getResourceValue: (resource: string) => ResourceValues;
  acceleratorSlotsDetails: AcceleratorSlotDetail[];
  resourceSlotsDetails: any;
  progressProps?: Partial<BAIResourceWithSteppedProgressProps>;
}

const BaseResourceItem: React.FC<BaseResourceItemProps> = ({
  title,
  tooltip,
  isRefetching,
  displayType,
  onDisplayTypeChange,
  onRefetch,
  getResourceValue,
  acceleratorSlotsDetails,
  resourceSlotsDetails,
  progressProps,
}) => {
  const { showProgress = true, unlimitedValues, steps } = progressProps || {};
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const renderResourceProgress = (
    values: ResourceValues,
    resourceSlot: ResourceSlotDetail,
  ) => {
    const progressProps: BAIResourceWithSteppedProgressProps = {
      current: values.current,
      title: resourceSlot.human_readable_name,
      displayUnit: values.displayUnit || resourceSlot.display_unit,
    };

    if (showProgress && !_.isUndefined(values.total)) {
      progressProps.total = values.total;
      progressProps.unlimitedValues = unlimitedValues;
      progressProps.steps = steps;
    } else {
      progressProps.showProgress = false;
    }

    return <BAIResourceWithSteppedProgress {...progressProps} />;
  };

  const cpuValues = getResourceValue('cpu');
  const memValues = getResourceValue('mem');

  const shouldShowCpu =
    _.get(resourceSlotsDetails, 'resourceSlotsInRG.cpu') &&
    (_.isUndefined(cpuValues.total) || _.toInteger(cpuValues.total) > 0);

  const shouldShowMemory =
    _.get(resourceSlotsDetails, 'resourceSlotsInRG.mem') &&
    (_.isUndefined(memValues.total) ||
      compareNumberWithUnits(memValues.total, 0));

  const visibleAccelerators = _.filter(
    acceleratorSlotsDetails,
    ({ resourceSlot, values }) =>
      resourceSlot &&
      (_.isUndefined(values.total) || _.toInteger(values.total) > 0),
  );

  const isEmpty =
    !shouldShowCpu && !shouldShowMemory && visibleAccelerators.length === 0;

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{
        paddingLeft: token.paddingXL,
        paddingRight: token.paddingXL,
        height: '100%',
      }}
    >
      {/* Fixed Title Section */}
      <Flex
        align="center"
        justify="between"
        style={{
          paddingLeft: token.paddingMD,
          paddingTop: token.paddingSM,
          paddingBottom: token.paddingSM,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          backgroundColor: token.colorBgContainer,
          zIndex: 1,
        }}
        gap="xs"
        wrap="wrap"
      >
        <Flex gap={'xs'} align="center">
          {typeof title === 'string' ? (
            <Typography.Title level={5} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
          ) : (
            title
          )}
          {tooltip ? (
            <QuestionIconWithTooltip title={<Trans i18nKey={tooltip} />} />
          ) : null}
        </Flex>
        <Flex
          gap={'xs'}
          align="center"
          justify="end"
          style={{ marginLeft: 'auto' }}
        >
          <Flex direction="row" gap="sm">
            <Segmented
              options={[
                {
                  label: t('webui.menu.Usage'),
                  value: 'usage',
                },
                {
                  label: t('webui.menu.Remaining'),
                  value: 'remaining',
                },
              ]}
              value={displayType}
              onChange={(v) => onDisplayTypeChange(v as 'usage' | 'remaining')}
            />
            <BAIFetchKeyButton
              loading={isRefetching}
              value=""
              onChange={onRefetch}
              type="text"
              style={{
                backgroundColor: 'transparent',
                margin: -token.marginXS,
              }}
            />
          </Flex>
        </Flex>
      </Flex>

      {/* Scrollable Content Section */}
      <Flex
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
          <Flex
            direction="column"
            align="stretch"
            style={{ marginTop: token.marginXS, marginBottom: token.marginMD }}
          >
            <Flex
              direction="row"
              wrap="wrap"
              gap={'ms'}
              style={{
                padding: 0,
                margin: 0,
              }}
            >
              {shouldShowCpu && (
                <Flex
                  style={{
                    borderRadius: token.borderRadiusLG,
                    justifyItems: 'center',
                    overflow: 'break-word',
                    padding: token.padding,
                    border: `1px solid ${token.colorBgLayout}`,
                  }}
                >
                  {renderResourceProgress(
                    cpuValues,
                    resourceSlotsDetails.resourceSlotsInRG['cpu'],
                  )}
                </Flex>
              )}

              {shouldShowMemory && (
                <Flex
                  style={{
                    borderRadius: token.borderRadiusLG,
                    justifyItems: 'center',
                    overflow: 'break-word',
                    padding: token.padding,
                    border: `1px solid ${token.colorBgLayout}`,
                  }}
                >
                  {renderResourceProgress(
                    memValues,
                    resourceSlotsDetails.resourceSlotsInRG['mem'],
                  )}
                </Flex>
              )}

              {_.map(visibleAccelerators, ({ key, resourceSlot, values }) => (
                <Flex
                  key={key}
                  style={{
                    backgroundColor: token.colorSuccessBg,
                    borderRadius: token.borderRadiusLG,
                    justifyItems: 'center',
                    overflow: 'break-word',
                    padding: token.padding,
                  }}
                >
                  {renderResourceProgress(values, resourceSlot)}
                </Flex>
              ))}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default BaseResourceItem;
