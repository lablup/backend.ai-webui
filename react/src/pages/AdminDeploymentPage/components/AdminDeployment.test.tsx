import { sanitizeDeploymentOrder } from './AdminDeployment';
import { availableDeploymentSorterKeys } from 'backend.ai-ui';

describe('sanitizeDeploymentOrder', () => {
  it('keeps a known sorter, in either direction', () => {
    expect(sanitizeDeploymentOrder('name')).toBe('name');
    expect(sanitizeDeploymentOrder('-createdAt')).toBe('-createdAt');
    expect(sanitizeDeploymentOrder('-project')).toBe('-project');
  });

  it('drops a domain sorter: the WebUI works in one domain', () => {
    expect(sanitizeDeploymentOrder('domain')).toBeNull();
    expect(sanitizeDeploymentOrder('-domain')).toBeNull();
  });

  it('drops an order naming no sorter at all', () => {
    expect(sanitizeDeploymentOrder('destroyedAt')).toBeNull();
    expect(sanitizeDeploymentOrder('nonsense')).toBeNull();
  });

  it('normalizes an absent order to null', () => {
    expect(sanitizeDeploymentOrder(null)).toBeNull();
    expect(sanitizeDeploymentOrder(undefined)).toBeNull();
    expect(sanitizeDeploymentOrder('')).toBeNull();
  });

  it('keeps every sorter the table advertises', () => {
    for (const key of availableDeploymentSorterKeys) {
      expect(sanitizeDeploymentOrder(key)).toBe(key);
      expect(sanitizeDeploymentOrder(`-${key}`)).toBe(`-${key}`);
    }
  });
});
