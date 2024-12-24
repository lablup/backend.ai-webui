import { useBAISettingUserState } from './useBAISetting';

type KnownSettingName =
  | 'AgentList'
  | 'AgentSummaryList'
  | 'ContainerRegistryList'
  | 'CustomizedImageList'
  | 'ErrorLogList'
  | 'ImageList'
  | 'KeypairResourcePolicyList'
  | 'ProjectResourcePolicyList'
  | 'UserResourcePolicyList'
  | 'EndpointListPage';

export const useHiddenColumnKeysSetting = (listName: KnownSettingName) => {
  const [hiddenColumnKeys, setHiddenColumnKeys] = useBAISettingUserState(
    `hiddenColumnKeys.${listName}`,
  );

  return [hiddenColumnKeys, setHiddenColumnKeys] as const;
};
