/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIText } from 'backend.ai-ui';
import React, { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  text?: string;
}

// PILOT-DECISION: antd `Typography.Text copyable code` -> BUI `BAIText`, which
// is the repo's Astryx-native home for both affordances (`code` -> Astryx
// `Code`, `copyable` -> the self-built IconButton + clipboard control, phase-3
// ticket A). Astryx `Text` alone has neither, so composing them here would be a
// second copy of BAIText's copy control (MAPPING §3.4 `copyable` row).
const CopyableCodeText: React.FC<Props> = ({ text, children }) => {
  return (
    <BAIText copyable code>
      {text || children}
    </BAIText>
  );
};

export default CopyableCodeText;
