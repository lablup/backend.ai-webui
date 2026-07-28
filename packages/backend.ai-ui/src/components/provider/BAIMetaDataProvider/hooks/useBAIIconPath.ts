import { BAIImagePathContext } from '../context';
import * as _ from 'lodash-es';
import { use } from 'react';

/**
 * Resolves an icon filename against the host-provided icon directory
 * (`BAIMetaDataProvider`'s `imagePath`). The package never guesses an app
 * asset URL, so callers must handle the no-`imagePath` case.
 */
const useBAIIconPath = () => {
  'use memo';
  const imagePath = use(BAIImagePathContext);

  return (fileName?: string | null) => {
    if (_.isUndefined(imagePath) || !fileName) return undefined;
    return `${_.trimEnd(imagePath, '/')}/${fileName}`;
  };
};

export default useBAIIconPath;
