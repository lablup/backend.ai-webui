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
  const { uploadFiles } = useUploadVFolderFiles();
  const lastFileListRef = useRef<Array<RcFile>>([]);

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
        if (fileList !== lastFileListRef.current) {
          uploadFiles(fileList, onUpload);
        }
        lastFileListRef.current = fileList;
        return false;
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
