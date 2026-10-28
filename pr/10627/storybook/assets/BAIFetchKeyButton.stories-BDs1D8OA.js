import{r as a,j as e}from"./iframe-CgxcC1XG.js";import{B as h}from"./BAIFetchKeyButton-VkgHhSfi.js";import{B as o}from"./BAIFlex-Blx5CF5k.js";import{a as oe}from"./Switch-BjlRbGWO.js";import"./preload-helper-Dp1pzeXC.js";import"./index-BOB_W0zt.js";import"./isNumber-BFOLrvqY.js";import"./toString-Bvwo9EVc.js";import"./isSymbol-BfMaC-i2.js";import"./filter-DwsO3jSi.js";import"./_baseEach-CBXvU_zF.js";import"./get-DgjthSXp.js";import"./_baseGet-BrpB2-jI.js";import"./identity-DKeuBCMA.js";import"./isEmpty-D_74GYJg.js";import"./useIntervalValue-CuYwy1de.js";import"./BAIButton-B27FoZg7.js";import"./astryxLabel-DqUIezzr.js";import"./useControllableValue-BXNjJP6R.js";import"./rotate-cw-Dm9r3MC-.js";import"./useListFocus-Dxj5BM3f.js";import"./isRtlElement-B2-7SF8s.js";import"./composeEventHandlers-BolWE7qY.js";import"./DropdownMenu-kz1cf8f3.js";import"./usePopover-B7ALwq5m.js";import"./useDevWarning-Cqn1NKYv.js";import"./rtlStyles-T4i24HtE.js";import"./useMenuDrillIn-1MOpbCEh.js";import"./Item-D730y5Ky.js";import"./computeTargetAndRel-BGwjeA1c.js";import"./Divider-BtXoxNx_.js";import"./useMenuHover-e5b2LRzY.js";import"./useMenuOverflow-CI2nN4-i.js";import"./clampInlineSize-CP0OWgfb.js";import"./useFocusReturnVisibility-BUPqM0Bk.js";import"./useIsHydrating-Lw-AqhNY.js";import"./useIndicator-BhI_Uodn.js";import"./formControl-BzKG4OKP.js";import"./FormLayoutContext-2vMIC167.js";import"./compiled-D_YGP6zo.js";import"./FieldStatus-OL5QA2DO.js";const qe={title:"Button/BAIFetchKeyButton",component:h,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'\n**BAIFetchKeyButton** extends [Ant Design Button](https://ant.design/components/button) with fetch key management.\n\nA refresh button that manages fetch keys for data refetching with auto-update capabilities.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `string` | - | Current fetch key value |\n| `loading` | `boolean` | `false` | Loading state of the data fetch |\n| `lastLoadTime` | `Date` | `undefined` | Timestamp of the last successful load |\n| `showLastLoadTime` | `boolean` | `false` | Shows "Last updated: X ago" in tooltip |\n| `autoUpdateDelay` | `number \\| null` | `null` | Auto-refresh interval in ms (controllable); `null` = Off |\n| `onChange` | `(fetchKey: string) => void` | - | Callback fired when fetch key updates |\n| `hidden` | `boolean` | `false` | Hides the button completely |\n| `pauseWhenHidden` | `boolean` | `true` | Pauses auto-update when button is hidden |\n| `onChangeAutoUpdateDelay` | `(delayMs: number \\| null) => void` | - | Fired when the user picks an interval; **providing it shows the dropdown** |\n| `autoUpdateDelayOptions` | `number[]` | `[5000, 10000, 15000, 30000, 60000]` | Interval presets (ms); "Off" is auto-prepended |\n| `showCountdownBorder` | `boolean` | `true` | Show the animated countdown border while auto-refresh is on |\n\nFor all other props, refer to [Ant Design Button](https://ant.design/components/button).\n        '}}},argTypes:{value:{control:{type:"text"},description:"Current fetch key value",table:{type:{summary:"string"}}},loading:{control:{type:"boolean"},description:"Loading state of the data fetch",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},lastLoadTime:{control:{type:"date"},description:"Timestamp of the last successful load",table:{type:{summary:"Date"},defaultValue:{summary:"undefined"}}},showLastLoadTime:{control:{type:"boolean"},description:'When true, shows "Last updated: X ago" in tooltip',table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},autoUpdateDelay:{control:{type:"number"},description:"Auto-refresh interval in ms (controllable); null disables (Off)",table:{type:{summary:"number | null"},defaultValue:{summary:"null"}}},onChange:{action:"onChange",description:"Callback fired when fetch key should be updated",table:{type:{summary:"(fetchKey: string) => void"}}},hidden:{control:{type:"boolean"},description:"When true, hides the button completely",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},pauseWhenHidden:{control:{type:"boolean"},description:"When true, pauses auto-update when button is hidden",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}},onChangeAutoUpdateDelay:{action:"onChangeAutoUpdateDelay",description:'Fired when the user selects an interval or "Off"; providing it shows the dropdown',table:{type:{summary:"(delayMs: number | null) => void"}}},autoUpdateDelayOptions:{control:{type:"object"},description:'Interval presets in ms; "Off" is auto-prepended by the component',table:{type:{summary:"number[]"},defaultValue:{summary:"[5000, 10000, 15000, 30000, 60000]"}}},showCountdownBorder:{control:{type:"boolean"},description:"Show the animated countdown border that fills the control while auto-refresh is on",table:{type:{summary:"boolean"},defaultValue:{summary:"true"}}}}},g={name:"Basic Usage",args:{value:new Date().toISOString(),loading:!1,onChange:n=>console.log("Fetch key updated:",n)}},m={parameters:{docs:{description:{story:"Shows the last update time in a tooltip that updates every 5 seconds."}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),t=l=>{s(!0),i(l),setTimeout(()=>{s(!1)},1e3)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:200},children:"Without last load time:"}),e.jsx(h,{value:n,loading:r,onChange:t,showLastLoadTime:!1})]}),e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:200},children:"With last load time:"}),e.jsx(h,{value:n,loading:r,onChange:t,showLastLoadTime:!0})]})]})}},y={parameters:{docs:{description:{story:"Automatically refreshes data at specified intervals. The button shows a counter that increments with each auto-refresh."}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),[t,l]=a.useState(0),d=c=>{s(!0),i(c),l(u=>u+1),setTimeout(()=>{s(!1)},800)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:200},children:"Auto-update (5s):"}),e.jsx(h,{value:n,loading:r,onChange:d,autoUpdateDelay:5e3,showLastLoadTime:!0}),e.jsxs("span",{children:["Refresh count: ",t]})]}),e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:200},children:"Manual only:"}),e.jsx(h,{value:n,loading:r,onChange:d,showLastLoadTime:!0})]})]})}},f={parameters:{docs:{description:{story:'Providing `onChangeAutoUpdateDelay` opts the button into the interval dropdown: a chevron trigger next to the refresh button lets the user pick an auto-refresh interval or turn it off. Auto-refresh is off by default; once an interval is selected it shows as a label (e.g. "15s") on the dropdown trigger button.'}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),[t,l]=a.useState(null),[d,c]=a.useState(0),u=p=>{s(!0),i(p),c(ne=>ne+1),setTimeout(()=>{s(!1)},800)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:200},children:"Configurable interval:"}),e.jsx(h,{value:n,loading:r,onChange:u,autoUpdateDelay:t,onChangeAutoUpdateDelay:l,showLastLoadTime:!0}),e.jsxs("span",{children:["Refresh count: ",d]})]}),e.jsxs("div",{style:{fontSize:"12px",color:"#666"},children:["Selected interval: ",t===null?"Off":`${t/1e3}s`]})]})}},w={parameters:{docs:{description:{story:"While auto-refresh is on, an animated border fills the control clockwise once per interval (top-left → top-right → bottom-right → bottom-left → back), resetting each cycle. Toggle `showCountdownBorder` to turn the animation on/off — auto-refresh keeps working either way."}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),[t,l]=a.useState(5e3),[d,c]=a.useState(!0),u=p=>{s(!0),i(p),setTimeout(()=>{s(!1)},800)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx(oe,{"aria-label":"Show countdown border",value:d,onChange:c}),e.jsxs("span",{children:[e.jsx("code",{children:"showCountdownBorder"}),": ",String(d)]})]}),e.jsx(h,{value:n,loading:r,onChange:u,autoUpdateDelay:t,onChangeAutoUpdateDelay:l,showCountdownBorder:d}),e.jsxs("div",{style:{fontSize:"12px",color:"#666"},children:["Selected interval: ",t===null?"Off":`${t/1e3}s`]})]})}},S={parameters:{docs:{description:{story:"Reproduces FR-3354: with a short auto-refresh interval (3s) but a `loading` refresh that stays in flight LONGER than the interval (~6s), the countdown border does not complete or loop while loading. Instead it freezes (`animation-play-state: paused`) at its current position for the whole request, then re-anchors and restarts from empty the instant `loading` returns to false — so the exposed countdown stays in sync with the real (end-anchored) refresh. Click the button (or wait for an auto-refresh) to trigger the long load and watch the border pause."}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),[t]=a.useState(3e3),[l,d]=a.useState(0),c=u=>{s(!0),i(u),d(p=>p+1),setTimeout(()=>{s(!1)},6e3)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:220},children:"3s interval, 6s load:"}),e.jsx(h,{value:n,loading:r,onChange:c,autoUpdateDelay:t,showLastLoadTime:!0}),e.jsxs("span",{children:["Refresh count: ",l]})]}),e.jsx("div",{style:{fontSize:"12px",color:"#666"},children:r?"Loading… border is HIDDEN until the load finishes.":"Idle — border fills over 3s, then restarts fresh after each load."})]})}},x={parameters:{docs:{description:{story:'Consumers own the option list via `autoUpdateDelayOptions`. Here a longer-period set is passed (`[30s, 1m, 5m, 10m, 30m]`); the dropdown shows exactly those presets and the labels are formatted with the largest whole unit ("30s", "1m", "5m", "1h") via `dayjs.duration`, localized through the existing i18n keys.'}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),[t,l]=a.useState(null),d=c=>{s(!0),i(c),setTimeout(()=>{s(!1)},800)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:200},children:"Long-period options:"}),e.jsx(h,{value:n,loading:r,onChange:d,autoUpdateDelay:t,onChangeAutoUpdateDelay:l,autoUpdateDelayOptions:[3e4,6e4,3e5,6e5,18e5],showLastLoadTime:!0})]}),e.jsxs("div",{style:{fontSize:"12px",color:"#666"},children:["Selected interval (ms): ",t===null?"Off":t]})]})}},v={parameters:{docs:{description:{story:"When the active `autoUpdateDelay` is not one of `autoUpdateDelayOptions` (e.g. a legacy 7s poller against the default `[5, 10, 15, 30, 60]s` presets), the component merges that value into the menu — sorted, deduped, and checked — so exactly one item is always selected and the running interval is never hidden. The merged value is sticky: once seen it stays in the list for the session, so after switching to another interval you can still pick 7s again. The consumer's option list is not mutated."}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),[t,l]=a.useState(7e3),d=c=>{s(!0),i(c),setTimeout(()=>{s(!1)},800)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:200},children:"Off-list active value (7s):"}),e.jsx(h,{value:n,loading:r,onChange:d,autoUpdateDelay:t,onChangeAutoUpdateDelay:l,showLastLoadTime:!0})]}),e.jsxs("div",{style:{fontSize:"12px",color:"#666"},children:["Selected interval (ms): ",t===null?"Off":t," — open the menu: 7s appears merged between 5s and 10s, checked. Pick another interval, reopen — 7s stays in the list (sticky)."]})]})}},b={parameters:{docs:{description:{story:"Demonstrates the loading state with a minimum display time to avoid flickering."}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),t=l=>{s(!0),i(l),setTimeout(()=>{s(!1)},100)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:200},children:"Click to see loading:"}),e.jsx(h,{value:n,loading:r,onChange:t,showLastLoadTime:!0})]}),e.jsx("div",{style:{fontSize:"12px",color:"#666"},children:"Loading state persists for at least 700ms to prevent flickering"})]})}},C={parameters:{docs:{description:{story:"Shows how the button can be conditionally hidden while pausing auto-updates."}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),[t,l]=a.useState(!1),d=c=>{s(!0),i(c),setTimeout(()=>{s(!1)},800)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsx(o,{gap:"sm",align:"center",children:e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",checked:t,onChange:c=>l(c.target.checked)})," Hide button"]})}),e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:200},children:"Button visibility:"}),e.jsx(h,{value:n,loading:r,onChange:d,hidden:t,autoUpdateDelay:3e3,showLastLoadTime:!0})]})]})}},L={parameters:{docs:{description:{story:"Available button sizes using the Ant Design size prop."}}},render:()=>{const[n,i]=a.useState(new Date().toISOString()),[r,s]=a.useState(!1),t=l=>{s(!0),i(l),setTimeout(()=>{s(!1)},800)};return e.jsxs(o,{direction:"column",gap:"md",align:"start",children:[e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:100},children:"Large:"}),e.jsx(h,{value:n,loading:r,onChange:t,size:"large",showLastLoadTime:!0})]}),e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:100},children:"Middle:"}),e.jsx(h,{value:n,loading:r,onChange:t,size:"middle",showLastLoadTime:!0})]}),e.jsxs(o,{gap:"sm",align:"center",children:[e.jsx("span",{style:{width:100},children:"Small:"}),e.jsx(h,{value:n,loading:r,onChange:t,size:"small",showLastLoadTime:!0})]})]})}};var B,I,A;g.parameters={...g.parameters,docs:{...(B=g.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: 'Basic Usage',
  args: {
    value: new Date().toISOString(),
    loading: false,
    onChange: fetchKey => console.log('Fetch key updated:', fetchKey)
  }
}`,...(A=(I=g.parameters)==null?void 0:I.docs)==null?void 0:A.source}}};var F,K,D;m.parameters={...m.parameters,docs:{...(F=m.parameters)==null?void 0:F.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows the last update time in a tooltip that updates every 5 seconds.'
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 200
        }}>Without last load time:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} showLastLoadTime={false} />
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 200
        }}>With last load time:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} showLastLoadTime={true} />
        </BAIFlex>
      </BAIFlex>;
  }
}`,...(D=(K=m.parameters)==null?void 0:K.docs)==null?void 0:D.source}}};var j,T,O;y.parameters={...y.parameters,docs:{...(j=y.parameters)==null?void 0:j.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Automatically refreshes data at specified intervals. The button shows a counter that increments with each auto-refresh.'
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const [counter, setCounter] = useState(0);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setCounter(prev => prev + 1);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 200
        }}>Auto-update (5s):</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} autoUpdateDelay={5000} showLastLoadTime={true} />
          <span>Refresh count: {counter}</span>
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 200
        }}>Manual only:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} showLastLoadTime={true} />
        </BAIFlex>
      </BAIFlex>;
  }
}`,...(O=(T=y.parameters)==null?void 0:T.docs)==null?void 0:O.source}}};var k,U,z;f.parameters={...f.parameters,docs:{...(k=f.parameters)==null?void 0:k.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Providing \`onChangeAutoUpdateDelay\` opts the button into the interval dropdown: a chevron trigger next to the refresh button lets the user pick an auto-refresh interval or turn it off. Auto-refresh is off by default; once an interval is selected it shows as a label (e.g. "15s") on the dropdown trigger button.'
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const [delay, setDelay] = useState<number | null>(null);
    const [counter, setCounter] = useState(0);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setCounter(prev => prev + 1);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 200
        }}>Configurable interval:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} autoUpdateDelay={delay} onChangeAutoUpdateDelay={setDelay} showLastLoadTime={true} />
          <span>Refresh count: {counter}</span>
        </BAIFlex>
        <div style={{
        fontSize: '12px',
        color: '#666'
      }}>
          Selected interval: {delay === null ? 'Off' : \`\${delay / 1000}s\`}
        </div>
      </BAIFlex>;
  }
}`,...(z=(U=f.parameters)==null?void 0:U.docs)==null?void 0:z.source}}};var H,W,P;w.parameters={...w.parameters,docs:{...(H=w.parameters)==null?void 0:H.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'While auto-refresh is on, an animated border fills the control clockwise once per interval (top-left → top-right → bottom-right → bottom-left → back), resetting each cycle. Toggle \`showCountdownBorder\` to turn the animation on/off — auto-refresh keeps working either way.'
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const [delay, setDelay] = useState<number | null>(5000);
    const [showBorder, setShowBorder] = useState(true);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          {/* Astryx Switch requires a \`label\`; the adjacent <span> already
              carries the visible description, so the label is kept but
              visually hidden rather than duplicated. */}
          <BAISwitch aria-label="Show countdown border" value={showBorder} onChange={setShowBorder} />
          <span>
            <code>showCountdownBorder</code>: {String(showBorder)}
          </span>
        </BAIFlex>
        <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} autoUpdateDelay={delay} onChangeAutoUpdateDelay={setDelay} showCountdownBorder={showBorder} />
        <div style={{
        fontSize: '12px',
        color: '#666'
      }}>
          Selected interval: {delay === null ? 'Off' : \`\${delay / 1000}s\`}
        </div>
      </BAIFlex>;
  }
}`,...(P=(W=w.parameters)==null?void 0:W.docs)==null?void 0:P.source}}};var R,_,V;S.parameters={...S.parameters,docs:{...(R=S.parameters)==null?void 0:R.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Reproduces FR-3354: with a short auto-refresh interval (3s) but a \`loading\` refresh that stays in flight LONGER than the interval (~6s), the countdown border does not complete or loop while loading. Instead it freezes (\`animation-play-state: paused\`) at its current position for the whole request, then re-anchors and restarts from empty the instant \`loading\` returns to false — so the exposed countdown stays in sync with the real (end-anchored) refresh. Click the button (or wait for an auto-refresh) to trigger the long load and watch the border pause.'
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    // Short interval (3s) but a long in-flight load (6s) — the load outlasts a
    // full countdown cycle, so without the fix the border would complete/loop
    // while the real refresh is still pending.
    const [delay] = useState<number | null>(3000);
    const [counter, setCounter] = useState(0);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setCounter(prev => prev + 1);
      // Simulate a slow API call that outlasts the 3s interval.
      setTimeout(() => {
        setLoading(false);
      }, 6000);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 220
        }}>3s interval, 6s load:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} autoUpdateDelay={delay} showLastLoadTime={true} />
          <span>Refresh count: {counter}</span>
        </BAIFlex>
        <div style={{
        fontSize: '12px',
        color: '#666'
      }}>
          {loading ? 'Loading… border is HIDDEN until the load finishes.' : 'Idle — border fills over 3s, then restarts fresh after each load.'}
        </div>
      </BAIFlex>;
  }
}`,...(V=(_=S.parameters)==null?void 0:_.docs)==null?void 0:V.source}}};var E,M,N;x.parameters={...x.parameters,docs:{...(E=x.parameters)==null?void 0:E.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Consumers own the option list via \`autoUpdateDelayOptions\`. Here a longer-period set is passed (\`[30s, 1m, 5m, 10m, 30m]\`); the dropdown shows exactly those presets and the labels are formatted with the largest whole unit ("30s", "1m", "5m", "1h") via \`dayjs.duration\`, localized through the existing i18n keys.'
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const [delay, setDelay] = useState<number | null>(null);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 200
        }}>Long-period options:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} autoUpdateDelay={delay} onChangeAutoUpdateDelay={setDelay} autoUpdateDelayOptions={[30_000, 60_000, 300_000, 600_000, 1_800_000]} showLastLoadTime={true} />
        </BAIFlex>
        <div style={{
        fontSize: '12px',
        color: '#666'
      }}>
          Selected interval (ms): {delay === null ? 'Off' : delay}
        </div>
      </BAIFlex>;
  }
}`,...(N=(M=x.parameters)==null?void 0:M.docs)==null?void 0:N.source}}};var $,q,G;v.parameters={...v.parameters,docs:{...($=v.parameters)==null?void 0:$.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "When the active \`autoUpdateDelay\` is not one of \`autoUpdateDelayOptions\` (e.g. a legacy 7s poller against the default \`[5, 10, 15, 30, 60]s\` presets), the component merges that value into the menu — sorted, deduped, and checked — so exactly one item is always selected and the running interval is never hidden. The merged value is sticky: once seen it stays in the list for the session, so after switching to another interval you can still pick 7s again. The consumer's option list is not mutated."
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    // Off-list starting value: 7s is not one of the default presets.
    const [delay, setDelay] = useState<number | null>(7_000);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 200
        }}>Off-list active value (7s):</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} autoUpdateDelay={delay} onChangeAutoUpdateDelay={setDelay} showLastLoadTime={true} />
        </BAIFlex>
        <div style={{
        fontSize: '12px',
        color: '#666'
      }}>
          Selected interval (ms): {delay === null ? 'Off' : delay} — open the
          menu: 7s appears merged between 5s and 10s, checked. Pick another
          interval, reopen — 7s stays in the list (sticky).
        </div>
      </BAIFlex>;
  }
}`,...(G=(q=v.parameters)==null?void 0:q.docs)==null?void 0:G.source}}};var X,J,Q;b.parameters={...b.parameters,docs:{...(X=b.parameters)==null?void 0:X.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the loading state with a minimum display time to avoid flickering.'
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      // Simulate fast API call (loading will still show for at least 700ms)
      setTimeout(() => {
        setLoading(false);
      }, 100);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 200
        }}>Click to see loading:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} showLastLoadTime={true} />
        </BAIFlex>
        <div style={{
        fontSize: '12px',
        color: '#666'
      }}>
          Loading state persists for at least 700ms to prevent flickering
        </div>
      </BAIFlex>;
  }
}`,...(Q=(J=b.parameters)==null?void 0:J.docs)==null?void 0:Q.source}}};var Y,Z,ee;C.parameters={...C.parameters,docs:{...(Y=C.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Shows how the button can be conditionally hidden while pausing auto-updates.'
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <label>
            <input type="checkbox" checked={isHidden} onChange={e => setIsHidden(e.target.checked)} />
            {' Hide button'}
          </label>
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 200
        }}>Button visibility:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} hidden={isHidden} autoUpdateDelay={3000} showLastLoadTime={true} />
        </BAIFlex>
      </BAIFlex>;
  }
}`,...(ee=(Z=C.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var te,ae,se;L.parameters={...L.parameters,docs:{...(te=L.parameters)==null?void 0:te.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Available button sizes using the Ant Design size prop.'
      }
    }
  },
  render: () => {
    const [fetchKey, setFetchKey] = useState(new Date().toISOString());
    const [loading, setLoading] = useState(false);
    const handleChange = (newKey: string) => {
      setLoading(true);
      setFetchKey(newKey);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    return <BAIFlex direction="column" gap="md" align="start">
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 100
        }}>Large:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} size="large" showLastLoadTime={true} />
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 100
        }}>Middle:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} size="middle" showLastLoadTime={true} />
        </BAIFlex>
        <BAIFlex gap="sm" align="center">
          <span style={{
          width: 100
        }}>Small:</span>
          <BAIFetchKeyButton value={fetchKey} loading={loading} onChange={handleChange} size="small" showLastLoadTime={true} />
        </BAIFlex>
      </BAIFlex>;
  }
}`,...(se=(ae=L.parameters)==null?void 0:ae.docs)==null?void 0:se.source}}};const Ge=["Default","WithLastLoadTime","AutoUpdate","IntervalDropdown","CountdownBorder","CountdownBorderPausesWhileLoading","CustomOptions","CustomInterval","LoadingState","HiddenState","ButtonSizes"];export{y as AutoUpdate,L as ButtonSizes,w as CountdownBorder,S as CountdownBorderPausesWhileLoading,v as CustomInterval,x as CustomOptions,g as Default,C as HiddenState,f as IntervalDropdown,b as LoadingState,m as WithLastLoadTime,Ge as __namedExportsOrder,qe as default};
