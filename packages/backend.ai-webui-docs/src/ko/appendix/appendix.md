# Appendix

## GPU 가상화를 통한 컨테이너 별 GPU 분할 할당

Backend.AI supports GPU virtualization technology which allows single physical
GPU can be divided and shared by multiple 일반 사용자s simultaneously. Therefore, if
you want to execute a task that does not require much GPU computation
capability, you can create a compute session by allocating a portion of the GPU.
The amount of GPU resources that 1 fGPU actually allocates may vary from system
to system depending on 어드민istrator settings. For example, if the 어드민istrator
has set one physical GPU to be divided into five pieces, 5 fGPU means 1 physical
GPU, or 1 fGPU means 0.2 physical GPU. If you set 1 fGPU when creating a compute
session, the session can utilize the streaming multiprocessor (SM) and GPU
memory equivalent to 0.2 physical GPU.

이번에는 GPU 를 일부만 할당하여 연산 세션을 생성한 후 연산 컨테이너 내부에서 인식하는 GPU 가 정말 물리 GPU 의 일부분인지 확인 해보도록 하겠습니다.

First, let's check the type of physical GPU installed in the
host node and the amount of memory. The GPU node used in this guide is equipped
with a GPU with 8 GB of memory as in the following figure. And through the
어드민istrator settings, 1 fGPU is set to an amount equivalent to 0.5 physical
GPU (or 1 physical GPU is 2 fGPU).

![](images/host_gpu.png)

Now let's go to the 세션 (Sessions) page and create a compute session by allocating 0.5
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

이번에는 Jupyter Notebook 을 띄워서 간단한 ML 학습 코드를 실행해보겠습니다.

![](images/mnist_train.png)

While training is in progress, connect to the shell of the GPU host node and
execute the `nvidia-smi` command. You can see that there is one GPU attached
to the process and this process is occupying about 25% of the resources of the
physical GPU. (GPU occupancy can vary greatly depending on training code and GPU
model.)

![](images/host_nvidia_smi.png)

Alternatively, you can run the `nvidia-smi` command from the web terminal to query the GPU usage history inside the container.


## GUI 를 통한 자원 모니터링 및 스케줄링 자동화

Backend.AI 서버는 자체 개발한 작업 스케줄러를 내장하고 있습니다. 자동으로 모든 워커 (worker) 노드의 자원 상태를 확인하여 사용자의 자원 요청에 맞는 워커로 연산 세션 생성 요청을 위임 합니다. 또한, 자원이 부족할 경우에는 일단 작업 큐에 사용자의 연산 세션 생성 요청을 대기 (pending) 시키고 나중에 자원이 다시 가용 상태가 되면 대기 요청을 활성화 해서 연산 세션 생성 작업을 수행하게 됩니다.

사용자 Web-UI에서 간단한 방법으로 작업 스케줄러의 작동을 확인할 수 있습니다. GPU 호스트가 최대 2 단위의 fGPU를 할당 할 수 있는 경우, 1 단위의 fGPU 할당을 요청하는 3 개의 연산 세션을 동시에 생성해 보겠습니다. 세션 시작 대화 상자의 사용자 지정 할당 패널에는 GPU 및 세션 슬라이더가 있습니다. 세션 (Sessions)에서 1보다 큰 값을 지정하고 LAUNCH 버튼을 클릭하면 여러 개의 세션이 동시에 생성됩니다. GPU와 세션 (Sessions)을 각각 1과 3으로 설정하겠습니다. 이는 fGPU가 2 단위밖에 없는 상황에서 총 3 단위의 fGPU를 요청하는 상황입니다.

![](images/session_launch_dialog_2_sessions.png)

잠시 기다리면 세 개의 연산 세션이 나타납니다. 상태 패널을 자세히 살펴보면 세 개의 연산 세션 중 두 개는 RUNNING 상태에 있지만 다른 연산 세션은 PENDING 상태로 남아 있음을 알 수 있습니다. 이 PENDING 세션은 작업 대기열에만 등록되며 GPU 자원 부족으로 인해 실제로 컨테이너 할당을 받지 못했습니다.

![](images/pending_session_list.png)

이제 RUNNING 상태의 세션 두 개 중 하나를 삭제해보겠습니다. 그러면 PENDING 상태의 연산 세션은 곧 작업 스케줄러에 의해 자원을 할당 받고 RUNNING 상태로 변환되는 것을 볼 수 있습니다. 이처럼, 작업 스케줄러는 작업 큐를 활용해 사용자의 연산 세션 요청을 간직하고 있다가 가용 자원이 있을 때 자동으로 요청을 처리하게 됩니다.

![](images/pending_to_running.png)


## Multi-version 머신러닝 컨테이너 지원

Backend.AI 는 다양한 ML 및 HPC 커널 이미지를 사전 빌드하여 제공합니다. 따라서, 사용자는 패키지 설치를 하지 않더라도 주요 라이브러리 및 패키지를 즉시 활용할 수 있습니다. 여기서는 다종 ML 라이브러리의 여러 버전을 즉시 활용하는 예제를 진행합니다.

세션 (Sessions) 페이지로 이동하여 연산 세션 생성 다이얼로그를 엽니다. Backend.AI에서는 설치 환경에 따른 다양한 커널 이미지를 제공합니다.

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

이처럼, Backend.AI 를 통해 TensorFlow, PyTorch 등 주요 라이브러리의 다양한 버전을 불필요한 설치 노력 없이 활용할 수 있습니다.


## 실행 중인 연산 세션을 새로운 사용자 이미지로 변환하는 방법

실행 중인 연산 세션(컨테이너) 환경을 새로운 이미지로 변환하고 추후 연산 세션 생성시 사용하고자 하는 경우, 연산 세션 내 환경을 구성한 후 관리자에게 변환 요청을 할 수 있습니다.

- 먼저, 연산 세션을 준비합니다. 필요한 패키지를 설치하거나 환경을 구성합니다.

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
몇 번의 학습이 끝나면, 모델 학습 결괏값들을 서로 비교해 볼 수 있습니다.

![](images/mlflow_multiple_execution.png)