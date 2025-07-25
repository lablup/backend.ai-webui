// import { useSearchVFolderFiles } from './hooks';
// import { Breadcrumb, BreadcrumbProps } from 'antd';
// import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
// import _ from 'lodash';
// import { useContext, useEffect, useMemo, useState } from 'react';
import { BreadcrumbProps } from 'antd';
import { useEffect } from 'react';

interface FileExplorerBreadcrumbProps
  extends Omit<BreadcrumbProps, 'routes' | 'items'> {}

const FileExplorerBreadcrumb: React.FC<FileExplorerBreadcrumbProps> = ({
  ...props
}) => {
  // const targetFolder = useContext(FileExplorerContext);
  // const [breadcrumbItems, setBreadcrumbItems] = useState<
  //   Array<BreadcrumbItemType>
  // >([]);

  // const { files, currentPath, navigateDown, navigateUp, navigateToPath } =
  //   useSearchVFolderFiles(targetFolder || '');

  useEffect(() => {}, []);

  return (
    // <Breadcrumb items={breadcrumbItems} {...props}>
    //   123
    // </Breadcrumb>
    <div>breadcrumb</div>
  );
};

export default FileExplorerBreadcrumb;
