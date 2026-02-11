# 세션 페이지

In Backend.AI, a `session` represents an isolated compute environment where 일반 사용자s can run code, train models, or perform data analysis using allocated resources.
Each session is created based on 일반 사용자-defined configurations such as runtime image, resource size, and environment settings.
Once started, the session provides access to interactive applications, terminals, and logs, allowing 일반 사용자s to manage and monitor their workloads efficiently.

![](images/sessions_page.png)


## 자원 요약 패널
‘세션’ 페이지 상단에는 CPU, RAM, AI 가속기 등 사용 가능한 컴퓨팅 자원을 표시하는 패널이 있습니다. 필요한 정보에 따라 '나의 총자원 제한', '자원 그룹별 나의 자원', '자원 그룹별 총자원' 등 다양한 패널로 전환하여 필요한 정보를 확인할 수 있습니다. 표시할 패널을 변경하려면 '설정' 버튼을 사용하세요.

![](images/panel_settings.png)

For more detailed information about resource panels and their metrics, please refer to the [dashboard](#dashboard) page.


## 세션 목록
The '세션 (Sessions)' section displays a list of all active and completed compute sessions.
You can filter sessions by type — `Interactive`, `Batch`, `Inference`, or `Upload Sessions` — and switch between
`Running` and `Finished` tabs to manage sessions.

기본적으로 세션 이름, 상태, 할당된 자원(AI 가속기, CPU, 메모리), 경과 시간, 슈퍼 관리자용 에이전트 및 소유자 이메일 등을 볼 수 있습니다. 테이블 오른쪽 하단의 '설정' 버튼을 클릭하여 더 많은 컬럼을 보이게 하거나 특정 컬럼을 숨길 수 있습니다.

![](images/session_table_settings.png)