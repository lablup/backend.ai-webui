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
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { Button } from '@astryxdesign/core/Button';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Markdown } from '@astryxdesign/core/Markdown';
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
import { useCallback, useDeferredValue, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

  // The manager now stores the message and the `enabled` flag under separate
  // etcd keys (see backend.ai#12679 / BA-6794), so a disabled announcement's
  // text is retained rather than discarded. That unlocks a Save Draft action
  // (`enabled: false`, message kept) alongside Publish (`enabled: true`). A
  // free-form Enabled toggle that lets an admin flip an already-published
  // announcement back to draft is still out of scope (FR-3473 covers only the
  // `enabled: false` save-draft path) — the toggle implementation is kept below
  // (commented out) for that follow-up.
  //
  // const [enabledDraft, setEnabledDraft] = useState<boolean>();
  // const enabled = enabledDraft ?? announcement?.enabled ?? true;
  const [messageDraft, setMessageDraft] = useState<string>();
  const message = messageDraft ?? announcement?.message ?? '';
  // Whether the editor still reflects the fetched announcement verbatim (no
  // local edits yet). Used to key the Monaco editor below so a background
  // refetch that lands after the initial (possibly stale, cache-first)
  // render can still replace its `defaultValue` — but only while there is
  // nothing in-progress to lose.
  const isPristine = messageDraft === undefined;

  // The live preview re-parses the whole Markdown document on every
  // keystroke, which is expensive enough on a large announcement to make
  // typing feel laggy. (The editor itself no longer round-trips through this
  // state — see the `defaultValue` passed to MarkdownEditorField below — so
  // deferring this is purely a responsiveness optimization, not a
  // correctness fix.)
  const previewMessage = useDeferredValue(message);

  // Both Publish and Save Draft require text to be worth persisting; the
  // backend also rejects an empty message when enabling ("Empty message not
  // allowed to enable announcement"). Delete is the dedicated action for
  // clearing the stored message entirely.
  const isMessageMissing = !message.trim();

  const publishMutation = useTanMutation({
    mutationFn: (value: string) =>
      baiClient.service.update_announcement(true, value),
  });

  const saveDraftMutation = useTanMutation({
    mutationFn: (value: string) =>
      baiClient.service.update_announcement(false, value),
  });

  // Deleting is `update_announcement(false, '')`: an explicit empty message
  // clears the stored text regardless of `enabled`, removing both a published
  // announcement and an unpublished draft.
  const deleteMutation = useTanMutation({
    mutationFn: () => baiClient.service.update_announcement(false, ''),
  });

  // Publish, Save Draft, and Delete all write the same `enabled`/message
  // slot. Each button only reflects its own pending state, so nothing stops
  // an admin from firing a second mutation while the first is still in
  // flight — e.g. Save Draft then Publish racing, where whichever request
  // the server finishes last silently wins regardless of which success
  // message the UI already showed. Block all three actions while any one of
  // them is pending.
  const isAnyMutationPending =
    publishMutation.isPending ||
    saveDraftMutation.isPending ||
    deleteMutation.isPending;

  // The retained-draft semantics this button relies on (`enabled: false`
  // keeps the stored message instead of discarding it) landed in the
  // manager only as of 26.8.0 (backend#12679 / BA-6794). Older managers
  // still delete the message on disable, so on those managers this button
  // would report "Draft saved" while quietly wiping the announcement.
  const supportsDraftSave = baiClient.supports('retained-announcement-message');

  const handlePublish = () => {
    if (isMessageMissing) return;
    publishMutation.mutate(message, {
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
    });
  };

  // Save Draft persists the message with `enabled: false` and keeps the modal
  // open so editing can continue — unlike Publish, it isn't a closing action.
  const handleSaveDraft = () => {
    if (isMessageMissing) return;
    saveDraftMutation.mutate(message, {
      onSuccess: () => {
        appMessage.success(t('summary.AnnouncementDraftSaved'));
        queryClient.invalidateQueries({
          queryKey: announcementQueryOptions(baiClient).queryKey,
        });
      },
      onError: (error) => {
        appMessage.error(getErrorMessage(error));
        logger.error(error);
      },
    });
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
          {/* Delete clears the stored announcement (published or draft),
              placed at the footer's bottom-left like other edit modals'
              destroy action. Disabled when there is nothing stored to
              delete. Restore the Enabled checkbox here once the backend can
              persist a disabled-but-present announcement:
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
              isDisabled={
                isLoading ||
                !announcement?.message?.trim() ||
                isAnyMutationPending
              }
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
            {/* The backend has only one message + `enabled` slot, so there is
                no way to hold a draft alongside a live announcement — saving
                a draft would simply overwrite the live one with `enabled:
                false`. Rather than let that surprise happen behind a "Save
                Draft" label, only offer the draft flow when nothing is
                currently published: editing a live announcement offers just
                Publish (update it in place) and Delete. */}
            {!announcement?.enabled && supportsDraftSave && (
              <Button
                variant="secondary"
                label={t('button.SaveDraft')}
                isDisabled={
                  isLoading || isMessageMissing || isAnyMutationPending
                }
                isLoading={saveDraftMutation.isPending}
                onClick={handleSaveDraft}
              />
            )}
            <Button
              variant="primary"
              label={t('button.Publish')}
              isDisabled={isLoading || isMessageMissing || isAnyMutationPending}
              isLoading={publishMutation.isPending}
              onClick={handlePublish}
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
              // The announcement query has no `staleTime` and shares its
              // cache key with the alert banner, so this modal frequently
              // mounts on already-cached (possibly stale) data while a
              // background refetch is in flight. That refetch updates
              // `announcement`, but the editor below is uncontrolled and
              // only reads `defaultValue` once. Re-keying on the fetched
              // message while nothing has been typed yet forces a remount
              // that picks up the fresh text; once the admin starts
              // editing, the key stops changing so in-progress edits are
              // never clobbered by a late-arriving refetch.
              key={isPristine ? (announcement?.message ?? '') : 'editing'}
              height={EDITOR_HEIGHT}
              defaultValue={announcement?.message}
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
              {/* Must stay byte-identical to AnnouncementAlert's props — a
                  preview that renders differently from the published banner
                  is the whole of FR-3402. */}
              <Markdown density="compact" headingLevelStart={3} autolink="gfm">
                {previewMessage}
              </Markdown>
            </div>
          </BAIFlex>
        </BAIFlex>
      )}
    </BAIModal>
  );
};

// A markdown editor field (Monaco) with a velog-style formatting toolbar.
// Uncontrolled: `defaultValue` seeds the editor once, `onChange` reports
// every edit — see BAICodeEditor's `defaultValue` doc comment for why this
// message editor deliberately isn't a controlled `value`/`onChange` pair.
const MarkdownEditorField: React.FC<{
  defaultValue?: string;
  onChange?: (value: string) => void;
  height: string;
}> = ({ defaultValue, onChange, height }) => {
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
        defaultValue={defaultValue}
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
