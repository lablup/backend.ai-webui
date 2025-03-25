import { BAIModel } from './ChatModel';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ModelSelectProps extends SelectProps {
  models?: Array<BAIModel>;
  allowCustomModel?: boolean;
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  models,
  allowCustomModel,
  ...selectProps
}) => {
  const { t } = useTranslation();

  return (
    <Select
      placeholder={t('chatui.SelectModel')}
      style={{
        fontWeight: 'normal',
      }}
      showSearch
      options={_.concat(
        allowCustomModel
          ? [
              {
                label: 'Custom',
                // @ts-ignore
                value: 'custom',
              },
            ]
          : [],
        _.chain(models)
          .groupBy('group')
          .mapValues((ms) =>
            _.map(ms, (m) => ({
              label: m.label,
              value: m.name,
            })),
          )
          .map((v, k) => ({
            label: k === 'undefined' ? 'Others' : k,
            options: v,
          }))
          .value(),
      )}
      popupMatchSelectWidth={false}
      {...selectProps}
    />
  );
};

export default ModelSelect;
