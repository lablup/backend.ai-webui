'use memo';

import BAICodeEditor from './BAICodeEditor';
import { LanguageName } from '@uiw/codemirror-extensions-langs';
import { Alert, Typography, Skeleton } from 'antd';
import { RcFile } from 'antd/es/upload';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  VFolderFile,
  convertToDecimalUnit,
  useConnectedBAIClient,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const getLanguageFromExtension = (fileName: string): LanguageName => {
  const extension = _.last(fileName.split('.'))?.toLowerCase() || '';
  return extension || 'sh';
};

interface TextFileEditorModalProps extends Omit<BAIModalProps, 'children'> {
  open: boolean;
  targetVFolderId: string;
  currentPath: string;
  fileInfo: VFolderFile | null;
  onRequestClose: (success: boolean) => void;
  uploadFiles: (
    files: RcFile[],
    vfolderId: string,
    currentPath: string,
  ) => Promise<void>;
}

const TextFileEditorModal: React.FC<TextFileEditorModalProps> = ({
  open,
  targetVFolderId,
  currentPath,
  fileInfo,
  onRequestClose,
  uploadFiles,
}) => {
  const { t } = useTranslation();
  const baiClient = useConnectedBAIClient();

  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !fileInfo || !targetVFolderId) return;

    const filePath =
      currentPath === '.'
        ? fileInfo.name
        : `${currentPath}/${fileInfo.name}`.replace(/^\.\//, '');

    const loadFileContent = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const tokenResponse = await baiClient.vfolder.request_download_token(
          filePath,
          targetVFolderId,
          false,
        );

        const downloadUrl = `${tokenResponse.url}?token=${tokenResponse.token}&archive=false`;
        const response = await fetch(downloadUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const text = await blob.text();
        setContent(text);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setLoadError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [open, fileInfo, targetVFolderId, currentPath, baiClient]);

  const handleSave = async () => {
    if (!fileInfo) return;

    setIsSaving(true);
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], fileInfo.name, {
        type: 'text/plain',
      }) as RcFile;

      await uploadFiles([file], targetVFolderId, currentPath);
      onRequestClose(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setLoadError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onRequestClose(false);
  };

  return (
    <BAIModal
      open={open}
      title={
        <BAIFlex align="center" gap="xs">
          <Typography.Text>{t('comp:FileExplorer.EditFile')}</Typography.Text>
          {fileInfo && (
            <Typography.Text type="secondary" style={{ fontWeight: 'normal' }}>
              - {fileInfo.name}
              {fileInfo.size > 0 &&
                ` (${convertToDecimalUnit(fileInfo.size, 'auto')?.displayValue})`}
            </Typography.Text>
          )}
        </BAIFlex>
      }
      width={800}
      destroyOnHidden
      onCancel={handleCancel}
      onOk={handleSave}
      confirmLoading={isSaving}
      okText={t('button.Save')}
      cancelText={t('button.Cancel')}
    >
      <BAIFlex direction="column" gap="md" style={{ minHeight: 400 }}>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : loadError ? (
          <Alert
            type="error"
            message={t('data.explorer.FailedToLoadFile')}
            description={loadError}
            showIcon
          />
        ) : (
          <BAICodeEditor
            value={content}
            onChange={(value) => setContent(value || '')}
            editable={true}
            language={getLanguageFromExtension(fileInfo?.name || '')}
          />
        )}
      </BAIFlex>
    </BAIModal>
  );
};

export default TextFileEditorModal;
