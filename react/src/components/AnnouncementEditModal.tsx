/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import {
  DOMAIN_ANNOUNCEMENT_CONFIG_KEY,
  DomainAnnouncement,
} from '../helper/announcement';
import {
  useDomainAppConfig,
  useUpdateDomainAppConfig,
} from '../hooks/useAppConfig';
import './AnnouncementEditModal.css';
import BAICodeEditor from './BAICodeEditor';
import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Markdown } from '@astryxdesign/core/Markdown';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { useTheme } from '@astryxdesign/core/theme';
import type { OnMount } from '@monaco-editor/react';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
  useBAILogger,
} from 'backend.ai-ui';
import {
  Bold,
  Code,
  ALargeSmall,
  Ellipsis,
  Italic,
  Link,
  ListOrdered,
  Image,
  Strikethrough,
  List,
} from 'lucide-react';
import { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type MonacoEditorInstance = Parameters<OnMount>[0];
type MonacoNamespace = Parameters<OnMount>[1];

// Height of the markdown editor. Sized relative to the viewport so the whole
// editor + label + toolbar + validation message fits inside the modal body's
// max-height without producing a scrollbar. The `- 360px` budget covers the
// modal chrome (header, footer, body padding) plus the title field, the body
// label, toolbar, and the validation message row. The preview box matches the
// editor's outer height (this value + the editor wrapper's 1px border).
const EDITOR_HEIGHT = 'calc(100vh - 360px)';

interface AnnouncementEditModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
}

type AnnouncementFormValues = { title: string };

/**
 * Edits the domain's system announcement in the domain app config
 * (`domainConfig.announcement`, FR-3877). The content reads the saved
 * announcement through Relay and suspends; the fallback keeps the modal
 * chrome on screen with a skeleton body while it loads.
 */
const AnnouncementEditModal: React.FC<AnnouncementEditModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <BAIModal
          width="90%"
          style={{ maxWidth: 1900 }}
          title={t('summary.EditAnnouncement')}
          onCancel={() => onRequestClose()}
          footer={null}
          loading
          {...modalProps}
        />
      }
    >
      <AnnouncementEditModalContent
        onRequestClose={onRequestClose}
        {...modalProps}
      />
    </Suspense>
  );
};

const AnnouncementEditModalContent: React.FC<AnnouncementEditModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = useTheme();
  const { message: appMessage, modal } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const announcement = useDomainAppConfig<DomainAnnouncement>(
    DOMAIN_ANNOUNCEMENT_CONFIG_KEY,
  );
  const updateDomainAppConfig = useUpdateDomainAppConfig();

  const formRef = useRef<FormInstance<AnnouncementFormValues>>(null);
  const [bodyDraft, setBodyDraft] = useState<string>();
  const body = bodyDraft ?? announcement?.body ?? '';

  // Publish and Save as Draft write the same document; only `enabled` differs.
  const [saving, setSaving] = useState<'publish' | 'draft'>();
  const [isDeleting, setIsDeleting] = useState(false);

  const save = async (enabled: boolean) => {
    let values: AnnouncementFormValues | undefined;
    try {
      values = await formRef.current?.validateFields();
    } catch {
      return; // the form item shows the field error
    }
    if (!values) return;
    setSaving(enabled ? 'publish' : 'draft');
    try {
      const next: DomainAnnouncement = {
        enabled,
        title: values.title.trim(),
        body: body.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
      await updateDomainAppConfig(DOMAIN_ANNOUNCEMENT_CONFIG_KEY, next);
      appMessage.success(t('summary.AnnouncementUpdated'));
      onRequestClose(true);
    } catch (error) {
      appMessage.error(getErrorMessage(error));
      logger.error(error);
    } finally {
      setSaving(undefined);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await updateDomainAppConfig(DOMAIN_ANNOUNCEMENT_CONFIG_KEY, undefined);
      appMessage.success(t('summary.AnnouncementDeleted'));
      onRequestClose(true);
    } catch (error) {
      appMessage.error(getErrorMessage(error));
      logger.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete removes the announcement from the domain config, so it goes
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
      title={
        announcement?.enabled === false ? (
          <BAIFlex gap="xs" align="center">
            {t('summary.EditAnnouncement')}
            <Token
              label={t('summary.AnnouncementDraft')}
              size="sm"
              color="gray"
            />
          </BAIFlex>
        ) : (
          t('summary.EditAnnouncement')
        )
      }
      onCancel={() => onRequestClose()}
      footer={
        <BAIFlex
          justify="between"
          align="center"
          gap="sm"
          style={{ width: '100%' }}
        >
          <Button
            variant="destructive"
            label={t('button.Delete')}
            isDisabled={announcement === undefined}
            isLoading={isDeleting}
            onClick={confirmDelete}
          />
          <BAIFlex gap="xs" align="center">
            <Button
              variant="secondary"
              label={t('button.Cancel')}
              onClick={() => onRequestClose()}
            />
            {/* Split button as the session launcher's Launch: the dropdown
                owns its own trigger. */}
            <ButtonGroup label={t('button.Publish')}>
              <Button
                variant="primary"
                label={t('button.Publish')}
                isDisabled={saving === 'draft'}
                isLoading={saving === 'publish'}
                onClick={() => save(true)}
              />
              <DropdownMenu
                hasChevron={false}
                button={{
                  variant: 'primary',
                  icon: <Ellipsis size="1em" />,
                  isIconOnly: true,
                  isDisabled: saving !== undefined,
                  label: t('button.SaveAsDraft'),
                }}
                items={[
                  {
                    label: t('button.SaveAsDraft'),
                    onClick: () => save(false),
                  },
                ]}
              />
            </ButtonGroup>
          </BAIFlex>
        </BAIFlex>
      }
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Form
          ref={formRef}
          layout="vertical"
          validateTrigger={['onChange', 'onBlur']}
          initialValues={{ title: announcement?.title ?? '' }}
        >
          <BAIFormItem
            name="title"
            label={t('summary.AnnouncementTitle')}
            rules={[{ required: true, whitespace: true }]}
          >
            <AstryxFormTextInput label={t('summary.AnnouncementTitle')} />
          </BAIFormItem>
        </Form>
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
              value={body}
              onChange={setBodyDraft}
            />
          </BAIFlex>
          <BAIFlex
            direction="column"
            align="stretch"
            gap="xxs"
            style={{ flex: 1, minWidth: 0 }}
          >
            <Text weight="semibold">{t('summary.AnnouncementPreview')}</Text>
            <div
              style={{
                border: `1px solid ${token('--color-border-emphasized')}`,
                borderRadius: token('--radius-inner'),
                padding: token('--spacing-6'),
                // Match the editor's outer height (its inner height + the
                // toolbar bar and the editor wrapper's borders).
                height: `calc(${EDITOR_HEIGHT} + ${token('--size-element-sm')} + 2px)`,
                boxSizing: 'border-box',
                overflow: 'auto',
              }}
            >
              {/* Must stay byte-identical to AnnouncementBanner's expanded
                  markdown props — a preview that renders differently from the
                  published banner is the whole of FR-3402. */}
              <Markdown density="compact" headingLevelStart={3} autolink="gfm">
                {body}
              </Markdown>
            </div>
          </BAIFlex>
        </BAIFlex>
      </BAIFlex>
    </BAIModal>
  );
};

// A markdown editor field (Monaco) with a velog-style formatting toolbar.
// A controlled component with the standard value / onChange contract.
const MarkdownEditorField: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
  height: string;
  /** Fired once the lazily-loaded Monaco instance has mounted. */
  onReady?: () => void;
}> = ({ value, onChange, height, onReady }) => {
  'use memo';

  const { t } = useTranslation();
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const monacoRef = useRef<MonacoNamespace | null>(null);

  // Wrap the current selection (or a placeholder when nothing is selected)
  // with inline markdown markers, e.g. **bold**, *italic*, `code`.
  const wrapSelection = (
    before: string,
    after: string,
    placeholder: string,
  ) => {
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
  };

  // Prepend a marker to the start of every line in the selection, e.g. "## ",
  // "> ", "- ", "1. ".
  const prependLines = (prefix: string) => {
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
  };

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
          onReady?.();
        }}
        // The parent mounts this field hidden, so Monaco measures a 0-sized
        // container; `automaticLayout` makes it re-measure once revealed.
        options={{ automaticLayout: true }}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      />
    </BAIFlex>
  );
};

export default AnnouncementEditModal;
