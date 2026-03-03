---
title: GUI를 이용하여 빌드하기
order: 123
---
# GUI를 이용하여 빌드하기

:::info
**해당 기능은 더 이상 지원되지 않는 기능입니다.**
:::

### 이미지 빌드하기

<figure><img src="../../images/image (1).png" alt=""><figcaption></figcaption></figure>

1. Start Menu 페이지에 있는 `BUILD` 버튼을 누릅니다.
   1. 사이드바의 BUILDER 버튼을 클릭하여 Page Builder를 불러올 수도 있습니다.

<figure><img src="../../images/image (1) (1).png" alt=""><figcaption></figcaption></figure>

2. 기반이 될 이미지를 **`Source docker image`** 에 입력합니다.
3. 소스 이미지를 기반으로 새롭게 생성할 이미지를 **`Target docker image`** 에 입력합니다.
4. 원하는 옵션을 추가하여 이미지 커스터마이징이 가능합니다.
   * **자원 제약: `Minimum required CPU cores`**, **`Minimum required memory size`** 등의 옵션을 설정하여 생성하려는 이미지가 요구하는 최소 자원을 제약할 수 있습니다.
   * **서비스 포트(Service ports):** 서비스 포트 지정을 통해 특정 서비스를 컨테이너의 특정 포트로 열게 됩니다. 사용자는 서비스 포트에 등록된 서비스를 Backend.AI 환경을 통해 활용할 수 있습니다.&#x20;
   * **환경 변수(Environment variable):** 컨테이너 내부에 쓰일 배열이 아닌 환경 변수를 추가할 수 있습니다.
   * **커스텀 패키지(Custom packages):** 설치하고 싶은 apt / pip / conda 패키지를 사전지정할 수 있습니다.
   * **이미지 자동 푸시(Auto push docker image): `Auto push docker image`** 옵션으로 생성한 이미지를 도커 허브로 푸시할 수 있습니다. 레지스트리는 **`Source docker image`** 옵션에 작성한 것으로 지정됩니다.
   * **루트 권한 허용(Allow root):** `Allow root` 옵션을 허용하면 일반 유저가 `sudo` 명령어를 사용하여 root 권한의 명령을 내릴 수 있습니다.
5. 모든 과정을 마친 경우, 하단의 **`BUILD`** 버튼을 눌러 빌드를 시작합니다.
