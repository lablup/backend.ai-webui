# 한국어 콘텐츠 매핑 계획

## 디렉토리 매핑 (기존 → 새 구조)

### 명확한 매핑
- `developer/` → `developer-guide/`
- `install/` → `install-and-run/`
- `admin/` → `administration/`
- `overview/` → `backend.ai-overview/`
- `usage/` → `backend.ai-usage-guide/`
- `sdk/` → `backend.ai-sdk/`
- `api/` → `api-reference/`
- `commands/` → `command-reference/`
- `migration/` → `migration-guide/`
- `fasttrack/` → `fasttrack-2-mlops/`
- `reservoir/` → `reservoir/` (동일)
- `control-panel/` → `control-panel/` (동일)

### 통합/분할 필요한 매핑
- `get-started/`, `getting-started/` → `get-started/` (통합)
- `cli-guide/` → `cli-admin/` + `cli-user/` (내용에 따라 분할)

### 매핑이 불분명한 디렉토리 (내용 확인 필요)
- `appendices/` → ?
- `installation/` vs `install/` → `install-and-run/`
- `troubleshooting/` → ?
- `user-guide/` → `backend.ai-usage-guide/` 또는 기타

## 실행 계획
1. 명확한 매핑부터 실행
2. 불분명한 디렉토리는 내용 확인 후 결정
3. 중복 콘텐츠는 통합
4. 누락된 디렉토리는 영어에서 기본 구조 참조