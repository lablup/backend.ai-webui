/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { agentSlotTotals, sftpExclusionFilter } from './MemberAgentStatsPanel';
import { describe, expect, it } from 'vitest';

describe('sftpExclusionFilter', () => {
  it('leaves the SFTP-only groups out, as the Agent Summary page does', () => {
    expect(sftpExclusionFilter(['sftp-a', 'sftp-b'])).toBe(
      '!(scaling_group in ["sftp-a", "sftp-b"])',
    );
  });

  it('adds no filter when there are no SFTP groups', () => {
    expect(sftpExclusionFilter([])).toBeNull();
  });
});

describe('agentSlotTotals', () => {
  it('sums capacity and usage per slot and derives what is free', () => {
    expect(
      agentSlotTotals([
        {
          available_slots: '{"cpu": "8", "mem": "1000", "cuda.shares": "2"}',
          occupied_slots: '{"cpu": "2", "mem": "400"}',
        },
        {
          available_slots: '{"cpu": "4", "mem": "500"}',
          occupied_slots: '{"cpu": "4", "mem": "500", "cuda.shares": "1"}',
        },
        { available_slots: null, occupied_slots: null },
      ]),
    ).toEqual({
      capacity: { cpu: 12, mem: 1500, 'cuda.shares': 2 },
      used: { cpu: 6, mem: 900, 'cuda.shares': 1 },
      free: { cpu: 6, mem: 600, 'cuda.shares': 1 },
    });
  });
});
