import { BAIBoardItemTitleProps } from './BAIBoardItemTitle';
import { default as React, PropsWithChildren } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
interface BAIBoardItemErrorBoundaryProps extends PropsWithChildren {
    title?: BAIBoardItemTitleProps['title'];
    status?: 'warning' | 'error';
    style?: React.CSSProperties;
}
declare const BAIBoardItemErrorBoundary: React.FC<BAIBoardItemErrorBoundaryProps>;
export default BAIBoardItemErrorBoundary;
