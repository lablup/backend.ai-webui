import { useTanQuery } from '../../hooks/reactQueryAlias';
import EndpointSelect, { Endpoint } from '../EndpointSelect';
import { Model } from './ChatUIModal';
import LLMChatCard, { BAIModel } from './LLMChatCard';
import { CloseOutlined } from '@ant-design/icons';
import { Alert, Button, CardProps, Popconfirm, Skeleton, theme } from 'antd';
import _ from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EndpointLLMChatCardProps extends CardProps {
  basePath?: string;
  closable?: boolean;
  onRequestClose?: () => void;
  onModelChange?: (modelId: string) => void;
}

const EndpointLLMChatCard: React.FC<EndpointLLMChatCardProps> = ({
  basePath = 'v1',
  closable,
  onRequestClose,
  onModelChange,
  ...cardProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [endpoint, setEndpoint] = useState<Endpoint>();

  const {
    data: modelsResult,
    // error,
    isFetching,
  } = useTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', endpoint],
    queryFn: () => {
      return fetch(
        new URL(basePath + '/models', endpoint?.url ?? undefined).toString(),
      ).then((res) => res.json());
    },
    suspense: false,
  });
  const models = _.map(modelsResult?.data, (m) => ({
    id: m.id,
    name: m.id,
  })) as BAIModel[];

  return isFetching ? (
    <Skeleton active />
  ) : (
    <LLMChatCard
      {...cardProps}
      baseURL={
        endpoint?.url
          ? new URL(basePath, endpoint?.url ?? undefined).toString()
          : undefined
      }
      models={models}
      fetchOnClient
      leftExtra={
        <EndpointSelect
          placeholder={t('chatui.SelectEndpoint')}
          style={{
            fontWeight: 'normal',
          }}
          showSearch
          onChange={(v, endpoint) => {
            setEndpoint(endpoint as Endpoint);
          }}
          value={endpoint?.endpoint_id}
        />
      }
      modelId={modelsResult?.data?.[0].id ?? 'custom'}
      extra={
        closable ? (
          <Popconfirm
            title={t('chatui.DeleteChattingSession')}
            description={t('chatui.DeleteChattingSessionDescription')}
            onConfirm={() => {
              onRequestClose?.();
            }}
            okText={t('button.Delete')}
            okButtonProps={{ danger: true }}
          >
            <Button
              icon={<CloseOutlined />}
              type="text"
              style={{ color: token.colorBgMask }}
            />
          </Popconfirm>
        ) : undefined
      }
      allowCustomModel={_.isEmpty(models)}
      alert={
        _.isEmpty(models) && (
          <Alert
            type="warning"
            showIcon
            message={t('chatui.CannotFindModel')}
          />
        )
      }
    />
  );
};

export default EndpointLLMChatCard;
