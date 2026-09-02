/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ChatModel } from './ChatModel';
import { BAISelect, type BAISelectProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

interface ModelSelectProps extends BAISelectProps {
  models?: Array<ChatModel>;
  deploymentName?: string | null;
}

const ModelSelect: React.FC<ModelSelectProps> = ({
  models,
  deploymentName,
  ...selectProps
}) => {
  'use memo';

  const { t } = useTranslation();

  return (
    <BAISelect
      placeholder={t('chatui.SelectModel')}
      style={{
        fontWeight: 'normal',
      }}
      showSearch
      options={_.map(models, ({ name }) => ({
        label: name,
        value: name,
      }))}
      popupMatchSelectWidth={false}
      header={
        deploymentName
          ? t('chatui.DeploymentModels', { name: deploymentName })
          : undefined
      }
      {...selectProps}
    />
  );
};

export default ModelSelect;
