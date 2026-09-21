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
});
