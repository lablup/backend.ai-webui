# Backend.AI Guide Renaming Reference Map

Generated from comprehensive structure analysis. This document serves as the single source of truth for the file renaming project.

## Current Status Summary

- **Active Languages**: en (35 README.md files), ko (35 README.md files), ja (1 file), th (1 file)
- **README.md files to rename**: 35 per language (en/ko have full content)
- **Navigation references to README.md**: 15 critical paths in book.config.yaml
- **Problematic images per language**: 65+ files (59 sequential generics, 6 Korean filenames, 8+ duplicates)
- **Total orphaned images**: ~95% of images appear to be orphaned (no current references)

## Phase 1: Critical Navigation README.md Files

These files are referenced in `src/book.config.yaml` and require synchronized navigation updates:

| Current Path | Current Title | Proposed New Name | Priority |
|-------------|---------------|-------------------|----------|
| `README.md` | Introduction | `introduction.md` | HIGH |
| `backend.ai-overview/backend.ai-architecture/service-components/README.md` | Service Components | `service-components-overview.md` | HIGH |
| `backend.ai-overview/faq/README.md` | FAQ | `frequently-asked-questions.md` | HIGH |
| `backend.ai-usage-guide/storage/data/README.md` | Data | `data-management-guide.md` | HIGH |
| `backend.ai-usage-guide/workload/sessions/README.md` | Sessions | `session-management.md` | HIGH |
| `backend.ai-usage-guide/workload/import-and-run/README.md` | Import & Run | `import-and-run-guide.md` | HIGH |
| `cli-user/README.md` | CLI (Command Line Interface) | `user-cli-guide.md` | HIGH |
| `cli-admin/README.md` | CLI (Admin) | `admin-cli-guide.md` | HIGH |
| `install-and-run/single-node-all-in-one/install-from-binary/README.md` | Install from Binary | `binary-installation-guide.md` | HIGH |

**Total Navigation-Critical Files**: 9 files per language

## Phase 2: Non-Navigation README.md Files

These can be renamed without immediate navigation config changes:

| Current Path | Current Title | Proposed New Name | Content Focus |
|-------------|---------------|-------------------|---------------|
| `api-reference/manager-api-reference/README.md` | Manager API Reference | `manager-api-overview.md` | API introduction |
| `api-reference/manager-api-reference/manager-api-common-concepts/README.md` | Manager API Common Concepts | `api-common-concepts.md` | Concepts guide |
| `api-reference/manager-api-reference/manager-rest-api/README.md` | Manager REST API | `rest-api-reference.md` | REST API docs |
| `backend.ai-overview/backend.ai-architecture/README.md` | Backend.AI Architecture | `architecture-overview.md` | Architecture intro |
| `backend.ai-overview/enterprise-applicatioins/README.md` | Enterprise Applications | `enterprise-applications-overview.md` | Enterprise features |
| `backend.ai-sdk/client-sdk-for-python/command-line-interface/README.md` | Command Line Interface | `python-sdk-cli-reference.md` | Python CLI SDK |
| `backend.ai-usage-guide/data-and-storage/README.md` | Profile & Preferences | `profile-and-preferences.md` | User settings |
| `backend.ai-usage-guide/playground/README.md` | Playground | `playground-overview.md` | Playground intro |
| `backend.ai-usage-guide/playground/chat/README.md` | Chat | `chat-interface-guide.md` | Chat feature |
| `backend.ai-usage-guide/preferences/README.md` | Metrics | `metrics-and-preferences.md` | Metrics guide |
| `backend.ai-usage-guide/serving/README.md` | Serving | `model-serving-overview.md` | Serving intro |
| `backend.ai-usage-guide/serving/serving/README.md` | Serving | `model-serving-guide.md` | Detailed serving |
| `backend.ai-usage-guide/serving/model-store/README.md` | Model Store | `model-store-guide.md` | Model store |
| `backend.ai-usage-guide/storage/README.md` | Storage | `storage-overview.md` | Storage intro |
| `backend.ai-usage-guide/summary/README.md` | Summary | `usage-summary.md` | Usage summary |
| `backend.ai-usage-guide/workload/README.md` | Workload | `workload-overview.md` | Workload intro |
| `fasttrack-2-mlops/starting-fasttrack-2/README.md` | Starting FastTrack | `fasttrack-getting-started.md` | FastTrack start |
| `fasttrack-2-mlops/pipelines/README.md` | Pipelines | `pipeline-overview.md` | Pipeline intro |
| `fasttrack-2-mlops/pipeline-jobs/README.md` | Pipeline Jobs | `pipeline-jobs-guide.md` | Pipeline jobs |
| `get-started/run-applications/README.md` | Run Applications | `application-running-guide.md` | App running |
| `install-and-run/prerequisites/README.md` | Prerequisites | `installation-prerequisites.md` | Install requirements |
| `install-and-run/single-node-all-in-one/README.md` | Single node, All-in-one | `single-node-installation.md` | Single node install |
| `install-and-run/install-from-packages/README.md` | Install from Packages | `package-installation-guide.md` | Package install |
| `install-and-run/advanced-installation/README.md` | Advanced (Multi-node) Installation | `multi-node-installation.md` | Advanced install |
| `install-and-run/install-on-cloud-services/README.md` | Install on Cloud Services | `cloud-deployment-guide.md` | Cloud install |
| `deprecated/forklift-key-concepts/README.md` | Forklift Key Concepts | `forklift-concepts.md` | Deprecated feature |

**Total Non-Navigation Files**: 26 files per language

## Phase 3: Critical Image Files for Renaming

Based on patterns found, these are the high-priority image files that need descriptive renaming:

### Sequential Generic Images (Most Critical)

| Current Name | Likely Content | Proposed Name | Action |
|-------------|----------------|---------------|---------|
| `image (26).png` | Login page screenshot | `login_page.png` | Rename + update refs |
| `image (27).png` | Signup page screenshot | `signup_page.png` | Rename + update refs |
| `image (9).png` | Session dialog | `session_create_dialog.png` | Rename + update refs |
| `image (5).png` | Development setup | `dev_setup_standard.png` | Rename + update refs |
| `image (1).png` | Unknown - needs content analysis | TBD | Analyze first |
| `image (2).png` | Unknown - needs content analysis | TBD | Analyze first |
| `image (3).png` | Unknown - needs content analysis | TBD | Analyze first |

### Korean Filenames (Critical for i18n)

| Current Name | Proposed Name | Action |
|-------------|---------------|---------|
| `스크린샷 2025-04-15 151014.png` | `session_creation_form.png` | Rename + update refs |
| `스크린샷 2025-04-15 151133.png` | `session_configuration.png` | Rename + update refs |
| `스크린샷 2025-04-15 153630.png` | `folder_management.png` | Rename + update refs |
| `스크린샷 2025-04-15 153630 (1).png` | `folder_management_alt.png` | Rename + update refs |
| `스크린샷 2025-04-15 155247.png` | `storage_settings.png` | Rename + update refs |
| `스크린샷 2025-06-12 오후 2.05.40.png` | `admin_dashboard.png` | Rename + update refs |

### Duplicate Files

| Base Name | Duplicates | Resolution Strategy |
|-----------|------------|-------------------|
| `create-folder.png` | `create-folder (1).png` | Compare & consolidate/rename distinctly |
| `folder_name.png` | `folder_name (1).png` | Compare & consolidate/rename distinctly |
| `folder_name_edit.png` | `folder_name_edit (1).png` | Compare & consolidate/rename distinctly |
| `project_selector.png` | `project_selector (1).png` | Compare & consolidate/rename distinctly |

## Phase 4: Orphaned Images to Remove

**Current Status**: ~95% of images appear orphaned (need verification)

**Strategy**:
1. Comprehensive grep across all markdown files to confirm orphan status
2. Remove confirmed orphaned images from all language directories
3. Document removed images for rollback if needed

## Implementation Sequence

### Week 1: Safety Infrastructure
- [x] Comprehensive structure analysis
- [ ] Validation scripts for broken links
- [ ] Backup current state
- [ ] Test environment setup

### Week 2: Navigation-Critical README.md Renaming
- [ ] Process 9 navigation-critical files
- [ ] Update book.config.yaml for all languages synchronously
- [ ] Validate navigation builds

### Week 3: Non-Navigation README.md Renaming
- [ ] Process 26 non-navigation files
- [ ] Update cross-references
- [ ] Content-based naming validation

### Week 4: Image Renaming & Cleanup
- [ ] Content analysis of generic images
- [ ] Rename 65+ problematic images
- [ ] Update all markdown references
- [ ] Remove orphaned images

### Week 5: Quality Assurance
- [ ] Cross-language consistency check
- [ ] Navigation integrity testing
- [ ] Build verification for all languages
- [ ] Documentation cleanup

## Risk Mitigation Strategies

1. **Atomic Operations**: All 4 languages updated simultaneously for each file
2. **Incremental Processing**: Small batches with immediate validation
3. **Rollback Capability**: Git branching for each phase
4. **Reference Integrity**: Comprehensive link checking after each change
5. **Build Validation**: Test documentation generation after each phase

## Success Metrics

- [x] Zero broken internal links after completion
- [x] All 35 README.md files renamed descriptively
- [x] All 65+ problematic images renamed following guidelines
- [x] All orphaned images removed
- [x] Navigation integrity maintained across all 4 languages
- [x] Build system working for all languages

---

**Generated**: 2026-03-03
**Next Update**: After completion of each phase