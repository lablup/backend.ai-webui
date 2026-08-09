/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../../theme-shim';
import ChatSender, { type ChatSenderProps } from './ChatSender';
import { BAIFlex } from 'backend.ai-ui';
import { atom, useAtom } from 'jotai';
import { isEmpty, isEqual, isUndefined } from 'lodash-es';
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

const synchronizedMessageState = atom<string>('');
const synchronizedAttachmentState = atom<File[] | undefined>();
const chatSubmitKeyInfoState = atom<{ id: string; key: string } | undefined>(
  undefined,
);

interface ChatInputProps extends Pick<ChatSenderProps, 'dropContainerRef'> {
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
  const [files, setFiles] = useState<File[]>([]);

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

  const setFilesFromInputAttachment = (inputAttachment: File[] | undefined) => {
    if (!isUndefined(inputAttachment) && !isEqual(files, inputAttachment)) {
      setFiles(inputAttachment);
      setIsOpenAttachments(true);
    }
  };

  // If the `inputAttachment` prop exists, the `files` state has to follow it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- atom-driven files sync kept per review
    setFilesFromInputAttachment(synchronizedAttachment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synchronizedAttachment]);

  useEffect(() => {
    if (!isUndefined(submitKey) && (input || !isEmpty(files))) {
      onSendMessage(input, isEmpty(files) ? undefined : files);
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
      onSendMessage(input, isEmpty(files) ? undefined : files);

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

  const handleFilesChange = useCallback(
    (nextFiles: File[]) => {
      setFiles(nextFiles);

      if (sync) {
        setSynchronizedAttachment(nextFiles);
      }
    },
    [sync, setFiles, setSynchronizedAttachment],
  );

  const handleAttachmentOpenChange = useCallback(
    (open: boolean) => {
      setIsOpenAttachments(open);
    },
    [setIsOpenAttachments],
  );

  return (
    <>
      {/* `align="stretch"`: the Astryx composer sizes to its content, so a
          centered row would collapse it to the width of whatever is typed.
          The legacy `Sender` was width:100% by default and hid this. */}
      <BAIFlex style={ChatInputStyle} direction="column" align="stretch">
        <ChatSender
          disabled={disabled}
          autoFocus
          value={input}
          files={files}
          openAttachment={isOpenAttachments}
          dropContainerRef={dropContainerRef}
          loading={isStreaming}
          onInputChange={handleInputChange}
          onInputSubmit={handleInputSubmit}
          onInputCancel={handleInputCancel}
          onFilesChange={handleFilesChange}
          onAttachmentOpenChange={handleAttachmentOpenChange}
        />
      </BAIFlex>
    </>
  );
};

export default ChatInput;
