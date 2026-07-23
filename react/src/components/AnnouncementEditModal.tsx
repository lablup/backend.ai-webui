/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import { announcementQueryOptions } from '../hooks/useSuspenseGetAnnouncement';
import BAICodeEditor from './BAICodeEditor';
import { SyntaxHighlighter } from './Chat/SyntaxHighlighter';
import {
  BoldOutlined,
  CodeOutlined,
  FontSizeOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { OnMount } from '@monaco-editor/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  App,
  Button,
  Dropdown,
  Skeleton,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
  useBAILogger,
} from 'backend.ai-ui';
// `rehype-katex` does not import the CSS file, so we need to import it manually.
import 'katex/dist/katex.min.css';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

type MonacoEditorInstance = Parameters<OnMount>[0];
type MonacoNamespace = Parameters<OnMount>[1];

const useStyles = createStyles(({ css, token }) => ({
  // velog-style reading typography for the live preview: comfortable line
  // height, bordered headings, accented blockquotes, GitHub-flavored tables.
  markdownPreview: css`
    color: ${token.colorText};
    font-size: ${token.fontSize}px;
    line-height: 1.7;
    word-break: break-word;

    & > *:first-child {
      margin-top: 0;
    }
    & > *:last-child {
      margin-bottom: 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 1.5em 0 0.75em;
      font-weight: ${token.fontWeightStrong};
      line-height: 1.4;
    }
    h1 {
      font-size: 1.9em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid ${token.colorBorderSecondary};
    }
    h2 {
      font-size: 1.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid ${token.colorBorderSecondary};
    }
    h3 {
      font-size: 1.25em;
    }
    h4 {
      font-size: 1em;
    }

    p {
      margin: 0 0 1em;
    }

    a {
      color: ${token.colorLink};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    img {
      max-width: 100%;
      border-radius: ${token.borderRadius}px;
    }

    /* Restore list markers: the global reset in resources/webui.css sets
       \`ul { list-style-type: none }\`, which otherwise hides bullets here. */
    ul,
    ol {
      margin: 0 0 1em;
      padding-left: 1.6em;
    }
    ul {
      list-style: disc;
    }
    ul ul {
      list-style: circle;
    }
    ol {
      list-style: decimal;
    }
    li {
      margin: 0.25em 0;
    }
    li > p {
      margin: 0;
    }
    li > input[type='checkbox'] {
      margin-right: 0.4em;
    }

    blockquote {
      margin: 0 0 1em;
      padding: 0.4em 1em;
      color: ${token.colorTextSecondary};
      border-left: 4px solid ${token.colorPrimary};
      background: ${token.colorFillQuaternary};
      border-radius: ${token.borderRadiusSM}px;
    }
    blockquote > *:last-child {
      margin-bottom: 0;
    }

    hr {
      margin: 1.5em 0;
      border: none;
      border-top: 1px solid ${token.colorBorderSecondary};
    }

    /* Inline code only; fenced blocks are rendered by SyntaxHighlighter. */
    :not(pre) > code {
      padding: 0.15em 0.4em;
      font-family: ${token.fontFamilyCode};
      font-size: 0.9em;
      background: ${token.colorFillSecondary};
      border-radius: ${token.borderRadiusSM}px;
    }
    pre {
      margin: 0 0 1em;
      border-radius: ${token.borderRadius}px;
      overflow: auto;
    }

    table {
      width: 100%;
      margin: 0 0 1em;
      border-collapse: collapse;
      font-size: 0.95em;
    }
    th,
    td {
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      border: 1px solid ${token.colorBorderSecondary};
    }
    th {
      background: ${token.colorFillTertiary};
      font-weight: ${token.fontWeightStrong};
      text-align: left;
    }
  `,
  toolbar: css`
    padding: ${token.paddingXXS}px ${token.paddingXS}px;
    border: 1px solid ${token.colorBorder};
    border-bottom: none;
    border-top-left-radius: ${token.borderRadius}px;
    border-top-right-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
}));

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
  const { styles } = useStyles();
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
              type="text"
              danger
              disabled={isLoading || !announcement?.enabled}
              loading={deleteMutation.isPending}
              onClick={confirmDelete}
            >
              {t('button.Delete')}
            </Button>
          </BAIFlex>
          <BAIFlex gap="xs" align="center">
            <Button onClick={() => onRequestClose()}>
              {t('button.Cancel')}
            </Button>
            <Button
              type="primary"
              disabled={isLoading || isMessageMissing}
              loading={updateMutation.isPending}
              onClick={handleSubmit}
            >
              {t('button.Publish')}
            </Button>
          </BAIFlex>
        </BAIFlex>
      }
      {...modalProps}
    >
      {isLoading ? (
        <Skeleton active />
      ) : (
        <BAIFlex direction="row" align="stretch" gap="sm" wrap="wrap">
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xxs"
            style={{ flex: 1, minWidth: 0 }}
          >
            <Typography.Text strong>
              {t('summary.AnnouncementMessage')}
            </Typography.Text>
            <MarkdownEditorField
              height={EDITOR_HEIGHT}
              value={message}
              onChange={setMessageDraft}
            />
            {isMessageMissing && (
              <Typography.Text type="danger">
                {t('summary.AnnouncementMessageRequired')}
              </Typography.Text>
            )}
          </BAIFlex>
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xxs"
            style={{ flex: 1, minWidth: 0 }}
          >
            <Typography.Text strong>
              {t('summary.AnnouncementPreview')}
            </Typography.Text>
            <div
              className={styles.markdownPreview}
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
  const { styles } = useStyles();
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
      <BAIFlex className={styles.toolbar} gap="xxs" align="center" wrap="wrap">
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: '1', label: 'H1' },
              { key: '2', label: 'H2' },
              { key: '3', label: 'H3' },
            ],
            onClick: ({ key }) => prependLines(`${'#'.repeat(Number(key))} `),
          }}
        >
          <Tooltip title={t('summary.MarkdownHeading')}>
            <Button type="text" size="small" icon={<FontSizeOutlined />} />
          </Tooltip>
        </Dropdown>
        <Tooltip title={t('summary.MarkdownBold')}>
          <Button
            type="text"
            size="small"
            icon={<BoldOutlined />}
            onClick={() => wrapSelection('**', '**', t('summary.MarkdownBold'))}
          />
        </Tooltip>
        <Tooltip title={t('summary.MarkdownItalic')}>
          <Button
            type="text"
            size="small"
            icon={<ItalicOutlined />}
            onClick={() => wrapSelection('*', '*', t('summary.MarkdownItalic'))}
          />
        </Tooltip>
        <Tooltip title={t('summary.MarkdownStrikethrough')}>
          <Button
            type="text"
            size="small"
            icon={<StrikethroughOutlined />}
            onClick={() =>
              wrapSelection('~~', '~~', t('summary.MarkdownStrikethrough'))
            }
          />
        </Tooltip>
        <Tooltip title={t('summary.MarkdownQuote')}>
          <Button
            type="text"
            size="small"
            icon={
              <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700 }}>
                &ldquo;
              </span>
            }
            onClick={() => prependLines('> ')}
          />
        </Tooltip>
        <Tooltip title={t('summary.MarkdownCode')}>
          <Button
            type="text"
            size="small"
            icon={<CodeOutlined />}
            onClick={() => wrapSelection('`', '`', 'code')}
          />
        </Tooltip>
        <Tooltip title={t('summary.MarkdownLink')}>
          <Button
            type="text"
            size="small"
            icon={<LinkOutlined />}
            onClick={() =>
              wrapSelection('[', '](https://)', t('summary.MarkdownLink'))
            }
          />
        </Tooltip>
        <Tooltip title={t('summary.MarkdownImage')}>
          <Button
            type="text"
            size="small"
            icon={<PictureOutlined />}
            onClick={() => wrapSelection('![', '](https://)', 'alt')}
          />
        </Tooltip>
        <Tooltip title={t('summary.MarkdownBulletList')}>
          <Button
            type="text"
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => prependLines('- ')}
          />
        </Tooltip>
        <Tooltip title={t('summary.MarkdownNumberedList')}>
          <Button
            type="text"
            size="small"
            icon={<OrderedListOutlined />}
            onClick={() => prependLines('1. ')}
          />
        </Tooltip>
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
