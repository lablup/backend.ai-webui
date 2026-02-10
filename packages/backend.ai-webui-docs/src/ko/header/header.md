# 상단 바 기능


상단 바에는 WebUI 사용을 지원하는 다양한 기능이 포함되어 있습니다.

![](images/header.png)

## 프로젝트 선택기


사용자는 상단 바의 프로젝트 선택기를 통하여 사용자의 현재 프로젝트를 선택할 수 있습니다. 각 프로젝트 별로 다른 자원 정책을 가질 수 있으므로, 프로젝트를 변경할 경우 가용 가능한 자원 정책이 변경될 수 있습니다.

## 이벤트 알림


The bell shape button is the event notification button.
Events that need to be recorded during WebUI operation are displayed here.
When background tasks are running, such as creating a compute session,
you can check the jobs here. When the background task is finished.
Press the shortcut key (`]`) to open and close the notification area.

![](images/notification_collapse.png)

## 테마 모드


상단 바 우측에 있는 다크모드 버튼을 통하여 WebUI의 테마를 변경할 수 있습니다.

![](images/theme_mode.png)

## 도움말


상단 바 우측의 물음표 버튼을 통하여, 본 가이드 문서의 웹 버전에 접속할 수 있습니다. 현재 사용자가 접근해 있는 페이지에 따라, 관련된 문서로 자동 연결됩니다.

## 사용자 메뉴


상단 바 우측의 사람 아이콘 버튼을 클릭하여, 사용자 메뉴를 확인할 수 있습니다. 각 항목은 다음과 같은 기능을 가집니다.

![](images/user_drop_down.png)

- Backend.AI에 대하여: Backend.AI Web-UI의 버전, 라이선스 종류 등과 같은 정보를 표시 합니다.
- 사용자 정보 변경: 현재 로그인된 사용자 정보를 확인 / 변경합니다. 
- 설정: 사용자 설정 페이지로 이동합니다. 
- 로그 / 에러기록: 로그 페이지로 이동합니다. 클라이언트 측에 기록된 로그 및 오류 내역을 확인할 수 있습니다.
- 데스크톱 앱 다운로드: 사용자의 플랫폼에 맞는 독립형 WebUI 앱을 다운로드합니다.
- 로그아웃: WebUI에서 로그아웃합니다.

### 사용자 정보 변경

사용자 정보 변경을 클릭하면, 다음과 같은 다이얼로그가 나타납니다. 

![](images/my_account_information.png)

각 항목은 다음과 같은 의미를 가집니다.

- 사용자 이름: 사용자의 이름 (최대 64 자). 
- 기존 비밀번호: 원래 비밀번호. 우측 보기 버튼을 클릭하면 입력 내용을 볼 수 있습니다.
- 새 비밀번호: 새로운 비밀번호 (영문자, 숫자, 기호가 1 개 이상 포함 된 8 글자 이상).
- 이중 인증 사용: 이중 인증(2FA) 사용 여부. 이중 인증이 활성화 되어 있으면 로그인 시 OTP 코드를 반드시 입력해야 합니다. 


  Depending on the plugin settings, the `2FA Enabled` column might be invisible.
  In that case, please contact 어드민istrator of your system.

### 이중 인증 설정
If you activate the `2FA Enabled` switch, the following dialog appears.

![](images/2fa_setup.png)

사용자가 사용하는 이중 인증 애플리케이션을 켜고 QR 코드를 스캔하거나 인증 코드를 직접 입력합니다. 이중 인증 지원 애플리케이션은 Google Authenticator, 2STP, 1Password, Bitwarden 등이 있습니다.

이중 인증 애플리케이션에 추가된 항목의 6자리 코드를 위 다이얼로그에 입력합니다. 확인 버튼을 누르면 이중 인증 활성화가 완료됩니다.

이후 해당 사용자의 로그인 과정에서 OTP 코드를 묻는 추가 필드가 나타납니다.

![](images/ask_otp_when_login.png)

이중 인증 애플리케이션을 열고 One-time password 필드에 6자리 코드를 입력해야 로그인이 가능합니다. 

![](images/remove_2fa.png)

If you want to disable 2FA, turn off the `2FA Enabled` switch and click the confirm button in the
following dialog.