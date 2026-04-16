/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useThemeMode } from '../hooks/useThemeMode';
import type { Monaco, OnMount } from '@monaco-editor/react';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton, App, theme } from 'antd';
import { RcFile } from 'antd/es/upload';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  VFolderFile,
  convertToDecimalUnit,
  useConnectedBAIClient,
  useErrorMessageResolver,
  BAIText,
  BAIAlert,
  BAIButton,
} from 'backend.ai-ui';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

const MonacoEditor = React.lazy(() =>
  import('@monaco-editor/react').then((module) => ({
    default: module.Editor,
  })),
);

interface VFolderTextFileEditorModalProps extends Omit<
  BAIModalProps,
  'children' | 'title' | 'onCancel' | 'onOk' | 'confirmLoading'
> {
  targetVFolderId: string;
  currentPath: string;
  fileInfo: VFolderFile | null;
  onRequestClose: (success?: boolean) => void;
  uploadFiles: (
    files: RcFile[],
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
  'deployment-config.yaml': {
    schemaUrl: '/resources/deployment-config.schema.json',
    type: 'yaml',
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
  const { message, modal } = App.useApp();
  const baiClient = useConnectedBAIClient();
  const { getErrorMessage } = useErrorMessageResolver();
  const { token } = theme.useToken();
  const { upsertNotification } = useSetBAINotification();

  const queryClient = useQueryClient();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const detectedMimeTypeRef = useRef<string>('text/plain');
  const abortControllerRef = useRef<AbortController | null>(null);
  const disposablesRef = useRef<{ dispose(): void }[]>([]);
  const [isDirty, setIsDirty] = useState(false);

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
      }) as RcFile;

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

  const handleRequestClose = useCallback(() => {
    if (!isDirty) {
      onRequestClose();
      return;
    }
    const confirmInstance = modal.confirm({
      title: t('data.explorer.EditFileUnsavedChangesTitle', {
        fileName: fileInfo?.name,
      }),
      content: t('data.explorer.EditFileUnsavedChangesDescription'),
      icon: null,
      okText: t('button.Save'),
      cancelText: t('button.Cancel'),
      footer: (_, { OkBtn, CancelBtn }) => (
        <BAIFlex justify="end" gap="xs">
          <CancelBtn />
          <BAIButton
            onClick={() => {
              confirmInstance.destroy();
              onRequestClose();
            }}
          >
            {t('button.DontSave')}
          </BAIButton>
          <OkBtn />
        </BAIFlex>
      ),
      onOk: () => {
        saveMutation.mutate();
      },
    });
  }, [isDirty, modal, t, fileInfo?.name, onRequestClose, saveMutation]);

  const skeletonWithPadding = (
    <Skeleton
      active
      style={{
        alignSelf: 'start',
        paddingInline: token.paddingContentHorizontal,
        paddingBlock: token.paddingContentVertical,
      }}
    />
  );
  return (
    <BAIModal
      width={'100%'}
      destroyOnHidden
      okText={t('button.Save')}
      cancelText={t('button.Cancel')}
      keyboard={false}
      {...modalProps}
      title={
        <>
          {t('data.explorer.EditFile')}
          {fileInfo && (
            <BAIText type="secondary" style={{ fontWeight: 'normal' }}>
              - {fileInfo.name}
              {fileInfo.size > 0 &&
                ` (${convertToDecimalUnit(fileInfo.size, 'auto')?.displayValue})`}
            </BAIText>
          )}
        </>
      }
      onCancel={() => handleRequestClose()}
      onOk={() => saveMutation.mutate()}
      confirmLoading={saveMutation.isPending}
      okButtonProps={{ disabled: !!loadError }}
      styles={{
        body: {
          paddingBlock: 0,
          paddingInline: 0,
        },
      }}
    >
      <BAIFlex
        direction="column"
        gap="md"
        style={{ height: 'calc(100vh - 180px)' }}
      >
        <Suspense fallback={skeletonWithPadding}>
          {loadError ? (
            <BAIAlert
              type="error"
              showIcon
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
      </BAIFlex>
    </BAIModal>
  );
};

export default VFolderTextFileEditorModal;
