import { useTanQuery } from '../../hooks/reactQueryAlias';
import EndpointSelect from '../EndpointSelect';
import { Model } from './ChatUIModal';
import LLMChatCard, { BAIModel } from './LLMChatCard';
import { EndpointLLMChatCard_endpoint$key } from './__generated__/EndpointLLMChatCard_endpoint.graphql';
import { CloseOutlined } from '@ant-design/icons';
import { Alert, Button, CardProps, Popconfirm, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { startTransition, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface EndpointLLMChatCardProps extends CardProps {
  basePath?: string;
  closable?: boolean;
  defaultEndpoint?: EndpointLLMChatCard_endpoint$key;
  fetchKey?: string;
  onRequestClose?: () => void;
  onModelChange?: (modelId: string) => void;
}

const EndpointLLMChatCard: React.FC<EndpointLLMChatCardProps> = ({
  basePath = 'v1',
  closable,
  defaultEndpoint,
  onRequestClose,
  onModelChange,
  fetchKey,
  ...cardProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [endpointFrgmt, setEndpointFrgmt] =
    useState<EndpointLLMChatCard_endpoint$key | null>(defaultEndpoint || null);
  const endpoint = useFragment(
    graphql`
      fragment EndpointLLMChatCard_endpoint on Endpoint {
        endpoint_id
        url
      }
    `,
    endpointFrgmt,
  );
  const [promisingEndpoint, setPromisingEndpoint] = useState(endpoint);

  const { data: modelsResult } = useTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', fetchKey, endpoint?.endpoint_id],
    queryFn: () => {
      return endpoint?.url
        ? fetch(
            new URL(
              basePath + '/models',
              endpoint?.url ?? undefined,
            ).toString(),
          )
            .then((res) => res.json())
            .catch((e) => ({ data: [] }))
        : Promise.resolve({ data: [] });
    },
    suspense: true,
  });

  const models = _.map(modelsResult?.data, (m) => ({
    id: m.id,
    name: m.id,
  })) as BAIModel[];

  return (
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
          fetchKey={fetchKey}
          showSearch
          loading={promisingEndpoint?.endpoint_id !== endpoint?.endpoint_id}
          onChange={(v, endpoint) => {
            // TODO: fix type definitions
            // @ts-ignore'
            setPromisingEndpoint(endpoint);
            startTransition(() => {
              // @ts-ignore'
              setEndpointFrgmt(endpoint);
            });
          }}
          value={endpoint?.endpoint_id}
          popupMatchSelectWidth={false}
        />
      }
      modelId={modelsResult?.data?.[0]?.id ?? 'custom'}
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
