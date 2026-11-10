import { BAIColumnType, BAITableProps } from '..';
import { BAIAdminUserV2TableFragment$data, BAIAdminUserV2TableFragment$key } from '../__generated__/BAIAdminUserV2TableFragment.graphql';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type UserV2InList = NonNullable<BAIAdminUserV2TableFragment$data[number]>;
export declare const availableUserV2SorterValues: readonly ["email", "username", "status", "domainName", "projectName", "createdAt", "modifiedAt", ...("-status" | "-email" | "-username" | "-domainName" | "-projectName" | "-createdAt" | "-modifiedAt")[]];
interface BAIAdminUserV2TableProps extends Omit<BAITableProps<UserV2InList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    usersFrgmt: BAIAdminUserV2TableFragment$key;
    customizeColumns?: (baseColumns: BAIColumnType<UserV2InList>[]) => BAIColumnType<UserV2InList>[];
    disableSorter?: boolean;
    /**
     * Mirrors the fragment's `withProjects` argument. Both must be set together:
     * the argument decides whether the memberships are fetched, this decides
     * whether the column exists, and a project-scoped surface leaves both off.
     */
    withProjects?: boolean;
    onChangeOrder?: (order: (typeof availableUserV2SorterValues)[number] | null) => void;
}
declare const BAIAdminUserV2Table: React.FC<BAIAdminUserV2TableProps>;
export default BAIAdminUserV2Table;
