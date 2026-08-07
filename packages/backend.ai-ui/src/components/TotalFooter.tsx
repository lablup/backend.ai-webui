import { useBAIi18n } from '../hooks/useBAIi18n';
import { theme } from '../theme-shim';
import BAIFlex from './BAIFlex';
import { Typography } from 'antd';
import { LoaderCircle } from 'lucide-react';

const TotalFooter: React.FC<{
  loading?: boolean;
  total?: number;
}> = ({ loading, total }) => {
  const { token } = theme.useToken();
  const { t } = useBAIi18n();
  return (
    <BAIFlex justify="end" gap={'xs'}>
      {loading ? (
        <LoaderCircle
          className="anticon-spin"
          style={{
            color: token.colorTextSecondary,
          }}
          size="1em"
        />
      ) : (
        <div />
      )}
      <Typography.Text type="secondary">
        {t('general.TotalItems', {
          total: total,
        })}
      </Typography.Text>
    </BAIFlex>
  );
};

export default TotalFooter;
