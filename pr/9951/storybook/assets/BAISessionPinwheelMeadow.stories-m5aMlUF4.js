import{a as e,n as t}from"./rolldown-runtime-sJBDdmOt.js";import{t as n}from"./react-DlPsW1c0.js";import{t as r}from"./jsx-runtime-MKhVqBIO.js";import{t as i}from"./compiler-runtime-DU4U6aph.js";import{a,c as o,d as s,f as c,h as l,i as u,l as d,m as f,n as p,o as m,p as h,r as g,s as _,t as v,u as ee}from"./SessionScene.fixtures-BUsNAglU.js";import{n as y,t as b}from"./Text-Cj3JSrHf.js";import{r as x,t as te}from"./Tooltip-Cyn8YArt.js";import{g as S}from"./iframe-DtKcc3eD.js";import{n as C,t as w}from"./BAIFlex-DnaoYTJ1.js";import{i as T,n as E,r as D,t as O}from"./BAISegmentedControlItem-DpyvqZyv.js";function k(e,t){return(0,N.jsx)(`g`,{className:`pw-blade pw-blade-${t}`,transform:`rotate(${e} 24 22)`,children:(0,N.jsxs)(`g`,{className:`pw-blade-drift`,children:[(0,N.jsx)(`path`,{className:t%2?`pw-face pw-b`:`pw-face pw-a`,d:`M24 22 L24.5 4.5 C31 5.5 37.5 9.5 40.5 15.5 C34 16 28.5 18.5 24 22 Z`}),(0,N.jsx)(`path`,{className:t%2?`pw-fold pw-b`:`pw-fold pw-a`,d:`M24 22 L24.5 4.5 C27.6 10 27.2 16.6 24 22 Z`})]})},e)}function ne(e){return e.zoneKey}function re(e){return e.mood===`working`||e.mood===`overheated`}function ie(e){return s(e.utilization)}function ae(e){return e.mood===`waiting`}function oe(e){return e.key}var A,j,M,N,P,F,se,I,ce,L;function le(){return(le=t((()=>{A=i(),C(),h(),y(),x(),j=e(S(),1),M=e(o(),1),N=r(),P=5,F=[0,90,180,270],se=e=>{let t=0;for(let n=0;n<e.length;n++)t=t*31+e.charCodeAt(n)|0;return Math.abs(t)%P},I=e=>{"use memo";let t=(0,A.c)(20),{mood:n,isHero:r,ticket:i}=e,a=n!==`waiting`,o;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(o=(0,N.jsx)(`path`,{className:`pw-tuft`,d:`M13 72 C15 67 16 64.5 18 62 C18.4 66 19 69.5 20 72 Z M20 72 C22 66 23.5 63 26.5 60.5 C25.6 65.5 25.6 69 26.5 72 Z M26 72 C28 67 30 64.5 34 63 C31.5 67 30.5 70 30.5 72 Z`}),t[0]=o):o=t[0];let s;t[1]===Symbol.for(`react.memo_cache_sentinel`)?(s=(0,N.jsx)(`rect`,{className:`pw-stick`,x:`22.8`,y:`22`,width:`2.6`,height:`48`,rx:`1.3`}),t[1]=s):s=t[1];let c;t[2]===r?c=t[3]:(c=r&&(0,N.jsxs)(`g`,{className:`pw-ribbon`,children:[(0,N.jsx)(`path`,{d:`M25.4 44 C31 43 34.5 48 42 46.2 C38.5 51.5 32 50 25.4 47 Z`}),(0,N.jsx)(`path`,{d:`M23 45.5 C18 42 15.5 47.5 19.5 48.5 C21 48.8 22.4 47.5 23 45.5 Z`}),(0,N.jsx)(`circle`,{cx:`24.1`,cy:`45.6`,r:`1.6`})]}),t[2]=r,t[3]=c);let l;t[4]!==n||t[5]!==i?(l=n===`waiting`&&(0,N.jsxs)(`g`,{className:`pw-ticket`,children:[(0,N.jsx)(`line`,{x1:`24`,y1:`44`,x2:`24`,y2:`47`}),(0,N.jsx)(`rect`,{x:`18.5`,y:`47`,width:`11`,height:`8`,rx:`1.2`}),(0,N.jsx)(`text`,{x:`24`,y:`53.2`,children:i??`#`})]}),t[4]=n,t[5]=i,t[6]=l):l=t[6];let u;t[7]===a?u=t[8]:(u=a?(0,N.jsxs)(N.Fragment,{children:[(0,N.jsx)(`circle`,{className:`pw-blur`,cx:`24`,cy:`22`,r:`17`}),(0,N.jsx)(`g`,{className:`pw-blades`,children:F.map(k)})]}):(0,N.jsxs)(`g`,{className:`pw-bud`,children:[(0,N.jsx)(`rect`,{className:`pw-face pw-a`,x:`16`,y:`14`,width:`16`,height:`16`,rx:`1`,transform:`rotate(45 24 22)`}),(0,N.jsx)(`path`,{className:`pw-cut`,d:`M24 10.7 L24 18.5 M35.3 22 L27.5 22 M24 33.3 L24 25.5 M12.7 22 L20.5 22`})]}),t[7]=a,t[8]=u);let d;t[9]===Symbol.for(`react.memo_cache_sentinel`)?(d=(0,N.jsx)(`circle`,{className:`pw-hub`,cx:`24`,cy:`22`,r:`2.6`}),t[9]=d):d=t[9];let f;t[10]===n?f=t[11]:(f=n===`idle`&&(0,N.jsxs)(`g`,{className:`pw-dragonfly`,transform:`translate(28 2) rotate(-8) scale(1.7)`,children:[(0,N.jsxs)(`g`,{className:`pw-wings`,children:[(0,N.jsx)(`ellipse`,{cx:`-0.5`,cy:`-1.6`,rx:`4`,ry:`1.2`}),(0,N.jsx)(`ellipse`,{cx:`1.4`,cy:`-1.4`,rx:`3.4`,ry:`1`})]}),(0,N.jsx)(`line`,{x1:`-6`,y1:`0`,x2:`4`,y2:`0`}),(0,N.jsx)(`circle`,{cx:`4.8`,cy:`0`,r:`1.3`})]}),t[10]=n,t[11]=f);let p;t[12]===n?p=t[13]:(p=n===`overheated`&&(0,N.jsxs)(`g`,{className:`pw-embers`,children:[(0,N.jsx)(`circle`,{cx:`20`,cy:`18`,r:`1.1`}),(0,N.jsx)(`circle`,{cx:`28`,cy:`16`,r:`0.9`}),(0,N.jsx)(`circle`,{cx:`24`,cy:`12`,r:`1`})]}),t[12]=n,t[13]=p);let m;return t[14]!==c||t[15]!==l||t[16]!==u||t[17]!==f||t[18]!==p?(m=(0,N.jsxs)(`svg`,{className:`pw-glyph`,viewBox:`0 0 48 72`,"aria-hidden":`true`,focusable:`false`,children:[o,(0,N.jsxs)(`g`,{className:`pw-sway`,children:[s,c,l,u,d,f,p]})]}),t[14]=c,t[15]=l,t[16]=u,t[17]=f,t[18]=p,t[19]=m):m=t[19],m},ce=()=>(0,N.jsxs)(`svg`,{className:`pw-clouds`,viewBox:`0 0 240 64`,preserveAspectRatio:`xMidYMid slice`,"aria-hidden":`true`,focusable:`false`,children:[(0,N.jsxs)(`g`,{className:`pw-cloud pw-cloud-1`,children:[(0,N.jsx)(`rect`,{className:`pw-cloud-shade`,x:`30`,y:`33`,width:`66`,height:`12`,rx:`6`}),(0,N.jsx)(`circle`,{cx:`44`,cy:`32`,r:`11`}),(0,N.jsx)(`circle`,{cx:`58`,cy:`24`,r:`14`}),(0,N.jsx)(`circle`,{cx:`75`,cy:`28`,r:`12`}),(0,N.jsx)(`circle`,{cx:`88`,cy:`34`,r:`8.5`}),(0,N.jsx)(`rect`,{x:`33`,y:`31`,width:`60`,height:`10`,rx:`5`})]}),(0,N.jsxs)(`g`,{className:`pw-cloud pw-cloud-2`,children:[(0,N.jsx)(`rect`,{className:`pw-cloud-shade`,x:`150`,y:`41`,width:`44`,height:`8`,rx:`4`}),(0,N.jsx)(`circle`,{cx:`160`,cy:`40`,r:`7`}),(0,N.jsx)(`circle`,{cx:`171`,cy:`34`,r:`9.5`}),(0,N.jsx)(`circle`,{cx:`184`,cy:`39`,r:`7`}),(0,N.jsx)(`rect`,{x:`153`,y:`39`,width:`40`,height:`7`,rx:`3.5`})]}),(0,N.jsxs)(`g`,{className:`pw-wind`,children:[(0,N.jsx)(`path`,{d:`M-30 18 q30 -7 60 0 t60 0 t60 0 t60 0 t60 0`}),(0,N.jsx)(`path`,{d:`M-30 46 q30 -6 60 0 t60 0 t60 0 t60 0 t60 0`})]})]}),L=e=>{"use memo";let t=(0,A.c)(53),n,r,i,a,o,u,p,m,h;t[0]===e?(n=t[1],r=t[2],i=t[3],a=t[4],o=t[5],u=t[6],p=t[7],m=t[8],h=t[9]):({figures:a,zones:h,finders:m,activeFinderKey:n,onActiveFinderChange:u,onFigureClick:p,hideLegend:o,className:r,...i}=e,t[0]=e,t[1]=n,t[2]=r,t[3]=i,t[4]=a,t[5]=o,t[6]=u,t[7]=p,t[8]=m,t[9]=h);let g;t[10]===m?g=t[11]:(g=m===void 0?[]:m,t[10]=m,t[11]=g);let _=g,v=l(),y;t[12]!==n||t[13]!==a||t[14]!==_||t[15]!==u?(y={figures:a,finders:_,activeFinderKey:n,onActiveFinderChange:u},t[12]=n,t[13]=a,t[14]=_,t[15]=u,t[16]=y):y=t[16];let{finderKey:x,setFinderKey:S,matches:C}=f(y),T,E,D,O,k;if(t[17]!==r||t[18]!==i||t[19]!==a||t[20]!==x||t[21]!==_||t[22]!==v||t[23]!==C||t[24]!==p||t[25]!==S||t[26]!==h){let e=M.default.groupBy(a,ne);D=i;let n=!!C;t[32]!==r||t[33]!==n?(O=(0,j.default)(`bai-pinwheel-meadow`,r,{"is-searching":n}),t[32]=r,t[33]=n,t[34]=O):O=t[34],t[35]!==a||t[36]!==x||t[37]!==_||t[38]!==C||t[39]!==S?(k=(0,N.jsx)(ee,{figures:a,finders:_,finderKey:x,matches:C,onChange:S}),t[35]=a,t[36]=x,t[37]=_,t[38]=C,t[39]=S,t[40]=k):k=t[40],T=`pw-zones`,E=h.map(t=>{let n=e[t.key]??[],r=C?n.filter(e=>C.has(e.key)).length:0,i=n.filter(re),a=i.length?M.default.meanBy(i,ie):0,o=n.filter(ae).map(oe);return(0,N.jsxs)(`section`,{className:(0,j.default)(`pw-zone`,{"has-found":r>0,"is-empty-of-found":C&&r===0}),style:{"--pw-wind":a},"aria-label":t.label,children:[(0,N.jsxs)(`div`,{className:`pw-sky`,children:[(0,N.jsx)(ce,{}),(0,N.jsxs)(w,{className:`pw-sign-row`,justify:`between`,align:`center`,gap:`xs`,children:[(0,N.jsx)(`span`,{className:`pw-sign`,children:(0,N.jsx)(b,{type:`label`,color:`inherit`,children:t.label})}),(0,N.jsx)(`span`,{className:`pw-sign pw-sign-count`,children:(0,N.jsx)(b,{type:`supporting`,color:`inherit`,children:C&&r>0?`${r} / ${n.length}`:n.length})})]})]}),(0,N.jsx)(`svg`,{className:`pw-hill`,viewBox:`0 0 240 16`,preserveAspectRatio:`none`,"aria-hidden":`true`,focusable:`false`,children:(0,N.jsx)(`path`,{d:`M0 16 L0 9 C40 1 80 2 120 7 C160 12 200 4 240 6 L240 16 Z`})}),(0,N.jsx)(`div`,{className:`pw-field`,children:n.map((e,t)=>{let n=(C==null?void 0:C.has(e.key))??!1,r=e.mood===`waiting`?String(o.indexOf(e.key)+1):void 0;return(0,N.jsx)(te,{content:(0,N.jsx)(d,{figure:e}),placement:`above`,children:(0,N.jsx)(`button`,{type:`button`,className:(0,j.default)(`pw-item`,`mood-${e.mood}`,`pal-${e.mood===`overheated`?`hot`:se(e.key)}`,{"is-hero":e.isHero,"is-found":n,"is-dimmed":C&&!n}),style:{"--pw-util":s(e.utilization),"--pw-phase":`${t%7*-.41}s`,"--pw-lift":`${t*37%7}px`,"--pw-scale":.9+t*53%13/100},"aria-label":`${e.name} — ${v.mood(e.mood)}`,onClick:()=>p==null?void 0:p(e),children:(0,N.jsx)(I,{mood:e.mood,isHero:!!e.isHero,ticket:r})})},e.key)})})]},t.key)}),t[17]=r,t[18]=i,t[19]=a,t[20]=x,t[21]=_,t[22]=v,t[23]=C,t[24]=p,t[25]=S,t[26]=h,t[27]=T,t[28]=E,t[29]=D,t[30]=O,t[31]=k}else T=t[27],E=t[28],D=t[29],O=t[30],k=t[31];let P;t[41]!==T||t[42]!==E?(P=(0,N.jsx)(`div`,{className:T,children:E}),t[41]=T,t[42]=E,t[43]=P):P=t[43];let F;t[44]!==o||t[45]!==v?(F=!o&&(0,N.jsxs)(w,{className:`pw-legend`,gap:`md`,wrap:`wrap`,align:`center`,children:[c.map(e=>(0,N.jsxs)(w,{gap:`xxs`,align:`center`,children:[(0,N.jsx)(`span`,{className:(0,j.default)(`pw-item is-legend`,`mood-${e}`,e===`overheated`?`pal-hot`:`pal-1`),style:{"--pw-util":.5},children:(0,N.jsx)(I,{mood:e,isHero:!1,ticket:`1`})}),(0,N.jsx)(b,{type:`supporting`,children:v.mood(e)})]},e)),(0,N.jsxs)(w,{gap:`xxs`,align:`center`,children:[(0,N.jsx)(`span`,{className:`pw-item is-legend is-hero mood-working pal-0`,style:{"--pw-util":.5},children:(0,N.jsx)(I,{mood:`working`,isHero:!0})}),(0,N.jsx)(b,{type:`supporting`,children:v.hero})]})]}),t[44]=o,t[45]=v,t[46]=F):F=t[46];let L;return t[47]!==F||t[48]!==D||t[49]!==O||t[50]!==k||t[51]!==P?(L=(0,N.jsxs)(`div`,{...D,className:O,children:[k,P,F]}),t[47]=F,t[48]=D,t[49]=O,t[50]=k,t[51]=P,t[52]=L):L=t[52],L}})))()}var R,z,ue,B,V,H,U,W,G,K,de,q,J,Y,X,Z,Q,$,fe;function pe(){return(pe=t((()=>{C(),T(),E(),_(),le(),u(),y(),R=n(),z=r(),J={title:`Lab/BAISessionPinwheelMeadow`,component:L,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
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
        `}}},argTypes:{figures:{control:!1},zones:{control:!1},finders:{control:!1},onFigureClick:{action:`figure clicked`}}},Y={name:`Forty sessions, four agents`,args:{zones:g,figures:p.map(a),finders:v,"aria-label":`Pinwheel meadow of 40 sessions`}},X={name:`Finder preselected (my sessions)`,args:{...Y.args,activeFinderKey:`mine`}},Z={name:`Utilization → spin speed`,args:{zones:[{key:`z`,label:`speed ramp`}],hideLegend:!0,figures:[0,.1,.25,.4,.55,.7,.85,1].map((e,t)=>({key:`s${t}`,name:`${Math.round(e*100)}%`,zoneKey:`z`,mood:`working`,utilization:e}))}},Q={name:`Every mood side by side`,args:{zones:[{key:`z`,label:`moods`}],hideLegend:!0,figures:[[`working`,.2],[`working`,.6],[`working`,1],[`overheated`,.97],[`idle`,.02],[`waiting`,void 0],[`leaving`,void 0]].map(([e,t],n)=>({key:`m${n}`,name:`${e}${t===void 0?``:` ${Math.round(t*100)}%`}`,zoneKey:`z`,mood:e,utilization:t,isHero:n===1}))}},$={name:`Same data: meadow ↔ crowd`,render:()=>{let[e,t]=(0,R.useState)(`meadow`),[n,r]=(0,R.useState)(null),[i,o]=(0,R.useState)(null),s={zones:g,figures:p.map(a),finders:v,activeFinderKey:n,onActiveFinderChange:r,onFigureClick:o};return(0,z.jsxs)(w,{direction:`column`,align:`stretch`,gap:`sm`,children:[(0,z.jsxs)(w,{gap:`sm`,align:`center`,children:[(0,z.jsxs)(D,{"aria-label":`View`,value:e,onChange:t,children:[(0,z.jsx)(O,{value:`meadow`,label:`Pinwheel meadow`}),(0,z.jsx)(O,{value:`crowd`,label:`Crowd`})]}),(0,z.jsxs)(b,{type:`supporting`,children:[`last clicked: `,i?`${i.name} (${i.owner})`:`—`]})]}),e===`meadow`?(0,z.jsx)(L,{...s}):(0,z.jsx)(m,{...s})]})}},Y.parameters={...Y.parameters,docs:{...(ue=Y.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  name: 'Forty sessions, four agents',
  args: {
    zones: ZONES,
    figures: SESSIONS.map(toFigure),
    finders: FINDERS,
    'aria-label': 'Pinwheel meadow of 40 sessions'
  }
}`,...(B=Y.parameters)==null||(B=B.docs)==null?void 0:B.source}}},X.parameters={...X.parameters,docs:{...(V=X.parameters)==null?void 0:V.docs,source:{originalSource:`{
  name: 'Finder preselected (my sessions)',
  args: {
    ...FortySessions.args,
    activeFinderKey: 'mine'
  }
}`,...(H=X.parameters)==null||(H=H.docs)==null?void 0:H.source}}},Z.parameters={...Z.parameters,docs:{...(U=Z.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(W=Z.parameters)==null||(W=W.docs)==null?void 0:W.source}}},Q.parameters={...Q.parameters,docs:{...(G=Q.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
}`,...(K=Q.parameters)==null||(K=K.docs)==null?void 0:K.source}}},$.parameters={...$.parameters,docs:{...(de=$.parameters)==null?void 0:de.docs,source:{originalSource:`{
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
}`,...(q=$.parameters)==null||(q=q.docs)==null?void 0:q.source}}},fe=[`FortySessions`,`SpotlightMine`,`SpeedRamp`,`EveryMood`,`CompareWithCrowd`]})))()}pe();export{$ as CompareWithCrowd,Q as EveryMood,Y as FortySessions,Z as SpeedRamp,X as SpotlightMine,fe as __namedExportsOrder,J as default};