# 저장 폴더 공유 및 접근 제어

Storage 폴더의 내용을 다른 사용자 또는 프로젝트 멤버와 공유하여 공동 작업이나 학습을 수행할 필요가 있을 수 있습니다. 이를 위해 Backend.AI에서는 스토리지 폴더를 손쉽게 공유할 수 있습니다.


## 개인 스토리지 폴더를 다른 사용자와 공유하기

Let's learn how to share your personal Storage folder with other 일반 사용자s. First,
log in to User A's account and go to the 데이터 (Data) page. There are several
folders, and we want to share a folder named `tests` to User B.

![](images/list_of_vfolders_A.png)

Inside the `tests` folder you can see files and directories like `hello.txt`
and `myfolder`.

![](images/test_vfolder_explorer_A.png)

Confirm that the `tests` folder is not listed when logging in with User B's
account.

![](images/no_test_vfolder_in_B.png)


   If a folder named `tests` already exists in User B's account, User A's
   `tests` folder cannot be shared with User B.

사용자A의 계정으로 전환한 후, 리스트에 있는 ``tests`` 폴더의 제어 열에서 공유 버튼을 클릭합니다.

![](images/share_button_on_list.png)

공유 모달의 '사용자 초대' 항목에 사용자 B의 계정 이메일을 입력하고, 원하는 공유 권한을 설정합니다. '읽기 전용' 권한을 선택하면 사용자 B는 조회만 가능하며, '읽기 및 쓰기' 권한을 선택하면 조회뿐만 아니라 쓰기 작업도 수행할 수 있습니다.

![](images/send_vfolder_invitation.png)

사용자 B의 계정으로 전환한 후 데이터 페이지로 이동합니다. 스토리지 상태 패널에서 초대된 폴더의 개수를 확인할 수 있습니다.

![](images/pending_invitations.png)

뱃지를 클릭하면 초대 리스트 모달이 열리며, 대기 중인 폴더 초대를 승낙하거나 거절할 수 있습니다.

![](images/invitation_accept.png)

Go to the 데이터 (Data) page and check that the `tests` folder is displayed in
the list. If you don't see it on the list, try refreshing your browser page.
Since you have accepted the invitation, you can now view the contents of User
A's `tests` folder in User B account. Unlike folders created by User B,
shared folders appear without the check icon in the Owner column. You
can also see the 'Read only' mark displayed in the Mount Permission column.

![](images/test_vfolder_listed_in_B.png)

Let's navigate inside the `tests` folder by clicking the folder icon in the
Control panel of `tests`. You can check the `hello.txt` and `myfolder`
that you checked in the User A's account again.

![](images/folder_explorer_in_B.png)

이 스토리지 폴더를 사용자 B의 계정으로 마운트하여 컴퓨팅 세션을 생성해 보겠습니다.

![](images/launch_session_with_test_mounted_B.png)


   From version 24.09, Backend.AI offers an improved version of the session launcher (NEO)
   as default. If you want to use the previous session launcher, please refer [User Settings<general-settings>](#User Settings<general-settings>)
   section. For instructions on how to use it, please refer to the following [link](https://webui.docs.backend.ai/en/23.09_a/sessions_all/sessions_all.html).
   If you want to know more about the NEO session launcher, please refer [Create Session<create_session>](#Create Session<create_session>)

After creating a session, open the web terminal and check that the `tests`
folder is mounted in the home folder. The contents of the `tests` folder are
displayed, but attempts to create or delete files are not allowed. This is
because User A shared it as read-only. User B can create a file in the `tests`
folder if it has been shared including write access.

![](images/file_operations_on_shared_test_folder.png)

이렇게 개인 폴더를 Backend.AI 이메일 계정 기반으로 다른 사용자에게 공유할 수 있습니다.


   Backend.AI also provides sharing project folder to project members.
   To See the detail, go to [sharing a project storage folder with project members <sharing-a-group-storage>](#sharing a project storage folder with project members <sharing-a-group-storage>).


## 공유 폴더 권한 조정

마찬가지로, 폴더 공유 모달에서 공유된 사용자의 권한을 수정할 수 있습니다. 권한 선택란을 클릭해 공유 권한을 설정합니다.

- 읽기 전용: 초대된 사용자는 폴더에 대한 읽기 전용 접근 권한을 갖습니다.
- 수정: 초대된 사용자에게 폴더에 대한 읽기 및 쓰기 권한이 있습니다. 사용자는 폴더나 파일을 삭제할 수 없습니다.

![](images/modify_perm.png)


   사용자가 수정 권한을 부여한 경우에도 폴더 자체 이름 변경은 소유자만 사용할 수 있습니다. 편집 권한은 폴더 이름 변경을 제공하지 않습니다.


## 공유 중지

폴더 초대자가 공유를 중단하려면, 파일 목록 컨트롤 열에서 해당 폴더의 '공유' 버튼을 누릅니다. 권한 수정 모달에서 권한 선택기 옆에 있는 '공유 중지' 버튼을 클릭하면 됩니다.

![](images/modify_permission_and_stop_sharing.png)

초대받은 사람이 더 이상 공유 폴더를 이용하지 않는 경우, 폴더 리스트에서 해당 폴더의 '공유' 버튼을 누른 후 '공유 폴더 나가기' 버튼을 클릭하세요.

![](images/leave_shared_folder.png)