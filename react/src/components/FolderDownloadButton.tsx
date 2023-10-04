// import { baiFetch } from "../../hooks/auth";
import { DownloadOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import { useState } from 'react';

interface Props extends ButtonProps {
  folderName: string;
  path: string;
  archive?: boolean;
}

//http://127.0.0.1:8090/func/folders/first-pipe-xY15sS/request-download
// {
//   "file": "./tasks/tt1",
//   "archive": true
// }

// {file: "./tasks/tt1/x.txt", archive: false}
// archive
// :
// false
// file
// :
// "./tasks/tt1/x.txt"

const FolderDownloadButton: React.FC<Props> = ({
  folderName,
  path,
  archive = false,
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      loading={loading}
      icon={<DownloadOutlined />}
      onClick={(e) => {
        e.preventDefault();
        setLoading(true);
        // baiFetch(`/func/folders/${folderName}/request-download`, {
        //   method: "POST",
        //   body: JSON.stringify({
        //     file: path,
        //     archive,
        //   }),
        // })
        //   .then((res) => res.json())
        //   .then((data) => {
        //     const downloadLink = data
        //       ? `${data.url}?token=${data.token}&archive=${archive}`
        //       : null;

        //     if (downloadLink) {
        //       const element = document.createElement("a");
        //       element.href = downloadLink;
        //       document.body.appendChild(element);
        //       element.click();
        //       document.body.removeChild(element);
        //       URL.revokeObjectURL(downloadLink);
        //     }
        //   })
        //   .finally(() => {
        //     setLoading(false);
        //   });
      }}
    />
  );
};

export default FolderDownloadButton;
