# Backend.AI Terminology Guide

Standardized terminology for the Backend.AI WebUI user manual. Use these terms consistently across all documentation and all languages.

## Core Concepts

### Compute Session

The isolated compute environment where users run code, notebooks, or applications.

| Language | Term | Notes |
|----------|------|-------|
| English | compute session | Use "session" as shorthand after first full mention |
| Korean | 연산 세션 | |
| Japanese | コンピュートセッション | |
| Thai | เซสชันการคำนวณ | |

**Session Types:**

| Type | EN | KO | JA | Description |
|------|----|----|----|----|
| Interactive | interactive session | 대화형 세션 | インタラクティブセッション | User interacts after creation |
| Batch | batch session | 배치 세션 | バッチセッション | Pre-defined script execution |
| Inference | inference session | 추론 세션 | 推論セッション | Model serving sessions |

### Storage Folder (Virtual Folder)

Persistent storage that survives session termination. Referred to as "vfolder" in technical contexts.

| Language | Primary Term | Technical Term | Notes |
|----------|-------------|----------------|-------|
| English | storage folder | vfolder | Use "storage folder" in procedural text, "virtual folder" or "vfolder" in introductions |
| Korean | 스토리지 폴더 | 가상 폴더 | |
| Japanese | ストレージフォルダ | バーチャルフォルダ | |
| Thai | โฟลเดอร์จัดเก็บ | โฟลเดอร์เสมือน | |

**Folder Types:**

| Type | Description |
|------|-------------|
| User folder | Created by individual users for personal use |
| Project folder | Created by administrators, shared across project members |

### Domain

The top-level organizational unit for authority and resource control.

| Language | Term |
|----------|------|
| English | domain |
| Korean | 도메인 |
| Japanese | ドメイン |
| Thai | โดเมน |

**Do NOT use**: "organization" or "affiliate" as substitutes. "Affiliate" appears only as an analogy in the overview section.

### Project

The work unit within a domain. Users can belong to multiple projects.

| Language | Term |
|----------|------|
| English | project |
| Korean | 프로젝트 |
| Japanese | プロジェクト |
| Thai | โปรเจกต์ |

**Do NOT use**: "group" as a substitute for project.

### Resource Group

A grouping of agents (compute nodes) with similar hardware specifications.

| Language | Term |
|----------|------|
| English | resource group |
| Korean | 자원 그룹 |
| Japanese | リソースグループ |
| Thai | กลุ่มทรัพยากร |

**Do NOT use**: "scaling group" (deprecated internal term).

### Keypair

Authentication credentials for API access.

| Language | Term |
|----------|------|
| English | keypair |
| Korean | 키페어 |
| Japanese | キーペア |
| Thai | คีย์แพร์ |

**Spelling**: Always "keypair" (one word, no hyphen). Never "key pair" or "key-pair".

### Agent / Agent Node

The compute node that runs containers (sessions).

| Language | Term |
|----------|------|
| English | agent, agent node |
| Korean | 에이전트, 에이전트 노드 |
| Japanese | エージェント, エージェントノード |
| Thai | เอเจนต์, โหนดเอเจนต์ |

**Usage**: "Agent" for general reference, "agent node" when emphasizing the hardware aspect. Use "worker node" only in model serving context.

### Fractional GPU (fGPU)

Backend.AI's GPU virtualization technology that allows sharing a single physical GPU across multiple sessions.

| Language | Numeric Form | Descriptive Form |
|----------|-------------|------------------|
| English | fGPU | fractional GPU |
| Korean | fGPU | 분할 GPU |
| Japanese | fGPU | フラクショナルGPU |
| Thai | fGPU | GPU แบบเศษส่วน |

**Usage**: Write "fractional GPU (fGPU)" on first mention, then "fGPU" thereafter.

## Feature-Specific Terms

### Model Serving / Endpoint

| Term | Usage |
|------|-------|
| Model Service / Model Serving | The feature name (page title, menu item) |
| Endpoint | The access point created for a served model |
| Inference | The operation of running predictions through a served model |

### App Proxy (formerly WSProxy)

The proxy component that relays in-container application traffic (Jupyter, Terminal, TensorBoard, etc.) between the user's browser and the compute session. Renamed from **WSProxy** to **App Proxy** in the UI in FR-2841. The internal binary / daemon is still named `wsproxy`; only the user-facing label changed.

| Language | Term | Notes |
|----------|------|-------|
| English | App Proxy | Use "App Proxy (formerly WSProxy)" on first mention for users familiar with the old term. |
| Korean | App Proxy | UI 라벨은 영문 그대로 사용합니다. 처음 언급할 때 "App Proxy(이전 명칭 WSProxy)"로 적어 줍니다. |
| Japanese | App Proxy | UIラベルは英語のまま使用します。初出時は「App Proxy（旧称 WSProxy）」と表記します。 |
| Thai | App Proxy | ใช้ป้ายภาษาอังกฤษเดิม เมื่อกล่าวถึงครั้งแรกให้เขียนว่า "App Proxy (ชื่อเดิม WSProxy)" |

**Field labels** (Resource Group settings):

| EN | KO | JA | TH |
|----|----|----|----|
| App Proxy Server Address | App Proxy 서버 주소 | App Proxy サーバアドレス | ที่อยู่เซิร์ฟเวอร์ App Proxy |
| App Proxy API Token | App Proxy API 토큰 | App Proxy APIトークン | โทเค็น API ของ App Proxy |

**Do NOT use** "WSProxy" as the user-facing label in new documentation. Keep `wsproxy` (lowercase, in `code` style) only when referring to the internal binary, daemon, or config key (e.g., `wsproxy.proxyURL` in `config.toml`).

### Container vs Kernel / Image

| Term | Meaning |
|------|---------|
| Container | The runtime environment of a compute session |
| Kernel image / Container image | The base image (snapshot) from which containers are created |

**Do NOT use** "container" and "kernel" interchangeably. They refer to different concepts.

### RBAC (Role-Based Access Control)

| Term | EN | KO | JA | TH | Description |
|------|----|----|----|----|-------------|
| RBAC | RBAC | RBAC | RBAC | RBAC | Keep as abbreviation across all languages |
| Role | role | 권한 | ロール | บทบาท | A named set of permissions assignable to users |
| Permission | permission | 세부 권한 | 権限 | สิทธิ์ | A fine-grained access rule within a role |
| Role Assignment | role assignment | 권한 할당 | ロール割り当て | การมอบหมายบทบาท | The association of a user to a role |
| Scope Type | scope type | 적용 범위 타입 | スコープタイプ | ประเภทขอบเขต | The level at which a permission applies |
| Permission Type | permission type | 권한 타입 | 権限タイプ | ประเภทสิทธิ์ | The category of resource a permission controls |

**Note**: The Korean i18n uses "권한" for both "Role" and "Permission" in different contexts. "세부 권한" is used specifically for fine-grained permissions within a role. Always check `resources/i18n/ko.json` for the exact UI labels.

## User Roles

| Role | EN | KO | JA | Scope |
|------|----|----|----|----|
| User | user | 사용자 | ユーザー | Standard access |
| Domain Admin | domain admin | 도메인 관리자 | ドメイン管理者 | Manages users and resources within a domain |
| Superadmin | superadmin | 슈퍼관리자 | スーパー管理者 | Full system access across all domains |

## UI Navigation Terms

These terms match sidebar menu items. Keep documentation references consistent with actual UI labels.

| EN Menu Label | KO | JA | Documentation Section |
|---------------|----|----|----------------------|
| Summary | 요약 | サマリー | summary/summary.md |
| Sessions | 세션 | セッション | session_page/session_page.md |
| Data | 데이터 | データ | vfolder/vfolder.md |
| Model Serving | 모델 서빙 | モデルサービス | model_serving/model_serving.md |
| Statistics | 통계 | 統計 | statistics/statistics.md |
| User Settings | 사용자 설정 | ユーザー設定 | user_settings/user_settings.md |
| RBAC Management | RBAC 관리 | RBAC管理 | rbac_management/rbac_management.md |

**Important**: Always check `resources/i18n/{lang}.json` in the main project for current UI label translations. The i18n files are the source of truth for UI labels.

## Terms to Avoid

| Avoid | Use Instead | Reason |
|-------|-------------|--------|
| scaling group | resource group | Deprecated term |
| key pair, key-pair | keypair | Incorrect spelling |
| group (for project) | project | Ambiguous |
| organization | domain | Not used in Backend.AI |
| data folder | storage folder / vfolder | Non-standard |
| worker node | agent node | Reserve "worker node" for model serving context only |
| compute node | agent node | Non-standard in docs |
| WSProxy (as a UI label) | App Proxy | Renamed in FR-2841; use `wsproxy` (code style) only for the internal binary/daemon |
