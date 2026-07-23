# 빠른 시작

**Docs Toolkit Example**에 오신 것을 환영합니다 — `backend.ai-docs-toolkit`을
직접 사용하는 방법을 보여주는 최소한의 보일러플레이트입니다. 이 페이지는
1분 안에 끝까지 읽고 바로 실험을 시작할 수 있도록 일부러 짧게 유지했습니다.

## 툴킷이 제공하는 것

이 툴킷은 작은 마크다운 디렉토리를 입력으로 받아 다음을 생성합니다.

- 사이드바, 우측 "이 페이지" 목차, 검색, 버전 셀렉터를 갖춘 다국어 정적 사이트
- 라틴 문자와 CJK 폰트가 임베드된 언어별 PDF
- 작성 중에 유용한, 라이브 리로드를 지원하는 HTML 미리보기 서버

## 이 예제의 구성

```
packages/backend.ai-docs-toolkit-example/
├── docs-toolkit.config.yaml   # 툴킷 설정 (테마, 브랜딩, 버전)
├── src/
│   ├── book.config.yaml       # 내비게이션, 언어, 문서 제목
│   ├── en/                    # 영문 콘텐츠
│   └── ko/                    # 한국어 콘텐츠 (CJK 폰트 테스트 픽스처)
└── assets/
    └── logo.svg               # 커스텀 브랜드 로고
```

## 실행해보기

사이트와 PDF를 빌드합니다:

```shellsession
$ pnpm --filter backend.ai-docs-toolkit-example build:web
$ pnpm --filter backend.ai-docs-toolkit-example pdf
```

또는 라이브 미리보기를 실행합니다:

```shellsession
$ pnpm --filter backend.ai-docs-toolkit-example serve:web:ko
Server listening on http://localhost:3458
```

## 다음 단계

[기능](features.md) 챕터에서 툴킷이 지원하는 콘텐츠 블록(주의 박스, 코드 블록,
이미지)을 살펴본 다음, [커스터마이징](customization.md)에서 브랜드 색상, 로고,
버전 목록을 어떻게 재정의하는지 확인해 보세요.
