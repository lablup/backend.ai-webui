import { useNetwork } from 'ahooks';
import { Alert } from 'antd';
import { createStyles } from 'antd-style';
import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const networkSoftTimeoutAtom = atom(false);

const useStyles = createStyles(({ token, css }) => ({
  borderError: css`
    border-bottom: 1px solid ${token.colorErrorBorder} !important;
  `,
  borderWarning: css`
    border-bottom: 1px solid ${token.colorWarningBorder} !important;
  `,
}));
const NetworkStatusBanner = () => {
  const { t } = useTranslation();
  const network = useNetwork();

  const { styles } = useStyles();

  const [softTimeout, setSoftTimeout] = useAtom(networkSoftTimeoutAtom);

  // const handler = (()=>{
  // });

  // useEffect(()=>{
  //   document.addEventListener('backendai.client.softtimeout', handler);
  //   return ()=>{
  //     document.removeEventListener('backendai.client.softtimeout', handler);
  //   }
  // },[])

  return !network.online ? (
    <Alert
      message={t('webui.YouAreOffline')}
      className={styles.borderError}
      type="error"
      banner
    />
  ) : softTimeout ? (
    <Alert
      message={t('webui.NetworkSoftTimeout')}
      className={styles.borderWarning}
      banner
      closable
      onClose={() => {
        setSoftTimeout(false);
      }}
    />
  ) : null;
};

export default NetworkStatusBanner;
