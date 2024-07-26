import Flex from '../Flex';
import EndpointLLMChatCard from './EndpointLLMChatCard';
import { PlusOutlined } from '@ant-design/icons';
import { useDynamicList } from 'ahooks';
import { Button, theme, Typography } from 'antd';
import _ from 'lodash';
import React from 'react';

interface LLMPlaygroundPageProps {}

const LLMPlaygroundPage: React.FC<LLMPlaygroundPageProps> = ({ ...props }) => {
  const { token } = theme.useToken();
  const { list, remove, getKey, push } = useDynamicList(['0', '1']);

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
          {_.map(list, (item, index) => (
            <EndpointLLMChatCard
              key={getKey(index)}
              style={{ flex: 1 }}
              onRequestClose={() => {
                remove(index);
              }}
              closable={list.length > 1}
            />
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export default LLMPlaygroundPage;
