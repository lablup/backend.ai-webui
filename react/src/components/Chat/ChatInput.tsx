import { createDataTransferFiles } from '../../helper';
import Flex from '../Flex';
import ChatSender, {
  AttachmentChangeInfo,
  ChatAttachmentsProps,
} from './ChatSender';
import { CreateMessage, Message } from '@ai-sdk/react';
import type { AttachmentsProps } from '@ant-design/x';
import { ChatRequestOptions } from 'ai';
import { theme } from 'antd';
import { atom, useAtom } from 'jotai';
import { isEmpty, isEqual, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

const synchronizedMessageState = atom<string>('');
const synchronizedAttachmentState = atom<AttachmentsProps['items']>();
const chatSubmitKeyInfoState = atom<{ id: string; key: string } | undefined>(
  undefined,
);

interface ChatRequest {
  headers?: Record<string, string> | Headers;
  credentials?: RequestCredentials;
  fetchOnClient?: boolean;
}

interface ChatInputProps extends ChatRequest, ChatAttachmentsProps {
  sync: boolean;
  input: string;
  setInput: (input: string) => void;
  stop: () => void;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isStreaming: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  sync,
  input,
  setInput,
  stop,
  append,
  isStreaming,
  disabled,
  dropContainerRef,
}) => {
  const { token } = theme.useToken();

  const ChatInputStyle = {
    borderTop: `1px solid ${token.colorBorderSecondary}`,
    padding: token.paddingContentVertical,
  };

  const [isOpenAttachments, setIsOpenAttachments] = useState(false);
  const [files, setFiles] = useState<AttachmentsProps['items']>([]);

  const [synchronizedMessage, setSynchronizedMessage] = useAtom(
    synchronizedMessageState,
  );

  const [synchronizedAttachment, setSynchronizedAttachment] = useAtom(
    synchronizedAttachmentState,
  );

  const [chatSubmitKeyInfo, setChatSubmitKeyInfo] = useAtom(
    chatSubmitKeyInfoState,
  );

  const submitId = useId();
  const submitKey =
    chatSubmitKeyInfo?.id === submitId ? undefined : chatSubmitKeyInfo?.key;

  const prevSyncRef = useRef(sync);
  useEffect(() => {
    if (prevSyncRef.current !== sync) {
      setInput('');
      prevSyncRef.current = sync;
    }
  }, [sync, setInput]);

  useEffect(() => {
    if (sync && !isUndefined(synchronizedMessage)) {
      setInput(synchronizedMessage);
    }
  }, [synchronizedMessage, setInput, sync]);

  const setFilesFromInputAttachment = (
    inputAttachment: AttachmentsProps['items'],
  ) => {
    if (!isUndefined(inputAttachment) && !isEqual(files, inputAttachment)) {
      setFiles(inputAttachment);
      setIsOpenAttachments(true);
    }
  };

  // If the `inputAttachment` prop exists, the `files` state has to follow it.
  useEffect(() => {
    setFilesFromInputAttachment(synchronizedAttachment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synchronizedAttachment]);

  useEffect(() => {
    if (!isUndefined(submitKey) && input) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitKey]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (sync) {
        setSynchronizedMessage(value);
      }
    },
    [sync, setInput, setSynchronizedMessage],
  );

  const handleInputCancel = useCallback(() => {
    stop();
  }, [stop]);

  const handleInputSubmit = useCallback(() => {
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

      setSynchronizedMessage('');
      setSynchronizedAttachment([]);
      if (sync) {
        setChatSubmitKeyInfo({
          id: submitId,
          key: new Date().toString(),
        });
      }
    }
  }, [
    input,
    files,
    append,
    setSynchronizedMessage,
    setSynchronizedAttachment,
    sync,
    setInput,
    setChatSubmitKeyInfo,
    submitId,
  ]);

  const handleAttachmentChange = useCallback(
    (attachment: string, info: AttachmentChangeInfo) => {
      const fileList = info.fileList;
      setFiles(fileList);

      if (attachment === 'prefix') {
        setIsOpenAttachments(true);
      }

      if (sync) {
        setSynchronizedAttachment(fileList);
      }
    },
    [sync, setFiles, setIsOpenAttachments, setSynchronizedAttachment],
  );

  const handleAttachmentOpenChange = useCallback(
    (open: boolean) => {
      setIsOpenAttachments(open);
    },
    [setIsOpenAttachments],
  );

  return (
    <>
      <Flex style={ChatInputStyle} direction="column" align="center">
        <ChatSender
          disabled={disabled}
          placeholder="Say something..."
          autoFocus
          value={input}
          items={files}
          openAttachment={isOpenAttachments}
          dropContainerRef={dropContainerRef}
          loading={isStreaming}
          onInputChange={handleInputChange}
          onInputSubmit={handleInputSubmit}
          onInputCancel={handleInputCancel}
          onAttachmentChange={handleAttachmentChange}
          onAttachmentOpenChange={handleAttachmentOpenChange}
        />
      </Flex>
    </>
  );
};

export default ChatInput;
