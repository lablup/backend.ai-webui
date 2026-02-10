# Backend.AI クラスターコンピュートセッション


   Cluster compute session feature is supported from Backend.AI server 20.09 or
   higher.

### Backend.AI クラスター コンピュート セッションの概要

Backend.AI supports cluster compute session to support distributed computing /
training tasks. A cluster session consists of multiple containers, each of which
is created across multiple Agent nodes. Containers under a cluster session are
automatically connected each other through a dynamically-created private
network. Temporary domain names (`main1`, `sub1`, `sub2`, etc.) are also
given, making it simple to execute networking tasks such as SSH接続ion. All
the necessary secret keys and various settings for SSH接続ion between
containers are automatically generated.

Backend.AI クラスターセッションの詳細については、以下を参照してください。

![](images/overview_cluster_session.png)

- クラスタセッション下のコンテナは、リソースグループに属する1台以上のエージェントノードにわたって作成されます。
- A cluster session consists of one main container (`main1`) and one or more
  sub containers (`subX`).
- クラスターセッションの下にあるすべてのコンテナは、同じ量のリソースを割り当てて作成されます。上の図では、セッションXの4つのコンテナすべてが同じ量のリソースで作成されています。
- クラスターセッション内のすべてのコンテナは、コンピュートセッションを作成するときに指定された同じデータフォルダーをマウントします。
- クラスターセッション下のすべてのコンテナはプライベートネットワークに結びつけられます。

   * The name of the main container is `main1`.
   * Sub-containers are named as `sub1`, `sub2`, ... in the increasing
     order.
   * クラスターセッションを構成するコンテナ間にファイアウォールはありません。
   * ユーザーはメインコンテナに直接接続でき、サブコンテナにはメインコンテナからのみ接続できます。

- クラスタセッションには、2つのモード/タイプがあります。

   * 単一ノードクラスターセッション: 1つの同一のエージェントノード上で2つ以上のコンテナから構成されるクラスターセッション。上の図では、これはローカルブリッジネットワークにバインドされたセッションZです。
   * マルチノードクラスターセッション: 異なるエージェントノード上の2つ以上のコンテナで構成されるクラスターセッション。上の図では、これはオーバーレイネットワークにバインドされているセッションXです。
   * 1 つのコンテナしかない計算セッションは、クラスタセッションではなく通常の計算セッションとして分類されます。上の図では、これがセッション Y です。

- 単一ノードクラスターセッションは、以下の場合に作成されます。

   * When "Single Node" is selected for Cluster mode field when creating a
     compute session. If there is no single agent with enough resources to
     create all containers at the same time, the session will stay in a pending
     (`PENDING`) state.
   * 「マルチノード」がクラスター モードとして選択されているが、全てのコンテナを同時に作成できる十分なリソースを持つ単一のエージェントが存在する場合、全てのコンテナはそのエージェントにデプロイされる。これは外部ネットワークへのアクセスを排除し、ネットワーク遅延を可能な限り削減するためである。

クラスターセッション内の各コンテナには、以下の環境変数があります。これを参照してクラスターの構成や現在接続されているコンテナ情報を確認することができます。

- `BACKENDAI_CLUSTER_HOST`: the name of the current container (ex. `main1`)
- `BACKENDAI_CLUSTER_HOSTS`: Names of all containers belonging to the current
  cluster session (ex. `main1,sub1,sub2`)
- `BACKENDAI_CLUSTER_IDX`: numeric index of the current container (ex. `1`)
- `BACKENDAI_CLUSTER_MODE`: Cluster session mode/type (ex. `single-node`)
- `BACKENDAI_CLUSTER_ROLE`: Type of current container (ex. `main`)
- `BACKENDAI_CLUSTER_SIZE`: Total number of containers belonging to the
  current cluster session (ex. `4`)
- `BACKENDAI_KERNEL_ID`: ID of the current container
  (ex. `3614fdf3-0e04-...`)
- `BACKENDAI_SESSION_ID`: ID of the cluster session to which the current
  container belongs (ex. `3614fdf3-0e04-...`). The main container's
  `BACKENDAI_KERNEL_ID` is the same as `BACKENDAI_SESSION_ID`.


### Backend.AI クラスターコンピュートセッションの使用

このセクションでは、ユーザーGUIを通じて実際にクラスタコンピュートセッションを作成および使用する方法を見ていきます。

セッションページで、セッション作成ダイアログを開き、通常の計算セッションを作成するのと同じ方法で設定します。このときに設定するリソース量は、**1つのコンテナ**に割り当てられる量です。例えば、4つのCPUを設定した場合、クラスタセッションの下で各コンテナに4コアが割り当てられます。これは、クラスタ計算セッション全体に割り当てられるリソース量ではないことに注意してください。クラスタ計算セッションを作成するには、ここで設定したリソース量のN倍に相当するサーバーリソースが必要です（Nはクラスタのサイズです）。データの安全保存のためにデータフォルダーをマウントすることを忘れないでください。

![](images/session_launch_dialog.png)

下部にある「クラスターモード」フィールドで、作成したいクラスターのタイプを選択できます。

- 単一ノード: すべてのコンテナは1つのエージェントノード上に作成されます。
- マルチノード：コンテナはリソースグループ内の複数のエージェントノードにわたって作成されます。ただし、すべてのコンテナを1つのエージェントノードで作成できる場合は、すべてそのノード上で作成されます。これはコンテナ間のネットワーク遅延を最小限に抑えるためです。

その下の「クラスターサイズ」を設定します。3に設定すると、メインコンテナを含む合計3つのコンテナが作成されます。これらの3つのコンテナは、プライベートネットワークで結合され、1つの計算セッションを形成します。

Click the LAUNCH button to send a request to create a compute session, and wait
for a while to get a cluster session. After the session is created, you can view
the created containers on the session details page.

![](images/cluster_session_created.png)

Let's open the terminal app in the compute session we just have created. If you
look up the environment variables, you can see that the `BACKENDAI_CLUSTER_*`
variables described in the above section are set. Compare the meaning and value
of each environment variable with the description above.

![](images/terminal_on_main_container.png)

You can also SSH into the `sub1` container. No separate SSH setting is
required, just issue the command `ssh sub1` and you are done. You can see the
hostname after `work@` has changed, which indicated the sub container's shell
is displayed.

![](images/terminal_on_sub1_container.png)

このように、Backend.AI はクラスタコンピューティングセッションの作成を容易にします。クラスタ計算セッションを通じて分散学習と計算を実行するには、TensorFlow/PyTorch などの ML ライブラリが提供する分散学習モジュールや、Horovod、NNI、MLFlow などの追加のサポートソフトウェアが必要であり、そのソフトウェアを利用できる方法でコードを記述する必要があります。慎重に書く必要があります。Backend.AI は分散学習に必要なソフトウェアを含むカーネルイメージを提供しているため、そのイメージを使用して優れた分散学習アルゴリズムを作成することができます。

### コンテナごとのログを表示

From 24.03, You can check each log of container in logs modal. It will help you
to understand what's going on not only in `main` container but also `sub` containers.

![](images/log_modal_per_container.png)