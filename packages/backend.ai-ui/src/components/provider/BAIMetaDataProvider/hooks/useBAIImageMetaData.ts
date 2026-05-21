import { preserveDotStartCase } from '../../../../helper';
import { BAIImageMetaDataContext, BAIImagePathContext } from '../context';
import * as _ from 'lodash-es';
import { use } from 'react';

/**
 * Access the image metadata (`resources/image_metadata.json`) provided by
 * `BAIMetaDataProvider`, together with a set of helpers for resolving image
 * icons and humanized tag/name aliases.
 *
 * This mirrors the v1 `useBackendAIImageMetaData` hook from the React app, but
 * reads the metadata from React context (provided by the host app) instead of
 * fetching it, so `backend.ai-ui` stays free of a data-fetching dependency.
 *
 * The returned helpers are null-safe: when no metadata has been provided yet
 * they fall back to sensible defaults (`default.png` icon, identity aliasing).
 */
const useBAIImageMetaData = () => {
  'use memo';
  const metadata = use(BAIImageMetaDataContext);
  const imagePath = use(BAIImagePathContext);

  const getImageMeta = (imageName: string) => {
    // registry/name:tag@architecture
    // cr.backend.ai/multiarch/python:3.9-ubuntu20.04
    // key = python, tags = [3.9, ubuntu20.04]
    if (_.isEmpty(imageName)) {
      return { key: '', tags: [] as string[] };
    }
    const specs = imageName.split('/');
    try {
      const [key, tag] = (
        specs[specs.length - 1] ||
        specs[specs.length - 2] ||
        ''
      ).split(':');
      // remove architecture string and split by '-'
      const tags = _.split(_.first(_.split(tag, '@')), '-');
      return { key, tags };
    } catch {
      return { key: '', tags: [] as string[] };
    }
  };

  const helpers = {
    getImageMeta,
    /**
     * Full icon URL for the image: the `imagePath` provided via
     * `BAIMetaDataProvider` joined with the icon filename declared in
     * `imageInfo` (falling back to `default.png` for unknown images).
     * Returns `undefined` when no `imagePath` has been provided — the
     * package never resolves an app asset path on its own.
     */
    getImageIcon: (imageName?: string | null) => {
      if (_.isUndefined(imagePath)) return undefined;
      const iconFileName =
        (imageName && metadata?.imageInfo[getImageMeta(imageName).key]?.icon) ||
        'default.png';
      return `${_.trimEnd(imagePath, '/')}/${iconFileName}`;
    },
    getBaseVersion: (imageName: string) => {
      return (
        _.first(_.split(_.last(_.split(imageName, ':')), /[^a-zA-Z\d.]+/)) || ''
      );
    },
    getBaseImage: (imageName: string) => {
      const splitByColon = _.split(imageName, ':');
      const beforeLastColon = _.join(_.initial(splitByColon), ':');
      const lastItemAfterSplitBySlash = _.last(_.split(beforeLastColon, '/'));
      return lastItemAfterSplitBySlash || '';
    },
    tagAlias: (tag: string) => {
      if (!metadata) return preserveDotStartCase(tag);
      const matchedPair = _.find(
        _.toPairs(metadata.tagReplace),
        ([regExpStr]) => new RegExp(regExpStr).test(tag),
      );
      const replaced = matchedPair
        ? _.replace(tag, new RegExp(matchedPair[0]), matchedPair[1] as string)
        : undefined;
      return metadata.tagAlias[tag] ?? replaced ?? preserveDotStartCase(tag);
    },
  };

  return [metadata, helpers] as const;
};

export default useBAIImageMetaData;
