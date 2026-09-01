/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — modal shell converted to BUI `BAIModal` (the unsaved-changes
 dialog below was already Astryx from the app-shim migration). PILOT-DECISION:
 the antd modal's JSX title ("Edit File — name (size)") splits into the
 Astryx `DialogHeader`'s string `title` + `subtitle` (P2). `keyboard={false}`
 is replaced by the dirty-check on `onOpenChange` — Escape now routes through
 the same unsaved-changes confirmation instead of being disabled outright.
*/
import { App } from '../app-shim';
import { loadMonacoEditor } from '../helper/monacoEditor';
import { useTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useThemeMode } from '../hooks/useThemeMode';
import type { RcFile } from './FileUploadManager';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import type { Monaco, OnMount } from '@monaco-editor/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  BAISkeleton,
  BAIModal,
  type BAIModalProps,
  VFolderFile,
  convertToDecimalUnit,
  useConnectedBAIClient,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const MonacoEditor = React.lazy(() =>
  loadMonacoEditor().then((module) => ({
    default: module.Editor,
  })),
);

/**
 * The file shape `FileUploadManager.uploadFiles` accepts.
 *
 * This was a local restatement of `import { RcFile } from 'antd/es/upload'` —
 * a deep antd SUBPATH import that rendered nothing but kept this module in the
 * import graph (P15), and that a `from 'antd'` grep does not catch. It was
 * declared here rather than shared because `FileUploadManager` still owned the
 * antd type at the time, with a note that both sides should settle on one type
 * once it shed `antd/es/upload`. It has, so they do: `RcFile` is now imported
 * from the upload manager itself, which is where the producer of the contract
 * lives. The shape is unchanged (`File` + rc-upload's `uid` + the deprecated
 * `lastModifiedDate` it stamps on every file).
 */
type UploadableFile = RcFile;

interface VFolderTextFileEditorModalProps extends Omit<
  BAIModalProps,
  'children' | 'title' | 'isOpen' | 'onOpenChange' | 'onAction'
> {
  /** App-level contract, kept: the explorer passes `open`. */
  open?: boolean;
  targetVFolderId: string;
  currentPath: string;
  fileInfo: VFolderFile | null;
  onRequestClose: (success?: boolean) => void;
  uploadFiles: (
    files: UploadableFile[],
    vfolderId: string,
    currentPath: string,
  ) => Promise<void>;
}

const detectLanguageAndMimeType = (monaco: Monaco, fileName: string) => {
  const languages = monaco.languages.getLanguages();

  for (const lang of languages) {
    if (lang.extensions?.some((ext: string) => fileName.endsWith(ext))) {
      const mimeType = lang.mimetypes?.[0] ?? 'text/plain';
      return { detectedLanguage: lang.id, detectedMimeType: mimeType };
    }
  }

  return { detectedLanguage: 'plaintext', detectedMimeType: 'text/plain' };
};

type SchemaMapping = {
  schemaUrl: string;
  type: 'yaml' | 'toml';
};

const definitionSchemaMap: Record<string, SchemaMapping> = {
  'model-definition.yaml': {
    schemaUrl: '/resources/model-definition.schema.json',
    type: 'yaml',
  },
  'model-definition.yml': {
    schemaUrl: '/resources/model-definition.schema.json',
    type: 'yaml',
  },
  'service-definition.toml': {
    schemaUrl: '/resources/service-definition.schema.json',
    type: 'toml',
  },
};

const VFolderTextFileEditorModal: React.FC<VFolderTextFileEditorModalProps> = ({
  targetVFolderId,
  currentPath,
  fileInfo,
  onRequestClose,
  uploadFiles,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { isDarkMode } = useThemeMode();
  const { message } = App.useApp();
  const baiClient = useConnectedBAIClient();
  const { getErrorMessage } = useErrorMessageResolver();
  const { upsertNotification } = useSetBAINotification();

  const queryClient = useQueryClient();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const detectedMimeTypeRef = useRef<string>('text/plain');
  const abortControllerRef = useRef<AbortController | null>(null);
  const disposablesRef = useRef<{ dispose(): void }[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isUnsavedConfirmOpen, setIsUnsavedConfirmOpen] = useState(false);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      disposablesRef.current.forEach((d) => d.dispose());
      disposablesRef.current = [];
    };
  }, []);

  const filePath =
    currentPath === '.'
      ? fileInfo?.name
      : `${currentPath}/${fileInfo?.name}`.replace(/^\.\//, '');

  // TODO: Restrict browser editing when the file size exceeds the limit.
  const {
    data: fileContent,
    error: loadError,
    isFetching,
  } = useTanQuery({
    queryKey: ['textFileContent', targetVFolderId, filePath],
    queryFn: async () => {
      const tokenResponse = await baiClient.vfolder.request_download_token(
        filePath!,
        targetVFolderId,
        false,
      );

      const downloadUrl = `${tokenResponse.url}?token=${tokenResponse.token}&archive=false`;
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return blob.text();
    },
    enabled: !!modalProps.open && !!fileInfo && !!targetVFolderId,
    staleTime: 0,
    gcTime: 0,
  });

  const saveMutation = useTanMutation({
    mutationFn: async () => {
      if (!fileInfo) return;

      const contentToSave = editorRef.current?.getValue() ?? fileContent ?? '';
      const blob = new Blob([contentToSave], {
        type: detectedMimeTypeRef.current,
      });
      const file = new File([blob], fileInfo.name, {
        type: detectedMimeTypeRef.current,
      }) as UploadableFile;

      // Workaround: tus-js-client skips PATCH requests for 0-byte files,
      // immediately calling onSuccess without uploading any data.
      // (ref: https://github.com/tus/tus-js-client/blob/v4.3.1/lib/upload.js#L578-L582)
      // To handle empty content saves, we manually create an upload session
      // and send the PATCH request directly.
      if (file.size === 0) {
        const uploadPath = [currentPath, fileInfo.name]
          .filter(Boolean)
          .join('/');
        const uploadUrl: string = await baiClient.vfolder.create_upload_session(
          uploadPath,
          file,
          targetVFolderId,
        );

        const response = await fetch(uploadUrl, {
          method: 'PATCH',
          headers: {
            'Upload-Offset': '0',
            'Content-Type': 'application/offset+octet-stream',
            'Tus-Resumable': '1.0.0',
          },
          body: blob,
        });

        if (!response.ok) {
          throw new Error(
            t('explorer.UploadFailed', { folderName: fileInfo.name }),
          );
        }

        upsertNotification({
          key: 'upload:' + targetVFolderId,
          open: true,
          backgroundTask: {
            status: 'resolved',
            percent: 100,
            onChange: {
              resolved: t('explorer.SuccessfullyUploadedToFolder'),
            },
          },
          duration: 3,
        });
      } else {
        await uploadFiles([file], targetVFolderId, currentPath);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['textFileContent', targetVFolderId, filePath],
      });
      onRequestClose(true);
    },
    onError: (error) => {
      message.error(getErrorMessage(error));
    },
  });

  const handleRequestClose = () => {
    if (!isDirty) {
      onRequestClose();
      return;
    }
    setIsUnsavedConfirmOpen(true);
  };

  // A 3-button footer (Save / Don't Save / Cancel) has no generated-action
  // analog, so it goes through `BAIModal`'s full `footer` override. It opens on
  // top of the editor modal; the portal's level stack stacks it.
  const closeUnsavedConfirm = () => setIsUnsavedConfirmOpen(false);
  const unsavedConfirmDialog = (
    <BAIModal
      isOpen={isUnsavedConfirmOpen}
      onOpenChange={closeUnsavedConfirm}
      // `BAIModal`'s vocabulary for Astryx `purpose="form"`: the backdrop does
      // not dismiss (unsaved work), Escape still does.
      maskClosable={false}
      title={t('data.explorer.EditFileUnsavedChangesTitle', {
        fileName: fileInfo?.name,
      })}
      footer={
        <HStack justify="end" gap={2} align="center">
          <Button
            label={t('button.Cancel')}
            variant="secondary"
            onClick={closeUnsavedConfirm}
          />
          <Button
            label={t('button.DontSave')}
            variant="secondary"
            onClick={() => {
              closeUnsavedConfirm();
              onRequestClose();
            }}
          />
          <Button
            label={t('button.Save')}
            variant="primary"
            onClick={() => {
              closeUnsavedConfirm();
              saveMutation.mutate();
            }}
          />
        </HStack>
      }
    >
      {t('data.explorer.EditFileUnsavedChangesDescription')}
    </BAIModal>
  );

  const skeletonWithPadding = (
    <BAISkeleton
      rows={3}
      style={{
        alignSelf: 'start',
        paddingInline: 'var(--spacing-4)',
        paddingBlock: 'var(--spacing-3)',
      }}
    />
  );
  const fileSizeSuffix =
    fileInfo && fileInfo.size > 0
      ? ` (${convertToDecimalUnit(fileInfo.size, 'auto')?.displayValue})`
      : '';
  return (
    <BAIModal
      width={'100%'}
      maxHeight={'95vh'}
      title={t('data.explorer.EditFile')}
      subtitle={fileInfo ? `${fileInfo.name}${fileSizeSuffix}` : undefined}
      maskClosable={false}
      okText={t('button.Save')}
      cancelText={t('button.Cancel')}
      confirmLoading={saveMutation.isPending}
      okButtonProps={{ disabled: !!loadError }}
      onOk={() => saveMutation.mutate()}
      isOpen={modalProps.open}
      onOpenChange={(next) => {
        if (!next) handleRequestClose();
      }}
      {...modalProps}
    >
      <VStack gap={5} align="stretch" style={{ height: 'calc(100vh - 220px)' }}>
        <Suspense fallback={skeletonWithPadding}>
          {loadError ? (
            <Banner
              status="error"
              title={t('data.explorer.FailedToLoadFile')}
              description={t('data.explorer.FailedToLoadFileDescription')}
            />
          ) : isFetching ? (
            skeletonWithPadding
          ) : (
            <MonacoEditor
              defaultValue={fileContent ?? ''}
              defaultPath={fileInfo?.name}
              onChange={() => {
                setIsDirty(true);
              }}
              beforeMount={(monaco) => {
                if (fileInfo?.name) {
                  const { detectedMimeType } = detectLanguageAndMimeType(
                    monaco,
                    fileInfo.name,
                  );
                  detectedMimeTypeRef.current = detectedMimeType;
                }
              }}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                if (fileInfo?.name) {
                  const { detectedLanguage } = detectLanguageAndMimeType(
                    monaco,
                    fileInfo.name,
                  );
                  const model = editor.getModel();
                  if (model) {
                    monaco.editor.setModelLanguage(model, detectedLanguage);
                  }

                  const mapping = definitionSchemaMap[fileInfo.name];
                  if (mapping) {
                    const abortController = new AbortController();
                    abortControllerRef.current = abortController;
                    fetch(mapping.schemaUrl, {
                      signal: abortController.signal,
                    })
                      .then((res) => (res.ok ? res.json() : undefined))
                      .then(async (schema) => {
                        if (!schema || abortController.signal.aborted || !model)
                          return;

                        if (mapping.type === 'yaml') {
                          const { createYamlValidator } =
                            await import('../helper/monacoYamlValidator');
                          disposablesRef.current.push(
                            createYamlValidator(monaco, model, schema),
                          );

                          const { createYamlCompletionProvider } =
                            await import('../helper/monacoYamlCompletion');
                          disposablesRef.current.push(
                            createYamlCompletionProvider(monaco, model, schema),
                          );
                        } else if (mapping.type === 'toml') {
                          const { registerTomlLanguage } =
                            await import('../helper/monacoTomlLanguage');
                          registerTomlLanguage(monaco);
                          monaco.editor.setModelLanguage(model, 'toml');

                          const { createTomlValidator } =
                            await import('../helper/monacoTomlValidator');
                          const disposable = createTomlValidator(
                            monaco,
                            model,
                            schema,
                          );
                          disposablesRef.current.push(disposable);
                        }
                      })
                      .catch((e) => {
                        if (
                          e instanceof DOMException &&
                          e.name === 'AbortError'
                        )
                          return;
                        // Log unexpected errors (schema fetch, import, or init failure)
                        // eslint-disable-next-line no-console
                        console.warn('Schema validation setup failed:', e);
                      });
                  }
                }
              }}
              theme={isDarkMode ? 'vs-dark' : 'light'}
              loading={skeletonWithPadding}
              width={'100%'}
              height={'100%'}
              options={{
                fixedOverflowWidgets: true,
              }}
            />
          )}
        </Suspense>
      </VStack>
      {unsavedConfirmDialog}
    </BAIModal>
  );
};

export default VFolderTextFileEditorModal;
