import { BoardItemTitleProps } from '@lablup/ui-common/components/BoardItemTitle';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIBoardItemTitleProps extends Omit<BoardItemTitleProps, 'endContent'> {
    extra?: React.ReactNode;
}
declare const BAIBoardItemTitle: React.FC<BAIBoardItemTitleProps>;
export default BAIBoardItemTitle;
