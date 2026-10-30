import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-DlPsW1c0.js";import{t as n}from"./jsx-runtime-MKhVqBIO.js";import{n as r,t as i}from"./BAIFetchKeyButton-Cc6xgggg.js";import{n as a,t as o}from"./BAIFlex-DnaoYTJ1.js";import{n as s,t as c}from"./Switch-B4KcJPZT.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{r(),a(),s(),l=t(),u=n(),N={title:`Button/BAIFetchKeyButton`,component:i,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:'\n**BAIFetchKeyButton** extends [Ant Design Button](https://ant.design/components/button) with fetch key management.\n\nA refresh button that manages fetch keys for data refetching with auto-update capabilities.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `string` | - | Current fetch key value |\n| `loading` | `boolean` | `false` | Loading state of the data fetch |\n| `lastLoadTime` | `Date` | `undefined` | Timestamp of the last successful load |\n| `showLastLoadTime` | `boolean` | `false` | Shows "Last updated: X ago" in tooltip |\n| `autoUpdateDelay` | `number \\| null` | `null` | Auto-refresh interval in ms (controllable); `null` = Off |\n| `onChange` | `(fetchKey: string) => void` | - | Callback fired when fetch key updates |\n| `hidden` | `boolean` | `false` | Hides the button completely |\n| `pauseWhenHidden` | `boolean` | `true` | Pauses auto-update when button is hidden |\n| `onChangeAutoUpdateDelay` | `(delayMs: number \\| null) => void` | - | Fired when the user picks an interval; **providing it shows the dropdown** |\n| `autoUpdateDelayOptions` | `number[]` | `[5000, 10000, 15000, 30000, 60000]` | Interval presets (ms); "Off" is auto-prepended |\n| `showCountdownBorder` | `boolean` | `true` | Show the animated countdown border while auto-refresh is on |\n\nFor all other props, refer to [Ant Design Button](https://ant.design/components/button).\n        '}}},argTypes:{value:{control:{type:`text`},description:`Current fetch key value`,table:{type:{summary:`string`}}},loading:{control:{type:`boolean`},description:`Loading state of the data fetch`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},lastLoadTime:{control:{type:`date`},description:`Timestamp of the last successful load`,table:{type:{summary:`Date`},defaultValue:{summary:`undefined`}}},showLastLoadTime:{control:{type:`boolean`},description:`When true, shows "Last updated: X ago" in tooltip`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},autoUpdateDelay:{control:{type:`number`},description:`Auto-refresh interval in ms (controllable); null disables (Off)`,table:{type:{summary:`number | null`},defaultValue:{summary:`null`}}},onChange:{action:`onChange`,description:`Callback fired when fetch key should be updated`,table:{type:{summary:`(fetchKey: string) => void`}}},hidden:{control:{type:`boolean`},description:`When true, hides the button completely`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},pauseWhenHidden:{control:{type:`boolean`},description:`When true, pauses auto-update when button is hidden`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},onChangeAutoUpdateDelay:{action:`onChangeAutoUpdateDelay`,description:`Fired when the user selects an interval or "Off"; providing it shows the dropdown`,table:{type:{summary:`(delayMs: number | null) => void`}}},autoUpdateDelayOptions:{control:{type:`object`},description:`Interval presets in ms; "Off" is auto-prepended by the component`,table:{type:{summary:`number[]`},defaultValue:{summary:`[5000, 10000, 15000, 30000, 60000]`}}},showCountdownBorder:{control:{type:`boolean`},description:`Show the animated countdown border that fills the control while auto-refresh is on`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}}}},P={name:`Basic Usage`,args:{value:new Date().toISOString(),loading:!1,onChange:e=>console.log(`Fetch key updated:`,e)}},F={parameters:{docs:{description:{story:`Shows the last update time in a tooltip that updates every 5 seconds.`}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1),a=e=>{r(!0),t(e),setTimeout(()=>{r(!1)},1e3)};return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:200},children:`Without last load time:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:a,showLastLoadTime:!1})]}),(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:200},children:`With last load time:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:a,showLastLoadTime:!0})]})]})}},I={parameters:{docs:{description:{story:`Automatically refreshes data at specified intervals. The button shows a counter that increments with each auto-refresh.`}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1),[a,s]=(0,l.useState)(0),c=e=>{r(!0),t(e),s(e=>e+1),setTimeout(()=>{r(!1)},800)};return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:200},children:`Auto-update (5s):`}),(0,u.jsx)(i,{value:e,loading:n,onChange:c,autoUpdateDelay:5e3,showLastLoadTime:!0}),(0,u.jsxs)(`span`,{children:[`Refresh count: `,a]})]}),(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:200},children:`Manual only:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:c,showLastLoadTime:!0})]})]})}},L={parameters:{docs:{description:{story:'Providing `onChangeAutoUpdateDelay` opts the button into the interval dropdown: a chevron trigger next to the refresh button lets the user pick an auto-refresh interval or turn it off. Auto-refresh is off by default; once an interval is selected it shows as a label (e.g. "15s") on the dropdown trigger button.'}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1),[a,s]=(0,l.useState)(null),[c,d]=(0,l.useState)(0);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:200},children:`Configurable interval:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:e=>{r(!0),t(e),d(e=>e+1),setTimeout(()=>{r(!1)},800)},autoUpdateDelay:a,onChangeAutoUpdateDelay:s,showLastLoadTime:!0}),(0,u.jsxs)(`span`,{children:[`Refresh count: `,c]})]}),(0,u.jsxs)(`div`,{style:{fontSize:`12px`,color:`#666`},children:[`Selected interval: `,a===null?`Off`:`${a/1e3}s`]})]})}},R={parameters:{docs:{description:{story:"While auto-refresh is on, an animated border fills the control clockwise once per interval (top-left → top-right → bottom-right → bottom-left → back), resetting each cycle. Toggle `showCountdownBorder` to turn the animation on/off — auto-refresh keeps working either way."}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1),[a,s]=(0,l.useState)(5e3),[d,f]=(0,l.useState)(!0);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(c,{"aria-label":`Show countdown border`,value:d,onChange:f}),(0,u.jsxs)(`span`,{children:[(0,u.jsx)(`code`,{children:`showCountdownBorder`}),`: `,String(d)]})]}),(0,u.jsx)(i,{value:e,loading:n,onChange:e=>{r(!0),t(e),setTimeout(()=>{r(!1)},800)},autoUpdateDelay:a,onChangeAutoUpdateDelay:s,showCountdownBorder:d}),(0,u.jsxs)(`div`,{style:{fontSize:`12px`,color:`#666`},children:[`Selected interval: `,a===null?`Off`:`${a/1e3}s`]})]})}},z={parameters:{docs:{description:{story:"Reproduces FR-3354: with a short auto-refresh interval (3s) but a `loading` refresh that stays in flight LONGER than the interval (~6s), the countdown border does not complete or loop while loading. Instead it freezes (`animation-play-state: paused`) at its current position for the whole request, then re-anchors and restarts from empty the instant `loading` returns to false — so the exposed countdown stays in sync with the real (end-anchored) refresh. Click the button (or wait for an auto-refresh) to trigger the long load and watch the border pause."}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1),[a]=(0,l.useState)(3e3),[s,c]=(0,l.useState)(0);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:220},children:`3s interval, 6s load:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:e=>{r(!0),t(e),c(e=>e+1),setTimeout(()=>{r(!1)},6e3)},autoUpdateDelay:a,showLastLoadTime:!0}),(0,u.jsxs)(`span`,{children:[`Refresh count: `,s]})]}),(0,u.jsx)(`div`,{style:{fontSize:`12px`,color:`#666`},children:n?`Loading… border is HIDDEN until the load finishes.`:`Idle — border fills over 3s, then restarts fresh after each load.`})]})}},B={parameters:{docs:{description:{story:'Consumers own the option list via `autoUpdateDelayOptions`. Here a longer-period set is passed (`[30s, 1m, 5m, 10m, 30m]`); the dropdown shows exactly those presets and the labels are formatted with the largest whole unit ("30s", "1m", "5m", "1h") via `dayjs.duration`, localized through the existing i18n keys.'}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1),[a,s]=(0,l.useState)(null);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:200},children:`Long-period options:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:e=>{r(!0),t(e),setTimeout(()=>{r(!1)},800)},autoUpdateDelay:a,onChangeAutoUpdateDelay:s,autoUpdateDelayOptions:[3e4,6e4,3e5,6e5,18e5],showLastLoadTime:!0})]}),(0,u.jsxs)(`div`,{style:{fontSize:`12px`,color:`#666`},children:[`Selected interval (ms): `,a===null?`Off`:a]})]})}},V={parameters:{docs:{description:{story:"When the active `autoUpdateDelay` is not one of `autoUpdateDelayOptions` (e.g. a legacy 7s poller against the default `[5, 10, 15, 30, 60]s` presets), the component merges that value into the menu — sorted, deduped, and checked — so exactly one item is always selected and the running interval is never hidden. The merged value is sticky: once seen it stays in the list for the session, so after switching to another interval you can still pick 7s again. The consumer's option list is not mutated."}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1),[a,s]=(0,l.useState)(7e3);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:200},children:`Off-list active value (7s):`}),(0,u.jsx)(i,{value:e,loading:n,onChange:e=>{r(!0),t(e),setTimeout(()=>{r(!1)},800)},autoUpdateDelay:a,onChangeAutoUpdateDelay:s,showLastLoadTime:!0})]}),(0,u.jsxs)(`div`,{style:{fontSize:`12px`,color:`#666`},children:[`Selected interval (ms): `,a===null?`Off`:a,` — open the menu: 7s appears merged between 5s and 10s, checked. Pick another interval, reopen — 7s stays in the list (sticky).`]})]})}},H={parameters:{docs:{description:{story:`Demonstrates the loading state with a minimum display time to avoid flickering.`}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:200},children:`Click to see loading:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:e=>{r(!0),t(e),setTimeout(()=>{r(!1)},100)},showLastLoadTime:!0})]}),(0,u.jsx)(`div`,{style:{fontSize:`12px`,color:`#666`},children:`Loading state persists for at least 700ms to prevent flickering`})]})}},U={parameters:{docs:{description:{story:`Shows how the button can be conditionally hidden while pausing auto-updates.`}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1),[a,s]=(0,l.useState)(!1);return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsx)(o,{gap:`sm`,align:`center`,children:(0,u.jsxs)(`label`,{children:[(0,u.jsx)(`input`,{type:`checkbox`,checked:a,onChange:e=>s(e.target.checked)}),` Hide button`]})}),(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:200},children:`Button visibility:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:e=>{r(!0),t(e),setTimeout(()=>{r(!1)},800)},hidden:a,autoUpdateDelay:3e3,showLastLoadTime:!0})]})]})}},W={parameters:{docs:{description:{story:`Available button sizes using the Ant Design size prop.`}}},render:()=>{let[e,t]=(0,l.useState)(new Date().toISOString()),[n,r]=(0,l.useState)(!1),a=e=>{r(!0),t(e),setTimeout(()=>{r(!1)},800)};return(0,u.jsxs)(o,{direction:`column`,gap:`md`,align:`start`,children:[(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:100},children:`Large:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:a,size:`large`,showLastLoadTime:!0})]}),(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:100},children:`Middle:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:a,size:`middle`,showLastLoadTime:!0})]}),(0,u.jsxs)(o,{gap:`sm`,align:`center`,children:[(0,u.jsx)(`span`,{style:{width:100},children:`Small:`}),(0,u.jsx)(i,{value:e,loading:n,onChange:a,size:`small`,showLastLoadTime:!0})]})]})}},P.parameters={...P.parameters,docs:{...(d=P.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'Basic Usage',
  args: {
    value: new Date().toISOString(),
    loading: false,
    onChange: fetchKey => console.log('Fetch key updated:', fetchKey)
  }
}`,...(f=P.parameters)==null||(f=f.docs)==null?void 0:f.source}}},F.parameters={...F.parameters,docs:{...(p=F.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(m=F.parameters)==null||(m=m.docs)==null?void 0:m.source}}},I.parameters={...I.parameters,docs:{...(h=I.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(g=I.parameters)==null||(g=g.docs)==null?void 0:g.source}}},L.parameters={...L.parameters,docs:{...(_=L.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(v=L.parameters)==null||(v=v.docs)==null?void 0:v.source}}},R.parameters={...R.parameters,docs:{...(y=R.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(b=R.parameters)==null||(b=b.docs)==null?void 0:b.source}}},z.parameters={...z.parameters,docs:{...(x=z.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(S=z.parameters)==null||(S=S.docs)==null?void 0:S.source}}},B.parameters={...B.parameters,docs:{...(C=B.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(w=B.parameters)==null||(w=w.docs)==null?void 0:w.source}}},V.parameters={...V.parameters,docs:{...(T=V.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(E=V.parameters)==null||(E=E.docs)==null?void 0:E.source}}},H.parameters={...H.parameters,docs:{...(D=H.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(O=H.parameters)==null||(O=O.docs)==null?void 0:O.source}}},U.parameters={...U.parameters,docs:{...(k=U.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(A=U.parameters)==null||(A=A.docs)==null?void 0:A.source}}},W.parameters={...W.parameters,docs:{...(j=W.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(M=W.parameters)==null||(M=M.docs)==null?void 0:M.source}}},G=[`Default`,`WithLastLoadTime`,`AutoUpdate`,`IntervalDropdown`,`CountdownBorder`,`CountdownBorderPausesWhileLoading`,`CustomOptions`,`CustomInterval`,`LoadingState`,`HiddenState`,`ButtonSizes`]})))()}K();export{I as AutoUpdate,W as ButtonSizes,R as CountdownBorder,z as CountdownBorderPausesWhileLoading,V as CustomInterval,B as CustomOptions,P as Default,U as HiddenState,L as IntervalDropdown,H as LoadingState,F as WithLastLoadTime,G as __namedExportsOrder,N as default};