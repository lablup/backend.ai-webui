import { SyncOutlined } from '@ant-design/icons';
import { Package, Container, Brain } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pulling':
      return 'processing';
    case 'verifying':
      return 'warning';
    case 'available':
      return 'default';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pulling':
    case 'verifying':
      return <SyncOutlined spin />;
    default:
      return null;
  }
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'model':
      return 'blue';
    case 'package':
      return 'green';
    case 'image':
      return 'orange';
    default:
      return 'default';
  }
};

export const getTypeIcon = (type: string, size: number = 16) => {
  const colorMap = {
    model: '#1677ff',
    package: '#52c41a',
    image: '#fa8c16',
  };

  switch (type.toLowerCase()) {
    case 'model':
      return <Brain size={size} color={colorMap.model} />;
    case 'package':
      return <Package size={size} color={colorMap.package} />;
    case 'image':
      return <Container size={size} color={colorMap.image} />;
    default:
      return null;
  }
};
