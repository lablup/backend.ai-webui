p = 'react/src/components/LoginView.tsx'
s = open(p).read()


def rep(old, new):
    global s
    assert old in s, old[:120]
    s = s.replace(old, new, 1)


rep("""import {
  App as AntdApp,
  Button,
  ConfigProvider,
  Form,
  type MenuProps,
  Tag,
} from 'antd';""", """import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import type { DropdownMenuOption } from '@astryxdesign/core/DropdownMenu';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
// SHIM (MAPPING §2): the antd Form ENGINE stays until ticket 34. Everything
// else antd used to supply here is gone:
//   - `App as AntdApp` — the ticket-11 survivor, kept because SignupModal
//     still read antd's App context. SignupModal is Astryx now (its
//     `App.useApp()` is the app-shim), so the nested provider goes.
//   - `ConfigProvider` — it existed ONLY to raise antd Message's
//     `zIndexPopup` above the block panel. This screen's `App.useApp()` is
//     served by the Astryx app-shim (see the header comment), so no antd
//     Message is rendered here at all and the override was already dead.
import { Form } from 'antd';""")

rep("""  const endpointMenuItems: MenuProps['items'] = [
    { key: 'header', label: t('login.EndpointHistory'), disabled: true },
    ...(devApiEndpointOverride
      ? [
          {
            key: devApiEndpointOverride,
            label: (
              <BAIFlex
                justify="between"
                align="center"
                gap="sm"
                style={{ minWidth: 300 }}
              >
                <span>{devApiEndpointOverride}</span>
                <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                  env
                </Tag>
              </BAIFlex>
            ),
          },
        ]
      : []),
    ...(savedEndpoints.length === 0
      ? devApiEndpointOverride
        ? []
        : [{ key: 'empty', label: t('login.NoEndpointSaved') }]
      : savedEndpoints.map((ep) => ({
          key: ep,
          label: (
            <BAIFlex justify="between" align="center" style={{ minWidth: 300 }}>
              <span>{ep}</span>
              <Button
                type="text"
                size="small"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  deleteEndpoint(ep);
                }}
              >
                {t('button.Delete')}
              </Button>
            </BAIFlex>
          ),
        }))),
  ];

  const handleEndpointMenuClick: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      if (key !== 'header' && key !== 'empty') {
        setApiEndpoint(key);
        form.setFieldValue('api_endpoint', key);
      }
    },
    [form],
  );""", """  const selectEndpoint = useCallback(
    (ep: string) => {
      setApiEndpoint(ep);
      form.setFieldValue('api_endpoint', ep);
    },
    [form],
  );

  // PILOT-DECISION: antd `Dropdown` items carried a rendered `label` node and
  // a single group-level `onClick({key})`; Astryx `DropdownMenuOption` has a
  // required STRING `label` and a per-item `onClick` (MAPPING §3.7), so the
  // handler is bound HERE instead of in LoginFormPanel. Consequences:
  //   - the "Endpoint history" header row becomes a native
  //     `{type: 'section', title}` (better than antd's disabled fake row);
  //   - the per-row trailing controls (the blue `env` Tag and the red
  //     `Delete` button) have no destination — `DropdownMenuItemData` has no
  //     trailing slot — so the env marker folds into the label text and the
  //     delete action becomes its own menu row per endpoint.
  const endpointMenuItems: DropdownMenuOption[] = [
    {
      type: 'section',
      title: t('login.EndpointHistory'),
      items: [
        ...(devApiEndpointOverride
          ? [
              {
                label: `${devApiEndpointOverride} (env)`,
                onClick: () => selectEndpoint(devApiEndpointOverride),
              },
            ]
          : []),
        ...(savedEndpoints.length === 0
          ? devApiEndpointOverride
            ? []
            : [{ label: t('login.NoEndpointSaved'), isDisabled: true }]
          : savedEndpoints.flatMap((ep) => [
              {
                label: ep,
                onClick: () => selectEndpoint(ep),
              },
              {
                label: `${t('button.Delete')}: ${ep}`,
                icon: <Trash2Icon size="1em" />,
                onClick: () => deleteEndpoint(ep),
              },
            ])),
      ],
    },
  ];""")

rep("""    // antd's plain ConfigProvider is used here (not BAIConfigProvider) so we
    // don't re-introduce BUI's <I18nextProvider i18n={buiI18n}> shadow inside
    // the host tree. Purpose is purely to override Message z-index for error
    // notifications so they appear above the block panel (z-index 10000)
    // instead of behind it.
    <ConfigProvider
      theme={{
        components: {
          Message: { zIndexPopup: 10001 },
        },
      }}
    >
      <AntdApp>
        {/* The login screen background (Diagonal Weave + version/copyright
            metadata) is the persisted splash element from index.html, switched
            to backdrop mode via __enterLoginBackdrop(). It sits at z-index
            10000, below the login panel wrapper (10001). */}
        <div""", """    <>
      {/* The login screen background (Diagonal Weave + version/copyright
          metadata) is the persisted splash element from index.html, switched
          to backdrop mode via __enterLoginBackdrop(). It sits at z-index
          10000, below the login panel wrapper (10001). */}
      <div""")

rep("""            footer={
              <Button
                block
                onClick={() => {
                  setIsBlockPanelOpen(false);
                  open();
                }}
              >
                {t('login.CancelLogin')}
              </Button>
            }""", """            footer={
              <Button
                width="100%"
                onClick={() => {
                  setIsBlockPanelOpen(false);
                  open();
                }}
                label={t('login.CancelLogin')}
              />
            }""")

rep("""            <div style={{ textAlign: 'center', paddingTop: 15 }}>
              {blockMessage}
            </div>
          </BAIModal>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
};""", """            <div style={{ textAlign: 'center', paddingTop: 15 }}>
              {blockMessage}
            </div>
          </BAIModal>
      </div>
    </>
  );
};""")

rep("""            endpointMenuItems={endpointMenuItems}
            onEndpointMenuClick={handleEndpointMenuClick}
""", """            endpointMenuItems={endpointMenuItems}
""")

open(p, 'w').write(s)
print('ok')
