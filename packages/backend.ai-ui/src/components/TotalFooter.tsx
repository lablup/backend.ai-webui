import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import { LoadingOutlined } from '@ant-design/icons';
import { theme, Typography } from 'antd';

const TotalFooter: React.FC<{
  loading?: boolean;
  total?: number;
}> = ({ loading, total }) => {
  const { token } = theme.useToken();
  const { t } = useBAIi18n();
  return (
    <BAIFlex justify="end" gap={'xs'}>
      {loading ? (
        <LoadingOutlined
          spin
          style={{
            color: token.colorTextSecondary,
          }}
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
