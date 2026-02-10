# Sign up and Log in

## Sign up

When you launch the WebUI, log in dialog appears. If you haven't signed up
yet, press the SIGN UP button.

![](images/login_dialog.png)

必要な情報を入力し、利用規約/プライバシーポリシーを読み同意した上で、SIGNUPボタンをクリックしてください。システム設定によっては、サインアップに招待トークンを入力する必要がある場合があります。あなたのメールアドレスであることを確認するための確認メールが送信されることがあります。確認メールが送信された場合は、メールを読んで内部のリンクをクリックし、検証を通過した後にアカウントでログインする必要があります。

![](images/signup_dialog.png)


   サーバーの構成およびプラグインの設定によっては、匿名ユーザーによるサインアップが許可されていない場合があります。その場合は、システムの管理者に連絡してください。


   悪意のあるユーザーがユーザーのパスワードを推測するのを防ぐために、パスワードは8文字以上で、少なくとも1つのアルファベット、数字、特殊文字を含むべきです。

## Log in

IDとパスワードを入力し、LOGINボタンを押してください。API ENDPOINTには、リクエストをマネージャーに中継するBackend.AI WebserverのURLを入力する必要があります。


   Webサーバーのインストールおよびセットアップ環境によっては、エンドポイントが固定されており、構成ができない場合があります。


   Backend.AI は、ユーザーのパスワードを一方向ハッシュを通じて安全に保持します。BSDのデフォルトパスワードハッシュであるBCryptが使用されるため、サーバーの管理者でもユーザーのパスワードを知ることはできません。

After logging in, you can check the information of the current resource usage in
the サマリー tab.

右上のアイコンをクリックすると、サブメニューが表示されます。ログアウトメニューを選択するとログアウトできます。

![](images/signout_button.png)


## パスワードを忘れた場合

If you have forgotten your password, you can click the CHANGE PASSWORD button on
the log in panel to email a link to change password. You can change your password
by reading and following the instruction. Depending on the server settings, the
password change feature may be disabled. In this case, contact the
管理者istrator.

![](images/forgot_password_panel.png)


   これはモジュール式の機能でもあるため、システムによってはパスワード変更ができない場合があります。


   If log in failure occurs more than 10 times consecutively, access
   to the endpoint is temporarily restricted for 20 minutes for security
   reasons. If the access restriction continues on more than 20 minutes, please contact
   your system 管理者istrator.


## サイドバーメニュー

サイドバーの右側にあるボタンを使って、サイドバーのサイズを変更します。これをクリックすると、サイドバーの幅が大幅に減少し、内容をより広範囲に表示できます。もう一度クリックすると、サイドバーは元の幅に戻ります。
You can also use the shortcut key ( `[` ) to toggle between the narrow and original sidebar widths.


![](images/menu_collapse.png)