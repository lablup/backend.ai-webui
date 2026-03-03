---
title: Backend.AI 아키텍처
order: 3
---
# Backend.AI 아키텍쳐

이 섹션에서는 이 설명서를 이해하고 따르는 데 필요한 핵심적인 개념을 설명합니다.

<figure><img src="../../images/server-architecture.svg" alt=""><figcaption><p>Fig. 1 The diagram of a typical multi-node Backend.AI server architecture</p></figcaption></figure>

그림 1. 은 설치 및 구성에 필요한 구성요소를 보여주는 Backend.AI의 서버 측 다이어그램입니다.



각 구성 요소들은 동일한 서버에서 실행되도록 되어 있지만, 필요에 따라 여러 서버로 분할하거나 여러 개의 그룸을 단일 서버로 병합할 수 있습니다. 예를 들어, nginx reverse-proxy와 Backend.AI Manager를 별도의 서버에서 실행하거나, 단일 서버에서 두 개를 모두 실행할 수 있습니다. 개발 설정에서 이같은 구성 요소는 사용자의 노트북, 혹은 데스크톱과 같은 단일 환경(PC)에서 실행됩니다.
