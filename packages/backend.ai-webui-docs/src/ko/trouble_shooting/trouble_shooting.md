# FAQ 및 문제 해결

## 사용자 문제 해결 가이드

### 연산 세션 리스트가 나타나지 않습니다

간헐적인 네트워크 문제나 기타 다양한 원인으로 인해 연산 세션 리스트가 정상적으로 표시되지 않을 수 있습니다. 대부분의 경우, 브라우저를 갱신하면 연산 세션이 정상적으로 보입니다.

- 웹 기반 Web-UI: 브라우저 페이지를 갱신합니다(Ctrl-R 등 브라우저 별 제공하는 페이지 갱신 단축키 사용). 브라우저의 캐시가 쌓여 오동작하는 경우도 있으므로 캐시를 사용하지 않고 페이지 갱신을 해보는 것도 좋습니다(Shift-Ctrl-R 등 브라우저 별 상이).
- 앱 기반 설치형 Web-UI: Ctrl-R 단축키를 클릭하여 앱 페이지를 갱신할 수 있습니다.

### 갑자기 로그인이 안 됩니다

간혹 브라우저의 쿠키 문제 및 캐시된 데이터로 인해 로그인이 되지 않는 경우가 있습니다. 브라우저의 시크릿 모드에서 로그인을 시도해 보십시오. 만약 로그인이 된다면, 브라우저의 쿠키 및 애플리케이션 데이터를 삭제한 후 다시 로그인 해 보시기 바랍니다.


### apt 패키지는 어떻게 설치하나요?

Inside a compute session, 일반 사용자s cannot access `root` account and perform
operations that require `sudo` privilege for security reasons. Therefore, it
is not allowed to install packages with `apt` or `yum` since they require
`sudo`. If it is really required, you can request to 어드민s to allow `sudo`
permission.

Alternatively, 일반 사용자s may use Homebrew to install OS packages. Please refer to
the [guide on using Homebrew with automount
folder<using-linuxbrew-with-automountfolder>](#guide on using Homebrew with automount
folder<using-linuxbrew-with-automountfolder>).


### pip 패키지를 설치하고 싶어요

By default, when you install a pip package, it will be installed under
`~/.local`. So, if you create a automount data folder named `.local`, you
can keep the installed packages after a compute session is destroyed, and then
reus them for the next compute session. Just install the packages with pip like:

``shell
$ pip install aiohttp
``
For more information, please refer to the [guide on installing Python
packages with automount folder<using-pip-with-automountfolder>](#guide on installing Python
packages with automount folder<using-pip-with-automountfolder>).

### I have created a compute session, but cannot launch Jupyter Notebook

If you installed a Jupyter package with pip by yourself, it may be conflict with
the Jupyter package that a compute session provides by default. Especially, if you
have created `~/.local` directory, the manually installed Jupyter packages
persists for every compute session. In this case, try to remove the `.local`
automount folder and then try to launch Jupyter Notebook again.

### 페이지가 이상하게 표시됩니다

Backend.AI Web-UI는 최신 JavaScript 와 브라우저의 기능을 적극 활용하고 있습니다. 가급적 최신 브라우저를 사용하십시오. 특히 Chrome 에서 가장 안정적인 레이아웃을 보입니다.

### SFTP 연결이 끊기는 경우

Web-UI 앱을 통한 SFTP 연결은 Web-UI 앱이 내장하고 있는 로컬 proxy 서버를 사용합니다. SFTP 연결 후 파일 전송하는 과정에서 콘솔 앱을 종료하면 로컬 proxy 서버로 같이 종료되므로 파일 전송이 중간에 실패하게 됩니다. 따라서, 세션을 사용하지 않는다고 해도 SFTP 사용 중에는 콘솔 앱을 종료하면 안 됩니다. 만약 페이지 갱신이 필요한 상황이면 Ctrl-R 단축키를 이용하는 것을 권합니다.

또한, Web-UI 앱을 종료한 후 다시 시작한 경우 기존에 존재하던 컨테이너에서 SFTP 서비스를 자동으로 시작하지 않습니다. 명시적으로 원하는 컨테이너에서 SSH / SFTP 서비스를 시작해줘야 SFTP 연결을 맺을 수 있습니다.


## 관리자 문제 해결 가이드

### 사용자가 Jupyter Notebook 등의 앱을 띄울 수 없는 경우

There may be a problem on connecting WSProxy service. Try to stop and restart
the service by referencing the guide on start/stop/restart WSProxy service.

### 표시되는 자원 양이 실제 할당된 양과 다릅니다

가끔 네트워크 연결이 튀거나 Docker 데몬의 컨테이너 관리 지연 등의 사유로 Backend.AI 가 인식하는 자원의 할당양과 실제 컨테이너가 점유하고 있는 자원의 양이 달라질 수 있습니다. 이런 경우에는 다음 과정을 따라 하십시오.

- 어드민 계정으로 로그인
- Maintenance 페이지 방문.
- RECALCULATE USAGE 버튼을 클릭하여 수동으로 자원 할당량 조정.

### 도커 레지스트리에 이미지 등록 후 세션 생성 환경에 이미지가 보이지 않을 때


   이 기능은 super 어드민만 사용할 수 있습니다.

사설 도커 레지스트리에 이미지가 새로 등록된 경우 Backend.AI에서 레지스트리 별 이미지 메타 데이터를 업데이트 해야 세션 생성할 때 이용할 수 있습니다. 메타 데이터 업데이트는 Maintenance 페이지의 RESCAN IMAGES 버튼을 클릭하여 수행할 수 있습니다. 만약 연결된 도커 레지스트리가 여러 개일 경우, RESCAN IMAGES 버튼을 클릭하면 모든 레지스트리에서 메타 정보를 받아 옵니다.

특정한 도커 레지스트리의 메타 정보만 업데이트 하고자 할 경우 실행 환경 페이지의 Registries 탭에서 원하는 레지스트리의 정보만 갱신할 수 있습니다. 원하는 레지스트리의 Controls 열에서 리프레시 버튼을 클릭하면 됩니다. 휴지통 아이콘을 클릭하여 레지스트리를 삭제하지 않도록 주의해야 합니다.