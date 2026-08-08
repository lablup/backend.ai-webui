#!/bin/bash
# Ticket 20 — Resources/Agent/resource-group area antd import evidence.
#   ./p15-area.sh HEAD   -> before (from git, base commit 797b0fc78)
#   ./p15-area.sh WORK   -> after  (working tree)
cd "$(dirname "$0")/../../../.." || exit 1
FILES="pages/ResourcesPage components/AgentList components/StorageProxyList components/ResourceGroupList components/AgentDetailDrawer components/AgentDetailDrawerContent components/AgentNodeItems/AgentActionButtons components/AgentNodeItems/AgentComputePlugins components/AgentNodeItems/AgentResources components/AgentNodeItems/AgentStatusTag components/StorageHostDetailDrawer components/StorageHostDetailDrawerContent components/ProjectFolderPermissionPanel components/StorageHostResourcePanel components/StorageHostSettingsPanel components/UserFolderPermissionPanel components/UserFolderPermissionPanelV2 components/ResourceGroupInfoModal components/ResourceGroupSettingModal components/UpdateResourceGroupsModal components/AgentDetailModal components/AgentSettingModal components/AgentLifeCycleControlModal"
BASE=797b0fc78
for f in $FILES; do
  echo "== react/src/$f.tsx"
  if [ "$1" = "HEAD" ]; then
    git show "$BASE:react/src/$f.tsx" 2>/dev/null |
      grep -nE "from '(antd|antd-style|antd/|@ant-design)" ||
      echo "  (no antd-family import)"
  else
    grep -nE "from '(antd|antd-style|antd/|@ant-design)" "react/src/$f.tsx" ||
      echo "  (no antd-family import)"
  fi
done
