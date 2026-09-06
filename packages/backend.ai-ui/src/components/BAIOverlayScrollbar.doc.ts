import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIOverlayScrollbar',
  displayName: 'BAI Overlay Scrollbar',
  category: 'Utility',
  keywords: [
    'scrollbar',
    'overlay scrollbar',
    'custom scrollbar',
    'scroll thumb',
    'scroll area',
    'scrollbar gutter',
  ],
  usage: {
    description:
      "A persistent scroll thumb painted over a scroll container instead of beside it. It hides the target's native bar (by setting data-bai-custom-scrollbar on the element, which the component's stylesheet keys off) and draws its own absolutely positioned track and thumb, so becoming scrollable never changes the content width — the gap left by overflow: overlay being gone from Chromium and scrollbar-gutter: stable reserving a permanently empty strip. The thumb stays visible the whole time the content overflows, which is what makes scrollability discoverable, and it can be dragged. Position, height and drag all write straight to the DOM from a scroll listener, a ResizeObserver and a MutationObserver on the target, so scrolling never enters React's render loop. On touch-primary pointers it renders null and leaves the platform's own indicator alone.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Render it as a sibling inside the target's positioned ancestor — the track is absolutely positioned and will otherwise anchor to the wrong box.",
      },
      {
        guidance: true,
        description:
          'Point it at the element that actually scrolls (the one with overflow), not at a wrapper, since it measures scrollHeight and clientHeight on that node.',
      },
      {
        guidance: true,
        description:
          'Keep it mounted for the lifetime of the scroll region; unmounting restores the native bar and the content width shifts back.',
      },
      {
        guidance: false,
        description:
          "Combine it with scrollbar-gutter or a hand-rolled overflow hack on the same element — hiding the native bar is the component's job and doing both leaves a dead strip.",
      },
      {
        guidance: false,
        description:
          'Expect it on a phone or tablet; a coarse pointer means it renders nothing, so scroll affordances must not depend on it being there.',
      },
    ],
  },
  props: [
    {
      name: 'targetRef',
      type: 'React.RefObject<HTMLElement | null>',
      description:
        'Ref to the scroll container this thumb tracks. Its native scrollbar is hidden while the component is mounted, and its scroll, resize and subtree mutations drive the thumb.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Scroll column in the app shell',
      code: `<BAIContentWithDrawerArea drawerWidth={DRAWER_WIDTH}>
  <BAIFlex
    ref={contentScrollFlexRef}
    direction="column"
    align="stretch"
    style={{ overflowY: 'auto' }}
  >
    {children}
  </BAIFlex>
  <BAIOverlayScrollbar targetRef={contentScrollFlexRef} />
</BAIContentWithDrawerArea>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
