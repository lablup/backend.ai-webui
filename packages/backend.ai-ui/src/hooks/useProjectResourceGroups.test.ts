import { selectProjectResourceGroups } from './useProjectResourceGroups';

const scalingGroups = [
  { name: 'default' },
  { name: 'gpu' },
  { name: 'upload' },
];

const volumeInfo = {
  vol1: {
    backend: 'xfs',
    capabilities: ['quota'],
    usage: { percentage: 12 },
    sftp_scaling_groups: ['upload'],
  },
};

describe('selectProjectResourceGroups', () => {
  it('drops the resource groups a volume designated for SFTP', () => {
    expect(selectProjectResourceGroups(scalingGroups, volumeInfo)).toEqual([
      { name: 'default' },
      { name: 'gpu' },
    ]);
  });

  it('keeps them when includeSFTPResourceGroups is set', () => {
    expect(
      selectProjectResourceGroups(scalingGroups, volumeInfo, {
        includeSFTPResourceGroups: true,
      }),
    ).toEqual(scalingGroups);
  });

  it('still applies the caller filter to the SFTP groups it kept', () => {
    expect(
      selectProjectResourceGroups(scalingGroups, volumeInfo, {
        includeSFTPResourceGroups: true,
        filter: (name) => name !== 'gpu',
      }),
    ).toEqual([{ name: 'default' }, { name: 'upload' }]);
  });

  it('returns every group when no volume designates one for SFTP', () => {
    expect(selectProjectResourceGroups(scalingGroups, undefined)).toEqual(
      scalingGroups,
    );
  });
});
