import BAICard, { BAICardProps } from './BAICard';
import { Skeleton } from 'antd';

interface BAIFallbackCardProps extends BAICardProps {}

const BAIFallbackCard: React.FC<BAIFallbackCardProps> = ({
  ...baiCardProps
}) => {
  return (
    <BAICard {...baiCardProps}>
      <Skeleton active />
    </BAICard>
  );
};

export default BAIFallbackCard;
