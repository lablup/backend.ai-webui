import { Select, SelectProps } from "antd";
import React, { startTransition, useEffect } from "react";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import _ from "lodash";
// import { ResourceGroupSelectorQuery } from "./__generated__/ResourceGroupSelectorQuery.graphql";
import {
  useCurrentProjectValue,
  useSuspendedBackendaiClient,
  useUpdatableState,
} from "../hooks";
import { useQuery as useTanQuery } from "react-query";
import {
  baiSignedRequestWithPromise,
  useBaiSignedRequestWithPromise,
} from "../helper";

interface ResourceGroupSelectorProps extends SelectProps {
  projectId?: string;
  autoSelectDefault?: boolean;
  filter?: (projectName: string) => boolean;
}

const ResourceGroupSelector: React.FC<ResourceGroupSelectorProps> = ({
  projectId,
  autoSelectDefault,
  filter,
  onChange,
  ...selectProps
}) => {
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentProject = useCurrentProjectValue();
  // const { group: project } = useLazyLoadQuery<ResourceGroupSelectorQuery>(
  //   graphql`
  //     query ResourceGroupSelectorQuery($projectId: UUID!) {
  //       group(id: $projectId) {
  //         id
  //         scaling_groups
  //       }
  //     }
  //   `,
  //   {
  //     projectId: projectId || currentProject.id,
  //   }
  // );

  const [key, checkUpdate] = useUpdatableState("first");

  const { data } = useTanQuery({
    queryKey: ["ResourceGroupSelectorQuery", key],
    queryFn: () => {
      return baiRequestWithPromise({
        method: "GET",
        url: `/scaling-groups?group=${currentProject.name}`,
      }) as Promise<{ scaling_groups: { name: string }[] }>;
    },
    staleTime: 0,
  });
  const resourceGroups = data?.scaling_groups || [];

  const autoSelectedOption = resourceGroups[0]
    ? {
        label: resourceGroups[0].name,
        value: resourceGroups[0].name,
      }
    : undefined;

  useEffect(() => {
    if (autoSelectDefault && autoSelectedOption) {
      onChange?.(autoSelectedOption.value, autoSelectedOption);
    }
  }, [autoSelectDefault]);
  return (
    <Select
      defaultActiveFirstOption
      defaultValue={autoSelectDefault ? autoSelectedOption : undefined}
      onDropdownVisibleChange={(open) => {
        if (open) {
          startTransition(() => {
            checkUpdate();
          });
        }
      }}
    >
      {_.map(resourceGroups, (resourceGroup, idx) => {
        return (
          <Select.Option key={resourceGroup.name} value={resourceGroup.name}>
            {resourceGroup.name}
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default ResourceGroupSelector;
