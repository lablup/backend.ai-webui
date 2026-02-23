/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { imageParser } from '.';
import _ from 'lodash';

describe('Image util functions tests', () => {
  // TODO: Use test hooks to test the functions

  const { getBaseImage, getBaseVersion, getTags } = imageParser;

  describe('Test with underbar image tag', () => {
    const IMAGE_NAME = 'abc-def.ghi.systems/llm/jkl/mno_pqr:0.0.0_stu';
    describe('getBaseVersion', () => {
      it('should correctly parse the base version from an image name', () => {
        const baseVersion = getBaseVersion(IMAGE_NAME);
        expect(baseVersion).toBe('0.0.0');
      });
    });

    describe('getBaseImage', () => {
      it('should correctly parse the base image from an image name', () => {
        const baseImage = getBaseImage(IMAGE_NAME);
        expect(baseImage).toBe('mno_pqr');
      });
    });

    describe('getTags', () => {
      it('should correctly parse and process tags from a given tag string', () => {
        const tag = '0.0.0_stu';
        const labels = [{ key: 'abc', value: 'def' }];
        const tags = getTags(tag, labels);
        expect(tags).toEqual([{ key: 'stu', value: '' }]);
      });
    });
  });
  describe('Test with dash image tag', () => {
    const IMAGE_NAME = 'abc-def.ghi.systems/llm/jkl/mno_pqr:0.0.0-stu';
    describe('getBaseVersion', () => {
      it('should correctly parse the base version from an image name', () => {
        const baseVersion = getBaseVersion(IMAGE_NAME);
        expect(baseVersion).toBe('0.0.0');
      });
    });

    describe('getBaseImage', () => {
      it('should correctly parse the base image from an image name', () => {
        const baseImage = getBaseImage(IMAGE_NAME);
        expect(baseImage).toBe('mno_pqr');
      });
    });

    describe('getTags', () => {
      it('should correctly parse and process tags from a given tag string', () => {
        const tag = '0.0.0_stu';
        const labels = [{ key: 'abc', value: 'def' }];
        const tags = getTags(tag, labels);
        expect(tags).toEqual([{ key: 'stu', value: '' }]);
      });
    });
  });
  describe('Test with customized image tag', () => {
    const IMAGE_NAME =
      'abc-def.ghi.systems/llm/jkl/mno_pqr:0.0.0-stu_customized_asdflkjnweri';
    describe('getBaseVersion', () => {
      it('should correctly parse the base version from an image name', () => {
        const baseVersion = getBaseVersion(IMAGE_NAME);
        expect(baseVersion).toBe('0.0.0');
      });
    });

    describe('getBaseImage', () => {
      it('should correctly parse the base image from an image name', () => {
        const baseImage = getBaseImage(IMAGE_NAME);
        expect(baseImage).toBe('mno_pqr');
      });
    });

    describe('getTags', () => {
      it('should handle customized_ tags correctly', () => {
        const tag = '0.0.0-stu_customized_asdflkjnweri';
        const labels = [
          { key: 'ai.backend.customized-image.name', value: 'CustomImage' },
        ];
        const tags = getTags(tag, labels);
        expect(tags).toEqual([
          { key: 'stu', value: '' },
          { key: 'Customized', value: 'CustomImage' },
        ]);
      });
    });
  });
});
