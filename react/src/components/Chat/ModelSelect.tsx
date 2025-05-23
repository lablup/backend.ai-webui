import BAISelect from '../BAISelect';
import { BAIModel } from './ChatModel';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ModelSelectProps extends SelectProps {
  models?: Array<BAIModel>;
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  models,
  ...selectProps
}) => {
  const { t } = useTranslation();

  return (
    <BAISelect
      header={t('modelStore.Model')}
      placeholder={t('chatui.SelectModel')}
      style={{
        fontWeight: 'normal',
      }}
      showSearch
      options={_.chain(models)
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
        .value()}
      popupMatchSelectWidth={false}
      {...selectProps}
    />
  );
};

export default ModelSelect;
