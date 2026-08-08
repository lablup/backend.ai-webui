/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 App-side twin of BUI's `TotalFooter` (the select-dropdown footer). Converted
 with it in to-astryx phase 3 ticket A: antd `Typography.Text type="secondary"`
 -> Astryx `Text color="secondary"`, and the spinner colour reads the token
 variable directly so the file no longer needs the theme shim.
*/
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex } from 'backend.ai-ui';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TotalFooter: React.FC<{
  loading?: boolean;
  total?: number;
}> = ({ loading, total }) => {
  const { t } = useTranslation();
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
