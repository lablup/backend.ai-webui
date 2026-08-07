#!/bin/bash
# Ticket 18 — deployments-area antd import evidence.
#   ./p15-area.sh HEAD   -> before (from git)
#   ./p15-area.sh WORK   -> after  (working tree)
cd "$(dirname "$0")/../../../.." || exit 1
FILES="pages/DeploymentListPage pages/DeploymentDetailPage pages/AdminDeploymentPage pages/AdminDeploymentPresetSettingPage pages/ProjectAdminDeploymentsPage components/AdminDeployment components/AdminDeploymentPreset components/AdminDeploymentPresetModelConfigItem components/AdminDeploymentPresetResourceFields components/AdminDeploymentPresetReviewSummary components/AdminDeploymentPresetSettingPageContent components/AdminDeploymentPresetTable components/AdminDeploymentPresetValidationTour components/AdminModelCard components/AdminModelCardSettingModal components/AdminPrometheusPreset components/AdminRuntimeVariantPreset components/DeploymentAccessTokensCard components/DeploymentAddRevisionModal components/DeploymentAuditLogTab components/DeploymentAutoScalingCard components/DeploymentBasicInfoCard components/DeploymentCurrentRevisionTab components/DeploymentPresetDetailModal components/DeploymentReplicasCard components/DeploymentRevisionCard components/DeploymentRevisionDetail components/DeploymentRevisionDetailDrawer components/DeploymentRevisionHistoryTab components/DeploymentSchedulingHistoryModal components/DeploymentSettingModal components/ReplicaStatusTag components/RouteSchedulingHistoryModal"
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
