# 연산 세션

Backend.AI WebUI 에서 가장 많이 방문하게 될 페이지는 세션 페이지와 데이터 페이지입니다. 세션 페이지에서는 컨테이너 기반의 연산 세션을 조회하거나 생성 및 사용할 수 있고, 데이터 페이지에서는 데이터를 보관하는 저장 폴더를 생성할 수 있습니다. 여기서는 세션 페이지에서 컨테이너 기반의 연산 세션을 생성하고 각종 웹 애플리케이션을 활용하는 방법을 알아봅니다.

## 새로운 세션 시작하기


사용자 계정으로 로그인 후 좌측 메뉴의 '세션'을 클릭하여 세션 페이지로 이동합니다. '세션 페이지'는 새로운 연산 세션을 시작하거나 이미 실행 중인 연산 세션을 관리할 때 사용할 수 있습니다.

![](images/sessions_page.png)


새로운 연산 세션을 시작하려면 '시작' 버튼을 클릭하세요.

![](images/launch_session_type.png)

### 세션 타입

첫 번째 페이지에서는 세션의 형태인 interactive 또는 batch를 선택해야 합니다. 그리고 세션 이름을 지정할 수 있습니다. (선택사항)


- 세션 타입: 세션의 형태를 결정합니다. 현재 가능한 세션 형태는 “Interactive” 와 “Batch” 두 가지가 있습니다. 두 형태의 주요한 차이점은 다음과 같습니다:

  - Interactive 형태 연산 세션

    - Backend.AI 초기 버전부터 지원하던 형태입니다.
    - 사용자가 별도의 실행 스크립트를 지정하지 않고 일단 세션을 생성한 후 상호 작용하는 방식으로 세션을 사용하게 됩니다.
    - 사용자가 명시적으로 삭제하지 않는 한 세션은 자동 삭제되지 않습니다. 다만, 관리자가 별도의 세션 자동 수거 설정을 켜둔 경우에는, 그 조건에 따라 자동으로 삭제될 수도 있습니다.

  - Batch 형태 연산 세션

    - This type of session is supported via GUI from Backend.AI 22.03 (CLI has
      supported the batch-type session before the 22.03).
    - 사용자가 연산 세션을 생성할 때 실행할 스크립트를 미리 지정합니다.
    - 자원이 할당되는 즉시 해당 스크립트를 실행하고, 스크립트가 종료되는 그 즉시 연산 세션을 자동으로 삭제합니다. 따라서, 실행할 코드가 사전에 정의되어 있거나 작업을 파이프라이닝 하는 경우에는, 연산 서버 팜(server farm)의 자원을 보다 효율적으로 활용할 수 있는 장점이 있습니다.
    - 연산 세션 시작 시점을 지정할 수 있습니다. 다만, 시작 시점에 반드시 연산 세션이 자원을 할당받을 수 있는 것은 아닙니다(자원 부족 등의 이유로 PENDING 상태에 계속 머물 수 있습니다). 시작 시점 이전에는 자원이 있어도 연산 세션을 스케줄링 하지 않는 개념으로 이해하는 것이 정확합니다.
    - 배치 작업 최대 실행 시간: 배치 작업의 최대 실행 시간을 설정합니다. 지정된 시간이 초과되면 세션이 자동으로 종료됩니다.

    ![](images/session_type_batch.png)

- 세션 이름 (선택사항): 생성할 연산 세션의 이름을 지정할 수 있습니다. 지정하면 세션 정보에 이 이름이 나타나므로 연산 세션의 구분이 용이합니다. 지정하지 않으면 임의의 이름이 자동으로 지정됩니다. 세션 이름은 4-64자 사이의 알파벳 또는 숫자만 받아들이며, 공백은 허용되지 않습니다.

If 일반 사용자s create a session with the `super admin` or `admin` account,
they can additionally assign a session owner. If you enable the toggle,
a 일반 사용자 email field will appear.

   ![](images/admin_launch_session_owner.png)

세션 할당을 위한 사용자 이메일을 입력하고 '검색' 버튼을 클릭하면, 해당 사용자의 access key가 자동으로 등록됩니다. 추가적으로 프로젝트와 자원 그룹을 선택해 할당할 수 있습니다.

   ![](images/admin_launch_session_owner_project.png)

### 실행 환경 및 자원 할당


다음 페이지로 진행하려면 아래쪽의 '다음' 버튼을 클릭하거나, 우측의 '실행 환경 & 자원 할당' 버튼을 클릭하십시오. 추가 설정 없이 세션을 생성하려면 '검토로 건너뛰기' 버튼을 누르십시오. 이 경우, 다른 페이지의 설정은 모두 기본값을 사용하게 됩니다.

  ![](images/launch_session_environments_and_resource.png)

### 실행 환경


두 번째 페이지에서 설정할 수 있는 각 항목에 대한 자세한 설명은 다음을 참고하십시오.

- 실행 환경: TensorFlow, PyTorch, C++ 등과 같은 연산 세션의 기본 환경을 지정합니다. TensorFlow를 선택하면 연산 세션에서 TensorFlow 라이브러리를 사용할 수 있습니다. 다른 환경을 선택하면 해당 환경이 기본적으로 설치된 연산 세션을 생성하게 됩니다.
- Version: Users can specify the version of the environment.
  There are multiple versions in a single environment. For example, TensorFlow has multiple versions such as 1.15, 2.3, etc.,
- 환경 이름 (선택사항): 연산 세션에 사용할 이미지의 이름을 지정할 수 있습니다. 환경 설정에 따라 이 설정이 사용 불가능할 수도 있습니다.
- Set Environment Variable: To give more convenient workspace for 일반 사용자s, Backend.AI supports environment variable setting
  in session launching. In this feature, 일반 사용자s can add any envs such as `PATH` by filling out
  variable name and value in environment configuration dialog.

  ![](images/launch_session_environments.png)

### 자원 할당


- 자원 그룹: 연산 세션을 생성할 자원 그룹을 지정합니다. 자원 그룹은 각 사용자가 접근할 수 있는 호스트 서버를 묶은 단위이며, 주로 같은 종류의 GPU 자원을 보유하고 있는 서버들을 하나의 자원 그룹으로 설정합니다. 관리자는 서버를 종류별로 구분하여 자원 그룹으로 묶고, 사용자가 사용할 수 있는 자원 그룹의 종류를 지정할 수 있습니다. 사용자는 관리자가 허가한 자원 그룹 서버에만 연산 세션을 생성할 수 있습니다. 자원 그룹이 여러 개인 경우 원하는 그룹을 선택할 수 있지만, 하나만 있는 경우에는 변경할 수 없습니다.
- 자원 프리셋: 이 템플릿은 연산 세션에 할당할 CPU, 메모리, GPU 등의 자원 세트를 미리 정의해 둔 것입니다. 관리자는 미리 자주 사용하는 자원 설정을 정의할 수 있습니다. 숫자 입력을 조정하거나 슬라이더를 움직이면 원하는 자원량을 할당할 수 있습니다.

  ![](images/launch_session_resource.png)

  각 항목의 의미는 다음과 같습니다. '도움 (?)' 버튼을 클릭하면 자세한 정보를 확인할 수 있습니다.

  * CPU: CPU는 명령어로 지정된 기본 산술, 논리, 제어 및 입출력 (I/O) 작업을 수행합니다. 고성능 컴퓨팅 워크로드의 경우 많은 CPU가 도움이 되지만, 여러 CPU를 사용하도록 프로그램 코드를 작성해야 합니다. (그렇지 않으면 대부분의 CPU는 사용되지 않을 것입니다.)
  * 컴퓨터 메모리는 임시 저장 영역입니다. 중앙 처리 장치 (CPU)에 필요한 데이터와 명령들을 보관하는 역할을 합니다.머신 러닝 워크로드를 처리할 때 GPU를 연산 장치로 사용하는 경우, GPU 메모리의 두 배 이상의 메모리를 할당해야 합니다. 그렇지 않으면 GPU의 유휴 시간이 증가하여 성능이 저하됩니다.
  * 공유 메모리: 연산 세션에 할당할 공유 메모리의 용량 (GB). RAM에 설정된 메모리 중 일부를 떼어 공유 메모리로 사용합니다. 따라서, RAM에 지정된 양보다 클 수 없습니다.
  * AI 가속기: AI 가속기 (GPU 및 NPU)는 기계 학습과 관련된 행렬 / 벡터 계산에 적합합니다. AI 가속기는 훈련 및 인퍼런스 알고리즘을 몇 배나 가속화하여 기계 학습 워크로드의 실행 시간을 몇 주에서 며칠로 줄입니다.
  * 세션은 지정된 환경과 자원에 따라 생성되는 계산 환경 단위입니다. 이 값을 1보다 큰 값으로 설정하면 위의 자원 설정을 이용한 여러 세션이 지정한 값만큼 동시에 생성됩니다. 세션 시작 요청 시 사용 가능한 자원이 충분하지 않은 경우, 생성하지 못한 세션 시작 요청들은 생성 대기열에 추가됩니다.

  ![](images/launce_session_resource_2.png)

  * 에이전트 선택: 사용자는 할당할 에이전트를 직접 선택할 수 있습니다. 기본적으로는 스케줄러가 에이전트를 자동으로 선택합니다. 에이전트 선택기에서는 각 에이전트의 실제 사용 가능한 자원 양을 확인할 수 있습니다. 현재 이 기능은 단일 노드, 단일 컨테이너 환경에서만 지원됩니다.
  * Cluster mode: Cluster mode allows 일반 사용자s to create
    multiple compute sessions at once. For more information, refer to the
    [Overview of Backend.AI cluster compute session<backendai-cluster-compute-session>](#Overview of Backend.AI cluster compute session<backendai-cluster-compute-session>).

  .. note::
     에이전트 선택 기능은 서버 환경에 따라 표시되지 않을 수 있습니다.

- 고성능 컴퓨팅 최적화: Backend.AI 는 HPC 최적화 관련 값을 설정할 수 있습니다.

  Backend.AI provides configuration UI for internal control variable in `nthreads-var`.
  Backend.AI sets this value equal to the number of session's CPU cores by default,
  which has the effect of accelerating typical high-performance computing workloads.
  Nevertheless, for some multi-thread workloads, multiple processes using OpenMP are used at same time,
  resulting in an abnormally large number of threads and significant performance degradation.
  To resolve this issue, setting the number of threads to 1 or 2 would work.

![](images/session_hpc_optimization.png)

### 데이터 및 폴더


다음 페이지로 진행하려면 아래쪽의 '다음' 버튼을 클릭하거나, 우측의 '데이터 & 폴더' 버튼을 클릭하세요.

When a compute session is destroyed, data deletion is set to default.
However, data stored in the mounted folders will survive.
데이터 (Data) in those folders can also be reused by mounting it when creating another compute session.
For further information on how to mount a folder and run a compute session, refer to
[Mounting Folders to a Compute Session<session-mounts>](#Mounting Folders to a Compute Session<session-mounts>).

![](images/launch_session_data.png)

일반 사용자s can specify the data folders to mount in the compute session.
Folder explorer can be used by clicking folder name. For further information,
please refer [Explore Folder<explore_folder>](#Explore Folder<explore_folder>) section.

![](images/folder_explorer.png)

New folder can be created by clicking the '+' button next to the search box.
When new folder is created, it will automatically be selected as the folder to mount.
For further information, please refer [Create Storage Folder<create_storage_folder>](#Create Storage Folder<create_storage_folder>) section.

![](images/folder_create_modal.png)

### 네트워크

다음 페이지로 진행하려면 아래쪽의 '다음' 버튼을 클릭하거나, 우측의 '네트워크' 버튼을 클릭하세요.

- Set Preopen Ports: Provides an interface for 일반 사용자s to set preopen ports in a
  compute session. Refer to the [How to add preopen ports before session creation
  <set_preopen_ports>](#How to add preopen ports before session creation
  <set_preopen_ports>) for further information.


![](images/launch_session_network.png)

### 검토 및 시작


네트워크 설정을 완료했다면, 아래쪽의 '다음' 버튼을 클릭하거나, 우측의 '검토 및 시작' 버튼을 클릭하여 마지막 페이지로 이동합니다.

마지막 페이지에 도착했습니다. 이전 페이지에서 설정한 연산 세션 환경, 자원 할당량과 마운트 정보, 설정된 환경변수, 사전 개방 포트 등의 정보를 볼 수 있습니다. 원하는 설정인지 마지막으로 확인한 후 '시작' 버튼을 클릭합니다. 만약, 변경하고 싶은 설정이 있다면 '이전' 버튼을 클릭하여 이전 페이지로 돌아갈 수 있습니다. 혹은, 각 카드 우측 상단에 있는 '수정' 버튼을 눌러 해당 페이지로 돌아갈 수 있습니다.

![](images/launch_session_confirm.png)

설정에 문제가 있는 경우, 다음과 같이 오류가 표시됩니다. 설정을 수정하려면 '수정' 버튼을 클릭하십시오.

![](images/launch_session_error_card.png)

폴더 마운트 없이 시작 버튼을 클릭하면, 아무 폴더를 마운트하지 않았다는 경고 대화 상자가 나타납니다. 폴더를 마운트할 필요가 없는 경우, 경고 대화 상자의 '시작' 버튼을 클릭하여 세션을 생성합니다.

![](images/no_folder_notification_dialog.png)

새로운 연산 세션이 **실행 중** 탭에 추가되면, 화면 우측 하단에 알림이 나타납니다. 알림의 좌측 하단 영역에는 세션 상태가 표시되고, 우측 하단 영역에는 앱 대화 상자 열기, 터미널 실행, 컨테이너 로그 보기, 세션 종료 버튼이 포함되어 있습니다. 헤더의 **알림** 을 클릭하여 이 세션 생성 알림을 다시 볼 수도 있습니다.

![](images/session_created.png)


![](images/session_notification.png)

가장 왼쪽에 있는 앱 대화 상자 버튼을 클릭하면, 사용 가능한 앱 서비스를 확인할 수 있습니다.

![](images/app_dialog.png)


### 최근 기록


'Session Launcher' page provides a set of options for creating sessions. As of 24.09,
`Recent History` feature has been added to remember information about previously created sessions.

![](images/recent_history.png)

![](images/recent_history_modal.png)

The `Recent History` modal stores information about the five most recently created sessions.
Clicking a session name takes you to the '검토 및 시작' page, which is the final step of session creation.
Each item can be renamed or pinned for easier access.


   수퍼어드민의 경우 현재 클러스터에서 실행 중인 (또는 종료된) 모든 세션 정보를 확인할 수 있고, 일반 사용자의 경우에는 자신이 사용한 세션만 조회 가능합니다.


   간헐적인 네트워크 접속 불량 등의 문제로 세션 리스트가 정상적으로 표시되지 않는 경우가 발생할 수 있습니다. 이 때는 브라우저 페이지를 새로고침하면 해결할 수 있습니다.

## 세션 상세 정보 패널

세션에 대한 상세 정보를 확인하려면, 세션 리스트의 세션명을 클릭하십시오. 세션 상세 정보 패널에는 세션 ID, 사용자 ID, 상태, 타입, 실행 환경, 마운트 정보, 자원 할당량, 예약된 시간, 경과 시간, 에이전트, 클러스터 모드, 네트워크 I/O 를 포함한 자원 사용량, 커널 정보 등이 표시됩니다.

'커널' 섹션의 '호스트명' 옆에 있는 '로그' 버튼을 클릭하면 해당 커널의 로그를 직접 확인할 수 있습니다.

![](images/session_detail.png)

Backend.AI provides additional information for sessions in `PENDING`, `TERMINATED`, or `CANCELLED` states.
Click the 'Info' button to check the details when available.


## Jupyter Notebook 사용하기

이미 실행 중인 연산 세션을 어떻게 사용하고 관리하는지 살펴봅시다. 세션 상세 정보 패널 우측 상단의 첫 번째 아이콘을 클릭하여 앱 런처를 열면 해당 세션에서 사용할 수 있는 앱 서비스가 표시됩니다.

![](images/app_dialog.png)


   앱 아이콘 아래에는 두 가지 체크 옵션이 있습니다. 각 항목을 체크하고 앱을 띄우면 다음과 같은 기능이 반영됩니다:

   * 앱을 외부에 공개 : 앱을 외부에 공개합니다. 기본적으로 터미널 및 Jupyter Notebook 서비스와 같은 웹 서비스는 별도 인증을 거치므로 서비스 URL을 알고 있더라도 다른 사용자가 액세스 할 수 없습니다. 그러나 이 옵션을 선택하면 서비스 URL(및 포트 번호)을 아는 사람이 접근하고 사용할 수 있습니다. 물론 사용자가 서비스에 접근하려면 네트워크 경로가 있어야합니다.
   * 선호 포트: 이 옵션을 선택하지 않으면 Backend.AI에서 미리 준비한 포트 풀에서 웹 서비스의 포트 번호가 무작위로 할당됩니다. 이 항목을 체크하고 특정 포트 번호를 입력하면 입력한 포트 번호를 먼저 시도합니다. 그러나 포트가 포트 풀에 존재하지 않거나 다른 서비스가 이미 포트를 사용 중일 수 있기 때문에 원하는 포트가 항상 할당된다는 보장은 없습니다. 이 경우 포트 번호는 임의로 할당됩니다.

   시스템 설정에 따라, 이 옵션들은 보이지 않을 수도 있습니다.

Jupyter Notebook 을 클릭해봅시다.

![](images/jupyter_app.png)

새로운 창이 뜨면서 Jupyter Notebook 이 실행되는 것을 확인할 수 있습니다. 이 Notebook 은 실행 중인 연산 세션 내부에서 생성된 것으로, 별다른 설정 없이 버튼 클릭만으로 손쉽게 사 용할 수 있습니다. 또한, 연산 세션이 기본적으로 제공하는 언어 환경 및 라이브러리를 그대로 활용할 수 있어 별도의 패키지 설치 과정이 필요 없습니다. 자세한 Jupyter Notebook 사용 법은 공식 문서 등을 참고하시기 바랍니다.

`id_container file` in the notebook's file explorer, contains a private
SSH key. If necessary, 일반 사용자s can download it and use it for SSH / SFTP access to
the container.

우측 상단의 NEW 버튼을 클릭한 후 Backend.AI 용 Notebook 을 선택하면 새로운 코드를 입력할 수 있는 ipynb 창이 뜹니다.

![](images/backendai_notebook_menu.png)

이 창에서 세션 환경에 맞는 코드를 입력하고 실행해볼 수 있습니다. 코드는 Backend.AI 서버를 구성하는 노드 중 연산 세션이 실제로 생성된 노드에서 실행이 되며, 로컬 머신에는 별도 환경을 구성할 필요가 없습니다.

![](images/notebook_code_execution.png)

When window is closed, `Untitled.ipynb` file can be founded in the notebook file explorer.
Note that the files created here are deleted when session is terminated. The way to preserve those files even
after the session is terminated is described in the 데이터 및 폴더 폴더 section.

![](images/untitled_ipynb_created.png)


## 웹 터미널 활용

This section will explain how to use the web terminal. Click the
terminal icon(second button) to use the container's ttyd app. A terminal will appear in a new window
and 일반 사용자s can run shell commands to access the computational session as shown in the following figure.
If familiar with the commands, 일반 사용자s can easily run various Linux commands. `Untitled.ipynb` file
can be found in Jupyter Notebook, which is listed with the `ls` command. This shows that both apps
are running in the same container environment.

![](images/session_terminal.png)

만약 여기서 파일을 만들면 앞서 띄운 Jupyter Notebook 에서 즉시 그 파일을 확인할 수 있 습니다. 반대로, Jupyter Notebook 에서 편집한 파일의 변경 사항도 터미널에서 바로 확인할 수 있습니다. 같은 연산 세션을 사용하고 있기 때문입니다.

이 외에도 연산 세션이 제공하는 서비스의 종류에 따라 TensorBoard, Jupyter Lab 등과 같은 웹 기반 서비스를 이용할 수 있습니다.


## 연산 세션 로그 조회

돌아가고 있는 연산 세션의 Control 열의 마지막 아이콘을 클릭하면 연산 세션의 로그를 조회할 수 있습니다.

![](images/session_log.png)

## 실행중인 세션 이름 변경하기

Name of the active session can be changed. Click the 'Edit' button in the session detail
panel to change the session name.
New session name should also follow the [the authoring rule<session-naming-rule>](#the authoring rule<session-naming-rule>).

![](images/session_renaming.png)


## 연산 세션 삭제하기

특정 세션을 종료하려면 빨간색 전원 버튼을 클릭한 후 대화 상자에서 '종료' 버튼을 클릭하십시오. 연산 세션이 종료되면 연산 세션 내부의 폴더에 있는 데이터가 함께 삭제되므로, 데이터를 마운트된 폴더로 옮기거나 처음부터 마운트된 폴더에 업로드하는 것을 권장합니다.

![](images/session_destroy_dialog.png)

## 유휴 상태 검사

Backend.AI는 최대 세션 수명 시간, 네트워크 트래픽 기반 유휴 시간, 사용량 기반 자원 수거를 기준으로 세션이 자동으로 삭제될 수 있습니다.

세션 종료 기준은 세션 상세 정보 패널의 '유휴 상태 검사' 섹션에서 확인할 수 있습니다.

![](images/idle_checks_column.png)

각 항목의 의미는 다음과 같으며, 우측의 정보(i) 버튼을 클릭해서 자세한 설명을 확인할 수도 있습니다.

- 최대 세션 수명 시간: 세션 생성 후 이 시간이 지나면 세션을 강제 종료합니다. 이는 세션이 무한히 실행되는 것을 방지하기 위한 조치입니다.
- 네트워크 트래픽 기반 유휴 시간: 사용자(브라우저)와 연산 세션 사이에 이 시간 동안 아무런 네트워크 트래픽이 없을 경우 연산 세션을 삭제합니다. 사용자와 연산 세션 사이의 트래픽은 앱 (터미널, Jupyter 등)을 통해 상호작용(키보드 입력, Jupyter 셀 생성 등) 하는 경우 지속적으로 발생합니다. 만약, 연산 세션을 띄운 채 일정 시간 동안 아무런 입력을 하지 않으면 자동 삭제 조건을 만족하게 됩니다. 연산 세션에서 작업을 수행 중인 프로세스가 있더라도, 사용자와의 상호작용이 없는 경우에는 삭제 대상입니다.
- 사용량 기반 자원 수거: 연산 세션에 할당된 자원을 자원의 활용률을 기준으로 회수합니다. 연산 세션의 삭제 여부는 다음 두 가지 요소에 따라 결정됩니다:

  - 유예 기간: 이 기간 동안은 자원 사용량 기반 체커가 작동하지 않습니다. 즉, 유예 기간이 지나기 전까지는 사용량이 기준보다 낮더라도 연산 세션이 삭제되지 않습니다. 하지만 유예 기간이 지나고 나면, 설정된 유휴 시간(idle timeout) 동안의 평균 자원 사용률이 기준에 미치지 못하는 경우 해당 세션이 삭제될 수 있습니다. 유예 기간은 세션 종료가 이루어지지 않는 것을 보장하는 시간일 뿐입니다. 이는 주로 사용률이 낮은 GPU 자원을 효율적으로 관리하기 위한 조치입니다.
  - 자원 사용량 기준: 연산 세션의 자원 사용량이 일정 시간(idle timeout) 동안 설정된 기준값을 넘지 못하면, 해당 세션은 자동으로 삭제됩니다. 예를 들어, 가속 장치 사용률 기준을 1%로 설정했다면 idle timeout 시간 동안 평균 가속 장치 사용률이 1% 미만인 연산 세션은 삭제 대상이 됩니다. 값이 설정되지 않는 자원은 자동 삭제 기준에서 제외됩니다.

   .. note::
      유예 기간이 지난 후에는 사용량이 낮으면 언제든지 삭제될 수 있습니다. 자원을 잠깐 사용했다고 해서 유예 기간이 연장되지 않습니다. 오직 현 시점으로부터 지난 idle timeout 시간 동안의 평균 자원 사용률만이 고려됩니다.

사용량 기반 자원 수거에 마우스를 가져가면, 사용률과 수거 기준값을 보여주는 툴팁이 나타납니다. 현재 사용률이 수거 기준값에 접근할수록(사용량이 저조할수록) 글자 색이 노란색, 빨간색 순으로 변하게 됩니다.


   환경 설정 값에 따라, 유휴 상태 검사 기준과 사용량 기반 자원 수거 툴팁에 나타나는 자원 항목이 다르게 보일 수 있습니다.


## 세션 생성하기 전에 환경 변수를 추가하는 방법

To give more convenient workspace for 일반 사용자s, Backend.AI supports environment variable setting
in session launching. In this feature, 일반 사용자s can add any envs such as `PATH` by filling out
variable name and value in environment configuration dialog.

더 많은 환경 변수를 추가하고 싶을 경우, 입력 필드 첫번째 행의 오른쪽에 있는 '+ Add environment variables' 버튼을 클릭하면 됩니다. 또한 환경 변수를 지우고 싶을 경우, 역시 지우고자 하는 행의 '-' 버튼을 클릭하면 됩니다.

![](images/launch_session_env.png)

환경 변수 명과 값을 같은 행의 입력 필드에 입력할 수 있습니다.


## 세션 생성하기 전에 사전 개방 포트를 추가하는 방법

Backend.AI는 컨테이너 시작 전 사전 개방 포트를 설정하는 것을 지원합니다. 이 기능을 사용하면, 서빙 포트를 노출하기 위해 별도의 이미지를 추가로 빌드할 필요가 없습니다.

사전 개방 포트를 추가하려면 쉼표(,)나 공백으로 구분하여 여러 값을 입력할 수 있습니다.

![](images/preopen-ports-config.png)

해당 다이얼로그에서 사전 개방 포트를 추가하거나, 작성한 사전 개방 포트를 갱신, 삭제할 수 있습니다. 더욱 자세한 설명이 필요한 경우, 다이얼로그 헤더 부분에 있는 '도움말 (?)' 버튼을 클릭해주세요.

입력란에 1024 ~ 65535 사이의 포트값을 입력한 뒤, 엔터 키를 누르세요. 각 포트는 쉼표(,)로 구분되며, 여러 포트를 설정할 수 있습니다. 설정된 사전 개방 포트값은 세션 앱 런처에서 확인할 수 있습니다.

![](images/session_app_launcher.png)


   사전 개방 포트는 **컨테이너 내부 포트** 입니다. 따라서, 다른 앱들과 달리 세션 앱 런처에서 사전 개방 포트를 클릭하면 빈 페이지가 나타납니다.


## 세션 커밋 저장하기


Backend.AI supports \"Convert Session to Image\" feature from 24.03. Committing a `RUNNING` session will save the
current state of the session as a new image. Click the 'Commit' button (the fourth icon) in the session detail panel
to open a dialog displaying the session information. After entering the session name, 일반 사용자s can convert the session to
a new image. The session name must be 4 to 32 characters long and can only contain alphanumeric letters, hyphens (`-`),
or underscores (`_`).

![](images/push_session_to_customized_image.png)

After filling out session name in the input field, click the 'PUSH SESSION TO CUSTOMIZED IMAGE' button.
The customized image created in this way can be used in future session creations. However, directories
mounted to the container for image commits are considered external resources and are not included in
the final image. Remember that `/home/work` is a mount folder (scratch directory), so it is not included.


   Currently, Backend.AI supports "Convert Session to Image" only when the session is in `INTERACTIVE` mode.
   To prevent unexpected error, 일반 사용자s may not be able to terminate the session during committing process.
   To stop the ongoing process, check the session, and force-terminate it.


   The number of times to "Convert Session to Image" may be limited by the 일반 사용자 resource policy. In this case,
   [remove the existing customized image<delete-customized-image>](#remove the existing customized image<delete-customized-image>) and try again. If this does not resolves
   the problem, please contact the 어드민istrator.


## 진행 중인 세션의 변환된 이미지 활용

Converting an ongoing session into an image allows 일반 사용자s to select this image from the environments in the session launcher
when creating a new session. This image is not exposed to other 일반 사용자s and is useful for continuing to use the current session
state as is. The converted image is tagged with `Customized<session name>`.

![](images/select_customized_image.png)

향후 세션 생성을 위해 환경 이름을 수동으로 입력하려면, 복사 아이콘을 누릅니다.

![](images/copy_customized_image.png)


## 웹 터미널 고급 사용법

The web-based terminal internally embeds a utility called
[tmux](https://github.com/tmux/tmux/wiki). tmux is a terminal multiplexer that
supports to open multiple shell windows within a single shell, so as to allow
multiple programs to run in foreground simultaneously. If 일반 사용자s want to take
advantage of more powerful tmux features, they can refer to the official tmux
documentation and other usage examples on the Internet.

여기서는 몇 가지 간단하지만 유용한 기능을 소개하겠습니다.

### 터미널 내용 복사하기

tmux offers a number of useful features, but it's a bit confusing for first-time
일반 사용자s. In particular, tmux has its own clipboard buffer, so when copying the
contents of the terminal, 일반 사용자s can suffer from the fact that it can be pasted
only within tmux by default. Furthermore, it is difficult to expose 일반 사용자
system's clipboard to tmux inside web browser, so the terminal
contents cannot be copied and pasted to other programs of 일반 사용자's computer. The
so-called `Ctrl-C` / `Ctrl-V` is not working with tmux.

If copy and paste of terminal contents is needed to system's clipboard,
일반 사용자s can temporarily turn off tmux's mouse support. First, press `Ctrl-B` key
to enter tmux control mode. Then type `:set -g mouse off` and press `Enter`
(note to type the first colon as well). Users can check what they are
typing in the status bar at the bottom of the screen. Then drag the desired text
from the terminal with the mouse and press the `Ctrl-C` or `Cmd-C` (in Mac)
to copy them to the clipboard of the 일반 사용자's computer.

With mouse support turned off, scrolling through the mouse wheel is not supprted, to see
the contents of the previous page from the terminal. In this case, 일반 사용자s can turn
on mouse support. Press `Ctrl-B`, and this time, type `:set -g mouse
on`. Now scrolling through mouse wheelis available to see the contents of the previous page.

If you remember `:set -g mouse off` or `:set -g mouse on` after `Ctrl-B`,
you can use the web terminal more conveniently.


   `Ctrl-B` is tmux's default control mode key. If 일반 사용자s set another control key
   by modifying `.tmux.conf` in 일반 사용자 home directory, they should press the set
   key combination instead of `Ctrl-B`.


   윈도우즈 환경에서는 다음 단축키를 참고하세요.

   * Copy: Hold down `Shift`, right-click and drag
   * Paste: Press `Ctrl-Shift-V`

### Check the terminal history using keyboard

There is also a way to copy the terminal contents and check the previous
contents of the terminal simultaneously. It is to check the previous contents
using the keyboard. Again, click `Ctrl-B` first, and then press the `Page
Up` and/or `Page Down` keys. To exit search mode, just press the `q`
key. With this method, 일반 사용자s can check the contents of the terminal history even
when the mouse support is turned off.

### 여러 개의 쉘 띄우기

The main advantage of tmux is to launch and use multiple shells in one
terminal window. Pressing `Ctrl-B` key and `c`. will show the new shell environment.
Previous window is not visible at this point, but is not terminated.
Press `Ctrl-B` and `w`. List of shells currently open on tmux is shown.
Shell starting with `0:` is the initial shell environment, and the shell
starting with `1:` is the one just created. Users can move between shells
using the up/down keys. Place the cursor on the shell `0:` and press the Enter
key to select it.

![](images/tmux_multi_session_pane.png)

In this way, 일반 사용자s can use multiple shell environments within a web terminal. To exit or terminate the
current shell, just enter `exit` command or press `Ctrl-B x` key and then
type `y`.

정리하면 다음과 같습니다:

- `Ctrl-B c`: create a new tmux shell
- `Ctrl-B w`: query current tmux shells and move around among them
- `exit` or `Ctrl-B x`: terminate the current shell

위 명령을 조합하여 여러 개의 쉘에서 동시에 다양한 작업을 수행할 수 있습니다.