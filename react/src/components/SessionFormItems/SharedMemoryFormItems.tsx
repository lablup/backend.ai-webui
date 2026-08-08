/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { compareNumberWithUnits, convertToBinaryUnit } from '../../helper';
import { theme } from '../../theme-shim';
import { MergedResourceAllocationFormValue } from './ResourceAllocationFormItems';
import { Divider } from '@astryxdesign/core/Divider';
import { Switch } from '@astryxdesign/core/Switch';
import {
  BAIQuestionIconWithTooltip,
  BAIDynamicUnitInputNumber,
  BAIDynamicUnitInputNumberProps,
  BAIFlex,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

/**
 * The auto/manual shared-memory toggle. A local adapter rather than the shared
 * `AstryxFormSwitch`, because the visible label flips with the state. The two
 * `Form.Item` contracts are honoured inline.
 */
const AutomaticShmemSwitch: React.FC<{
  autoLabel: string;
  manualLabel: string;
  onToggle?: (checked: boolean) => void;
  /** Injected by `Form.Item valuePropName="checked"`. */
  checked?: boolean;
  /** Injected by `Form.Item`. */
  onChange?: (value: boolean) => void;
}> = ({ autoLabel, manualLabel, onToggle, checked, onChange }) => {
  'use memo';
  return (
    <Switch
      size="sm"
      label={checked ? autoLabel : manualLabel}
      value={checked ?? false}
      onChange={(next) => {
        onChange?.(next);
        onToggle?.(next);
      }}
    />
  );
};

interface SharedMemoryFormItemsProps {
  min?: string;
  onChangeResourceShmem?: BAIDynamicUnitInputNumberProps['onChange'];
  /**
   * antd `SwitchProps['onChange']` was `(checked, event) => void`; Astryx
   * `Switch` fires the same shape, so the callback contract is unchanged —
   * only the antd TYPE import is gone (P15).
   */
  onChangeAutomaticShmem?: (checked: boolean) => void;
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
            {/* PILOT-DECISION: this was never an input. It was an antd
                `Slider` with its handle hidden, `cursor: default`, and a
                `ConfigProvider` block repainting rail/track — i.e. a two-tone
                READ-ONLY bar showing the application-memory / shared-memory
                split. MAPPING §3.11 gives `ProgressBar`, but its track colour
                is theme-owned and cannot carry the warning hue that the legend
                directly below names ("yellow = shared memory"), so flattening
                to a ProgressBar would break the legend's contract.
                It becomes two plain boxes sized by the same numbers, painted
                from the SAME theme-shim tokens the legend swatches already
                use — no antd, no per-component CSS file, and the light/dark
                pairs come from the shim. */}
            <BAIFlex direction="row" gap={'sm'}>
              <div
                role="img"
                aria-label={t('session.launcher.SharedMemory', {
                  value: shmemUnitResult?.value,
                })}
                style={{
                  flex: 1,
                  display: 'flex',
                  height: token.fontSize,
                  overflow: 'hidden',
                  backgroundColor: token.colorWarningBorderHover,
                }}
              >
                <div
                  style={{
                    // Set the denominator to 1 so the bar still renders when
                    // both the value and the max are 0.
                    width: `${
                      ((appMemUnitResult?.number ?? 0) /
                        (memUnitResult?.number || 1)) *
                      100
                    }%`,
                    backgroundColor: token.colorSuccessBorderHover,
                  }}
                />
              </div>
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
                  dependencies={[['resource', 'mem'], 'enabledAutomaticShmem']}
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
                    defaultUnit="g"
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
                    {/* MAPPING §4: `checked` -> `value`, `size="small"` ->
                        `sm`. PILOT-DECISION: `checkedChildren` /
                        `unCheckedChildren` (the "Auto"/"Manual" text INSIDE
                        the track) have no Astryx counterpart and become the
                        Switch's own `label`, rendered beside it — the same two
                        words, now also the accessible name the antd version
                        lacked (it only had a `title` attribute). */}
                    <AutomaticShmemSwitch
                      autoLabel={t('general.Auto')}
                      manualLabel={t('general.Manual')}
                      onToggle={onChangeAutomaticShmem}
                    />
                  </Form.Item>
                  <BAIQuestionIconWithTooltip
                    title={
                      <BAIFlex direction="column">
                        {t('session.launcher.AutoSharedMemoryTooltip')}
                        {/* The explicit margin/background overrides go with
                            the antd Divider — Astryx's owns its spacing and
                            colour from the theme. */}
                        <Divider />
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
