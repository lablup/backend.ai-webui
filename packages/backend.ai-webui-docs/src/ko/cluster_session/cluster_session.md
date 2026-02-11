# Backend.AI 클러스터 연산 세션


   Cluster compute session feature is supported from Backend.AI server 20.09 or
   higher.

### Backend.AI 클러스터 연산 세션 개괄

Backend.AI supports cluster compute session to support distributed computing /
training tasks. A cluster session consists of multiple containers, each of which
is created across multiple Agent nodes. Containers under a cluster session are
automatically connected each other through a dynamically-created private
network. Temporary domain names (`main1`, `sub1`, `sub2`, etc.) are also
given, making it simple to execute networking tasks such as SSH connection. All
the necessary secret keys and various settings for SSH connection between
containers are automatically generated.

Backend.AI 클러스터 세션의 상세 특징은 다음을 참고하십시오.

![](images/overview_cluster_session.png)

- 클러스터 세션을 구성하는 컨테이너는 한 자원 그룹에 속한 하나 이상의 Agent 노드에 걸쳐 생성됩니다.
- A cluster session consists of one main container (`main1`) and one or more
  sub containers (`subX`).
- 모든 구성 컨테이너는 동일한 자원을 할당하여 생성됩니다. 위 그림에서 session X의 네 개 컨테이너는 모두 동일한 양의 자원으로 생성됩니다.
- 모든 구성 컨테이너는 연산 세션 생성 시 지정한 데이터 폴더를 동일하게 마운트합니다.
- 모든 구성 컨테이너는 사설 네트워크로 묶입니다.

   * The name of the main container is `main1`.
   * Sub-containers are named as `sub1`, `sub2`, ... in the increasing
     order.
   * 한 클러스터 세션을 구성하는 컨테이너 사이에는 별도의 방화벽이 없습니다.
   * 사용자는 메인 컨테이너에 직접 접속할 수 있으며, 서브 컨테이너는 메인 컨테이너에 먼저 접속한 후 메인 컨테이너 내에서 접속할 수 있습니다.

- 두 가지 모드/형태의 클러스터 세션이 있습니다.

   * 단일 노드 클러스터 세션: 하나의 Agent 노드에서 두 개 이상의 컨테이너를 묶어 구성한 클러스터 세션입니다. 위 그림에서는 session Z가 이에 해당하며 로컬 브릿지 네트워크로 묶입니다.
   * 멀티 노드 클러스터 세션: 두 개 이상의 컨테이너를 서로 다른 Agent 노드에 배치해서 구성한 클러스터 세션입니다. 위 그림에서는 session X가 이에 해당하며, 오버레이 네트워크로 묶입니다.
   * 하나의 컨테이너를 가지는 연산 세션은 클러스터 세션이 아닌 일반 연산 세션으로 분류합니다. 위 그림에서는 session Y가 이에 해당합니다.

- 다음과 같은 경우에는 단일 노드 클러스터 세션이 생성됩니다.

   * When "Single Node" is selected for Cluster mode field when creating a
     compute session. If there is no single agent with enough resources to
     create all containers at the same time, the session will stay in a pending
     (`PENDING`) state.
   * 연산 세션 생성 시 Cluster mode에 “Multi Node”를 선택했으나, 모든 컨테이너를 동시에 생성할 수 있는 자원을 가진 단일 Agent가 있을 경우, 그 Agent에 모든 컨테이너를 배치합니다. 이는 가능한 외부 네트워크를 배제하여 연산 세션을 구성하여 네트워크 지연시간을 줄기 위함입니다.

클러스터 세션의 각 컨테이너에는 다음과 같은 환경 변수가 지정됩니다. 클러스터 및 현재 접속된 컨테이너 정보를 확인하기 위해서 참고할 수 있습니다.

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


### Backend.AI 클러스터 연산 세션의 사용

이번 절에서는 실제로 사용자 GUI를 통해 클러스터 연산 세션을 생성하고 사용하는 법에 관해 알아보겠습니다.

세션 (Sessions) 페이지에서 연산 세션 생성 다이얼로그를 띄운 후 일반 연산 세션을 생성하는 것과 같은 방식으로 설정합니다. 이 때 설정한 자원의 양은 하나의 **컨테이너에** 할당되는 양입니다. 예를 들어, CPU를 4개로 설정한 경우 클러스터 세션을 구성하는 각 컨테이너에 4 코어 CPU가 할당됩니다. 클러스터 연산 세션 전체에 할당되는 자원 양이 아니라는 점에 유의 하십시오. 클러스터 연산 세션을 생성하기 위해서는 여기서 설정한 자원양의 N배에 해당하는 서버 자원이 필요합니다 (N은 클러스터 크기). 데이터 보존을 위해 데이터 폴더를 마운트하는 것도 잊지 마십시오.

![](images/session_launch_dialog.png)

아래쪽에 있는 “Cluster mode” 필드에서 원하는 클러스터 생성 형태를 결정할 수 있습니다.

- Single Node: 모든 구성 컨테이너는 하나의 Agent 노드에 생성됩니다.
- Multi Node: 구성 컨테이너는 자원 그룹 내에 있는 여러 Agent 노드에 걸쳐 생성됩니다. 다만, 모든 컨테이너가 하나의 Agent 노드에 생성될 수 있는 경우에는, 하나의 Agent 노드에 우선 생성합니다. 이는 컨테이너 간 통신 과정에서 네트워크 지연 시간을 최대한 줄이기 위함입니다.

그 아래에 있는 “Cluster size”를 설정합니다. 3으로 설정할 경우, 메인 컨테이너를 포함해서 총 세 개의 컨테이너가 생성됩니다. 이 세 개의 컨테이너는 사설 네트워크로 묶여 하나의 연산 세션을 구성합니다.

LAUNCH 버튼을 클릭하여 연산 세션 생성 요청을 보내고 잠시 기다리면 클러스터 세션이 생성됩니다. 세션 생성 이후에, 세션 상세 페이지에서 생성된 3개의 컨테이너를 확인할 수 있습니다.

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

이런 방식으로 Backend.AI 에서는 클러스터 연산 세션을 손쉽게 생성할 수 있습니다. 클러스터 연산 세션을 통해 분산 학습 및 연산을 실행하기 위해서는, TensorFlow/PyTorch 등 ML 라이브러리에서 제공하는 분산 학습용 모듈이나 Horovod, NNI, MLFlow 등과 같은 별도의 지원 소프트웨어가 필요하고, 해당 소프트웨어을 활용할 수 있는 방식으로 코드를 주의깊게 작성해야 합니다. Backend.AI에서는 분산 학습에 필요한 소프트웨어를 포함하는 커널 이미지를 제공하고 있으므로, 해당 이미지를 사용해서 멋진 분산 학습 알고리즘을 만들어 보실 수 있습니다.

### 컨테이너 별 로그 확인하기

From 24.03, You can check each log of container in logs modal. It will help you
to understand what's going on not only in `main` container but also `sub` containers.

![](images/log_modal_per_container.png)