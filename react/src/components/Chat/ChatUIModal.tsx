import { useTanQuery } from '../../hooks/reactQueryAlias';
import Flex from '../Flex';
import LLMChatCard from './LLMChatCard';
import { ChatUIModalEndpointTokenListFragment$key } from './__generated__/ChatUIModalEndpointTokenListFragment.graphql';
import { ChatUIModalFragment$key } from './__generated__/ChatUIModalFragment.graphql';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Modal, ModalProps, Skeleton, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface ChatUIBasicProps {
  endpointFrgmt: ChatUIModalFragment$key | null | undefined;
  endpointTokenFrgmt:
    | ChatUIModalEndpointTokenListFragment$key
    | null
    | undefined;
  basePath?: string;
  // models?: GetProp<typeof LLMChatCard, 'models'>;
}
interface ChatUIModalProps extends ModalProps, ChatUIBasicProps {}

const ChatUIModal: React.FC<ChatUIModalProps> = ({
  endpointFrgmt = null,
  endpointTokenFrgmt = null,
  basePath,
  // models,
  ...props
}) => {
  const { token } = theme.useToken();

  return (
    <Modal
      {...props}
      styles={{
        body: {
          height: '80vh',
          display: 'flex',
        },
        content: {
          padding: 0,
        },
      }}
      footer={null}
      centered
      width={'80%'}
      style={{ maxWidth: token.screenLGMax }}
      destroyOnClose
    >
      <Flex direction="column" align="stretch" style={{ flex: 1 }}>
        <EndpointChatContent
          basePath={basePath}
          endpointFrgmt={endpointFrgmt}
          endpointTokenFrgmt={endpointTokenFrgmt}
        />
      </Flex>
    </Modal>
  );
};

const EndpointChatContent: React.FC<ChatUIBasicProps> = ({
  endpointFrgmt,
  endpointTokenFrgmt,
  basePath = 'v1',
}) => {
  const { t } = useTranslation();
  const endpoint = useFragment(
    graphql`
      fragment ChatUIModalFragment on Endpoint {
        endpoint_id
        url
        status
      }
    `,
    endpointFrgmt,
  );
  const endpointTokenList = useFragment(
    graphql`
      fragment ChatUIModalEndpointTokenListFragment on EndpointTokenList {
        items {
          id
          token
          created_at
          valid_until
        }
      }
    `,
    endpointTokenFrgmt,
  );

  const newestToken = _.maxBy(
    endpointTokenList?.items,
    (item) => item?.created_at,
  );
  // FIXME: temporally parse UTC and change to timezone (timezone need to be added in server side)
  const newestValidToken = dayjs
    .utc(newestToken?.valid_until)
    .tz()
    .isAfter(dayjs())
    ? newestToken?.token
    : undefined;

  const {
    data: modelsResult,
    // error,
    isFetching,
    refetch,
  } = useTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', endpoint?.url],
    queryFn: () => {
      return fetch(
        new URL(basePath + '/models', endpoint?.url || '').toString(),
      ).then((res) => res.json());
    },
  });

  return isFetching ? (
    <Skeleton active />
  ) : (
    <LLMChatCard
      endpointId={endpoint?.endpoint_id || ''}
      baseURL={new URL(basePath, endpoint?.url || '').toString()}
      models={_.map(modelsResult?.data, (m) => ({
        id: m.id,
        name: m.id,
      }))}
      fetchOnClient
      style={{ flex: 1 }}
      allowCustomModel={_.isEmpty(modelsResult?.data)}
      alert={
        _.isEmpty(modelsResult?.data) && (
          <Alert
            type="warning"
            showIcon
            message={t('chatui.CannotFindModel')}
            action={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  refetch();
                }}
              >
                {t('button.Refresh')}
              </Button>
            }
          />
        )
      }
      modelId={modelsResult?.data?.[0].id ?? 'custom'}
      modelToken={newestValidToken}
      showCompareMenuItem
    />
  );
};

export default ChatUIModal;

interface ModelPermission {
  id: string;
  object: string;
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group: string | null;
  is_blocking: boolean;
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  root: string;
  parent: string | null;
  max_model_len: number;
  permission: ModelPermission[];
}
