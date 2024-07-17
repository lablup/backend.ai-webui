import Flex from './Flex';
import VirtualChatMessageList from './VirtualChatMessageList';
import { useChat } from '@ai-sdk/react';
import { useControllableValue } from 'ahooks';
import { Card, CardProps, Select, theme } from 'antd';
import _ from 'lodash';
import React from 'react';

const ChatInput = React.lazy(() => import('./ChatInput'));

export type BAIModel = {
  id: string;
  label: string;
  name: string;
  group?: string;
  created?: string;
  description?: string;
};
type BAIAgent = {};
interface LLMChatCardProps extends CardProps {
  models?: Array<BAIModel>;
  agents?: Array<BAIAgent>;
  modeId?: string;
  agentId?: string;
  onAgentChange?: (agentId: string) => void;
  onModelChange?: (modelId: string) => void;
  api?: string;
  headers?: Record<string, string> | Headers;
  credentials?: RequestCredentials;
}

const LLMChatCard: React.FC<LLMChatCardProps> = ({
  models = [],
  api,
  headers,
  credentials,
  ...cardProps
}) => {
  const [modelId, setModelId] = useControllableValue(cardProps, {
    valuePropName: 'modelId',
    trigger: 'onModelChange',
    defaultValue: models[0]?.name,
  });

  // const [userInput, setUserInput] = useControllableValue(cardProps,{
  //   valuePropName: "userInput",
  //   trigger: "onChangeUserInput",
  // });

  // useControllableValue(cardProps, {
  //   valuePropName: "agentId",
  //   trigger: "onAgentChange",
  // });

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    stop,
    isLoading,
    append,
  } = useChat({
    api,
    headers,
    credentials,
    body: {
      modelId: modelId,
    },
  });
  const { token } = theme.useToken();

  return (
    <Card
      bordered
      {...cardProps}
      title={
        <Flex direction="row" gap={'xs'}>
          {/* <Select
            options={[
              {
                label: "Default Agent",
                value: "default",
              },
            ]}
            value={"default"}
            popupMatchSelectWidth={false}
          ></Select> */}
          <Select
            placeholder={'Select model'}
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
                label: k,
                options: v,
              }))
              .value()}
            value={modelId}
            onChange={setModelId}
            popupMatchSelectWidth={false}
          />
        </Flex>
      }
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: {
          backgroundColor: '#f5f5f5',
          borderRadius: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          height: '50%',
          position: 'relative',
        },
        actions: {
          paddingLeft: token.paddingContentHorizontal,
          paddingRight: token.paddingContentHorizontal,
        },
      }}
      extra={
        [
          // <Checkbox key="sync">Sync</Checkbox>,
          // <Button key="setting" type="text" icon={<SlidersHorizontalIcon/>}></Button>,
        ]
      }
      actions={[
        <form key="input" onSubmit={handleSubmit}>
          <ChatInput
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            loading={isLoading}
            onClickStop={stop}
            onClickSubmit={() => {
              append({
                role: 'user',
                content: input,
              });
              setTimeout(() => {
                setInput('');
              }, 0);
            }}
          />
        </form>,
      ]}
    >
      {/* <ChatMessageList messages={messages}  /> */}
      <VirtualChatMessageList messages={messages} isStreaming={isLoading} />
    </Card>
  );
};

export default LLMChatCard;
