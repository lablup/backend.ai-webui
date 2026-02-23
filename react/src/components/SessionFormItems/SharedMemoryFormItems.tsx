/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { compareNumberWithUnits, convertToBinaryUnit } from '../../helper';
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { MergedResourceAllocationFormValue } from './ResourceAllocationFormItems';
import {
  ConfigProvider,
  Divider,
  Form,
  Slider,
  Switch,
  SwitchProps,
  theme,
} from 'antd';
import {
  BAIDynamicUnitInputNumber,
  BAIDynamicUnitInputNumberProps,
  BAIFlex,
} from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface SharedMemoryFormItemsProps {
  min?: string;
  onChangeResourceShmem?: BAIDynamicUnitInputNumberProps['onChange'];
  onChangeAutomaticShmem?: SwitchProps['onChange'];
}

const SharedMemoryFormItems: React.FC<SharedMemoryFormItemsProps> = ({
  min,
  onChangeResourceShmem,
  onChangeAutomaticShmem,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <Form.Item<MergedResourceAllocationFormValue>
      noStyle
      dependencies={[
        ['resource', 'mem'],
        ['resource', 'shmem'],
        ['enabledAutomaticShmem'],
      ]}
    >
      {({ getFieldValue }) => {
        const mem = getFieldValue(['resource', 'mem']) || '0g';
        const shmem = getFieldValue(['resource', 'shmem']) || '0g';
        const memUnitResult = convertToBinaryUnit(mem, 'auto', 2);
        const shmemUnitResult = convertToBinaryUnit(shmem, 'auto', 2);
        const appMemUnitResult = convertToBinaryUnit(
          _.max([
            0,
            (convertToBinaryUnit(mem, 'm')?.number || 0) -
              (convertToBinaryUnit(shmem, 'm')?.number || 0),
          ]) + 'm',
          memUnitResult?.unit || '',
        );

        return (
          <BAIFlex direction="column" align="stretch" gap="xs">
            <BAIFlex direction="row" gap={'sm'}>
              <ConfigProvider
                theme={{
                  components: {
                    Slider: {
                      railBg: token.colorWarningBorderHover,
                      railHoverBg: token.colorWarningBorderHover,
                      trackBg: token.colorSuccessBorderHover,
                      trackHoverBg: token.colorSuccessBorderHover,
                      railSize: token.fontSize,
                    },
                  },
                }}
              >
                <Slider
                  style={{
                    flex: 1,
                    margin: 0,
                    cursor: 'default',
                    padding: 0,
                  }}
                  styles={{
                    handle: {
                      display: 'none',
                      top: 2,
                    },
                    root: {
                      height: '1em',
                    },
                  }}
                  step={0.001}
                  value={appMemUnitResult?.number}
                  // Set to 1 to fix UI update issue where slider doesn't rerender when both value and max are 0
                  max={memUnitResult?.number || 1}
                />
              </ConfigProvider>
            </BAIFlex>
            <BAIFlex
              direction="row"
              gap={'xxs'}
              justify="between"
              wrap="wrap"
              style={{
                minHeight: token.controlHeightSM,
              }}
            >
              <BAIFlex gap={'xxs'}>
                <div
                  style={{
                    height: token.fontSize,
                    width: token.fontSize,
                    backgroundColor: token.colorSuccessBorderHover,
                  }}
                ></div>
                {t('session.launcher.ApplicationMemory', {
                  value: appMemUnitResult?.value,
                })}
              </BAIFlex>
              <BAIFlex gap={'xxs'}>
                <div
                  style={{
                    height: token.fontSize,
                    width: token.fontSize,
                    backgroundColor: token.colorWarningBorderHover,
                  }}
                ></div>
                {getFieldValue('enabledAutomaticShmem') &&
                  t('session.launcher.SharedMemory', {
                    value: shmemUnitResult?.value,
                  })}
                <Form.Item
                  noStyle
                  name={['resource', 'shmem']}
                  hidden={getFieldValue('enabledAutomaticShmem')}
                  dependencies={[['resource', 'mem']]}
                  rules={[
                    {
                      required: true,
                      message: t('general.ValueRequired', {
                        name: t('session.launcher.SharedMemory'),
                      }),
                    },
                    {
                      warningOnly: true,
                      validator: async (_rule, value: string) => {
                        // Skip validation when automatic shmem is enabled,
                        // since the system controls shmem in auto mode
                        if (getFieldValue('enabledAutomaticShmem')) {
                          return Promise.resolve();
                        }

                        const currentMem =
                          getFieldValue(['resource', 'mem']) || '0g';
                        const shmem = value;

                        if (_.isEmpty(currentMem) || _.isEmpty(shmem)) {
                          return Promise.resolve();
                        }

                        const memInM =
                          convertToBinaryUnit(currentMem, 'm')?.number || 0;
                        const shmemInM =
                          convertToBinaryUnit(shmem, 'm')?.number || 0;
                        const applicationMemInM = Math.max(
                          0,
                          memInM - shmemInM,
                        );

                        if (applicationMemInM < shmemInM * 2) {
                          throw t(
                            'session.launcher.SHMEMShouldBeLessThanHalfOfAppMemory',
                          );
                        } else {
                          return Promise.resolve();
                        }
                      },
                    },
                    {
                      validator: async (_rule, value: string) => {
                        if (
                          _.isEmpty(getFieldValue(['resource', 'mem'])) ||
                          _.isEmpty(value) ||
                          compareNumberWithUnits(
                            getFieldValue(['resource', 'mem']),
                            value,
                          ) >= 0
                        ) {
                          return Promise.resolve();
                        } else {
                          throw t(
                            'resourcePreset.SHMEMShouldBeSmallerThanMemory',
                          );
                        }
                      },
                    },
                  ]}
                >
                  <BAIDynamicUnitInputNumber
                    min={min}
                    size="small"
                    addonPrefix={'SHM'}
                    max={getFieldValue(['resource', 'mem']) || '0g'}
                    onChange={onChangeResourceShmem}
                  />
                </Form.Item>
                <BAIFlex direction="row" gap="xs">
                  <Form.Item
                    noStyle
                    name={'enabledAutomaticShmem'}
                    valuePropName="checked"
                  >
                    <Switch
                      size="small"
                      title="auto"
                      checkedChildren={t('general.Auto')}
                      unCheckedChildren={t('general.Manual')}
                      onChange={onChangeAutomaticShmem}
                    />
                  </Form.Item>
                  <QuestionIconWithTooltip
                    title={
                      <BAIFlex direction="column">
                        {t('session.launcher.AutoSharedMemoryTooltip')}
                        <Divider
                          style={{
                            margin: 0,
                            marginBlock: token.marginSM,
                            backgroundColor: token.colorBorderSecondary,
                          }}
                        />
                        <Trans i18nKey={'session.launcher.DescSharedMemory'} />
                        <br />
                        <br />
                        <Trans
                          i18nKey={'session.launcher.DescSharedMemoryContext'}
                        />
                      </BAIFlex>
                    }
                  />
                </BAIFlex>
              </BAIFlex>
            </BAIFlex>
          </BAIFlex>
        );
      }}
    </Form.Item>
  );
};

export default SharedMemoryFormItems;
