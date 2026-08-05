/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import ContainerRegistryList from '../components/ContainerRegistryList';
import ImageList from '../components/ImageList';
import ResourcePresetList from '../components/ResourcePresetList';
import { useSuspendedBackendaiClient, useTabQuerySnapshot } from '../hooks';
import { useAccessibleProjects } from '../hooks/useAccessibleProjects';
import { toProjectContext } from '../types/projectContext';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const tabParser = parseAsStringLiteral([
  'image',
  'preset',
  'registry',
]).withDefault('image');

const EnvironmentPage = () => {
  'use memo';
  const { t } = useTranslation();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);
  const baiClient = useSuspendedBackendaiClient();

  // ADR-0001 (FR-3415): this page operates above project scope, so the header
  // project selector is not mounted here. The project the image list narrows
  // to is an explicit, visible, URL-persisted choice instead of an ambient
  // read.
  //
  // There is deliberately NO default: seeding it (from the ambient project or
  // from "the first project") would reintroduce exactly the invisible-scope
  // bug this epic removes. With nothing picked the list is domain-wide, so the
  // project is a pure OPTIONAL FILTER — an absent param means "all projects of
  // the domain", never "nothing to show".
  const [{ project: selectedProjectId }, setQueryParams] = useQueryStates(
    { project: parseAsString },
    { history: 'replace' },
  );

  // Same source the in-list selector reads (`disableDefaultFilter` -> all
  // projects of the domain, not just the ones the admin is a member of), so
  // the id in the URL resolves to exactly the option the user sees. An id that
  // no longer resolves (deleted project, hand-edited URL) narrows to `null` —
  // i.e. falls back to the domain-wide view — rather than silently scoping to
  // something else.
  const { groups } = useAccessibleProjects({
    domain: baiClient._config.domainName,
  });
  const selectedProject = toProjectContext(
    _.find(groups, (group) => group?.id === selectedProjectId) ?? {},
  );

  return (
    <BAICard
      activeTabKey={currentTab}
      onTabChange={onTabChange}
      tabList={[
        {
          key: 'image',
          label: t('environment.Images'),
        },
        {
          key: 'preset',
          label: t('environment.ResourcePresets'),
        },
        ...(baiClient.is_superadmin
          ? [
              {
                key: 'registry',
                label: t('environment.Registries'),
              },
            ]
          : []),
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {currentTab === 'image' && (
          <BAIErrorBoundary>
            {/* The project NARROWS what this tab lists, so the selector is a
                content-scoped control: it belongs in the list's own filter
                row, not in the card header (see `.claude/rules/use-bai-card.md`).
                Clearing it writes `null`, which drops `?project=` from the URL
                and returns the list to the domain-wide scope. */}
            <ImageList
              project={selectedProject}
              onChangeProject={(project) => {
                setQueryParams({ project: project?.id ?? null });
              }}
            />
          </BAIErrorBoundary>
        )}
        {currentTab === 'preset' && (
          <BAIErrorBoundary>
            {/* Nothing on this tab is project-scoped: a resource preset has
                no project dimension in the manager at all (it is either global
                or bound to exactly one resource group), so there is no project
                choice to offer here — see ADR-0001. */}
            <ResourcePresetList />
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
