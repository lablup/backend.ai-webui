# 付録

## GPU仮想化および分数GPU割り当て

Backend.AI supports GPU virtualization technology which allows single physical
GPU can be divided and shared by multiple ユーザーs simultaneously. Therefore, if
you want to execute a task that does not require much GPU computation
capability, you can create a compute session by allocating a portion of the GPU.
The amount of GPU resources that 1 fGPU actually allocates may vary from system
to system depending on 管理者istrator settings. For example, if the 管理者istrator
has set one physical GPU to be divided into five pieces, 5 fGPU means 1 physical
GPU, or 1 fGPU means 0.2 physical GPU. If you set 1 fGPU when creating a compute
session, the session can utilize the streaming multiprocessor (SM) and GPU
memory equivalent to 0.2 physical GPU.

このセクションでは、GPUの一部を割り当てて計算セッションを作成し、その計算コンテナ内で認識されたGPUが本当に部分的な物理GPUに対応しているかどうかを確認します。

First, let's check the type of physical GPU installed in the
host node and the amount of memory. The GPU node used in this guide is equipped
with a GPU with 8 GB of memory as in the following figure. And through the
管理者istrator settings, 1 fGPU is set to an amount equivalent to 0.5 physical
GPU (or 1 physical GPU is 2 fGPU).

![](images/host_gpu.png)

Now let's go to the セッション page and create a compute session by allocating 0.5
fGPU as follows:

![](images/session_launch_dialog_with_gpu.png)

In the AI Accelerator panel of the session list, you can see that
0.5 fGPU is allocated.

![](images/session_list_with_gpu.png)

Now, let's connect directly to the container and check if the allocated GPU
memory is really equivalent to 0.5 units (~2 GB). Let's bring up a web
terminal. When the terminal comes up, run the `nvidia-smi` command. As you can
see in the following figure, you can see that about 2 GB of GPU memory is
allocated. This shows that the physical GPU is actually divided into quarters and allocated inside the
container for this compute session, which is not possible by a way like PCI passthrough.

![](images/nvidia_smi_inside_container.png)

Jupyter Notebookを開いて、シンプルなMLトレーニングコードを実行しましょう。

![](images/mnist_train.png)

While training is in progress, connect to the shell of the GPU host node and
execute the `nvidia-smi` command. You can see that there is one GPU attached
to the process and this process is occupying about 25% of the resources of the
physical GPU. (GPU occupancy can vary greatly depending on training code and GPU
model.)

![](images/host_nvidia_smi.png)

Alternatively, you can run the `nvidia-smi` command from the web terminal to query the GPU usage history inside the container.


## 自動ジョブスケジューリング

Backend.AIサーバーには、独自開発されたタスクスケジューラーが組み込まれています。これにより、すべてのワーカーノードの利用可能なリソースを自動的にチェックし、ユーザーのリソース要求を満たすワーカーに対してコンピュートセッションの作成を委任します。さらに、リソースが不足している場合、ユーザーのコンピュートセッションの作成要求は、ジョブキューのPENDING状態として登録されます。その後、リソースが再び利用可能になると、保留された要求が再開されてコンピュートセッションの作成が行われます。

ジョブスケジューラの動作は、ユーザーWeb-UIから簡単に確認することができます。GPUホストが最大2つのfGPUを割り当てることができる場合、それぞれ1つのfGPUの割り当てを要求する3つのコンピュートセッションを同時に作成してみましょう。セッション起動ダイアログのカスタム割り当てセクションには、GPUとセッションのスライダーがあります。セッションに1より大きい値を指定してLAUNCHボタンをクリックすると、セッションの数が同時に要求されます。GPUとセッションをそれぞれ1と3に設定してみましょう。これは、合計3つのfGPUを要求する3つのセッションが、2つのfGPUしか存在しないときに作成される状況です。

![](images/session_launch_dialog_2_sessions.png)

しばらく待つと、3つのコンピュートセッションが一覧表示されるのが見えます。ステータスパネルをよく見ると、3つのコンピュートセッションのうち2つはRUNNING状態ですが、もう1つのコンピュートセッションはPENDING状態のままであることがわかります。このPENDINGセッションはジョブキューに登録されているだけで、不十分なGPUリソースのために実際にはコンテナが割り当てられていません。

![](images/pending_session_list.png)

それでは、RUNNING状態にある2つのセッションのうち1つを削除しましょう。すると、PENDING状態にあるコンピュートセッションがジョブスケジューラによってリソースが割り当てられ、すぐにRUNNING状態に変わることが確認できます。このようにして、ジョブスケジューラはユーザーのコンピュートセッションリクエストを保持するためにジョブキューを利用し、リソースが利用可能になると自動的にリクエストを処理します。

![](images/pending_to_running.png)


## マルチバージョン機械学習コンテナサポート

Backend.AIは、さまざまなプリビルドのMLおよびHPCカーネルイメージを提供しています。したがって、ユーザーは主要なライブラリやパッケージを自分でインストールすることなく、すぐに利用することができます。ここでは、複数バージョンの複数のMLライブラリを即座に活用する例を説明します。

セッションページに移動し、セッション起動ダイアログを開きます。インストール設定によっては、さまざまなカーネルイメージがあるかもしれません。

![](images/various_kernel_images.png)

Here, let's select the TensorFlow 2.3 environment and created a session.

![](images/session_launch_dialog_tf23.png)

Open the web terminal of the created session and run the following Python
command. You can see that TensorFlow 2.3 version is installed.

![](images/tf23_version_print.png)

This time, let's select the TensorFlow 1.15 environment to create a compute
session. If resources are insufficient, delete the previous session.

![](images/session_launch_dialog_tf115.png)

Open the web terminal of the created session and run the same Python command as
before. You can see that TensorFlow 1.15(.4) version is installed.

![](images/tf115_version_print.png)

Finally, create a compute session using PyTorch version 1.7.

![](images/session_launch_dialog_pytorch17.png)

Open the web terminal of the created session and run the following Python
command. You can see that PyTorch 1.8 version is installed.

![](images/pytorch17_version_print.png)

このように、TensorFlowやPyTorchなどの主要なライブラリのさまざまなバージョンを、Backend.AIを通じてインストールの手間をかけずに利用することができます。


## コンピュートセッションを新しいプライベートDockerイメージに変換する

実行中のコンピュートセッション（コンテナ）を、新しいコンピュートセッションを作成するために後で利用できる新しいDockerイメージに変換したい場合は、コンピュートセッション環境を準備し、管理者に変換を依頼する必要があります。

- まず、必要なパッケージをインストールし、設定を好みに合わせて調整して、コンピュートセッションを準備します。

  .. note``
If you want to install OS packages, for example via `apt` command, it
usually requires the `sudo` privilege. Depending on the security policy
of the institute, you may not be allowed to use `sudo` inside a
container.

It is recommended to use [automount folder<using-automount-folder>](#automount folder<using-automount-folder>) to
install [Python packages via pip<install_pip_pkg>](#Python packages via pip<install_pip_pkg>). However, if you
want to add Python packages in a new image, you should install them with
`sudo pip install <package-name>` to save them not in your home but in
the system directory. The contents in your home directory, usually
`/home/work__PROTECTED_8____PROTECTED_9____PROTECTED_10____PROTECTED_11____PROTECTED_12____PROTECTED_13____PROTECTED_14__`
いくつかのトレーニングを行った後で、結果とともに訓練されたモデルを比較することができます。

![](images/mlflow_multiple_execution.png)