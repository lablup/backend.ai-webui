import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";

export const useBackendAIConnectedState = () => {
  const [time, setTime] = useState<string>();

  useEffect(() => {
    const listener = () => {
      setTime(new Date().toISOString());
    };
    document.addEventListener("backend-ai-connected", listener);
    return () => {
      document.removeEventListener("backend-ai-connected", listener);
    };
  }, []);

  return time;
};

export const useDateISOState = (initialValue?: string) => {
  const [value, setValue] = useState(initialValue || new Date().toISOString());

  const update = (newValue?: string) => {
    setValue(newValue || new Date().toISOString());
  };
  return [value, update] as const;
};

export const useUpdatableState = useDateISOState;

export const useCurrentProjectValue = () => {
  const baiClient = useSuspendedBackendaiClient();
  const [project, _setProject] = useState<{
    name: string;
    id: string;
  }>({
    name: baiClient.current_group,
    id: baiClient.groupIds[baiClient.current_group],
  });

  useEffect(() => {
    const listener = (e: any) => {
      const newProjectName = e.detail;
      _setProject({
        name: newProjectName,
        id: baiClient.groupIds[newProjectName],
      });
    };
    document.addEventListener("backend-ai-group-changed", listener);
    return () => {
      document.removeEventListener("backend-ai-group-changed", listener);
    };
  });

  return project;
};

export const useAnonymousBackendaiClient = ({
  api_endpoint,
}: {
  api_endpoint: string;
}) => {
  const client = useMemo(() => {
    //@ts-ignore
    const clientConfig = new globalThis.BackendAIClientConfig(
      "",
      "",
      api_endpoint,
      "SESSION"
    );
    //@ts-ignore
    return new globalThis.BackendAIClient(clientConfig, "Backend.AI Console.");
  }, [api_endpoint]);

  return client;
};

export const useSuspendedBackendaiClient = () => {
  const { data: client, refetch } = useQuery<any>({
    queryKey: "backendai-client-for-suspense",
    queryFn: () =>
      new Promise((resolve) => {
        if (
          //@ts-ignore
          typeof globalThis.backendaiclient === "undefined" ||
          //@ts-ignore
          globalThis.backendaiclient === null ||
          //@ts-ignore
          globalThis.backendaiclient.ready === false
        ) {
          const listener = () => {
            // @ts-ignore
            resolve(globalThis.backendaiclient);
            document.removeEventListener("backend-ai-connected", listener);
          };
          document.addEventListener("backend-ai-connected", listener);
        } else {
          //@ts-ignore
          return resolve(globalThis.backendaiclient);
        }
      }),
    retry: false,
    // enabled: false,
    suspense: true,
  });

  return client;
};
