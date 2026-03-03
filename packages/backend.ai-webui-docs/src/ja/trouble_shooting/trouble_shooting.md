# FAQとトラブルシューティング

## ユーザートラブルシューティングガイド

### セッションリストが正しく表示されない

断続的なネットワークの問題やその他の様々な理由により、セッションリストが正しく表示されない場合があります。ほとんどの場合、この問題はブラウザをリフレッシュするだけで解消されます。

- WebベースのWeb-UI: ブラウザのページをリフレッシュします (Ctrl-Rなど、ブラウザで提供されるショートカットを使用します)。ブラウザのキャッシュが問題を引き起こすことがあるため、キャッシュをバイパスしてページをリフレッシュすることをお勧めします (Shift-Ctrl-Rなど、ただしキーは各ブラウザによって異なる可能性があります)。
- Web-UIアプリ: アプリを更新するにはCtrl-Rショートカットを押してください。

### 突然、自分のアカウントでログインできなくなりました

認証クッキーの認識に問題がある場合、ユーザーは一時的にログインできないことがあります。プライベートブラウザウィンドウを使用してログインしてみてください。もし成功した場合は、ブラウザのキャッシュおよび/またはアプリケーションデータをクリアしてください。


<a id="installing_apt_pkg"></a>

### aptパッケージのインストール方法?

Inside a compute session, ユーザーs cannot access `root` account and perform
operations that require `sudo` privilege for security reasons. Therefore, it
is not allowed to install packages with `apt` or `yum` since they require
`sudo`. If it is really required, you can request to 管理者s to allow `sudo`
permission.

Alternatively, ユーザーs may use Homebrew to install OS packages. Please refer to
the [guide on using Homebrew with automount folder](../mount_vfolder/mount_vfolder.md#using-linuxbrew-with-automountfolder).


<a id="install_pip_pkg"></a>

### pipでパッケージをインストールする方法

By default, when you install a pip package, it will be installed under
`~/.local`. So, if you create a automount data folder named `.local`, you
can keep the installed packages after a compute session is destroyed, and then
reus them for the next compute session. Just install the packages with pip like:

```shell
$ pip install aiohttp
```
For more information, please refer to the [guide on installing Python
packages with automount folder](../mount_vfolder/mount_vfolder.md#using-pip-with-automountfolder).

### I have created a compute session, but cannot launch Jupyter Notebook

If you installed a Jupyter package with pip by yourself, it may be conflict with
the Jupyter package that a compute session provides by default. Especially, if you
have created `~/.local` directory, the manually installed Jupyter packages
persists for every compute session. In this case, try to remove the `.local`
automount folder and then try to launch Jupyter Notebook again.

### ページのレイアウトが崩れている

Backend.AI Web-UIは、最新のモダンJavaScriptおよび/またはブラウザ機能を利用しています。最新のモダンブラウザ（Chromeなど）を使用してください。

### SFTP 切断

Web-UIアプリがSFTP接続を起動するとき、それはアプリに埋め込まれたローカルプロキシサーバーを使用します。SFTPプロトコルによるファイル転送中にWeb-UIアプリを終了すると、ローカルプロキシサーバーを介して確立された接続が切断されるため、転送は即座に失敗します。このため、計算セッションを使用していない場合でも、SFTPを使用している間はWeb-UIアプリを終了しないでください。ページをリフレッシュする必要がある場合は、Ctrl-Rショートカットを使用することをお勧めします。

Web-UIアプリが閉じられ再起動されても、既存のコンピュートセッションに対してSFTPサービスは自動的に開始されません。希望するコンテナでSSH/SFTPサービスを明示的に開始して、SFTP接続を確立する必要があります。


## 管理者向けトラブルシューティングガイド

### ユーザーは Jupyter Notebook のようなアプリを起動できません。

There may be a problem on connecting WSProxy service. Try to stop and restart
the service by referencing the guide on start/stop/restart WSProxy service.

### 指定されたリソースが実際の割り当てと一致しません。

時々、不安定なネットワーク接続やDockerデーモンのコンテナ管理問題により、Backend.AIによって占有されているリソースとコンテナが実際に使用しているリソースが一致しない場合があります。この場合は、以下の手順に従ってください。

- 管理者アカウントとしてログインします。
- メンテナンスページを訪問してください。
- RECALCULATE USAGEボタンをクリックしてリソースの占有状況を手動で修正します。

### Dockerレジストリにプッシュされた後、イメージが表示されません


:::note
この機能はスーパ管理者にのみ利用可能です。
:::

新しいイメージがBackend.AIのdockerレジストリの1つにプッシュされた場合、そのイメージのメタデータを更新して計算セッションの作成に使用できるようにする必要があります。メタデータの更新は、メンテナンスページで「イメージの再スキャン」ボタンをクリックすることで実行できます。複数のレジストリがある場合、それに属するすべてのdockerレジストリのメタデータが更新されます。

特定のDockerレジストリのメタデータを更新したい場合は、環境ページのレジストリタブに移動できます。目的のレジストリのコントロールパネルにある更新ボタンをクリックするだけです。ゴミ箱アイコンをクリックしてレジストリを削除しないように注意してください。