# Backend.AI WebUI App Launcher - Comprehensive Test Plan

## Application Overview

The App Launcher is a modal-based application management interface within Backend.AI WebUI that enables users to launch various applications from compute sessions. The functionality is implemented using React components with Relay GraphQL integration.

### Key Features

- **Modal-Based Interface**: Accessible from session action buttons with categorized app display
- **App Categories**: Applications are grouped by category (e.g., "99.Custom" for general apps)
- **Advanced Options**:
  - **Open to Public**: Makes applications accessible publicly with optional client IP restrictions
  - **Preferred Port**: Allows users to specify a preferred port number for app connections
  - **Debug Options**: V1/V2 proxy selection and subdomain configuration (debug mode only)
- **Connection Info Modals**: Dedicated modals for SSH/SFTP, VNC, XRDP, VS Code Desktop, and generic TCP apps
- **Network Request Verification**: Critical parameters (`app_name`, `open_to_public`, `port`) are sent during app launch

### Supported Applications

Testing focuses on Python 3.13 image (`cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64`) with these apps:

1. **SSH/SFTP (sshd)** - SSH/SFTP connection with dedicated info modal
2. **Console (ttyd)** - Browser-based terminal
3. **Jupyter Notebook (jupyter)** - Classic Jupyter interface
4. **JupyterLab (jupyterlab)** - Modern Jupyter interface
5. **Visual Studio Code (vscode)** - Browser-based VS Code
6. **VS Code Desktop (vscode-desktop)** - Desktop VS Code connection modal

### Technical Architecture

- **Components**:
  - `AppLauncherModal` - Main modal component
  - `AppLaunchConfirmationModal` - Confirmation for special apps (nniboard, mlflow-ui)
  - `SFTPConnectionInfoModal`, `VNCConnectionInfoModal`, `XRDPConnectionInfoModal`, `VSCodeDesktopConnectionModal`, `TCPConnectionInfoModal` - Connection info modals
  - `TensorboardPathModal` - Path input for Tensorboard
- **Hooks**:
  - `useBackendAIAppLauncher` - Core app launch logic with proxy coordination
  - `useSuspendedFilteredAppTemplate` - Filters available apps based on service ports
- **GraphQL**: Uses Relay fragments for session data (`AppLauncherModalFragment`)
- **Notifications**: Progress notifications with stages (configuring, connecting, connected)

### Data Attributes for Testing

- `data-testid="app-launcher-modal"` - Main modal container
- `data-testid="category-{categoryName}"` - Category sections (e.g., `category-99.Custom`)
- `data-testid="app-{appName}"` - Individual app containers (e.g., `app-ttyd`, `app-jupyterlab`)
- Form controls: Checkbox for "Open to Public", InputNumber for "Preferred Port"

### Network Endpoints

- **V1 Proxy**: `PUT /conf` for configuration, `GET /proxy/{token}/{sessionId}/add?app={appName}` for app launch
- **V2 Proxy**: `POST /v2/proxy/{token}/{sessionId}/add?app={appName}` for direct connection
- **Parameters**:
  - Required: `app` (app name)
  - Optional: `port` (preferred port), `open_to_public` (boolean), `allowed_client_ips` (comma-separated IPs)

---

## Test Scenarios

### 1. App Launcher Modal - Basic Interaction

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session

#### 1.1 User can open app launcher modal from session action buttons

**Prerequisites:**
- User is logged in
- At least one running session with Python 3.13 image exists

**Steps:**
1. Navigate to session list page (`/session`)
2. Locate session row with Python 3.13 image
3. Click the "App Launcher" button (or equivalent action button) in the session row
4. Verify app launcher modal opens

**Expected Results:**
- App launcher modal appears with `data-testid="app-launcher-modal"`
- Modal title displays session name (format: "App: {sessionName}")
- Modal footer is not visible (footer={null})

#### 1.2 User sees apps grouped by category in launcher modal

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Verify category sections are displayed
3. Verify category titles use Typography.Title level 5
4. Verify apps are displayed in a grid layout (4 columns per row)

**Expected Results:**
- At least one category is visible (e.g., "Custom" with `data-testid="category-Custom"`)
- Each category has a heading with the category name
- Apps are arranged in a 6-column grid (Col span={6})
- Each app shows an icon and title

#### 1.3 User can close app launcher modal

**Steps:**
1. Open app launcher modal
2. Click the close button (X) in modal header
3. Verify modal closes

**Expected Results:**
- Modal is no longer visible
- User remains on session list page
- No errors in console

#### 1.4 User sees correct app icons and titles for each application

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Verify each supported app is displayed

**Expected Results:**
- SSH/SFTP app (`data-testid="app-sshd"`) displays with icon and title
- Console/Terminal app (`data-testid="app-ttyd"`) displays with icon and title
- Jupyter Notebook app (`data-testid="app-jupyter"`) displays with icon and title
- JupyterLab app (`data-testid="app-jupyterlab"`) displays with icon and title
- VS Code app (`data-testid="app-vscode"`) displays with icon and title
- VS Code Desktop app (`data-testid="app-vscode-desktop"`) displays with icon and title (if available)

---

### 2. App Launcher - Basic App Launch Tests

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session

#### 2.1 User can launch Console (Terminal/ttyd) app in new browser tab

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Click Console/Terminal app button (`data-testid="app-ttyd"`)
3. Wait for notification to appear with progress indicator
4. Monitor notification stages: "Launching Console", "Setting up proxy for Console", "Adding kernel to socket queue", "Prepared"
5. Wait for app to open in new browser tab (1 second delay)

**Expected Results:**
- Progress notification appears with session name link
- Notification shows progress stages with increasing percentage (0% → 20% → 40% → 60% → 100%)
- Final notification shows "Prepared" status
- New browser tab opens with terminal interface
- Terminal is functional and accepts commands
- App launcher modal remains open

**Network Verification:**
- POST/GET request to proxy endpoint includes `app=ttyd` parameter
- No `open_to_public` or `port` parameters (advanced options not set)

#### 2.2 User can launch Jupyter Notebook app in new browser tab

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Click Jupyter Notebook app button (`data-testid="app-jupyter"`)
3. Wait for notification to appear with progress indicator
4. Monitor notification stages
5. Wait for app to open in new browser tab

**Expected Results:**
- Progress notification appears
- Notification shows progress stages
- Final notification shows "Prepared" status
- New browser tab opens with Jupyter Notebook interface
- Jupyter Notebook is accessible and functional

**Network Verification:**
- Proxy request includes `app=jupyter` parameter

#### 2.3 User can launch JupyterLab app in new browser tab

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Click JupyterLab app button (`data-testid="app-jupyterlab"`)
3. Wait for notification to appear with progress indicator
4. Monitor notification stages
5. Wait for app to open in new browser tab

**Expected Results:**
- Progress notification appears
- Notification shows progress stages
- Final notification shows "Prepared" status
- New browser tab opens with JupyterLab interface
- JupyterLab is accessible and functional

**Network Verification:**
- Proxy request includes `app=jupyterlab` parameter

#### 2.4 User can launch Visual Studio Code app in new browser tab

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Click VS Code app button (`data-testid="app-vscode"`)
3. Wait for notification to appear with progress indicator
4. Monitor notification stages
5. Wait for app to open in new browser tab

**Expected Results:**
- Progress notification appears
- Notification shows progress stages
- Final notification shows "Prepared" status
- New browser tab opens with VS Code interface
- VS Code is accessible and functional

**Network Verification:**
- Proxy request includes `app=vscode` parameter

#### 2.5 User sees SFTP connection info modal after launching SSH/SFTP app

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Click SSH/SFTP app button (`data-testid="app-sshd"`)
3. Wait for notification to complete
4. Verify SFTP connection info modal opens

**Expected Results:**
- Progress notification appears and completes
- SFTP connection info modal (`SFTPConnectionInfoModal`) opens
- Modal displays:
  - Hostname/IP address (e.g., "127.0.0.1" or gateway hostname)
  - Port number (TCP port)
  - Username (session access key or user identifier)
- Modal provides instructions for SSH/SFTP connection
- User can copy connection details
- Modal can be closed

**Network Verification:**
- Proxy request includes `app=sshd` parameter
- `protocol=tcp` parameter is included

#### 2.6 User sees VS Code Desktop connection modal after launching VS Code Desktop app

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Click VS Code Desktop app button (`data-testid="app-vscode-desktop"`)
3. Wait for notification to complete
4. Verify VS Code Desktop connection modal opens

**Expected Results:**
- Progress notification appears and completes
- VS Code Desktop connection modal (`VSCodeDesktopConnectionModal`) opens
- Modal displays:
  - Hostname/IP address
  - Port number
  - Connection instructions for desktop VS Code
- Modal provides copy functionality for connection details
- Modal can be closed

**Network Verification:**
- Proxy request includes `app=sshd` (VS Code Desktop uses sshd service internally)
- `protocol=tcp` parameter is included

---

### 3. App Launcher - Advanced Options Tests

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session

**Prerequisites:**
- Backend.AI configuration must have `openPortToPublic: true` and `allowPreferredPort: true` enabled
- User must be in non-Electron environment (web browser)

#### 3.1 User can enable "Open to Public" option and verify network request includes parameter

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Verify "Open to Public" checkbox is visible and unchecked by default
3. Check the "Open to Public" checkbox
4. Optionally add allowed client IPs (e.g., "192.168.1.100, 192.168.1.101") in the tag input field
5. Click Console/Terminal app button
6. Monitor network requests to proxy endpoint
7. Wait for app launch to complete

**Expected Results:**
- "Open to Public" checkbox becomes checked
- Allowed client IPs input field becomes enabled when checkbox is checked
- Allowed client IPs input accepts comma-separated IP addresses as tags
- Network request to proxy endpoint includes:
  - `app=ttyd` parameter
  - `open_to_public=true` parameter
  - `allowed_client_ips=192.168.1.100,192.168.1.101` parameter (if IPs provided)
- App launches successfully with public access enabled
- After launch, "Open to Public" checkbox resets to unchecked state

**Network Verification (Critical):**
- Verify proxy request URL contains `open_to_public=true`
- Verify proxy request URL contains `allowed_client_ips={trimmed_comma_separated_ips}` (if IPs provided)
- Verify all spaces are trimmed from IP addresses

#### 3.2 User can specify preferred port and verify network request includes port parameter

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Verify "Try Preferred Port" checkbox is visible and unchecked by default
3. Check the "Try Preferred Port" checkbox
4. Enter a valid port number (e.g., 10250) in the "Preferred Port" input field
5. Click Jupyter Notebook app button
6. Monitor network requests to proxy endpoint
7. Wait for app launch to complete

**Expected Results:**
- "Try Preferred Port" checkbox becomes checked
- "Preferred Port" input field becomes enabled when checkbox is checked
- Input field accepts numeric values between 1025 and 65534
- Network request to proxy endpoint includes:
  - `app=jupyter` parameter
  - `port=10250` parameter
- App launches successfully on preferred port (if available)
- After launch, "Try Preferred Port" checkbox resets to unchecked state
- Port input value is cleared

**Network Verification (Critical):**
- Verify proxy request URL contains `port=10250`
- Verify port parameter is only sent when checkbox is checked

#### 3.3 User sees validation error for invalid preferred port numbers

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Check the "Try Preferred Port" checkbox
3. Test invalid port numbers:
   - Enter port below minimum (e.g., 1024)
   - Try to launch app
   - Verify validation error appears
   - Enter port above maximum (e.g., 65535)
   - Try to launch app
   - Verify validation error appears

**Expected Results:**
- Port below 1025 triggers validation error: "Value must be at least 1025"
- Port above 65534 triggers validation error: "Value must be at most 65534"
- App launch is blocked when validation fails
- Error message is clearly visible below input field

#### 3.4 User can combine "Open to Public" and "Preferred Port" options

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Check "Open to Public" checkbox
3. Add allowed client IPs: "10.0.0.1, 192.168.1.50"
4. Check "Try Preferred Port" checkbox
5. Enter preferred port: 15000
6. Click VS Code app button
7. Monitor network requests to proxy endpoint
8. Wait for app launch to complete

**Expected Results:**
- Both checkboxes are checked
- Both input fields are enabled and accept values
- Network request to proxy endpoint includes:
  - `app=vscode` parameter
  - `open_to_public=true` parameter
  - `allowed_client_ips=10.0.0.1,192.168.1.50` parameter
  - `port=15000` parameter
- App launches successfully with both options applied
- After launch, both checkboxes reset to unchecked state

**Network Verification (Critical):**
- Verify all four parameters are present in proxy request URL
- Verify parameter values are correctly encoded

#### 3.5 User cannot access advanced options when not configured

**Steps:**
1. Verify backend configuration has `openPortToPublic: false` or `allowPreferredPort: false`
2. Open app launcher modal for Python 3.13 session
3. Check for presence of advanced option controls

**Expected Results:**
- If `openPortToPublic: false`, "Open to Public" checkbox is not visible
- If `allowPreferredPort: false`, "Try Preferred Port" checkbox is not visible
- No advanced option controls are displayed when disabled in config
- App launches work normally without advanced options

---

### 4. App Launcher - Connection Info Modals

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session

#### 4.1 User can view and copy SFTP connection details from modal

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Launch SSH/SFTP app
3. Wait for SFTP connection info modal to open
4. Verify all connection details are displayed
5. Test copy functionality for each field (if available)
6. Close modal using close button or cancel button

**Expected Results:**
- SFTP modal displays connection details:
  - **Hostname**: Gateway hostname or "127.0.0.1" (for Electron)
  - **Port**: TCP port number (e.g., 2200, 3022)
  - **Username**: Session access key or session identifier
- Connection details are selectable and copyable
- Modal provides example SFTP/SSH commands (if applicable)
- Modal can be closed and reopened without issues
- After closing modal, app launcher modal is still visible

#### 4.2 User can view VS Code Desktop connection instructions

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Launch VS Code Desktop app
3. Wait for VS Code Desktop connection modal to open
4. Verify connection instructions are displayed
5. Test copy functionality for connection details
6. Close modal

**Expected Results:**
- VS Code Desktop modal displays:
  - **Hostname**: Gateway hostname or "127.0.0.1"
  - **Port**: TCP port number
  - **Connection instructions**: Steps to connect desktop VS Code to the session
- Instructions are clear and actionable
- Connection details are copyable
- Modal can be closed

#### 4.3 User can view generic TCP connection info for non-standard TCP apps

**Prerequisites:**
- Session has a non-standard TCP service port configured (not sshd, vscode-desktop, xrdp, vnc)

**Steps:**
1. Open app launcher modal for session with custom TCP app
2. Launch custom TCP app
3. Wait for TCP connection info modal to open
4. Verify connection details are displayed

**Expected Results:**
- TCP connection info modal (`TCPConnectionInfoModal`) opens
- Modal displays:
  - **App Name**: Name of the TCP application
  - **Hostname**: Gateway hostname
  - **Port**: TCP port number
- Connection details are presented clearly
- Modal can be closed

---

### 5. App Launcher - Network Request Verification

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session

**Important:** These tests focus on verifying correct network parameters are sent to the proxy endpoints.

#### 5.1 User launches app without advanced options - verify minimal network parameters

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Ensure "Open to Public" and "Try Preferred Port" are unchecked
3. Click JupyterLab app button
4. Intercept network request to proxy endpoint
5. Verify request parameters

**Expected Results:**
- Network request URL structure:
  - V1 Proxy: `/proxy/{token}/{sessionId}/add?app=jupyterlab`
  - V2 Proxy: `/v2/proxy/{token}/{sessionId}/add?app=jupyterlab`
- **Required parameters present:**
  - `app=jupyterlab`
- **Optional parameters absent:**
  - No `open_to_public` parameter
  - No `port` parameter
  - No `allowed_client_ips` parameter

#### 5.2 User launches app with "Open to Public" - verify open_to_public parameter

**Steps:**
1. Open app launcher modal for Python 3.13 session
2. Check "Open to Public" checkbox
3. Do NOT add any allowed client IPs
4. Click Console app button
5. Intercept network request
6. Verify request parameters

**Expected Results:**
- Network request includes:
  - `app=ttyd`
  - `open_to_public=true`
- Network request does NOT include:
  - `port` parameter
  - `allowed_client_ips` parameter (since none provided)

#### 5.3 User launches app with "Open to Public" and client IPs - verify allowed_client_ips parameter

**Steps:**
1. Open app launcher modal
2. Check "Open to Public" checkbox
3. Add allowed client IPs: "192.168.1.10, 10.0.0.5,  172.16.0.100 " (note extra spaces)
4. Click VS Code app button
5. Intercept network request
6. Verify request parameters

**Expected Results:**
- Network request includes:
  - `app=vscode`
  - `open_to_public=true`
  - `allowed_client_ips=192.168.1.10,10.0.0.5,172.16.0.100` (spaces trimmed)
- IPs are comma-separated without spaces
- Trimming is applied correctly using `_.map(allowedClientIps, _.trim).join(',')`

#### 5.4 User launches app with "Preferred Port" - verify port parameter

**Steps:**
1. Open app launcher modal
2. Check "Try Preferred Port" checkbox
3. Enter port: 12345
4. Click Jupyter Notebook app button
5. Intercept network request
6. Verify request parameters

**Expected Results:**
- Network request includes:
  - `app=jupyter`
  - `port=12345`
- Network request does NOT include:
  - `open_to_public` parameter

#### 5.5 User launches app with all advanced options - verify all parameters are present

**Steps:**
1. Open app launcher modal
2. Check "Open to Public" checkbox
3. Add client IPs: "1.2.3.4, 5.6.7.8"
4. Check "Try Preferred Port" checkbox
5. Enter port: 20000
6. Click JupyterLab app button
7. Intercept network request
8. Verify all parameters are present

**Expected Results:**
- Network request includes ALL parameters:
  - `app=jupyterlab`
  - `open_to_public=true`
  - `allowed_client_ips=1.2.3.4,5.6.7.8`
  - `port=20000`
- All parameters are correctly formatted and encoded

#### 5.6 User launches TCP app - verify protocol parameter is included

**Steps:**
1. Open app launcher modal
2. Click SSH/SFTP app button
3. Intercept network request
4. Verify request includes protocol parameter

**Expected Results:**
- Network request includes:
  - `app=sshd`
  - `protocol=tcp`
- TCP-specific parameters are set based on service port info

---

### 6. App Launcher - Progress Notifications

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session

#### 6.1 User sees progress notification with multiple stages during app launch

**Steps:**
1. Open app launcher modal
2. Click Console app button
3. Monitor notification component
4. Verify notification stages appear in sequence

**Expected Results:**
- **Initial stage (0%)**: "Launching Console"
- **Stage 1 (20%)**: "Setting up proxy for Console"
- **Stage 2 (40%)**: "Adding kernel to socket queue"
- **Stage 3 (60%)**: "Adding kernel to socket queue" (connecting stage)
- **Stage 4 (100%)**: "Prepared"
- Notification displays session name as a clickable link
- Clicking session name link navigates to session detail page
- Progress bar shows increasing percentage
- Notification persists until app is fully prepared
- Final notification auto-dismisses after 3 seconds

#### 6.2 User sees error notification when app launch fails

**Prerequisites:**
- Simulate network failure or proxy unavailability

**Steps:**
1. Open app launcher modal
2. Disconnect network or block proxy endpoint (if possible in test environment)
3. Click any app button
4. Wait for error notification

**Expected Results:**
- Notification shows error status (red/error color)
- Error description is displayed (e.g., "Failed to connect to coordinator", "Proxy configurator is not responding")
- Error details are shown in extra description (stack trace or error object)
- Notification duration is 0 (persistent until user dismisses)
- User can manually close error notification

#### 6.3 User can click session name link in notification to navigate to session detail

**Steps:**
1. Open app launcher modal
2. Click Jupyter Notebook app button
3. While notification is visible, click the session name link in notification
4. Verify navigation occurs

**Expected Results:**
- Clicking session name link navigates to `/session?sessionDetail={sessionId}`
- Session detail modal or page opens showing the specific session
- App launch continues in background
- Notification remains visible (or persists based on implementation)

---

### 7. App Launcher - Special App Behaviors

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session

#### 7.1 User sees confirmation modal before launching nniboard app

**Prerequisites:**
- Session has nniboard app available

**Steps:**
1. Open app launcher modal for session with nniboard
2. Click nniboard app button
3. Verify confirmation modal appears

**Expected Results:**
- App launch confirmation modal (`AppLaunchConfirmationModal`) opens
- Modal explains that nniboard needs to run before tunneling
- User can confirm or cancel launch
- If confirmed, app launches with proxy setup
- If cancelled, app does not launch and modal closes

#### 7.2 User sees confirmation modal before launching mlflow-ui app

**Prerequisites:**
- Session has mlflow-ui app available

**Steps:**
1. Open app launcher modal for session with mlflow-ui
2. Click mlflow-ui app button
3. Verify confirmation modal appears

**Expected Results:**
- App launch confirmation modal opens
- Modal explains mlflow-ui requirements
- User can confirm or cancel launch
- Confirmation applies before proxy tunneling begins

#### 7.3 User can launch Tensorboard app and specify log directory path

**Prerequisites:**
- Session has tensorboard app available

**Steps:**
1. Open app launcher modal
2. Click Tensorboard app button
3. Verify Tensorboard path modal opens BEFORE proxy starts
4. Enter valid log directory path (e.g., "/home/work/logs")
5. Submit path
6. Verify proxy starts after path submission

**Expected Results:**
- Tensorboard path modal (`TensorboardPathModal`) opens immediately when app is clicked
- Modal prompts for log directory path
- User can enter path and submit
- Proxy setup begins AFTER path is submitted
- App opens with specified log directory
- If user cancels path modal, app launch is cancelled

---

### 8. App Launcher - Edge Cases and Error Handling

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session

#### 8.1 User cannot launch apps from terminated session

**Steps:**
1. Create a session with Python 3.13 image
2. Terminate the session
3. Attempt to open app launcher modal for terminated session

**Expected Results:**
- App launcher button is disabled or hidden for terminated sessions
- If modal opens, app launch attempts fail with appropriate error
- Error message indicates session is not running

#### 8.2 User sees error when launching app from session without required service port

**Prerequisites:**
- Session without specific app service port configured

**Steps:**
1. Open app launcher modal
2. Attempt to launch app that requires unavailable service port
3. Verify error handling

**Expected Results:**
- App button may be hidden or disabled if service port is not available
- If launch is attempted, error notification appears: "Service port not found for app: {appName}"
- Error is logged but does not crash the application

#### 8.3 User can re-launch app after previous launch completes

**Steps:**
1. Open app launcher modal
2. Launch Console app
3. Wait for app to fully open in new tab
4. Return to app launcher modal (which remains open)
5. Click Console app button again
6. Monitor notification for reuse status

**Expected Results:**
- Second launch detects existing proxy connection (`reuse: true`)
- Notification indicates connection is reused or new connection is established
- App opens in new tab (or reuses existing connection based on implementation)
- No errors occur during re-launch

#### 8.4 User sees error when proxy configurator is not responding

**Prerequisites:**
- Proxy service is down or unreachable

**Steps:**
1. Stop proxy service (if possible in test environment)
2. Open app launcher modal
3. Attempt to launch any app
4. Verify error notification

**Expected Results:**
- Error notification appears with message: "Proxy configurator is not responding."
- Notification includes stage information (e.g., "configuring" or "connecting")
- Notification is persistent (duration: 0)
- User can retry after proxy service is restored

#### 8.5 User can close connection info modal and app launcher modal independently

**Steps:**
1. Open app launcher modal
2. Launch SSH/SFTP app
3. SFTP connection info modal opens
4. Close SFTP connection info modal
5. Verify app launcher modal is still visible
6. Close app launcher modal

**Expected Results:**
- Closing SFTP modal does not close app launcher modal
- App launcher modal remains functional after closing connection info modal
- Closing app launcher modal closes any child modals (if applicable)
- No memory leaks or stale state issues

---

### 9. App Launcher - Debug Mode Features

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session in debug mode

**Prerequisites:**
- `globalThis.backendaiwebui.debug = true` must be enabled
- Requires developer/admin access to enable debug mode

#### 9.1 User can force V1 proxy usage in debug mode

**Steps:**
1. Enable debug mode
2. Open app launcher modal
3. Check "Force Use V1 Proxy" checkbox (visible in debug mode)
4. Click any app button
5. Monitor network request to verify V1 proxy is used

**Expected Results:**
- "Force Use V1 Proxy" checkbox is visible only in debug mode
- Checking this checkbox disables "Force Use V2 Proxy" checkbox
- Network request uses V1 proxy endpoint: `/proxy/{token}/{sessionId}/add`
- Proxy version detection is bypassed

#### 9.2 User can force V2 proxy usage in debug mode

**Steps:**
1. Enable debug mode
2. Open app launcher modal
3. Check "Force Use V2 Proxy" checkbox
4. Click any app button
5. Monitor network request to verify V2 proxy is used

**Expected Results:**
- "Force Use V2 Proxy" checkbox is visible only in debug mode
- Checking this checkbox disables "Force Use V1 Proxy" checkbox
- Network request uses V2 proxy endpoint: `/v2/proxy/{token}/{sessionId}/add`
- V2 proxy uses `computeSession.startService()` API

#### 9.3 User can specify custom subdomain in debug mode

**Steps:**
1. Enable debug mode
2. Open app launcher modal
3. Check "Use Subdomain" checkbox
4. Enter subdomain value: "my-custom-app"
5. Click any app button
6. Monitor network request

**Expected Results:**
- "Use Subdomain" checkbox and input field are visible in debug mode
- Input field is enabled when checkbox is checked
- Network request includes `subdomain=my-custom-app` parameter
- App is accessible via custom subdomain (if supported by backend)

---

### 10. App Launcher - Accessibility and Usability

#### Seed
`e2e/seed.spec.ts` - Start with authenticated user session

#### 10.1 User can navigate app launcher modal using keyboard

**Steps:**
1. Open app launcher modal
2. Use Tab key to navigate through app buttons
3. Use Enter/Space to activate focused app button
4. Use Escape key to close modal

**Expected Results:**
- All app buttons are keyboard-accessible
- Tab order follows logical flow (left-to-right, top-to-bottom)
- Enter or Space key launches app when button is focused
- Escape key closes modal
- Checkboxes and input fields are keyboard-accessible

#### 10.2 User sees loading state during app launch

**Steps:**
1. Open app launcher modal
2. Click any app button
3. Verify button shows loading state

**Expected Results:**
- App button shows loading indicator while app is launching
- Button is disabled during loading to prevent double-clicks
- Loading state persists until notification shows "Prepared" status
- Other app buttons remain clickable during one app's launch

#### 10.3 User can access modal content on different screen sizes

**Steps:**
1. Open app launcher modal on desktop viewport (1920x1080)
2. Verify modal layout is correct
3. Resize viewport to tablet size (768x1024)
4. Verify modal layout adapts
5. Resize viewport to mobile size (375x667)
6. Verify modal layout adapts

**Expected Results:**
- Modal width is fixed at 450px (does not exceed viewport width)
- Modal is scrollable if content exceeds viewport height
- App grid adapts to smaller screens (may show fewer columns)
- All interactive elements remain accessible
- Modal is centered on screen at all viewport sizes

---

## Test Environment Setup

### Prerequisites

1. **Backend.AI Cluster**
   - Full Backend.AI cluster must be running
   - Proxy service (wsproxy) must be available
   - V1 and/or V2 proxy versions configured

2. **Test User Account**
   - User with session creation permissions
   - Access to Python 3.13 image: `cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64`

3. **Configuration**
   - Enable `openPortToPublic: true` in config.toml (for public access tests)
   - Enable `allowPreferredPort: true` in config.toml (for preferred port tests)
   - Optional: Enable debug mode for debug feature tests

4. **Test Session**
   - Create or use existing session with Python 3.13 image
   - Session must be in "Running" status
   - Session should have standard service ports enabled (jupyter, jupyterlab, vscode, ttyd, sshd)

### Test Data

- **Session Name**: `e2e-test-app-launcher-{timestamp}`
- **Image**: `cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64`
- **Resource Preset**: "minimum" or equivalent
- **Resource Group**: "default"

### Network Monitoring

Use Playwright's network interception capabilities to:
1. Capture all requests to proxy endpoints
2. Verify request parameters (app, port, open_to_public, allowed_client_ips)
3. Verify request methods (GET/POST)
4. Verify response status codes
5. Validate WebSocket connections (if applicable)

### Browser Requirements

- **Browsers**: Chromium, Firefox, WebKit (via Playwright)
- **Non-Electron Environment**: Required for "Open to Public" and "Preferred Port" tests
- **Electron Environment**: Required for Electron-specific TCP connection tests

---

## Success Criteria

### Functional Requirements

- [ ] All 6 supported apps (SSH/SFTP, Console, Jupyter, JupyterLab, VS Code, VS Code Desktop) launch successfully
- [ ] Connection info modals display correct connection details
- [ ] "Open to Public" option sends `open_to_public=true` parameter
- [ ] "Preferred Port" option sends `port={number}` parameter
- [ ] Allowed client IPs are properly trimmed and formatted
- [ ] Combined advanced options work correctly
- [ ] Progress notifications show all stages correctly
- [ ] Error notifications display appropriate error messages

### Network Verification

- [ ] `app_name` parameter is present in all proxy requests
- [ ] `open_to_public` parameter is present only when checkbox is checked
- [ ] `port` parameter is present only when preferred port is specified
- [ ] `allowed_client_ips` parameter is formatted correctly (comma-separated, trimmed)
- [ ] All parameter values are properly URL-encoded

### User Experience

- [ ] Modal opens and closes smoothly
- [ ] App buttons respond immediately
- [ ] Loading states provide feedback
- [ ] Notifications are informative and actionable
- [ ] Error messages are clear and helpful
- [ ] Keyboard navigation works correctly

### Edge Cases

- [ ] Invalid port numbers trigger validation errors
- [ ] Terminated sessions prevent app launches
- [ ] Missing service ports are handled gracefully
- [ ] Proxy failures show appropriate errors
- [ ] Re-launching apps works without issues

---

## Known Limitations

1. **Electron Environment**: Some tests require non-Electron environment (web browser) due to configuration restrictions
2. **Proxy Version**: Tests may behave differently between V1 and V2 proxy implementations
3. **Network Conditions**: Some error scenarios require simulated network failures
4. **Service Port Availability**: Not all images support all apps; Python 3.13 image is used for consistency
5. **Debug Mode**: Debug features require manual enablement and are not available to regular users

---

## Test Execution Notes

### Execution Order

Tests should be executed in the following order:
1. Basic Interaction (Section 1)
2. Basic App Launch (Section 2)
3. Connection Info Modals (Section 4)
4. Advanced Options (Section 3)
5. Network Request Verification (Section 5)
6. Progress Notifications (Section 6)
7. Special App Behaviors (Section 7)
8. Edge Cases (Section 8)
9. Debug Mode Features (Section 9)
10. Accessibility and Usability (Section 10)

### Cleanup

After each test:
- Close all opened browser tabs
- Close all modals
- Reset form state (checkboxes and input fields)
- Verify no memory leaks

After test suite:
- Terminate test sessions
- Clear browser storage
- Verify no lingering proxy connections

---

## Appendix: Data Attributes Reference

### App Launcher Modal

```typescript
// Main modal
data-testid="app-launcher-modal"

// Category sections
data-testid="category-{categoryName}"
// Example: data-testid="category-Custom"

// App buttons (containers)
data-testid="app-{appName}"
// Examples:
// - data-testid="app-ttyd"
// - data-testid="app-jupyter"
// - data-testid="app-jupyterlab"
// - data-testid="app-vscode"
// - data-testid="app-sshd"
// - data-testid="app-vscode-desktop"
```

### Form Controls

```typescript
// Open to Public
<Checkbox> {t('session.OpenToPublic')} </Checkbox>
<BAISelect name="clientIps" mode="tags" />

// Preferred Port
<Checkbox> {t('session.TryPreferredPort')} </Checkbox>
<InputNumber name="preferredPort" />

// Debug Options (visible only when globalThis.backendaiwebui.debug = true)
<Checkbox name="forceUseV1Proxy"> {t('session.ForceUseV1Proxy')} </Checkbox>
<Checkbox name="forceUseV2Proxy"> {t('session.ForceUseV2Proxy')} </Checkbox>
<Checkbox> {t('session.UseSubdomain')} </Checkbox>
<Input name="subDomain" />
```

---

**Last Updated**: 2026-01-08
**Test Plan Version**: 1.0
**Target Release**: Backend.AI WebUI v24.09 and later
