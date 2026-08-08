/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// FRONTIER (documented, ticket 23 @ant-design/x judgment call): `Attachments`
// and `Sender` (drag-drop file zone + auto-resize composer input with
// built-in submit/cancel/loading affordances) are not in MAPPING.md — they
// sit outside the antd core surface the mapping measured, and neither has an
// Astryx equivalent (NONE verdict by inspection: no chat-composer or
// file-dropzone component in `@astryxdesign/core`). Rebuilding them is
// disproportionate to this ticket's scope; kept as-is, same treatment as the
// lobehub icon packages — convert only the antd chrome AROUND them.
import {
  Attachments,
  AttachmentsProps,
  Sender,
  SenderProps,
} from '@ant-design/x';
import { Attachment } from '@ant-design/x/es/attachments';
import { IconButton } from '@astryxdesign/core/IconButton';
import { isEmpty } from 'lodash-es';
import { CloudUpload, Link } from 'lucide-react';
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
              icon: <CloudUpload size="1em" />,
              title: t('chatui.UploadFiles'),
              description: t('chatui.UploadFilesDescription'),
            }
      }
    >
      {children}
    </Attachments>
  );
};

// The change payload is re-derived from `AttachmentsProps` (which extends
// antd's `UploadProps`) instead of importing `UploadProps` from antd directly:
// `@ant-design/x` is the documented carrier here, so the type has a home that
// does not put THIS file in the antd import graph (P15/§6 — a type-only antd
// import still counts).
export type AttachmentChangeInfo = Parameters<
  NonNullable<AttachmentsProps['onChange']>
>[0];

interface ChatSenderProps
  extends Omit<SenderProps, 'onChange'>, ChatAttachmentsProps {
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

  // antd's `GetRef` has no Astryx analog (MAPPING §6.2); React's own
  // `ComponentRef` is the drop-in.
  const senderRef = useRef<React.ComponentRef<typeof Sender>>(null);

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
          {/* PILOT-DECISION: antd `Badge dot` (an overlay on a child) has no
              Astryx destination (MAPPING.md §3.8 — no count/dot overlay).
              Self-built as an absolutely-positioned dot in a
              `position:relative` wrapper, per the mapping's prescribed
              recipe. */}
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <IconButton
              variant="ghost"
              icon={<Link size="1em" />}
              label={t('chatui.Attachments')}
            />
            {!isEmpty(items) && !openAttachment && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-error)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </ChatAttachments>
      }
    />
  );
};

export default ChatSender;
