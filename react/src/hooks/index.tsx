import { preserveDotStartCase } from '../helper';
import { useSuspenseTanQuery } from './reactQueryAlias';
import { useEventNotStable } from './useEventNotStable';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
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

export type UserStatsDataKey =
  | 'num_sessions'
  | 'cpu_allocated'
  | 'mem_allocated'
  | 'gpu_allocated'
  | 'io_read_bytes'
  | 'io_write_bytes'
  | 'disk_used';

export type UserStatsData = {
  date: number;
} & {
  [key in UserStatsDataKey]: {
    value: number;
    unit_hint: string;
  };
};

type KeypairInfoField =
  | 'access_key'
  | 'secret_key'
  | 'is_active'
  | 'is_admin'
  | 'user_id'
  | 'created_at'
  | 'last_used'
  | 'concurrency_limit'
  | 'concurrency_used'
  | 'rate_limit'
  | 'num_queries'
  | 'resource_policy';

export type BackendAIClient = {
  vfolder: {
    list: (path: string) => Promise<any>;
    list_hosts: () => Promise<any>;
    list_all_hosts: () => Promise<any>;
    list_files: (path: string, id: string) => Promise<any>;
    list_allowed_types: () => Promise<string[]>;
    clone: (input: any, name: string) => Promise<any>;
    delete_by_id: (id: string) => Promise<any>;
    restore_from_trash_bin: (id: string) => Promise<any>;
    delete_from_trash_bin: (id: string) => Promise<any>;
    rename: (newName: string, id: string) => Promise<any>;
    update_folder: (input: any, id: string) => Promise<any>;
    invite: (perm: string, emails: string[], id: string) => Promise<any>;
    delete_invitation: (inv_id: string) => Promise<any>;
    modify_invitee_permission(input: {
      perm: string | null;
      user: string;
      vfolder: string;
    }): Promise<any>;
  };
  supports: (feature: string) => boolean;
  [key: string]: any;
  _config: BackendAIConfig;
  isManagerVersionCompatibleWith: (version: string) => boolean;
  utils: {
    elapsedTime: (
      start: string | Date | number,
      end?: string | Date | number | null,
    ) => string;
  };
  maintenance: {
    rescan_images: (registry?: string) => Promise<{
      rescan_images: {
        msg: string;
        ok: boolean;
        task_id: string;
      };
    }>;
    recalculate_usage: () => Promise<any>;
    [key: string]: any;
  };
  resources: {
    user_stats: () => Promise<UserStatsData[]>;
    [key: string]: any;
  };
  keypair: {
    info: (accessKey: string, fields: KeypairInfoField[]) => Promise<any>;
    [key: string]: any;
  };
};
export const useSuspendedBackendaiClient = () => {
  const { data: client } = useSuspenseTanQuery<any>({
    queryKey: ['backendai-client-for-suspense'],
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
  });

  return client as BackendAIClient;
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

export const imageParser = {
  getBaseVersion: (imageName: string) => {
    return (
      _.first(_.split(_.last(_.split(imageName, ':')), /[^a-zA-Z\d.]+/)) || ''
    );
  },
  getBaseImage: (imageName: string) => {
    const splitByColon = _.split(imageName, ':');
    const beforeLastColon = _.join(_.initial(splitByColon), ':');
    const lastItemAfterSplitBySlash = _.last(_.split(beforeLastColon, '/'));
    return lastItemAfterSplitBySlash || '';
  },
  getTags: (tag: string, labels: Array<{ key: string; value: string }>) => {
    // Remove the 'customized_' prefix and its following string from the tag
    const cleanedTag = _.replace(tag, /customized_[a-zA-Z\d.]+/, '');
    // Split the remaining tag into segments based on alphanumeric and '.' characters, ignoring the first segment
    const tags = _.tail(_.split(cleanedTag, /[^a-zA-Z\d.]+/));
    const result: Array<{ key: string; value: string }> = [];

    // Process not 'customized_' tags
    _.forEach(tags, (currentTag) => {
      // Separate the alphabetic prefix from the numeric and '.' suffix for each tag
      const match = /^([a-zA-Z]+)(.*)$/.exec(currentTag);
      if (match) {
        const [, key, value] = match;
        // Ensure the value is an empty string if it's undefined
        result.push({ key, value: value || '' });
      }
    });

    // Handle the 'customized_' tag separately by finding the custom image name in labels
    const customizedNameLabel = _.get(
      _.find(labels, { key: 'ai.backend.customized-image.name' }),
      'value',
      '',
    );
    // If a custom image name exists, add it to the result with the key 'Customized'
    if (customizedNameLabel) {
      result.push({ key: 'Customized', value: customizedNameLabel });
    }

    // Remove duplicates and entries with an empty 'key'
    return _.uniqWith(
      _.filter(result, ({ key }) => !_.isEmpty(key)),
      _.isEqual,
    );
  },
};
export const useBackendAIImageMetaData = () => {
  const { data: metadata } = useSuspenseTanQuery<{
    imageInfo: {
      [key: string]: ImageMetadata | undefined;
    };
    tagAlias: {
      [key: string]: string;
    };
    tagReplace: {
      [key: string]: string;
    };
  }>({
    queryKey: ['backendai-metadata-for-suspense'],
    queryFn: () => {
      return fetch('resources/image_metadata.json').then((response) =>
        response.json(),
      );
    },
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
      const tags = _.split(_.first(_.split(tag, '@')), '-');
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
          names.length < 3 ? '' : (names[2].split(':')[0]?.split('-') ?? '');
        return langs[langs.length - 1];
      },
      getLang: (shortImageName: string) => {
        // console.log(imageName);
        const names = shortImageName.split('/');
        let lang = '';
        if (!_.isUndefined(names[1])) {
          lang = names.slice(1).join('');
        } else {
          lang = names[0];
        }
        const langs = lang.split('-');
        if (!_.isUndefined(langs[1])) {
          if (langs[0] === 'r') lang = langs[0];
          else lang = langs[1];
        }
        return metadata?.tagAlias[lang] || lang;
      },
      getImageTagStr: (imageName: string) => {
        return _.last(_.split(_.first(_.split(imageName, '@')), ':'));
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
      getBaseImages: (tag: string, name: string) => {
        const tags = tag.split('-');
        let baseImage;
        let lang = '';
        if (!_.isUndefined(tags[1])) {
          baseImage = tags[1];
        }
        let baseImageArr = [];
        if (!_.isUndefined(baseImage)) {
          baseImageArr.push(metadata?.tagAlias[baseImage] || baseImage);
        }
        const names = name.split('/');
        if (names[1] !== undefined) {
          lang = names.slice(1).join('');
        } else {
          lang = names[0];
        }
        const langs = lang.split('-');
        if (!_.isUndefined(langs[1])) {
          baseImageArr.push(metadata?.tagAlias[langs[0]] || langs[0]);
        }
        return baseImageArr;
      },
      getImageMeta,
      getConstraints: (
        tag: string,
        labels: { key: string; value: string }[],
      ) => {
        const tags = tag.split('-');
        if (!_.isUndefined(tags[1]) && !_.isUndefined(tag[2])) {
          const additionalReq =
            metadata?.tagAlias[
              tags.slice(2, tags.indexOf('customized_')).join('-')
            ] || tags.slice(2, tags.indexOf('customized_')).join('-');
          const result = [additionalReq];
          const customizedNameLabel = labels?.find(
            (label) => label.key === 'ai.backend.customized-image.name',
          )?.value;
          if (customizedNameLabel) result.push(customizedNameLabel);
          return result;
        }
        return [];
      },
      getArchitecture: (imageName: string) => {
        let [, architecture] = imageName ? imageName.split('@') : ['', ''];
        return architecture;
      },
      tagAlias: (tag: string) => {
        return (
          metadata?.tagAlias[tag] ??
          _.chain(metadata.tagReplace)
            .toPairs()
            .find(([regExpStr]) => new RegExp(regExpStr).test(tag))
            .thru((pair) => {
              if (pair) {
                const [regExpStr, replaceStr] = pair;
                return _.replace(tag, new RegExp(regExpStr), replaceStr);
              }
            })
            .value() ??
          preserveDotStartCase(tag)
        );
      },
      ...imageParser,
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
  maxATOMPlusDevicesPerContainer: number;
  maxGaudi2DevicesPerContainer: number;
  maxWarboyDevicesPerContainer: number;
  maxRNGDDevicesPerContainer: number;
  maxShmPerContainer: number;
  maxFileUploadSize: number;
  allow_image_list: string[];
  maskUserInfo: boolean;
  singleSignOnVendors: string[];
  ssoRealmName: string;
  enableImportFromHuggingFace: boolean;
  enableContainerCommit: boolean;
  enableModelFolders: boolean;
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
  enableExtendLoginSession: boolean;
  showNonInstalledImages: boolean;
  enableInteractiveLoginAccountSwitch: boolean;
  debug: boolean;
  [key: string]: any;
};
