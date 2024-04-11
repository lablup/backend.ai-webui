import { useEventNotStable } from './useEventNotStable';
import { useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { NavigateOptions, To, useNavigate } from 'react-router-dom';

interface WebUINavigateOptions extends NavigateOptions {
  params?: any;
}
export const useWebUINavigate = () => {
  const _reactNavigate = useNavigate();
  // @ts-ignore
  return (to: To, options?: WebUINavigateOptions) => {
    _reactNavigate(to, _.omit(options, ['params']));
    const pathName = _.isString(to) ? to : to.pathname || '';
    document.dispatchEvent(
      new CustomEvent('move-to-from-react', {
        detail: {
          path: pathName,
          params: options?.params,
        },
      }),
    );

    // dispatch event to update tab of backend-ai-usersettings
    if (pathName === '/usersettings') {
      const event = new CustomEvent('backend-ai-usersettings', {});
      document.dispatchEvent(event);
    }
  };
};

export const useBackendAIConnectedState = () => {
  const [time, setTime] = useState<string>();

  useEffect(() => {
    const listener = () => {
      setTime(new Date().toISOString());
    };
    document.addEventListener('backend-ai-connected', listener);
    return () => {
      document.removeEventListener('backend-ai-connected', listener);
    };
  }, []);

  return time;
};

export const useDateISOState = (initialValue?: string) => {
  const [value, setValue] = useState(initialValue || new Date().toISOString());

  const update = useEventNotStable((newValue?: string) => {
    setValue(newValue || new Date().toISOString());
  });
  return [value, update] as const;
};

export const useUpdatableState = (initialValue: string) => {
  return useDateISOState(initialValue);
};

export const useCurrentDomainValue = () => {
  const baiClient = useSuspendedBackendaiClient();
  return baiClient._config.domainName;
};

const currentProjectAtom = atomWithDefault(() => {
  return {
    // @ts-ignore
    name: globalThis?.backendaiclient?.current_group,
    // @ts-ignore
    id: globalThis?.backendaiclient?.current_group_id(),
  };
});

export const useCurrentProjectValue = () => {
  useSuspendedBackendaiClient();
  return useAtomValue(currentProjectAtom);
};

export const useSetCurrentProject = () => {
  const set = useSetAtom(currentProjectAtom);
  const baiClient = useSuspendedBackendaiClient();
  return useCallback(
    ({
      projectName,
      projectId,
    }: {
      projectName: string;
      projectId: string;
    }) => {
      set({
        name: projectName,
        id: projectId,
      });

      // To sync with baiClient
      baiClient.current_group = projectName;
      // @ts-ignore
      globalThis.backendaiutils._writeRecentProjectGroup(projectName);
      const event: CustomEvent = new CustomEvent('backend-ai-group-changed', {
        detail: projectName,
      });
      document.dispatchEvent(event);
    },
    [set, baiClient],
  );
};

export const useAnonymousBackendaiClient = ({
  api_endpoint,
}: {
  api_endpoint: string;
}) => {
  const client = useMemo(() => {
    //@ts-ignore
    const clientConfig = new globalThis.BackendAIClientConfig(
      '',
      '',
      api_endpoint,
      'SESSION',
    );
    //@ts-ignore
    return new globalThis.BackendAIClient(clientConfig, 'Backend.AI Console.');
  }, [api_endpoint]);

  return client;
};

export const useSuspendedBackendaiClient = () => {
  const { data: client } = useQuery<any>({
    queryKey: 'backendai-client-for-suspense',
    queryFn: () =>
      new Promise((resolve) => {
        if (
          //@ts-ignore
          typeof globalThis.backendaiclient === 'undefined' ||
          //@ts-ignore
          globalThis.backendaiclient === null ||
          //@ts-ignore
          globalThis.backendaiclient.ready === false
        ) {
          const listener = () => {
            // @ts-ignore
            resolve(globalThis.backendaiclient);
            document.removeEventListener('backend-ai-connected', listener);
          };
          document.addEventListener('backend-ai-connected', listener);
        } else {
          //@ts-ignore
          return resolve(globalThis.backendaiclient);
        }
      }),
    retry: false,
    // enabled: false,
    suspense: true,
  });

  return client as {
    vfolder: {
      list: (path: string) => Promise<any>;
      list_hosts: () => Promise<any>;
      list_files: (path: string, id: string) => Promise<any>;
      list_allowed_types: () => Promise<string[]>;
      clone: (input: any, name: string) => Promise<any>;
    };
    [key: string]: any;
    _config: BackendAIConfig;
  };
};

interface ImageMetadata {
  name: string;
  description: string;
  group: string;
  tags: string[];
  icon: string;
  label: {
    category: string;
    tag: string;
    color: string;
  }[];
}

export const useBackendAIImageMetaData = () => {
  const { data: metadata } = useQuery({
    queryKey: 'backendai-metadata-for-suspense',
    queryFn: () => {
      return fetch('resources/image_metadata.json')
        .then((response) => response.json())
        .then(
          (json: {
            imageInfo: {
              [key: string]: ImageMetadata | undefined;
            };
            tagAlias: {
              [key: string]: string;
            };
            tagReplace: {
              [key: string]: string;
            };
          }) => {
            return json;
          },
        );
    },
    suspense: true,
    retry: false,
  });

  const getImageMeta = (imageName: string) => {
    // registry/name:tag@architecture
    // cr.backend.ai/multiarch/python:3.9-ubuntu20.04
    // key = python, tags = [3.9, ubuntu20.04]
    if (_.isEmpty(imageName)) {
      return {
        key: '',
        tags: [],
      };
    }
    const specs = imageName.split('/');

    try {
      const [key, tag] = (
        specs[specs.length - 1] ||
        specs[specs.length - 2] ||
        ''
      ).split(':');

      // remove architecture string and split by '-'
      const tags = tag.split('@')[0].split('-');
      return { key, tags };
    } catch (error) {
      return {
        key: '',
        tags: [],
      };
    }
  };

  return [
    metadata,
    {
      getImageAliasName: (imageName: string) => {
        const { key } = getImageMeta(imageName);
        return metadata?.imageInfo[key]?.name || key;
      },
      getImageIcon: (imageName?: string | null, path = 'resources/icons/') => {
        if (!imageName) return 'default.png';
        const { key } = getImageMeta(imageName);
        return (
          path +
          (metadata?.imageInfo[key]?.icon !== undefined
            ? metadata?.imageInfo[key]?.icon
            : 'default.png')
        );
      },
      getNamespace: (imageName: string) => {
        const names = imageName.split('/');
        return names.length < 2 ? names[0] : names[1] || '';
      },
      getImageLang: (imageName: string) => {
        const names = imageName.split('/');
        const langs =
          names.length < 3 ? '' : names[2].split(':')[0]?.split('-') ?? '';
        return langs[langs.length - 1];
      },
      getImageTags: (imageName: string) => {
        // const { key, tags } = getImageMeta(imageName);
      },
      getFilteredRequirementsTags: (imageName: string) => {
        const { tags } = getImageMeta(imageName);
        const [, , ...requirements] = tags || ['', '', ''];
        const filteredRequirements = _.filter(
          requirements,
          (req) => !_.includes(req, 'customized_'),
        );
        return filteredRequirements;
      },
      getCustomTag: (imageLabels: { key: string; value: string }[]) => {
        const customizedNameLabel = _.find(imageLabels, {
          key: 'ai.backend.customized-image.name',
        })?.value;
        return customizedNameLabel;
      },
      getBaseVersion: (imageName: string) => {
        const { tags } = getImageMeta(imageName);
        return tags[0];
      },
      getBaseImage: (imageName: string) => {
        const { tags } = getImageMeta(imageName);
        return tags[1];
      },
      getImageMeta,
      getArchitecture: (imageName: string) => {
        let [, architecture] = imageName ? imageName.split('@') : ['', ''];
        return architecture;
      },
      tagAlias: (tag: string) => {
        let metadataTagAlias = metadata?.tagAlias[tag];
        if (!metadataTagAlias && metadata?.tagReplace) {
          for (const [key, replaceString] of Object.entries(
            metadata.tagReplace,
          )) {
            const pattern = new RegExp(key);
            if (pattern.test(tag)) {
              metadataTagAlias = tag.replace(pattern, replaceString);
              break;
            }
          }
        }
        return metadataTagAlias || tag;
      },
    },
  ] as const;
};

type BackendAIConfig = {
  _apiVersionMajor: string;
  _apiVersion: string;
  _hashType: string;
  _endpoint: string;
  endpoint: string;
  _endpointHost: string;
  accessKey: string;
  _secretKey: string;
  _userId: string;
  _password: string;
  _proxyURL: string;
  _proxyToken: string;
  _connectionMode: string;
  _session_id: string;
  domainName: string;
  default_session_environment: string;
  default_import_environment: string;
  allow_project_resource_monitor: boolean;
  allow_manual_image_name_for_session: boolean;
  always_enqueue_compute_session: boolean;
  openPortToPublic: boolean;
  allowPreferredPort: boolean;
  maxCPUCoresPerContainer: number;
  maxMemoryPerContainer: number;
  maxCUDADevicesPerContainer: number;
  maxCUDASharesPerContainer: number;
  maxROCMDevicesPerContainer: number;
  maxTPUDevicesPerContainer: number;
  maxIPUDevicesPerContainer: number;
  maxATOMDevicesPerContainer: number;
  maxWarboyDevicesPerContainer: number;
  maxShmPerContainer: number;
  maxFileUploadSize: number;
  allow_image_list: string[];
  maskUserInfo: boolean;
  singleSignOnVendors: string[];
  ssoRealmName: string;
  enableContainerCommit: boolean;
  appDownloadUrl: string;
  systemSSHImage: string;
  fasttrackEndpoint: string;
  hideAgents: boolean;
  enable2FA: boolean;
  force2FA: boolean;
  directoryBasedUsage: boolean;
  maxCountForPreopenPorts: number;
  pluginPages: string;
  blockList: string[];
  inactiveList: string[];
  allowSignout: boolean;
  allowNonAuthTCP: boolean;
  [key: string]: any;
};
