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
