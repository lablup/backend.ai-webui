import enResource from '../../../resources/i18n/en.json';
import { rbacTypeI18nKey } from './rbacElementTypes';
import { describe, expect, it } from 'vitest';

describe('rbacTypeI18nKey', () => {
  it('maps a lowercase manager name onto the uppercase label key', () => {
    expect(rbacTypeI18nKey('resource_group')).toBe('rbac.types.RESOURCE_GROUP');
    expect(rbacTypeI18nKey('PROJECT')).toBe('rbac.types.PROJECT');
  });

  it('resolves to an English label for the scope types the pages pick', () => {
    const labels = (enResource as { rbac: { types: Record<string, string> } })
      .rbac.types;
    const scopeTypes = [
      'domain',
      'project',
      'user',
      'vfolder',
      'session',
      'resource_group',
      'container_registry',
      'keypair',
    ];
    expect(
      scopeTypes.filter(
        (type) => !labels[rbacTypeI18nKey(type).replace('rbac.types.', '')],
      ),
    ).toEqual([]);
  });

  it('resolves to an English label for every entity type the manager declares', () => {
    const labels = (enResource as { rbac: { types: Record<string, string> } })
      .rbac.types;
    // The `EntityType` kinds under `ai.backend.common.data.entity` (backend.ai main).
    const entityTypes = [
      'agent',
      'app_config',
      'app_config_allow_list',
      'app_config_definition',
      'app_config_fragment',
      'artifact',
      'artifact_registry',
      'client_ip_masking_policy',
      'container_registry',
      'deployment',
      'deployment_preset',
      'domain',
      'entity_share',
      'global',
      'idle_checker',
      'image',
      'keypair_resource_policy',
      'login_client_type',
      'model_card',
      'network',
      'notification_channel',
      'notification_rule',
      'object_storage',
      'project',
      'project_resource_policy',
      'prometheus_query_preset',
      'prometheus_query_preset_category',
      'resource_group',
      'resource_preset',
      'resource_slot_type',
      'retention_policy',
      'role',
      'role_preset',
      'runtime_variant',
      'runtime_variant_preset',
      'scope_admin',
      'service_catalog',
      'session',
      'session_group',
      'session_template',
      'storage_namespace',
      'storage_volume',
      'system_session_environ',
      'user',
      'user_resource_policy',
      'vfolder',
      'vfolder_auto_mount',
      'vfs_storage',
    ];
    expect(
      entityTypes.filter(
        (type) => !labels[rbacTypeI18nKey(type).replace('rbac.types.', '')],
      ),
    ).toEqual([]);
  });
});
