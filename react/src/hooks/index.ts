import { useEffect, useState } from "react";
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

export const useSuspendedBackendaiClient = () => {
  const { data } = useQuery<any>({
    queryKey: "backendai-client",
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
    suspense: true,
  });
  return data;
};
