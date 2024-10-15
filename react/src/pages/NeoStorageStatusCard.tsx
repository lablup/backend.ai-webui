import BAICard from '../BAICard';
import BAILayoutCard from '../components/BAILayoutCard';
import Flex from '../components/Flex';
import { Col, Divider, Row, Typography, theme } from 'antd';
import { CardProps } from 'antd/lib';

interface CardItemProps {
  title: string;
  currentValue: string | number;
  totalValue?: string | number;
}
const CardItem: React.FC<CardItemProps> = ({
  title,
  currentValue,
  totalValue,
}) => {
  const { token } = theme.useToken();

  return (
    <Flex direction="column" gap={token.marginMD}>
      <Typography.Text
        strong
        style={{
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
          textAlign: 'center',
        }}
      >
        {title}
      </Typography.Text>
      <Flex align="end">
        <Typography.Text
          strong
          style={{
            fontSize: 36,
            color: token.colorPrimary,
            lineHeight: 1,
          }}
        >
          {currentValue}
        </Typography.Text>
        {totalValue && <Typography.Text>/ {totalValue}</Typography.Text>}
      </Flex>
    </Flex>
  );
};

interface NeoStorageStatusCardProps extends CardProps {}

const NeoStorageStatusCard: React.FC<NeoStorageStatusCardProps> = ({
  ...cardProps
}) => {
  const { token } = theme.useToken();
  return (
    <BAILayoutCard
      style={{ height: 192, maxWidth: 375 }}
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          {'Storage Status'}
        </Typography.Title>
      }
      {...cardProps}
    >
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <CardItem
            title="Number of Folders"
            currentValue={1}
            totalValue={10}
          />
        </Col>
        <Col span={8}>
          <CardItem title="Project Folders" currentValue={4} />
        </Col>
        <Col span={8}>
          <CardItem title="Invited Folders" currentValue={0} />
        </Col>
      </Row>
    </BAILayoutCard>
  );
};

export default NeoStorageStatusCard;
