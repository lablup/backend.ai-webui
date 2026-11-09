# GraphQL devtools test plan

Pass criteria are fixed before running. A result counts only if it was executed on the final code.
Full run 2026-11-09, before the ready-gate fixes. After them, the fixed behaviour and regressions were re-checked headless and against a logged-in staging session, not all 76 rows.

Env: `chrome` = logged-in superadmin on staging, `headless` = logged-out Playwright, `shell` = local command.
`sim` = the failure is simulated by stubbing `fetch` for that one query only.

## A. No side effects on WebUI

| ID  | Test                        | Pass criterion                                                                                          | Env         | Result                                                                                                                                                                                                    |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | WebUI source                | No diff in `react/src`, `react/package.json`, `packages/backend.ai-ui`                                  | shell       | PASS 0 diff lines                                                                                                                                                                                         |
| A2  | Production output           | Hashes equal to a build without the plugin, except `sw.js.map` (differs between identical builds too)   | shell       | PASS 1,648 files; only `sw.js.map` differs, as between two builds without the plugin                                                                                                                      |
| A3  | Dev prebundle               | App deps unchanged, `graphql-language-service` is the only addition                                     | shell       | PASS 199 → 200 optimized deps, only `graphql-language-service` added                                                                                                                                      |
| A4  | Panel never opened          | Only `main.tsx` requested from the package, no schema                                                   | headless    | PASS only `main.tsx` requested before first open                                                                                                                                                          |
| A5  | Page styles                 | 0 computed-style differences after open and close                                                       | headless    | PASS 2,947 elements on the logged-in users page, 0 differences after open and close, 0 noise. The `body` keeps Monaco classes, which affected none of the compared properties                             |
| A6  | Focus                       | Closing returns focus to the prior input; keeps focus if user clicked elsewhere                         | headless    | PASS focus back in the page search, typed `X` landed there (`abcX`)                                                                                                                                       |
| A7  | Other shortcuts             | `Cmd+K` opens the search palette with the panel open                                                    | chrome      | PASS `Cmd+K` palette focused with the panel open                                                                                                                                                          |
| A8  | App Monaco editor           | Branding JSON editor works beside the panel, no panel markers on it                                     | chrome      | PASS Branding JSON editor: `json`, 4,028 chars, 0 panel markers                                                                                                                                           |
| A9  | Monaco load order           | App first and panel first both work, one `loader.js`                                                    | headless    | PASS both orders work, 1 `loader.js` (headless)                                                                                                                                                           |
| A10 | App `.graphql` model        | No panel suggestions or markers                                                                         | headless    | FAIL 0 markers and no panel-provider items, but once the Schema tab has been opened an app `graphql` editor shows 12 Monaco word-based items taken from the open schema document. 0 before opening Schema |
| A11 | Web storage                 | No `Storage.setItem` call has the panel in its stack; `backendaiwebui.logs` unchanged by panel requests | chrome      | PASS 0 `setItem` calls with the panel in the stack; `backendaiwebui.logs` unchanged through panel requests                                                                                                |
| A12 | App banner, network failure | Panel request fails, no soft-timeout event or banner after 25 s                                         | chrome, sim | PASS 0 soft-timeout events, no banner after 28 s (`sim`)                                                                                                                                                  |
| A13 | App banner, slow response   | Panel response takes 21 s, no soft-timeout event or banner                                              | chrome, sim | PASS 21 s response recorded `ok`, 0 soft-timeout events, no banner (`sim`)                                                                                                                                |
| A14 | App banner already showing  | A successful panel request does not dismiss it                                                          | chrome      | PASS banner forced via the app event; panel success fired 0 events, banner stayed 8 s                                                                                                                     |

## B. Open and close

| ID  | Test                          | Pass criterion                                                                       | Env    | Result                                                                                                     |
| --- | ----------------------------- | ------------------------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------- |
| B1  | Hotkey from a page input      | Opens, input value kept                                                              | chrome | PASS opened, value `abc` kept                                                                              |
| B2  | Hotkey from inside the editor | Closes                                                                               | chrome | PASS closed from inside the editor                                                                         |
| B3  | Close button                  | Closes                                                                               | chrome | PASS closed with the Close button                                                                          |
| B4  | Reopen                        | Query, variables and result text kept                                                | chrome | PASS query and result identical after reopen                                                               |
| B5  | Page behind                   | Uncovered page area stays clickable                                                  | chrome | PASS typed into the page search beside the panel                                                           |
| B6  | App modal open                | Documented behaviour: panel is inert until the modal closes                          | chrome | PASS app modal open: panel inert, mask on top; not inert after closing                                     |
| B7  | Drag the left edge            | Panel width follows the pointer, editors relayout without clipping                   | chrome | PASS 1024 → 1351 matching the pointer, editor followed to 1072                                             |
| B8  | Width limits                  | Stops at the minimum width and at the viewport limit; the handle stays reachable     | chrome | PASS minimum 800, maximum 2432 (95vw); double-click back to 1024                                           |
| B9  | Close and reopen              | Width kept; gone after reload; nothing written to web storage                        | chrome | PASS 1024 and no inline style after reload. Close and reopen keeping a dragged width checked headless only |
| B10 | Drag side effects             | Page text not selected, no clicks on the page during the drag, page layout unchanged | chrome | PASS 0 selected characters. Clicks under the drag checked headless only                                    |

## C. Autocomplete and markers from our schema

| ID  | Test                        | Pass criterion                                     | Env      | Result                                                                                               |
| --- | --------------------------- | -------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| C1  | Nested fields               | `query { user { ` lists `User` fields              | chrome   | PASS `allowed_client_ip`, `container_gids`, `created_at` and more                                    |
| C2  | Arguments                   | `agent_list(` lists exactly the 6 schema arguments | chrome   | PASS exactly the 6 schema arguments                                                                  |
| C3  | Federation hidden           | No `join__`/`link__` in suggestions                | chrome   | PASS 0 in the listed rows                                                                            |
| C4  | Invalid field               | Marker on the field                                | chrome   | PASS `Cannot query field "noSuchFieldXyz" on type "Query".`                                          |
| C5  | Syntax error                | Marker shown                                       | chrome   | PASS `Syntax Error: Expected "$", found ")".`                                                        |
| C6  | Valid query                 | No markers                                         | chrome   | PASS 0 markers                                                                                       |
| C7  | Accept a variable after `$` | Result has a single `$`, no syntax marker          | headless | PASS `limit: $myVar` with one `$`, real keystrokes in Chrome; Enter and Ctrl+Space variants headless |

## D. Running queries

| ID  | Test                                 | Pass criterion                                         | Env         | Result                                                                                                                                   |
| --- | ------------------------------------ | ------------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Run button                           | Response shown, POST `/func/admin/gql` 200             | chrome      | PASS `user` returned from the real server                                                                                                |
| D2  | `Cmd+Enter`                          | Runs the query                                         | chrome      | PASS `query KeyRun` returned `superadmin`                                                                                                |
| D3  | Logged-in identity                   | Response email equals the client's email, no key setup | chrome      | PASS email equals the client email, role `superadmin`                                                                                    |
| D4  | Variables                            | Variables reach the server and affect the response     | chrome      | PASS `limit: 1` gave 1 item, `limit: 0` gave 0                                                                                           |
| D5  | Large response                       | 2 MB response renders, UI stays usable                 | chrome, sim | PASS 2,097,186 chars in 318 ms (`sim`)                                                                                                   |
| D6  | Run right after fast typing or paste | Request sends exactly what the editor shows            | headless    | PASS 0 mismatches over 12 runs each for fast typing and paste, query and variables (headless; the paste case used a synthetic Cmd+Enter) |

## E. Safety

| ID  | Test                       | Pass criterion                                                                                              | Env      | Result                                                                          |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| E1  | Mutation, switch off       | Refused, 0 requests                                                                                         | chrome   | PASS `Not sent`                                                                 |
| E2  | Mutation, switch on        | Runs against the server, value written, no behaviour change (`userConfig` written back as its current `{}`) | chrome   | PASS switch on: `failed: []`, `{}` before and after, POST 200, switch off again |
| E3  | Switch after reload        | Off                                                                                                         | chrome   | PASS off after reload                                                           |
| E4  | Subscription               | Refused, 0 requests                                                                                         | chrome   | PASS `Not sent: subscriptions are not supported.`                               |
| E5  | Two operations             | Refused, 0 requests                                                                                         | chrome   | PASS `Not sent: expected exactly one operation, found 2.`                       |
| E6  | Invalid or array variables | Refused, 0 requests                                                                                         | chrome   | PASS both refused                                                               |
| E7  | Logged out                 | Refused, 0 requests                                                                                         | headless | PASS `Not sent: log in to the WebUI first.`, also with the switch on            |

## F. How errors look

Pass criterion for all: the cause is visible at the top of the result pane without scrolling or reading client wrapper fields, the history entry says `error`, the Run button recovers, and the app stays logged in.

| ID  | Test                                                                                                        | Env           | Result                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| F1  | Unknown field                                                                                               | chrome        | PASS message on line 4, entry `error`                                                                            |
| F2  | Missing required argument                                                                                   | chrome        | PASS message on line 4, entry `error`                                                                            |
| F3  | Wrong variable type                                                                                         | chrome        | PASS `HTTP 400`, cause on line 5                                                                                 |
| F4  | Missing required variable                                                                                   | chrome        | PASS `HTTP 400`, cause on line 5                                                                                 |
| F5  | Network failure                                                                                             | chrome, sim   | PASS `Request failed: TypeError: Failed to fetch` (`sim`)                                                        |
| F6  | HTTP 500 with problem JSON                                                                                  | chrome, sim   | PASS `HTTP 500 Internal Server Error`, title on line 3 (`sim`)                                                   |
| F7  | HTTP 401                                                                                                    | chrome, sim   | PASS `HTTP 401 Unauthorized`, title on line 3, app stayed logged in (`sim`)                                      |
| F8  | HTTP 502 with HTML body                                                                                     | chrome, sim   | PASS `HTTP 502 Bad Gateway` and the HTML body (`sim`)                                                            |
| F9  | HTTP 200 with partial data and `errors`                                                                     | chrome, sim   | PASS `data` and `errors`, message on line 7, entry `error` (`sim`)                                               |
| F10 | Schema fails to load: Query tab says so, HTTP status shown, and it recovers on reopen without a page reload | headless, sim | PASS 500, HTML 200, abort: message on the Query tab with HTTP status, recovered on reopen without reload (`sim`) |
| F11 | Monaco fails to load: Panel shows a message instead of blank editors, and recovers on reopen                | headless, sim | PASS loader and bundle abort: message shown, reopen gives 3 editors, 1 loader script (`sim`)                     |

## G. History

| ID  | Test               | Pass criterion                                          | Env         | Result                                                                                            |
| --- | ------------------ | ------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| G1  | Order and status   | Newest first; `ok`, `error`, `not sent` correct         | chrome      | PASS 19 entries newest first, statuses correct                                                    |
| G2  | Restore            | Query, variables, result restored; 0 requests           | chrome      | PASS query, variables, result restored, 0 entries added; 0 requests restoring from the Schema tab |
| G3  | Restore a mutation | Switch unchanged, nothing sent                          | chrome      | PASS text restored, switch stays off, 0 entries added                                             |
| G4  | Clear              | List empty                                              | chrome      | PASS 0 entries                                                                                    |
| G5  | Cap                | 50 entries at most                                      | chrome      | PASS 55 attempts kept 50, `Cap54` to `Cap5`                                                       |
| G6  | Close and reopen   | Entries kept                                            | chrome      | PASS 20 entries after close and reopen                                                            |
| G7  | Reload             | Entries gone                                            | chrome      | PASS 0 entries after reload                                                                       |
| G8  | Request in flight  | Run and entries disabled; second run does not duplicate | chrome, sim | PASS Run and entries disabled, second click added nothing (`sim`)                                 |
| G9  | Long label         | Does not break the list layout                          | chrome      | PASS 172-character name, button 238 px, no overflow                                               |

## H. Schema tab

| ID  | Test                  | Pass criterion                             | Env    | Result                                                                |
| --- | --------------------- | ------------------------------------------ | ------ | --------------------------------------------------------------------- |
| H1  | Lazy                  | No schema editor until the tab opens       | chrome | PASS 3 editors, no schema host until opened                           |
| H2  | Content               | Has `type AgentList`, no `join__`/`link__` | chrome | PASS 839,840 chars, has `type AgentList`, no `join__`/`link__`, 97 ms |
| H3  | Read-only             | Typing changes nothing                     | chrome | PASS typing `zzz` changed nothing                                     |
| H4  | `Cmd+F`               | Finds `type AgentList`                     | chrome | PASS find `1 of 1`, selection `type AgentList`                        |
| H5  | Switching tabs        | Query text, result, history kept           | chrome | PASS query and result unchanged                                       |
| H6  | Restore from Schema   | Switches to Query, restores, 0 requests    | chrome | PASS switched to Query and restored, 0 requests                       |
| H7  | `Cmd+Enter` on Schema | Nothing runs                               | chrome | PASS 3 entries unchanged, 0 requests                                  |
| H8  | Dark theme            | Legible                                    | chrome | PASS legible in the real dark theme (earlier screenshot, same CSS)    |

## I. Repository checks

| ID  | Test                                   | Pass criterion     | Env   | Result                                                            |
| --- | -------------------------------------- | ------------------ | ----- | ----------------------------------------------------------------- |
| I1  | `verify.sh`                            | `=== ALL PASS ===` | shell | PASS `=== ALL PASS ===`. Does not cover this package; I2 to I4 do |
| I2  | Package `tsc`                          | Exit 0             | shell | PASS exit 0                                                       |
| I3  | Prettier with `react/.prettierrc.json` | Clean              | shell | PASS clean                                                        |
| I4  | Token gate including the package       | 0 undeclared       | shell | PASS 0 undeclared, with the package added to the scan             |
