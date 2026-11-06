/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form } from '../../form-engine';
import BAIFormItem from '../BAIFormItem';
import {
  DEFAULT_RANGE,
  RANGE_LABEL_KEYS,
  RANGE_PRESETS,
  formatWindowLabel,
} from './panelSettings';
import {
  MAX_WINDOW_DAYS,
  checkWindow,
  fixedWindowOf,
  windowRange,
  type DateTimeWindow,
} from './timeRange';
import type { ISODateTimeString } from '@lablup/ui-common/DateTimeInput';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIDateTimeInput,
  BAIFlex,
  BAIModal,
  BAISelect,
  BAIUnmountAfterClose,
  type BAISelectProps,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CUSTOM = '__custom__';
const INPUT_FORMAT = 'YYYY-MM-DDTHH:mm';

export interface PanelRangeSelectProps extends Omit<
  BAISelectProps,
  'value' | 'onChange' | 'options' | 'mode'
> {
  /** A preset (`now-24h`) or a fixed window (`windowRange`). */
  value?: string;
  onChange?: (range: string) => void;
  /** The longest custom range, in days; `0` offers the presets only. */
  maxDays?: number;
}

/** A card's time range: the presets, the stored fixed window, and "Custom range", which opens a start/end picker. */
const PanelRangeSelect: React.FC<PanelRangeSelectProps> = ({
  value,
  onChange,
  maxDays = MAX_WINDOW_DAYS,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPicking, setIsPicking] = useState(false);
  const range = value ?? DEFAULT_RANGE;
  const windowLabel = formatWindowLabel(range);

  return (
    <>
      <BAISelect
        showSearch={false}
        {...selectProps}
        options={[
          ...RANGE_PRESETS.map((preset) => ({
            value: preset,
            label: t(RANGE_LABEL_KEYS[preset]),
          })),
          ...(maxDays > 0
            ? [
                ...(windowLabel ? [{ value: range, label: windowLabel }] : []),
                { value: CUSTOM, label: t('dashboard.settings.CustomRange') },
              ]
            : []),
        ]}
        value={range}
        onChange={(next: string | null) => {
          if (next === CUSTOM) setIsPicking(true);
          else if (next) onChange?.(next);
        }}
      />
      <BAIUnmountAfterClose>
        <CustomRangeModal
          open={isPicking}
          initial={fixedWindowOf(range)}
          maxDays={maxDays}
          onSubmit={(window) => {
            onChange?.(windowRange(window));
            setIsPicking(false);
          }}
          onRequestClose={() => setIsPicking(false)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

interface CustomRangeValues {
  start?: ISODateTimeString;
  end?: ISODateTimeString;
}

const toInput = (iso: string) =>
  dayjs(iso).format(INPUT_FORMAT) as ISODateTimeString;

const CustomRangeModal: React.FC<{
  open: boolean;
  initial: DateTimeWindow | null;
  maxDays: number;
  onSubmit: (window: DateTimeWindow) => void;
  onRequestClose: () => void;
}> = ({ open, initial, maxDays, onSubmit, onRequestClose }) => {
  'use memo';
  const { t } = useTranslation();
  const [form] = Form.useForm<CustomRangeValues>();
  const now = dayjs();
  const check = (values: CustomRangeValues) =>
    checkWindow(
      dayjs(values.start).valueOf(),
      dayjs(values.end).valueOf(),
      Date.now(),
      maxDays,
    );

  return (
    <BAIModal
      open={open}
      title={t('dashboard.settings.CustomRange')}
      okText={t('button.Apply')}
      onCancel={onRequestClose}
      onOk={async () => {
        const values = await form.validateFields().catch(() => undefined);
        if (!values) return;
        const result = check(values);
        if ('window' in result) onSubmit(result.window);
      }}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Text type="supporting">
          {t('dashboard.settings.CustomRangeHelp', { days: maxDays })}
        </Text>
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={{
            start: toInput(
              initial?.after ?? now.subtract(1, 'day').toISOString(),
            ),
            end: toInput(initial?.before ?? now.toISOString()),
          }}
        >
          <BAIFormItem
            name="start"
            label={t('dashboard.settings.RangeStart')}
            rules={[{ required: true }]}
          >
            <BAIDateTimeInput
              hourFormat="24h"
              width="100%"
              max={toInput(now.toISOString())}
              data-testid="panel-range-start"
            />
          </BAIFormItem>
          <BAIFormItem
            name="end"
            label={t('dashboard.settings.RangeEnd')}
            dependencies={['start']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator: async (_rule, end?: ISODateTimeString) => {
                  const start = getFieldValue('start');
                  if (!start || !end) return;
                  const result = check({ start, end });
                  if ('problem' in result)
                    throw new Error(
                      result.problem === 'tooLong'
                        ? t('dashboard.settings.RangeTooLong', {
                            days: maxDays,
                          })
                        : t('dashboard.settings.RangeEndBeforeStart'),
                    );
                },
              }),
            ]}
          >
            <BAIDateTimeInput
              hourFormat="24h"
              width="100%"
              data-testid="panel-range-end"
            />
          </BAIFormItem>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default PanelRangeSelect;
