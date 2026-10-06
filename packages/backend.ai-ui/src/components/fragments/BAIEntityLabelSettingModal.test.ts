import { planEntityLabelChanges } from './BAIEntityLabelSettingModal';

const target = { entityId: 'a', name: 'folder-a' };
const current = [
  { fieldId: 'l1', key: 'env', value: 'prod' },
  { fieldId: 'l2', key: 'team', value: 'infra' },
];

describe('planEntityLabelChanges', () => {
  it('edit: upserts new and changed keys only', () => {
    const changes = planEntityLabelChanges({
      mode: 'edit',
      targets: [target],
      currentLabels: current,
      rows: [
        { key: 'env', value: 'prod' },
        { key: 'team', value: 'ml' },
        { key: 'tier', value: 'gold' },
      ],
    });
    expect(changes.map((c) => [c.kind, c.key, c.value])).toEqual([
      ['upsert', 'team', 'ml'],
      ['upsert', 'tier', 'gold'],
    ]);
  });

  it('edit: purges removed keys by label id', () => {
    const changes = planEntityLabelChanges({
      mode: 'edit',
      targets: [target],
      currentLabels: current,
      rows: [{ key: 'env', value: 'prod' }],
    });
    expect(changes).toEqual([
      {
        kind: 'purge',
        target,
        key: 'team',
        value: 'infra',
        labelId: 'l2',
      },
    ]);
  });

  it('edit: no change sends nothing', () => {
    expect(
      planEntityLabelChanges({
        mode: 'edit',
        targets: [target],
        currentLabels: current,
        rows: [
          { key: 'env', value: 'prod' },
          { key: 'team', value: 'infra' },
        ],
      }),
    ).toEqual([]);
  });

  it('add: upserts every row on every target and purges nothing', () => {
    const changes = planEntityLabelChanges({
      mode: 'add',
      targets: [target, { entityId: 'b' }],
      currentLabels: current,
      rows: [
        { key: 'env', value: 'dev' },
        { key: 'tier', value: 'gold' },
      ],
    });
    expect(changes.map((c) => [c.kind, c.target.entityId, c.key])).toEqual([
      ['upsert', 'a', 'env'],
      ['upsert', 'a', 'tier'],
      ['upsert', 'b', 'env'],
      ['upsert', 'b', 'tier'],
    ]);
  });
});
