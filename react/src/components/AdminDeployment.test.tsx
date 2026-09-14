/**
 * FR-3913 — the Running / Terminated scope is sent as a real `DeploymentFilter`
 * on the tab's very first query, so its shape has to match what the manager
 * accepts. `DeploymentStatusFilter.notIn` only arrived in 26.4.3.
 */
import { statusCategoryFilterFor } from './AdminDeployment';

describe('statusCategoryFilterFor', () => {
  it('scopes the terminated category with `in` on every manager', () => {
    expect(statusCategoryFilterFor('finished', true)).toEqual({
      status: { in: ['STOPPED'] },
    });
    expect(statusCategoryFilterFor('finished', false)).toEqual({
      status: { in: ['STOPPED'] },
    });
  });

  it('uses `notIn` for the running category when the manager supports it', () => {
    expect(statusCategoryFilterFor('running', true)).toEqual({
      status: { notIn: ['STOPPED'] },
    });
  });

  it('falls back to the complementary `in` list below 26.4.3', () => {
    expect(statusCategoryFilterFor('running', false)).toEqual({
      status: { in: ['PENDING', 'SCALING', 'DEPLOYING', 'READY', 'STOPPING'] },
    });
  });

  it('never lets the fallback list contain STOPPED', () => {
    const filter = statusCategoryFilterFor('running', false);
    expect(filter.status?.in).not.toContain('STOPPED');
  });
});
