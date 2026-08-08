/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import { announcementQueryOptions } from '../hooks/useSuspenseGetAnnouncement';
import { theme } from '../theme-shim';
import './AnnouncementEditModal.css';
import BAICodeEditor from './BAICodeEditor';
import { SyntaxHighlighter } from './Chat/SyntaxHighlighter';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { Button } from '@astryxdesign/core/Button';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import type { OnMount } from '@monaco-editor/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
  useBAILogger,
} from 'backend.ai-ui';
// `rehype-katex` does not import the CSS file, so we need to import it manually.
import 'katex/dist/katex.min.css';
import {
  Bold,
  Code,
  ALargeSmall,
  Italic,
  Link,
  ListOrdered,
  Image,
  Strikethrough,
  List,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

type MonacoEditorInstance = Parameters<OnMount>[0];
type MonacoNamespace = Parameters<OnMount>[1];

// Height of the markdown editor. Sized relative to the viewport so the whole
// editor + label + toolbar + validation message fits inside the modal body's
// max-height without producing a scrollbar. The `- 320px` budget covers the
// modal chrome (header, footer, body padding) plus the field label, toolbar,
// and the validation message row shown when enabling with an empty message.
// The preview box matches the editor's outer height (this value + the editor
// wrapper's 1px border).
const EDITOR_HEIGHT = 'calc(100vh - 320px)';

interface AnnouncementValues {
  enabled: boolean;
  message: string;
}

interface AnnouncementEditModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
}

const AnnouncementEditModal: React.FC<AnnouncementEditModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message: appMessage, modal } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const baiClient = useSuspendedBackendaiClient();
  const queryClient = useQueryClient();

  // The modal owns its data. Fetch without Suspense so the modal chrome (title,
  // footer with the Enabled toggle and Publish button) renders immediately and
  // only the body shows a Skeleton while the current announcement loads.
  const { data: announcement, isLoading } = useTanQuery(
    announcementQueryOptions(baiClient),
  );

  // The `enabled` flag is not user-controllable for now: the manager stores the
  // announcement purely by presence — publishing a message enables it, and
  // "disabling" it just deletes the stored message (there is no way to persist a
  // disabled-but-present announcement). So the footer exposes an explicit Delete
  // action instead of an Enabled toggle. The toggle implementation is kept below
  // (commented out) so it can be restored once the backend can persist the flag.
  //
  // const [enabledDraft, setEnabledDraft] = useState<boolean>();
  // const enabled = enabledDraft ?? announcement?.enabled ?? true;
  const [messageDraft, setMessageDraft] = useState<string>();
  const message = messageDraft ?? announcement?.message ?? '';

  // Publishing always enables the announcement, and the backend rejects an empty
  // message ("Empty message not allowed to enable announcement"), so a non-empty
  // message is required to publish. (Previously gated on `enabled && ...`.)
  const isMessageMissing = !message.trim();

  const updateMutation = useTanMutation({
    mutationFn: (values: AnnouncementValues) => {
      return baiClient.service.update_announcement(
        values.enabled,
        values.message,
      );
    },
  });

  // Deleting is `update_announcement(false, ...)`: with `enabled: false` the
  // manager removes the stored message from etcd, clearing the announcement.
  const deleteMutation = useTanMutation({
    mutationFn: () => baiClient.service.update_announcement(false, ''),
  });

  const handleSubmit = () => {
    if (isMessageMissing) return;
    updateMutation.mutate(
      { enabled: true, message },
      {
        onSuccess: () => {
          appMessage.success(t('summary.AnnouncementUpdated'));
          queryClient.invalidateQueries({
            queryKey: announcementQueryOptions(baiClient).queryKey,
          });
          onRequestClose(true);
        },
        onError: (error) => {
          appMessage.error(getErrorMessage(error));
          logger.error(error);
        },
      },
    );
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      appMessage.success(t('summary.AnnouncementDeleted'));
      queryClient.invalidateQueries({
        queryKey: announcementQueryOptions(baiClient).queryKey,
      });
      onRequestClose(true);
    } catch (error) {
      appMessage.error(getErrorMessage(error));
      logger.error(error);
    }
  };

  // Delete removes the published announcement from the server, so it goes
  // through a confirm modal instead of firing on the footer click. `onOk`
  // returns the delete promise so the modal's OK button shows a spinner until
  // the request settles.
  const confirmDelete = () => {
    modal.confirm({
      title: t('dialog.ask.DoYouWantToDelete'),
      content: t('dialog.warning.CannotBeUndone'),
      okText: t('button.Delete'),
      okButtonProps: { danger: true },
      onOk: handleDelete,
    });
  };

  return (
    <BAIModal
      width="90%"
      style={{ maxWidth: 1900 }}
      title={t('summary.EditAnnouncement')}
      onCancel={() => onRequestClose()}
      footer={
        <BAIFlex
          justify="between"
          align="center"
          gap="sm"
          style={{ width: '100%' }}
        >
          {/* Delete clears the published announcement, placed at the footer's
              bottom-left like other edit modals' destroy action. Disabled when
              there is nothing stored to delete. Restore the Enabled checkbox
              here once the backend can persist a disabled-but-present
              announcement:
          <Checkbox
            checked={enabled}
            onChange={(e) => setEnabledDraft(e.target.checked)}
          >
            {t('summary.AnnouncementEnabled')}
          </Checkbox> */}
          <BAIFlex>
            <Button
              variant="destructive"
              label={t('button.Delete')}
              isDisabled={isLoading || !announcement?.enabled}
              isLoading={deleteMutation.isPending}
              onClick={confirmDelete}
            />
          </BAIFlex>
          <BAIFlex gap="xs" align="center">
            <Button
              variant="secondary"
              label={t('button.Cancel')}
              onClick={() => onRequestClose()}
            />
            <Button
              variant="primary"
              label={t('button.Publish')}
              isDisabled={isLoading || isMessageMissing}
              isLoading={updateMutation.isPending}
              onClick={handleSubmit}
            />
          </BAIFlex>
        </BAIFlex>
      }
      {...modalProps}
    >
      {isLoading ? (
        <BAISkeletonAstryx rows={4} />
      ) : (
        <BAIFlex direction="row" align="stretch" gap="sm" wrap="wrap">
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xxs"
            style={{ flex: 1, minWidth: 0 }}
          >
            <Text weight="semibold">{t('summary.AnnouncementMessage')}</Text>
            <MarkdownEditorField
              height={EDITOR_HEIGHT}
              value={message}
              onChange={setMessageDraft}
            />
            {isMessageMissing && (
              // PILOT-DECISION: antd `Typography.Text type="danger"` has no
              // Astryx TextColor equivalent (MAPPING §3.4) — same drop as
              // AdminModelCard.tsx: red tint dropped, `type="supporting"`
              // keeps the small caption size.
              <Text type="supporting" color="primary">
                {t('summary.AnnouncementMessageRequired')}
              </Text>
            )}
          </BAIFlex>
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xxs"
            style={{ flex: 1, minWidth: 0 }}
          >
            <Text weight="semibold">{t('summary.AnnouncementPreview')}</Text>
            <div
              className="announcement-markdown-preview"
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                padding: token.paddingLG,
                // Match the editor's outer height (its inner height + the
                // toolbar bar and the editor wrapper's borders).
                height: `calc(${EDITOR_HEIGHT} + ${token.controlHeightSM + 2}px)`,
                boxSizing: 'border-box',
                overflow: 'auto',
              }}
            >
              <Markdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  // Fenced code blocks: render through the shared shiki-based
                  // highlighter (theme-aware). Inline code keeps the default
                  // <code> and is styled via CSS.
                  pre({ children }) {
                    const codeElement = Array.isArray(children)
                      ? children[0]
                      : children;
                    const className: string =
                      // @ts-ignore - react-markdown passes the <code> element here
                      codeElement?.props?.className ?? '';
                    const match = /language-(\w+)/.exec(className);
                    const content = String(
                      // @ts-ignore
                      codeElement?.props?.children ?? '',
                    ).replace(/\n$/, '');
                    return (
                      <SyntaxHighlighter language={match?.[1] ?? 'txt'}>
                        {content}
                      </SyntaxHighlighter>
                    );
                  },
                }}
              >
                {message}
              </Markdown>
            </div>
          </BAIFlex>
        </BAIFlex>
      )}
    </BAIModal>
  );
};

// A markdown editor field (Monaco) with a velog-style formatting toolbar.
// A controlled component with the standard value / onChange contract.
const MarkdownEditorField: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
  height: string;
}> = ({ value, onChange, height }) => {
  'use memo';

  const { t } = useTranslation();
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const monacoRef = useRef<MonacoNamespace | null>(null);

  // Wrap the current selection (or a placeholder when nothing is selected)
  // with inline markdown markers, e.g. **bold**, *italic*, `code`.
  const wrapSelection = useCallback(
    (before: string, after: string, placeholder: string) => {
      const editor = editorRef.current;
      const selection = editor?.getSelection();
      const model = editor?.getModel();
      if (!editor || !selection || !model) return;
      const selected = model.getValueInRange(selection);
      const inner = selected || placeholder;
      editor.executeEdits('md-toolbar', [
        {
          range: selection,
          text: `${before}${inner}${after}`,
          forceMoveMarkers: false,
        },
      ]);
      // Re-select the inner text (the original selection, or the placeholder)
      // so the caret lands on it — ready to type over — instead of after the
      // closing marker. `inner` is single-line for inline formatting, so the
      // column math stays on the start line.
      const startColumn = selection.startColumn + before.length;
      editor.setSelection({
        startLineNumber: selection.startLineNumber,
        startColumn,
        endLineNumber: selection.startLineNumber,
        endColumn: startColumn + inner.length,
      });
      editor.focus();
    },
    [],
  );

  // Prepend a marker to the start of every line in the selection, e.g. "## ",
  // "> ", "- ", "1. ".
  const prependLines = useCallback((prefix: string) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const selection = editor?.getSelection();
    if (!editor || !monaco || !selection) return;
    const edits = [];
    for (
      let line = selection.startLineNumber;
      line <= selection.endLineNumber;
      line++
    ) {
      edits.push({
        range: new monaco.Range(line, 1, line, 1),
        text: prefix,
        forceMoveMarkers: true,
      });
    }
    editor.executeEdits('md-toolbar', edits);
    editor.focus();
  }, []);

  return (
    <BAIFlex direction="column" align="stretch" gap={0}>
      {/* PILOT-DECISION: antd's `Tooltip` wrapping a text-only `Button` per
          toolbar action is replaced by `IconButton`'s own native `tooltip`
          prop — one component instead of two, same hover hint (P8: `label`
          supplies the accessible name; `tooltip` the visible hint). */}
      <BAIFlex
        className="announcement-toolbar"
        gap="xxs"
        align="center"
        wrap="wrap"
      >
        <DropdownMenu
          button={{
            icon: <ALargeSmall size="1em" />,
            isIconOnly: true,
            label: t('summary.MarkdownHeading'),
            variant: 'ghost',
            size: 'sm',
            tooltip: t('summary.MarkdownHeading'),
          }}
          hasChevron={false}
          items={[
            { label: 'H1', onClick: () => prependLines('# ') },
            { label: 'H2', onClick: () => prependLines('## ') },
            { label: 'H3', onClick: () => prependLines('### ') },
          ]}
        />
        <IconButton
          icon={<Bold size="1em" />}
          label={t('summary.MarkdownBold')}
          tooltip={t('summary.MarkdownBold')}
          variant="ghost"
          size="sm"
          onClick={() => wrapSelection('**', '**', t('summary.MarkdownBold'))}
        />
        <IconButton
          icon={<Italic size="1em" />}
          label={t('summary.MarkdownItalic')}
          tooltip={t('summary.MarkdownItalic')}
          variant="ghost"
          size="sm"
          onClick={() => wrapSelection('*', '*', t('summary.MarkdownItalic'))}
        />
        <IconButton
          icon={<Strikethrough size="1em" />}
          label={t('summary.MarkdownStrikethrough')}
          tooltip={t('summary.MarkdownStrikethrough')}
          variant="ghost"
          size="sm"
          onClick={() =>
            wrapSelection('~~', '~~', t('summary.MarkdownStrikethrough'))
          }
        />
        <IconButton
          icon={
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700 }}>
              &ldquo;
            </span>
          }
          label={t('summary.MarkdownQuote')}
          tooltip={t('summary.MarkdownQuote')}
          variant="ghost"
          size="sm"
          onClick={() => prependLines('> ')}
        />
        <IconButton
          icon={<Code size="1em" />}
          label={t('summary.MarkdownCode')}
          tooltip={t('summary.MarkdownCode')}
          variant="ghost"
          size="sm"
          onClick={() => wrapSelection('`', '`', 'code')}
        />
        <IconButton
          icon={<Link size="1em" />}
          label={t('summary.MarkdownLink')}
          tooltip={t('summary.MarkdownLink')}
          variant="ghost"
          size="sm"
          onClick={() =>
            wrapSelection('[', '](https://)', t('summary.MarkdownLink'))
          }
        />
        <IconButton
          icon={<Image size="1em" />}
          label={t('summary.MarkdownImage')}
          tooltip={t('summary.MarkdownImage')}
          variant="ghost"
          size="sm"
          onClick={() => wrapSelection('![', '](https://)', 'alt')}
        />
        <IconButton
          icon={<List size="1em" />}
          label={t('summary.MarkdownBulletList')}
          tooltip={t('summary.MarkdownBulletList')}
          variant="ghost"
          size="sm"
          onClick={() => prependLines('- ')}
        />
        <IconButton
          icon={<ListOrdered size="1em" />}
          label={t('summary.MarkdownNumberedList')}
          tooltip={t('summary.MarkdownNumberedList')}
          variant="ghost"
          size="sm"
          onClick={() => prependLines('1. ')}
        />
      </BAIFlex>
      <BAICodeEditor
        language="markdown"
        editable
        lineWrapping
        height={height}
        value={value}
        onChange={onChange}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
        }}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      />
    </BAIFlex>
  );
};

export default AnnouncementEditModal;
