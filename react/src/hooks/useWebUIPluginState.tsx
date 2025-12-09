import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

export type PluginPage = {
  name: string;
  url: string;
  menuitem: string;
  icon?: string;
  group?: string;
};

export type WebUIPluginType = {
  page: PluginPage[];
  menuitem: string[];
  'menuitem-user': string[];
  'menuitem-admin': string[];
  'menuitem-superadmin': string[];
};

const webUIPluginsState = atom<WebUIPluginType | undefined>(undefined);

export const useWebUIPluginValue = () => {
  return useAtomValue(webUIPluginsState);
};

export const useSetupWebUIPluginEffect = ({
  webUIRef,
}: {
  // TODO: fetch and load plugins in this hook instead of relying on webUIRef
  webUIRef: React.RefObject<any>;
}) => {
  const [, setWebUIPlugins] = useAtom(webUIPluginsState);
  useEffect(() => {
    const handler = () => {
      setWebUIPlugins(webUIRef.current?.plugins);
    };
    document.addEventListener('backend-ai-config-loaded', handler);
    return () => {
      document.removeEventListener('backend-ai-config-loaded', handler);
    };
  }, [webUIRef, setWebUIPlugins]);
};
