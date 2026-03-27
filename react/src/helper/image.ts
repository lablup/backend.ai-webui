import _ from 'lodash';

type ImageWithLabels = {
  labels?:
    | ReadonlyArray<{
        readonly key?: string | null;
        readonly value?: string | null;
      } | null>
    | null
    | undefined;
};

export const isPrivateImage = (image: ImageWithLabels) => {
  return _.some(image?.labels, (label) => {
    return (
      label?.key === 'ai.backend.features' &&
      label?.value?.split(' ').includes('private')
    );
  });
};
