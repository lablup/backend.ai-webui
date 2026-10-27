import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{a as n,c as r,d as i,f as a,h as o,i as s,l as c,m as l,n as u,o as d,p as f,r as p,s as m,t as h,u as g}from"./SessionScene.fixtures-BeOFIt6v.js";import{l as _}from"./iframe-DR2sIF5r.js";import{n as v,t as y}from"./BAIFlex-CAz1t6J5.js";import{i as b,n as x,r as S,t as C}from"./BAISegmentedControl-BHWkOXgz.js";import{useState as w}from"react";import{Fragment as T,jsx as E,jsxs as D}from"react/jsx-runtime";import{c as O}from"react/compiler-runtime";import{Tooltip as k}from"@lablup/ui-common/Tooltip";import{Text as A}from"@lablup/ui-common/Text";function j(e,t){return E(`g`,{className:`pw-blade pw-blade-${t}`,transform:`rotate(${e} 24 22)`,children:D(`g`,{className:`pw-blade-drift`,children:[E(`path`,{className:t%2?`pw-face pw-b`:`pw-face pw-a`,d:`M24 22 L24.5 4.5 C31 5.5 37.5 9.5 40.5 15.5 C34 16 28.5 18.5 24 22 Z`}),E(`path`,{className:t%2?`pw-fold pw-b`:`pw-fold pw-a`,d:`M24 22 L24.5 4.5 C27.6 10 27.2 16.6 24 22 Z`})]})},e)}function M(e){return e.zoneKey}function N(e){return e.mood===`working`||e.mood===`overheated`}function P(e){return i(e.utilization)}function F(e){return e.mood===`waiting`}function I(e){return e.key}var L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{v(),f(),L=t(_(),1),R=t(r(),1),z=5,B=[0,90,180,270],V=e=>{let t=0;for(let n=0;n<e.length;n++)t=t*31+e.charCodeAt(n)|0;return Math.abs(t)%z},H=e=>{"use memo";let t=O(20),{mood:n,isHero:r,ticket:i}=e,a=n!==`waiting`,o;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(o=E(`path`,{className:`pw-tuft`,d:`M13 72 C15 67 16 64.5 18 62 C18.4 66 19 69.5 20 72 Z M20 72 C22 66 23.5 63 26.5 60.5 C25.6 65.5 25.6 69 26.5 72 Z M26 72 C28 67 30 64.5 34 63 C31.5 67 30.5 70 30.5 72 Z`}),t[0]=o):o=t[0];let s;t[1]===Symbol.for(`react.memo_cache_sentinel`)?(s=E(`rect`,{className:`pw-stick`,x:`22.8`,y:`22`,width:`2.6`,height:`48`,rx:`1.3`}),t[1]=s):s=t[1];let c;t[2]===r?c=t[3]:(c=r&&D(`g`,{className:`pw-ribbon`,children:[E(`path`,{d:`M25.4 44 C31 43 34.5 48 42 46.2 C38.5 51.5 32 50 25.4 47 Z`}),E(`path`,{d:`M23 45.5 C18 42 15.5 47.5 19.5 48.5 C21 48.8 22.4 47.5 23 45.5 Z`}),E(`circle`,{cx:`24.1`,cy:`45.6`,r:`1.6`})]}),t[2]=r,t[3]=c);let l;t[4]!==n||t[5]!==i?(l=n===`waiting`&&D(`g`,{className:`pw-ticket`,children:[E(`line`,{x1:`24`,y1:`44`,x2:`24`,y2:`47`}),E(`rect`,{x:`18.5`,y:`47`,width:`11`,height:`8`,rx:`1.2`}),E(`text`,{x:`24`,y:`53.2`,children:i??`#`})]}),t[4]=n,t[5]=i,t[6]=l):l=t[6];let u;t[7]===a?u=t[8]:(u=a?D(T,{children:[E(`circle`,{className:`pw-blur`,cx:`24`,cy:`22`,r:`17`}),E(`g`,{className:`pw-blades`,children:B.map(j)})]}):D(`g`,{className:`pw-bud`,children:[E(`rect`,{className:`pw-face pw-a`,x:`16`,y:`14`,width:`16`,height:`16`,rx:`1`,transform:`rotate(45 24 22)`}),E(`path`,{className:`pw-cut`,d:`M24 10.7 L24 18.5 M35.3 22 L27.5 22 M24 33.3 L24 25.5 M12.7 22 L20.5 22`})]}),t[7]=a,t[8]=u);let d;t[9]===Symbol.for(`react.memo_cache_sentinel`)?(d=E(`circle`,{className:`pw-hub`,cx:`24`,cy:`22`,r:`2.6`}),t[9]=d):d=t[9];let f;t[10]===n?f=t[11]:(f=n===`idle`&&D(`g`,{className:`pw-dragonfly`,transform:`translate(28 2) rotate(-8) scale(1.7)`,children:[D(`g`,{className:`pw-wings`,children:[E(`ellipse`,{cx:`-0.5`,cy:`-1.6`,rx:`4`,ry:`1.2`}),E(`ellipse`,{cx:`1.4`,cy:`-1.4`,rx:`3.4`,ry:`1`})]}),E(`line`,{x1:`-6`,y1:`0`,x2:`4`,y2:`0`}),E(`circle`,{cx:`4.8`,cy:`0`,r:`1.3`})]}),t[10]=n,t[11]=f);let p;t[12]===n?p=t[13]:(p=n===`overheated`&&D(`g`,{className:`pw-embers`,children:[E(`circle`,{cx:`20`,cy:`18`,r:`1.1`}),E(`circle`,{cx:`28`,cy:`16`,r:`0.9`}),E(`circle`,{cx:`24`,cy:`12`,r:`1`})]}),t[12]=n,t[13]=p);let m;return t[14]!==c||t[15]!==l||t[16]!==u||t[17]!==f||t[18]!==p?(m=D(`svg`,{className:`pw-glyph`,viewBox:`0 0 48 72`,"aria-hidden":`true`,focusable:`false`,children:[o,D(`g`,{className:`pw-sway`,children:[s,c,l,u,d,f,p]})]}),t[14]=c,t[15]=l,t[16]=u,t[17]=f,t[18]=p,t[19]=m):m=t[19],m},U=()=>D(`svg`,{className:`pw-clouds`,viewBox:`0 0 240 64`,preserveAspectRatio:`xMidYMid slice`,"aria-hidden":`true`,focusable:`false`,children:[D(`g`,{className:`pw-cloud pw-cloud-1`,children:[E(`rect`,{className:`pw-cloud-shade`,x:`30`,y:`33`,width:`66`,height:`12`,rx:`6`}),E(`circle`,{cx:`44`,cy:`32`,r:`11`}),E(`circle`,{cx:`58`,cy:`24`,r:`14`}),E(`circle`,{cx:`75`,cy:`28`,r:`12`}),E(`circle`,{cx:`88`,cy:`34`,r:`8.5`}),E(`rect`,{x:`33`,y:`31`,width:`60`,height:`10`,rx:`5`})]}),D(`g`,{className:`pw-cloud pw-cloud-2`,children:[E(`rect`,{className:`pw-cloud-shade`,x:`150`,y:`41`,width:`44`,height:`8`,rx:`4`}),E(`circle`,{cx:`160`,cy:`40`,r:`7`}),E(`circle`,{cx:`171`,cy:`34`,r:`9.5`}),E(`circle`,{cx:`184`,cy:`39`,r:`7`}),E(`rect`,{x:`153`,y:`39`,width:`40`,height:`7`,rx:`3.5`})]}),D(`g`,{className:`pw-wind`,children:[E(`path`,{d:`M-30 18 q30 -7 60 0 t60 0 t60 0 t60 0 t60 0`}),E(`path`,{d:`M-30 46 q30 -6 60 0 t60 0 t60 0 t60 0 t60 0`})]})]}),W=e=>{"use memo";let t=O(53),n,r,s,u,d,f,p,m,h;t[0]===e?(n=t[1],r=t[2],s=t[3],u=t[4],d=t[5],f=t[6],p=t[7],m=t[8],h=t[9]):({figures:u,zones:h,finders:m,activeFinderKey:n,onActiveFinderChange:f,onFigureClick:p,hideLegend:d,className:r,...s}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=s,t[4]=u,t[5]=d,t[6]=f,t[7]=p,t[8]=m,t[9]=h);let _;t[10]===m?_=t[11]:(_=m===void 0?[]:m,t[10]=m,t[11]=_);let v=_,b=o(),x;t[12]!==n||t[13]!==u||t[14]!==v||t[15]!==f?(x={figures:u,finders:v,activeFinderKey:n,onActiveFinderChange:f},t[12]=n,t[13]=u,t[14]=v,t[15]=f,t[16]=x):x=t[16];let{finderKey:S,setFinderKey:C,matches:w}=l(x),T,j,z,B,W;if(t[17]!==r||t[18]!==s||t[19]!==u||t[20]!==S||t[21]!==v||t[22]!==b||t[23]!==w||t[24]!==p||t[25]!==C||t[26]!==h){let e=R.default.groupBy(u,M);z=s;let n=!!w;t[32]!==r||t[33]!==n?(B=(0,L.default)(`bai-pinwheel-meadow`,r,{"is-searching":n}),t[32]=r,t[33]=n,t[34]=B):B=t[34],t[35]!==u||t[36]!==S||t[37]!==v||t[38]!==w||t[39]!==C?(W=E(g,{figures:u,finders:v,finderKey:S,matches:w,onChange:C}),t[35]=u,t[36]=S,t[37]=v,t[38]=w,t[39]=C,t[40]=W):W=t[40],T=`pw-zones`,j=h.map(t=>{let n=e[t.key]??[],r=w?n.filter(e=>w.has(e.key)).length:0,a=n.filter(N),o=a.length?R.default.meanBy(a,P):0,s=n.filter(F).map(I);return D(`section`,{className:(0,L.default)(`pw-zone`,{"has-found":r>0,"is-empty-of-found":w&&r===0}),style:{"--pw-wind":o},"aria-label":t.label,children:[D(`div`,{className:`pw-sky`,children:[E(U,{}),D(y,{className:`pw-sign-row`,justify:`between`,align:`center`,gap:`xs`,children:[E(`span`,{className:`pw-sign`,children:E(A,{type:`label`,color:`inherit`,children:t.label})}),E(`span`,{className:`pw-sign pw-sign-count`,children:E(A,{type:`supporting`,color:`inherit`,children:w&&r>0?`${r} / ${n.length}`:n.length})})]})]}),E(`svg`,{className:`pw-hill`,viewBox:`0 0 240 16`,preserveAspectRatio:`none`,"aria-hidden":`true`,focusable:`false`,children:E(`path`,{d:`M0 16 L0 9 C40 1 80 2 120 7 C160 12 200 4 240 6 L240 16 Z`})}),E(`div`,{className:`pw-field`,children:n.map((e,t)=>{let n=w?.has(e.key)??!1,r=e.mood===`waiting`?String(s.indexOf(e.key)+1):void 0;return E(k,{content:E(c,{figure:e}),placement:`above`,children:E(`button`,{type:`button`,className:(0,L.default)(`pw-item`,`mood-${e.mood}`,`pal-${e.mood===`overheated`?`hot`:V(e.key)}`,{"is-hero":e.isHero,"is-found":n,"is-dimmed":w&&!n}),style:{"--pw-util":i(e.utilization),"--pw-phase":`${t%7*-.41}s`,"--pw-lift":`${t*37%7}px`,"--pw-scale":.9+t*53%13/100},"aria-label":`${e.name} — ${b.mood(e.mood)}`,onClick:()=>p?.(e),children:E(H,{mood:e.mood,isHero:!!e.isHero,ticket:r})})},e.key)})})]},t.key)}),t[17]=r,t[18]=s,t[19]=u,t[20]=S,t[21]=v,t[22]=b,t[23]=w,t[24]=p,t[25]=C,t[26]=h,t[27]=T,t[28]=j,t[29]=z,t[30]=B,t[31]=W}else T=t[27],j=t[28],z=t[29],B=t[30],W=t[31];let G;t[41]!==T||t[42]!==j?(G=E(`div`,{className:T,children:j}),t[41]=T,t[42]=j,t[43]=G):G=t[43];let K;t[44]!==d||t[45]!==b?(K=!d&&D(y,{className:`pw-legend`,gap:`md`,wrap:`wrap`,align:`center`,children:[a.map(e=>D(y,{gap:`xxs`,align:`center`,children:[E(`span`,{className:(0,L.default)(`pw-item is-legend`,`mood-${e}`,e===`overheated`?`pal-hot`:`pal-1`),style:{"--pw-util":.5},children:E(H,{mood:e,isHero:!1,ticket:`1`})}),E(A,{type:`supporting`,children:b.mood(e)})]},e)),D(y,{gap:`xxs`,align:`center`,children:[E(`span`,{className:`pw-item is-legend is-hero mood-working pal-0`,style:{"--pw-util":.5},children:E(H,{mood:`working`,isHero:!0})}),E(A,{type:`supporting`,children:b.hero})]})]}),t[44]=d,t[45]=b,t[46]=K):K=t[46];let q;return t[47]!==K||t[48]!==z||t[49]!==B||t[50]!==W||t[51]!==G?(q=D(`div`,{...z,className:B,children:[W,G,K]}),t[47]=K,t[48]=z,t[49]=B,t[50]=W,t[51]=G,t[52]=q):q=t[52],q}})))()}var K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{v(),x(),b(),m(),G(),s(),K={title:`Lab/BAISessionPinwheelMeadow`,component:W,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAISessionPinwheelMeadow** is a proof-of-concept, hand-painted rendering of
a session list. Each agent is a hillside under a drifting summer sky; each
session is a paper pinwheel planted on it.

- **Working** — spins as fast as its utilization (3.4s per turn → 0.3s), with
  a blur disc behind the blades that widens with speed.
- **Overheated** — warm paper, whirling, throwing embers.
- **Idle** — stands still, faded, a dragonfly resting on the top blade.
- **Waiting** — a sheet not yet cut open, bobbing with a queue ticket.
- **Terminating** — the blades come loose and blow away.
- **Yours** — a red ribbon tied under the hub.

The breeze lines in each sky run faster and brighter the busier that hillside
is. Finders work as in \`BAISessionCrowdScene\`: a sunbeam falls on what they
find. Light mode is a summer afternoon, dark mode is dusk. Under
\`prefers-reduced-motion\` the meadow holds still; the blur disc still shows
each pinwheel's speed.
        `}}},argTypes:{figures:{control:!1},zones:{control:!1},finders:{control:!1},onFigureClick:{action:`figure clicked`}}},q={name:`Forty sessions, four agents`,args:{zones:p,figures:u.map(n),finders:h,"aria-label":`Pinwheel meadow of 40 sessions`}},J={name:`Finder preselected (my sessions)`,args:{...q.args,activeFinderKey:`mine`}},Y={name:`Utilization → spin speed`,args:{zones:[{key:`z`,label:`speed ramp`}],hideLegend:!0,figures:[0,.1,.25,.4,.55,.7,.85,1].map((e,t)=>({key:`s${t}`,name:`${Math.round(e*100)}%`,zoneKey:`z`,mood:`working`,utilization:e}))}},X={name:`Every mood side by side`,args:{zones:[{key:`z`,label:`moods`}],hideLegend:!0,figures:[[`working`,.2],[`working`,.6],[`working`,1],[`overheated`,.97],[`idle`,.02],[`waiting`,void 0],[`leaving`,void 0]].map(([e,t],n)=>({key:`m${n}`,name:`${e}${t===void 0?``:` ${Math.round(t*100)}%`}`,zoneKey:`z`,mood:e,utilization:t,isHero:n===1}))}},Z={name:`Same data: meadow ↔ crowd`,render:()=>{let[e,t]=w(`meadow`),[r,i]=w(null),[a,o]=w(null),s={zones:p,figures:u.map(n),finders:h,activeFinderKey:r,onActiveFinderChange:i,onFigureClick:o};return D(y,{direction:`column`,align:`stretch`,gap:`sm`,children:[D(y,{gap:`sm`,align:`center`,children:[D(C,{"aria-label":`View`,value:e,onChange:t,children:[E(S,{value:`meadow`,label:`Pinwheel meadow`}),E(S,{value:`crowd`,label:`Crowd`})]}),D(A,{type:`supporting`,children:[`last clicked: `,a?`${a.name} (${a.owner})`:`—`]})]}),E(e===`meadow`?W:d,{...s})]})}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Forty sessions, four agents',
  args: {
    zones: ZONES,
    figures: SESSIONS.map(toFigure),
    finders: FINDERS,
    'aria-label': 'Pinwheel meadow of 40 sessions'
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Finder preselected (my sessions)',
  args: {
    ...FortySessions.args,
    activeFinderKey: 'mine'
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'Utilization → spin speed',
  args: {
    zones: [{
      key: 'z',
      label: 'speed ramp'
    }],
    hideLegend: true,
    figures: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((util, i) => ({
      key: \`s\${i}\`,
      name: \`\${Math.round(util * 100)}%\`,
      zoneKey: 'z',
      mood: 'working' as const,
      utilization: util
    }))
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'Every mood side by side',
  args: {
    zones: [{
      key: 'z',
      label: 'moods'
    }],
    hideLegend: true,
    figures: ([['working', 0.2], ['working', 0.6], ['working', 1], ['overheated', 0.97], ['idle', 0.02], ['waiting', undefined], ['leaving', undefined]] as Array<[BAICrowdFigureMood, number | undefined]>).map(([mood, util], i) => ({
      key: \`m\${i}\`,
      name: \`\${mood}\${util !== undefined ? \` \${Math.round(util * 100)}%\` : ''}\`,
      zoneKey: 'z',
      mood,
      utilization: util,
      isHero: i === 1
    }))
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'Same data: meadow ↔ crowd',
  render: () => {
    const [view, setView] = useState('meadow');
    const [finder, setFinder] = useState<string | null>(null);
    const [picked, setPicked] = useState<BAICrowdFigure | null>(null);
    const shared = {
      zones: ZONES,
      figures: SESSIONS.map(toFigure),
      finders: FINDERS,
      activeFinderKey: finder,
      onActiveFinderChange: setFinder,
      onFigureClick: setPicked
    };
    return <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex gap="sm" align="center">
          <BAISegmentedControl aria-label="View" value={view} onChange={setView}>
            <BAISegmentedControlItem value="meadow" label="Pinwheel meadow" />
            <BAISegmentedControlItem value="crowd" label="Crowd" />
          </BAISegmentedControl>
          <Text type="supporting">
            last clicked: {picked ? \`\${picked.name} (\${picked.owner})\` : '—'}
          </Text>
        </BAIFlex>
        {view === 'meadow' ? <BAISessionPinwheelMeadow {...shared} /> : <BAISessionCrowdScene {...shared} />}
      </BAIFlex>;
  }
}`,...Z.parameters?.docs?.source}}},Q=[`FortySessions`,`SpotlightMine`,`SpeedRamp`,`EveryMood`,`CompareWithCrowd`]})))()}$();export{Z as CompareWithCrowd,X as EveryMood,q as FortySessions,Y as SpeedRamp,J as SpotlightMine,Q as __namedExportsOrder,K as default};