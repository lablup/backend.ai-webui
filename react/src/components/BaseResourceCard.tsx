import { ResourceSlotDetail } from '../hooks/backendai';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  Col,
  Divider,
  Empty,
  Grid,
  Row,
  Segmented,
  theme,
  Tooltip,
} from 'antd';
import {
  Flex,
  BAIResourceWithSteppedProgress,
  BAIResourceWithSteppedProgressProps,
  BAICard,
  BAICardProps,
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

export interface BaseResourceCardProps extends BAICardProps {
  title: ReactNode;
  tooltipKey?: string;
  isRefetching?: boolean;
  displayType: 'usage' | 'capacity';
  onDisplayTypeChange: (type: 'usage' | 'capacity') => void;
  onRefetch: () => void;
  getResourceValue: (resource: string) => ResourceValues;
  acceleratorSlotsDetails: AcceleratorSlotDetail[];
  resourceSlotsDetails: any;
  progressProps?: Partial<BAIResourceWithSteppedProgressProps>;
}

const BaseResourceCard: React.FC<BaseResourceCardProps> = ({
  title,
  tooltipKey,
  isRefetching,
  displayType,
  onDisplayTypeChange,
  onRefetch,
  getResourceValue,
  acceleratorSlotsDetails,
  resourceSlotsDetails,
  progressProps,
  ...props
}) => {
  const { showProgress = true, unlimitedValues, steps } = progressProps || {};
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { xs } = Grid.useBreakpoint();

  const renderDivider = () =>
    !xs && (
      <Col
        flex="1px"
        style={{
          justifyItems: 'center',
          textAlign: 'center',
          height: 84,
          padding: 0,
        }}
      >
        <Divider type="vertical" style={{ height: '100%' }} />
      </Col>
    );

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
    <BAICard
      {...props}
      title={
        <Flex gap={'xs'} align="center" wrap="wrap">
          {title}
          {tooltipKey && (
            <Tooltip title={<Trans i18nKey={tooltipKey} />}>
              <QuestionCircleOutlined
                style={{ color: token.colorTextDescription }}
              />
            </Tooltip>
          )}
        </Flex>
      }
      styles={{
        body: {
          padding: 0,
          margin: 0,
        },
        title: {
          paddingTop: token.paddingSM,
          paddingBottom: token.paddingSM,
        },
      }}
      extra={
        <Flex direction="row" gap="sm" wrap="wrap">
          <Segmented
            options={[
              {
                label: t('webui.menu.Usage'),
                value: 'usage',
              },
              {
                label: t('webui.menu.Capacity'),
                value: 'capacity',
              },
            ]}
            value={displayType}
            onChange={(v) => onDisplayTypeChange(v as 'usage' | 'capacity')}
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
      }
    >
      {isEmpty ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Row
          gutter={[40, 16]}
          align="middle"
          style={{
            padding: 0,
            margin: token.marginLG,
            marginTop: token.marginSM,
          }}
        >
          {shouldShowCpu && (
            <Col style={{ justifyItems: 'center', overflow: 'break-word' }}>
              {renderResourceProgress(
                cpuValues,
                resourceSlotsDetails.resourceSlotsInRG['cpu'],
              )}
            </Col>
          )}

          {shouldShowMemory && (
            <>
              {renderDivider()}
              <Col style={{ justifyItems: 'center', overflow: 'break-word' }}>
                {renderResourceProgress(
                  memValues,
                  resourceSlotsDetails.resourceSlotsInRG['mem'],
                )}
              </Col>
            </>
          )}

          {visibleAccelerators.length > 0 && (
            <>
              {!xs && (
                <Col
                  flex="1px"
                  style={{
                    justifyItems: 'center',
                    textAlign: 'center',
                    padding: 0,
                    visibility: 'hidden',
                  }}
                >
                  <Divider type="vertical" style={{ height: '100%' }} />
                </Col>
              )}
              {_.map(
                visibleAccelerators,
                ({ key, resourceSlot, values }, index) => (
                  <Flex
                    key={key}
                    style={{
                      backgroundColor: token.colorSuccessBg,
                      borderRadius: token.borderRadiusLG,
                    }}
                  >
                    {index > 0 && renderDivider()}
                    <Col
                      style={{
                        justifyItems: 'center',
                        overflow: 'break-word',
                        paddingTop: token.fontSize,
                        paddingBottom: token.fontSize,
                      }}
                    >
                      {renderResourceProgress(values, resourceSlot)}
                    </Col>
                  </Flex>
                ),
              )}
            </>
          )}
        </Row>
      )}
    </BAICard>
  );
};

export default BaseResourceCard;
