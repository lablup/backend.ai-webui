import { Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import React from "react";
import { useQuery } from "react-query";
import { ReactWebComponentProps } from "../helper/react-to-webcomponent";
import { useWebComponentInfo } from "./DefaultProviders";
import Flex from "./Flex";

interface ResourceMonitorProps {}
const ResourceMonitor: React.FC<ResourceMonitorProps> = () => {
  // useQuery('resourceGroups', ()=>{

  //   // return globalThis.resourceBroker.updateScalingGroup(true, );
  // })
  // @ts-ignore
  const {
    resourceBroker,
    props: { value },
  } = useWebComponentInfo();
  const resourceGroups = resourceBroker.scaling_groups;

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
