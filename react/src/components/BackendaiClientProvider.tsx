import React from "react";
import { PropsWithChildren } from "react";
import { useQuery } from "react-query";

const BackendaiClientContext = React.createContext<any>(null!);
export const useSuspendedBackendaiClient = () =>
  React.useContext(BackendaiClientContext);

export const BackendaiClientProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { data: client } = useQuery<any>({
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
    suspense: true,
  });
  return (
    <BackendaiClientContext.Provider value={client}>
      {children}
    </BackendaiClientContext.Provider>
  );
};
