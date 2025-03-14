import { useUpdatableState } from '../hooks';
import BAICard, { BAICardProps } from './BAICard';
import BAIFetchKeyButton from './BAIFetchKeyButton';
import BAIPanelItem from './BAIPanelItem';
import { MySessionCardQuery } from './__generated__/MySessionCardQuery.graphql';
import { Col, Divider, Row, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface MySessionCardProps extends BAICardProps {}

const MySessionCard: React.FC<MySessionCardProps> = ({ ...props }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { interactive, batch, inference, upload } =
    useLazyLoadQuery<MySessionCardQuery>(
      graphql`
        query MySessionCardQuery {
          interactive: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
          ) {
            count
          }
          batch: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
          ) {
            count
          }
          inference: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
          ) {
            count
          }
          upload: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\""
          ) {
            count
          }
        }
      `,
      {},
      {
        fetchPolicy:
          deferredFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey:
          deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
      },
    );

  return (
    <BAICard
      {...props}
      title={t('session.MySessions')}
      extra={
        <BAIFetchKeyButton
          loading={deferredFetchKey !== fetchKey}
          autoUpdateDelay={15_000}
          value={fetchKey}
          onChange={(newFetchKey) => {
            updateFetchKey(newFetchKey);
          }}
          buttonProps={{
            type: 'text',
          }}
        />
      }
    >
      <Row gutter={[24, 16]}>
        <Col
          span={5}
          style={{
            justifyItems: 'center',
            overflow: 'break-word',
            whiteSpace: 'nowrap',
          }}
        >
          <BAIPanelItem
            title={t('session.Interactive')}
            value={interactive?.count || 0}
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
          <BAIPanelItem title={t('session.Batch')} value={batch?.count || 0} />
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
            value={inference?.count || 0}
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
            value={upload?.count || 0}
          />
        </Col>
      </Row>
    </BAICard>
  );
};

export default MySessionCard;
