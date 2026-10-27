import{n as e,o as t}from"./rolldown-runtime-2s6bX4vc.js";import{l as n}from"./iframe-DR2sIF5r.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAIDrawer-BA2xf6XB.js";import{useState as s}from"react";import{jsx as c,jsxs as l}from"react/jsx-runtime";import{c as u}from"react/compiler-runtime";import{Text as d}from"@lablup/ui-common/Text";import{UnitGrid as f}from"@lablup/ui-common/components/UnitGrid";var p,m;function h(){return(h=e((()=>{p=t(n(),1),m=e=>{"use memo";let t=u(8),n,r;t[0]===e?(n=t[1],r=t[2]):({className:n,...r}=e,t[0]=e,t[1]=n,t[2]=r);let i;t[3]===n?i=t[4]:(i=(0,p.default)(`bai-resource-unit-grid`,n),t[3]=n,t[4]=i);let a;return t[5]!==i||t[6]!==r?(a=c(f,{...r,className:i}),t[5]=i,t[6]=r,t[7]=a):a=t[7],a}})))()}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{a(),r(),h(),g=`#e8e8e8`,_=`#ffce2f`,v=`#e33f4a`,y=(e,t,n,r)=>({key:e,label:t,units:n.map((e,t)=>({color:e,...r!==void 0&&t===n.length-1?{fraction:r}:{}}))}),b=(e,t)=>Array.from({length:e},()=>t),x=[y(`training-1`,`training-1`,b(9,g)),y(`inference-a`,`inference-a`,b(4,_)),y(`batch-42`,`batch-42`,b(14,g)),y(`notebook`,`notebook`,b(2,v)),y(`finetune`,`finetune`,b(7,_))],S=[{color:g,label:`Low (<50%)`},{color:_,label:`Mid (50–80%)`},{color:v,label:`High (≥80%)`}],C={title:`Data Display/BAIResourceUnitGrid`,component:m,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`
**BAIResourceUnitGrid** renders groups of quantized unit squares on one shared
lattice — the generic rendering core of the session resource-grid view
(FR-3569). Each group is merged into a tinted rounded "plate", identified by a
palette hue cycled in flow order plus its initial letter on the visual
top-left cell. Hovering a group highlights it and opens an anchored, hoverable
popover whose content comes from the \`renderGroupPopover\` slot.

The component is domain- and color-agnostic: callers pass each unit's resolved
color, the legend items, and the popover content. Group hues default to a
token-backed muted 7-set (light/dark paired by index) and can be overridden
per group via the controlled \`hueOverrides\` map; providing
\`onHueOverrideChange\` enables the in-popover palette picker.
        `}}},argTypes:{groups:{control:!1},renderGroupPopover:{control:!1},emptyFallback:{control:!1},legendItems:{control:!1}}},w={args:{groups:x,legendItems:S,"aria-label":`Resource grid of 5 groups`}},T={args:{groups:x,layout:`wordwrap`,legendItems:S,"aria-label":`Resource grid of 5 groups`}},E={args:{groups:[y(`half-gpu`,`half-gpu`,b(3,_),.5),y(`tenth-gpu`,`tenth-gpu`,b(1,g),.1),y(`three-quarters`,`three-quarters`,b(5,v),.75)],"aria-label":`Resource grid with fractional units`}},D={render:()=>{let[e,t]=s({"inference-a":5});return c(m,{groups:x,hueOverrides:e,onHueOverrideChange:(e,n)=>t(t=>({...t,[e]:n})),"aria-label":`Resource grid with color overrides`})}},O={args:{groups:x,"aria-label":`Resource grid with popover details`,renderGroupPopover:(e,{hue:t})=>l(i,{direction:`column`,align:`stretch`,gap:4,children:[c(d,{size:`sm`,weight:`semibold`,children:e.label}),l(d,{size:`sm`,color:`secondary`,children:[e.units.length,` units · hue `,t]})]})}},k={args:{groups:[y(`running-1`,`running-1`,b(6,_)),{...y(`queued-1`,`queued-1`,b(4,g)),plateVariant:`dashed`},y(`running-2`,`running-2`,b(9,g)),{...y(`queued-2`,`queued-2`,b(8,g)),plateVariant:`dashed`}],"aria-label":`Resource grid with tentative (dashed) groups`},parameters:{docs:{description:{story:"`plateVariant: 'dashed'` draws the group's plate outline dashed — an appearance variant for visually tentative groups (e.g. not-yet-allocated ones)."}}}},A={render:()=>c(o,{open:!0,title:`Agent detail`,size:800,side:`end`,onClose:()=>{},children:c(m,{groups:x,legendItems:S,"aria-label":`Resource grid inside a drawer`,renderGroupPopover:e=>c(d,{size:`sm`,children:`popover: ${e.label}`})})})},j={args:{groups:[],emptyFallback:c(d,{size:`sm`,color:`secondary`,children:`No groups match the current filter.`})}},M={args:{groups:Array.from({length:40},(e,t)=>y(`g-${t}`,`group-${t}`,b(1+t*7%13,[g,_,v][t%3]))),"aria-label":`Resource grid stress example`}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    groups: DEMO_GROUPS,
    legendItems: LEGEND,
    'aria-label': 'Resource grid of 5 groups'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    groups: DEMO_GROUPS,
    layout: 'wordwrap',
    legendItems: LEGEND,
    'aria-label': 'Resource grid of 5 groups'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    groups: [group('half-gpu', 'half-gpu', fill(3, MID), 0.5), group('tenth-gpu', 'tenth-gpu', fill(1, LOW), 0.1), group('three-quarters', 'three-quarters', fill(5, HIGH), 0.75)],
    'aria-label': 'Resource grid with fractional units'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [overrides, setOverrides] = useState<Record<string, number>>({
      'inference-a': 5
    });
    return <BAIResourceUnitGrid groups={DEMO_GROUPS} hueOverrides={overrides} onHueOverrideChange={(key, paletteIdx) => setOverrides(prev => ({
      ...prev,
      [key]: paletteIdx
    }))} aria-label="Resource grid with color overrides" />;
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    groups: DEMO_GROUPS,
    'aria-label': 'Resource grid with popover details',
    renderGroupPopover: (group, {
      hue
    }) => <BAIFlex direction="column" align="stretch" gap={4}>
        <Text size="sm" weight="semibold">
          {group.label}
        </Text>
        <Text size="sm" color="secondary">
          {group.units.length} units · hue {hue}
        </Text>
      </BAIFlex>
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    groups: [group('running-1', 'running-1', fill(6, MID)), {
      ...group('queued-1', 'queued-1', fill(4, LOW)),
      plateVariant: 'dashed'
    }, group('running-2', 'running-2', fill(9, LOW)), {
      ...group('queued-2', 'queued-2', fill(8, LOW)),
      plateVariant: 'dashed'
    }],
    'aria-label': 'Resource grid with tentative (dashed) groups'
  },
  parameters: {
    docs: {
      description: {
        story: "\`plateVariant: 'dashed'\` draws the group's plate outline dashed — an appearance variant for visually tentative groups (e.g. not-yet-allocated ones)."
      }
    }
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <BAIDrawer open title="Agent detail" size={800} side="end" onClose={() => {}}>
      <BAIResourceUnitGrid groups={DEMO_GROUPS} legendItems={LEGEND} aria-label="Resource grid inside a drawer" renderGroupPopover={g => <Text size="sm">{\`popover: \${g.label}\`}</Text>} />
    </BAIDrawer>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    groups: [],
    emptyFallback: <Text size="sm" color="secondary">
        No groups match the current filter.
      </Text>
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    groups: Array.from({
      length: 40
    }, (_, i) => group(\`g-\${i}\`, \`group-\${i}\`, fill(1 + i * 7 % 13, [LOW, MID, HIGH][i % 3]))),
    'aria-label': 'Resource grid stress example'
  }
}`,...M.parameters?.docs?.source}}},N=[`Serpentine`,`WordWrap`,`FractionCells`,`HueOverridesWithPicker`,`PopoverSlot`,`DashedPlateVariant`,`InsideDrawer`,`EmptyFallback`,`ManyGroups`]})))()}P();export{k as DashedPlateVariant,j as EmptyFallback,E as FractionCells,D as HueOverridesWithPicker,A as InsideDrawer,M as ManyGroups,O as PopoverSlot,w as Serpentine,T as WordWrap,N as __namedExportsOrder,C as default};