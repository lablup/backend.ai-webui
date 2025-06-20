import { MySessionCardQueryFragment$key } from '../__generated__/MySessionCardQueryFragment.graphql';
import BAICard, { BAICardProps } from './BAICard';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BAIPanelItem from './BAIPanelItem';
import Flex from './Flex';
import { Col, Divider, Row, theme } from 'antd';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface MySessionCardProps extends BAICardProps {
  queryRef: MySessionCardQueryFragment$key;
  isRefetching?: boolean;
}

const MySessionCard: React.FC<MySessionCardProps> = ({
  queryRef,
  isRefetching,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [data, refetch] = useRefetchableFragment(
    graphql`
        fragment  MySessionCardQueryFragment on Queries
        @argumentDefinitions(
          projectId: { type: "UUID!" }
        ) 
        @refetchable(queryName: "MySessionCardQueryFragmentRefetchQuery") {
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
  return (
    <BAICard
      {...props}
      title={t('session.MySessions')}
      extra={
        <Flex
          direction="row"
          gap="sm"
          style={{
            marginRight: -8,
          }}
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
            }}
          />
        </Flex>
      }
    >
      <Row gutter={[24, 16]}>
        <Col
          span={5}
          style={{
            justifyItems: 'center',
            overflow: 'break-word',
            whiteSpace: 'nowrap',
            wordBreak: 'keep-all',
          }}
        >
          <BAIPanelItem
            title={t('session.Interactive')}
            value={myInteractive?.count || 0}
          />
        </Col>
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
        <Col
          span={5}
          style={{
            justifyItems: 'center',
            overflow: 'break-word',
            whiteSpace: 'nowrap',
          }}
        >
          <BAIPanelItem
            title={t('session.Batch')}
            value={myBatch?.count || 0}
          />
        </Col>
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
        <Col
          span={5}
          style={{
            justifyItems: 'center',
            overflow: 'break-word',
            whiteSpace: 'nowrap',
          }}
        >
          <BAIPanelItem
            title={t('session.Inference')}
            value={myInference?.count || 0}
          />
        </Col>
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
        <Col
          span={6}
          style={{
            justifyItems: 'center',
            overflow: 'break-word',
          }}
        >
          <BAIPanelItem
            title={t('session.System')}
            value={myUpload?.count || 0}
          />
        </Col>
      </Row>
    </BAICard>
  );
};

export default MySessionCard;
