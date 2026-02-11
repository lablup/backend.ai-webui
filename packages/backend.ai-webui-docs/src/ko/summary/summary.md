This feature is deprecated, so please use the [dashboard<dashboard>](#dashboard<dashboard>) page going forward. Also, technical support
   and bug fixes for this feature are no longer provided. Please understand that issues may not be addressed.

# 요약 페이지

요약 페이지에서는 사용자의 자원 사용 상태 및 연산 세션 사용량을 확인할 수 있습니다.

![](images/summary.png)

### 자원 사용량

사용자가 할당 가능한 총 자원의 양과 현재 할당받아 점유 중인 자원의 양을 보여 줍니다. 사용자의 CPU, 메모리, GPU 자원 점유량 및 할당량을 각각 확인할 수 있습니다. 또한, 세션 (Sessions) 슬라이더에서 사용자가 동시에 생성 가능한 연산 세션의 수 및 현재 작동 중인 연산 세션의 수를 확인할 수 있습니다.

상단의 Resource Group 필드를 클릭하여 자원 그룹을 변경할 수 있습니다. 자원 그룹은 다수의 Agent 노드가 있을 때, Agent 의 일부를 묶어 하나의 워커 노드 그룹으로 설정할 수 있는 기능입니다. 다양한 Agent 노드를 보유하고 있는 경우, 각 자원 그룹 별로 특정 사용자 그룹에 독점 할당하는 등의 설정이 가능합니다. Agent 노드가 한 대인 경우에는 하나의 자원 그룹만 보이는 것이 보통입니다. 자원 그룹을 변경하면, 해당 자원의 자원 보유량에 따라 자원량이 변할 수 있습니다.

### 시스템 자원

Backend.AI 시스템에 연결된 Agent 워커 노드의 수와 현재 생성되어 있는 전체 연산 세션의 수를 보여 줍니다. Agent 노드의 CPU, 메모리, GPU 실제 사용량 (utilization) 도 확인할 수 있습니다. 일반 사용자로 로그인한 경우에는 자신이 생성한 연산 세션의 숫자만 표시됩니다.

### 초대

다른 사용자가 저장 폴더를 공유한 경우 여기에 표시됩니다. 공유 요청을 수락하면 데이터 및 폴더 폴더에서 공유 받은 폴더를 조회하고 접근할 수 있습니다. 접근 권한은 공유한 사용자가 지정한 설정에 따릅니다. 물론, 공유 요청을 거절할 수도 있습니다.

### Backend.AI WebUI 앱 다운로드

Backend.AI WebUI supports desktop applications.
By using desktop app, you can use desktop app specific features, such as [SSH/SFTP connection to a Compute Session<ssh-sftp-container>](#SSH/SFTP connection to a Compute Session<ssh-sftp-container>) .
For now Backend.AI WebUI provides desktop application with following OS:

- Windows
- Linux
- Mac


   When you click the button that match with your local environment (e.g. OS, Architecture), It will automatically downloads the same version of current webUI version.
   If you want to download later or former version of WebUI as a desktop app, please visit [here](https://github.com/lablup/backend.ai-webui/releases?page=1) and download the desired version(s).