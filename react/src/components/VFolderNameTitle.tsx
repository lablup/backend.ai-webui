import { VFolderNameTitleNodeFragment$key } from '../__generated__/VFolderNameTitleNodeFragment.graphql';
import { theme, Tooltip, Typography } from 'antd';
import { graphql, useFragment } from 'react-relay';

const VFolderNameTitle: React.FC<{
  vfolderNodeFrgmt?: VFolderNameTitleNodeFragment$key | null;
}> = ({ vfolderNodeFrgmt, ...props }) => {
  const { token } = theme.useToken();

  const vfolderNode = useFragment(
    graphql`
      fragment VFolderNameTitleNodeFragment on VirtualFolderNode {
        name
      }
    `,
    vfolderNodeFrgmt,
  );

  return (
    <Tooltip title={vfolderNode?.name} {...props}>
      <Typography.Title
        level={3}
        style={{ marginTop: token.marginSM }}
        ellipsis
      >
        {vfolderNode?.name}
      </Typography.Title>
    </Tooltip>
  );
};

export default VFolderNameTitle;
