/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import ContainerRegistryList from '../components/ContainerRegistryList';
import ImageList from '../components/ImageList';
import ProjectSelectForAdminPage from '../components/ProjectSelectForAdminPage';
import ResourcePresetList from '../components/ResourcePresetList';
import BAISkeletonAstryx from '../components/astryx-bui/BAISkeletonAstryx';
import { useSuspendedBackendaiClient, useTabQuerySnapshot } from '../hooks';
import { useAccessibleProjects } from '../hooks/useAccessibleProjects';
import { toProjectContext } from '../types/projectContext';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { BAICard, filterOutEmpty } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const tabParser = parseAsStringLiteral([
  'image',
  'preset',
  'registry',
]).withDefault('image');

/**
 * Tabs whose content is scoped by (or creates things in) a project. The
 * Registries tab is domain-wide, so the scope selector is not shown there.
 */
const PROJECT_SCOPED_TABS = ['image', 'preset'] as const;

// QA2-A: folded the hand-inlined `Card` + `VStack` + `TabList` copy back onto
// `BAICard tabList`, which now renders the strip as the card's header chrome
// (full-bleed rail, tab label on the body inset). See `AgentSummaryPage`.
const EnvironmentPage = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);
  const baiClient = useSuspendedBackendaiClient();

  // ADR-0001 (FR-3415): this page operates above project scope, so the header
  // project selector is not mounted here. The project the page works in is an
  // explicit, visible, URL-persisted choice instead of an ambient read.
  //
  // There is deliberately NO default: seeding it (from the ambient project or
  // from "the first project") would reintroduce exactly the invisible-scope
  // bug this epic removes. Until a project is picked, the project-scoped
  // surfaces say so.
  const [{ project: selectedProjectId }, setQueryParams] = useQueryStates(
    { project: parseAsString },
    { history: 'replace' },
  );

  // Same source the selector reads (`disableDefaultFilter` -> all projects of
  // the domain, not just the ones the admin is a member of), so the id in the
  // URL resolves to exactly the option the user sees. An id that no longer
  // resolves (deleted project, hand-edited URL) narrows to `null` — the
  // unselected state — rather than silently scoping to something.
  const { groups } = useAccessibleProjects({
    domain: baiClient._config.domainName,
  });
  const selectedProject = toProjectContext(
    _.find(groups, (group) => group?.id === selectedProjectId) ?? {},
  );

  const projectScopeSelector = (
    <HStack gap={2} align="center" wrap="wrap">
      <Text color="secondary">{t('general.Project')}</Text>
      <Suspense fallback={<BAISkeletonAstryx variant="input" size="small" />}>
        <ProjectSelectForAdminPage
          data-testid="environment-project-select"
          domain={baiClient._config.domainName}
          value={selectedProject?.id ?? undefined}
          style={{ minWidth: 180 }}
          onSelectProject={(projectInfo) => {
            setQueryParams({ project: projectInfo.projectId });
          }}
        />
      </Suspense>
    </HStack>
  );

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      extra={
        (PROJECT_SCOPED_TABS as readonly string[]).includes(currentTab)
          ? projectScopeSelector
          : undefined
      }
      tabList={filterOutEmpty([
        { key: 'image', label: t('environment.Images') },
        { key: 'preset', label: t('environment.ResourcePresets') },
        baiClient.is_superadmin && {
          key: 'registry',
          label: t('environment.Registries'),
        },
      ])}
    >
      <Suspense fallback={<BAISkeletonAstryx rows={4} />}>
        {currentTab === 'image' &&
          (selectedProject ? (
            <BAIErrorBoundary>
              <ImageList project={selectedProject} />
            </BAIErrorBoundary>
          ) : (
            <EmptyState title={t('environment.SelectProjectToListImages')} />
          ))}
        {currentTab === 'preset' && (
          <BAIErrorBoundary>
            {/* Presets themselves are global; only the resource-group options
                inside the preset editor are project-keyed, so the list renders
                with or without a selected project. */}
            <ResourcePresetList project={selectedProject} />
          </BAIErrorBoundary>
        )}
        {currentTab === 'registry' && (
          <BAIErrorBoundary>
            <ContainerRegistryList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default EnvironmentPage;
