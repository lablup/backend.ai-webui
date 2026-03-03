---
title: 앱 프록시 (App Proxy)
order: 6
---
# 앱 프록시 (App Proxy)

Backend.AI 앱 프록시는 사용자 애플리케이션과 클라이언트(e.g. 브라우저) 간의 트래픽을 중개하는 프록시입니다. Backend.AI 앱 프록시는 사용자 애플리케이션 트래픽에 대한 네트워킹 및 방화벽 정책을 설정할 수 있는 공간을 제공합니다.

Backend.AI 앱 프록시는 아래 두가지 운영 모드로 사용할 수 있습니다:

* 포트 맵핑 (Port Mapping): 개별 앱 인스턴스가 미리 정의되어 있는 특정 범위의 TCP 포트 안의 값으로 매핑됩니다.
* 와일드카드 서브도메인(Wildcard Subdomain): 개별 앱 인스턴스가 지정된 최상위 도메인 (Top-level domain) 아래 위치한 시스템에서 생성한 하위 도메인 (System-generated subdomain) 으로 매핑됩니다.

HTTP 기반 애플리케이션의 경우, 세션의 유형이나 애플리케이션의 실행 구성에 따라 인증된 HTTP 세션 (Authenticated HTTP session)이 필요할 수 있습니다. 예를 들어, Jupyter과 같은 동적 개발 애플리케이션에는 인증을 강제할 수 있으며, AI 모델 서비스 API에는 별도 인증 없이 익명 접근을 허용할 수 있습니다.
