# Table of contents

## Backend.AI 살펴보기

* [소개](README.md)
* [면책 조항 (Disclaimer)](backend.ai/disclaimer.md)
* [Backend.AI 아키텍처](backend.ai/backend.ai-architecture/README.md)
  * [서비스 컴포넌트](backend.ai/backend.ai-architecture/service-components/README.md)
    * [매니저 및 웹서버](backend.ai/backend.ai-architecture/service-components/manager-and-webserver.md)
    * [앱 프록시 (App Proxy)](backend.ai/backend.ai-architecture/service-components/app-proxy.md)
    * [스토리지 프록시 (Storage Proxy)](backend.ai/backend.ai-architecture/service-components/storage-proxy.md)
    * [소코반 오케스트레이터 (Sokovan Orchestrator)](backend.ai/backend.ai-architecture/service-components/sokovan-orchestrator.md)
    * [컨테이너 레지스트리 (Container Registry)](backend.ai/backend.ai-architecture/service-components/container-registry.md)
  * [Computing](backend.ai/backend.ai-architecture/computing.md)
  * [리소스 관리](backend.ai/backend.ai-architecture/resource-management.md)
  * [클러스터 네트워킹](backend.ai/backend.ai-architecture/cluster-networking.md)
  * [스토리지 관리](backend.ai/backend.ai-architecture/storage-management.md)
  * [Configuration](backend.ai/backend.ai-architecture/configuration.md)
* [엔터프라이즈 애플리케이션](backend.ai/enterprise-applicatioins/README.md)
  * [FastTrack MLOps](backend.ai/enterprise-applicatioins/fasttrack-mlops.md)
  * [Control Panel](backend.ai/enterprise-applicatioins/control-panel.md)
  * [Forklift](backend.ai/enterprise-applicatioins/forklift.md)
  * [Reservoir](backend.ai/enterprise-applicatioins/reservoir.md)
  * [Monitoring](backend.ai/enterprise-applicatioins/monitoring.md)
* [Backend.AI Cloud](backend.ai/backend.ai-cloud.md)
* [자주 하는 질문](backend.ai/faq.md)

## 설치 및 실행하기

* [지원되는 환경](undefined/support-environments.md)
* [사전 요구사항](undefined/prerequisites/README.md)
  * [운영체제 환경 세팅하기](undefined/prerequisites/setup-os-environment.md)
  * [데이터베이스 설치하기](undefined/prerequisites/install-database.md)
  * [Requred Python version](undefined/prerequisites/requred-python-version.md)
  * [Configurate WSL](undefined/prerequisites/configurate-wsl.md)
* [Single node, All-in-one](undefined/single-node-all-in-one/README.md)
  * [바이너리에서부터 설치하기](undefined/single-node-all-in-one/install-from-binary.md)
  * [소스코드로부터 설치하기](undefined/single-node-all-in-one/install-from-source-code.md)
* [패키지로부터 설치하기](undefined/install-from-packages.md)
* [클라우드 서비스에 설치하기](undefined/install-on-cloud-services/README.md)
  * [AWS에 설치하기](undefined/install-on-cloud-services/install-on-aws.md)
  * [Azure에 설치하기](undefined/install-on-cloud-services/install-on-azure.md)
  * [GCP에 설치하기](undefined/install-on-cloud-services/install-on-gcp.md)
  * [네이버 클라우드에 설치하기](undefined/install-on-cloud-services/install-on-naver-cloud.md)

## Get Started

* [가입 및 로그인](get-started/signup-and-login.md)
* [스토리지 폴더 생성하기](get-started/create-storage-folder.md)
* [새로운 세션 시작하기](get-started/start-a-new-session.md)
* [Run Applications](get-started/run-applications/README.md)
  * [Jupyter Notebook](get-started/run-applications/jupyter-notebook.md)
  * [웹 터미널](get-started/run-applications/web-terminal.md)
* [모델 서빙](get-started/model-serving.md)

## Backend.AI Usage Guide

* [시작](backend.ai-usage-guide/undefined.md)
* [요약](webui-basic/summary.md)
* [스토리지](backend.ai-usage-guide/undefined-1/README.md)
  * [데이터](backend.ai-usage-guide/undefined-1/undefined/README.md)
    * [폴더 생성 / 공유 / 관리하기](backend.ai-usage-guide/undefined-1/undefined/undefined.md)
    * [폴더 안에 다른 파일 및 폴더 업로드하기](backend.ai-usage-guide/undefined-1/undefined/undefined-1.md)
    * [CLI...](backend.ai-usage-guide/undefined-1/undefined/cli....md)
* [워크로드](backend.ai-usage-guide/undefined-2/README.md)
  * [세션](backend.ai-usage-guide/undefined-2/sessions/README.md)
    * [세션 시작하고 종료하기](backend.ai-usage-guide/undefined-2/sessions/undefined.md)
    * [세션 생성 시 환경변수 추가하기](backend.ai-usage-guide/undefined-2/sessions/undefined-1.md)
    * [생성된 세션 관리하기](backend.ai-usage-guide/undefined-2/sessions/undefined-2.md)
    * [가속 컴퓨팅 최적화하기](backend.ai-usage-guide/undefined-2/sessions/undefined-3.md)
  * [가져오기 & 실행](backend.ai-usage-guide/undefined-2/and.md)
  * [나의 실행 환경](backend.ai-usage-guide/undefined-2/undefined.md)
* [플레이그라운드](backend.ai-usage-guide/undefined-3/README.md)
  * [채팅](backend.ai-usage-guide/undefined-3/undefined/README.md)
    * [다중 채팅 영역 생성하기](backend.ai-usage-guide/undefined-3/undefined/undefined.md)
* [서비스](webui-basic/serving/README.md)
  * [모델 서빙](backend.ai-usage-guide/serving/undefined/README.md)
    * [새로운 서비스 실행하기](backend.ai-usage-guide/serving/undefined/undefined.md)
    * [서비스에 환경 변수 추가하기](backend.ai-usage-guide/serving/undefined/undefined-1.md)
  * [모델 서비스](backend.ai-usage-guide/serving/undefined-1/README.md)
    * [등록된 모델 검색하기](backend.ai-usage-guide/serving/undefined-1/undefined.md)
    * [모델 다운로드하기](backend.ai-usage-guide/serving/undefined-1/undefined-1.md)
    * [모델 파인튜닝하기](backend.ai-usage-guide/serving/undefined-1/undefined-2.md)
* [메트릭](webui-basic/statistics.md)
  * [통계](backend.ai-usage-guide/statistics/undefined.md)
* [프로필 & 환경설정](backend.ai-usage-guide/preferences/README.md)
  * [개인정보 변경하기](backend.ai-usage-guide/preferences/undefined.md)
  * [시스템 설정 변경하기](backend.ai-usage-guide/preferences/undefined-1.md)
  * [시스템 테마 및 로고 커스텀하기](backend.ai-usage-guide/preferences/undefined-2.md)
  * [에러 및 로그 확인하기](backend.ai-usage-guide/preferences/undefined-3.md)

## 🏢 Administration

* [User Settings](administration/user-settings.md)
* [Environments](administration/environments.md)
* [Resources](administration/resources.md)
  * [cr.backend.ai and Docker Hub](administration/resources/cr.backend.ai-and-docker-hub.md)
  * [Migrating from the Docker Hub to cr.backend.ai](migration-guide/migrating-from-the-docker-hub-to-cr.backend.ai.md)
* [Configurations](administration/configurations.md)
* [Maintenance](administration/maintenance.md)
* [Information](administration/information.md)

## 🏢 FastTrack MLOps

* [FastTrack 핵심 콘셉트](fasttrack-mlops/fasttrack-key-concept.md)
* [가져오기 & 실행](fasttrack-mlops/install-and-run.md)
* [파이프라인](fasttrack-mlops/pipeline.md)
* [Pipeline Job](fasttrack-mlops/pipeline-job.md)

## 🏢 Control Panel

* [Control Panel Key Concepts](control-panel/control-panel-key-concepts.md)
* [Dashboard](control-panel/dashboard.md)
* [Management](control-panel/management.md)

## 🏢 Reservoir

* [Reservoir 핵심 콘셉트](reservoir/reservoir-key-concept.md)

## Migration Guide

* [(Source) Upgrading from 20.x to 24.x](migration-guide/upgrading-from-20.x-to-24.x.md)
* [Version 별 database migration](migration-guide/version-database-migration.md)

## Developer Guide

* [Development Setup](developer-guide/development-setup.md)
* [Daily Development Workflows](developer-guide/daily-development-workflows.md)
* [Version Numbering](developer-guide/version-numbering.md)

## API Reference

* [Manager API Reference](api-reference/manager-api-reference.md)
* [Agent API Reference](api-reference/agent-api-reference.md)
* [Storage Proxy Reference](api-reference/storage-proxy-reference.md)

## Command Reference

* [Client CLI](command-reference/client-cli.md)
* [Manager CLI](command-reference/manager-api-reference.md)
* [Agent CLI](command-reference/agent-api-reference.md)
* [Storage CLI](command-reference/storage-proxy-reference.md)

## Backend.AI SDK

* [Client SDK for TypeScript](backend.ai-sdk/client-sdk-for-typescript.md)
* [Client SDK for Python](backend.ai-sdk/client-sdk-for-python/README.md)
  * [설치](backend.ai-sdk/client-sdk-for-python/undefined.md)

## Deprecated

* [Forklift 핵심 콘셉트](deprecated/forklift-key-concept/README.md)
  * [OpenAPI를 이용하여 빌드하기](deprecated/forklift-key-concept/openapi.md)
  * [GUI를 이용하여 빌드하기](deprecated/forklift-key-concept/gui.md)
