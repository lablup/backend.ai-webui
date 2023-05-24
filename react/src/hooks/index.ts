import { useSuspendedBackendaiClient } from "../components/BackendaiClientProvider";
import { useEffect, useMemo, useRef, useState } from "react";

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
