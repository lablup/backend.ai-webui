import type { BAIClient } from './types';
import * as React from 'react';

const BAIClientContext = React.createContext<BAIClient | undefined>(undefined);

export default BAIClientContext;
