import { useTranslation } from 'react-i18next';

export interface PaginationInfoTextProps {
  start: number;
  end: number;
  total: number;
}

const PaginationInfoText = ({ start, end, total }: PaginationInfoTextProps) => {
  const { t } = useTranslation();

  return t('comp:PaginationInfoText.Total', {
    start,
    end,
    total,
  });
};

export default PaginationInfoText;
