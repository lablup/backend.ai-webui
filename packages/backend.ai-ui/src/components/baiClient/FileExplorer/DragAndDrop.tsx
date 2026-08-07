import { useBAIi18n } from '../../../hooks/useBAIi18n';
import { theme } from '../../../theme-shim';
import { useUploadVFolderFiles } from './hooks';
import { Typography, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { Inbox } from 'lucide-react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';

interface DragAndDropProps {
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
  /** Optional container element for portal rendering */
  portalContainer?: HTMLElement | null;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({
  onUpload,
  portalContainer,
}) => {
  const { t } = useBAIi18n();
  const { token } = theme.useToken();
  const { uploadFiles } = useUploadVFolderFiles();
  const lastFileListRef = useRef<Array<RcFile>>([]);

  const overlay = (
    <Upload.Dragger
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: token.zIndexPopupBase + 1,
        backdropFilter: 'blur(4px)',
        borderWidth: 3,
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
        <Inbox style={{ fontSize: token.fontSizeHeading1 }} size="1em" />
      </p>
      <Typography.Text style={{ fontSize: token.fontSizeHeading4 }}>
        {t('comp:FileExplorer.DragAndDropDesc')}
      </Typography.Text>
    </Upload.Dragger>
  );

  return portalContainer ? createPortal(overlay, portalContainer) : overlay;
};

export default DragAndDrop;
