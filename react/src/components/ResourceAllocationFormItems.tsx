import Flex from './Flex';
import SliderInputItem from './SliderInputFormItem';
import { Card, Form, Select, Typography, theme } from 'antd';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

const ResourceAllocationFormItems = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  return (
    <>
      <Form.Item
        label="Allocation Preset"
        name="allocationPreset"
        required
        style={{ marginBottom: token.marginXS }}
      >
        <Select
          options={[
            {
              value: 'custom',
              label: 'Custom',
              // label: (
              //   <Flex direction="row" gap="xs">
              //     <Typography.Text strong>Custom</Typography.Text>
              //     <Typography.Text type="secondary">
              //       Customize allocation amount
              //     </Typography.Text>
              //   </Flex>
              // ),
            },
            {
              // value: 'preset1',
              label: 'Preset',
              options: [
                {
                  value: 'preset1',
                  label: 'Large',
                },
              ],
            },
          ]}
        ></Select>
      </Form.Item>
      <Card
        style={{
          marginBottom: token.margin,
        }}
      >
        <Form.Item
          shouldUpdate={(prev, cur) =>
            prev.allocationPreset !== cur.allocationPreset
          }
          noStyle
        >
          {({ getFieldValue }) => {
            return (
              getFieldValue('allocationPreset') === 'custom' && (
                <>
                  <SliderInputItem
                    name={'cpu'}
                    label={t('session.launcher.CPU')}
                    tooltip={<Trans i18nKey={'session.launcher.DescCPU'} />}
                    // min={parseInt(
                    //   _.find(
                    //     currentImage?.resource_limits,
                    //     (i) => i?.key === 'cpu',
                    //   )?.min || '0',
                    // )}
                    // max={parseInt(
                    //   _.find(
                    //     currentImage?.resource_limits,
                    //     (i) => i?.key === 'cpu',
                    //   )?.max || '100',
                    // )}
                    inputNumberProps={{
                      addonAfter: t('session.launcher.Core'),
                    }}
                    required
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  />
                  <SliderInputItem
                    name={'mem'}
                    label={t('session.launcher.Memory')}
                    tooltip={<Trans i18nKey={'session.launcher.DescMemory'} />}
                    max={30}
                    inputNumberProps={{
                      addonAfter: 'GB',
                    }}
                    step={0.05}
                    required
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  />
                  <SliderInputItem
                    name={'shmem'}
                    label={t('session.launcher.SharedMemory')}
                    tooltip={
                      <Trans i18nKey={'session.launcher.DescSharedMemory'} />
                    }
                    max={30}
                    step={0.1}
                    inputNumberProps={{
                      addonAfter: 'GB',
                    }}
                    required
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  />
                </>
              )
            );
          }}
        </Form.Item>
      </Card>
    </>
  );
};

export default ResourceAllocationFormItems;
