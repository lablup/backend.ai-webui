import { MySessionQueryFragment$key } from '../__generated__/MySessionQueryFragment.graphql';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BAIPanelItem from './BAIPanelItem';
import Flex from './Flex';
import { theme, Typography } from 'antd';
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
        fragment  MySessionQueryFragment on Queries
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
    <Flex
      style={{
        borderRadius: token.borderRadiusLG,
        justifyContent: 'center',
        overflow: 'break-word',
        padding: token.padding,
        border: `1px solid ${token.colorBgLayout}`,
        minWidth: 120,
        maxWidth: 200,
        flex: '1 1 auto',
        alignItems: 'stretch',
      }}
    >
      <BAIPanelItem title={title} value={value} />
    </Flex>
  );

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{
        paddingLeft: token.paddingXL,
        paddingRight: token.paddingXL,
        height: '100%',
      }}
    >
      {/* Fixed Title Section */}
      <Flex
        align="center"
        justify="between"
        style={{
          paddingLeft: token.paddingMD,
          paddingTop: token.paddingSM,
          paddingBottom: token.paddingSM,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          backgroundColor: token.colorBgContainer,
          zIndex: 1,
          minHeight: 56, // Match height with other Dashboard components
        }}
        gap="xs"
        wrap="wrap"
      >
        <Flex gap={'xs'} align="center">
          <Typography.Title level={5} style={{ margin: 0 }}>
            {t('session.MySessions')}
          </Typography.Title>
        </Flex>
        <Flex
          gap={'xs'}
          align="center"
          justify="end"
          style={{ marginLeft: 'auto' }}
        >
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
        </Flex>
      </Flex>

      {/* Scrollable Content Section */}
      <Flex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Flex
          direction="row"
          wrap="wrap"
          gap={token.padding}
          align="stretch"
          style={{ marginTop: token.margin, marginBottom: token.marginMD }}
        >
          {renderBAIPanelItem(
            t('session.Interactive'),
            myInteractive?.count || 0,
          )}
          {renderBAIPanelItem(t('session.Batch'), myBatch?.count || 0)}
          {renderBAIPanelItem(t('session.Inference'), myInference?.count || 0)}
          {renderBAIPanelItem(t('session.System'), myUpload?.count || 0)}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default MySession;
