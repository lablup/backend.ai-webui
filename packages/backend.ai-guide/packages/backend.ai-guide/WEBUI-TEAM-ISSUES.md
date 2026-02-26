# WebUI 팀 전달 이슈 목록

## 1. docs-toolkit 빌드 시스템 문제 (중요도: High)

### 문제 상황
```
Skipping missing file: undefined (en)
HTML generated in 1ms (0 chapters)
```

### 세부사항
- **발생 위치**: `pnpm run preview:html` 실행 시
- **증상**: "undefined" 파일을 찾으려고 시도하며 실패
- **결과**: 0 chapters로 표시되며 실제 콘텐츠 로드 안됨
- **영향**: HTML 미리보기 및 빌드 시스템 전체 기능 장애

### 추정 원인
1. docs-toolkit에서 book.config.yaml 파싱 시 경로 처리 문제
2. 파일 경로 매핑 로직의 버그
3. 언어별 파일 탐색 메커니즘 오류

### 권장 조치
1. docs-toolkit 소스코드에서 "undefined" 오류 발생 지점 확인
2. book.config.yaml 파싱 로직 점검
3. 파일 경로 매핑 메커니즘 디버깅

---

## 2. 계층형 구조의 PDF 생성 이슈 (중요도: Medium)

### 문제 상황
새로운 baidocs-from-gitbook 구조는 3-4단계 깊이의 계층형 구조를 가짐

### 현재 구조 복잡도
```
backend.ai-overview/
  ├── backend.ai-architecture/
  │   ├── service-components/
  │   │   └── README.md
  │   └── README.md
  └── enterprise-applications/
      └── README.md
```

### 예상 문제점
1. **PDF TOC 생성**: 깊은 계층 구조의 목차 처리
2. **네비게이션 복잡성**: 다단계 네비게이션의 PDF 변환
3. **페이지 넘버링**: 계층별 섹션 번호 매기기

### 권장 해결 방안
1. **전처리 스크립트**: 계층형 → 평면형 구조 변환 스크립트 개발
2. **PDF 엔진 업그레이드**: 복잡한 계층 구조 지원하는 PDF 생성 엔진
3. **설정 분리**: HTML용과 PDF용 별도 book.config.yaml

---

## 3. 콘텐츠 매핑 및 검증 이슈 (중요도: Medium)

### 완료된 작업
- ✅ 영어 182개 파일 → 새 구조 매핑 완료
- ✅ 한국어 콘텐츠 → 새 구조 매핑 완료
- ✅ 일본어/태국어 구조 통일 완료

### 필요한 후속 작업
1. **콘텐츠 검증**: 매핑된 파일들이 실제로 올바른 위치에 있는지 검증
2. **누락 파일 보완**: baidocs-from-gitbook에는 있지만 매핑되지 않은 파일들 확인
3. **중복 콘텐츠 정리**: get-started vs getting-started 등 중복 디렉토리 정리

---

## 4. 빌드 시스템 개선 사항 (중요도: Low)

### 개선 제안
1. **오류 내성**: 일부 파일 누락 시에도 빌드 계속 진행
2. **진행 상황 표시**: 대량 파일 처리 시 진행률 표시
3. **검증 도구**: 콘텐츠 완성도 체크 스크립트

---

## 즉시 조치 필요 사항

### 1순위: docs-toolkit "undefined" 오류 수정
- 현재 빌드 시스템이 작동하지 않음
- HTML 미리보기 불가능

### 2순위: 간단한 테스트 환경 구축
- 최소한의 파일로 빌드 테스트 가능한 환경
- 점진적으로 콘텐츠 추가하며 문제 지점 파악

### 3순위: PDF 생성 전략 수립
- 계층형 구조의 PDF 생성 방안 결정
- 필요시 전처리 도구 개발 계획

---

## 연락처 및 후속 조치

**작업 완료 일시**: 2026-02-26
**담당**: Claude (Backend.AI 가이드 구조 정렬 프로젝트)
**상태**: 구조 정렬 완료, 빌드 시스템 이슈 전달

**다음 단계**: WebUI 팀의 docs-toolkit 수정 후 전체 빌드 테스트 필요