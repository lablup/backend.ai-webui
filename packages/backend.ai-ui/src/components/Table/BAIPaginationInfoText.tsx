import { useBAIi18n } from '../../hooks/useBAIi18n';

export interface PaginationInfoTextProps {
  start: number;
  end: number;
  total: number;
}

const BAIPaginationInfoText = ({
  start,
  end,
  total,
}: PaginationInfoTextProps) => {
  const { t } = useBAIi18n();

  return t('comp:PaginationInfoText.Total', {
    start,
    end,
    total,
  });
};

export default BAIPaginationInfoText;
