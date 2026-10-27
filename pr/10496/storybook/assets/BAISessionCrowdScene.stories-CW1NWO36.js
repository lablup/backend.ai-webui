import{r as p,j as u,T as K}from"./iframe-D0Qr9PiQ.js";import{B as L}from"./BAIFlex-C-WVaNo8.js";import{F as m,Z as g,B as T,S as Z,t as j}from"./SessionScene.fixtures--xV-nDZO.js";import"./preload-helper-Dp1pzeXC.js";import"./Badge-CWT5IVJg.js";const H={title:"Lab/BAISessionCrowdScene",component:T,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`
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
        `}}},argTypes:{figures:{control:!1},zones:{control:!1},finders:{control:!1},onFigureClick:{action:"figure clicked"}}},a={name:"Forty sessions, four agents",args:{zones:g,figures:Z.map(j),finders:m,"aria-label":"Crowd scene of 40 sessions"}},o={name:"Finder preselected (my sessions)",args:{...a.args,activeFinderKey:"mine"}},t={name:"Controlled finder + click handler",render:()=>{const[e,n]=p.useState("hot"),[r,s]=p.useState(null);return u.jsxs(L,{direction:"column",align:"stretch",gap:"sm",children:[u.jsxs(K,{type:"supporting",children:["active finder: ",e??"—"," · last clicked:"," ",r?`${r.name} (${r.owner})`:"—"]}),u.jsx(T,{zones:g,figures:Z.map(j),finders:m,activeFinderKey:e,onActiveFinderChange:n,onFigureClick:s})]})}},f=(e,n,r)=>[.15,.5,.9,null].map((s,i)=>({key:`${n}-${i}`,name:`${e} ${s===null?"?":`${Math.round(s*100)}%`}`,zoneKey:n,mood:e,utilization:.5,resourceShare:s,isHero:i===r})),d={name:"Furniture size = resource share",args:{zones:[{key:"desks",label:"desks: 15% · 50% · 90% · ?"},{key:"sofas",label:"sofas: 15% · 50% · 90% · ?"}],figures:[...f("working","desks",1),...f("idle","sofas",2)]}},l={name:"Every state, 2× pixels",args:{pixelScale:2,hideLegend:!0,zones:[{key:"z",label:"a100-node-01"}],figures:[["working",.6,.4,!1],["working",.3,.8,!0],["overheated",.97,.7,!1],["overheated",.95,.5,!0],["idle",.02,.2,!1],["idle",.01,.6,!0],["leaving",void 0,.5,!1],["waiting",void 0,void 0,!1],["waiting",void 0,void 0,!0]].map(([e,n,r,s],i)=>({key:`m${i}`,name:`${e}${s?" (mine)":""}`,zoneKey:"z",mood:e,utilization:n,resourceShare:r,isHero:s}))}},c={args:{zones:g,figures:[],finders:m}};var h,S,k;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'Forty sessions, four agents',
  args: {
    zones: ZONES,
    figures: SESSIONS.map(toFigure),
    finders: FINDERS,
    'aria-label': 'Crowd scene of 40 sessions'
  }
}`,...(k=(S=a.parameters)==null?void 0:S.docs)==null?void 0:k.source}}};var y,F,w;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'Finder preselected (my sessions)',
  args: {
    ...FortySessions.args,
    activeFinderKey: 'mine'
  }
}`,...(w=(F=o.parameters)==null?void 0:F.docs)==null?void 0:w.source}}};var v,x,z;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(z=(x=t.parameters)==null?void 0:x.docs)==null?void 0:z.source}}};var E,I,C;d.parameters={...d.parameters,docs:{...(E=d.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(C=(I=d.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};var b,A,$;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
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
}`,...($=(A=l.parameters)==null?void 0:A.docs)==null?void 0:$.source}}};var B,N,O;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    zones: ZONES,
    figures: [],
    finders: FINDERS
  }
}`,...(O=(N=c.parameters)==null?void 0:N.docs)==null?void 0:O.source}}};const _=["FortySessions","SpotlightMine","Controlled","TierLadder","EveryState","Empty"];export{t as Controlled,c as Empty,l as EveryState,a as FortySessions,o as SpotlightMine,d as TierLadder,_ as __namedExportsOrder,H as default};
