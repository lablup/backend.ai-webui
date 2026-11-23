import { BAIVFolderDeleteButtonFragment$key } from '../__generated__/BAIVFolderDeleteButtonFragment.graphql';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIVFolderDeleteButtonProps {
    vfolderFrgmt: BAIVFolderDeleteButtonFragment$key;
    /** Accessible name — required by Astryx, absent in the antd original (P8). */
    label: string;
    tooltip?: string;
    isDisabled?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
}
declare const BAIVFolderDeleteButton: React.FC<BAIVFolderDeleteButtonProps>;
export default BAIVFolderDeleteButton;
