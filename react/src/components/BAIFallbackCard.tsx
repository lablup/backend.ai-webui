import BAICard, { BAICardProps } from './BAICard';
import { Skeleton } from 'antd';
import { ReactNode } from 'react';

interface BAIFallbackCardProps extends BAICardProps {
  title: ReactNode;
}

const BAIFallbackCard: React.FC<BAIFallbackCardProps> = ({
  title,
  ...baiCardProps
}) => {
  return (
    <BAICard {...baiCardProps} title={title}>
      <Skeleton active />
    </BAICard>
  );
};

export default BAIFallbackCard;
