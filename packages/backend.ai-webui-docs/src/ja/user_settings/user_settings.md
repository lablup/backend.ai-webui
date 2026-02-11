# ユーザー設定


ユーザー設定ページには、右上の人アイコンをクリックした後に表示される「環境設定」メニューを選択することでアクセスできます。ユーザーは、言語設定からの利用環境の変更、SSHキーペア管理、ユーザー設定スクリプトの編集、さらにはベータ機能の使用までを行うことができます。

![](images/preferences.png)


## 一般タブ


![](images/user_settings_page.png)

There are lots of preference menu in 一般タブ. you can search it by search field on top of the section,
or you may just filter that you changed by clicking `Display Only Changes`. If you want to rollback the changes to before,
click Reset button on the right top of the section.

### Enables デスクトップ通知s

デスクトップ通知機能を有効または無効にします。ブラウザとオペレーティングシステムがそれをサポートしている場合、WebUIに表示されるさまざまなメッセージがデスクトップ通知パネルにも表示されます。最初の実行時にオペレーティングシステムから無効化されている場合、ここでオプションがオンになっていてもデスクトップメッセージは表示されないことがあります。このオプションの値に関係なく、WebUI内の通知は引き続き機能します。

### Set Compact Sidebar as Default

このオプションがオンの場合、左のサイドバーはコンパクトな形式（幅が狭く）で表示されます。オプションの変更は、ブラウザを更新すると適用されます。ページを更新せずにサイドバーのタイプを直ちに変更したい場合は、ヘッダー上部の最も左のアイコンをクリックしてください。

### 言語

UIに表示される言語を設定します。現在、Backend.AIは英語と韓国語を含む5つ以上の言語をサポートしています。ただし、ページを更新する前に言語が更新されないUIアイテムがある場合があります。

- Default: Use the operating system's default language.
- English: デフォルト言語として英語を設定します。
- 韓国語: 基本言語を韓国語に設定します
- ブラジルポルトガル語: デフォルト言語としてブラジルポルトガル語を設定します。
- 中国語（簡体字）：中国語（簡体字）をデフォルトの言語に設定します。
- 中国語（繁体字）：デフォルト言語として中国語（繁体字）を設定します。
- French: デフォルトの言語をフランス語に設定します。
- フィンランド語: デフォルト言語としてフィンランド語を設定します。
- ドイツ語: ドイツ語をデフォルトの言語に設定します。
- ギリシャ語: デフォルト言語としてギリシャ語を設定します。
- インドネシア語: インドネシア語をデフォルトの言語として設定します。
- イタリア語: デフォルト言語をイタリア語に設定します。
- 日本語: デフォルト言語として日本語を設定します。
- モンゴル語: デフォルトの言語としてモンゴル語を設定します。
- ポーランド語: デフォルト言語としてポーランド語を設定します。
- ポルトガル語: ポルトガル語をデフォルト言語に設定します。
- ロシア語: ロシア語をデフォルト言語に設定します。
- Spanish: スペイン語をデフォルトの言語に設定します。
- Thai: デフォルトの言語としてタイ語を設定します。
- トルコ語: トルコ語をデフォルト言語に設定します。
- ベトナム語: デフォルトの言語としてベトナム語を設定します。



   Some of translated items may be marked as `__NOT_TRANSLATED__`, which
   indicates the item is not yet translated for that language. Since Backend.AI
   WebUI is open sourced, anyone who willing to make the translation better
   can contribute: https://github.com/lablup/backend.ai-webui.

### 自動更新チェック

新しいWebUIバージョンが検出されると、通知ウィンドウがポップアップします。これは、インターネット接続が利用可能な環境でのみ動作します。

### 自動ログアウト

セッション内でアプリを実行するために作成されたページ（例：Jupyterノートブック、ウェブ端末など）を除き、すべてのBackend.AI WebUIページが閉じられると、自動的にログアウトされます。

### マイキーペア情報

すべてのユーザーは少なくとも1つ以上のキーペアを持っています。下の「設定」ボタンをクリックすると、アクセスキーとシークレットキーのキーペアを見ることができます。メインのアクセスキーペアは一つだけであることを覚えておいてください。

![](images/my_keypair_information.png)


### SSH キーペア管理

WebUIアプリを使用する際、コンピュートセッションに直接SSH/SFTP接続を作成できます。Backend.AIにサインアップすると、公開鍵ペアが提供されます。SSHキーペア管理セクションの右側にあるボタンをクリックすると、次のダイアログが表示されます。右側のコピーボタンをクリックして、既存のSSH公開鍵をコピーできます。ダイアログの下部にあるGENERATEボタンをクリックすると、SSHキーペアを更新できます。SSH公開/秘密鍵はランダムに生成され、ユーザー情報として保存されます。秘密鍵は作成後すぐに手動で保存しない限り、再確認できないことに注意してください。

![](images/ssh_keypair_dialog.png)


   Backend.AIはOpenSSHに基づいたSSHキーペアを使用します。ウィンドウズでは、これをPPKキーに変換することができます。

From 22.09, Backend.AI WebUI supports adding your own ssh keypair in order to provide
flexibility such as accessing to a private repository. In order to add your own ssh keypair, click `ENTER MANUALLY` button. Then, you will see
two text area which corresponds to "public" and "private" key.

![](images/add_ssh_keypair_manually_dialog.png)

please enter the keys inside, and click `SAVE` button. Now you can access to backend.ai session using your own key.

![](images/ssh_keypair_dialog_after.png)

### Edit Bootstrap Script

計算セッションが開始された直後に一度だけスクリプトを実行したい場合は、ここに内容を書いてください。

![](images/edit_bootstrap_script.png)


   The compute session will be at the `PREPARING` status until the bootstrap
   script finishes its execution. Since a ユーザー cannot use the session until it
   is `RUNNING`, if the script contains a long-running tasks, it might be
   better to remove them out of the bootstrap script and run them in a terminal
   app.

### Edit User Config Script

You can write some config scripts to replace the default ones in a compute
session. Files like `.bashrc`, `.tmux.conf.local`, `.vimrc`, etc. can be
customized. The scripts are saved for each ユーザー and can be used when certain
automation tasks are required. For example, you can modify the `.bashrc`
script to register your command aliases or specify that certain files are always
downloaded to a specific location.

上部のドロップダウンメニューを使用して作成したいスクリプトのタイプを選択し、内容を記述します。スクリプトは、SAVE または SAVE AND CLOSE ボタンをクリックして保存できます。DELETE ボタンをクリックするとスクリプトを削除できます。

![](images/edit_user_config_script.png)

### Switch back to the Classic UI

If you want to switch back to the classic Backend.AI interface, enable the following options.

![](images/switch_classic_ui.png)

### Experimental 機能s

You can enable or disable experimental features before they are officially released.

![](images/experimental_features.png)

## LOGSタブ

クライアント側で記録されたさまざまなログの詳細情報を表示します。このページを訪れることで、発生したエラーについて詳しく知ることができます。エラーログを検索したり、フィルタリングしたり、ログを更新したり、右上の「Clear Logs」ボタンをクリックしてログをクリアしたりすることができます。

![](images/user_log.png)


   1つのページにしかログインしていない場合、REFRESHボタンをクリックしても正しく機能していないように見えるかもしれません。ログページはサーバーへのリクエストとサーバーからのレスポンスの集まりです。現在のページがログページである場合、ページを明示的にリフレッシュする以外にサーバーへのリクエストは送信されません。ログが正しく積み重ねられているか確認するには、別のページを開いてREFRESHボタンをクリックしてください。

特定の列を非表示にしたり表示したりしたい場合は、テーブルの右下にある歯車アイコンをクリックしてください。すると、以下のダイアログが表示され、表示したい列を選択することができます。

![](images/logs_table_setting.png)