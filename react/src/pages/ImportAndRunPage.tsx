import { GithubOutlined, GitlabOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import { BAICard, BAIFlex, BAIJupyterIcon } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import ImportNotebookForm from 'src/components/ImportNotebookForm';
import ImportRepoForm from 'src/components/ImportRepoForm';

const ImportAndRunPage = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  return (
    <BAIFlex
      direction="column"
      gap={'md'}
      align="stretch"
      style={{
        maxWidth: 728,
        marginBottom: token.marginMD,
      }}
    >
      <BAICard
        title={
          <BAIFlex gap={'xs'}>
            <BAIJupyterIcon /> {t('import.ImportNotebook')}
          </BAIFlex>
        }
        showDivider
      >
        <ImportNotebookForm />
      </BAICard>
      <BAICard
        title={
          <BAIFlex gap="xs">
            <GithubOutlined style={{ display: 'inline' }} />
            {t('import.ImportGithubRepo')}
          </BAIFlex>
        }
        showDivider
      >
        <ImportRepoForm urlType="github" />
      </BAICard>
      <BAICard
        title={
          <BAIFlex gap="xs">
            <GitlabOutlined style={{ display: 'inline' }} />
            {t('import.ImportGitlabRepo')}
          </BAIFlex>
        }
        showDivider
      >
        <ImportRepoForm urlType="gitlab" />
      </BAICard>
    </BAIFlex>
  );
};

export default ImportAndRunPage;
