---
title: Forklift Key Concepts
order: 190
---
# Forklift Key Concepts

:::info
**This feature is deprecated.**
:::

Forklift is a container image creation tool designed to work with Backend.AI, enabling users to automatically generate Docker container images for computational sessions and supporting optimized deployment. It addresses the inconvenience of having to manually add Backend.AI configurations and rebuild images when users want to use their own custom images instead of the preset images provided by Backend.AI.&#x20;



**List of supported features**

* Automatic image build
* Ability to view image build schedule information and requests
* 이미지 빌드에 사용된 Dockerfile 미리보기 및 다운로드
* 호스트에 생성된 이미지 리스트 확인, 삭제 및 분석 기능
* 현재 실행중인 컨테이너 확인 기능
* Container Commit



### Notice of Forklift deprecation

2025년 현재를 기점으로 Forklift의 지원은 중단되었습니다. Backend.AI 24.03 버전에 사용자가 세션 안에서 컨테이너를 커밋할 수 있는 기능이 추가되었고, Backend.AI 24.09 버전에서 별도 레이블이 없는 임의의 컨테이너 이미지를 기술절차 없이 실행할 수 있게 되면서 Forklift 기능은 Backend.AI 내부로 편입되었음을 참고해 주십시오.
