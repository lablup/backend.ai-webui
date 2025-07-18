import { MySessionQueryFragment$key } from '../__generated__/MySessionQueryFragment.graphql';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BAIPanelItem from './BAIPanelItem';
import Flex from './Flex';
import { Col, Divider, Grid, Row, theme, Typography } from 'antd';
import { createStyles } from 'antd-style/lib/functions';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

const useStyles = createStyles(({ css }) => ({
  webkitTextAlign: css`
    text-align: -webkit-center; /* Safari */
  `,
}));

interface MySessionProps {
  queryRef: MySessionQueryFragment$key;
  isRefetching?: boolean;
}

const MySession: React.FC<MySessionProps> = ({ queryRef, isRefetching }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { md, sm } = Grid.useBreakpoint();
  const { styles } = useStyles();
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

  const renderDivider = () => (
    <Col
      span={1}
      style={{
        justifyItems: 'center',
        textAlign: 'center',
        paddingTop: token.paddingSM,
        paddingBottom: token.paddingSM,
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      <Divider
        type="vertical"
        style={{
          height: '100%',
        }}
      />
    </Col>
  );

  const renderBAIPanelItem = (title: string, value: number) => (
    <Col
      // Divider has span={1}. So we need to consider it.
      md={5}
      sm={11}
      xs={20}
      style={{
        justifyItems: 'center',
        overflow: 'break-word',
      }}
    >
      <BAIPanelItem title={title} value={value} />
    </Col>
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
        <Row
          gutter={[24, 16]}
          style={{
            marginTop: md ? token.marginLG : token.margin,
          }}
          justify={'center'}
          className={styles.webkitTextAlign}
        >
          {renderBAIPanelItem(
            t('session.Interactive'),
            myInteractive?.count || 0,
          )}
          {sm && renderDivider()}
          {renderBAIPanelItem(t('session.Batch'), myBatch?.count || 0)}
          {md && renderDivider()}
          {renderBAIPanelItem(t('session.Inference'), myInference?.count || 0)}
          {sm && renderDivider()}
          {renderBAIPanelItem(t('session.System'), myUpload?.count || 0)}
        </Row>
      </Flex>
    </Flex>
  );
};

export default MySession;
