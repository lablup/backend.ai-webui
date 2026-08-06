import Probe from './Probe';
import React from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Probe />
  </React.StrictMode>,
);
