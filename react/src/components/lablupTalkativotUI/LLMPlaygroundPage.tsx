import Flex from '../Flex';
import EndpointLLMChatCard from './EndpointLLMChatCard';
import { LLMPlaygroundPageQuery } from './__generated__/LLMPlaygroundPageQuery.graphql';
import { PlusOutlined } from '@ant-design/icons';
import { useDynamicList } from 'ahooks';
import { Button, Card, Skeleton, Switch, theme, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface LLMPlaygroundPageProps {}

const LLMPlaygroundPage: React.FC<LLMPlaygroundPageProps> = ({ ...props }) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  // Set the initial list to have two items
  const { list, remove, getKey, push } = useDynamicList(['0', '1']);

  const [isSynchronous, setSynchronous] = useState(false);

  const { endpoint_list } = useLazyLoadQuery<LLMPlaygroundPageQuery>(
    graphql`
      query LLMPlaygroundPageQuery {
        endpoint_list(limit: 1, offset: 0, filter: "name != 'koalpaca-test'") {
          items {
            ...EndpointLLMChatCard_endpoint
          }
        }
      }
    `,
    {},
  );
  return (
    <>
      <Flex direction="column" align="stretch">
        <Flex
          direction="row"
          justify="between"
          wrap="wrap"
          gap={'xs'}
          style={{
            padding: token.paddingContentVertical,
            paddingLeft: token.paddingContentHorizontalSM,
            paddingRight: token.paddingContentHorizontalSM,
          }}
        >
          <Flex direction="column" align="start">
            <Typography.Text style={{ margin: 0, padding: 0 }}>
              LLM Playground
            </Typography.Text>
          </Flex>
          <Flex
            direction="row"
            gap={'xs'}
            wrap="wrap"
            style={{ flexShrink: 1 }}
          >
            <Flex gap={'xs'}>
              <Typography.Text type="secondary">
                {t('chatui.Sync')}
              </Typography.Text>
              <Switch
                value={isSynchronous}
                onClick={(v) => {
                  setSynchronous(v);
                }}
              />
              <Button
                onClick={() => {
                  push(new Date().toString());
                }}
                icon={<PlusOutlined />}
              />
            </Flex>
          </Flex>
        </Flex>
        <Flex
          gap={'xs'}
          style={{
            margin: token.margin,
            marginTop: 0,
            overflow: 'auto',
            height: 'calc(100vh - 215px)',
          }}
          align="stretch"
        >
          {_.map(list, (__, index) => (
            <Suspense
              fallback={
                <Card style={{ flex: 1 }}>
                  <Skeleton active />
                </Card>
              }
              key={getKey(index)}
            >
              <EndpointLLMChatCard
                defaultEndpoint={endpoint_list?.items?.[0] || undefined}
                key={getKey(index)}
                style={{ flex: 1 }}
                onRequestClose={() => {
                  remove(index);
                }}
                closable={list.length > 1}
                isSynchronous={isSynchronous}
              />
            </Suspense>
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export default LLMPlaygroundPage;
