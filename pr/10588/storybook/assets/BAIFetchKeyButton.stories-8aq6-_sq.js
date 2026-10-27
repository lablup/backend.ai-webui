import{n as e}from"./rolldown-runtime-2s6bX4vc.js";import{n as t,t as n}from"./BAIFetchKeyButton-BizHz04h.js";import{n as r,t as i}from"./BAIFlex-CAz1t6J5.js";import{n as a,t as o}from"./BAISwitch-COxYPBZt.js";import{useState as s}from"react";import{jsx as c,jsxs as l}from"react/jsx-runtime";var u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),r(),a(),u={title:`Button/BAIFetchKeyButton`,component:n,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:'\n**BAIFetchKeyButton** extends [Ant Design Button](https://ant.design/components/button) with fetch key management.\n\nA refresh button that manages fetch keys for data refetching with auto-update capabilities.\n\n## BAI-Specific Props\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `string` | - | Current fetch key value |\n| `loading` | `boolean` | `false` | Loading state of the data fetch |\n| `lastLoadTime` | `Date` | `undefined` | Timestamp of the last successful load |\n| `showLastLoadTime` | `boolean` | `false` | Shows "Last updated: X ago" in tooltip |\n| `autoUpdateDelay` | `number \\| null` | `null` | Auto-refresh interval in ms (controllable); `null` = Off |\n| `onChange` | `(fetchKey: string) => void` | - | Callback fired when fetch key updates |\n| `hidden` | `boolean` | `false` | Hides the button completely |\n| `pauseWhenHidden` | `boolean` | `true` | Pauses auto-update when button is hidden |\n| `onChangeAutoUpdateDelay` | `(delayMs: number \\| null) => void` | - | Fired when the user picks an interval; **providing it shows the dropdown** |\n| `autoUpdateDelayOptions` | `number[]` | `[5000, 10000, 15000, 30000, 60000]` | Interval presets (ms); "Off" is auto-prepended |\n| `showCountdownBorder` | `boolean` | `true` | Show the animated countdown border while auto-refresh is on |\n\nFor all other props, refer to [Ant Design Button](https://ant.design/components/button).\n        '}}},argTypes:{value:{control:{type:`text`},description:`Current fetch key value`,table:{type:{summary:`string`}}},loading:{control:{type:`boolean`},description:`Loading state of the data fetch`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},lastLoadTime:{control:{type:`date`},description:`Timestamp of the last successful load`,table:{type:{summary:`Date`},defaultValue:{summary:`undefined`}}},showLastLoadTime:{control:{type:`boolean`},description:`When true, shows "Last updated: X ago" in tooltip`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},autoUpdateDelay:{control:{type:`number`},description:`Auto-refresh interval in ms (controllable); null disables (Off)`,table:{type:{summary:`number | null`},defaultValue:{summary:`null`}}},onChange:{action:`onChange`,description:`Callback fired when fetch key should be updated`,table:{type:{summary:`(fetchKey: string) => void`}}},hidden:{control:{type:`boolean`},description:`When true, hides the button completely`,table:{type:{summary:`boolean`},defaultValue:{summary:`false`}}},pauseWhenHidden:{control:{type:`boolean`},description:`When true, pauses auto-update when button is hidden`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}},onChangeAutoUpdateDelay:{action:`onChangeAutoUpdateDelay`,description:`Fired when the user selects an interval or "Off"; providing it shows the dropdown`,table:{type:{summary:`(delayMs: number | null) => void`}}},autoUpdateDelayOptions:{control:{type:`object`},description:`Interval presets in ms; "Off" is auto-prepended by the component`,table:{type:{summary:`number[]`},defaultValue:{summary:`[5000, 10000, 15000, 30000, 60000]`}}},showCountdownBorder:{control:{type:`boolean`},description:`Show the animated countdown border that fills the control while auto-refresh is on`,table:{type:{summary:`boolean`},defaultValue:{summary:`true`}}}}},d={name:`Basic Usage`,args:{value:new Date().toISOString(),loading:!1,onChange:e=>console.log(`Fetch key updated:`,e)}},f={parameters:{docs:{description:{story:`Shows the last update time in a tooltip that updates every 5 seconds.`}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1),o=e=>{a(!0),t(e),setTimeout(()=>{a(!1)},1e3)};return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:200},children:`Without last load time:`}),c(n,{value:e,loading:r,onChange:o,showLastLoadTime:!1})]}),l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:200},children:`With last load time:`}),c(n,{value:e,loading:r,onChange:o,showLastLoadTime:!0})]})]})}},p={parameters:{docs:{description:{story:`Automatically refreshes data at specified intervals. The button shows a counter that increments with each auto-refresh.`}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1),[o,u]=s(0),d=e=>{a(!0),t(e),u(e=>e+1),setTimeout(()=>{a(!1)},800)};return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:200},children:`Auto-update (5s):`}),c(n,{value:e,loading:r,onChange:d,autoUpdateDelay:5e3,showLastLoadTime:!0}),l(`span`,{children:[`Refresh count: `,o]})]}),l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:200},children:`Manual only:`}),c(n,{value:e,loading:r,onChange:d,showLastLoadTime:!0})]})]})}},m={parameters:{docs:{description:{story:'Providing `onChangeAutoUpdateDelay` opts the button into the interval dropdown: a chevron trigger next to the refresh button lets the user pick an auto-refresh interval or turn it off. Auto-refresh is off by default; once an interval is selected it shows as a label (e.g. "15s") on the dropdown trigger button.'}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1),[o,u]=s(null),[d,f]=s(0);return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:200},children:`Configurable interval:`}),c(n,{value:e,loading:r,onChange:e=>{a(!0),t(e),f(e=>e+1),setTimeout(()=>{a(!1)},800)},autoUpdateDelay:o,onChangeAutoUpdateDelay:u,showLastLoadTime:!0}),l(`span`,{children:[`Refresh count: `,d]})]}),l(`div`,{style:{fontSize:`12px`,color:`#666`},children:[`Selected interval: `,o===null?`Off`:`${o/1e3}s`]})]})}},h={parameters:{docs:{description:{story:"While auto-refresh is on, an animated border fills the control clockwise once per interval (top-left → top-right → bottom-right → bottom-left → back), resetting each cycle. Toggle `showCountdownBorder` to turn the animation on/off — auto-refresh keeps working either way."}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1),[u,d]=s(5e3),[f,p]=s(!0);return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(i,{gap:`sm`,align:`center`,children:[c(o,{"aria-label":`Show countdown border`,value:f,onChange:p}),l(`span`,{children:[c(`code`,{children:`showCountdownBorder`}),`: `,String(f)]})]}),c(n,{value:e,loading:r,onChange:e=>{a(!0),t(e),setTimeout(()=>{a(!1)},800)},autoUpdateDelay:u,onChangeAutoUpdateDelay:d,showCountdownBorder:f}),l(`div`,{style:{fontSize:`12px`,color:`#666`},children:[`Selected interval: `,u===null?`Off`:`${u/1e3}s`]})]})}},g={parameters:{docs:{description:{story:"Reproduces FR-3354: with a short auto-refresh interval (3s) but a `loading` refresh that stays in flight LONGER than the interval (~6s), the countdown border does not complete or loop while loading. Instead it freezes (`animation-play-state: paused`) at its current position for the whole request, then re-anchors and restarts from empty the instant `loading` returns to false — so the exposed countdown stays in sync with the real (end-anchored) refresh. Click the button (or wait for an auto-refresh) to trigger the long load and watch the border pause."}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1),[o]=s(3e3),[u,d]=s(0);return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:220},children:`3s interval, 6s load:`}),c(n,{value:e,loading:r,onChange:e=>{a(!0),t(e),d(e=>e+1),setTimeout(()=>{a(!1)},6e3)},autoUpdateDelay:o,showLastLoadTime:!0}),l(`span`,{children:[`Refresh count: `,u]})]}),c(`div`,{style:{fontSize:`12px`,color:`#666`},children:r?`Loading… border is HIDDEN until the load finishes.`:`Idle — border fills over 3s, then restarts fresh after each load.`})]})}},_={parameters:{docs:{description:{story:'Consumers own the option list via `autoUpdateDelayOptions`. Here a longer-period set is passed (`[30s, 1m, 5m, 10m, 30m]`); the dropdown shows exactly those presets and the labels are formatted with the largest whole unit ("30s", "1m", "5m", "1h") via `dayjs.duration`, localized through the existing i18n keys.'}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1),[o,u]=s(null);return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:200},children:`Long-period options:`}),c(n,{value:e,loading:r,onChange:e=>{a(!0),t(e),setTimeout(()=>{a(!1)},800)},autoUpdateDelay:o,onChangeAutoUpdateDelay:u,autoUpdateDelayOptions:[3e4,6e4,3e5,6e5,18e5],showLastLoadTime:!0})]}),l(`div`,{style:{fontSize:`12px`,color:`#666`},children:[`Selected interval (ms): `,o===null?`Off`:o]})]})}},v={parameters:{docs:{description:{story:"When the active `autoUpdateDelay` is not one of `autoUpdateDelayOptions` (e.g. a legacy 7s poller against the default `[5, 10, 15, 30, 60]s` presets), the component merges that value into the menu — sorted, deduped, and checked — so exactly one item is always selected and the running interval is never hidden. The merged value is sticky: once seen it stays in the list for the session, so after switching to another interval you can still pick 7s again. The consumer's option list is not mutated."}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1),[o,u]=s(7e3);return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:200},children:`Off-list active value (7s):`}),c(n,{value:e,loading:r,onChange:e=>{a(!0),t(e),setTimeout(()=>{a(!1)},800)},autoUpdateDelay:o,onChangeAutoUpdateDelay:u,showLastLoadTime:!0})]}),l(`div`,{style:{fontSize:`12px`,color:`#666`},children:[`Selected interval (ms): `,o===null?`Off`:o,` — open the menu: 7s appears merged between 5s and 10s, checked. Pick another interval, reopen — 7s stays in the list (sticky).`]})]})}},y={parameters:{docs:{description:{story:`Demonstrates the loading state with a minimum display time to avoid flickering.`}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1);return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:200},children:`Click to see loading:`}),c(n,{value:e,loading:r,onChange:e=>{a(!0),t(e),setTimeout(()=>{a(!1)},100)},showLastLoadTime:!0})]}),c(`div`,{style:{fontSize:`12px`,color:`#666`},children:`Loading state persists for at least 700ms to prevent flickering`})]})}},b={parameters:{docs:{description:{story:`Shows how the button can be conditionally hidden while pausing auto-updates.`}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1),[o,u]=s(!1);return l(i,{direction:`column`,gap:`md`,align:`start`,children:[c(i,{gap:`sm`,align:`center`,children:l(`label`,{children:[c(`input`,{type:`checkbox`,checked:o,onChange:e=>u(e.target.checked)}),` Hide button`]})}),l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:200},children:`Button visibility:`}),c(n,{value:e,loading:r,onChange:e=>{a(!0),t(e),setTimeout(()=>{a(!1)},800)},hidden:o,autoUpdateDelay:3e3,showLastLoadTime:!0})]})]})}},x={parameters:{docs:{description:{story:`Available button sizes using the Ant Design size prop.`}}},render:()=>{let[e,t]=s(new Date().toISOString()),[r,a]=s(!1),o=e=>{a(!0),t(e),setTimeout(()=>{a(!1)},800)};return l(i,{direction:`column`,gap:`md`,align:`start`,children:[l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:100},children:`Large:`}),c(n,{value:e,loading:r,onChange:o,size:`large`,showLastLoadTime:!0})]}),l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:100},children:`Middle:`}),c(n,{value:e,loading:r,onChange:o,size:`middle`,showLastLoadTime:!0})]}),l(i,{gap:`sm`,align:`center`,children:[c(`span`,{style:{width:100},children:`Small:`}),c(n,{value:e,loading:r,onChange:o,size:`small`,showLastLoadTime:!0})]})]})}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Basic Usage',
  args: {
    value: new Date().toISOString(),
    loading: false,
    onChange: fetchKey => console.log('Fetch key updated:', fetchKey)
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithLastLoadTime`,`AutoUpdate`,`IntervalDropdown`,`CountdownBorder`,`CountdownBorderPausesWhileLoading`,`CustomOptions`,`CustomInterval`,`LoadingState`,`HiddenState`,`ButtonSizes`]})))()}C();export{p as AutoUpdate,x as ButtonSizes,h as CountdownBorder,g as CountdownBorderPausesWhileLoading,v as CustomInterval,_ as CustomOptions,d as Default,b as HiddenState,m as IntervalDropdown,y as LoadingState,f as WithLastLoadTime,S as __namedExportsOrder,u as default};