import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'UNSAFELazyUserEmailView',
  displayName: 'UNSAFE Lazy User Email View',
  category: 'Content',
  hidden: true,
  keywords: [
    'user email',
    'email',
    'lazy query',
    'user lookup',
    'unsafe',
    'text',
  ],
  usage: {
    description:
      "A last-resort escape hatch that turns a bare user UUID into that user's email. It fires its own `useLazyLoadQuery` for `user_node` on every mount, so it suspends and must sit under a Suspense boundary with a text-shaped fallback; when the query returns no user, or the user has no email, it renders nothing at all. Reach for it only where the surrounding query genuinely cannot spread a user fragment — anywhere the parent already selects the user node, read the email from there instead, because each instance is an extra round trip and a separate suspension point. The value is rendered through BAIText and every other prop is forwarded to it, so `type`, `ellipsis`, `copyable` and `style` behave exactly as they do on BAIText.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap each instance in its own Suspense with a small skeleton, so the surrounding row keeps its layout while the lookup is in flight.',
      },
      {
        guidance: true,
        description:
          'Guard the call site on the UUID being present and render a placeholder such as a dash yourself — with no `uuid` the component reads from the store only and renders nothing.',
      },
      {
        guidance: true,
        description:
          'Prefer adding a user fragment to the surrounding query; this component exists for the cases where the parent has only an id.',
      },
      {
        guidance: false,
        description:
          'Use it inside a table column or any list that renders many rows — one query per row is exactly the pattern it is named to discourage.',
      },
      {
        guidance: false,
        description:
          'Pass `children`; it is removed from the props type because the email itself is the content.',
      },
    ],
  },
  props: [
    {
      name: 'uuid',
      type: 'string',
      description:
        'Raw user UUID, converted to a `UserNode` global id before the query runs. Left undefined, the query falls back to a store-only read with an empty id, which normally yields nothing and renders nothing.',
    },
    {
      name: 'fetchKey',
      type: 'string',
      description:
        'Forces a refetch when it changes. Its presence also switches the fetch policy: undefined reads store-or-network, any value makes the lookup network-only.',
    },
  ],
  examples: [
    {
      label: 'Owner email on a session detail row',
      code: `<MetadataListItem label={t('session.Owner')}>
  {session.user_id ? (
    <Suspense fallback={<BAISkeleton variant="input" size="small" />}>
      <UNSAFELazyUserEmailView uuid={session.user_id} />
    </Suspense>
  ) : (
    '-'
  )}
</MetadataListItem>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
