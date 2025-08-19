# Fill Out i18n Translations

High-performance auto-translation of missing i18n keys using Claude AI for Backend.AI WebUI locale files based on git changes.

## Usage

```
/fill-out-i18n [stage|commit|branch] [--batch-size=50] [--skip-review]
```

## Arguments

- `stage` - Analyze staged changes (default)
- `commit` - Analyze last commit changes  
- `branch` - Analyze changes in current branch compared to main
- `--batch-size=N` - Translation batch size (default: 50, max: 100)
- `--skip-review` - Skip quality review and improvement suggestions

## Description

This command uses **Claude AI for high-quality translation** combined with **fast JSON processing** to efficiently detect and translate missing i18n keys. It leverages `jq` for rapid JSON operations with minimal overhead.

Backend.AI WebUI supports two i18n systems:
- **Main project**: `/resources/i18n/` - Legacy Lit-Element components
- **React components**: `/packages/backend.ai-ui/src/locale/` - Modern React components

### Supported Languages
`de`, `el`, `es`, `fi`, `fr`, `id`, `it`, `ja`, `ko`, `mn`, `ms`, `pl`, `pt-BR`, `pt`, `ru`, `th`, `tr`, `vi`, `zh-CN`, `zh-TW`

## Performance Optimizations

### 1. Fast JSON Processing with jq
- Uses `jq` for lightning-fast JSON diff and merge operations
- Processes only changed keys, not entire files
- Memory-efficient streaming for large translation files

### 2. Streamlined Processing
- **No caching overhead**: Direct translation for maximum speed
- **Context analysis**: Real-time Backend.AI terminology consistency  
- **Minimal memory footprint**: Process only what's needed

### 3. Claude AI Translation
- **Context-aware translations** using existing ko/en pairs as reference
- **Backend.AI domain expertise** built into translation prompts
- **Batch processing** of related keys for consistency
- **Terminology preservation** for technical terms

## How it works

1. **Fast Git Analysis**: Uses `jq` to quickly detect JSON changes in `ko.json` and `en.json` files
2. **Incremental Key Detection**: Extracts only newly added/modified translation keys
3. **Quality Review**: Reviews Korean/English source text for:
   - **Spelling and grammar errors**
   - **UI/UX text improvements** (clarity, consistency, tone)
   - **Backend.AI terminology alignment**
   - **Placeholder syntax validation** (e.g., `{{name}}`, `{{total}}`)
4. **User Confirmation**: Presents improvement suggestions and asks for approval
5. **Context Analysis**: Analyzes existing ko/en translations for:
   - Backend.AI technical terminology consistency
   - UI component naming patterns  
   - Product-specific term mappings
6. **Claude AI Translation**: Generates high-quality translations that:
   - Maintain consistency with existing terminology
   - Preserve placeholder syntax and formatting
   - Follow language-specific conventions
   - Respect Backend.AI domain context
7. **Atomic Updates**: Uses `jq` for safe, atomic JSON file updates

## Backend.AI Context

The translations should be contextually aware of Backend.AI platform features:
- **Infrastructure**: GPU virtualization, container orchestration, resource management
- **User Management**: multi-tenancy, domains, sessions, workspaces
- **Storage**: virtual folders (vfolders), mounts, sharing
- **Computing**: kernels, images, agents, scaling rules
- **UI Components**: cards, pagination, forms, dialogs, notifications
- **Operations**: monitoring, logs, statistics, administration

## Examples

```bash
# Fast translation with quality review (default)
/fill-out-i18n

# Skip quality review for quick processing
/fill-out-i18n stage --skip-review

# With custom batch size
/fill-out-i18n stage --batch-size=30

# Translate from last commit with review
/fill-out-i18n commit

# Process entire branch changes without review
/fill-out-i18n branch --batch-size=100 --skip-review
```

## Output

The command provides:
1. **Quality Review Results**: Improvement suggestions for Korean/English text
2. **User Confirmation**: Interactive approval for suggested improvements
3. **Performance metrics**: Processing time, files processed, speed optimizations
4. **Change summary**: New keys detected, languages updated, translations generated
5. **Quality report**: Consistency checks, terminology validation

## Quality Review Features

### Korean Text Review
- **맞춤법 검사**: 띄어쓰기, 맞춤법 오류 검출
- **UI 표현 개선**: 사용자 친화적 문구 제안
- **일관성 검사**: Backend.AI 용어 통일성
- **형식 검증**: placeholder 구문 검사

### English Text Review  
- **Grammar and spelling**: Error detection and correction
- **UI/UX improvements**: Clearer, more consistent messaging
- **Technical accuracy**: Backend.AI terminology validation
- **Format validation**: Placeholder syntax verification

### Interactive Improvement Process
```
🔍 Quality Review Results:
Korean: "테스트" → 개선 제안: "테스트하기"
English: "Test" → 개선 제안: "Run Test"

✅ Apply suggestions? [Y/n/e(dit)]: 
```

## Technical Implementation

### Core Performance Features
- **jq-based JSON processing**: significantly faster than pure JS parsing
- **Zero-overhead design**: No caching, no unnecessary I/O
- **Incremental updates**: Only processes actual changes
- **Batch optimization**: Groups related keys for context consistency

### File Processing Pipeline
```bash
# Fast git diff analysis
git diff --name-only $TARGET | grep -E '(ko|en)\.json$'

# Extract changed keys with jq
jq --slurpfile old $OLD --slurpfile new $NEW -n '
  ($new[0] | to_entries | map(select(.key as $k | ($old[0]|has($k)|not))) | from_entries)
'

# Quality review (unless --skip-review)
# - Analyze Korean/English text quality
# - Generate improvement suggestions
# - Present interactive confirmation

# Batch translate with Claude AI (using reviewed text)
# Direct atomic update with jq merge
```

## Notes

- **Quality-first approach**: Reviews and improves source text before translation
- **Interactive workflow**: User confirmation for all improvements  
- **Claude AI Translation**: Uses existing ko/en context for high-quality results
- **Performance-optimized**: jq processing with zero overhead design
- **Backend.AI aware**: Built-in domain knowledge for technical accuracy
- **Safe operations**: Atomic updates, validation, rollback capability
- **Flexible review**: Use `--skip-review` for quick processing when needed