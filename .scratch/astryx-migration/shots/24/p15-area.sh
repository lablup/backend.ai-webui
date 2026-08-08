#!/bin/bash
# Ticket 24 — common frame / login / remainder area antd import evidence.
#   ./p15-area.sh HEAD   -> before (from git, base commit c8bb749a4)
#   ./p15-area.sh WORK   -> after  (working tree)
cd "$(dirname "$0")/../../../.." || exit 1
FILES="
components/MainLayout/MainLayout
components/MainLayout/WebUIHeader
components/MainLayout/WebUISider
components/MainLayout/ProjectScopeLayout
components/BAISider
components/BAIMenu
components/SiderToggleButton
components/WebUIBreadcrumb
components/LocationStateBreadCrumb
components/BAIContentWithDrawerArea
components/UserDropdownMenu
components/WebUIThemeToggleButton
components/WEBUIHelpButton
components/BAIHelpDrawer
components/LoginSessionExtendButton
components/NetworkStatusBanner
components/AnnouncementAlert
components/LoginView
components/LoginFormPanel
components/SignupModal
components/ChangePasswordView
components/EmailVerificationView
components/STokenLoginBoundary
components/SignoutModal
components/TermsOfServiceModal
components/PrivacyPolicyModal
components/RouteErrorContent
components/BAIErrorBoundary
components/AboutBackendAIModal
components/FlexActivityIndicator
components/ActionItemContent
components/EduAppLauncher
pages/InteractiveLoginPage
pages/Page404
pages/ForbiddenPage
pages/StartPage
hooks/useWebUIMenuItems
routes
"
# NOTE: `components/Information.tsx` (the admin "Information" page, under the
# admin System menu group) is DELIBERATELY not in this list — it belongs to
# ticket 22's Settings/admin area, whose agent ran in parallel with this one.
BASE=c8bb749a4
for f in $FILES; do
  for ext in tsx ts; do
    p="react/src/$f.$ext"
    if [ "$1" = "HEAD" ]; then
      git cat-file -e "$BASE:$p" 2>/dev/null || continue
      echo "== $p"
      git show "$BASE:$p" |
        grep -nE "from '(antd|antd-style|antd/|@ant-design)" ||
        echo "  (no antd-family import)"
    else
      [ -f "$p" ] || continue
      echo "== $p"
      grep -nE "from '(antd|antd-style|antd/|@ant-design)" "$p" ||
        echo "  (no antd-family import)"
    fi
  done
done
