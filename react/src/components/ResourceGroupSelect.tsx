import { Select, SelectProps } from "antd";
import React, { startTransition, useEffect } from "react";
import _ from "lodash";
// import { ResourceGroupSelectorQuery } from "./__generated__/ResourceGroupSelectorQuery.graphql";
import { useCurrentProjectValue, useUpdatableState } from "../hooks";
import { useBaiSignedRequestWithPromise } from "../helper";
import { useTanQuery } from "../hooks/reactQueryAlias";

interface ResourceGroupSelectorProps extends SelectProps {
  projectId?: string;
  autoSelectDefault?: boolean;
  filter?: (projectName: string) => boolean;
}

const ResourceGroupSelector: React.FC<ResourceGroupSelectorProps> = ({
  projectId,
  autoSelectDefault,
  filter,
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
      selectProps.onChange?.(autoSelectedOption.value, autoSelectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {...selectProps}
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
