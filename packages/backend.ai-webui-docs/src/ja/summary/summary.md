This feature is deprecated, so please use the [dashboard<dashboard>](#dashboard<dashboard>) page going forward. Also, technical support
   and bug fixes for this feature are no longer provided. Please understand that issues may not be addressed.

# サマリーページ

On the サマリー page, ユーザーs can check resource status and session usage.

![](images/summary.png)

### リソース統計情報

ユーザーが割り当てることができるリソースの総量と、現在割り当てられているリソースの量を表示します。ユーザーのCPU、メモリ、およびGPUリソースの占有率とクォータをそれぞれ確認できます。また、セッションスライダーでは、同時に作成できるコンピュートセッションの最大数と、現在実行中のコンピュートセッションの数を確認できます。

リソースグループは、上部のリソースグループフィールドをクリックすることで変更できます。リソースグループは、複数のエージェントノードを単一のリソース単位としてグループ化するための概念です。多数のエージェントノードがある場合、それらを特定のプロジェクトに割り当てるなど、各リソースグループに対して設定を構成できます。エージェントノードが1つしかない場合、1つのリソースグループしか表示されないのが通常です。リソースグループを変更すると、そのリソースグループが保有するリソース（エージェントが属する）によって、リソースの量が変わる場合があります。

### システムリソース

それは、Backend.AI システムに接続されているエージェントワーカーノードの数と、現在作成されている計算セッションの総数を表示します。エージェントノードの CPU、メモリ、GPU の利用率も確認できます。通常のユーザーとしてログインしている場合は、作成した計算セッションの数のみが表示されます。

### 招待

他のユーザーがストレージフォルダを共有した場合、ここに表示されます。共有リクエストを承認すると、データ & ストレージフォルダ内で共有フォルダを閲覧およびアクセスできます。アクセス権は、共有リクエストを送信したユーザーによって決まります。もちろん、共有リクエストを拒否することもできます。

### Backend.AI Web UI アプリのダウンロード

Backend.AI WebUI supports desktop applications.
By using desktop app, you can use desktop app specific features, such as [SSH/SFTP connection to a Compute Session<ssh-sftp-container>](#SSH/SFTP connection to a Compute Session<ssh-sftp-container>) .
For now Backend.AI WebUI provides desktop application with following OS:

- ウィンドウズ
- Linux
- マック


   When you click the button that match with your local environment (e.g. OS, Architecture), It will automatically downloads the same version of current webUI version.
   If you want to download later or former version of WebUI as a desktop app, please visit [here](https://github.com/lablup/backend.ai-webui/releases?page=1) and download the desired version(s).