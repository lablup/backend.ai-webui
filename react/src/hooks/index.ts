import { useEffect, useMemo, useState } from "react";
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

export const useUpdatableState = (initialValue: string) => {
  return useDateISOState(initialValue);
};

export const useCurrentDomainValue = () => {
  const baiClient = useSuspendedBackendaiClient();
  return baiClient._config.domainName;
};

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
    // enabled: false,
    suspense: true,
  });

  return client;
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

export const useBackendaiImageMetaData = () => {
  const { data: metadata } = useQuery({
    queryKey: "backendai-metadata-for-suspense",
    queryFn: () => {
      return fetch("resources/image_metadata.json")
        .then((response) => response.json())
        .then(
          (json: {
            imageInfo: {
              [key: string]: ImageMetadata;
            };
            tagAlias: {
              [key: string]: string;
            };
            tagReplace: {
              [key: string]: string;
            };
          }) => {
            return json;
          }
        );
    },
    suspense: true,
    retry: false,
  });

  const getImageMeta = (imageName: string) => {
    // cr.backend.ai/multiarch/python:3.9-ubuntu20.04
    // key = python, tags = [3.9, ubuntu20.04]
    if (!imageName) {
      return {
        key: "",
        tags: [],
      };
    }
    const specs = imageName.split("/");

    const [key, tag] = (specs[2] || specs[1]).split(":");
    const tags = tag.split("-");

    return { key, tags };
  };

  return [
    metadata,
    {
      getImageAliasName: (imageName: string) => {
        const { key } = getImageMeta(imageName);
        return metadata?.imageInfo[key].name || key;
      },
      getImageIcon: (imageName?: string | null, path = "resources/icons/") => {
        if (!imageName) return "default.png";
        const { key } = getImageMeta(imageName);
        return (
          path +
          (metadata?.imageInfo[key]?.icon !== undefined
            ? metadata?.imageInfo[key]?.icon
            : "default.png")
        );
      },
      getImageTags: (imageName: string) => {
        // const { key, tags } = getImageMeta(imageName);
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
    },
  ] as const;
};
