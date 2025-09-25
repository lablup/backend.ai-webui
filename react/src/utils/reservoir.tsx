import type { ReservoirArtifact } from '../types/reservoir';
import { SyncOutlined } from '@ant-design/icons';
import { Package, Container, Brain } from 'lucide-react';
import React from 'react';

export const getStatusColor = (status: ReservoirArtifact['status']) => {
  switch (status) {
    case 'verified':
      return 'success';
    case 'pulling':
      return 'processing';
    case 'verifying':
      return 'warning';
    case 'available':
      return 'default';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusIcon = (status: ReservoirArtifact['status']) => {
  switch (status) {
    case 'pulling':
    case 'verifying':
      return <SyncOutlined spin />;
    default:
      return null;
  }
};

export const getTypeColor = (type: ReservoirArtifact['type']) => {
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

export const getTypeIcon = (
  type: ReservoirArtifact['type'],
  size: number = 16,
) => {
  const colorMap = {
    model: '#1677ff',
    package: '#52c41a',
    image: '#fa8c16',
  };

  switch (type) {
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
