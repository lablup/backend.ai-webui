import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIImageWithFallback',
  displayName: 'BAI Image With Fallback',
  category: 'Content',
  keywords: [
    'image',
    'img',
    'fallback',
    'placeholder',
    'broken image',
    'avatar',
    'icon',
  ],
  usage: {
    description:
      'A plain `<img>` that swaps itself for a node when the source fails to load. It records the exact `src` that errored, so a later `src` change gets a fresh attempt instead of staying stuck on the fallback. Use it for icons and logos whose URL is resolved at runtime from server configuration or metadata, where a missing file is expected rather than exceptional. The props type extends `React.ImgHTMLAttributes<HTMLImageElement>` minus `onError`, so `width`, `height`, `style`, `loading` and the rest of the DOM image attributes pass through to the rendered image.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass a fallback that occupies the same box as the image — a lucide icon sized to match `width` / `height` — so the surrounding layout does not shift when the load fails.',
      },
      {
        guidance: true,
        description:
          'Reach for it whenever the URL comes from server config or image metadata, since the package cannot know which icon files a given deployment actually ships.',
      },
      {
        guidance: false,
        description:
          'Pass `onError`; the component owns that handler and the prop is omitted from the type.',
      },
      {
        guidance: false,
        description:
          'Use it for decorative images with no meaningful fallback — `alt` is required here, and a bare `<img>` is enough when there is nothing to degrade to.',
      },
    ],
  },
  props: [
    {
      name: 'src',
      type: 'string',
      description:
        'Image URL. Changing it clears the error state, so a new URL is attempted even after the previous one failed.',
      required: true,
    },
    {
      name: 'fallbackIcon',
      type: 'ReactNode',
      description:
        'Rendered in place of the image once loading fails. It replaces the `<img>` entirely, so it must carry its own sizing.',
      required: true,
    },
    {
      name: 'alt',
      type: 'string',
      description:
        'Accessible name for the image. Required here, unlike on a raw `<img>`, because these images carry meaning rather than decoration.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Device icon with a generic fallback',
      code: `<BAIImageWithFallback
  src={iconUrl}
  alt={type}
  width={size}
  height={size}
  style={{ alignSelf: 'center' }}
  fallbackIcon={genericIcon}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
