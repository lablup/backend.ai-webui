# 데이터 (Data) Page

# 데이터 & 폴더 활용하기


Backend.AI는 사용자의 파일을 안전하게 보관할 수 있도록 전용 저장소를 제공합니다. 연산 세션이 종료되면 세션 내에서 생성된 모든 파일과 디렉터리가 삭제되기 때문에, 중요한 데이터는 반드시 저장소 폴더에 저장하는 것이 좋습니다. 저장소 폴더 목록은 사이드바의 데이터 페이지에서 확인할 수 있습니다. 이 목록에서는 폴더 이름과 ID, 폴더가 위치한 NFS 호스트(위치), 폴더의 접근 권한(권한) 등 주요 정보를 확인할 수 있습니다


![](images/data_page.png)

There are two types of storage folders: `User` and `Project`. You can
distinguish between them in the 'Type' column.

사용자 폴더는 일반 사용자가 직접 생성하여 개인적으로 사용하는 폴더입니다. 프로젝트 폴더는 도메인 관리자가 프로젝트별로 생성하는 폴더입니다. 일반 사용자는 프로젝트 폴더를 직접 생성할 수 없으며, 관리자가 생성한 프로젝트 폴더만 사용할 수 있습니다.

![](images/vfolder_status.png)

저장소 상태와 스토리지 볼륨별 가용량은 아래의 정보를 표시합니다.

- 저장소 상태
    - 생성된 폴더: 사용자가 생성한 폴더 개수.

         - 생성 제한: 사용자가 현재 만들 수 있는 최대 폴더 수. 이 값은 사용자에게 적용된 자원 정책에 따라 다르며 자원 정책을 변경하지 않고 변경할 수 없음. 사용자가 생성하지 않은 폴더(예 : 공유하도록 초대된 폴더 또는 프로젝트 폴더)는 계산에 포함되지 않음.

    * 프로젝트 폴더: 사용자가 생성한 프로젝트 폴더 수.
    * 초대된 폴더: 다른 사용자가 초대를 통해 공유한 폴더 수.
- 저장소 볼륨별 가용량
    * 호스트: 스토리지 호스트의 이름.
    * 프로젝트: 현재 프로젝트의 폴더 사용량 / 현재 프로젝트의 폴더 가용량.
    * 사용자: 현재 사용자의 폴더 사용량 / 현재 사용자의 폴더 가용량.


   Please remind that quota is only available in storage that provides quota setting
   (e.g. XFS, CephFS, NetApp, Purestorage, etc.). For the quota setting, please refer
   to the [Quota Setting Panel<quota-setting-panel>](#Quota Setting Panel<quota-setting-panel>) section.

## 스토리지 폴더 생성


새 폴더를 만들려면 데이터 페이지에서 '폴더 생성'을 클릭합니다. 생성 대화 상자의 필드를 다음과 같이 채웁니다:

![](images/vfolder_create_modal.png)

생성 대화 상자의 각 필드 의미는 다음과 같습니다.

- 사용 방식: 폴더의 용도를 설정함.

   * 일반: 일반 범용 폴더로 사용함.
   * 모델: 모델 서빙 및 관리에 특화된 폴더. 이 모드를 선택하면 폴더 복사 가능 여부를 설정할 수 있음.
   * 자동 마운트(Auto Mount): 연산 세션을 만들 때 자동으로 마운트되는 폴더. 이름은 반드시 '.'으로 시작해야 함.

- 폴더 이름(Folder name): 폴더명 (최대 64자).
- 위치(Location): 폴더를 생성할 NFS 호스트 선택. 여러 호스트가 있을 경우 각각의 사용 가능 용량을 확인한 후 적절한 호스트를 선택하세요.
- 종류: 생성할 폴더 유형을 결정함. 사용자(User) 또는 프로젝트(Project)로 설정할 수 있음. 사용자 폴더는 사용자가 단독으로 생성하여 사용할 수 있는 폴더이며 프로젝트 폴더는 관리자가 생성하고 프로젝트의 사용자가 공유하는 폴더를 의미함.
- 프로젝트: 프로젝트 타입을 선택한 경우 보여짐. 새 프로젝트 폴더를 만들 때 폴더가 속한 그룹을 지정할 수 있음. 프로젝트 폴더는 프로젝트에 속해야 하나, 사용자 폴더를 생성할 때 별도의 역할을 수행하지는 않음.
- 권한: 프로젝트 폴더의 권한을 설정함. "Read-Only"로 설정된 경우, 프로젝트 멤버가 이 폴더에 쓰기 작업을 수행할 수 없음.
- 복제 가능 여부: 사용 방식이 "모델"로 설정된 경우에만 보여짐. 생성하는 가상 폴더가 복제 가능한지 여부를 선택함.

The folders created here can be [mounted <session-mounts>](#mounted <session-mounts>) when creating a compute session. 폴더 are mounted
under the 일반 사용자's default working directory, `/home/work/`, and the file stored in the mounted
directory will not be deleted when the compute session is terminated.
(If you delete the folder, the file will also be deleted.)

## 폴더 내용 조회하기


폴더 이름을 클릭하여 해당 폴더의 내용을 조회할 수 있는 파일 탐색기를 띄울 수 있습니다.

![](images/click_folder_name.png)

내부에 폴더 및 파일이 존재하고 있는 것을 확인할 수 있습니다. Name 열에 있는 폴더 이름을 클릭하면 해당 폴더로 이동할 수 있습니다. Actions 열의 다운로드 버튼과 삭제 버튼을 클릭하여 파일을 받거나 폴더 상에서 완전히 삭제할 수 있습니다. 파일과 디렉토리의 이름을 변경하는 것도 가능합니다. 보다 섬세한 파일 작업이 필요하다면 이 폴더를 연산 세션 생성 시 마운트 한 뒤 터미널이나 Jupyter Notebook 등과 같은 서비스를 활용해서 수행할 수 있습니다.

![](images/folder_explorer.png)

'만들기' 버튼으로 현재 경로 상에 새로운 폴더를 생성할 수 있으며, '업로드' 버튼으로 현재 경로에 로컬 파일 혹은 폴더를 업로드 할 수도 있습니다. 이런 파일 작업은 앞서 설명한 연산 세션 마운트 방식으로도 모두 수행 가능합니다.

폴더 내 파일 또는 디렉토리의 최대 길이는 호스트 파일 시스템에 따라 달라질 수 있습니다. 그러나 일반적으로 255자를 초과할 수 없습니다.


   원활한 성능 유지를 위해, 너무 많은 파일이 포함된 디렉토리에서는 화면에 표시되는 파일 수에 제한이 있습니다. 파일이 많은 폴더의 경우, 일부 파일이 화면에 보이지 않을 수 있습니다. 이 경우 터미널이나 기타 앱을 이용해 해당 디렉토리의 모든 파일을 확인해 주세요.

## 폴더 이름 변경


스토리지 폴더의 이름을 변경할 수 있는 권한을 가지고 있는 경우, 폴더 이름 옆의 수정 버튼을 클릭해서 이름 변경 작업을 수행할 수 있습니다.

![](images/rename_vfolder.png)


## 폴더 삭제하기


스토리지 폴더를 삭제할 수 있는 권한을 가지고 있는 경우, 제어 열의 '휴지통' 아이콘을 눌러 폴더를 휴지통으로 이동시킬 수 있습니다. 휴지통으로 이동된 폴더들은 DELETE-PENDING 상태로 표시됩니다.

![](images/move_to_trash.png)

삭제하려는 폴더 이름을 입력하는 필드를 포함한 모달이 나타나면, 입력 필드에 삭제하려는 폴더 이름을 정확하게 입력한 후, 빨간색 '영구 삭제' 버튼을 클릭하여 폴더를 완전히 삭제할 수 있습니다.

![](images/vfolder_trash_list.png)

A confirmation modal will pop up with
an input field saying `Type folder name to delete`. Make sure you type the exact folder name correctly
into the field, and click the red 'DELETE FOREVER' button to permanently delete the folder.

![](images/vfolder_delete_dialog.png)

## 파일 브라우저 사용하기


Backend.AI supports [FileBrowser](https://filebrowser.org) from version
20.09. FileBrowser is a program that helps you manage files on a remote server
through a web browser. This is especially useful when uploading a directory from
the 일반 사용자's local machine.

현재 Backend.AI에서는 파일 브라우저를 연산 세션 내에서 실행되는 애플리케이션 형태로 제공합니다. 따라서, 다음과 같은 최소 조건이 필요합니다.

- 최소 1개 이상의 세션을 생성할 수 있음.
- 최소 CPU 1 core, RAM 0.5 GB 이상의 여유 자원.
- 파일 브라우저를 지원하는 이미지가 설치되어 있어야 함.

파일 브라우저는 두 가지 방법으로 사용할 수 있습니다.

- 폴더 탐색기 창에서 실행.
- 세션 페이지에서 파일 브라우저 이미지로 연산 세션 직접 생성.


### 폴더 탐색기에서 파일 브라우저 실행

데이터 페이지로 이동 후 원하는 데이터 폴더의 탐색기 창을 띄웁니다. 폴더 아이콘 혹은 폴더 이름을 클릭하여 파일 탐색기를 띄웁니다.

![](images/click_folder_name.png)

탐색기 우측 상단의 '파일브라우저 실행' 버튼을 클릭해주세요.

![](images/folder_explorer.png)

파일 브라우저가 새 창에서 열린 것을 확인할 수 있습니다. 탐색기를 열었던 저장 폴더가 파일 브라우저의 루트 디렉토리가 되는 것도 알 수 있습니다. 파일 브라우저 창에서 디렉토리와 파일을 자유롭게 업로드하고 수정하고 삭제할 수 있습니다.

![](images/filebrowser_with_new_window.png)

사용자가 '파일브라우저 실행' 버튼을 클릭하면, Backend.AI는 자동으로 파일 브라우저 전용 연산 세션을 하나 생성하게 됩니다. 따라서, 세션 페이지에서 파일 브라우저 연산 세션이 조회되는 것을 확인할 수 있습니다. 이 연산 세션을 삭제하는 것은 사용자의 몫입니다.

![](images/filebrowser_in_session_page.png)


   파일 브라우저 창을 실수로 종료하여 다시 열고자 한다면, 세션 페이지로 가서 해당 세션의 Control 열에 있는 애플리케이션 아이콘을 선택하고 파일 브라우저 버튼을 클릭하면 됩니다.

   ![](images/app_dialog_with_filebrowser.png)

   |
   | 만약 탐색기에서 '파일브라우저 실행' 버튼을 다시 클릭하면 새로운 세션이 생성되어 총 두 개의 파일 브라우저 연산 세션이 나타나게 됩니다.

### 파일 브라우저 이미지로 연산 세션 생성하기

파일 브라우저를 지원하는 이미지를 선택해서 연산 세션을 직접 생성할 수도 있습니다. 연산 세션 생성 시 작업하기 원하는 데이터 폴더를 하나 이상 마운트하십시오. 아무 데이터 폴더를 마운트하지 않아도 파일 브라우저 사용에는 문제가 없지만, 연산 세션이 종료되면 연산 세션에서 작업한 모든 파일이 삭제됩니다.


   The root directory of FileBrowser will be `/home/work`. Therefore, you
   can access any mounted data folders for the compute session.

### 파일 브라우저 기본 사용법

Here, we present some basic usage examples of FileBrowser in Backend.AI. Most
of the FileBrowser operations are intuitive, but if you need more detailed
guide, please refer to the
[FileBrowser documentation](https://filebrowser.org).

**파일 브라우저로 로컬 디렉토리 업로드 하기**

파일 브라우저는 로컬 디렉토리 구조를 그대로 보존하여 업로드 할 수 있는 기능을 지원합니다. 파일 브라우저 윈도우 우측 상단의 업로드 버튼을 클릭한 후 Folder 버튼을 클릭하십시오. 로컬 파일 탐색창이 뜨는데, 여기서 업로드 하기 원하는 디렉토리를 선택하면 됩니다.


   읽기 전용 폴더에 파일을 업로드 하는 경우, FileBrowser가 서버 에러를 띄우게 됩니다.

![](images/filebrowser_upload.png)

다음과 같은 구조를 가진 폴더를 업로드해 보겠습니다.

``shell
foo
+-- test
|   +-- test2.txt
+-- test.txt
``
After selecting `foo` directory, you can see the directory just uploaded
successfully.

![](images/filebrowser_upload_finished.png)

You can also upload local files and directories by drag and drop.

**Move files or directories to another directory**

Moving files or directories in data folder is also possible from FileBrowser.
You can move files or directories by following steps below.

1. Select directories or files from FileBrowser.

![](images/select_folders.png)

2. Click the 'arrow' button in the upper right corner of FileBrowser

![](images/click_arrow_icon.png)

3. Select the destination

![](images/select_the_destination.png)

4. Click 'MOVE' button

You will see that moving operation is successfully finished.

![](images/moving_operation_in_filebrowser_finished.png)


   FileBrowser is provided via application inside a compute session currently.
   We are planning to update FileBrowser so that it can run independently
   without creating a session.

## Using SFTP Server


From 22.09, Backend.AI supports SSH / SFTP file upload from both desktop app and
web-based WebUI. The SFTP server allows you to upload files quickly through reliable
data streams.


   Depending on the system settings, running SFTP server from the file dialog may not
   be allowed.

### Execute SFTP server from folder explorer dialog in Data page

Go to the Data page and open the file explorer dialog of target data folder.
Click the folder button or the folder name to open the file explorer.

Click 'Run SFTP server' button in the upper-right corner of the explorer.

![](images/folder_explorer.png)

You can see the SSH / SFTP connection dialog. And a new SFTP session will be created
automatically. (This session will not affect resource occupancy.)

![](images/SSH_SFTP_connection.png)

For the connection, click 'Download SSH Key' button to download the SSH private key
(`id_container`). Also, remember the host and port number. Then, you can copy your
files to the session using the Connection Example code written in the dialog, or
referring to the following guide: [link<sftp_connection_for_linux_and_mac>](#link<sftp_connection_for_linux_and_mac>).
To preserve the files, you need to transfer the files to the data folder. Also,
the session will be terminated when there is no transfer for some time.


   If you upload your SSH keypair, the `id_container` will be set with your
   own SSH private key. So, you don't need to download it every time you
   want to connect via SSH to your container. Please refer to
   [managing user's SSH keypair<user-ssh-keypair-management>](#managing user's SSH keypair<user-ssh-keypair-management>).

# Folder Categories


## Pipeline folders

This tab shows the list of folders that are automatically created when executing a
pipeline in FastTrack. When a pipeline is created, a new folder is created and mounted
under `/pipeline` for each instance of work (computing session).

## Automount folders


Data page has an Automount Folders tab. Click this tab to see a
list of folders whose names prefixed with a dot (`.`). When you create a folder,
if you specify a name that starts with a dot (`.`), it is added to the Automount
Folders tab, not the Folders tab. Automount Folders are special folders that are
automatically mounted in your home directory even if you do not mount them
manually when creating a compute session. By using this feature, creating and
using Storage folders such as `.local`, `.linuxbrew`, `.pyenv`, etc.,
you can configure a certain 일반 사용자 packages or environments that do not change
with different kinds of compute session.

For more detailed information on the usage of 자동 마운트 폴더, refer to
[examples of using automount folders<using-automount-folder>](#examples of using automount folders<using-automount-folder>).

![](images/vfolder_automount_folders.png)

## 모델 폴더


'모델 폴더'
The 모델 탭 facilitates straightforward model serving.
You can store the necessary data, including input data for [model serving <model-serving>](#model serving <model-serving>) and training data, in the model folder.

![](images/models.png)