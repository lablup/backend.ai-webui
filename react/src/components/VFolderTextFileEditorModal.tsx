import { useTanQuery, useTanMutation } from '../hooks/reactQueryAlias';
import { useThemeMode } from '../hooks/useThemeMode';
import {
  Editor as MonacoEditor,
  type Monaco,
  type OnMount,
} from '@monaco-editor/react';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton, App } from 'antd';
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
} from 'backend.ai-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface VFolderTextFileEditorModalProps
  extends Omit<
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

  const queryClient = useQueryClient();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const detectedMimeTypeRef = useRef<string>('text/plain');
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

      await uploadFiles([file], targetVFolderId, currentPath);
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

  return (
    <BAIModal
      width={'100%'}
      destroyOnHidden
      okText={t('button.Save')}
      cancelText={t('button.Cancel')}
      {...modalProps}
      title={
        <BAIFlex align="center" gap="xs">
          <BAIText>{t('data.explorer.EditFile')}</BAIText>
          {fileInfo && (
            <BAIText type="secondary" style={{ fontWeight: 'normal' }}>
              - {fileInfo.name}
              {fileInfo.size > 0 &&
                ` (${convertToDecimalUnit(fileInfo.size, 'auto')?.displayValue})`}
            </BAIText>
          )}
        </BAIFlex>
      }
      onCancel={() => onRequestClose()}
      onOk={() => saveMutation.mutate()}
      confirmLoading={saveMutation.isPending}
      okButtonProps={{ disabled: !!loadError }}
    >
      <BAIFlex
        direction="column"
        gap="md"
        style={{ height: 'calc(100vh - 250px)' }}
      >
        {loadError ? (
          <BAIAlert
            type="error"
            showIcon
            title={t('data.explorer.FailedToLoadFile')}
            description={t('data.explorer.FailedToLoadFileDescription')}
          />
        ) : isFetching ? (
          <Skeleton active />
        ) : (
          <MonacoEditor
            defaultValue={fileContent ?? ''}
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
              }
            }}
            theme={isDarkMode ? 'vs-dark' : 'light'}
            loading={<Skeleton active />}
            width={'100%'}
            height={'100%'}
            options={{
              fixedOverflowWidgets: true,
            }}
          />
        )}
      </BAIFlex>
    </BAIModal>
  );
};

export default VFolderTextFileEditorModal;
