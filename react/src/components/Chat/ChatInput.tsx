/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ChatSender, {
  AttachmentChangeInfo,
  ChatAttachmentsProps,
} from './ChatSender';
import type { AttachmentsProps } from '@ant-design/x';
import { theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { atom, useAtom } from 'jotai';
import { isEmpty, isEqual, isUndefined } from 'lodash';
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

const synchronizedMessageState = atom<string>('');
const synchronizedAttachmentState = atom<AttachmentsProps['items']>();
const chatSubmitKeyInfoState = atom<{ id: string; key: string } | undefined>(
  undefined,
);

interface ChatInputProps extends ChatAttachmentsProps {
  sync: boolean;
  input: string;
  setInput: (input: string) => void;
  stop: () => void;
  onSendMessage: (textContent: string, files?: File[]) => Promise<void>;
  isStreaming: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  sync,
  input,
  setInput,
  stop,
  onSendMessage,
  isStreaming,
  disabled,
  dropContainerRef,
}) => {
  const { token } = theme.useToken();

  const ChatInputStyle: CSSProperties = {
    borderTop: `1px solid ${token.colorBorderSecondary}`,
    paddingBlock: token.paddingContentVertical,
    paddingInline: token.paddingContentHorizontal,
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
    if (!isUndefined(submitKey) && (input || !isEmpty(files))) {
      // Convert files to File array
      const fileArray =
        files
          ?.map((file) => file.originFileObj as File)
          .filter((file): file is File => file != null) || [];

      onSendMessage(input, fileArray.length > 0 ? fileArray : undefined);
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
      // Convert files to File array
      const fileArray =
        files
          ?.map((file) => file.originFileObj as File)
          .filter((file): file is File => file != null) || [];

      onSendMessage(input, fileArray.length > 0 ? fileArray : undefined);

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
    onSendMessage,
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
      <BAIFlex style={ChatInputStyle} direction="column" align="center">
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
      </BAIFlex>
    </>
  );
};

export default ChatInput;
