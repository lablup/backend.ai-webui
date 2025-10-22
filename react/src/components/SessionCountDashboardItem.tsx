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
import { SessionCountDashboardItemFragment$key } from 'src/__generated__/SessionCountDashboardItemFragment.graphql';

interface SessionCountDashboardItemProps {
  queryRef: SessionCountDashboardItemFragment$key;
  isRefetching?: boolean;
  title?: string;
}

const SessionCountDashboardItem: React.FC<SessionCountDashboardItemProps> = ({
  queryRef,
  isRefetching,
  title,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [data, refetch] = useRefetchableFragment(
    graphql`
        fragment  SessionCountDashboardItemFragment on Query
        @argumentDefinitions(
          scopeId: { type: "ScopeField" }
        ) 
        @refetchable(queryName: "SessionCountDashboardItemRefetchQuery") {
          myInteractive: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
            scope_id: $scopeId
          ) {
            count
          }
          myBatch: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
            scope_id: $scopeId
          ) {
            count
          }
          myInference: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
            scope_id: $scopeId
          ) {
            count
          }
          myUpload: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\""
            scope_id: $scopeId
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
        title={title}
        extra={
          <BAIFetchKeyButton
            loading={isPendingRefetch || isRefetching}
            value=""
            onChange={() => {
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

export default SessionCountDashboardItem;
