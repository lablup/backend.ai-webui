/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { withinWindow } from '../timeRange';
import {
  AUDIT_ENTITY_TYPES,
  entityTypeFailureFilters,
} from './superadminCardData';

describe('entityTypeFailureFilters', () => {
  const window = {
    after: '2026-10-26T00:00:00.000Z',
    before: '2026-10-27T00:00:00.000Z',
  };

  it('counts failures per listed entity type and every other type once', () => {
    const filters = entityTypeFailureFilters(window);
    expect(Object.keys(filters)).toHaveLength(AUDIT_ENTITY_TYPES.length + 1);
    expect(filters.resourceGroup.entityType).toEqual({
      equals: 'resource_group',
    });
    expect(filters.other.entityType).toEqual({
      notIn: [...AUDIT_ENTITY_TYPES],
    });
  });

  it('filters the window as two ANDed bounds and failures as ERROR or DENIED', () => {
    const { session } = entityTypeFailureFilters(window);
    expect(session.AND).toEqual(withinWindow('createdAt', window).AND);
    expect(session.status).toEqual({ in: ['ERROR', 'DENIED'] });
  });
});
