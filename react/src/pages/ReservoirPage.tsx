import { theme } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReservoirArtifactsList from 'src/components/ReservoirArtifactsList';

const ReservoirPage = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'artifacts';

  // TODO: implement when reservoir supports other types
  // const typeFilterGenerator = (type: 'IMAGE' | 'PACKAGE' | 'MODEL') => {
  //   return { type: { eq: type } };
  // };
  // const handleStatisticCardClick = (type: 'IMAGE' | 'PACKAGE' | 'MODEL') => {
  //   setQuery({ filter: typeFilterGenerator(type) }, 'replaceIn');
  // };

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <BAICard
        activeTabKey={currentTab}
        tabList={[
          {
            key: 'artifacts',
            tab: t('reservoirPage.ReservoirArtifacts'),
          },
          {
            key: 'remoteArtifacts',
            tab: 'Remote Artifacts',
          },
        ]}
        styles={{
          body: {
            padding: `${token.paddingSM}px ${token.paddingLG}px ${token.paddingLG}px ${token.paddingLG}px`,
          },
        }}
        onTabChange={(key) =>
          navigate({
            pathname: '/reservoir',
            search: new URLSearchParams({ tab: key }).toString(),
          })
        }
      >
        {currentTab === 'artifacts' && <ReservoirArtifactsList />}
        {/* TODO: implement audit log for reservoir page */}
        {/* {curTabKey === 'audit' ? (
          <Suspense fallback={<Skeleton active />}>
            <ReservoirAuditLogList
              auditLogs={filteredAuditLogs}
              loading={false}
              filterValue={queryParams.auditFilter}
              onFilterChange={(value) => {
                setQuery({ auditFilter: value }, 'replaceIn');
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: filteredAuditLogs.length,
                showTotal: (total) => (
                  <Typography.Text type="secondary">
                    {t('general.TotalItems', { total: total })}
                  </Typography.Text>
                ),
                onChange: (current, pageSize) => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({ current, pageSize });
                  }
                },
              }}
              order={queryParams.auditOrder}
              onChangeOrder={(order) => {
                setQuery({ auditOrder: order }, 'replaceIn');
              }}
            />
          </Suspense>
        ) : null} */}
      </BAICard>
    </BAIFlex>
  );
};

export default ReservoirPage;
