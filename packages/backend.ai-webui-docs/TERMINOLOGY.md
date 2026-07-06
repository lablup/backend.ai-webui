# Backend.AI Terminology Guide

Standardized terminology for the Backend.AI WebUI user manual. Use these terms consistently across all documentation and all languages.

> **This file is partially generated.** The term tables in the **Standardized Terms** section below and the **Terms to Avoid** table are generated from `terminology.json` (the single source of truth) by `scripts/generate-terminology.mjs`. Do **not** hand-edit anything between the `<!-- terminology:auto:... -->` markers — edit `terminology.json` and run `pnpm run build:terminology`. All prose outside the markers is human-curated and safe to edit directly.

## Standardized Terms

The tables below list the approved term for each concept, per language, grouped by category. `EN`/`KO`/`JA`/`TH` are the preferred terms; `—` means the source does not define that language explicitly (fall back to the English term or the contextual prose under the matching section heading). The prose sections that follow each category (usage notes, "Do NOT use" callouts, spelling rules) provide the human guidance that the table cannot capture.

<!-- terminology:auto:concepts START -->

### Core Concepts

| Concept | EN | KO | JA | TH | Context | Deciding FR | Description |
|---|---|---|---|---|---|---|---|
| agent | agent, agent node | 에이전트, 에이전트 노드 | エージェント, エージェントノード | เอเจนต์, โหนดเอเจนต์ | — | — | The compute node that runs containers (sessions). "Agent" for general reference, "agent node" when emphasizing the hardware aspect. Use "worker node" only in model serving context. |
| compute-session | compute session | 연산 세션 | コンピュートセッション | เซสชันการคำนวณ | — | — | The isolated compute environment where users run code, notebooks, or applications. Use "session" as shorthand after first full mention. |
| domain | domain | 도메인 | ドメイン | โดเมน | — | — | The top-level organizational unit for authority and resource control. Do NOT use "organization" or "affiliate" as substitutes. |
| folder-type-project | Project folder | — | — | — | Storage folder type | — | Created by administrators, shared across project members. |
| folder-type-user | User folder | — | — | — | Storage folder type | — | Created by individual users for personal use. |
| fractional-gpu | fGPU | fGPU | fGPU | fGPU | Numeric form | — | Backend.AI's GPU virtualization technology that allows sharing a single physical GPU across multiple sessions. Numeric (abbreviated) form. Write "fractional GPU (fGPU)" on first mention, then "fGPU" thereafter. |
| fractional-gpu-descriptive | fractional GPU | 분할 GPU | フラクショナルGPU | GPU แบบเศษส่วน | Descriptive form | — | Descriptive form of fGPU (Backend.AI's GPU virtualization technology). |
| keypair | keypair | 키페어 | キーペア | คีย์แพร์ | — | — | Authentication credentials for API access. Always "keypair" (one word, no hyphen). Never "key pair" or "key-pair". |
| physical-node | physical node | 물리 노드 | 物理ノード | โหนดกายภาพ | Cluster mode | FR-3207 | The physical machine (or virtual machine) hosting session nodes. Used in the cluster-mode setup description to explain how a managed node and worker nodes are distributed across machines. The cluster-mode UI tooltips (DescSingleNode / DescMultiNode) use this term. Do NOT confuse with "agent node" — in the cluster-mode node-distribution context, use "physical node" to match the UI. |
| project | project | 프로젝트 | プロジェクト | โปรเจกต์ | — | — | The work unit within a domain. Users can belong to multiple projects. Do NOT use "group" as a substitute for project. |
| resource-group | resource group | 자원 그룹 | リソースグループ | กลุ่มทรัพยากร | — | — | A grouping of agents (compute nodes) with similar hardware specifications. Do NOT use "scaling group" (deprecated internal term). |
| session-type-batch | batch session | 배치 세션 | バッチセッション | — | — | — | Compute session type: Pre-defined script execution. |
| session-type-inference | inference session | 추론 세션 | 推論セッション | — | — | — | Compute session type: Model serving sessions. |
| session-type-interactive | interactive session | 대화형 세션 | インタラクティブセッション | — | — | — | Compute session type: User interacts after creation. |
| storage-folder | storage folder | 스토리지 폴더 | ストレージフォルダ | โฟลเดอร์จัดเก็บ | — | — | Persistent storage that survives session termination. Use "storage folder" in procedural text, "virtual folder" or "vfolder" in introductions. |
| storage-folder-technical | vfolder | 가상 폴더 | バーチャルフォルダ | โฟลเดอร์เสมือน | Technical term for storage folder | — | Technical-context term for the storage folder (virtual folder). Referred to as "vfolder" in technical contexts. |

### Feature-Specific Terms

| Concept | EN | KO | JA | TH | Context | Deciding FR | Description |
|---|---|---|---|---|---|---|---|
| app-proxy | App Proxy | App Proxy | App Proxy | App Proxy | — | FR-2841 | The standalone, per-resource-group proxy service that relays in-container application traffic directly between the user's browser and the compute session's Agent. Renamed from WSProxy to App Proxy in the UI in FR-2841. Use "App Proxy" only; do not reference the old "WSProxy" name in user-facing documentation. UI label stays in English across all locales. |
| app-proxy-api-token | App Proxy API Token | App Proxy API 토큰 | App Proxy APIトークン | โทเค็น API ของ App Proxy | Field label (Resource Group settings) | FR-2841 | Resource Group settings field label for the App Proxy API token. |
| app-proxy-server-address | App Proxy Server Address | App Proxy 서버 주소 | App Proxy サーバアドレス | ที่อยู่เซิร์ฟเวอร์ App Proxy | Field label (Resource Group settings) | FR-2841 | Resource Group settings field label for the App Proxy server address. |
| autoscaling-rule | Auto Scaling Rule | 오토스케일링 규칙 | 自動スケーリングルール | กฎการปรับขนาดอัตโนมัติ | — | FR-3207 | The rule that automatically adjusts a deployment's replica count based on live metrics. Match the UI label exactly: KO uses "오토스케일링" (the autoScalingRule i18n keys), NOT "자동 스케일링". Documentation section: deployment/deployment.md |
| container | Container | — | — | — | — | — | The runtime environment of a compute session. Do NOT use "container" and "kernel" interchangeably. |
| endpoint | Endpoint | — | — | — | — | — | The access point created for a served model. |
| inference | Inference | — | — | — | — | — | The operation of running predictions through a served model. |
| kernel-image | Kernel image / Container image | — | — | — | — | — | The base image (snapshot) from which containers are created. Do NOT use "container" and "kernel" interchangeably. |
| model-serving | Model Service / Model Serving | — | — | — | — | — | The feature name (page title, menu item). |
| rbac | RBAC | RBAC | RBAC | RBAC | — | — | Role-Based Access Control. Keep as abbreviation across all languages. |
| rbac-permission | permission | 세부 권한 | 権限 | สิทธิ์ | — | — | A fine-grained access rule within a role. "세부 권한" is used specifically for fine-grained permissions within a role. |
| rbac-permission-type | permission type | 권한 타입 | 権限タイプ | ประเภทสิทธิ์ | — | — | The category of resource a permission controls. |
| rbac-role | role | 권한 | ロール | บทบาท | — | — | A named set of permissions assignable to users. The Korean i18n uses "권한" for both "Role" and "Permission" in different contexts. |
| rbac-role-assignment | role assignment | 권한 할당 | ロール割り当て | การมอบหมายบทบาท | — | — | The association of a user to a role. |
| rbac-scope-type | scope type | 적용 범위 타입 | スコープタイプ | ประเภทขอบเขต | — | — | The level at which a permission applies. |
| replica | replica | 복제본 | レプリカ | เรพลิกา | — | — | An individual running instance of a deployed model service. The desired/active count of these is managed by the deployment and auto-scaling rules. Documentation section: deployment/deployment.md |

### User Roles

| Concept | EN | KO | JA | TH | Description |
|---|---|---|---|---|---|
| role-domain-admin | domain admin | 도메인 관리자 | ドメイン管理者 | — | Manages users and resources within a domain. |
| role-superadmin | superadmin | 슈퍼 관리자 | スーパー管理者 | — | Full system access across all domains. |
| role-user | user | 사용자 | ユーザー | — | Standard access. |

### UI Navigation Terms

| Concept | EN | KO | JA | TH | Description |
|---|---|---|---|---|---|
| nav-data | Data | 데이터 | データ | — | Sidebar menu item. Documentation section: vfolder/vfolder.md |
| nav-deployment | Deployment | 배포 | モデルサービス | — | Sidebar menu item. Documentation section: deployment/deployment.md |
| nav-rbac-management | RBAC Management | RBAC 관리 | RBAC管理 | — | Sidebar menu item. Documentation section: rbac_management/rbac_management.md |
| nav-sessions | Sessions | 세션 | セッション | — | Sidebar menu item. Documentation section: session_page/session_page.md |
| nav-statistics | Statistics | 통계 | 統計 | — | Sidebar menu item. Documentation section: statistics/statistics.md |
| nav-summary | Summary | 요약 | サマリー | — | Sidebar menu item. Documentation section: summary/summary.md |
| nav-user-settings | User Settings | 사용자 설정 | ユーザー設定 | — | Sidebar menu item. Documentation section: user_settings/user_settings.md |

<!-- terminology:auto:concepts END -->

## Concept Notes

The following prose expands on the generated tables above. It is human-curated guidance — usage rules, "Do NOT use" callouts, and contextual explanations that the tables cannot fully express. When the prose and the tables disagree on a *term*, the tables (generated from `terminology.json`) win; the prose exists to explain *how* and *when* to use those terms.

### Compute Session

The isolated compute environment where users run code, notebooks, or applications. Use "session" as shorthand after first full mention.

**Session Types:** Sessions come in three types — interactive (the user interacts after creation), batch (pre-defined script execution), and inference (model serving sessions). See the `session-type-*` rows in the table above for per-language terms.

### Storage Folder (Virtual Folder)

Persistent storage that survives session termination. Referred to as "vfolder" in technical contexts. Use "storage folder" in procedural text, "virtual folder" or "vfolder" in introductions.

**Folder Types:** A **User folder** is created by individual users for personal use; a **Project folder** is created by administrators and shared across project members.

### Domain

The top-level organizational unit for authority and resource control.

**Do NOT use**: "organization" or "affiliate" as substitutes. "Affiliate" appears only as an analogy in the overview section.

### Project

The work unit within a domain. Users can belong to multiple projects.

**Do NOT use**: "group" as a substitute for project.

### Resource Group

A grouping of agents (compute nodes) with similar hardware specifications.

**Do NOT use**: "scaling group" (deprecated internal term).

### Keypair

Authentication credentials for API access.

**Spelling**: Always "keypair" (one word, no hyphen). Never "key pair" or "key-pair".

### Agent / Agent Node

The compute node that runs containers (sessions).

**Usage**: "Agent" for general reference, "agent node" when emphasizing the hardware aspect. Use "worker node" only in model serving context.

### Fractional GPU (fGPU)

Backend.AI's GPU virtualization technology that allows sharing a single physical GPU across multiple sessions.

**Usage**: Write "fractional GPU (fGPU)" on first mention, then "fGPU" thereafter.

### App Proxy

The standalone, per-resource-group proxy service that relays in-container application traffic (Jupyter, Terminal, TensorBoard, etc.) directly between the user's browser and the compute session's Agent (the **v2** path, bypassing the Manager). Renamed from **WSProxy** to **App Proxy** in the UI in FR-2841.

There is **no** standalone `wsproxy` daemon. In Backend.AI core, App Proxy is a separate service family (App Proxy **Coordinator** + **Worker**); the legacy **v1** path is not a daemon at all but a stream proxy embedded in the Manager process. The lowercase `wsproxy` token survives only as **internal identifiers** — never a user-facing component name:

- DB columns: `scaling_groups.wsproxy_addr`, `wsproxy_api_token`
- API route: `/scaling-groups/{sg}/wsproxy-version`
- Constant: `WSPROXY_V1_VERSION = "v1"`
- The WebUI's own client-side embedded proxy (`src/wsproxy/`) and its `config.toml` key `wsproxy.proxyURL`

The KO/JA/TH UI label stays in English as "App Proxy"; do not append the old "WSProxy" name in any locale's user-facing documentation. The App Proxy field labels (App Proxy Server Address, App Proxy API Token) appear in the Resource Group settings — see the `app-proxy-*` rows in the table above for per-language values.

**Do NOT use** "WSProxy" as the user-facing label in new documentation, and do **not** describe `wsproxy` as a server-side binary or daemon (it isn't one). Keep `wsproxy` (lowercase, `code` style) only for the internal identifiers listed above — DB columns, the API route, the `WSPROXY_V1_VERSION` constant, the WebUI's own client-side proxy (`src/wsproxy/`), and the `config.toml` key `wsproxy.proxyURL`.

### Container vs Kernel / Image

A **Container** is the runtime environment of a compute session; a **Kernel image / Container image** is the base image (snapshot) from which containers are created.

**Do NOT use** "container" and "kernel" interchangeably. They refer to different concepts.

### RBAC (Role-Based Access Control)

The RBAC vocabulary (RBAC, role, permission, role assignment, scope type, permission type) is listed in the Feature-Specific Terms table above with per-language terms.

**Note**: The Korean i18n uses "권한" for both "Role" and "Permission" in different contexts. "세부 권한" is used specifically for fine-grained permissions within a role. Always check `resources/i18n/ko.json` for the exact UI labels.

### UI Navigation Terms

These terms match sidebar menu items. Keep documentation references consistent with actual UI labels. The per-language menu labels and their documentation sections are in the UI Navigation Terms table above.

**Important**: Always check `resources/i18n/{lang}.json` in the main project for current UI label translations. The i18n files are the source of truth for UI labels.

## Terms to Avoid

Each row lists one forbidden term, its canonical replacement, and the reason. Parenthetical qualifiers in the **Avoid** column (e.g. "group (for project)") indicate the context in which the term is disallowed.

<!-- terminology:auto:avoid START -->

| Avoid | Use Instead | Reason |
|---|---|---|
| WSProxy (as a UI label) | App Proxy | Renamed in FR-2841; `wsproxy` (code style) survives only as internal identifiers (DB columns, API route, constants), not a daemon |
| compute node | agent node | Non-standard in docs |
| data folder | storage folder / vfolder | Non-standard |
| group (for project) | project | Ambiguous |
| key pair | keypair | Incorrect spelling |
| key-pair | keypair | Incorrect spelling |
| organization (for the Backend.AI domain concept) | domain | Not used in Backend.AI |
| scaling group | resource group | Deprecated term |
| worker node | agent node | Reserve "worker node" for model serving context only |
| 레플리카 | 복제본 | Use the Korean translation, not the transliteration, for consistency |
| 슈퍼관리자 | 슈퍼 관리자 | Use the spaced form for consistency |
| 슈퍼어드민 | 슈퍼 관리자 | Use the Korean translation, not the transliteration |
| 자동 스케일링 (auto scaling rule) | 오토스케일링 | Match the UI label; the autoScalingRule i18n keys use "오토스케일링" |

<!-- terminology:auto:avoid END -->
