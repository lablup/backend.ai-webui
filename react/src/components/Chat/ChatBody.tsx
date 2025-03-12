import { createDataTransferFiles } from '../../helper';
import Flex from '../Flex';
import ChatSender, { ChatSenderEvents } from './ChatSender';
import ChatTokenCounter from './ChatTokenCounter';
import VirtualChatMessageList from './VirtualChatMessageList';
import { createOpenAI } from '@ai-sdk/openai';
import { useChat } from '@ai-sdk/react';
import type { AttachmentsProps } from '@ant-design/x';
import {
  streamText,
  wrapLanguageModel,
  extractReasoningMiddleware,
  ChatRequestOptions,
} from 'ai';
import { theme } from 'antd';
import equal from 'fast-deep-equal';
import { isEmpty } from 'lodash';
import React, { memo, useCallback, useRef, useState } from 'react';

const ChatMessageList = memo(VirtualChatMessageList, (prevProps, nextProps) => {
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;
  return true;
});

export type BAIModel = {
  id: string;
  label?: string;
  name?: string;
  group?: string;
  created?: string;
  description?: string;
};

type BAIAgent = {};

interface ChatRequest {
  headers?: Record<string, string> | Headers;
  credentials?: RequestCredentials;
  fetchOnClient?: boolean;
}

interface ChatSession {
  apiKey?: string;
  models?: Array<BAIModel>;
  agents?: Array<BAIAgent>;
  agentId?: string;
  modelId: string;
  endpointId?: string;
  systemPrompt?: string;
  chatId?: string;
  baseURL?: string;
}

// @CHANGE: use multiple interface for clear props modeling
interface ChatBodyProps extends ChatRequest, ChatSession {
  allowCustomModel?: boolean;
}

const ChatBody: React.FC<ChatBodyProps> = ({
  baseURL,
  chatId,
  modelId,
  apiKey,
  systemPrompt,
  credentials,
  fetchOnClient,
}) => {
  const [startTime, setStartTime] = useState<number | null>(null);

  const {
    messages,
    error,
    input,
    setInput,
    stop,
    isLoading,
    append,
    setMessages,
  } = useChat({
    id: chatId,
    api: baseURL,
    credentials,
    body: {
      modelId: modelId,
    },
    fetch: async (input, init) => {
      if (fetchOnClient || modelId === 'custom') {
        const body = JSON.parse(init?.body as string);
        const provider = createOpenAI({
          // @CHANGE baseURL or CustomURL will be passed from outside
          baseURL: baseURL,
          apiKey: apiKey || 'dummy',
        });
        const result = streamText({
          abortSignal: init?.signal || undefined,
          model: wrapLanguageModel({
            model: provider(modelId),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
          }),
          messages: body?.messages,
          system: systemPrompt,
        });
        setStartTime(Date.now());
        return result.toDataStreamResponse({
          sendReasoning: true,
        });
      } else {
        return fetch(input, init);
      }
    },
  });

  const { token } = theme.useToken();

  const ChatInputStyle = {
    background: '#ffffff',
    borderTop: '1px solid #f0f0f0',
    borderRadius: '0 0 8px 8px',
    padding: token.paddingContentVertical,
  };

  // @FIXME sync file attachment between sender

  // @FIXME move into ChatSender?
  const [isOpenAttachments, setIsOpenAttachments] = useState(false);
  const [files, setFiles] = useState<AttachmentsProps['items']>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleChatSenderChange = useCallback(
    (event: ChatSenderEvents, data: any) => {
      console.log('data', data);

      if (event === 'input-change') {
        setInput(data);
        // @FIXME: add sync messages and attachment, onInputChange
        // if (onInputChange) {
        //   onInputChange(v);
        // }
      } else if (event === 'input-cancel') {
        stop();
      } else if (event === 'input-submit') {
        if (input || !isEmpty(files)) {
          const chatRequestOptions: ChatRequestOptions = {};
          if (!isEmpty(files)) {
            chatRequestOptions.experimental_attachments =
              createDataTransferFiles(files);
          }
          append(
            {
              role: 'user',
              content: input,
            },
            chatRequestOptions,
          );
          setTimeout(() => {
            setInput('');
            setFiles([]);
            setIsOpenAttachments(false);
          }, 0);
          // @FIXME: add sync messages and attachment, onSubmitChange
        }
      } else if (event === 'attachment-change') {
        const fileList = data.info.fileList;
        setFiles(fileList);

        if (data.type === 'prefix') {
          setIsOpenAttachments(true);
        }
        // @FIXME: add sync messages and attachment, onAttachmentChange?
      } else if (event === 'attachment-open-change') {
        setIsOpenAttachments(data);
      }
    },
    [append, files, input, setInput, stop],
  );

  return (
    <>
      <ChatMessageList messages={messages} isStreaming={isLoading} />
      <Flex direction="column" align="end">
        <ChatTokenCounter
          messages={messages}
          input={input}
          startTime={startTime}
        />
      </Flex>
      <Flex style={ChatInputStyle} direction="column" align="center">
        <ChatSender
          placeholder="Say something..."
          autoFocus
          value={input}
          items={files}
          openAttachment={isOpenAttachments}
          dropContainerRef={cardRef}
          onChange={handleChatSenderChange}
          loading={isLoading}
        />
      </Flex>
    </>
  );
};

export default ChatBody;
