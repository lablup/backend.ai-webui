/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import { formatDuration } from '../../helper';
import DatePickerISO from '../DatePickerISO';
import { InputGroup } from '@lablup/ui-common/InputGroup';
import {
  BAICheckboxInput,
  BAIFlex,
  BAIIntervalView,
  BAINumberInput,
  BAISelector,
  BAITextArea,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface BatchSessionFormItemsProps {
  /** 'command' = start command only, 'options' = schedule + timeout only. */
  part?: 'all' | 'command' | 'options';
}

const BatchSessionFormItems: React.FC<BatchSessionFormItemsProps> = ({
  part = 'all',
}) => {
  'use memo';
  const { t } = useTranslation();
  const form = Form.useFormInstance();

  const showCommand = part === 'all' || part === 'command';
  const showOptions = part === 'all' || part === 'options';

  return (
    <>
      {showCommand && (
        <Form.Item
          label={t('session.launcher.StartUpCommand')}
          name={['batch', 'command']}
          rules={[
            {
              required: true,
              type: 'string',
            },
          ]}
        >
          <BAITextArea aria-label={t('session.launcher.StartUpCommand')} />
        </Form.Item>
      )}
      {showOptions && (
        <>
          <Form.Item noStyle dependencies={[['batch', 'scheduleDate']]}>
            {() => {
              const scheduleDate = form.getFieldValue([
                'batch',
                'scheduleDate',
              ]);
              return (
                <BAIIntervalView
                  delay={1000}
                  callback={() => {
                    const scheduleDate = form.getFieldValue([
                      'batch',
                      'scheduleDate',
                    ]);
                    if (scheduleDate) {
                      if (dayjs(scheduleDate).isBefore(dayjs())) {
                        if (
                          form.getFieldError(['batch', 'scheduleDate'])
                            .length === 0
                        ) {
                          form.validateFields([['batch', 'scheduleDate']]);
                        }
                        return undefined;
                      } else {
                        return dayjs(scheduleDate).fromNow();
                      }
                    } else {
                      return undefined;
                    }
                  }}
                  triggerKey={scheduleDate ? scheduleDate : 'none'}
                  render={(time) => {
                    return (
                      <Form.Item
                        label={t('session.launcher.SessionStartTime')}
                        extra={time}
                      >
                        <BAIFlex direction="row" gap={'xs'}>
                          <Form.Item
                            noStyle
                            name={['batch', 'enabled']}
                            valuePropName="checked"
                          >
                            <BAICheckboxInput
                              onChange={(checked) => {
                                if (
                                  checked &&
                                  _.isEmpty(
                                    form.getFieldValue([
                                      'batch',
                                      'scheduleDate',
                                    ]),
                                  )
                                ) {
                                  form.setFieldValue(
                                    ['batch', 'scheduleDate'],
                                    dayjs().add(2, 'minutes').toISOString(),
                                  );
                                } else if (checked === false) {
                                  form.setFieldValue(
                                    ['batch', 'scheduleDate'],
                                    undefined,
                                  );
                                }
                                form.validateFields([
                                  ['batch', 'scheduleDate'],
                                ]);
                              }}
                            >
                              {t('session.launcher.Enable')}
                            </BAICheckboxInput>
                          </Form.Item>
                          <Form.Item
                            noStyle
                            shouldUpdate={(prev, next) => {
                              return (
                                // @ts-ignore
                                prev.batch?.enabled !== next.batch?.enabled
                              );
                            }}
                          >
                            {() => {
                              const disabled =
                                form.getFieldValue('batch')?.enabled !== true;
                              return (
                                <Form.Item
                                  name={['batch', 'scheduleDate']}
                                  noStyle
                                  rules={[
                                    {
                                      validator: async (_rule, value) => {
                                        if (
                                          value &&
                                          dayjs(value).isBefore(dayjs())
                                        ) {
                                          return Promise.reject(
                                            t(
                                              'session.launcher.StartTimeMustBeInTheFuture',
                                            ),
                                          );
                                        }
                                        return Promise.resolve();
                                      },
                                    },
                                  ]}
                                >
                                  <DatePickerISO
                                    disabled={disabled}
                                    showTime
                                    localFormat
                                    disabledDate={(value) => {
                                      return value.isBefore(
                                        dayjs().startOf('day'),
                                      );
                                    }}
                                  />
                                </Form.Item>
                              );
                            }}
                          </Form.Item>
                        </BAIFlex>
                      </Form.Item>
                    );
                  }}
                />
              );
            }}
          </Form.Item>

          <Form.Item
            noStyle
            dependencies={[
              ['batch', 'timeoutEnabled'],
              ['batch', 'timeoutUnit'],
            ]}
          >
            {() => {
              const timeout = form.getFieldValue(['batch', 'timeout']);
              const unit = form.getFieldValue(['batch', 'timeoutUnit']);

              const timeDuration = dayjs.duration(timeout, unit ?? 's');

              const formattedDuration = formatDuration(timeDuration, t);

              const durationText =
                !_.isNull(timeout) && _.toFinite(timeout) > 0
                  ? formattedDuration
                  : null;
              return (
                <Form.Item
                  label={t('session.launcher.BatchJobTimeoutDuration')}
                  tooltip={t('session.launcher.BatchJobTimeoutDurationDesc')}
                  help={durationText}
                >
                  <BAIFlex direction="row" gap={'xs'}>
                    <Form.Item
                      noStyle
                      name={['batch', 'timeoutEnabled']}
                      valuePropName="checked"
                    >
                      <BAICheckboxInput
                        onChange={(checked) => {
                          if (checked === false) {
                            form.setFieldValue(['batch', 'timeout'], undefined);
                          }
                          form.validateFields([['batch', 'timeout']]);
                        }}
                      >
                        {t('session.launcher.Enable')}
                      </BAICheckboxInput>
                    </Form.Item>
                    <Form.Item
                      noStyle
                      dependencies={[['batch', 'timeoutEnabled']]}
                    >
                      {() => {
                        const disabled =
                          form.getFieldValue(['batch', 'timeoutEnabled']) !==
                          true;
                        return (
                          // The Form.Item above renders the visible label, so
                          // the group's own label stays hidden.
                          <InputGroup
                            label={t(
                              'session.launcher.BatchJobTimeoutDuration',
                            )}
                            isLabelHidden
                          >
                            <Form.Item
                              name={['batch', 'timeout']}
                              label={t(
                                'session.launcher.BatchJobTimeoutDuration',
                              )}
                              noStyle
                              dependencies={[['batch', 'timeoutEnabled']]}
                              rules={[
                                {
                                  min: 0,
                                  type: 'number',
                                  message: t('error.AllowsPositiveNumberOnly'),
                                },
                                {
                                  required: !disabled,
                                },
                              ]}
                            >
                              {/* The form engine composes this `onChange` after its own. */}
                              <BAINumberInput
                                width="100%"
                                aria-label={t(
                                  'session.launcher.BatchJobTimeoutDuration',
                                )}
                                disabled={disabled}
                                min={1}
                                onChange={() => {
                                  form.validateFields([
                                    ['batch', 'timeoutUnit'],
                                  ]);
                                }}
                              />
                            </Form.Item>
                            <Form.Item
                              noStyle
                              name={['batch', 'timeoutUnit']}
                              dependencies={[
                                ['batch', 'timeout'],
                                ['batch', 'timeoutEnabled'],
                              ]}
                              rules={[
                                ({ getFieldValue }) => ({
                                  validator() {
                                    const timeout = getFieldValue([
                                      'batch',
                                      'timeout',
                                    ]);
                                    const timeoutEnabled = getFieldValue([
                                      'batch',
                                      'timeoutEnabled',
                                    ]);
                                    if (
                                      timeoutEnabled === true &&
                                      (timeout === undefined ||
                                        timeout === null ||
                                        timeout < 1)
                                    ) {
                                      return Promise.reject();
                                    }
                                    return Promise.resolve();
                                  },
                                }),
                              ]}
                            >
                              {/* No localized "Unit" string exists, so the accessible name repeats the group label. */}
                              <BAISelector
                                aria-label={t(
                                  'session.launcher.BatchJobTimeoutDuration',
                                )}
                                disabled={disabled}
                                width={100}
                                options={[
                                  { label: t('time.Sec'), value: 's' },
                                  { label: t('time.Min'), value: 'm' },
                                  { label: t('time.Hour'), value: 'h' },
                                  { label: t('time.Day'), value: 'd' },
                                  { label: t('time.Week'), value: 'w' },
                                ]}
                              />
                            </Form.Item>
                          </InputGroup>
                        );
                      }}
                    </Form.Item>
                  </BAIFlex>
                </Form.Item>
              );
            }}
          </Form.Item>
        </>
      )}
    </>
  );
};

export default BatchSessionFormItems;
