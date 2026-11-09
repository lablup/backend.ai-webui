import { BAIVFolderDeleteButtonV2Fragment$key } from '../__generated__/BAIVFolderDeleteButtonV2Fragment.graphql';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIVFolderDeleteButtonV2Props {
    vfolderFrgmt: BAIVFolderDeleteButtonV2Fragment$key;
    /** Accessible name — required by Astryx, absent in the antd original (P8). */
    label: string;
    tooltip?: string;
    isDisabled?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
}
declare const BAIVFolderDeleteButtonV2: React.FC<BAIVFolderDeleteButtonV2Props>;
export default BAIVFolderDeleteButtonV2;
