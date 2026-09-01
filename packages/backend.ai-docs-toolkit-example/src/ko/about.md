# 소개

이 패키지는 `backend.ai-webui` 모노레포 안에서 두 가지 역할을 합니다:

1. **보일러플레이트** — `backend.ai-docs-toolkit`을 자신의 문서에 사용하려는
   개발자를 위한 복사-붙여넣기 시작 프로젝트입니다. 구조가 일부러 최소한이니
   필요에 따라 늘리거나 줄이면 됩니다.
2. **테스트 픽스처** — 툴킷의 통합 테스트가 이 패키지를 빌드해서 렌더링된
   웹 사이트와 PDF를 검증합니다. 픽스처를 같은 레포 안에 두면, 툴킷 변경이
   예제를 깨는 순간 즉시 표면화됩니다 — 다음 다운스트림 사용자의 배포까지
   기다리지 않습니다.

> [!NOTE]
> 여기 한국어(`ko`) 콘텐츠는 PDF 파이프라인의 CJK 폰트 코드 패스를 실행하기
> 위한 짧은 예시이며, 어떤 제품의 번역 검수도 아닙니다.

## 라이선스

LGPL-3.0-or-later — 레포 나머지와 동일.

## 실제 툴킷 위치

- 소스: `packages/backend.ai-docs-toolkit/`
- 아키텍처 노트: `packages/backend.ai-docs-toolkit/ARCHITECTURE.md`
- 실제 다운스트림 사용처: `packages/backend.ai-webui-docs/` (Backend.AI WebUI
  사용자 매뉴얼 — 큰 규모, 다중 버전, 4개 언어)
