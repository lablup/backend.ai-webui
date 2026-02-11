# Data Page

# データとストレージフォルダの取り扱い


Backend.AI supports dedicated storage to preserve ユーザー's files. Since the files
and directories of a compute session are deleted upon session termination, it is
recommended to save them in a storage folder. List of storage folders can be
found by selecting the Data page on the sidebar. You can see the information
such as the folder name and ID, the NFS host name where the folder is located
(Location), and folder access rights (Permission).


![](images/data_page.png)

ストレージフォルダには、`ユーザー`と`プロジェクト`の2つのタイプがあります。「種類」列で区別できます。

ユーザーフォルダは、個々のユーザーが個人的に使用するために直接作成したフォルダです。
プロジェクトフォルダは、ドメイン管理者が各プロジェクトに対して作成したフォルダです。
一般ユーザーは自分でプロジェクトフォルダを作成できません。管理者が作成したプロジェクトフォルダのみ使用できます。

![](images/vfolder_status.png)

The Storage Status and ストレージボリュームごとのクォータ show the following information:

- Storage Status
    - Created フォルダー: The number of folders that the ユーザー created.

         - 制限: ユーザーがその後作成できるフォルダーの最大数。この値はユーザーに適用されるリソースポリシーに依存しており、リソースポリシーを変更しない限り変更できません。ユーザーによって作成されていないフォルダー（例: 共有に招待されたフォルダーやプロジェクトフォルダー）はカウントされません。

    * Project フォルダー: The number of project folders that the ユーザー created.
    * Invited フォルダー: The number of folders that the ユーザー was invited to share.
- ストレージボリュームごとのクォータ
    * ホスト: ストレージホストの名前。
    * プロジェクト: 現在のプロジェクトフォルダ使用量 / 現在のプロジェクトフォルダクオータ範囲。
    * ユーザー: 現在のユーザーフォルダー使用量 / 現在のユーザーフォルダーのクオータースコープ。


   Please remind that quota is only available in storage that provides quota setting
   (e.g. XFS, CephFS, NetApp, Purestorage, etc.). For the quota setting, please refer
   to the [Quota Setting Panel<quota-setting-panel>](#Quota Setting Panel<quota-setting-panel>) section.

## ストレージフォルダを作成


To create a new folder, click 'Create Folder' on the Data page. Fill in the fields in
the creation dialog as follows:

![](images/vfolder_create_modal.png)

The meaning of each field in the creation dialog is as follows.

- Usage Mode: Set the purpose of the folder.

   * General: Defines a folder for storing various data in a general-purpose manner.
   * モデル一覧: Defines a folder specialized for model serving and management. If this mode is selected, it is also possible to toggle the folder's copy availability.
   * Auto Mount: フォルダー automatically mounted when a session is created. If selected, the folder name must start with a dot ('.').

- Folder name: The name of the folder (up to 64 characters).
- Location: Select the NFS host where the folder will be created. If there are multiple hosts, choose one. An indicator will show if there is enough available space.
- 種類: 作成するフォルダーの種類を決定します。ユーザーまたはプロジェクトとして設定できます。ユーザーフォルダーは、ユーザーが自身で作成して使用できるフォルダーであり、プロジェクトフォルダーは管理者によって作成され、プロジェクト内のユーザーと共有されるフォルダーです。
- プロジェクト：プロジェクトタイプを選択したときにのみ表示されます。新しいプロジェクトフォルダを作成するときに、フォルダが属するプロジェクトを指定します。プロジェクトフォルダは、プロジェクトに属する必要があります。ただし、ユーザーフォルダを作成する際には、役割を果たしません。
- パーミッション: プロジェクトフォルダのプロジェクトメンバーに対するパーミッションを設定します。これが「読み取り専用」に設定されている場合、プロジェクトメンバーは計算セッション内でこのフォルダに書き込みを行うことができません。
- Cloneable: Shown only when you select usage model to "Model". Select whether the vfolder you are creating should be cloneable.

The folders created here can be [mounted <session-mounts>](#mounted <session-mounts>) when creating a compute session. フォルダー are mounted
under the ユーザー's default working directory, `/home/work/`, and the file stored in the mounted
directory will not be deleted when the compute session is terminated.
(If you delete the folder, the file will also be deleted.)

## フォルダーを探索


Click the folder name to open a file explorer and view the contents of the folder.

![](images/click_folder_name.png)

フォルダ内にディレクトリやファイルが存在する場合、それらが一覧表示されます。Name列でディレクトリ名をクリックすると、そのディレクトリに移動します。Actions列のダウンロードボタンまたは削除ボタンをクリックして、ダウンロードしたり、ディレクトリから完全に削除したりすることができます。また、ファイル/ディレクトリの名前を変更することも可能です。より詳細なファイル操作については、コンピュートセッションを作成する際にこのフォルダをマウントし、TerminalやJupyter Notebookなどのサービスを使用して行うことができます。

![](images/folder_explorer.png)

現在のパスに新しいディレクトリを作成するには、「作成」ボタン（フォルダーエクスプローラー内）を使用するか、ローカルファイルやフォルダーをアップロードするには「アップロード」ボタンを使用します。これらのファイル操作は、上記のフォルダーをコンピューターセッションにマウントする方法を使用して実行することもできます。

フォルダ内のファイルまたはディレクトリの最大長は、ホストファイルシステムに依存することがあります。しかし、通常は255文字を超えることはできません。


   To ensure smooth performance, the screen limits the maximum number of files that can be displayed when a
   directory contains an excessive number of files. If a folder contains a large number of files, some may
   not be shown on the screen. In such cases, please use the terminal or other applications to view all files
   in the directory.

### テキストファイルを編集

フォルダーエクスプローラーでテキストファイルを直接編集できます。フォルダー名をクリックしてファイルエクスプローラーを開き、テキストファイルのコントロール列にある「ファイルを編集」ボタンをクリックします。

![](images/folder_explorer_edit_button.png)

テキストファイルエディタがコードエディタインターフェースとともにモーダルで開きます。エディタはファイル拡張子に基づいてファイルタイプを自動検出し、適切な構文ハイライトを適用します(例: Python、JavaScript、Markdown)。モーダルのタイトルにはファイル名とサイズが表示されます。

![](images/text_file_editor_modal.png)

エディタはUIの設定に合わせてライトテーマとダークテーマの両方をサポートしています。ファイルの内容を編集した後、「保存」をクリックして変更されたファイルをアップロードするか、「キャンセル」をクリックして変更を破棄できます。

   ファイルを編集ボタンは、ストレージフォルダに対するwrite_contentパーミッションがある場合にのみ使用できます。ファイルの読み込みに失敗した場合、エラーメッセージが表示されます。

## フォルダー名を変更


ストレージフォルダの名前を変更する権限がある場合、編集ボタンをクリックして名前を変更できます。

![](images/rename_vfolder.png)


## フォルダーを削除


ストレージフォルダを削除する権限がある場合、「ゴミ箱」ボタンをクリックしてフォルダを「ゴミ箱」タブに移動できます。フォルダをゴミ箱タブに移動すると、削除保留状態としてマークされます。

![](images/move_to_trash.png)

この状態では、コントロール列の復元ボタンをクリックしてフォルダを復元できます。フォルダを完全に削除する場合は、同じ列の「ゴミ箱」ボタンをクリックしてください。

![](images/vfolder_trash_list.png)

確認モーダルが表示され、`削除するフォルダ名を入力してください`という入力フィールドが表示されます。削除するフォルダ名を正確に入力し、赤い「完全に削除」ボタンをクリックしてフォルダを完全に削除します。

![](images/vfolder_delete_dialog.png)

## ファイルブラウザの使用


Backend.AI supports [FileBrowser](https://filebrowser.org) from version
20.09. FileBrowser is a program that helps you manage files on a remote server
through a web browser. This is especially useful when uploading a directory from
the ユーザー's local machine.

現在、Backend.AIは計算セッションのアプリケーションとしてFileBrowserを提供しています。したがって、それを起動するためには以下の条件が必要です。

- ユーザーは、少なくとも1つのコンピュートセッションを作成できます。
- ユーザーは少なくとも1コアのCPUと512 MBのメモリを割り当てることができる。
- FileBrowser をサポートするイメージをインストールする必要があります。

ファイルブラウザには2つの方法でアクセスできます。

- Execute FileBrowser from file explorer dialog of a data folder.
- セッションページのFileBrowserイメージから直接コンピュートセッションを起動します。


### Execute FileBrowser from folder explorer dialog

Go to the Data page and open the file explorer dialog of target
data folder. Click the folder name to open the file explorer.

![](images/click_folder_name.png)

Click 'Execute filebrowser' button in the upper-right corner of the explorer.

![](images/folder_explorer.png)

FileBrowserが新しいウィンドウで開かれているのがわかります。また、エクスプローラーダイアログで開いたデータフォルダがルートディレクトリになっているのがわかります。FileBrowserウィンドウから、ディレクトリやファイルを自由にアップロード、変更、削除することができます。

![](images/filebrowser_with_new_window.png)

ユーザーが 'EXECUTE FILEBROWSER' ボタンをクリックすると、Backend.AI はそのアプリ専用のコンピュートセッションを自動で作成します。したがって、セッションページで FileBrowser のコンピュートセッションが表示されるはずです。このコンピュートセッションを削除するかどうかはユーザーの責任です。

![](images/filebrowser_in_session_page.png)


   誤ってFileBrowserウィンドウを閉じてしまい、再度開きたい場合は、セッションページに移動してFileBrowserコンピュートセッションのFileBrowserアプリケーションボタンをクリックします。

   ![](images/app_dialog_with_filebrowser.png)

   |
   | データフォルダーエクスプローラーで 'EXECUTE FILEBROWSER' ボタンを再度クリックすると、新しいコンピュートセッションが作成され、合計で2つのFileBrowserセッションが表示されます。

### FileBrowserイメージでコンピュートセッションを作成する

FileBrowser対応のイメージを使用して直接コンピュートセッションを作成できます。アクセスするには、1つ以上のデータフォルダをマウントする必要があります。どのデータフォルダもマウントしなくても問題なくFileBrowserを使用できますが、セッション終了後にアップロード/更新されたファイルはすべて失われます。


   The root directory of FileBrowser will be `/home/work`. Therefore, you
   can access any mounted data folders for the compute session.

### FileBrowserの基本的な使用例

Here, we present some basic usage examples of FileBrowser in Backend.AI. Most
of the FileBrowser operations are intuitive, but if you need more detailed
guide, please refer to the
[FileBrowser documentation](https://filebrowser.org).

**FileBrowserを使用してローカルディレクトリをアップロード**

FileBrowserは、ツリー構造を維持したまま、1つ以上のローカルディレクトリのアップロードをサポートしています。ウィンドウの右上隅にあるアップロードボタンをクリックし、フォルダボタンをクリックします。すると、ローカルファイルエクスプローラのダイアログが表示され、アップロードしたいディレクトリを選択できます。


   読み取り専用フォルダーにファイルをアップロードしようとすると、FileBrowser がサーバーエラーを発生させます。

![](images/filebrowser_upload.png)

次の構造を持つディレクトリをアップロードしましょう。

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
you can configure a certain ユーザー packages or environments that do not change
with different kinds of compute session.

For more detailed information on the usage of 自動マウントフォルダー, refer to
[examples of using automount folders<using-automount-folder>](#examples of using automount folders<using-automount-folder>).

![](images/vfolder_automount_folders.png)

## モデル一覧


'モデル一覧'
The モデル一覧 tab facilitates straightforward model serving.
You can store the necessary data, including input data for [model serving <model-serving>](#model serving <model-serving>) and training data, in the model folder.

![](images/models.png)