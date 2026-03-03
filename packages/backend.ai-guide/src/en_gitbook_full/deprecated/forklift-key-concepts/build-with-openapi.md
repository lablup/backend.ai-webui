---
title: Build with OpenAPI
order: 191
---
# Build with OpenAPI

:::info
**This feature is deprecated.**
:::

Forklift는 FastAPI의 기능 중 하나인 Swagger (OpenAPI)를 기반으로 자동 문서화를 제공합니다.

이를 통해 API를 쉽게 이용하거나 테스트 할 수 있습니다.

<figure><img src="../../images/image (2) (1) (1) (1).png" alt=""><figcaption></figcaption></figure>

### 회원가입

1. **`/register/`** API를 통해 인증을 수행하면 자물쇠가 채워진 API를 사용할 수 있습니다.
2. 만약 GUI를 통해 가입을 마쳤다면, `Authorize` 버튼을 통해 기존 등록 계정으로의 로그인이 가능합니다.

### &#x20;이미지 빌드

1. **`/build/general_submit/`**: 사용자가 직접 이미지를 커스터마이징하여 빌드할 수 있습니다.
2. **`/build/preset_image/`**: Backend.AI의 프리셋 이미지를 통해 간편하게 이미지를 빌드할 수 있습니다.
