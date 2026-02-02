import { CloudUploadOutlined, LinkOutlined } from '@ant-design/icons';
import {
  Attachments,
  AttachmentsProps,
  Sender,
  SenderProps,
} from '@ant-design/x';
import { Attachment } from '@ant-design/x/es/attachments';
import { Badge, Button, type GetRef, type UploadProps } from 'antd';
import { isEmpty } from 'lodash';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface ChatAttachmentsProps {
  dropContainerRef: React.RefObject<HTMLElement | null>;
}

const ChatAttachments: React.FC<ChatAttachmentsProps & AttachmentsProps> = ({
  items,
  onChange,
  dropContainerRef,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <Attachments
      beforeUpload={() => false}
      getDropContainer={() => dropContainerRef.current}
      accept="image/*,text/*"
      items={items}
      onChange={onChange}
      placeholder={(type) =>
        type === 'drop'
          ? {
              title: t('chatui.DropFileHere'),
            }
          : {
              icon: <CloudUploadOutlined />,
              title: t('chatui.UploadFiles'),
              description: t('chatui.UploadFilesDescription'),
            }
      }
    >
      {children}
    </Attachments>
  );
};

export type AttachmentChangeInfo = Parameters<
  NonNullable<UploadProps['onChange']>
>[0];

interface ChatSenderProps
  extends Omit<SenderProps, 'onChange'>,
    ChatAttachmentsProps {
  loading?: boolean;
  autoFocus?: boolean;
  items?: Attachment[];
  openAttachment?: boolean;
  onInputChange?: (value: string) => void;
  onInputSubmit?: () => void;
  onInputCancel?: () => void;
  onAttachmentChange?: (
    attachment: 'prefix' | 'header',
    info: AttachmentChangeInfo,
  ) => void;
  onAttachmentOpenChange?: (open: boolean) => void;
}

const ChatSender: React.FC<ChatSenderProps> = ({
  loading,
  autoFocus,
  items,
  openAttachment,
  dropContainerRef,
  onInputChange,
  onInputSubmit,
  onInputCancel,
  onAttachmentChange,
  onAttachmentOpenChange,
  ...senderProps
}) => {
  const { t } = useTranslation();

  const senderRef = useRef<GetRef<typeof Sender>>(null);

  useEffect(() => {
    if (autoFocus && senderRef.current) {
      senderRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <Sender
      style={{ flex: 1 }}
      ref={senderRef}
      {...senderProps}
      loading={loading}
      placeholder={t('chatui.SenderPlaceholder')}
      onChange={onInputChange}
      onSubmit={onInputSubmit}
      onCancel={onInputCancel}
      submitType="enter"
      header={
        <Sender.Header
          closable={false}
          title={t('chatui.Attachments')}
          open={!!openAttachment && !isEmpty(items)}
          onOpenChange={onAttachmentOpenChange}
          styles={{
            content: {
              padding: 0,
            },
          }}
        >
          <ChatAttachments
            items={items}
            dropContainerRef={dropContainerRef}
            onChange={(info) => onAttachmentChange?.('header', info)}
          />
        </Sender.Header>
      }
      prefix={
        <ChatAttachments
          items={items}
          dropContainerRef={dropContainerRef}
          onChange={(info) => onAttachmentChange?.('prefix', info)}
        >
          <Badge dot={!isEmpty(items) && !openAttachment}>
            <Button type="text" icon={<LinkOutlined />} />
          </Badge>
        </ChatAttachments>
      }
    />
  );
};

export default ChatSender;
