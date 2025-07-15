import {
  baiSignedRequestWithPromise,
  useBaiSignedRequestWithPromise,
} from '../../helper';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  useSuspenseTanQuery,
  useTanMutation,
} from '../../hooks/reactQueryAlias';
import Flex from '../Flex';
import { App, Button, Descriptions, Empty, Tag, Typography, theme } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

const SummaryItemInvitation: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const app = App.useApp();

  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const {
    data: { invitations },
    refetch,
  } = useSuspenseTanQuery({
    queryKey: ['baiClient.invitation.list'],
    queryFn: () =>
      baiRequestWithPromise({
        method: 'GET',
        url: '/folders/invitations/list',
      }),
  });

  const terminateInvitationsMutation = useTanMutation({
    mutationFn: (inv_id: string) => {
      return baiSignedRequestWithPromise({
        method: 'DELETE',
        url: '/folders/invitations/delete',
        body: {
          inv_id: inv_id,
        },
        client: baiClient,
      });
    },
  });

  const acceptInvitationsMutation = useTanMutation({
    mutationFn: (inv_id: string) => {
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/folders/invitations/accept',
        body: {
          inv_id: inv_id,
        },
        client: baiClient,
      });
    },
  });

  const permissionIndicator = (permission: any) => {
    const indicator = [...permission].map((p: any) => {
      const color = ['green', 'blue', 'red', 'orange'][
        ['r', 'w', 'd', 'o'].indexOf(p)
      ];
      const text = ['read', 'write', 'delete', 'only'][
        ['r', 'w', 'd', 'o'].indexOf(p)
      ];

      return (
        <Tag color={color} key={p} style={{ marginInlineEnd: 0 }}>
          {text}
        </Tag>
      );
    });

    return indicator;
  };

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      //FIXME: This can modify dynamically by the layout
      style={{ width: '100%' }}
      gap={token.marginSM}
    >
      {invitations.length > 0 ? (
        <>
          {invitations.map((invitation: any) => (
            <BAICard key={invitation.id} showDivider style={{ width: '100%' }}>
              <Descriptions title={`From: ${invitation.inviter}`} column={1}>
                <Descriptions.Item
                  label={t('summary.FolderName')}
                  style={{ padding: 0 }}
                >
                  {invitation.vfolder_name}
                </Descriptions.Item>
                <Descriptions.Item label={t('summary.Permission')}>
                  {permissionIndicator(invitation.perm)}
                </Descriptions.Item>
              </Descriptions>
              <Flex gap={token.paddingXS} justify="end">
                <Button
                  type="default"
                  onClick={() =>
                    terminateInvitationsMutation.mutate(invitation.id, {
                      onSuccess() {
                        refetch();
                        app.message.success(
                          t('summary.DeclineSharedVFolder') +
                            invitation.vfolder_name,
                        );
                      },
                      onError(error: any) {
                        app.message.error(
                          error.message || t('dialog.ErrorOccurred'),
                        );
                      },
                    })
                  }
                >
                  <Typography.Text
                    type="danger"
                    style={{ fontSize: token.fontSizeSM }}
                  >
                    {t('summary.Decline')}
                  </Typography.Text>
                </Button>
                <Button
                  type="default"
                  style={{
                    fontSize: token.fontSizeSM,
                    color: token.colorPrimary,
                  }}
                  onClick={() =>
                    acceptInvitationsMutation.mutate(invitation.id, {
                      onSuccess() {
                        refetch();
                        app.message.success(
                          t('summary.AcceptSharedVFolder') +
                            invitation.vfolder_name,
                        );
                      },
                      onError(error: any) {
                        app.message.error(
                          error.message || t('dialog.ErrorOccurred'),
                        );
                      },
                    })
                  }
                >
                  {t('summary.Accept')}
                </Button>
              </Flex>
            </BAICard>
          ))}
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('summary.NoInvitations')}
        />
      )}
    </Flex>
  );
};

export default SummaryItemInvitation;
