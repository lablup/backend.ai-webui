/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `TotalFooter` on Astryx (to-astryx phase 3, ticket A). The "Total N items"
 row under a table. antd `Typography.Text type="secondary"` -> Astryx
 `Text color="secondary"`; the spinner keeps BUI's own `.anticon-spin`
 keyframes (re-homed into `styles/backend.ai-ui.css` by ticket 33 — the class
 name is legacy, the rule is ours), so nothing here reaches antd.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import { Text } from '@astryxdesign/core/Text';
import { LoaderCircle } from 'lucide-react';

const TotalFooter: React.FC<{
  loading?: boolean;
  total?: number;
}> = ({ loading, total }) => {
  const { t } = useBAIi18n();
  return (
    <BAIFlex justify="end" gap={'xs'}>
      {loading ? (
        <LoaderCircle
          className="anticon-spin"
          style={{ color: 'var(--color-text-secondary)' }}
          size="1em"
        />
      ) : (
        <div />
      )}
      <Text color="secondary">
        {t('general.TotalItems', {
          total: total,
        })}
      </Text>
    </BAIFlex>
  );
};

export default TotalFooter;
