import Flex from './Flex';
import { Card, CardProps, ConfigProvider, theme, Typography } from 'antd';

export interface BAILayoutCardProps extends CardProps {}

const BAILayoutCard: React.FC<BAILayoutCardProps> = ({ ...cardProps }) => {
  const { token } = theme.useToken();

  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            lineWidth: 0,
            extraColor: '#00BD9B',
          },
        },
      }}
    >
      <Card {...cardProps}></Card>
    </ConfigProvider>
  );
};

export default BAILayoutCard;
