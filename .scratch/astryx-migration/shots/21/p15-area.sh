#!/bin/bash
# Ticket 21 — Users/Credentials/ResourcePolicy area antd import evidence.
#   ./p15-area.sh HEAD   -> before (from git)
#   ./p15-area.sh WORK   -> after  (working tree)
cd "$(dirname "$0")/../../../.." || exit 1
FILES="pages/AdminUsersPage pages/ProjectAdminUsersPage pages/ResourcePolicyPage components/AdminUserCredentialList components/AdminUserManagement components/BulkCreateUserFromCSVModal components/PurgeUsersModal components/UpdateUsersModal components/UserInfoModal components/UserSettingModal components/GeneratedKeypairListModal components/KeypairInfoModal components/KeypairSettingModal components/KeypairResourcePolicyList components/KeypairResourcePolicyInfoModal components/KeypairResourcePolicySettingModal components/UserResourcePolicyList components/UserResourcePolicySettingModal components/UserResourcePolicyV2 components/UserResourcePolicyV2SettingModal components/ProjectResourcePolicyList components/ProjectResourcePolicySettingModal components/FormItemWithUnlimited"
for f in $FILES; do
  echo "== react/src/$f.tsx"
  if [ "$1" = "HEAD" ]; then
    git show "HEAD:react/src/$f.tsx" 2>/dev/null |
      grep -nE "from '(antd|antd-style|antd/|@ant-design)" ||
      echo "  (no antd-family import)"
  else
    grep -nE "from '(antd|antd-style|antd/|@ant-design)" "react/src/$f.tsx" ||
      echo "  (no antd-family import)"
  fi
done
