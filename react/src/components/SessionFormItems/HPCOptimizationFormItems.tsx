/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { Grid as AstryxGrid } from '@lablup/ui-common/Grid';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAINumberInput, BAISwitch } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

// These values are spread into the session's `environ` dict, so they stay strings.
const toStringValue = (value: unknown) =>
  _.isNil(value) ? value : String(value);

const HPCOptimizationFormItems: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const form = Form.useFormInstance();

  const threadsTooltip = (
    <>
      {t('session.launcher.OpenMPOptimization')}
      <Trans i18nKey={'session.launcher.DescOpenMPOptimization'} />
    </>
  );

  return (
    <>
      <Form.Item noStyle>
        <BAIFlex direction="row" gap={'sm'}>
          <Text>{t('session.launcher.SwitchOpenMPoptimization')}</Text>
          <Form.Item
            label={t('session.launcher.SwitchOpenMPoptimization')}
            name={['hpcOptimization', 'autoEnabled']}
            valuePropName="checked"
            required
            noStyle
          >
            <BAISwitch
              aria-label={t('session.launcher.SwitchOpenMPoptimization')}
              onChange={(checked) => {
                if (checked) {
                  form.setFieldsValue({
                    hpcOptimization: {
                      autoEnabled: true,
                      OMP_NUM_THREADS: undefined,
                      OPENBLAS_NUM_THREADS: undefined,
                    },
                  });
                } else {
                  form.setFieldsValue({
                    hpcOptimization: {
                      autoEnabled: false,
                      OMP_NUM_THREADS: '1',
                      OPENBLAS_NUM_THREADS: '1',
                    },
                  });
                }
              }}
            />
          </Form.Item>
        </BAIFlex>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          return (
            prev.hpcOptimization?.autoEnabled !==
            next.hpcOptimization?.autoEnabled
          );
        }}
      >
        {() => {
          const enabled = form.getFieldValue([
            'hpcOptimization',
            'autoEnabled',
          ]);
          return (
            // A Grid child defaults to `min-width: auto`; `minWidth: 0` on each
            // item keeps a 100%-wide field from overflowing its track.
            <AstryxGrid
              columns={{ minWidth: 280, max: 2 }}
              gap={4}
              width="100%"
              style={{
                display: enabled ? 'none' : undefined,
                marginTop: token('--spacing-5'),
              }}
            >
              <Form.Item
                style={{ minWidth: 0 }}
                label={t('session.launcher.NumOpenMPthreads')}
                name={['hpcOptimization', 'OMP_NUM_THREADS']}
                getValueFromEvent={toStringValue}
                tooltip={threadsTooltip}
                required
              >
                <BAINumberInput
                  width="100%"
                  aria-label={t('session.launcher.NumOpenMPthreads')}
                  min={1}
                  max={1000}
                  step={1}
                  isIntegerOnly
                />
              </Form.Item>
              <Form.Item
                style={{ minWidth: 0 }}
                label={t('session.launcher.NumOpenBLASthreads')}
                name={['hpcOptimization', 'OPENBLAS_NUM_THREADS']}
                getValueFromEvent={toStringValue}
                tooltip={threadsTooltip}
                required
              >
                <BAINumberInput
                  width="100%"
                  aria-label={t('session.launcher.NumOpenBLASthreads')}
                  min={1}
                  max={1000}
                  step={1}
                  isIntegerOnly
                />
              </Form.Item>
            </AstryxGrid>
          );
        }}
      </Form.Item>
    </>
  );
};

export default HPCOptimizationFormItems;
