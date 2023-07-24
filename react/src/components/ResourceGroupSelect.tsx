import { Select, SelectProps } from "antd";
import React, { useEffect } from "react";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import _ from "lodash";
import { ResourceGroupSelectorQuery } from "./__generated__/ResourceGroupSelectorQuery.graphql";
import { useCurrentProjectValue, useSuspendedBackendaiClient } from "../hooks";
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

  const {
    data: { scaling_groups: resourceGroups },
  } = useTanQuery({
    queryKey: "ResourceGroupSelectorQuery",
    queryFn: () => {
      return baiRequestWithPromise({
        method: "GET",
        url: `/scaling-groups?group=${currentProject.name}`,
      });
    },
  });

  const autoSelectedOption = {
    label: resourceGroups[0].name,
    value: resourceGroups[0].name,
  };

  useEffect(() => {
    if (autoSelectDefault) {
      onChange?.(autoSelectedOption.value, autoSelectedOption);
    }
  }, [autoSelectDefault]);
  return (
    <Select
      defaultActiveFirstOption
      defaultValue={autoSelectDefault ? autoSelectedOption : undefined}
    >
      {_.map(resourceGroups, (resourceGroup, idx) => {
        return (
          <Select.Option key={resourceGroup.name} value={resourceGroup.name}>
            {resourceGroup.group}
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default ResourceGroupSelector;
