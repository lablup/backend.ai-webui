import { CloudUploadOutlined, LinkOutlined } from '@ant-design/icons';
import {
  Attachments,
  AttachmentsProps,
  Sender,
  SenderProps,
} from '@ant-design/x';
import { Attachment } from '@ant-design/x/es/attachments';
import { Badge, Button, GetRef } from 'antd';
import { isEmpty } from 'lodash';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export type ChatSenderEvents =
  | 'input-change'
  | 'input-cancel'
  | 'input-submit'
  | 'attachment-change'
  | 'attachment-open-change';

interface ChatSenderProps extends Omit<SenderProps, 'onChange'> {
  loading?: boolean;
  autoFocus?: boolean;
  items?: Attachment[];
  openAttachment?: boolean;
  dropContainerRef: React.RefObject<HTMLDivElement | null>;
  onChange?: (event: ChatSenderEvents, data?: any) => void;
}

interface ChageAttachmentsProps extends AttachmentsProps {
  dropContainerRef: React.RefObject<HTMLElement | null>;
}

const ChatAttachments: React.FC<ChageAttachmentsProps> = ({
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

const ChatSender: React.FC<ChatSenderProps> = ({
  loading,
  autoFocus,
  items,
  openAttachment,
  dropContainerRef,
  onChange,
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
      onChange={(v) => onChange?.('input-change', v)}
      onSubmit={() => onChange?.('input-submit')}
      onCancel={() => onChange?.('input-cancel')}
      submitType="enter"
      header={
        <Sender.Header
          closable={false}
          title={t('chatui.Attachments')}
          open={!!openAttachment && !isEmpty(items)}
          onOpenChange={() => onChange?.('attachment-open-change')}
          styles={{
            content: {
              padding: 0,
            },
          }}
        >
          <ChatAttachments
            items={items}
            dropContainerRef={dropContainerRef}
            onChange={(info) =>
              onChange?.('attachment-change', { type: 'header', info })
            }
          />
        </Sender.Header>
      }
      prefix={
        <ChatAttachments
          items={items}
          dropContainerRef={dropContainerRef}
          onChange={(info) =>
            onChange?.('attachment-change', { type: 'prefix', info })
          }
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
