# Translation Guide

Rules and workflows for translating the Backend.AI WebUI user manual across all supported languages.

## Supported Languages

| Code | Language | Directory |
|------|----------|-----------|
| `en` | English | `src/en/` |
| `ko` | Korean | `src/ko/` |
| `ja` | Japanese | `src/ja/` |
| `th` | Thai | `src/th/` |

## Workflow

### Writing Order

1. **English first**: Always write or update the English version first
2. **Korean**: Translate from English
3. **Japanese**: Translate from English
4. **Thai**: Translate from English

### Structural Parity

All 4 language versions must have:
- Identical directory and file structure
- Same heading hierarchy (H1, H2, H3)
- Same image references (images are shared)
- Same cross-reference anchors
- Equivalent content coverage (no missing sections)

### Navigation Updates

When adding a new page, update `src/book.config.yaml` for all 4 languages simultaneously:

```yaml
navigation:
  en:
    - title: New Feature
      path: new_feature/new_feature.md
  ko:
    - title: 새 기능
      path: new_feature/new_feature.md
  ja:
    - title: 新機能
      path: new_feature/new_feature.md
  th:
    - title: ฟีเจอร์ใหม่
      path: new_feature/new_feature.md
```

## UI Label Verification

**Critical**: Documentation must use the same UI labels that users actually see in the application.

Before writing translated documentation, check the i18n files in the main project:
- English: `resources/i18n/en.json`
- Korean: `resources/i18n/ko.json`
- Japanese: `resources/i18n/ja.json`
- Thai: `resources/i18n/th.json`

Example: If documenting a "Create Folder" button, verify the exact translated label:
```
EN: "Create Folder"   → resources/i18n/en.json
KO: "폴더 생성"        → resources/i18n/ko.json
JA: "フォルダ作成"      → resources/i18n/ja.json
```

## Language-Specific Rules

### Korean (ko)

**Formality**:
- Use 합니다체 (formal polite style) consistently
- Example: "클릭합니다", "생성할 수 있습니다", "확인하세요"
- Do not mix 해요체 and 합니다체 within the same document

**Technical Terms**:
- Keep widely used English technical terms as-is: session, GPU, API, CPU, RAM, fGPU
- Translate conceptual terms: storage folder → 스토리지 폴더, resource group → 자원 그룹
- Refer to `TERMINOLOGY.md` for the complete list

**Sentence Structure**:
- Use natural Korean sentence order (SOV), not word-for-word translation from English
- Keep sentences concise; split long English sentences if needed for natural Korean flow

**Common Patterns**:
```
EN: "Click the Create button"
KO: "생성 버튼을 클릭합니다"  (not "클릭하세요 생성 버튼을")

EN: "You can create a new folder"
KO: "새 폴더를 생성할 수 있습니다"

EN: "For more details, refer to the Session Page section"
KO: "자세한 내용은 세션 페이지 섹션을 참고하세요"
```

### Japanese (ja)

**Formality**:
- Use 丁寧語 (polite language) consistently
- Example: "クリックします", "作成できます", "確認してください"
- Maintain consistent politeness level throughout

**Technical Terms**:
- Use katakana for English loanwords: セッション, フォルダ, ストレージ, エンドポイント
- Keep acronyms in Roman characters: GPU, CPU, API, fGPU, RAM
- Refer to `TERMINOLOGY.md` for the complete list

**Sentence Structure**:
- Use natural Japanese sentence order (SOV)
- Avoid overly long sentences; break into shorter clauses

**Common Patterns**:
```
EN: "Click the Create button"
JA: "作成ボタンをクリックします"

EN: "You can create a new folder"
JA: "新しいフォルダを作成できます"

EN: "For more details, refer to the Session Page section"
JA: "詳細については、セッションページセクションを参照してください"
```

### Thai (th)

**Formality**:
- Use formal Thai writing style (ภาษาทางการ)
- Appropriate for technical documentation
- Maintain polite particles where applicable

**Technical Terms**:
- Keep commonly used English IT terms in English: session, GPU, API, CPU
- Translate descriptive terms to Thai where natural
- Refer to `TERMINOLOGY.md` for the complete list

**Sentence Structure**:
- Use natural Thai sentence order (SVO, similar to English)
- Avoid excessively long sentences

## What Should NOT Be Translated

Keep these in their original form across all languages:
- Product name: **Backend.AI**
- Technical identifiers: fGPU, API, SSH, SFTP, HTTP, GPU, CPU, RAM
- File paths: `/home/work/`, `config.toml`
- Code examples and shell commands
- Image filenames
- Cross-reference anchor names
- Version numbers

## What MUST Be Translated

- All narrative/explanatory text
- UI button labels (use the label from the corresponding i18n file)
- Headings (keep anchors the same, translate display text)
- Dialog field descriptions
- Notes and warnings
- Navigation titles in `book.config.yaml`

## Quality Checklist

For each translated document, verify:
- [ ] All sections from the English version are present
- [ ] UI labels match the application's i18n translations
- [ ] Consistent formality level throughout
- [ ] Terminology matches `TERMINOLOGY.md`
- [ ] No untranslated English sentences left in the body text
- [ ] Image references are identical to the English version
- [ ] Cross-reference anchors are preserved
- [ ] Natural sentence structure (not word-for-word translation)
- [ ] Navigation entry added in `book.config.yaml`
