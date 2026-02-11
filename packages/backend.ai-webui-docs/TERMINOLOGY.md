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

### Container vs Kernel / Image

| Term | Meaning |
|------|---------|
| Container | The runtime environment of a compute session |
| Kernel image / Container image | The base image (snapshot) from which containers are created |

**Do NOT use** "container" and "kernel" interchangeably. They refer to different concepts.

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
