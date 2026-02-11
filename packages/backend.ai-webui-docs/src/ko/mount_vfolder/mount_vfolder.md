# 연산 세션에 폴더 마운트


Backend.AI provides a function to mount storage folders when creating a compute session.
When new compute session is started, 일반 사용자 will have access to the`/home/work/` directory.
Normal directories and files created under `/home/work/` will disappear when the compute session is terminated.
This is because compute sessions are dynamically created and deleted based on the container.
To preserve data inside a container regardless of the container's lifecycle, a separate host folder must be mounted in the container, and then files must be created within the mounted folder.

Go to '세션 (Sessions)' page and click the '시작' button.
After filling out the '세션 타입', '실행 환경 및 자원 할당' steps,
navigate to the '데이터 및 폴더' step to see a list of folders that 일반 사용자s can mount.
From this list, choose the folders to mount and add them, or select multiple folders to mount more.
The documentation will explain how to mount two folders, `user1-ml-test` and `user2-vfolder`,
and then create a session.

![](images/create_session_with_folders.png)


   해당 프로젝트 내의 데이터와 폴더 정보를 살펴보면 사용 모드, 해당 폴더가 속해 있는 스토리지 호스트, 권한 등의 정보를 확인할 수 있습니다. 참고로, '데이터 & 폴더' 단계에서는 현재 사용자가 마운트 가능한 데이터 폴더만 출력됩니다. 다른 프로젝트에 속한 폴더는 해당 메뉴를 통해 조회할 수 없습니다.

   Clicking a 'folder name' in the '데이터 및 폴더' step will open the folder explorer for that folder.
   From this, 일반 사용자s can view the folders that have been created, create new folders, and upload files.
   For more detailed instructions related to folders, please refer [Explore Folder<explore_folder>](#Explore Folder<explore_folder>) section.

   Alternatively, a new virtual folder can be created by clicking the '+' button.
   For further information on how to create a new folder in session launcher page,
   please refer [Create storage folder<create_storage_folder>](#Create storage folder<create_storage_folder>) section.

In the created session, click the created session name to open detail information drawer. Then,
click the 'Execute Terminal App' icon button (upper right corner, second from the right) to open terminal app.
Or you can also open terminal app from the notification.
`ls` command will mount ``user1-ml-test` folder and `user2-vfolder` under the `user1-ml-test`
and `user2-vfolder` folders are mounted under the home directory.

![](images/execute_terminal_app.png)

![](images/execute_terminal_app2.png)


   The selected folder will be mounted with its name under `/home/work/` inside the compute session, by its default.
   For example, if folder's name is `test`, it is mounted on `/home/work/test`.
   To customize the mount path, write an absolute path in the 'Path and Alias' input fields.
   Writing `/workspace` in the input field of the `test` folder will mount to `/workspace` inside the session.
   Writing a relative path will mount the folder under `/home/work/` with the path.

Backend.AI에서는 연산 세션을 삭제해도 폴더 안의 파일을 보존할 수 있는 옵션을 제공합니다. 아래 예제를 통해 관련된 내용을 확인할 수 있습니다.

Under the `user2-vfolder`, create a `test_file`.
Fill the contents with \"file inside 일반 사용자2-vfolder\".

![](images/mounted_folders_in_terminal.png)

Running `ls` command against `user2-vfolder`, 일반 사용자s can confirm the file was created successfully.
Please note the contents of the file can be chekced with `cat` command.

Now delete the compute session and go to the Storage page.
Locate the `user2-vfolder folder`, open a file explorer and check that the `test_file` exists.
Click the 'download' button in 'Actions' tab to download the file to the local machine and open it
to confirm that the contents are \"file inside 일반 사용자2-vfolder\".

![](images/download_file_from_folder.png)

연산 세션을 생성할 때 폴더를 마운트한 후, 마운트 된 폴더에서 파일 작업을 수행하면 연산 세션이 종료된 이후에도 데이터를 보존할 수 있습니다.


## 자동 마운트 폴더를 이용하여 연산 세션 환경 구성하기

If a new program or library is required that is not pre-installed in a compute session, a Storage folder attribute and [automount-folder<automount-folder>](#automount-folder<automount-folder>),
which is independent of the compute session lifecycle, can be used to install the package.
Configure a consistent environment regardless of the type of compute session.


### pip를 통한 파이썬 패키지 설치

Creating a folder named `.local` allows a 일반 사용자 to install Python 일반 사용자 packages in same folder.
`pip` by default installs the packages in the `.local` folder under the 일반 사용자's home folder
(Please note that automount folder is mounted under 일반 사용자's home folder).
So, to keep a Python package called `tqdm` installed at all times, regardless of the computing environment,
a command like the following could be issued from the terminal:

``shell
pip install tqdm
``
After that, when a new compute session is created, the `.local__PROTECTED_29__tqdm__PROTECTED_30__tqdm__PROTECTED_31__PYTHONPATH__PROTECTED_32__.bashrc__PROTECTED_33__pip__PROTECTED_34__PYTHONPATH__PROTECTED_35____PROTECTED_36__apt__PROTECTED_37__yum__PROTECTED_38__root__PROTECTED_39__sudo__PROTECTED_40__root__PROTECTED_41__sudo__PROTECTED_42__.linuxbrew__PROTECTED_43__.linuxbrew__PROTECTED_44__/home/linuxbrew/.linuxbrew__PROTECTED_45____PROTECTED_46____PROTECTED_47____PROTECTED_48____PROTECTED_49__brew__PROTECTED_50__/home/linuxbrew/.linuxbrew__PROTECTED_51__.linuxbrew` folder exists.
So, if an automount folder named ''.linuxbrew'' is created, the Homebrew packages previously installed can be used again, even if the compute session is deleted and a new compute session is created.