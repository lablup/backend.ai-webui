import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{a as t,i as n,n as r,o as i,r as a,s as o,t as s}from"./SessionScene.fixtures-BeOFIt6v.js";import{n as c,t as l}from"./BAIFlex-CAz1t6J5.js";import{useState as u}from"react";import{jsx as d,jsxs as f}from"react/jsx-runtime";import{Text as p}from"@lablup/ui-common/Text";var m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{c(),o(),n(),m={title:`Lab/BAISessionCrowdScene`,component:i,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAISessionCrowdScene** is a proof-of-concept "Where's Wally" office built
from the BAI Pixel Office asset pack. Each agent is a room; each session is a
fixed-size pixel character.

**What a session holds is its furniture.** A working session sits at a desk,
an idle one takes a lounge sofa, and both the furniture and the floor rug it
reserves step up **small → medium → large** with the session's share of the
agent's capacity (the largest of cpu / gpu / memory): < 34%, 34–67%, ≥ 67%.
The steps are buckets, not a proportional chart — the exact share is in the
hover card. A share that is not measured yet draws a dashed small rug with a
"?".

- **Overheated** — red-faced (or, for your own, smoke + a hot icon).
- **Idle** — on the lounge carpet, Z's floating.
- **Waiting** — no furniture yet; queues at the door holding a numbered ticket.
- **Terminating** — walks away from a fading desk with a suitcase.
- **Yours** — striped shirt, whatever the state.

**Finders** spotlight the matching sessions, dim the rest and outline the
rooms that hold a match. Sprites render at an integer \`pixelScale\` with
\`image-rendering: pixelated\`; under \`prefers-reduced-motion\` everything
holds on the first frame.
        `}}},argTypes:{figures:{control:!1},zones:{control:!1},finders:{control:!1},onFigureClick:{action:`figure clicked`}}},h={name:`Forty sessions, four agents`,args:{zones:a,figures:r.map(t),finders:s,"aria-label":`Crowd scene of 40 sessions`}},g={name:`Finder preselected (my sessions)`,args:{...h.args,activeFinderKey:`mine`}},_={name:`Controlled finder + click handler`,render:()=>{let[e,n]=u(`hot`),[o,c]=u(null);return f(l,{direction:`column`,align:`stretch`,gap:`sm`,children:[f(p,{type:`supporting`,children:[`active finder: `,e??`—`,` · last clicked:`,` `,o?`${o.name} (${o.owner})`:`—`]}),d(i,{zones:a,figures:r.map(t),finders:s,activeFinderKey:e,onActiveFinderChange:n,onFigureClick:c})]})}},v=(e,t,n)=>[.15,.5,.9,null].map((r,i)=>({key:`${t}-${i}`,name:`${e} ${r===null?`?`:`${Math.round(r*100)}%`}`,zoneKey:t,mood:e,utilization:.5,resourceShare:r,isHero:i===n})),y={name:`Furniture size = resource share`,args:{zones:[{key:`desks`,label:`desks: 15% · 50% · 90% · ?`},{key:`sofas`,label:`sofas: 15% · 50% · 90% · ?`}],figures:[...v(`working`,`desks`,1),...v(`idle`,`sofas`,2)]}},b={name:`Every state, 2× pixels`,args:{pixelScale:2,hideLegend:!0,zones:[{key:`z`,label:`a100-node-01`}],figures:[[`working`,.6,.4,!1],[`working`,.3,.8,!0],[`overheated`,.97,.7,!1],[`overheated`,.95,.5,!0],[`idle`,.02,.2,!1],[`idle`,.01,.6,!0],[`leaving`,void 0,.5,!1],[`waiting`,void 0,void 0,!1],[`waiting`,void 0,void 0,!0]].map(([e,t,n,r],i)=>({key:`m${i}`,name:`${e}${r?` (mine)`:``}`,zoneKey:`z`,mood:e,utilization:t,resourceShare:n,isHero:r}))}},x={args:{zones:a,figures:[],finders:s}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Forty sessions, four agents',
  args: {
    zones: ZONES,
    figures: SESSIONS.map(toFigure),
    finders: FINDERS,
    'aria-label': 'Crowd scene of 40 sessions'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Finder preselected (my sessions)',
  args: {
    ...FortySessions.args,
    activeFinderKey: 'mine'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Controlled finder + click handler',
  render: () => {
    const [finder, setFinder] = useState<string | null>('hot');
    const [picked, setPicked] = useState<BAICrowdFigure | null>(null);
    return <BAIFlex direction="column" align="stretch" gap="sm">
        <Text type="supporting">
          active finder: {finder ?? '—'} · last clicked:{' '}
          {picked ? \`\${picked.name} (\${picked.owner})\` : '—'}
        </Text>
        <BAISessionCrowdScene zones={ZONES} figures={SESSIONS.map(toFigure)} finders={FINDERS} activeFinderKey={finder} onActiveFinderChange={setFinder} onFigureClick={setPicked} />
      </BAIFlex>;
  }
}`,..._.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Furniture size = resource share',
  args: {
    zones: [{
      key: 'desks',
      label: 'desks: 15% · 50% · 90% · ?'
    }, {
      key: 'sofas',
      label: 'sofas: 15% · 50% · 90% · ?'
    }],
    figures: [...ladder('working', 'desks', 1), ...ladder('idle', 'sofas', 2)]
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Every state, 2× pixels',
  args: {
    pixelScale: 2,
    hideLegend: true,
    zones: [{
      key: 'z',
      label: 'a100-node-01'
    }],
    figures: ([['working', 0.6, 0.4, false], ['working', 0.3, 0.8, true], ['overheated', 0.97, 0.7, false], ['overheated', 0.95, 0.5, true], ['idle', 0.02, 0.2, false], ['idle', 0.01, 0.6, true], ['leaving', undefined, 0.5, false], ['waiting', undefined, undefined, false], ['waiting', undefined, undefined, true]] as Array<[BAICrowdFigureMood, number | undefined, number | undefined, boolean]>).map(([mood, util, share, mine], i) => ({
      key: \`m\${i}\`,
      name: \`\${mood}\${mine ? ' (mine)' : ''}\`,
      zoneKey: 'z',
      mood,
      utilization: util,
      resourceShare: share,
      isHero: mine
    }))
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    zones: ZONES,
    figures: [],
    finders: FINDERS
  }
}`,...x.parameters?.docs?.source}}},S=[`FortySessions`,`SpotlightMine`,`Controlled`,`TierLadder`,`EveryState`,`Empty`]})))()}C();export{_ as Controlled,x as Empty,b as EveryState,h as FortySessions,g as SpotlightMine,y as TierLadder,S as __namedExportsOrder,m as default};