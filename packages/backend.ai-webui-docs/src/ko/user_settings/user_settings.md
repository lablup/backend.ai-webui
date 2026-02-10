# 사용자 설정 페이지


사용자 설정 페이지는 우측 상단 사람 아이콘을 클릭하면 나오는 Preferences 메뉴를 선택하여 접근할 수 있습니다. 여기서는, 사용자 설정 페이지의 각 항목 및 메뉴에 관해 간단히 설명합니다.

![](images/preferences.png)


## GENERAL 탭


![](images/user_settings_page.png)

There are lots of preference menu in GENERAL 탭. you can search it by search field on top of the section,
or you may just filter that you changed by clicking `Display Only Changes`. If you want to rollback the changes to before,
click Reset button on the right top of the section.

### 데스크톱 알림 활성화

데스크톱 알림 기능을 사용 여부를 설정합니다. 브라우저 및 운영체제가 지원하는 경우, WebUI에서 뜨는 각종 하단 메시지가 데스크톱 알림 패널에도 같이 뜨게 됩니다. 첫 실행 시 운영체제 단에서 비활성화한 경우, 여기서 옵션을 켜더라도 데스크톱 메시지가 출력되지 않을 수 있습니다. 이 옵션 설정과 관계없이, WebUI 내부의 알림 기능은 그대로 동작합니다.

### 간결한 사이드바를 기본값으로 설정

이 옵션이 켜져 있으면 좌측 사이드바가 콤팩트 형태 (너비가 줄어든 형태) 로 보이게 됩니다. 다만, 옵션을 적용한다고 해서 즉시 그 효과가 보이지는 않으며, 브라우저를 갱신할 때 적용됩니다. 페이지 갱신 없이 사이드바 형태를 즉시 변경하고 싶다면, 헤더 상단부의 가장 좌측 아이콘을 클릭하십시오.

### 언어 설정

UI 에 출력되는 언어를 설정합니다. 현재 Backend.AI에서는 한국어, 영어를 포함해 다섯 개 이상의 언어를 지원하고 있습니다. 다만, 페이지 갱신 전에는 언어가 바뀌지 않는 사용자 인터페이스 항목이 있을 수 있습니다.

- Default: 운영체제 기본 설정된 언어를 사용합니다.
- English: 영어를 기본 언어로 설정합니다.
- Korean: 한국어를 기본 언어로 설정합니다.
- Brazilian Portuguese: 브라질 포르투갈어를 기본 언어로 설정합니다.
- Chinese (Simplified): 중국어(간체)를 기본 언어로 설정합니다.
- Chinese (Traditional): 중국어(번체)를 기본 언어로 설정합니다.
- French: 프랑스어를 기본 언어로 설정합니다.
- Finnish: 핀란드어를 기본 언어로 설정합니다.
- German: 독일어를 기본 언어로 설정합니다.
- Greek: 그리스어를 기본 언어로 설정합니다.
- Indonesian: 인도네시아어를 기본 언어로 설정합니다.
- Italian: 이탈리아어를 기본 언어로 설정합니다.
- Japanese: 일본어를 기본 언어로 설정합니다.
- Mongolian: 몽골어를 기본 언어로 설정합니다.
- Polish: 폴란드어를 기본 언어로 설정합니다.
- Portuguese: 포르투갈어를 기본 언어로 설정합니다.
- Russian: 러시아어를 기본 언어로 설정합니다.
- Spanish: 스페인어를 기본 언어로 설정합니다.
- That: 태국어를 기본 언어로 설정합니다.
- Turkish: 터키어를 기본 언어로 설정합니다.
- Vietnamese: 베트남어를 기본 언어로 설정합니다.



   Some of translated items may be marked as `__NOT_TRANSLATED__`, which
   indicates the item is not yet translated for that language. Since Backend.AI
   WebUI is open sourced, anyone who willing to make the translation better
   can contribute: https://github.com/lablup/backend.ai-webui.

### 자동 업데이트 체크

WebUI의 새 버전이 검색될 경우 알림 창을 띄웁니다. 이 기능은 인터넷 접속이 가능한 환경에서만 동작합니다.

### 자동 로그아웃

세션 내 앱을 실행하기 위해 생성된 페이지를 제외한 모든 Backend.AI WebUI 페이지가 닫힐 경우, 자동으로 로그아웃 됩니다. (Jupyter Notebook, Web Terminal 등의 앱을 접속하는 경우에는 로그아웃이 되지 않습니다.)

### 내 키페어 정보

모든 사용자는 하나 이상의 키페어를 가지고 있습니다. 아래의 구성 버튼을 클릭하면 액세스 및 비밀 키페어를 확인할 수 있습니다. 기본 액세스 키페어는 하나만 존재합니다.

![](images/my_keypair_information.png)


### SSH 키페어 관리

연산 세션에 직접 SSH 로 접속할 때 필요한 SSH 키페어를 조회하고 생성하는 기능입니다. 우측 버튼을 클릭하면 다음과 같은 다이얼로그가 뜹니다. 우측의 복사 버튼을 클릭하면 현재 존재하는 SSH 공개 키를 복사할 수 있습니다. 처음 Backend.AI 에 계정을 등록하게 되면, 자동으로 한 쌍의 키페어가 발급되게 됩니다. 갱신하고자 한다면 GENERATE 버튼을 클릭합니다. SSH 공개/비밀 키 는 랜덤으로 생성되어 사용자 정보로 저장됩니다. 비밀 키는 생성 직후 따로 저장해 두지 않으면 다시 확인할 수 없음에 주의하십시오.

![](images/ssh_keypair_dialog.png)


   Backend.AI는 OpenSSH에 기반한 SSH keypair를 사용합니다. Windows에서는 PPK 기반 키로 변환해야 할 수 있습니다.

From 22.09, Backend.AI WebUI supports adding your own ssh keypair in order to provide
flexibility such as accessing to a private repository. In order to add your own ssh keypair, click `ENTER MANUALLY` button. Then, you will see
two text area which corresponds to "public" and "private" key.

![](images/add_ssh_keypair_manually_dialog.png)

please enter the keys inside, and click `SAVE` button. Now you can access to backend.ai session using your own key.

![](images/ssh_keypair_dialog_after.png)

### 부트스트랩 스크립트 수정

연산 세션 시작 후 한 번만 스크립트를 실행하고자 할 경우, 여기에 그 내용을 작성해 주십시오.

![](images/edit_bootstrap_script.png)


   The compute session will be at the `PREPARING` status until the bootstrap
   script finishes its execution. Since a 일반 사용자 cannot use the session until it
   is `RUNNING`, if the script contains a long-running tasks, it might be
   better to remove them out of the bootstrap script and run them in a terminal
   app.

### 사용자 환경 스크립트 수정

You can write some config scripts to replace the default ones in a compute
session. Files like `.bashrc`, `.tmux.conf.local`, `.vimrc`, etc. can be
customized. The scripts are saved for each 일반 사용자 and can be used when certain
automation tasks are required. For example, you can modify the `.bashrc`
script to register your command aliases or specify that certain files are always
downloaded to a specific location.

상단의 드롭다운 메뉴를 활용해서 작성할 스크립트의 종류를 선택한 후 내용을 작성하십시오. 작성이 완료되면 SAVE 또는 SAVE AND CLOSE 버튼을 클릭해서 스크립트를 저장할 수 있습니다. DELETE 버튼을 클릭하면 해당 스크립트를 삭제할 수 있습니다.

![](images/edit_user_config_script.png)

### Classic UI로 돌아가기

Classic Backend.AI 인터페이스로 돌아가고 싶다면 다음 설정을 활성화해 주세요.

![](images/switch_classic_ui.png)

### 실험적 기능

실험적 기능들이 정식으로 출시되기 전에 활성화하거나 비활성화할 수 있습니다.

![](images/experimental_features.png)

## LOGS 탭

클라이언트 측에서 기록된 각종 로그의 상세 정보를 출력합니다. 요청 오류가 발생했을 때 자세한 내용을 확인하고 싶을 때 이 페이지에 방문할 수 있습니다. 우측 상단의 버튼을 이용해서 로그를 검색하거나 에러 메시지를 필터링하고, 로그를 새로고침하거나 지울 수 있습니다.

![](images/user_log.png)


   로그인된 페이지가 하나만 존재할 경우, REFRESH 버튼을 클릭하면 제대로 작동하지 않는 것처럼 보일 수 있습니다. 로그 페이지는 서버에 대한 요청과 서버의 응답을 모아둔 것이며, 현재 페이지가 로그 페이지인 경우 명시적으로 페이지를 새로 고침하는 것 외에는 서버에 요청을 보내지 않습니다. 로그가 제대로 쌓이는지 확인하려면 다른 페이지를 열고 REFRESH 버튼을 클릭하십시오.

특정 열을 숨기거나 보이게 하려면, 테이블 우측 하단의 기어 아이콘을 클릭하십시오. 그러면 아래와 같은 다이얼로그가 나타나며, 보고 싶은 열을 선택할 수 있습니다.

![](images/logs_table_setting.png)