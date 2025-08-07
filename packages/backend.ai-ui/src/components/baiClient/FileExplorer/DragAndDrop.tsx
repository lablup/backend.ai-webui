import { useUploadVFolderFiles } from './hooks';
import { InboxOutlined } from '@ant-design/icons';
import { theme, Typography, Upload } from 'antd';
import { createStyles } from 'antd-style';
import { RcFile } from 'antd/es/upload';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  dragger: css`
    height: 100% !important;
  `,
}));

interface DragAndDropProps {
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({ onUpload }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const { upload } = useUploadVFolderFiles();
  const uploadProcessingRef = useRef<string | null>(null);

  const handleUpload = async (fileList: Array<RcFile>) => {
    // When uploading folder, ant design trigger `beforeUpload` for each file in the folder.
    // We need to ensure that the upload is processed only once for the entire batch.
    const batchId = fileList.map((f) => f.name + f.size).join('|');
    if (uploadProcessingRef.current === batchId) {
      return;
    }
    uploadProcessingRef.current = batchId;

    upload(fileList, onUpload, () => {
      uploadProcessingRef.current = null;
    });
  };

  return (
    <Upload.Dragger
      className={styles.dragger}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: token.zIndexPopupBase + 1,
        backdropFilter: 'blur(4px)',
      }}
      multiple
      directory
      showUploadList={false}
      beforeUpload={(_, fileList) => {
        handleUpload(fileList);
        return false; // Prevent default upload behavior
      }}
    >
      <p>
        <InboxOutlined style={{ fontSize: token.fontSizeHeading1 }} />
      </p>
      <Typography.Text style={{ fontSize: token.fontSizeHeading4 }}>
        {t('comp:FileExplorer.DragAndDropDesc')}
      </Typography.Text>
    </Upload.Dragger>
  );
};

export default DragAndDrop;
