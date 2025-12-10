// import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
// import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import { BAIFlex, BAILink } from 'backend.ai-ui';
import _ from 'lodash';
import React, { startTransition, useEffect } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import {
  // VFolderSelectFragment$data,
  VFolderSelectFragment$key,
} from 'src/__generated__/VFolderSelectFragment.graphql';

export type VFolder = {
  name: string;
  id: string;
  quota_scope_id: string;
  host: string;
  status: string;
  usage_mode: string;
  created_at: string;
  is_owner: boolean;
  permission: string;
  user: null;
  group: string | null;
  creator: string;
  user_email: null;
  group_name: string | null;
  ownership_type: string;
  type: string;
  cloneable: boolean;
  max_files: number;
  max_size: null | number;
  cur_size: number;
};

// type VFolderNode = NonNullable<
//   NonNullable<VFolderSelectFragment$data['vfolder_nodes']>['edges'][number]
// >['node'];

interface VFolderSelectProps extends SelectProps {
  autoSelectDefault?: boolean;
  allowFolderExplorer?: boolean;
  valuePropName?: 'id' | 'name';
  filter?: (vFolder: VFolder) => boolean;
  queryRef?: VFolderSelectFragment$key;
}

const VFolderSelect: React.FC<VFolderSelectProps> = ({
  autoSelectDefault,
  allowFolderExplorer,
  valuePropName = 'name',
  // filter,
  queryRef,
  ...selectProps
}) => {
  // const currentProject = useCurrentProjectValue();
  // const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const { generateFolderPath } = useFolderExplorerOpener();
  const [value, setValue] = useControllableValue(selectProps);
  const [_key, checkUpdate] = useUpdatableState('first');

  const {
    data,
    // loadNext,
    // loadPrevious,
    // hasNext,
    // hasPrevious,
    // isLoadingNext,
    // isLoadingPrevious,
    // refetch,
  } = usePaginationFragment(
    graphql`
      fragment VFolderSelectFragment on Query
      @argumentDefinitions(
        first: { type: "Int", defaultValue: 10 }
        after: { type: "String" }
      )
      @refetchable(queryName: "VFolderSelectRefetchQuery") {
        vfolder_nodes(
          first: $first
          after: $after
          permission: "read_attribute"
        ) @connection(key: "VFolderSelect_vfolder_nodes") {
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
          edges {
            cursor
            node {
              id
              row_id
              name
              user
              status
            }
          }
          count
        }
      }
    `,
    queryRef,
  );

  const vfolderEdges = _.map(data?.vfolder_nodes?.edges, (edge) => edge?.node);

  const autoSelectedOption = _.first(vfolderEdges)
    ? {
        label: _.first(vfolderEdges)?.name,
        value: _.first(vfolderEdges)?.[valuePropName],
      }
    : undefined;
  // TODO: use controllable value
  useEffect(() => {
    if (autoSelectDefault && autoSelectedOption) {
      setValue(autoSelectedOption.value, autoSelectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault]);

  return (
    <BAIFlex gap="xs">
      <Select
        showSearch
        optionFilterProp={'label'}
        {...selectProps}
        value={value}
        labelRender={({ label, value }) =>
          allowFolderExplorer ? (
            <BAILink
              type="hover"
              to={generateFolderPath(_.toString(value))}
              onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                e.stopPropagation();
              }}
              onMouseDown={(e: React.MouseEvent<HTMLSpanElement>) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {label}
            </BAILink>
          ) : (
            label
          )
        }
        onChange={setValue}
        onOpenChange={(open) => {
          if (open) {
            startTransition(() => {
              checkUpdate();
            });
          }
        }}
        options={_.map(vfolderEdges, (vfolder) => {
          return {
            label: vfolder?.name,
            value: vfolder?.[valuePropName],
          };
        })}
      />
    </BAIFlex>
  );
};

export default VFolderSelect;
