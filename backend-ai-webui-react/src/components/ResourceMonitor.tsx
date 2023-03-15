import { Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import React from "react";
import { useQuery } from "react-query";
import { ReactWebComponentProps } from "../helper";
import Flex from "./Flex";

interface ResourceMonitorProps extends ReactWebComponentProps {}
const ResourceMonitor: React.FC<ResourceMonitorProps> = ({ value }) => {
  // useQuery('resourceGroups', ()=>{

  //   // return globalThis.resourceBroker.updateScalingGroup(true, );
  // })
  // @ts-ignore
  const resourceGroups = globalThis.resourceBroker.scaling_groups;

  const options: DefaultOptionType[] = resourceGroups.map(
    (group: { name: string }) => {
      return {
        label: group.name,
        value: group.name,
      };
    }
  );
  return (
    <Flex>
      <Select value={value} options={options} style={{ width: 100 }} />;
    </Flex>
  );
};

export default ResourceMonitor;
