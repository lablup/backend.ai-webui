/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTranslation } from 'react-i18next';

export interface PaginationInfoTextProps {
  start: number;
  end: number;
  total: number;
}

const PaginationInfoText = ({ start, end, total }: PaginationInfoTextProps) => {
  const { t } = useTranslation();

  return t('pagination.Total', {
    start,
    end,
    total,
  });
};

export default PaginationInfoText;
