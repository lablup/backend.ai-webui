# Changelog

## v20.07.1 (02/07/2020)

## v20.06.3 (22/06/2020)

#### Enhancements:

- [**enhancement**] Feature to download vfolder directory [#580](https://github.com/lablup/backend.ai-console/issues/580)
- [**UI / UX**][**enhancement**][**minor**] Migrate legacy dialogs to backend.ai dialog for unified look and feel [#584](https://github.com/lablup/backend.ai-console/issues/584)
- [**UI / UX**][**enhancement**][**minor**] Open notification when no virtual folder is attached on console [#583](https://github.com/lablup/backend.ai-console/issues/583)

#### Bug Fixes:

- [**bug**] After selecting resource template without GPU, advanced panel's GPU value is not respected in creating session [#581](https://github.com/lablup/backend.ai-console/issues/581)


## v20.06.2 (16/06/2020)

#### Enhancements:

- [**enhancement**][**hard**][**major**][**UI / UX**][**library / SDK**] Show app launcher after launch a session on summary page (#575) [#575](https://github.com/lablup/backend.ai-console/issues/575)


## v20.06.1 (13/06/2020)

#### Bug Fixes:
- [**UI / UX**][**bug**][**major**][**blocker**] Sometimes environment list did not refreshed correctly [#576](https://github.com/lablup/backend.ai-console/issues/576)


## v20.06.0 (12/06/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**][**minor**] Change session store method for console-server [#567](https://github.com/lablup/backend.ai-console/issues/567)
- [**cloud**][**enhancement**][**library / SDK**] Let Cloud users to change their forgot password by email verification [#564](https://github.com/lablup/backend.ai-console/issues/564)
- [**UI / UX**][**cloud**][**enhancement**][**enterprise**][**major**] Provide method to turn off some menus by setting [#562](https://github.com/lablup/backend.ai-console/issues/562)
- [**cloud**][**enhancement**][**major**][**web**] Re-enable service worker to reduce traffic load [#554](https://github.com/lablup/backend.ai-console/issues/554)
- [**UI / UX**][**cloud**][**enhancement**][**library / SDK**][**major**] Add support for signup user email verification [#536](https://github.com/lablup/backend.ai-console/issues/536)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Resource monitor panel is not updated after session creation [#566](https://github.com/lablup/backend.ai-console/issues/566)
- [**UI / UX**][**bug**] Session list has scrollbar on admin mode [#560](https://github.com/lablup/backend.ai-console/issues/560)
- [**blocker**][**bug**][**major**] 'No suitable preset' is not shown when preset does not exist [#559](https://github.com/lablup/backend.ai-console/issues/559)
- [**bug**][**minor**] Preset does not work after cpu/memory values are set manually by Advanced panel [#555](https://github.com/lablup/backend.ai-console/issues/555)
- [**UI / UX**][**bug**][**hard**] Resource slider shows zero on first launch dialog [#553](https://github.com/lablup/backend.ai-console/issues/553)
- [**UI / UX**][**bug**][**minor**] Wait to enable session launch button before SDK is connected to manager [#552](https://github.com/lablup/backend.ai-console/issues/552)
- [**UI / UX**][**blocker**][**bug**] Resource preset is not refreshed at the first launch [#551](https://github.com/lablup/backend.ai-console/issues/551)
- [**UI / UX**][**blocker**][**bug**][**library / SDK**] Check password condition on change [#549](https://github.com/lablup/backend.ai-console/issues/549)

#### UI / UX:

- [**UI / UX**][**easy**][**minor**] Limit maximum allowed CPU cores to 64 [#571](https://github.com/lablup/backend.ai-console/issues/571)
- [**UI / UX**][**minor**] Display TensorFlow/PyTorch versions for NGC images [#569](https://github.com/lablup/backend.ai-console/issues/569)


## v20.05.5 (26/05/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**major**] Notification stack UI on sidepanel [#547](https://github.com/lablup/backend.ai-console/issues/547)
- [**UI / UX**][**enhancement**][**major**] Asychronous tooltip to increase UI response speed [#543](https://github.com/lablup/backend.ai-console/issues/543)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] UI for Background task [#542](https://github.com/lablup/backend.ai-console/issues/542)
- [**UI / UX**][**cloud**][**enhancement**][**library / SDK**][**major**] Add support for signup user email verification [#536](https://github.com/lablup/backend.ai-console/issues/536)
- [**UI / UX**][**app**][**enhancement**][**hard**][**library / SDK**][**major**] Task monitor UI component  [#505](https://github.com/lablup/backend.ai-console/issues/505)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Resource preset is not refreshed at the first launch [#551](https://github.com/lablup/backend.ai-console/issues/551)
- [**UI / UX**][**bug**][**major**] Tooltip overrided by main content adrea on mini sidebar mode on Safari [#544](https://github.com/lablup/backend.ai-console/issues/544)
- [**UI / UX**][**bug**][**library / SDK**][**minor**] Image install shows error message if it takes more than 5 sec. [#541](https://github.com/lablup/backend.ai-console/issues/541)


## v20.05.4 (22/05/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**][**maintenance**] Adopt tus v2 client [#530](https://github.com/lablup/backend.ai-console/issues/530)
- [**UI / UX**][**enhancement**][**major**] New UI for 20.03 (with summary / sidebar) [#518](https://github.com/lablup/backend.ai-console/issues/518)

#### Bug Fixes:

- [**bug**][**easy**] Exception when logged in as a user (or in login page) [#532](https://github.com/lablup/backend.ai-console/issues/532)


## v20.05.3 (15/05/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Hover menu description on simple sidebar menu [#528](https://github.com/lablup/backend.ai-console/issues/528)
- [**UI / UX**][**cloud**][**enhancement**][**minor**] Link online help page on each menu [#524](https://github.com/lablup/backend.ai-console/issues/524)
- [**enhancement**][**enterprise**][**library / SDK**][**world console**] Change default Dockerfile to use console-server [#523](https://github.com/lablup/backend.ai-console/issues/523)

#### Bug Fixes:

- [**UI / UX**][**bug**] Environment change sometimes does not update presets with GPUs [#525](https://github.com/lablup/backend.ai-console/issues/525)


## v20.05.2 (14/05/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Modified some missing i18n resources.


## v20.05.1 (08/05/2020)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**library / SDK**][**major**] Multiple virtual folder does not mount on GUI [#520](https://github.com/lablup/backend.ai-console/issues/520)


## v20.05.0 (07/05/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Add description about common storage types [#509](https://github.com/lablup/backend.ai-console/issues/509)
- [**UI / UX**][**bug**][**enhancement**] More CUDA resource minimum settings for image default [#507](https://github.com/lablup/backend.ai-console/issues/507)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Unified event tasker [#498](https://github.com/lablup/backend.ai-console/issues/498)


#### Bug Fixes:

- [**UI / UX**][**bug**][**easy**]  Hide GPU pane on summary page if it does not exist [#519](https://github.com/lablup/backend.ai-console/issues/519)
- [**UI / UX**][**bug**][**easy**] Set unlimited concurrent jobs number to 1000000 [#516](https://github.com/lablup/backend.ai-console/issues/516)
- [**bug**][**library / SDK**][**minor**] Resource indicator sometimes does not refreshed after changing resource group [#513](https://github.com/lablup/backend.ai-console/issues/513)
- [**UI / UX**][**bug**][**minor**] Version item does not update when environment is changed on session launch panel [#510](https://github.com/lablup/backend.ai-console/issues/510)
- [**blocker**][**bug**][**library / SDK**][**minor**] etcd broken when image metadata is modified with Harbor registry URL with colon  [#508](https://github.com/lablup/backend.ai-console/issues/508)
#### UI / UX:

- [**UI / UX**][**easy**][**enterprise**] Folder creation keeps last created folder name [#511](https://github.com/lablup/backend.ai-console/issues/511)
- [**UI / UX**][**easy**][**minor**] Add refresh button in session logs dialog [#502](https://github.com/lablup/backend.ai-console/issues/502)


## v20.04.5 (27/04/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Unified event tasker [#498](https://github.com/lablup/backend.ai-console/issues/498)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Support shared memory setting to ResourceTemplate [#494](https://github.com/lablup/backend.ai-console/issues/494)


## v20.04.4 (26/04/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] File rename feature [#434](https://github.com/lablup/backend.ai-console/issues/434)
- [**enhancement**][**library / SDK**][**major**] Handle heterogeneous resource slots for v1912+ [#407](https://github.com/lablup/backend.ai-console/issues/407)
- [**UI / UX**][**enhancement**][**hard**][**major**] Detailed kernel selection UI [#258](https://github.com/lablup/backend.ai-console/issues/258)

#### Bug Fixes:

- [**bug**] Blank Data & Storage page [#499](https://github.com/lablup/backend.ai-console/issues/499)

#### UI / UX:

- [**UI / UX**][**easy**][**minor**] Add refresh button in session logs dialog [#502](https://github.com/lablup/backend.ai-console/issues/502)


## v20.04.3 (16/04/2020)

#### Enhancements:

- [**enhancement**][**hard**][**library / SDK**][**major**]  add 'automatic download' option to manager [#157](https://github.com/lablup/backend.ai-console/issues/157)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**library / SDK**] Block usage mode / permission setting on Backend.AI 19.09 [#492](https://github.com/lablup/backend.ai-console/issues/492)
- [**UI / UX**][**bug**][**minor**] FOUC during login on Firefox [#491](https://github.com/lablup/backend.ai-console/issues/491)
- [**bug**][**enterprise**][**library / SDK**] Image rescan button returns error due to short timeout [#490](https://github.com/lablup/backend.ai-console/issues/490)

---

## v20.04.2 (15/04/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**][**major**] Implement general user settings store [#484](https://github.com/lablup/backend.ai-console/issues/484)
- [**enhancement**][**library / SDK**][**major**] Account for vfolder permission and usage mode during vfolder creation [#482](https://github.com/lablup/backend.ai-console/issues/482)
- [**UI / UX**][**easy**][**enhancement**] Support major password managers [#480](https://github.com/lablup/backend.ai-console/issues/480)
- [**UI / UX**][**blocker**][**bug**][**enhancement**][**minor**] Login sometimes changes to IAM and not returned [#479](https://github.com/lablup/backend.ai-console/issues/479)
- [**UI / UX**][**app**][**enhancement**][**enterprise**][**library / SDK**][**major**][**web**][**working**] Automatic release check [#443](https://github.com/lablup/backend.ai-console/issues/443)
- [**UI / UX**][**enhancement**] Keep last used group on console [#437](https://github.com/lablup/backend.ai-console/issues/437)
- [**UI / UX**][**enhancement**][**hard**][**major**] Save previous endpoints for app [#436](https://github.com/lablup/backend.ai-console/issues/436)
- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Validate whether API endpoint is correct Backend.AI manager / console server or not [#251](https://github.com/lablup/backend.ai-console/issues/251)
- [**enhancement**][**library / SDK**] More diverse resource policy setting [#56](https://github.com/lablup/backend.ai-console/issues/56)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**] Basic settings for admin [#28](https://github.com/lablup/backend.ai-console/issues/28)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Monitor display does not show animation on resource view when no resource is used [#489](https://github.com/lablup/backend.ai-console/issues/489)
- [**blocker**][**bug**] After completing signout (leave service), no logout or dialog close event is not performed in windows app [#230](https://github.com/lablup/backend.ai-console/issues/230)

#### UI / UX:

- [**UI / UX**] Divide fetch failure and connection lost [#339](https://github.com/lablup/backend.ai-console/issues/339)


## v20.04.1 (10/04/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Provide kill button to errored session in Others tab [#477](https://github.com/lablup/backend.ai-console/issues/477)
- [**UI / UX**][**enhancement**][**minor**] Adopt finer group select element on UI [#475](https://github.com/lablup/backend.ai-console/issues/475)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Provide downtime information when manager is not responding [#473](https://github.com/lablup/backend.ai-console/issues/473)
- [**UI / UX**][**enhancement**][**library / SDK**][**maintenance**][**major**] Spring clean: Remove 19.03 support [#471](https://github.com/lablup/backend.ai-console/issues/471)
- [**UI / UX**][**enhancement**][**minor**] Background on loading screen [#469](https://github.com/lablup/backend.ai-console/issues/469)

#### Web Features:

- [**UI / UX**][**library / SDK**][**minor**][**web**] vFolder file download not working on iOS/iPadOS [#465](https://github.com/lablup/backend.ai-console/issues/465)

#### UI / UX:

- [**UI / UX**][**library / SDK**][**major**] Limit fetch timeout with general / custom timeout value [#472](https://github.com/lablup/backend.ai-console/issues/472)
- [**UI / UX**][**cloud**][**enterprise**][**major**] Update Cloud Terms of Service / Privacy Policy to match with GDPR [#468](https://github.com/lablup/backend.ai-console/issues/468)
- [**UI / UX**][**cloud**][**minor**] Automatic language detection on Terms Of Service panel [#467](https://github.com/lablup/backend.ai-console/issues/467)

---

## v20.04.0 (08/04/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] GUI option to change image pull behavior [#460](https://github.com/lablup/backend.ai-console/issues/460)
- [**UI / UX**][**cloud**][**enhancement**] Support Ubuntu Desktop environment [#459](https://github.com/lablup/backend.ai-console/issues/459)
- [**app**][**enhancement**][**minor**] Add option for local wsproxy to work behind external http proxy [#456](https://github.com/lablup/backend.ai-console/issues/456)
- [**UI / UX**][**enhancement**] Change invitation panel after decision is made [#426](https://github.com/lablup/backend.ai-console/issues/426)
- [**UI / UX**][**enhancement**][**library / SDK**] GUI option to allow/disallow images from specific repository. [#421](https://github.com/lablup/backend.ai-console/issues/421)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Queue support to upload files [#392](https://github.com/lablup/backend.ai-console/issues/392)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Support ROCm devices on GUI [#308](https://github.com/lablup/backend.ai-console/issues/308)

---

## v20.03.5 (30/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Provide i18n framework [#451](https://github.com/lablup/backend.ai-console/issues/451)
- [**UI / UX**][**enhancement**][**easy**][**library / SDK**][**minor**] Delete directory inside folder explorer [#453](https://github.com/lablup/backend.ai-console/issues/453)
- [**UI / UX**][**enhancement**][**library / SDK**] Hide GPU-enabled preset when kernel does not require GPU resource [#445](https://github.com/lablup/backend.ai-console/issues/445)

#### Bug Fixes:

- [**bug**][**library / SDK**] Webpage via proxy sometimes produces 500 error while app is not ready yet [#449](https://github.com/lablup/backend.ai-console/issues/449)

---

## v20.03.4 (23/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Explanation hover on environment selection menu [#440](https://github.com/lablup/backend.ai-console/issues/440)
- [**UI / UX**][**cloud**][**enhancement**][**web**] Provide EULA with multiple languages [#435](https://github.com/lablup/backend.ai-console/issues/435)
- [**UI / UX**][**enhancement**] Separate automount folders from storage mount selection [#431](https://github.com/lablup/backend.ai-console/issues/431)

#### UI / UX:

- [**UI / UX**][**library / SDK**] Hide GPU-enabled preset when kernel does not require GPU resource [#445](https://github.com/lablup/backend.ai-console/issues/445)

---

## v20.03.3 (17/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Support TexLive environment [#427](https://github.com/lablup/backend.ai-console/issues/427)
- [**UI / UX**][**enhancement**] Provide release note / app download link on summary page [#425](https://github.com/lablup/backend.ai-console/issues/425)
- [**UI / UX**][**enhancement**][**maintenance**][**major**] Remove polymer-based components [#419](https://github.com/lablup/backend.ai-console/issues/419)

#### Bug Fixes:

- [**bug**] Image installation does not work with both GPU/fGPU resource tag [#428](https://github.com/lablup/backend.ai-console/issues/428)

---

## v20.03.2 (11/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Add tag to image from custom registries [#420](https://github.com/lablup/backend.ai-console/issues/420)
- [**UI / UX**][**enhancement**][**library / SDK**] Backend.AI edition information from server / client [#417](https://github.com/lablup/backend.ai-console/issues/417)
- [**UI / UX**][**enhancement**] Visible console version on summary statistics panel [#415](https://github.com/lablup/backend.ai-console/issues/415)

#### Bug Fixes:

- [**bug**][**minor**] Bug - session image download raises error when the admin is not in the "default" project [#406](https://github.com/lablup/backend.ai-console/issues/406)

---

## v20.03.1 (09/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] Shell environment setup UI [#391](https://github.com/lablup/backend.ai-console/issues/391)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Cannot create storage folder starting with . [#413](https://github.com/lablup/backend.ai-console/issues/413)

---

## v20.03.0 (06/03/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Adding explicit gauge descriptions to resource usage information [#411](https://github.com/lablup/backend.ai-console/issues/411)
- [**UI / UX**][**enhancement**] Refactor signup routine to use native form validator [#397](https://github.com/lablup/backend.ai-console/issues/397)
- [**UI / UX**][**enhancement**] Revised storage / folder menu [#395](https://github.com/lablup/backend.ai-console/issues/395)
- [**UI / UX**][**enhancement**][**library / SDK**] Turn on / off beta features [#393](https://github.com/lablup/backend.ai-console/issues/393)
- [**UI / UX**][**enhancement**][**minor**] Provide option to keep the current login session for app [#388](https://github.com/lablup/backend.ai-console/issues/388)
- [**UI / UX**][**enhancement**] User settings page [#319](https://github.com/lablup/backend.ai-console/issues/319)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**] Cannot assign GPU without virtualization (as is for open source edition) [#408](https://github.com/lablup/backend.ai-console/issues/408)
- [**UI / UX**][**bug**] Folders to mount label overlaps selected folders text [#404](https://github.com/lablup/backend.ai-console/issues/404)
- [**UI / UX**][**blocker**][**bug**] Cannot logout on settings / log page [#399](https://github.com/lablup/backend.ai-console/issues/399)
- [**UI / UX**][**blocker**][**bug**] Incorrect image downloaded after sorting [#382](https://github.com/lablup/backend.ai-console/issues/382)
- [**UI / UX**][**blocker**][**bug**] Upgrade session launch UI [#374](https://github.com/lablup/backend.ai-console/issues/374)
- [**bug**][**library / SDK**] Reliable upload session on poor network circumstances [#369](https://github.com/lablup/backend.ai-console/issues/369)

#### UI / UX:

- [**UI / UX**][**minor**] Remember last selected group (project) [#396](https://github.com/lablup/backend.ai-console/issues/396)
- [**UI / UX**] change dropdown web component [#386](https://github.com/lablup/backend.ai-console/issues/386)

---

## v20.02.5 (27/02/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Option to turn off desktop notification [#365](https://github.com/lablup/backend.ai-console/issues/365)
- [**UI / UX**][**enhancement**] Pagniated user list [#345](https://github.com/lablup/backend.ai-console/issues/345)
- [**UI / UX**][**enhancement**] Modify login mode change button to be displayed with the signup button [#325](https://github.com/lablup/backend.ai-console/issues/325)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Appropriate shared memory size setting [#314](https://github.com/lablup/backend.ai-console/issues/314)

#### Bug Fixes:

- [**UI / UX**][**bug**] uncheck image if downloading fails [#383](https://github.com/lablup/backend.ai-console/issues/383)
- [**bug**][**urgency**] Scaling group not updated when Project is changed in session list page [#376](https://github.com/lablup/backend.ai-console/issues/376)
- [**UI / UX**][**blocker**][**bug**] Version on session list displays wrong number [#373](https://github.com/lablup/backend.ai-console/issues/373)
- [**UI / UX**][**bug**] session slider is enabled even if resource is not available  [#362](https://github.com/lablup/backend.ai-console/issues/362)

#### UI / UX:

- [**UI / UX**][**minor**] move export csv feature into menu in user/credentials and sessions [#380](https://github.com/lablup/backend.ai-console/issues/380)
- [**UI / UX**][**easy**] Input validation check in resource policy setting [#354](https://github.com/lablup/backend.ai-console/issues/354)

---

## v20.02.4 (19/02/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] .csv export features of Credentials, Users and Sessions lists for admin. [#348](https://github.com/lablup/backend.ai-console/issues/348)

#### UI / UX:

- [**UI / UX**][**minor**] Turn off spinner when request fails [#359](https://github.com/lablup/backend.ai-console/issues/359)

---

## v20.02.3 (18/02/2020)

#### UI / UX:

- [**UI / UX**][**minor**] Increase app launch delay from 1 to 3 sec. to prevent from 500 error [#360](https://github.com/lablup/backend.ai-console/issues/360)

---

## v20.02.2 (18/02/2020)
*No changelog for this release.*

---

## v20.02.1 (18/02/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] More detailed login failure message [#352](https://github.com/lablup/backend.ai-console/issues/352)
- [**UI / UX**][**bug**][**enhancement**] Make session delete button appear when no service app available [#350](https://github.com/lablup/backend.ai-console/issues/350)
- [**UI / UX**][**easy**][**enhancement**] Hide session delete icon when the state is PREPARING and PULLING [#349](https://github.com/lablup/backend.ai-console/issues/349)
- [**UI / UX**][**enhancement**] Pagniated session list [#328](https://github.com/lablup/backend.ai-console/issues/328)
- [**UI / UX**][**enhancement**][**major**] Log page for app / web instance [#320](https://github.com/lablup/backend.ai-console/issues/320)

#### Bug Fixes:

- [**UI / UX**][**bug**] Show admins project list items only when admin is a member of it [#358](https://github.com/lablup/backend.ai-console/issues/358)

#### UI / UX:

- [**UI / UX**][**minor**] Apply monospace font to UUID on storage [#357](https://github.com/lablup/backend.ai-console/issues/357)
- [**UI / UX**][**minor**] Node name information on resource nodes [#356](https://github.com/lablup/backend.ai-console/issues/356)
- [**UI / UX**][**library / SDK**][**minor**] Disable project list item when the project is deactivated [#351](https://github.com/lablup/backend.ai-console/issues/351)

---

## v20.02.0 (03/02/2020)

#### Enhancements:

- [**bug**][**enhancement**][**library / SDK**] Support raw file download feature introduced in 19.09 [#342](https://github.com/lablup/backend.ai-console/issues/342)
- [**UI / UX**][**enhancement**][**minor**] Remove registry and namespace from alias and basename [#341](https://github.com/lablup/backend.ai-console/issues/341)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Reliable upload component with tus.io [#305](https://github.com/lablup/backend.ai-console/issues/305)

---

## v20.01.6 (30/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Add text input to resource policy settings [#277](https://github.com/lablup/backend.ai-console/issues/277)

---

## v20.01.5 (28/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Support custom image even it does not follow naming convention [#334](https://github.com/lablup/backend.ai-console/issues/334)
- [**bug**][**enhancement**][**library / SDK**][**major**] Handle docker registry path prefix with slash / colon / dash [#333](https://github.com/lablup/backend.ai-console/issues/333)

#### Bug Fixes:

- [**UI / UX**][**bug**][**library / SDK**][**urgency**] Registry name with colon generates error while rescan registry information [#335](https://github.com/lablup/backend.ai-console/issues/335)

#### UI / UX:

- [**UI / UX**][**easy**] Let user management be the first page of Users tab [#337](https://github.com/lablup/backend.ai-console/issues/337)

---

## v20.01.4 (22/01/2020)
*No changelog for this release.*

---

## v20.01.3 (22/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**urgency**] Sorting function on environment list [#331](https://github.com/lablup/backend.ai-console/issues/331)

---

## v20.01.2 (21/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**major**] Turn off user-specific login mode setting when login mode is fixed [#326](https://github.com/lablup/backend.ai-console/issues/326)
- [**enhancement**][**library / SDK**][**major**] Update JavaScript SDK to accept v5 specification [#323](https://github.com/lablup/backend.ai-console/issues/323)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Clean up global settings [#318](https://github.com/lablup/backend.ai-console/issues/318)
- [**UI / UX**][**easy**][**enhancement**][**good first issue**] Enlarge session resource text input on session start dialog [#311](https://github.com/lablup/backend.ai-console/issues/311)

#### Bug Fixes:

- [**UI / UX**][**bug**][**library / SDK**][**major**] Relevant memory allocation for installing remote kernels [#321](https://github.com/lablup/backend.ai-console/issues/321)

#### UI / UX:

- [**UI / UX**][**good first issue**][**minor**] Let superadmin can see agent ID in session list [#313](https://github.com/lablup/backend.ai-console/issues/313)

---

## v20.01.1 (07/01/2020)

#### Bug Fixes:

- [**bug**][**library / SDK**] Cannot generate keypair without giving manual accesskey/secretkey [#312](https://github.com/lablup/backend.ai-console/issues/312)

---

## v20.01.0 (03/01/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Add region / cloud icon on resource tab [#304](https://github.com/lablup/backend.ai-console/issues/304)
- [**UI / UX**][**easy**][**enhancement**] Optimize manifest resources [#300](https://github.com/lablup/backend.ai-console/issues/300)

#### Bug Fixes:

- [**bug**][**minor**] Alive agent is listed in the Terminated Agents tab [#306](https://github.com/lablup/backend.ai-console/issues/306)
- [**bug**] Windows app cannot built with specific configuration [#303](https://github.com/lablup/backend.ai-console/issues/303)
- [**UI / UX**][**bug**] Incorrect image version is selected when launching multiple images [#302](https://github.com/lablup/backend.ai-console/issues/302)

#### UI / UX:

- [**UI / UX**][**minor**] Remove unnecessary menus [#301](https://github.com/lablup/backend.ai-console/issues/301)
- [**UI / UX**][**major**] Group kernels into categories [#284](https://github.com/lablup/backend.ai-console/issues/284)

---

## v19.12.0 (03/12/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Add kernel description to metadata structure [#298](https://github.com/lablup/backend.ai-console/issues/298)
- [**enhancement**][**library / SDK**][**minor**] Reduce app.js for faster loading time [#296](https://github.com/lablup/backend.ai-console/issues/296)
- [**UI / UX**][**enhancement**][**major**] Simplify image metadata structure [#295](https://github.com/lablup/backend.ai-console/issues/295)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Shell-only mode for live update [#294](https://github.com/lablup/backend.ai-console/issues/294)
- [**UI / UX**][**enhancement**][**library / SDK**] Support default SSH / SFTP feature [#265](https://github.com/lablup/backend.ai-console/issues/265)

---

## v19.11.2 (07/11/2019)
*No changelog for this release.*

---

## v19.11.1 (06/11/2019)

#### Enhancements:

- [**enhancement**][**hard**][**major**] Unify error handling on SDK [#288](https://github.com/lablup/backend.ai-console/issues/288)
- [**UI / UX**][**enhancement**][**minor**] Use internal terms of agreements / etc. on sidebar [#287](https://github.com/lablup/backend.ai-console/issues/287)
- [**UI / UX**][**enhancement**][**major**] VNC support [#281](https://github.com/lablup/backend.ai-console/issues/281)
- [**UI / UX**][**enhancement**][**major**] NGC Matlab environment support [#280](https://github.com/lablup/backend.ai-console/issues/280)

#### UI / UX:

- [**UI / UX**][**library / SDK**][**major**] Add project resource indicator [#290](https://github.com/lablup/backend.ai-console/issues/290)
- [**UI / UX**][**minor**] More flexible resource setting during resource preset creation [#282](https://github.com/lablup/backend.ai-console/issues/282)

---

## v19.11.0 (04/11/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] MPI Fortran Kernel support  [#286](https://github.com/lablup/backend.ai-console/issues/286)

---

## v19.10.4 (31/10/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**major**] Native support of all public kernels on app menu [#279](https://github.com/lablup/backend.ai-console/issues/279)
- [**UI / UX**][**enhancement**][**hard**][**minor**] Modify resource gauge at session list to support various device screen [#278](https://github.com/lablup/backend.ai-console/issues/278)
- [**UI / UX**][**enhancement**][**major**] Need a UI for admins to create a session on behalf of users [#260](https://github.com/lablup/backend.ai-console/issues/260)
- [**UI / UX**][**enhancement**] UI update (19.10) [#239](https://github.com/lablup/backend.ai-console/issues/239)

---

## v19.10.3 (16/10/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**] Keep login mode (session / API keypair) for app / web after changing it [#276](https://github.com/lablup/backend.ai-console/issues/276)
- [**enhancement**][**library / SDK**][**major**] Change app-localstorage-document to localStorage [#275](https://github.com/lablup/backend.ai-console/issues/275)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Local configuration store [#274](https://github.com/lablup/backend.ai-console/issues/274)
- [**UI / UX**][**blocker**][**bug**][**enhancement**] Sometimes closing window returns `destroy` error [#273](https://github.com/lablup/backend.ai-console/issues/273)
- [**UI / UX**][**enhancement**] Meaningful messages [#161](https://github.com/lablup/backend.ai-console/issues/161)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Image manipulation [#37](https://github.com/lablup/backend.ai-console/issues/37)

#### Bug Fixes:

- [**UI / UX**][**bug**] User cannot use long e-mail address even if it is accepted at sign up [#272](https://github.com/lablup/backend.ai-console/issues/272)

#### UI / UX:

- [**UI / UX**][**minor**] Humanize CPU used time in session information [#150](https://github.com/lablup/backend.ai-console/issues/150)

---

## v19.10.2 (14/10/2019)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Footer on sidebar / API endpoint content are not showing on Safari [#271](https://github.com/lablup/backend.ai-console/issues/271)
- [**UI / UX**][**bug**][**major**] Statistics page generates error on Safari when visiting through menu navigation [#270](https://github.com/lablup/backend.ai-console/issues/270)

---

## v19.10.1 (14/10/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] Naming change - scaling group to resource group on UI [#267](https://github.com/lablup/backend.ai-console/issues/267)
- [**UI / UX**][**enhancement**][**major**] Unit on statistics usage graph is missing [#266](https://github.com/lablup/backend.ai-console/issues/266)
- [**UI / UX**][**blocker**][**enhancement**][**minor**] Sometimes date overlaps on statistics panel [#261](https://github.com/lablup/backend.ai-console/issues/261)
- [**enhancement**][**library / SDK**][**major**] External image resource information for better image information control [#259](https://github.com/lablup/backend.ai-console/issues/259)
- [**UI / UX**][**blocker**][**enhancement**][**hard**] Hide GPU-disabled resource templates if kernel requires GPU [#257](https://github.com/lablup/backend.ai-console/issues/257)
- [**enhancement**][**hard**][**major**] Plug-in architecture [#95](https://github.com/lablup/backend.ai-console/issues/95)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Statistics page does not initialize if accessed directly [#269](https://github.com/lablup/backend.ai-console/issues/269)
- [**UI / UX**][**bug**][**minor**] Wrong active session count on system health panel  [#264](https://github.com/lablup/backend.ai-console/issues/264)
- [**UI / UX**][**blocker**][**bug**] User can try to terminate kernels on 'finished' tab [#263](https://github.com/lablup/backend.ai-console/issues/263)
- [**UI / UX**][**blocker**][**bug**] Insight tab is viewable even in production mode [#262](https://github.com/lablup/backend.ai-console/issues/262)

---

## v19.10.0 (02/10/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] Signup is not possible when endpoint is not set [#244](https://github.com/lablup/backend.ai-console/issues/244)
- [**UI / UX**][**enhancement**][**hard**][**major**] Add desktop notification support [#243](https://github.com/lablup/backend.ai-console/issues/243)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Snackbar to trace more error information [#213](https://github.com/lablup/backend.ai-console/issues/213)
- [**UI / UX**][**enhancement**] UI update (19.09) [#199](https://github.com/lablup/backend.ai-console/issues/199)
- [**enhancement**][**library / SDK**][**major**] Add image installation API [#158](https://github.com/lablup/backend.ai-console/issues/158)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] User management feature [#67](https://github.com/lablup/backend.ai-console/issues/67)

#### Bug Fixes:

- [**UI / UX**][**bug**] Scaling group resource indicator does not update when changing SG on summary page [#241](https://github.com/lablup/backend.ai-console/issues/241)

#### UI / UX:

- [**UI / UX**] Resource presets and resource indicator is not updated upon scaling group changed in session list page [#249](https://github.com/lablup/backend.ai-console/issues/249)
- [**UI / UX**][**major**] Per-scaling-group resource slots should be used for sliders' max value in session creation dialog [#248](https://github.com/lablup/backend.ai-console/issues/248)
- [**UI / UX**] "undefined" image for custom, not registered image [#247](https://github.com/lablup/backend.ai-console/issues/247)
- [**UI / UX**][**easy**][**minor**] Add delete resource preset button [#246](https://github.com/lablup/backend.ai-console/issues/246)
- [**UI / UX**][**easy**] Move scaling group selection dropdown one level higher [#245](https://github.com/lablup/backend.ai-console/issues/245)
- [**UI / UX**][**major**] Filter session and vfolder list depending on the selected group(project) [#242](https://github.com/lablup/backend.ai-console/issues/242)
- [**UI / UX**][**blocker**] Browser autodetection [#240](https://github.com/lablup/backend.ai-console/issues/240)

---

## v19.09.9 (30/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] Add debug app port for developing kernel images [#235](https://github.com/lablup/backend.ai-console/issues/235)
- [**UI / UX**][**easy**][**enhancement**] Add version tag on session list element [#234](https://github.com/lablup/backend.ai-console/issues/234)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Support visual studio code app [#233](https://github.com/lablup/backend.ai-console/issues/233)
- [**UI / UX**][**blocker**][**enhancement**][**library / SDK**][**major**] SFTP support [#221](https://github.com/lablup/backend.ai-console/issues/221)
- [**UI / UX**][**enhancement**] Signout feature [#154](https://github.com/lablup/backend.ai-console/issues/154)

#### Bug Fixes:

- [**UI / UX**][**bug**] Scaling Group sometimes does not read from GQL [#232](https://github.com/lablup/backend.ai-console/issues/232)

#### UI / UX:

- [**UI / UX**][**minor**] Permission / UI for domain admin to create group folder for specific group [#231](https://github.com/lablup/backend.ai-console/issues/231)

---

## v19.09.8 (25/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] Support detailed status monitor on session list [#228](https://github.com/lablup/backend.ai-console/issues/228)
- [**UI / UX**][**enhancement**] Change snackbar to the top of other elements such as backdrop [#227](https://github.com/lablup/backend.ai-console/issues/227)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Native terminal support for non-jupyter environment [#226](https://github.com/lablup/backend.ai-console/issues/226)
- [**UI / UX**][**enhancement**] Detailed information to status info [#223](https://github.com/lablup/backend.ai-console/issues/223)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Sometimes group elements are duplicated [#229](https://github.com/lablup/backend.ai-console/issues/229)

---

## v19.09.7 (22/09/2019)

#### Enhancements:

- [**UI / UX**][**blocker**][**bug**][**enhancement**][**hard**] Open new session in jupyter notebook results in white page [#225](https://github.com/lablup/backend.ai-console/issues/225)
- [**UI / UX**][**easy**][**enhancement**] Remove reload button on app (it does not work) [#224](https://github.com/lablup/backend.ai-console/issues/224)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Let superadmin can specify hostname when creating docker registry [#194](https://github.com/lablup/backend.ai-console/issues/194)
- [**enhancement**][**library / SDK**] Backward compatibility layer [#86](https://github.com/lablup/backend.ai-console/issues/86)
- [**UI / UX**][**enhancement**][**library / SDK**] Use registry for kernel selection [#30](https://github.com/lablup/backend.ai-console/issues/30)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**] Sometimes scaling group query fails on load [#220](https://github.com/lablup/backend.ai-console/issues/220)
- [**UI / UX**][**blocker**][**bug**] Visiting statistics page always generates error and no graph is shown on first visit [#219](https://github.com/lablup/backend.ai-console/issues/219)
- [**bug**] Visiting Resource Presets page by an admin in non-default group raises error [#216](https://github.com/lablup/backend.ai-console/issues/216)

#### UI / UX:

- [**UI / UX**][**major**] Resource preset is not updated when scaling group is changed [#214](https://github.com/lablup/backend.ai-console/issues/214)

---

## v19.09.6 (19/09/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**] Windows app builder script [#218](https://github.com/lablup/backend.ai-console/issues/218)

---

## v19.09.5 (18/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**] Modify layout component to be modal-compatible [#217](https://github.com/lablup/backend.ai-console/issues/217)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**] Agreement webcomponent [#133](https://github.com/lablup/backend.ai-console/issues/133)
- [**UI / UX**][**enhancement**] UI update (19.08) [#127](https://github.com/lablup/backend.ai-console/issues/127)

#### Bug Fixes:

- [**UI / UX**][**bug**] Uploading indicator does not disappear when 5 or more files are simultaneously uploaded [#198](https://github.com/lablup/backend.ai-console/issues/198)
- [**UI / UX**][**bug**][**hard**] Logout at session page and re-login disables session tab link [#197](https://github.com/lablup/backend.ai-console/issues/197)
- [**UI / UX**][**bug**][**minor**] Focus is moved to Log In button during typing id/password [#162](https://github.com/lablup/backend.ai-console/issues/162)

#### UI / UX:

- [**UI / UX**][**minor**] Remove sharing/invitation icons from group vfolders [#212](https://github.com/lablup/backend.ai-console/issues/212)

---

## v19.09.4 (13/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Support shmem option [#209](https://github.com/lablup/backend.ai-console/issues/209)

#### Bug Fixes:

- [**bug**] Downloading from vfolder is not working [#202](https://github.com/lablup/backend.ai-console/issues/202)

---

## v19.09.3 (09/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**] Separate app / console-server version query [#205](https://github.com/lablup/backend.ai-console/issues/205)
- [**enhancement**][**hard**][**library / SDK**][**major**] Strict TypeScript codes [#188](https://github.com/lablup/backend.ai-console/issues/188)

---

## v19.09.2 (05/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] App shell mode [#203](https://github.com/lablup/backend.ai-console/issues/203)

---

## v19.09.1 (05/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Support h2o.ai container [#196](https://github.com/lablup/backend.ai-console/issues/196)
- [**UI / UX**][**enhancement**][**major**] Let domain admin can create group vfolder [#192](https://github.com/lablup/backend.ai-console/issues/192)
- [**UI / UX**][**enhancement**][**library / SDK**] Modify image metadata [#175](https://github.com/lablup/backend.ai-console/issues/175)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Session list sometimes returns weird error [#201](https://github.com/lablup/backend.ai-console/issues/201)
- [**UI / UX**][**blocker**][**bug**] Run button is active even in finished sessions tab [#195](https://github.com/lablup/backend.ai-console/issues/195)
- [**bug**] Domain admin cannot create session [#191](https://github.com/lablup/backend.ai-console/issues/191)

#### UI / UX:

- [**UI / UX**] Prevent domain admin view/edit docker registries [#193](https://github.com/lablup/backend.ai-console/issues/193)

---

## v19.09.0 (02/09/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**major**] Stackable snackbars [#189](https://github.com/lablup/backend.ai-console/issues/189)
- [**UI / UX**][**enhancement**][**minor**] Splash with about dialog [#187](https://github.com/lablup/backend.ai-console/issues/187)

---

## v19.08.7 (29/08/2019)

#### Bug Fixes:

- [**UI / UX**][**bug**][**hard**][**library / SDK**][**major**] Jupyter notebook window is not closed with "Close" button [#146](https://github.com/lablup/backend.ai-console/issues/146)

---

## v19.08.6 (29/08/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Use server-side app configurations to provide app [#182](https://github.com/lablup/backend.ai-console/issues/182)
- [**UI / UX**][**enhancement**] Support IAM - id/password dual mode [#176](https://github.com/lablup/backend.ai-console/issues/176)
- [**UI / UX**][**enhancement**] Support password manager on login [#167](https://github.com/lablup/backend.ai-console/issues/167)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Registry tab on Environment  [#166](https://github.com/lablup/backend.ai-console/issues/166)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Scaling group tab [#142](https://github.com/lablup/backend.ai-console/issues/142)
- [**UI / UX**][**enhancement**] Check duplicated session name and prevent starting  [#136](https://github.com/lablup/backend.ai-console/issues/136)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Sign-up feature [#124](https://github.com/lablup/backend.ai-console/issues/124)
- [**UI / UX**][**enhancement**][**minor**] Create many sessions at a time [#121](https://github.com/lablup/backend.ai-console/issues/121)
- [**UI / UX**][**enhancement**] Add login cancel button while login [#109](https://github.com/lablup/backend.ai-console/issues/109)
- [**enhancement**][**library / SDK**][**major**] TypeScript support [#107](https://github.com/lablup/backend.ai-console/issues/107)
- [**enhancement**] Group feature [#64](https://github.com/lablup/backend.ai-console/issues/64)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**] Resource panel on start panel in summary page do not refresh after visiting another tab [#177](https://github.com/lablup/backend.ai-console/issues/177)
- [**blocker**][**bug**] Invalid resources indicator after user used all resources [#170](https://github.com/lablup/backend.ai-console/issues/170)
- [**UI / UX**][**bug**] White screen after logout in app [#160](https://github.com/lablup/backend.ai-console/issues/160)

#### UI / UX:

- [**UI / UX**][**easy**][**question**] Connection is failed if endpoint url contains leading/trailing spaces [#181](https://github.com/lablup/backend.ai-console/issues/181)
- [**UI / UX**][**blocker**][**library / SDK**][**major**] Can see other users' sessions with user privileges [#172](https://github.com/lablup/backend.ai-console/issues/172)
- [**UI / UX**][**major**] Treat general kernel names from various repository [#26](https://github.com/lablup/backend.ai-console/issues/26)

---

## v19.08.5 (26/08/2019)

#### Enhancements:

- [**UI / UX**][**bug**][**enhancement**] Weird infinity issue [#169](https://github.com/lablup/backend.ai-console/issues/169)
- [**UI / UX**][**enhancement**] Custom CSS support [#163](https://github.com/lablup/backend.ai-console/issues/163)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Keep domain admin from access unnecessary menus/lists [#156](https://github.com/lablup/backend.ai-console/issues/156)
- [**UI / UX**][**bug**][**enhancement**][**hard**][**library / SDK**][**major**] Closing console app should invalidate session in console-server [#147](https://github.com/lablup/backend.ai-console/issues/147)
- [**UI / UX**][**enhancement**] Change session API key to user name when console is running on SESSION mode [#137](https://github.com/lablup/backend.ai-console/issues/137)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Strange column in session list page for admins [#173](https://github.com/lablup/backend.ai-console/issues/173)
- [**blocker**][**bug**] Request to check-presets fail for users not in the default group [#153](https://github.com/lablup/backend.ai-console/issues/153)
- [**UI / UX**][**bug**] Session list is not fetched after re-login in window app [#152](https://github.com/lablup/backend.ai-console/issues/152)
- [**UI / UX**][**bug**] Session count is not decreased after terminating a session [#151](https://github.com/lablup/backend.ai-console/issues/151)
- [**UI / UX**][**bug**] Kernels from other repository does not show proper resource slider [#145](https://github.com/lablup/backend.ai-console/issues/145)

#### UI / UX:

- [**UI / UX**][**minor**] Hide disabled pages (features) [#171](https://github.com/lablup/backend.ai-console/issues/171)
- [**UI / UX**][**major**] Prevent user to allocate more resource than it has [#165](https://github.com/lablup/backend.ai-console/issues/165)
- [**UI / UX**][**minor**] Add scaling group column in session list [#155](https://github.com/lablup/backend.ai-console/issues/155)

---

## v19.08.4 (21/08/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Login with enter key [#149](https://github.com/lablup/backend.ai-console/issues/149)
- [**enhancement**][**hard**][**library / SDK**][**major**] Merge new websocket proxy [#141](https://github.com/lablup/backend.ai-console/issues/141)
- [**enhancement**][**hard**][**library / SDK**] Summer clean component codes [#135](https://github.com/lablup/backend.ai-console/issues/135)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Signup button is present even config.toml is set to false [#148](https://github.com/lablup/backend.ai-console/issues/148)
- [**blocker**][**bug**][**library / SDK**] Cannot change password on Users - users [#138](https://github.com/lablup/backend.ai-console/issues/138)

---

## v19.08.3 (14/08/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Statistics panel [#80](https://github.com/lablup/backend.ai-console/issues/80)

---

## v19.08.2 (12/08/2019)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**] Optimize DOM parsing routines [#130](https://github.com/lablup/backend.ai-console/issues/130)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**] Debug flag in config [#128](https://github.com/lablup/backend.ai-console/issues/128)
- [**UI / UX**][**enhancement**][**library / SDK**] Scaling group support [#126](https://github.com/lablup/backend.ai-console/issues/126)
- [**UI / UX**][**enhancement**] UI update (19.07) [#89](https://github.com/lablup/backend.ai-console/issues/89)
- [**enhancement**][**hard**][**major**] Make active / deactivate codes as hierarchical module [#81](https://github.com/lablup/backend.ai-console/issues/81)
- [**enhancement**][**library / SDK**][**major**] Polite error message component [#76](https://github.com/lablup/backend.ai-console/issues/76)
- [**UI / UX**][**enhancement**][**hard**][**major**] Resource template menu [#52](https://github.com/lablup/backend.ai-console/issues/52)

#### Bug Fixes:

- [**UI / UX**][**bug**] Cannot allocate 1 CPU on advanced settings when 1 CPU is remained  [#132](https://github.com/lablup/backend.ai-console/issues/132)
- [**UI / UX**][**bug**][**invalid**] GPU allocation slider disabled when starting session [#125](https://github.com/lablup/backend.ai-console/issues/125)

---

## v19.08.1 (05/08/2019)

#### Enhancements:

- [**bug**][**enhancement**][**hard**][**library / SDK**][**major**] Reduce too much auto refreshing [#123](https://github.com/lablup/backend.ai-console/issues/123)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Delete file(s) feature [#117](https://github.com/lablup/backend.ai-console/issues/117)
- [**enhancement**] Divide session / api connection variable [#113](https://github.com/lablup/backend.ai-console/issues/113)
- [**UI / UX**][**enhancement**][**library / SDK**] Add resource preset button [#90](https://github.com/lablup/backend.ai-console/issues/90)

#### Bug Fixes:

- [**bug**][**hard**][**library / SDK**][**major**] resource_policy reading fails after login [#118](https://github.com/lablup/backend.ai-console/issues/118)
- [**bug**][**hard**] No session leads memory usage to infinite [#116](https://github.com/lablup/backend.ai-console/issues/116)

#### UI / UX:

- [**UI / UX**][**major**] Firm error message during proxy process [#120](https://github.com/lablup/backend.ai-console/issues/120)
- [**UI / UX**][**easy**][**minor**] Set newest kernel version as default [#119](https://github.com/lablup/backend.ai-console/issues/119)

#### Library / SDK:

- [**hard**][**library / SDK**][**major**] Logout button on app leads user to white blank screen [#110](https://github.com/lablup/backend.ai-console/issues/110)

---

## v19.07.2 (23/07/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**] Change ini to toml config [#114](https://github.com/lablup/backend.ai-console/issues/114)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Multiple choice / confirmation of session management [#102](https://github.com/lablup/backend.ai-console/issues/102)
- [**UI / UX**][**enhancement**] Feature/UI to change resource policy of keypair [#101](https://github.com/lablup/backend.ai-console/issues/101)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Permission change dialog for each folder [#100](https://github.com/lablup/backend.ai-console/issues/100)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Add storage sharing dialog to storage [#94](https://github.com/lablup/backend.ai-console/issues/94)
- [**enhancement**][**library / SDK**] SSL support on docker image [#92](https://github.com/lablup/backend.ai-console/issues/92)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Let maintenance buttons work [#91](https://github.com/lablup/backend.ai-console/issues/91)
- [**UI / UX**][**easy**][**enhancement**] Add intermediate state list on sessions [#88](https://github.com/lablup/backend.ai-console/issues/88)
- [**UI / UX**][**enhancement**][**library / SDK**] Add keypair with manual accessKey / secretKey [#87](https://github.com/lablup/backend.ai-console/issues/87)
- [**UI / UX**][**enhancement**][**library / SDK**] User information change support [#85](https://github.com/lablup/backend.ai-console/issues/85)
- [**enhancement**][**hard**][**library / SDK**] Compress Backend.AI ES6 SDK [#84](https://github.com/lablup/backend.ai-console/issues/84)
- [**bug**][**enhancement**] Robust login fail scenario [#83](https://github.com/lablup/backend.ai-console/issues/83)
- [**enhancement**][**hard**][**library / SDK**] Migrate build chain from polymer to rollup [#82](https://github.com/lablup/backend.ai-console/issues/82)
- [**easy**][**enhancement**] Message while login [#79](https://github.com/lablup/backend.ai-console/issues/79)
- [**UI / UX**][**enhancement**][**good first issue**][**minor**] Differentiate resource monitor UI on session view and summary view [#78](https://github.com/lablup/backend.ai-console/issues/78)
- [**enhancement**][**hard**][**working**] Support session login mode [#63](https://github.com/lablup/backend.ai-console/issues/63)

#### Bug Fixes:

- [**bug**][**minor**] Kernel without app spawns error [#112](https://github.com/lablup/backend.ai-console/issues/112)
- [**UI / UX**][**bug**][**easy**] Validation message is wrong for spacing [#98](https://github.com/lablup/backend.ai-console/issues/98)
- [**bug**][**hard**][**library / SDK**] Resource policy update not working [#97](https://github.com/lablup/backend.ai-console/issues/97)
- [**UI / UX**][**bug**] Weird login panel splashing [#96](https://github.com/lablup/backend.ai-console/issues/96)
- [**bug**][**library / SDK**][**major**] Reduce graphql calls  [#93](https://github.com/lablup/backend.ai-console/issues/93)

#### UI / UX:

- [**UI / UX**][**library / SDK**][**major**][**working**] Concurrency monitor on session [#65](https://github.com/lablup/backend.ai-console/issues/65)

---

## v19.07.0 (08/07/2019)
*No changelog for this release.*

---

## v19.07.1 (08/07/2019)

#### Enhancements:

- [**easy**][**enhancement**][**good first issue**] Add resource monitor / run button on summary [#77](https://github.com/lablup/backend.ai-console/issues/77)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Independent resource monitor / session launch for fluid session command location [#75](https://github.com/lablup/backend.ai-console/issues/75)
- [**Deploy**][**enhancement**][**hard**] Spring clean Javascript SDK [#18](https://github.com/lablup/backend.ai-console/issues/18)

---

## v19.06.1 (28/06/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**][**major**] Add virtual folder with different host [#72](https://github.com/lablup/backend.ai-console/issues/72)
- [**UI / UX**][**enhancement**] Unified snackbar implementation [#71](https://github.com/lablup/backend.ai-console/issues/71)
- [**enhancement**] Remove port dependency of wsproxy [#68](https://github.com/lablup/backend.ai-console/issues/68)
- [**enhancement**][**hard**] custom component migrations into lit-element [#45](https://github.com/lablup/backend.ai-console/issues/45)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Selectable vfolder host on folder creation [#43](https://github.com/lablup/backend.ai-console/issues/43)

#### Library / SDK:

- [**library / SDK**][**major**] ANSI support for logs [#73](https://github.com/lablup/backend.ai-console/issues/73)

---

## v19.06.0 (13/06/2019)

#### Enhancements:

- [**enhancement**][**library / SDK**] Force update service worker footage on index.html [#62](https://github.com/lablup/backend.ai-console/issues/62)
- [**UI / UX**][**easy**][**enhancement**] Embed fonts [#61](https://github.com/lablup/backend.ai-console/issues/61)
- [**enhancement**][**hard**][**library / SDK**][**major**] Versatile configuration for logo, spec., system, etc. [#60](https://github.com/lablup/backend.ai-console/issues/60)
- [**Deploy**][**UI / UX**][**enhancement**][**major**] Docker-compose for console / wsproxy pair [#59](https://github.com/lablup/backend.ai-console/issues/59)
- [**UI / UX**][**enhancement**][**hard**][**major**] UI update (1.4) [#55](https://github.com/lablup/backend.ai-console/issues/55)

---

## v19.03.5 (02/06/2019)
*No changelog for this release.*

---

## v19.03.4 (27/05/2019)
*No changelog for this release.*

---

## v19.03.3 (19/05/2019)

#### Enhancements:

- [**enhancement**][**good first issue**][**hard**] Dockerize for server side serving [#22](https://github.com/lablup/backend.ai-console/issues/22)

#### Library / SDK:

- [**Deploy**][**library / SDK**][**minor**] Match version with backend.ai [#57](https://github.com/lablup/backend.ai-console/issues/57)

---

## v19.03.1 (29/04/2019)

#### Enhancements:

- [**enhancement**] Remove node polyfill from ES6 library [#53](https://github.com/lablup/backend.ai-console/issues/53)
- [**enhancement**][**working**] Adopt Electron shell [#4](https://github.com/lablup/backend.ai-console/issues/4)

---

## v1.4.2 (26/04/2019)
*No changelog for this release.*

---

## v1.4.1 (24/04/2019)
*No changelog for this release.*

---

## v1.4.0 (23/04/2019)
*No changelog for this release.*

---

## v1.3.8 (14/04/2019)

#### Enhancements:

- [**enhancement**][**hard**] Resource monitor [#7](https://github.com/lablup/backend.ai-console/issues/7)
- [**enhancement**][**major**][**working**] Job/session control [#5](https://github.com/lablup/backend.ai-console/issues/5)

#### Bug Fixes:

- [**bug**][**invalid**] Error on vfolder deletion [#51](https://github.com/lablup/backend.ai-console/issues/51)

---

## v1.3.7 (12/04/2019)

#### Enhancements:

- [**enhancement**][**hard**] Generalize app launcher [#50](https://github.com/lablup/backend.ai-console/issues/50)
- [**enhancement**][**hard**] Integrate with Resource Policy [#32](https://github.com/lablup/backend.ai-console/issues/32)

---

## v1.3.6 (07/04/2019)

#### Bug Fixes:

- [**bug**] Wrong max. value of resource per user on session page [#49](https://github.com/lablup/backend.ai-console/issues/49)

---

## v1.3.4 (07/04/2019)

#### Enhancements:

- [**enhancement**] Default language / version for session start [#48](https://github.com/lablup/backend.ai-console/issues/48)
- [**enhancement**][**minor**] Indicator during data load [#38](https://github.com/lablup/backend.ai-console/issues/38)

---

## v1.2.16 (05/04/2019)

#### Enhancements:

- [**enhancement**][**hard**] New service worker loader [#44](https://github.com/lablup/backend.ai-console/issues/44)
- [**enhancement**] Configurable config.js for deploy sources [#42](https://github.com/lablup/backend.ai-console/issues/42)
- [**enhancement**][**hard**] Enable TensorBoard proxy [#40](https://github.com/lablup/backend.ai-console/issues/40)

#### Bug Fixes:

- [**bug**] Cannot change active keypair to inactive keypair [#47](https://github.com/lablup/backend.ai-console/issues/47)

---

## v1.2.2 (27/03/2019)

#### Enhancements:

- [**enhancement**][**hard**] Resource indicator for user session [#41](https://github.com/lablup/backend.ai-console/issues/41)

---

## v1.2.0 (21/03/2019)

#### Enhancements:

- [**enhancement**] Give SysAdmin to delete / log / restart others' sessions [#39](https://github.com/lablup/backend.ai-console/issues/39)

---

## v1.0.2 (08/03/2019)
*No changelog for this release.*

---

## v1.0.1 (05/03/2019)
*No changelog for this release.*

---

## v1.0.0 (04/03/2019)
*No changelog for this release.*

---

## v0.9.6 (21/02/2019)

#### Enhancements:

- [**enhancement**] Convert to lit-element [#35](https://github.com/lablup/backend.ai-console/issues/35)
- [**enhancement**] Show date/time in the file browser as KST [#33](https://github.com/lablup/backend.ai-console/issues/33)
- [**enhancement**][**hard**] Data management support [#16](https://github.com/lablup/backend.ai-console/issues/16)
- [**enhancement**] Data manipulation library [#15](https://github.com/lablup/backend.ai-console/issues/15)

#### Library / SDK:

- [**library / SDK**] Unify wsproxy into console [#36](https://github.com/lablup/backend.ai-console/issues/36)

---

## v0.9.5 (18/02/2019)

#### Enhancements:

- [**enhancement**] Dynamic resource indicator change [#24](https://github.com/lablup/backend.ai-console/issues/24)

#### Bug Fixes:

- [**bug**] Wrong CPU count [#31](https://github.com/lablup/backend.ai-console/issues/31)

---

## v0.9.0 (05/02/2019)

#### Enhancements:

- [**bug**][**enhancement**] Empty kernel selection in session start page [#23](https://github.com/lablup/backend.ai-console/issues/23)
- [**enhancement**] Multiple mount point when starting session [#21](https://github.com/lablup/backend.ai-console/issues/21)
- [**easy**][**enhancement**] Prevent modal close by clicking outside login dialog [#19](https://github.com/lablup/backend.ai-console/issues/19)
- [**enhancement**] Selectable mount virtual folder on session launch time [#17](https://github.com/lablup/backend.ai-console/issues/17)
- [**enhancement**] Load monitor on summary page [#14](https://github.com/lablup/backend.ai-console/issues/14)
- [**enhancement**] Basic user mode support [#11](https://github.com/lablup/backend.ai-console/issues/11)
- [**enhancement**][**hard**] Keypair management [#8](https://github.com/lablup/backend.ai-console/issues/8)

#### Bug Fixes:

- [**bug**] No notebook on pytorch kernels [#29](https://github.com/lablup/backend.ai-console/issues/29)
- [**bug**] Cannot press termination button on specific condition [#27](https://github.com/lablup/backend.ai-console/issues/27)
- [**bug**] version list grows as user visit jobs menu [#20](https://github.com/lablup/backend.ai-console/issues/20)
- [**bug**] routeData.view returns `Y:`  on windows electron [#12](https://github.com/lablup/backend.ai-console/issues/12)

---

## v0.7.0 (16/01/2019)

#### Enhancements:

- [**enhancement**] Strip out mistakenly added trailing slashes in the endpoint URL [#10](https://github.com/lablup/backend.ai-console/issues/10)
- [**enhancement**][**major**] Reduce autoqueries [#9](https://github.com/lablup/backend.ai-console/issues/9)
- [**enhancement**][**hard**] Job list query [#3](https://github.com/lablup/backend.ai-console/issues/3)

---

## v0.5.0 (01/12/2018)
*No changelog for this release.*

---

## v0.3.9 (24/11/2018)

#### Enhancements:

- [**enhancement**][**major**]  Login implementation [#6](https://github.com/lablup/backend.ai-console/issues/6)

---

## v0.2.1 (17/11/2018)
*No changelog for this release.*

---

## v0.2.0 (07/11/2018)

#### Enhancements:

- [**enhancement**][**major**] Add UI backbone frame [#2](https://github.com/lablup/backend.ai-console/issues/2)

---

## v0.1.1 (11/10/2018)

#### Enhancements:

- [**enhancement**] Initialization and testing [#1](https://github.com/lablup/backend.ai-console/issues/1)

---

## v0.1.0 (10/10/2018)
*No changelog for this release.*
