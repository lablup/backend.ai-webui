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
const pluginLoadedState = atom<boolean>(false);

export const useWebUIPluginValue = () => {
  return useAtomValue(webUIPluginsState);
};

export const useWebUIPluginLoadedValue = () => {
  return useAtomValue(pluginLoadedState);
};

export const useSetupWebUIPluginEffect = ({
  webUIRef,
}: {
  // TODO: fetch and load plugins in this hook instead of relying on webUIRef
  webUIRef: React.RefObject<any>;
}) => {
  'use memo';
  const [, setWebUIPlugins] = useAtom(webUIPluginsState);
  const [, setPluginLoaded] = useAtom(pluginLoadedState);
  useEffect(() => {
    const configHandler = () => {
      setWebUIPlugins(webUIRef.current?.plugins);
    };
    const pluginHandler = () => {
      setPluginLoaded(true);
      // Also update plugins in case they changed after loading
      setWebUIPlugins(webUIRef.current?.plugins);
    };
    document.addEventListener('backend-ai-config-loaded', configHandler);
    document.addEventListener('backend-ai-plugin-loaded', pluginHandler);
    return () => {
      document.removeEventListener('backend-ai-config-loaded', configHandler);
      document.removeEventListener('backend-ai-plugin-loaded', pluginHandler);
    };
  }, [webUIRef, setWebUIPlugins, setPluginLoaded]);
};
