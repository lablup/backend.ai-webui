import {
  PRIMARY_TAG_VARIANT,
  STATUS_BADGE_VARIANT,
  badgeVariantForStatus,
  badgeVariantForTagColor,
  tokenColorForStatus,
  tokenColorForTagColor,
} from './astryxTagVariant';
import { describe, expect, it } from 'vitest';

describe('badgeVariantForTagColor', () => {
  it('maps antd status presets to semantic variants', () => {
    expect(badgeVariantForTagColor('success')).toBe('success');
    expect(badgeVariantForTagColor('processing')).toBe('info');
    expect(badgeVariantForTagColor('error')).toBe('error');
    expect(badgeVariantForTagColor('warning')).toBe('warning');
    expect(badgeVariantForTagColor('default')).toBe('neutral');
  });

  it('maps antd palette presets to same-hue variants', () => {
    expect(badgeVariantForTagColor('blue')).toBe('blue');
    expect(badgeVariantForTagColor('green')).toBe('green');
    expect(badgeVariantForTagColor('red')).toBe('red');
    expect(badgeVariantForTagColor('orange')).toBe('orange');
    expect(badgeVariantForTagColor('cyan')).toBe('cyan');
    expect(badgeVariantForTagColor('purple')).toBe('purple');
  });

  it('merges hues Astryx does not have into the nearest neighbour', () => {
    expect(badgeVariantForTagColor('geekblue')).toBe('blue');
    expect(badgeVariantForTagColor('gold')).toBe('yellow');
    expect(badgeVariantForTagColor('magenta')).toBe('pink');
    expect(badgeVariantForTagColor('volcano')).toBe('orange');
    expect(badgeVariantForTagColor('lime')).toBe('green');
    expect(badgeVariantForTagColor('lightblue')).toBe('cyan');
  });

  it('drops the -inverse emphasis axis to the base hue (policy class 3)', () => {
    expect(badgeVariantForTagColor('orange-inverse')).toBe('orange');
    expect(badgeVariantForTagColor('blue-inverse')).toBe('blue');
  });

  it('accepts BUI SemanticColor values directly (policy class 6)', () => {
    expect(badgeVariantForTagColor('info')).toBe('info');
  });

  it('drops unknown, hex, empty, and nullish values to neutral (policy class 5)', () => {
    expect(badgeVariantForTagColor('#ff0000')).toBe('neutral');
    expect(badgeVariantForTagColor('rgb(0, 128, 0)')).toBe('neutral');
    expect(badgeVariantForTagColor('not-a-color')).toBe('neutral');
    expect(badgeVariantForTagColor('')).toBe('neutral');
    expect(badgeVariantForTagColor(undefined)).toBe('neutral');
    expect(badgeVariantForTagColor(null)).toBe('neutral');
  });

  it('normalizes case and whitespace', () => {
    expect(badgeVariantForTagColor(' Blue ')).toBe('blue');
    expect(badgeVariantForTagColor('SUCCESS')).toBe('success');
  });
});

describe('tokenColorForTagColor', () => {
  it('maps semantic presets onto the Token color enum', () => {
    expect(tokenColorForTagColor('success')).toBe('green');
    expect(tokenColorForTagColor('processing')).toBe('blue');
    expect(tokenColorForTagColor('error')).toBe('red');
    expect(tokenColorForTagColor('warning')).toBe('orange');
    expect(tokenColorForTagColor('default')).toBe('default');
  });

  it('drops unknown values to default', () => {
    expect(tokenColorForTagColor('#123456')).toBe('default');
    expect(tokenColorForTagColor(undefined)).toBe('default');
  });
});

describe('badgeVariantForStatus', () => {
  it('maps session lifecycle states', () => {
    expect(badgeVariantForStatus('session', 'RUNNING')).toBe('success');
    expect(badgeVariantForStatus('session', 'PREPARING')).toBe('info');
    expect(badgeVariantForStatus('session', 'TERMINATING')).toBe('warning');
    expect(badgeVariantForStatus('session', 'CANCELLED')).toBe('error');
    // conflict resolution: V2 mapping (quiet default state) wins over V1 blue
    expect(badgeVariantForStatus('session', 'PENDING')).toBe('neutral');
  });

  it('maps deployment and route health states', () => {
    expect(badgeVariantForStatus('deployment', 'HEALTHY')).toBe('success');
    expect(badgeVariantForStatus('deployment', 'DEGRADED')).toBe('warning');
    expect(badgeVariantForStatus('deployment', 'STOPPED')).toBe('neutral');
    expect(badgeVariantForStatus('route', 'FAILED_TO_START')).toBe('error');
    expect(badgeVariantForStatus('replica', 'WARMING_UP')).toBe('info');
  });

  it('maps vfolder states across V1 kebab-case and V2 UPPERCASE vocabularies', () => {
    expect(badgeVariantForStatus('vfolder', 'READY')).toBe('warning');
    expect(badgeVariantForStatus('vfolder', 'ready')).toBe('warning');
    expect(badgeVariantForStatus('vfolder', 'DELETE_ERROR')).toBe('error');
    expect(badgeVariantForStatus('vfolder', 'delete-pending')).toBe('neutral');
  });

  it('drops unknown states and Relay future enum values to neutral', () => {
    expect(badgeVariantForStatus('session', '%future added value')).toBe(
      'neutral',
    );
    expect(badgeVariantForStatus('agent', undefined)).toBe('neutral');
    expect(badgeVariantForStatus('loginHistory', 'SOMETHING_NEW')).toBe(
      'neutral',
    );
  });

  it('keeps category domains on palette variants, not semantic ones', () => {
    expect(badgeVariantForStatus('sessionType', 'INTERACTIVE')).toBe('blue');
    expect(badgeVariantForStatus('sessionType', 'BATCH')).toBe('cyan');
    expect(badgeVariantForStatus('sessionType', 'INFERENCE')).toBe('purple');
    expect(badgeVariantForStatus('cloudPlatform', 'aws')).toBe('orange');
    expect(badgeVariantForStatus('storageBackend', 'weka')).toBe('purple');
    expect(badgeVariantForStatus('vfolderPermission', 'w')).toBe('blue');
  });
});

describe('tokenColorForStatus', () => {
  it('projects domain lookups onto the Token color enum', () => {
    expect(tokenColorForStatus('session', 'RUNNING')).toBe('green');
    expect(tokenColorForStatus('session', 'ERROR')).toBe('red');
    expect(tokenColorForStatus('session', 'TERMINATED')).toBe('default');
  });
});

describe('module invariants', () => {
  it('exposes a brand variant for token.colorPrimary call sites', () => {
    expect(PRIMARY_TAG_VARIANT).toBe('green');
  });

  it('every domain map value is a valid Badge variant', () => {
    const valid = new Set([
      'neutral',
      'info',
      'success',
      'warning',
      'error',
      'blue',
      'cyan',
      'green',
      'orange',
      'pink',
      'purple',
      'red',
      'teal',
      'yellow',
    ]);
    Object.values(STATUS_BADGE_VARIANT).forEach((map) => {
      Object.values(map).forEach((variant) => {
        expect(valid.has(variant)).toBe(true);
      });
    });
  });
});
