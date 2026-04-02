import { theme, Tooltip, Typography } from 'antd';
import { CircleXIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface BAISelectionLabelProps {
  count: number;
  onClearSelection?: () => void;
}

const BAISelectionLabel: React.FC<BAISelectionLabelProps> = ({
  count,
  onClearSelection,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  if (count <= 0) return null;

  return (
    <>
      <Typography.Text>{t('general.NSelected', { count })}</Typography.Text>
      {onClearSelection && (
        <Tooltip title={t('general.DeselectAll')}>
          <CircleXIcon
            size={16}
            style={{
              cursor: 'pointer',
              color: token.colorTextSecondary,
              flexShrink: 0,
            }}
            onClick={onClearSelection}
          />
        </Tooltip>
      )}
    </>
  );
};

export default BAISelectionLabel;
