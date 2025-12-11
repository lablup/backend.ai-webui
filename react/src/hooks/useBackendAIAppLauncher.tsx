import { useWebUINavigate } from '.';
import { useSetBAINotification } from './useBAINotification';
import { BAILink } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { useBackendAIAppLauncherFragment$key } from 'src/__generated__/useBackendAIAppLauncherFragment.graphql';

export const useBackendAIAppLauncher = (
  sessionFrgmt?: useBackendAIAppLauncherFragment$key | null,
) => {
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const webuiNavigate = useWebUINavigate();

  // TODO: migrate backend-ai-app-launcher features to this hook using fragment data.
  const session = useFragment(
    graphql`
      fragment useBackendAIAppLauncherFragment on ComputeSessionNode {
        name
        row_id @required(action: NONE)
        vfolder_mounts
      }
    `,
    sessionFrgmt,
  );

  // @ts-ignore
  return {
    // TODO: AppLauncherModal should modify the hook to use, as it is currently separated,
    // to re-declare the notification for use by the backend-ai-app-launcher.
    runTerminal: () => {
      upsertNotification({
        key: `session-app-${session?.row_id}`,
        message: (
          <span>
            {t('general.Session')}:&nbsp;
            <BAILink
              style={{
                fontWeight: 'normal',
              }}
              onClick={() => {
                const newSearchParams = new URLSearchParams(location.search);
                newSearchParams.set('sessionDetail', session?.row_id || '');
                webuiNavigate({
                  pathname: `/session`,
                  search: newSearchParams.toString(),
                });
              }}
            >
              {session?.name}
            </BAILink>
          </span>
        ),
        description: t('session.appLauncher.LaunchingApp', {
          appName: 'Console',
        }),
      });
      // @ts-ignore
      globalThis.appLauncher.runTerminal(session?.row_id ?? '');
    },
    // TODO: implement below function
    // showLauncher: (params: {
    //   'session-uuid'?: string;
    //   'access-key'?: string;
    //   'app-services'?: string;
    //   mode?: string;
    //   'app-services-option'?: string;
    //   'service-ports'?: string;
    //   runtime?: string;
    //   filename?: string;
    //   arguments?: string;
    // }) => {},
  };
};
