import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { RcFile } from 'antd/es/upload';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as tus from 'tus-js-client';

export interface UploadRequest {
  id: string;
  files: RcFile[];
  vfolderId: string;
  currentPath: string;
  onSuccess?: () => void;
  onError?: (err?: Error) => void;
}

const uploadRequestsAtom = atom<UploadRequest[]>([]);

const FileUploadManager: React.FC = () => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const uploadRequests = useAtomValue(uploadRequestsAtom);
  const setUploadRequests = useSetAtom(uploadRequestsAtom);

  const { upsertNotification } = useSetBAINotification();

  const activeUploads = useRef<Map<string, tus.Upload>>(new Map());

  const cancelUpload = (uploadId: string) => {
    const upload = activeUploads.current.get(uploadId);
    if (upload) {
      upload.abort().then(() => {
        activeUploads.current.delete(uploadId);
      });
    }
    upsertNotification({
      key: 'file-upload.' + uploadId,
      message: t('data.explorer.StopUploading'),
      backgroundTask: {
        status: 'rejected',
        percent: 0,
        onChange: {
          rejected: t('explorer.FileUploadCancelled'),
        },
      },
      onCancel: null,
      extraDescription: null,
      duration: 3,
    });
  };

  useEffect(() => {
    if (uploadRequests.length === 0) return;

    const uploadFileSizes = _.map(uploadRequests, (request) => {
      const { files } = request;
      return files.reduce((total, file) => total + file.size, 0);
    });

    if (
      baiClient._config.maxFileUploadSize > 0 &&
      _.some(
        uploadFileSizes,
        (size) => size > baiClient._config.maxFileUploadSize,
      )
    ) {
      upsertNotification({
        open: true,
        message: t('data.explorer.FileUploadSizeLimit'),
        onCancel: null,
        extraDescription: null,
        duration: 3,
      });
      return;
    }

    const processUploadRequests = async () => {
      if (!baiClient) return;

      _.map(uploadRequests, async (request) => {
        const { files, vfolderId, currentPath, onSuccess, onError } = request;

        const uploadPromises = files.map(async (file) => {
          const uploadId = nanoid();
          const fullPath = [currentPath, file.webkitRelativePath || file.name]
            .filter(Boolean)
            .join('/');

          try {
            const url = await baiClient?.vfolder?.create_upload_session(
              fullPath,
              file,
              vfolderId,
            );

            upsertNotification({
              key: 'file-upload.' + uploadId,
              open: true,
              backgroundTask: {
                status: 'pending',
                percent: 0,
                onChange: {
                  pending: t('explorer.ProcessingUpload'),
                  resolved: t('explorer.UploadCompletedDesc'),
                  rejected: t('explorer.UploadFailedDesc'),
                },
              },
            });

            const upload = new tus.Upload(file, {
              endpoint: url,
              uploadUrl: url,
              retryDelays: [0, 3000, 5000, 10000, 20000],
              chunkSize: getOptimalChunkSize(file.size),
              storeFingerprintForResuming: false, // Disable localStorage storage
              metadata: {
                filename: fullPath,
                filetype: file.type,
              },
              onError: (err) => {
                activeUploads.current.delete(uploadId);
                upsertNotification({
                  key: 'file-upload.' + uploadId,
                  backgroundTask: {
                    status: 'rejected',
                    percent: 0,
                  },
                  message: t('explorer.UploadFailed', {
                    fileName: file.name,
                  }),
                  onCancel: null,
                  extraDescription: err.message || null,
                  duration: 0,
                });
                onError?.(err);
              },
              onProgress: (bytesUploaded, bytesTotal) => {
                upsertNotification({
                  key: 'file-upload.' + uploadId,
                  backgroundTask: {
                    status: 'pending',
                    percent: Math.round((bytesUploaded / bytesTotal) * 100),
                  },
                  message: t('explorer.UploadingFile', {
                    fileName: file.name,
                  }),
                  onCancel: () => {
                    cancelUpload(uploadId);
                  },
                  duration: 0,
                });
              },
              onSuccess: () => {
                activeUploads.current.delete(uploadId);
                upsertNotification({
                  key: 'file-upload.' + uploadId,
                  message: t('explorer.UploadCompleted', {
                    fileName: file.name,
                  }),
                  backgroundTask: {
                    status: 'resolved',
                    percent: 100,
                  },
                  onCancel: null,
                  extraDescription: null,
                  duration: 5,
                });
                onSuccess?.();
              },
            });

            activeUploads.current.set(uploadId, upload);
            upload.start();
            return upload;
          } catch (err: any) {
            onError?.(err);
            return Promise.reject(err);
          }
        });
        await Promise.allSettled(uploadPromises);
      });
      setUploadRequests([]);
    };

    processUploadRequests();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    baiClient,
    uploadRequests,
    setUploadRequests,
    upsertNotification,
    cancelUpload,
  ]);

  return null;
};

export default FileUploadManager;

export const useFileUploadManager = () => {
  const setUploadRequests = useSetAtom(uploadRequestsAtom);

  const uploadFiles = useCallback(
    (
      files: RcFile[],
      vfolderId: string,
      currentPath: string,
      onSuccess?: () => void,
      onError?: (error: any) => void,
    ) => {
      const request: UploadRequest = {
        id: nanoid(),
        files,
        vfolderId,
        currentPath,
        onSuccess,
        onError,
      };

      setUploadRequests((prev) => [...prev, request]);
    },
    [setUploadRequests],
  );

  return {
    uploadFiles,
  };
};

const getOptimalChunkSize = (fileSize: number): number => {
  const MB = 1024 * 1024;

  if (fileSize >= 5 * 1024 * MB) {
    return 200 * MB;
  } else if (fileSize >= 1 * 1024 * MB) {
    return 100 * MB;
  } else if (fileSize >= 100 * MB) {
    return 50 * MB;
  } else {
    return 15 * MB;
  }
};
