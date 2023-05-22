import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { useQuery } from "react-query";

const BackendaiClientContext = React.createContext<{
  client: any;
  refetch: () => void;
}>(null!);
export const useSuspendedBackendaiClient = () => {
  const { client, refetch } = React.useContext(BackendaiClientContext);
  useMemo(() => {
    refetch();
  }, []);
  return client;
};

export const BackendaiClientProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
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
    enabled: false,
    suspense: true,
  });
  const value = useMemo(
    () => ({
      client,
      refetch,
    }),
    [client, refetch]
  );
  return (
    <BackendaiClientContext.Provider value={value}>
      {children}
    </BackendaiClientContext.Provider>
  );
};
