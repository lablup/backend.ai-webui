import BAICard from '../../BAICard';
import {
  baiSignedRequestWithPromise,
  useBaiSignedRequestWithPromise,
} from '../../helper';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useTanMutation, useTanQuery } from '../../hooks/reactQueryAlias';
import Flex from '../Flex';
import { App, Button, Descriptions, Empty, Tag, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

type Invitation = {
  create_at: string;
  id: string;
  invitee: string;
  inviter: string;
  modified_at: string;
  perm: string;
  state: string;
  vfolder_id: string;
  vfolder_name: string;
};

const useStyles = createStyles(({ css }) => ({
  card: css`
    .ant-card-body {
      padding: var(--token-paddingSM);
    }
  `,
  description: css`
    .ant-descriptions-header {
      margin-bottom: var(--token-marginXS);
    }
    .ant-descriptions-item {
      padding: 0 !important;
    }
  `,
  empty: css`
    justify-content: center;
    display: flex;
    flex-direction: column;
    height: inherit;
    margin: 0;
  `,
}));

const SummaryItemInvitation: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const app = App.useApp();

  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const queryClient = useQueryClient();
  const {
    data: { invitations },
  } = useTanQuery({
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
    <Flex direction="column" gap={token.marginSM}>
      {invitations.length > 0 ? (
        <>
          {invitations.map((invitation: Invitation) => {
            return (
              <BAICard className={styles.card}>
                <Descriptions
                  className={styles.description}
                  title={`${t('summary.InvitatedFrom')} ${invitation.inviter}`}
                  column={1}
                >
                  <Descriptions.Item label={t('summary.FolderName')}>
                    <Typography.Text strong>
                      {invitation.vfolder_name}
                    </Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('summary.Permission')}>
                    {permissionIndicator(invitation.perm)}
                  </Descriptions.Item>
                </Descriptions>
                <Flex
                  justify="end"
                  gap={token.paddingXS}
                  style={{ paddingTop: token.paddingXS }}
                >
                  <Button
                    type="default"
                    onClick={() =>
                      terminateInvitationsMutation.mutate(invitation.id, {
                        onSuccess() {
                          queryClient.invalidateQueries([
                            'baiClient.invitation.list',
                          ]);
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
                          queryClient.invalidateQueries([
                            'baiClient.invitation.list',
                          ]);
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
            );
          })}
        </>
      ) : (
        <Empty
          className={styles.empty}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('summary.NoInvitations')}
        />
      )}
    </Flex>
  );
};

export default SummaryItemInvitation;
