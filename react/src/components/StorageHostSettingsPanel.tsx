import { StorageHostSettingsPanelQuery } from '../__generated__/StorageHostSettingsPanelQuery.graphql';
import { StorageHostSettingsPanel_storageVolumeFrgmt$key } from '../__generated__/StorageHostSettingsPanel_storageVolumeFrgmt.graphql';
import { QuotaScopeType, addQuotaScopeTypePrefix } from '../helper/index';
import { useCurrentDomainValue } from '../hooks';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
import QuotaScopeCard from './QuotaScopeCard';
import QuotaSettingModal from './QuotaSettingModal';
import UserSelector from './UserSelector';
import { useToggle } from 'ahooks';
import { Card, Form, Spin } from 'antd';
import { BAIDomainSelector, BAIFlex, useUpdatableState } from 'backend.ai-ui';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface StorageHostSettingsPanelProps {
  extraFetchKey?: string;
  storageVolumeFrgmt: StorageHostSettingsPanel_storageVolumeFrgmt$key | null;
}
const StorageHostSettingsPanel: React.FC<StorageHostSettingsPanelProps> = ({
  storageVolumeFrgmt,
}) => {
  const { t } = useTranslation();
  const storageVolume = useFragment(
    graphql`
      fragment StorageHostSettingsPanel_storageVolumeFrgmt on StorageVolume {
        id
        capabilities
      }
    `,
    storageVolumeFrgmt,
  );

  const [isPending, startTransition] = useTransition();
  const currentDomain = useCurrentDomainValue();
  const [currentSettingType, setCurrentSettingType] =
    useState<QuotaScopeType>('user');

  const [selectedDomainName, setSelectedDomainName] =
    useState<string>(currentDomain);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  useState<string>();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>();
  useState<string>();

  const quotaScopeId = addQuotaScopeTypePrefix(
    currentSettingType,
    (currentSettingType === 'project' ? selectedProjectId : selectedUserId) ||
      '',
  );

  const [isOpenQuotaSettingModal, { toggle: toggleQuotaSettingModal }] =
    useToggle(false);
  const [fetchKey] = useUpdatableState('default');

  const { quota_scope } = useLazyLoadQuery<StorageHostSettingsPanelQuery>(
    graphql`
      query StorageHostSettingsPanelQuery(
        $quota_scope_id: String!
        $storage_host_name: String!
        $skipQuotaScope: Boolean!
      ) {
        quota_scope(
          storage_host_name: $storage_host_name
          quota_scope_id: $quota_scope_id
        ) @skip(if: $skipQuotaScope) {
          ...QuotaSettingModalFragment
          ...QuotaScopeCardFragment
        }
      }
    `,
    {
      // quota scope
      quota_scope_id: quotaScopeId,
      skipQuotaScope: quotaScopeId === undefined || quotaScopeId === '',
      storage_host_name: storageVolume?.id || '',
    },
    {
      fetchPolicy: 'network-only',
      fetchKey: fetchKey,
    },
  );

  return (
    <BAIFlex direction="column" align="stretch">
      <Card
        title={t('storageHost.QuotaSettings')}
        tabList={[
          {
            key: 'user',
            tab: t('storageHost.ForUser'),
          },
          {
            key: 'project',
            tab: t('storageHost.ForProject'),
          },
        ]}
        activeTabKey={currentSettingType}
        // eslint-disable-next-line
        //@ts-ignore
        onTabChange={(v) => {
          startTransition(() => {
            setCurrentSettingType(v as QuotaScopeType);
          });
        }}
      >
        <BAIFlex justify="between">
          {currentSettingType === 'project' ? (
            <BAIFlex style={{ marginBottom: 10 }}>
              <Form layout="inline" requiredMark={false}>
                <Form.Item label={t('resourceGroup.Domain')} required>
                  <BAIDomainSelector
                    style={{ width: '20vw', marginRight: 10 }}
                    value={selectedDomainName}
                    onChange={(_value, domain: any) => {
                      startTransition(() => {
                        setSelectedDomainName(domain?.domainName);
                        setSelectedProjectId(undefined);
                      });
                    }}
                  />
                </Form.Item>
                <Form.Item label={t('webui.menu.Project')} required>
                  <ProjectSelectForAdminPage
                    value={selectedProjectId}
                    disabled={!selectedDomainName}
                    domain={selectedDomainName || ''}
                    onSelectProject={(project: any) => {
                      startTransition(() => {
                        setSelectedProjectId(project?.projectId);
                      });
                    }}
                  />
                </Form.Item>
              </Form>
            </BAIFlex>
          ) : (
            <Form layout="inline">
              <Form.Item label={t('data.User')} required>
                <UserSelector
                  style={{ width: '30vw', marginBottom: 10 }}
                  value={selectedUserEmail}
                  onSelectUser={(user) => {
                    setSelectedUserEmail(user?.email);
                    startTransition(() => {
                      setSelectedUserId(user?.id);
                    });
                  }}
                />
              </Form.Item>
            </Form>
          )}
        </BAIFlex>
        <Spin spinning={isPending}>
          <QuotaScopeCard
            quotaScopeFrgmt={quota_scope || null}
            onClickEdit={() => {
              toggleQuotaSettingModal();
            }}
            showAddButtonWhenEmpty={
              (currentSettingType === 'project' && !!selectedProjectId) ||
              (currentSettingType === 'user' && !!selectedUserId)
            }
          />
        </Spin>
        <QuotaSettingModal
          open={isOpenQuotaSettingModal}
          quotaScopeFrgmt={quota_scope || null}
          onRequestClose={() => {
            toggleQuotaSettingModal();
          }}
        />
      </Card>
    </BAIFlex>
  );
};

export default StorageHostSettingsPanel;
