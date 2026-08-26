import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIImageMetaIcon',
  displayName: 'BAI Image Meta Icon',
  category: 'Content',
  keywords: [
    'image',
    'icon',
    'framework',
    'kernel',
    'container',
    'logo',
    'avatar',
  ],
  usage: {
    description:
      'The framework icon for a Backend.AI container image. It reads image metadata through `useBAIImageMetaData()` and joins the host-supplied `imagePath` with the icon filename declared for that image (falling back to `default.png`), then renders a 1em square `<img>` aligned to the surrounding text. It renders nothing when the host application has not provided an `imagePath` — the package resolves no asset paths of its own — so a consumer must sit under `BAIMetaDataProvider` for an icon to appear.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass the full image reference including registry, tag and architecture, since the metadata lookup matches on the whole name.',
      },
      {
        guidance: true,
        description:
          'Place it inline next to the image name — the default 1em sizing and middle vertical alignment are tuned for that, as in `BAIImageNodeSimpleTagV2`.',
      },
      {
        guidance: false,
        description:
          'Rely on it rendering anything outside a `BAIMetaDataProvider` that supplies `imagePath`; keep the surrounding layout correct when it renders null.',
      },
      {
        guidance: false,
        description:
          'Set `alt` to the image name when that name is already shown beside the icon — the empty default keeps screen readers from announcing it twice.',
      },
    ],
  },
  props: [
    {
      name: 'image',
      type: 'string | null',
      description:
        'Full image name, e.g. `cr.backend.ai/multiarch/python:3.9-ubuntu20.04@x86_64`. The icon filename is resolved from the metadata entry that matches it.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Merged over the defaults `width: 1em`, `height: 1em`, `verticalAlign: middle`, so any of those can be overridden.',
    },
    {
      name: 'alt',
      type: 'string',
      description:
        'Accessible name for the icon. Defaults to an empty string, which marks it decorative next to a visible image name.',
      default: "''",
    },
  ],
  examples: [
    {
      label: 'Icon beside an image name',
      code: `<BAIFlex gap="xs" align="center">
  <BAIImageMetaIcon image={fullName} />
  {fullName}
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
