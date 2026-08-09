/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Astryx ships a first-class chat composer family (`ChatComposer` +
// `ChatComposerInput` + `ChatComposerDrawer` + `ChatSendButton`), so the
// `@ant-design/x` `Sender`/`Attachments` pair this file used to wrap is gone —
// and with it the last carrier package that dragged antd, @ant-design/icons,
// @ant-design/cssinjs and @rc-component/* into the production graph.
import {
  ChatComposer,
  ChatComposerDrawer,
  ChatComposerInput,
  ChatSendButton,
  type ChatComposerInputHandle,
} from '@astryxdesign/core/Chat';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Thumbnail } from '@astryxdesign/core/Thumbnail';
import { Token } from '@astryxdesign/core/Token';
import { isEmpty } from 'lodash-es';
import { PaperclipIcon } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/** Mirrors the legacy `Attachments accept` filter. */
const ATTACHMENT_ACCEPT = 'image/*,text/*';

const isAcceptedFile = (file: File) =>
  file.type.startsWith('image/') || file.type.startsWith('text/');

const isImageFile = (file: File) => file.type.startsWith('image/');

export interface ChatSenderProps {
  /** Controlled composer text. */
  value?: string;
  placeholder?: string;
  /** Blocks the whole composer (no endpoint / model still loading). */
  disabled?: boolean;
  /** Streaming — swaps the send button for a stop button. */
  loading?: boolean;
  autoFocus?: boolean;
  files?: File[];
  openAttachment?: boolean;
  /**
   * Element that accepts dropped files. The whole chat card is the drop
   * target, exactly as the legacy `Attachments getDropContainer` was.
   */
  dropContainerRef: React.RefObject<HTMLElement | null>;
  onInputChange?: (value: string) => void;
  onInputSubmit?: () => void;
  onInputCancel?: () => void;
  onFilesChange?: (files: File[]) => void;
  onAttachmentOpenChange?: (open: boolean) => void;
}

const ChatSender: React.FC<ChatSenderProps> = ({
  value,
  placeholder,
  disabled,
  loading,
  autoFocus,
  files,
  openAttachment,
  dropContainerRef,
  onInputChange,
  onInputSubmit,
  onInputCancel,
  onFilesChange,
  onAttachmentOpenChange,
}) => {
  const { t } = useTranslation();

  const inputHandleRef = useRef<ChatComposerInputHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvedPlaceholder = placeholder ?? t('chatui.SenderPlaceholder');

  useEffect(() => {
    if (autoFocus) {
      inputHandleRef.current?.focus();
    }
  }, [autoFocus]);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const accepted = incoming.filter(isAcceptedFile);
      if (isEmpty(accepted)) {
        return;
      }
      onFilesChange?.([...(files ?? []), ...accepted]);
      onAttachmentOpenChange?.(true);
    },
    [files, onFilesChange, onAttachmentOpenChange],
  );

  const removeFileAt = (index: number) => {
    onFilesChange?.((files ?? []).filter((_file, i) => i !== index));
  };

  // Drag-and-drop over the whole chat card. The legacy `Attachments`
  // `getDropContainer` did the same through rc-upload; wired natively here so
  // no carrier package is needed for it.
  useEffect(() => {
    const container = dropContainerRef.current;
    if (!container || disabled) {
      return;
    }
    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes('Files')) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    };
    const handleDrop = (event: DragEvent) => {
      const dropped = Array.from(event.dataTransfer?.files ?? []);
      if (isEmpty(dropped)) {
        return;
      }
      event.preventDefault();
      addFiles(dropped);
    };
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [dropContainerRef, disabled, addFiles]);

  // Object URLs for the image previews, revoked when the file set changes so
  // the blobs do not leak across sends.
  const previewURLs = useMemo(
    () =>
      (files ?? []).map((file) =>
        isImageFile(file) ? URL.createObjectURL(file) : null,
      ),
    [files],
  );
  useEffect(() => {
    return () => {
      previewURLs.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [previewURLs]);

  const canSend = !disabled && (!isEmpty(value?.trim()) || !isEmpty(files));

  return (
    <ChatComposer
      // A chat pane is vertically tight (several can sit side by side), so the
      // composer runs compact and keeps its single action row in the footer
      // rather than spending another 28px on a header row.
      density="compact"
      elevation="none"
      value={value ?? ''}
      onChange={onInputChange}
      onSubmit={() => onInputSubmit?.()}
      onStop={onInputCancel}
      isStopShown={!!loading}
      isDisabled={disabled}
      placeholder={resolvedPlaceholder}
      input={
        <ChatComposerInput
          handleRef={inputHandleRef}
          // The accessible name doubles as the composer's visible hint, so
          // screen readers and sighted users get the same instruction.
          label={resolvedPlaceholder}
          // PILOT-DECISION: Astryx's ArrowUp/Down message recall and
          // paste-over-200-chars-becomes-a-chip are new behaviors the legacy
          // `Sender` never had. Both are off so this stays a plain composer.
          hasHistory={false}
          pasteAsToken={false}
          onFiles={addFiles}
        />
      }
      footerActions={
        <>
          {/* Astryx `FileInput` renders a full labelled field, not an
              icon-only trigger, so the picker is a hidden native input opened
              by an `IconButton` — the same recipe LogoPreviewer uses.
              `size="md"` matches the send button's height across the row. */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ATTACHMENT_ACCEPT}
            style={{ display: 'none' }}
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
          <IconButton
            size="md"
            variant="ghost"
            icon={<PaperclipIcon size="1em" />}
            label={t('chatui.Attachments')}
            tooltip={t('chatui.UploadFiles')}
            isDisabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          />
        </>
      }
      drawer={
        isEmpty(files) ? undefined : (
          <ChatComposerDrawer
            count={files?.length}
            label={t('chatui.Attachments')}
            isCollapsed={!openAttachment}
            onCollapsedChange={(isCollapsed) =>
              onAttachmentOpenChange?.(!isCollapsed)
            }
          >
            {(files ?? []).map((file, index) =>
              previewURLs[index] ? (
                <Thumbnail
                  key={`${file.name}-${index}`}
                  src={previewURLs[index] ?? undefined}
                  alt={file.name}
                  label={file.name}
                  showRemoveOn="always"
                  onRemove={() => removeFileAt(index)}
                />
              ) : (
                <Token
                  key={`${file.name}-${index}`}
                  label={file.name}
                  icon={<PaperclipIcon size="1em" />}
                  onRemove={() => removeFileAt(index)}
                />
              ),
            )}
          </ChatComposerDrawer>
        )
      }
      // The default send button reads `canSend` from composer context, which
      // is text-only. A message carrying just an attachment is valid here, so
      // the enablement rule is supplied explicitly.
      sendButton={
        <ChatSendButton
          isStopShown={!!loading}
          isDisabled={!canSend}
          onSend={() => onInputSubmit?.()}
          onStop={onInputCancel}
        />
      }
    />
  );
};

export default ChatSender;
