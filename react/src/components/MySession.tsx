import { MySessionQueryFragment$key } from '../__generated__/MySessionQueryFragment.graphql';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BAIPanelItem from './BAIPanelItem';
import { theme } from 'antd';
import {
  BAIBoardItemTitle,
  BAIFlex,
  BAIRowWrapWithDividers,
} from 'backend.ai-ui';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface MySessionProps {
  queryRef: MySessionQueryFragment$key;
  isRefetching?: boolean;
}

const MySession: React.FC<MySessionProps> = ({ queryRef, isRefetching }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [data, refetch] = useRefetchableFragment(
    graphql`
        fragment  MySessionQueryFragment on Query
        @argumentDefinitions(
          projectId: { type: "UUID!" }
        ) 
        @refetchable(queryName: "MySessionQueryFragmentRefetchQuery") {
          myInteractive: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
            project_id: $projectId
          ) {
            count
          }
          myBatch: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
            project_id: $projectId
          ) {
            count
          }
          myInference: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
            project_id: $projectId
          ) {
            count
          }
          myUpload: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\""
            project_id: $projectId
          ) {
            count
          }
        }
      `,
    queryRef,
  );

  const { myInteractive, myBatch, myInference, myUpload } = data || {};

  const renderBAIPanelItem = (title: string, value: number) => (
    <BAIPanelItem title={title} value={value} />
  );

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingLeft: token.paddingXL,
        paddingRight: token.paddingXL,
        height: '100%',
      }}
    >
      {/* Fixed Title Section */}
      <BAIBoardItemTitle
        title={t('session.MySessions')}
        extra={
          <BAIFetchKeyButton
            loading={isPendingRefetch || isRefetching}
            value=""
            onChange={(newFetchKey) => {
              startRefetchTransition(() => {
                refetch(
                  {},
                  {
                    fetchPolicy: 'network-only',
                  },
                );
              });
            }}
            type="text"
            style={{
              backgroundColor: 'transparent',
              margin: -token.marginXS,
            }}
          />
        }
      />

      {/* Scrollable Content Section */}
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <BAIRowWrapWithDividers
          columnGap={token.marginXXL}
          rowGap={token.margin}
          dividerWidth={1}
          dividerInset={token.marginXS}
          style={{
            paddingBlock: token.padding,
          }}
        >
          {renderBAIPanelItem(
            t('session.Interactive'),
            myInteractive?.count || 0,
          )}
          {renderBAIPanelItem(t('session.Batch'), myBatch?.count || 0)}
          {renderBAIPanelItem(t('session.Inference'), myInference?.count || 0)}
          {renderBAIPanelItem(t('session.System'), myUpload?.count || 0)}
        </BAIRowWrapWithDividers>
      </BAIFlex>
    </BAIFlex>
  );
};

export default MySession;
