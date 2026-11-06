import { BAIBoardItemTitleProps } from './BAIBoardItemTitle';
import { default as React, PropsWithChildren } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
interface BAIBoardItemErrorBoundaryProps extends PropsWithChildren {
    title?: BAIBoardItemTitleProps['title'];
    status?: 'warning' | 'error';
    style?: React.CSSProperties;
    /** A change in any of these clears a caught error and renders the children again. */
    resetKeys?: Array<unknown>;
}
declare const BAIBoardItemErrorBoundary: React.FC<BAIBoardItemErrorBoundaryProps>;
export default BAIBoardItemErrorBoundary;
