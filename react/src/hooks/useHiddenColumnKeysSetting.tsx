/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from './useBAISetting';

type KnownSettingName =
  | 'AgentList'
  | 'AgentSummaryList'
  | 'ContainerRegistryList'
  | 'CustomizedImageList'
  | 'ImageList'
  | 'RoleList'
  | 'RolePresetList';

export const useHiddenColumnKeysSetting = (listName: KnownSettingName) => {
  const [hiddenColumnKeys, setHiddenColumnKeys] = useBAISettingUserState(
    `hiddenColumnKeys.${listName}`,
  );

  return [hiddenColumnKeys, setHiddenColumnKeys] as const;
};
