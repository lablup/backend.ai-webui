import { graphql, useFragment } from 'react-relay';
import { useBackendAIAppLauncherFragment$key } from 'src/__generated__/useBackendAIAppLauncherFragment.graphql';

export const useBackendAIAppLauncher = (
  sessionFrgmt?: useBackendAIAppLauncherFragment$key | null,
) => {
  // TODO: migrate backend-ai-app-launcher features to this hook using fragment data.
  const session = useFragment(
    graphql`
      fragment useBackendAIAppLauncherFragment on ComputeSessionNode {
        row_id @required(action: NONE)
        vfolder_mounts
      }
    `,
    sessionFrgmt,
  );

  // @ts-ignore
  return {
    runTerminal: () => {
      // @ts-ignore
      globalThis.appLauncher.runTerminal(session.row_id);
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
