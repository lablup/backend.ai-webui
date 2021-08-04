# Changelog

## v21.03.8 (26/07/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Increase default resource limit [#1083](https://github.com/lablup/backend.ai-webui/issues/1083)
- [**UI / UX**][**library / SDK**][**cloud**][**major**][**localization**] Attach virtual folder with alias name [#1081](https://github.com/lablup/backend.ai-webui/issues/1081)

#### Bug Fixes:

- [**UI / UX**][**library / SDK**][**minor**][**blocker**][**urgency**] Decimal point fixing in resource slots [#1079](https://github.com/lablup/backend.ai-webui/issues/1079)


## v21.03.7 (19/07/2021)

#### Enhancements:

- [**UI / UX**][**easy**][**enhancement**][**good first issue**] Let's synchronize the speed of the progress bar and the current page of new session launcher. [#1073](https://github.com/lablup/backend.ai-webui/issues/1073)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**easy**][**good first issue**][**urgency**] Manual image doesn't get applied in a session creating process. [#1069](https://github.com/lablup/backend.ai-webui/issues/1069)
- [**UI / UX**][**bug**][**easy**][**good first issue**] clamping shared memory according to max shared memory value in config file doesn't work [#1063](https://github.com/lablup/backend.ai-webui/issues/1063)


## v21.03.6 (14/07/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**enterprise**][**minor**] Manual image name support without debug flag [#1052](https://github.com/lablup/backend.ai-webui/issues/1052)
- [**UI / UX**][**enhancement**][**minor**] Support longer host name for new virtual folder [#1049](https://github.com/lablup/backend.ai-webui/issues/1049)
- [**UI / UX**][**enhancement**][**localization**] Support French language [#1038](https://github.com/lablup/backend.ai-webui/issues/1038)
- [**enhancement**][**localization**] Support Russian language [#1037](https://github.com/lablup/backend.ai-webui/issues/1037)
- [**UI / UX**][**enhancement**][**enterprise**] More injection points for site-specific custom CSS [#1015](https://github.com/lablup/backend.ai-webui/issues/1015)
- [**UI / UX**][**enhancement**][**enterprise**][**major**] Prevent login trial for monitor (bot) user [#997](https://github.com/lablup/backend.ai-webui/issues/997)
- [**UI / UX**][**enhancement**][**working**] Apply carousel UI in current session-launcher [#915](https://github.com/lablup/backend.ai-webui/issues/915)

#### Bug Fixes:

- [**bug**] BackendAiSessionLauncher is duplicated declaration. [#1056](https://github.com/lablup/backend.ai-webui/issues/1056)
- [**bug**][**easy**] Waiting animation shows up when session cookies for login is empty [#1047](https://github.com/lablup/backend.ai-webui/issues/1047)
- [**UI / UX**][**bug**][**good first issue**] dropdown UI in modify permissions dialog in Data & Storage menu gets updated although it's not applied [#949](https://github.com/lablup/backend.ai-webui/issues/949)


## v21.03.5 (07/06/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Support for SCHEDULED session with conditional manager version [#1013](https://github.com/lablup/backend.ai-webui/issues/1013)
- [**UI / UX**][**enhancement**][**good first issue**] Modify top bar style [#1004](https://github.com/lablup/backend.ai-webui/issues/1004)

#### Bug Fixes:

- [**UI / UX**][**bug**][**good first issue**][**minor**] When user see login form, cloud icon has different style [#1011](https://github.com/lablup/backend.ai-webui/issues/1011)
- [**UI / UX**][**bug**][**good first issue**] Make available to see all icons of custom environments [#1001](https://github.com/lablup/backend.ai-webui/issues/1001)

#### UI / UX:

- [**UI / UX**][**easy**][**good first issue**] the password masking on "Add registry" dialog is triangle. change to the circle one. [#993](https://github.com/lablup/backend.ai-webui/issues/993)


## v21.03.4 (17/05/2021)

#### Enhancements:

- [**enhancement**][**minor**] Display SCHEDULED session status [#977](https://github.com/lablup/backend.ai-webui/issues/977)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Support force terminating 'PREPARING', 'TERMINATING' and 'PENDING' session on GUI [#948](https://github.com/lablup/backend.ai-webui/issues/948)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] Language of "Project" on top bar does not live change [#1003](https://github.com/lablup/backend.ai-webui/issues/1003)
- [**UI / UX**][**blocker**][**bug**][**minor**] Session list is not refreshing at the first visit [#1002](https://github.com/lablup/backend.ai-webui/issues/1002)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Environment dropdown overlaps when there are more than eight options. [#999](https://github.com/lablup/backend.ai-webui/issues/999)
- [**UI / UX**][**bug**][**easy**][**good first issue**] login panel height gets jagged when the user inputs invalid account. [#995](https://github.com/lablup/backend.ai-webui/issues/995)
- [**UI / UX**][**blocker**][**bug**][**enterprise**][**library / SDK**][**major**] Reduce folder refresh calls to keep user query limit [#990](https://github.com/lablup/backend.ai-webui/issues/990)
- [**UI / UX**][**bug**][**good first issue**] the Web Terminal guide dialog is not changed according to the window size [#988](https://github.com/lablup/backend.ai-webui/issues/988)
- [**UI / UX**][**bug**][**good first issue**] not being able to check the contents of the right end of the screen when writing contents beyond the screen width. [#983](https://github.com/lablup/backend.ai-webui/issues/983)
- [**bug**][**easy**][**minor**] we cannot enable auto logout feature in Backend.AI Cloud [#978](https://github.com/lablup/backend.ai-webui/issues/978)
- [**UI / UX**][**bug**][**library / SDK**][**urgency**] creation new resource group is failed [#975](https://github.com/lablup/backend.ai-webui/issues/975)
- [**blocker**][**bug**][**urgency**] 500 error during session creation [#968](https://github.com/lablup/backend.ai-webui/issues/968)
- [**bug**][**easy**][**good first issue**] Learn more link in Web terminal guide is broken. [#961](https://github.com/lablup/backend.ai-webui/issues/961)
- [**UI / UX**][**bug**][**easy**][**good first issue**] update operation in username does not reflect. [#957](https://github.com/lablup/backend.ai-webui/issues/957)

#### UI / UX:

- [**UI / UX**][**good first issue**] Default icon for non-recognized service apps [#985](https://github.com/lablup/backend.ai-webui/issues/985)


## v21.03.3 (30/04/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**good first issue**] the text in the total resource quota is broken. [#963](https://github.com/lablup/backend.ai-webui/issues/963)
- [**enhancement**][**library / SDK**][**minor**][**need confirmation**] Share a group folder directly with overriding permission [#956](https://github.com/lablup/backend.ai-webui/issues/956)
- [**enhancement**] Spring cleanup [#940](https://github.com/lablup/backend.ai-webui/issues/940)
- [**UI / UX**][**enhancement**] Provide cloning Vfolder feature [#899](https://github.com/lablup/backend.ai-webui/issues/899)
- [**UI / UX**][**enhancement**] Provide total resource allocation explicitly in session launcher [#891](https://github.com/lablup/backend.ai-webui/issues/891)
- [**UI / UX**][**enhancement**][**library / SDK**][**urgency**] Enable Tensorboard path [#680](https://github.com/lablup/backend.ai-webui/issues/680)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**easy**] Cannot update decimal points in FGPU input field of resource policy. [#971](https://github.com/lablup/backend.ai-webui/issues/971)
- [**UI / UX**][**bug**][**easy**][**good first issue**] Sometimes the invitation card and the button inside it overlap. [#950](https://github.com/lablup/backend.ai-webui/issues/950)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Inhibit deleting Folders mounted in one or more sessions. [#921](https://github.com/lablup/backend.ai-webui/issues/921)


## v21.03.2 (02/04/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Disable (non-working) app / terminal button when admin lists other users' session list [#945](https://github.com/lablup/backend.ai-webui/issues/945)
- [**app**][**enhancement**][**major**] Support Apple Silicon macs [#942](https://github.com/lablup/backend.ai-webui/issues/942)
- [**enhancement**][**good first issue**][**minor**] Let users to change .vimrc and .tmux.conf for better customizability [#935](https://github.com/lablup/backend.ai-webui/issues/935)

#### Bug Fixes:

- [**UI / UX**][**bug**][**maintenance**][**minor**] It looks like the domain administrator can create the keypair resource policy, but it doesn't actually do it. [#946](https://github.com/lablup/backend.ai-webui/issues/946)


## v21.03.1 (24/03/2021)

#### Enhancements:

- [**UI / UX**][**enhancement**][**enterprise**][**minor**] Easier custom logo for login screen [#941](https://github.com/lablup/backend.ai-webui/issues/941)
- [**UI / UX**][**app**][**cloud**][**enhancement**][**enterprise**][**minor**] Support Apache Spark image [#932](https://github.com/lablup/backend.ai-webui/issues/932)
- [**UI / UX**][**app**][**enhancement**] Move app window position before login to system [#925](https://github.com/lablup/backend.ai-webui/issues/925)

#### Bug Fixes:

- [**bug**] R container images are not displayed properly on environment list [#938](https://github.com/lablup/backend.ai-webui/issues/938)
- [**bug**] GPU slider in session launch dialog is always fixed as zero when discrete mode is enabled [#937](https://github.com/lablup/backend.ai-webui/issues/937)
- [**bug**][**major**] Unable to login when localStorage items exceeds size limit [#928](https://github.com/lablup/backend.ai-webui/issues/928)
- [**bug**] Proxy is not working on desktop app from Electron 12 [#923](https://github.com/lablup/backend.ai-webui/issues/923)


## v21.03.0 (08/03/2021)

#### Enhancements:

- [**easy**][**enhancement**][**good first issue**][**urgency**] Let's rename Backend.AI GUI console to Backend.AI Web UI [#919](https://github.com/lablup/backend.ai-webui/issues/919)

#### Bug Fixes:

- [**UI / UX**][**bug**][**good first issue**][**urgency**] Let's fix the floating point in shared memory value of resource preset [#917](https://github.com/lablup/backend.ai-webui/issues/917)


## v21.02.3 (22/02/2021)

#### Enhancements:

- [**enhancement**] R studio support [#916](https://github.com/lablup/backend.ai-console/issues/916)
- [**enhancement**] Swift For TensorFlow support [#916](https://github.com/lablup/backend.ai-console/issues/916)
- [**enhancement**] FluxML support [#916](https://github.com/lablup/backend.ai-console/issues/916)

## v21.02.2 (17/02/2021)

#### Enhancements:

- [**enhancement**] Update Julia with Flux.ji support for scientific computing [#913](https://github.com/lablup/backend.ai-console/issues/913)
- [**UI / UX**][**enhancement**][**minor**] Support Swift language [#912](https://github.com/lablup/backend.ai-console/issues/912)
- [**enhancement**] Adopt runtime environment parameter / argument feature [#910](https://github.com/lablup/backend.ai-console/issues/910)
- [**UI / UX**][**enhancement**][**good first issue**] Filter for storage folders  [#909](https://github.com/lablup/backend.ai-console/issues/909)
- [**UI / UX**][**enhancement**] Let's provide leaving the invited folder. [#907](https://github.com/lablup/backend.ai-console/issues/907)
- [**UI / UX**][**enhancement**][**minor**] Support Swift for TensorFlow environment [#904](https://github.com/lablup/backend.ai-console/issues/904)
- [**UI / UX**][**enhancement**] Let's show an alert message when user rename the file including file extension in the Vfolder. [#803](https://github.com/lablup/backend.ai-console/issues/803)
- [**UI / UX**][**enhancement**][**library / SDK**] Storage resource tab on computation resources [#336](https://github.com/lablup/backend.ai-console/issues/336)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**major**] Queue file deletion [#572](https://github.com/lablup/backend.ai-console/issues/572)


## v21.02.1 (03/02/2021)

#### Enhancements:

- [**enhancement**] Provide environment configuration on session launcher [#902](https://github.com/lablup/backend.ai-console/issues/902)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Adopt background task id [#898](https://github.com/lablup/backend.ai-console/issues/898)
- [**enhancement**][**library / SDK**][**minor**] Change perSession scheme to perContainer [#889](https://github.com/lablup/backend.ai-console/issues/889)
- [**UI / UX**][**enhancement**][**minor**] Let's support folder upload in vfolder [#885](https://github.com/lablup/backend.ai-console/issues/885)
- [**enhancement**][**library / SDK**][**major**] add maxCUDASharesPerContainer to limit fGPU slice size [#788](https://github.com/lablup/backend.ai-console/issues/788)
-

## v21.02.0 (03/02/2021)

#### Enhancements:

- [**enhancement**] Provide environment configuration on session launcher [#902](https://github.com/lablup/backend.ai-console/issues/902)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Adopt background task id [#898](https://github.com/lablup/backend.ai-console/issues/898)
- [**enhancement**][**library / SDK**][**minor**] Change perSession scheme to perContainer [#889](https://github.com/lablup/backend.ai-console/issues/889)
- [**UI / UX**][**enhancement**][**minor**] Let's support folder upload in vfolder [#885](https://github.com/lablup/backend.ai-console/issues/885)


## v21.01.1 (07/01/2021)

#### Enhancements:

- [**enhancement**][**enterprise**][**library / SDK**][**minor**] Query waiting margin to session list / node list [#886](https://github.com/lablup/backend.ai-console/issues/886)

#### Bug Fixes:

- [**bug**] Unable to explore virtual folder in data & storage page [#888](https://github.com/lablup/backend.ai-console/issues/888)
- [**bug**][**invalid**] Image downloading tag disappears when the user redirects to other pages and come back. [#757](https://github.com/lablup/backend.ai-console/issues/757)
- [**bug**] Increase compatibility with Backend.AI 20.03 [#887](https://github.com/lablup/backend.ai-console/pull/887)
- [**UI / UX**][**bugfix**] Hide storage proxy features on Backend.AI 20.03/APIv5 (#869)


## v21.01.0 (04/01/2021)

#### Bug Fixes:

- [**UI / UX**][**bugfix**] Rearrange layout (#883)


## v20.12.6 (30/12/2020)

#### Bug Fixes:

- [**UI / UX**][**blocker**][**bug**][**urgency**] Value and the maximum value of shared memory in session launcher does not updated by selected resource preset [#880](https://github.com/lablup/backend.ai-console/issues/880)


## v20.12.5 (29/12/2020)

#### Enhancements:

- [**UI / UX**][**cloud**][**enhancement**][**enterprise**][**library / SDK**][**minor**] Option to change kernel to use import feature [#876](https://github.com/lablup/backend.ai-console/issues/876)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] User setting button / help button is missing when mini sidebar is enabled. [#878](https://github.com/lablup/backend.ai-console/issues/878)
- [**bug**][**urgency**] Directory is displays as a normal file in vfolder explorer on vfolder host of purestorage type [#874](https://github.com/lablup/backend.ai-console/issues/874)


## v20.12.4 (27/12/2020)

#### Enhancements:

- [**UI / UX**][**app**][**cloud**][**enhancement**][**enterprise**][**major**] App category support [#872](https://github.com/lablup/backend.ai-console/issues/872)


## v20.12.3 (25/12/2020)

#### Bug Fixes:

- [**UI / UX**][**bug**] Update virtual folder naming validation pattern [#873](https://github.com/lablup/backend.ai-console/issues/873)


## v20.12.2 (23/12/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**] Support hardware metadata queries [#869](https://github.com/lablup/backend.ai-console/issues/869)
- [**UI / UX**][**enhancement**][**enterprise**][**library / SDK**] Set fractional GPU to multiple of integer when using multi-node / multi-container [#868](https://github.com/lablup/backend.ai-console/issues/868)
- [**UI / UX**][**enhancement**][**minor**] Session creation UI should allow manual input of image reference [#825](https://github.com/lablup/backend.ai-console/issues/825)
- [**UI / UX**][**enhancement**] Resource usage gauge per session [#771](https://github.com/lablup/backend.ai-console/issues/771)
- [**UI / UX**][**easy**][**enhancement**][**minor**] Limit maximum height of statistics graph [#703](https://github.com/lablup/backend.ai-console/issues/703)


## v20.12.1 (18/12/2020)

#### Enhancements:

- [**UI / UX**][**minor**] Set default auto logout to false [#851](https://github.com/lablup/backend.ai-console/issues/851)
- [**UI / UX**][**enhancement**][**enterprise**][**minor**] System setting for auto logout enable / disable feature [#865](https://github.com/lablup/backend.ai-console/issues/865)


## v20.12.0 (18/12/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Let's show current invited vfolders and created vfolders. [#858](https://github.com/lablup/backend.ai-console/issues/858)
- [**enhancement**] Support harbor v2 [#856](https://github.com/lablup/backend.ai-console/issues/856)
- [**blocker**][**enhancement**][**urgency**] Let's show a warning and confirmation dialog if the user tries to re-upload same file at same directory in Vfolder [#836](https://github.com/lablup/backend.ai-console/issues/836)
- [**UI / UX**][**blocker**][**easy**][**enhancement**][**urgency**] Let's initialize those adding / deleting input fields after applying or closing the dialog. [#835](https://github.com/lablup/backend.ai-console/issues/835)
- [**UI / UX**][**blocker**][**enhancement**][**urgency**] When the value of input exceeds the maximum, let's automatically apply each check box to be checked (unlimited) in the Create/Modify Resource Policy dialog. [#834](https://github.com/lablup/backend.ai-console/issues/834)
- [**UI / UX**][**blocker**][**enhancement**][**urgency**] Let's limit all the input field to prevent from malicious input [#832](https://github.com/lablup/backend.ai-console/issues/832)
- [**bug**][**enhancement**][**minor**] Option to change upload file size [#830](https://github.com/lablup/backend.ai-console/issues/830)
- [**app**][**blocker**][**bug**][**enhancement**][**major**] Stablize websocket proxy connection with proxy node health check [#828](https://github.com/lablup/backend.ai-console/issues/828)
- [**enhancement**] Inactive user list / control panel for superadmin [#826](https://github.com/lablup/backend.ai-console/issues/826)
- [**UI / UX**][**blocker**][**enhancement**][**urgency**] Let's hide per week option in the statistics for the users that assigned less than a week. [#812](https://github.com/lablup/backend.ai-console/issues/812)
- [**UI / UX**][**enhancement**][**minor**] Change dialog element to handle long list [#792](https://github.com/lablup/backend.ai-console/issues/792)
- [**enhancement**] Configurable max cores, devices, and shared memory per session [#788](https://github.com/lablup/backend.ai-console/issues/788)
- [**UI / UX**][**enhancement**] Provide responsive design for Backend.AI GUI console [#786](https://github.com/lablup/backend.ai-console/issues/786)
- [**UI / UX**][**cloud**][**enhancement**][**major**] Force service worker update without waiting for 24 hours [#765](https://github.com/lablup/backend.ai-console/issues/765)
- [**UI / UX**][**enhancement**][**enterprise**][**hard**][**library / SDK**][**major**] Support multi-node multi-GPU on GUI [#710](https://github.com/lablup/backend.ai-console/issues/710)
- [**UI / UX**][**enhancement**] Reimplement editor for TF.js [#649](https://github.com/lablup/backend.ai-console/issues/649)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Migrate TF.js test module for statistics insight model [#648](https://github.com/lablup/backend.ai-console/issues/648)
- [**enhancement**][**library / SDK**][**major**] Match node.js SDK naming schema with python SDK [#604](https://github.com/lablup/backend.ai-console/issues/604)
- [**UI / UX**][**enhancement**][**library / SDK**] Manage inactive users in console [#557](https://github.com/lablup/backend.ai-console/issues/557)
- [**enhancement**][**library / SDK**][**major**] Adopt V5 API specification [#515](https://github.com/lablup/backend.ai-console/issues/515)
- [**UI / UX**][**enhancement**][**library / SDK**] Plugin architecture for menus [#315](https://github.com/lablup/backend.ai-console/issues/315)
- [**enhancement**][**library / SDK**] Modular structure to make child projects [#285](https://github.com/lablup/backend.ai-console/issues/285)

#### Bug Fixes:

- [**UI / UX**][**bug**] User cannot login due to previous session cookie [#860](https://github.com/lablup/backend.ai-console/issues/860)
- [**UI / UX**][**blocker**][**bug**][**easy**][**urgency**] sometimes some charts in Statistics breaks the layout [#849](https://github.com/lablup/backend.ai-console/issues/849)
- [**bug**] Default Language in the user settings page not working [#840](https://github.com/lablup/backend.ai-console/issues/840)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Let's make user information update operation applied right after completion [#839](https://github.com/lablup/backend.ai-console/issues/839)
- [**UI / UX**][**blocker**][**bug**][**easy**][**urgency**] Description of each user shows same after changing. [#833](https://github.com/lablup/backend.ai-console/issues/833)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Let's allow vfolder renaming option only for the owner of the folder. [#822](https://github.com/lablup/backend.ai-console/issues/822)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Sometimes mouse click doesn't work after clicking exporting csv menu. [#815](https://github.com/lablup/backend.ai-console/issues/815)
- [**UI / UX**][**blocker**][**bug**][**easy**][**good first issue**] Let's delete unnecessary warning message at csv exporting dialog in the session list [#814](https://github.com/lablup/backend.ai-console/issues/814)
- [**UI / UX**][**blocker**][**bug**][**easy**][**urgency**] Control panel should support scrollbar when the screen width is narrow. [#813](https://github.com/lablup/backend.ai-console/issues/813)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Resource Group and resource statistics don't sync each other. [#811](https://github.com/lablup/backend.ai-console/issues/811)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Let's disable file dropzone when the permission of the Vfolder is read-only [#810](https://github.com/lablup/backend.ai-console/issues/810)
- [**blocker**][**bug**][**urgency**] GPU resource in the session launcher value doesn't get changed. [#809](https://github.com/lablup/backend.ai-console/issues/809)
- [**UI / UX**][**blocker**][**bug**][**urgency**] Vfolder selection in session launcher dialog doesn't get initialized after session creation completed. [#807](https://github.com/lablup/backend.ai-console/issues/807)
- [**UI / UX**][**blocker**][**bug**][**urgency**] enable file operation in group type Vfolder for admin and super-admin user only. [#804](https://github.com/lablup/backend.ai-console/issues/804)
- [**blocker**][**bug**][**urgency**] Updated resource policy assigned to user doesn't applied immediately in the session launcher. [#799](https://github.com/lablup/backend.ai-console/issues/799)
- [**blocker**][**bug**][**urgency**] Keypair can be created even though the user not exists. [#798](https://github.com/lablup/backend.ai-console/issues/798)
- [**blocker**][**bug**][**urgency**] User detail doesn't change after modification. [#797](https://github.com/lablup/backend.ai-console/issues/797)
- [**UI / UX**][**bug**][**easy**] Resource Policy name in modification should be disabled. [#789](https://github.com/lablup/backend.ai-console/issues/789)
- [**UI / UX**][**bug**][**minor**] some administration pages is accessible to every user [#769](https://github.com/lablup/backend.ai-console/issues/769)
- [**UI / UX**][**bug**][**minor**] No error messages when session creation failed due to insufficient resources [#678](https://github.com/lablup/backend.ai-console/issues/678)

#### UI / UX:

- [**UI / UX**][**minor**] Make session launch dialog not close by clicking outside [#842](https://github.com/lablup/backend.ai-console/issues/842)
- [**UI / UX**][**good first issue**][**library / SDK**] Add user name registration / modification UI [#693](https://github.com/lablup/backend.ai-console/issues/693)


## v20.11.2 / v20.11.3 (16/11/2020)

#### Enhancements:

- [**enhancement**] Limit login trial number [#783](https://github.com/lablup/backend.ai-console/issues/783)
- [**UI / UX**][**bug**][**enhancement**][**library / SDK**][**major**] Retry manager connection while some requests are failed [#778](https://github.com/lablup/backend.ai-console/issues/778)
- [**UI / UX**][**enhancement**][**hard**][**library / SDK**][**major**] Simple webcomponent to use / test TensorFlow.js [#668](https://github.com/lablup/backend.ai-console/issues/668)

#### Bug Fixes:

- [**UI / UX**][**bug**][**urgency**] Prevent folder creation/file upload from only read permission [#777](https://github.com/lablup/backend.ai-console/issues/777)
- [**UI / UX**][**bug**][**invalid**] Vfolder creation/updating/deletion operation should be fixed. [#776](https://github.com/lablup/backend.ai-console/issues/776)
- [**UI / UX**][**bug**][**invalid**] Vfolder invitation in the summary page shows up only after redirected to the summary page more than once. [#761](https://github.com/lablup/backend.ai-console/issues/761)
- [**blocker**][**bug**] When session failed to start, App selection dialog still appears. [#758](https://github.com/lablup/backend.ai-console/issues/758)
 - [**bugfix**][**minor**][**UI / UX**] Project dropdown in top-app-bar overlaps when value is longer than the width of the element. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Mini-ui should show every menu title as an tooltip in the navigation sidebar when hovering to the each menu. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Footer in the navigation sidebar should be located in to bottom. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Language Select buttons in the terms-of-services and privacy policy dialog should be converted to dropdown. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Enable the sign-out feature*. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Change password request in login panel throws error. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Agreement for terms-of-services and privacy policy should support language translation. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Limit the number of login attempts. (e.g. disable login If login fails more than 5 times in a row.) [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Change hyper reference link in Maintain Keypairs button to the proper page in Summary page. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Access key in the session list looks like as if is covered by the panel inside. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Notebook Badge code area should be Read-Only field. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Support Copying to the clipboard when user clicks notebook badge code area. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] In each width email input field in vfolder sharing invitation at Data & Storage page should be same. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Permission selection in the permission settings dialog in the Data & Storage page overlaps in the grid row. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Input area in Current Public key shows "null" literally. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Hide Beta Feature description and toggle button in the usersettings page if there's no beta feature is available. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Shell environment title in the usersettings page doesn't change when language is changed. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] The label of dropdown in shell script configuration dialog should support multi-language translation. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Active user text is redundantly duplicated in the Keypair resource policy modification dialog at Users page. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Allowed host selection dropdown width is too narrow to recognize the values inside. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Modify App dialog should alert after adding/deleting app information in case of user mistakes. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Delete button in image list at environments page should be hidden since it's not implemented yet. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Some of resource presets in modification resource preset dialog should support multi-language. (e.g. Korean) [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Hide disabled buttons in the control panel at Resources page If related features are not available. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] **[Admin/Superadmin Only]** Hide cleanup images button with title and description in the Image / Environment panel at Maintenance page If the feature is not available. [#782](https://github.com/lablup/backend.ai-console/issues/782)
 - [**bugfix**][**minor**][**UI / UX**] Show proper help page for usersettings when the user clicks help button at the usersettings page. [#782](https://github.com/lablup/backend.ai-console/issues/782)

#### UI / UX:

- [**UI / UX**][**easy**] Apply loading indicator in the login process. [#760](https://github.com/lablup/backend.ai-console/issues/760)


## v20.11.1 (02/11/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**enterprise**][**library / SDK**][**major**] GPU/ASIC usage gauge per node [#766](https://github.com/lablup/backend.ai-console/issues/766)

#### Bug Fixes:

- [**bug**] verifying email and changing password page doesn't show anything on the page. [#767](https://github.com/lablup/backend.ai-console/issues/767)

## v20.11.0 (01/11/2020)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**][**major**] Invitation token page is not showing [#764](https://github.com/lablup/backend.ai-console/issues/764)


## v20.10.1 (30/10/2020)

#### Enhancements:

- [**enhancement**][**library / SDK**][**minor**] Prevent console from automatic login to unreachable manager [#762](https://github.com/lablup/backend.ai-console/issues/762)

#### UI / UX:

- [**UI / UX**][**need confirmation**] requested UI updates [#750](https://github.com/lablup/backend.ai-console/issues/750)


## v20.10.0 (23/10/2020)

#### Enhancements:

- [**UI / UX**][**easy**][**enhancement**][**minor**] Implicitly let user know when no folder exists on session launcher [#753](https://github.com/lablup/backend.ai-console/issues/753)
- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Change ownership delegation component on session launcher to mwc-select [#731](https://github.com/lablup/backend.ai-console/issues/731)
- [**UI / UX**][**enhancement**][**enterprise**][**library / SDK**][**major**] UI update (20.10) [#729](https://github.com/lablup/backend.ai-console/issues/729)
- [**UI / UX**][**enhancement**][**minor**] Validate app labels of images before saving [#715](https://github.com/lablup/backend.ai-console/issues/715)

#### Bug Fixes:

- [**UI / UX**][**bug**][**library / SDK**][**major**] Resource group deletion doesn't get reflected to the table of resource groups tab in the Resources page. [#743](https://github.com/lablup/backend.ai-console/issues/743)
- [**blocker**][**bug**] Minor errors occur in Environments page. [#742](https://github.com/lablup/backend.ai-console/issues/742)
- [**blocker**][**bug**] Cannot create user in the users page. [#741](https://github.com/lablup/backend.ai-console/issues/741)
- [**blocker**][**bug**] Minor errors occur in the creating folder dialog from Data & Storage page. [#740](https://github.com/lablup/backend.ai-console/issues/740)
- [**UI / UX**][**bug**][**library / SDK**][**major**] exporting CSV in Sessions page doesn't work. [#739](https://github.com/lablup/backend.ai-console/issues/739)
- [**UI / UX**][**bug**][**easy**] When clicking Backend.AI Logo in the drawer, nothing happens. [#738](https://github.com/lablup/backend.ai-console/issues/738)
- [**bug**] icons in drawer and some panel don't show up in the new UI. [#736](https://github.com/lablup/backend.ai-console/issues/736)
- [**UI / UX**][**bug**][**easy**] Image rescan/Recalculate usage button throws an error. [#734](https://github.com/lablup/backend.ai-console/issues/734)
- [**UI / UX**][**bug**] Image download dialog appears every time the checkbox is clicked [#725](https://github.com/lablup/backend.ai-console/issues/725)

#### UI / UX:

- [**UI / UX**][**easy**][**good first issue**] Language Setting dropdown overlaps SSH Keypair text [#719](https://github.com/lablup/backend.ai-console/issues/719)


## v20.09.2 (28/09/2020)


#### Bug Fixes:

- [**bug**][**easy**][**minor**] Extend current request timeout in session creation [#722](https://github.com/lablup/backend.ai-console/issues/722)
- [**UI / UX**][**bug**] Multiple clicks cause duplicated directory path [#717](https://github.com/lablup/backend.ai-console/issues/717)


## v20.09.1 (22/09/2020)

#### Enhancements:

- [**UI / UX**][**blocker**][**bug**] Local proxy is not working on the app mode with Backend.AI 20.09 alpha [#720](https://github.com/lablup/backend.ai-console/issues/720)
- [**UI / UX**][**bug**][**easy**][**good first issue**] Usage shows [Object Object] on finished tab of session list [#685](https://github.com/lablup/backend.ai-console/issues/685)


## v20.09.0 (18/09/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**] Provide help about 'copying text from terminal' [#698](https://github.com/lablup/backend.ai-console/issues/698)
- [**UI / UX**][**enhancement**][**good first issue**] Update manual to explain 'SSH Keypair change' menu [#695](https://github.com/lablup/backend.ai-console/issues/695)
- [**UI / UX**][**bug**][**enhancement**][**good first issue**][**minor**] Disable turn off button on finished session list [#686](https://github.com/lablup/backend.ai-console/issues/686)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Refactor storage selection on session launch [#662](https://github.com/lablup/backend.ai-console/issues/662)
- [**UI / UX**][**enhancement**][**minor**] Skip rendering paths to increase speed [#661](https://github.com/lablup/backend.ai-console/issues/661)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Migrate compute_session from v4 to v5 [#651](https://github.com/lablup/backend.ai-console/issues/651)
- [**enhancement**][**maintenance**] Change default branch from master to main [#637](https://github.com/lablup/backend.ai-console/issues/637)
- [**UI / UX**][**enhancement**][**minor**] Show mounted folder information on session list [#628](https://github.com/lablup/backend.ai-console/issues/628)
- [**enhancement**] Add comments on source code [#402](https://github.com/lablup/backend.ai-console/issues/402)
- [**UI / UX**][**enhancement**][**minor**] Support NNI [#207](https://github.com/lablup/backend.ai-console/issues/207)

#### Bug Fixes:

- [**UI / UX**][**bug**][**good first issue**] Dropdown menu is positioned incorrectly [#707](https://github.com/lablup/backend.ai-console/issues/707)
- [**bug**] Login Information mismatch error, when build&run console-server in local environment [#700](https://github.com/lablup/backend.ai-console/issues/700)
- [**bug**][**minor**] Error logs are not displayed [#689](https://github.com/lablup/backend.ai-console/issues/689)
- [**bug**][**major**] Session's app cannot be accessed if there are multiple sessions with the same name prefix [#687](https://github.com/lablup/backend.ai-console/issues/687)
- [**UI / UX**][**bug**] Incorrect image downloaded after filtered by keywords [#679](https://github.com/lablup/backend.ai-console/issues/679)
- [**UI / UX**][**bug**][**easy**] Fix resource preset dialog validation [#672](https://github.com/lablup/backend.ai-console/issues/672)
- [**bug**][**urgency**] Unable to create a session due to vfolder-related issue [#670](https://github.com/lablup/backend.ai-console/issues/670)
- [**UI / UX**][**blocker**][**bug**][**cloud**][**minor**] Wrong password condition error message on signup [#663](https://github.com/lablup/backend.ai-console/issues/663)
- [**UI / UX**][**blocker**][**bug**] Sometimes GitHub notebook import does not work [#660](https://github.com/lablup/backend.ai-console/issues/660)
- [**UI / UX**][**bug**] After terminating a session, resource occupation is not updated [#639](https://github.com/lablup/backend.ai-console/issues/639)
- [**UI / UX**][**bug**][**easy**] Although user inputs invalid session name, session creating dialog get closed. [#638](https://github.com/lablup/backend.ai-console/issues/638)

#### UI / UX:

- [**UI / UX**][**easy**][**good first issue**][**minor**] Change 'About' to 'About Backend.AI' [#694](https://github.com/lablup/backend.ai-console/issues/694)
- [**UI / UX**][**minor**] No error messages when kernel creation request has error response [#691](https://github.com/lablup/backend.ai-console/issues/691)
- [**UI / UX**][**good first issue**][**minor**] Fix layout overlap in Start new session dialog [#676](https://github.com/lablup/backend.ai-console/issues/676)
- [**UI / UX**][**easy**] Apply toggle visibility in password input field [#665](https://github.com/lablup/backend.ai-console/issues/665)
- [**UI / UX**] Add UI to specify SSH Keypair by user [#657](https://github.com/lablup/backend.ai-console/issues/657)
- [**UI / UX**] Neater message when vfolder invitation is duplicated [#653](https://github.com/lablup/backend.ai-console/issues/653)


## v20.08.0 (04/08/2020)

#### Bug Fixes:

- [**bug**][**UI / UX**] After terminating a session, resource occupation is not updated [#639](https://github.com/lablup/backend.ai-console/issues/639)
- [**bug**] In a session log dialog, error message is raised when user clicks refresh log button [#640](https://github.com/lablup/backend.ai-console/issues/640)


## v20.07.9 (31/07/2020)

#### Bug Fixes:

- [**bug**][**easy**][**minor**] Cannot create resource preset with proper mem/shmem values [#626](https://github.com/lablup/backend.ai-console/issues/626)

#### UI / UX:

- [**UI / UX**][**minor**] Change minimum fractional GPU step from 0.05 to 0.01 [#629](https://github.com/lablup/backend.ai-console/issues/629)
- [**UI / UX**][**cloud**][**minor**] Show explicit message when user's account is inactive state [#593](https://github.com/lablup/backend.ai-console/issues/593)


## v20.07.8 (23/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**enterprise**][**library / SDK**][**major**] License information viewer [#623](https://github.com/lablup/backend.ai-console/issues/623)
- [**enhancement**][**urgency**] Add feature to search and/or filter user and keypair by fields such as email, username, etc [#618](https://github.com/lablup/backend.ai-console/issues/618)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Migrate d3.js charts into chart.js [#607](https://github.com/lablup/backend.ai-console/issues/607)


## v20.07.7 (23/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Migrate repository notebook into cluster [#599](https://github.com/lablup/backend.ai-console/issues/599)

#### Bug Fixes:

- [**bug**][**library / SDK**][**major**][**urgency**] User and keypair page displays only 100 users/keypairs in >20.03 manager [#617](https://github.com/lablup/backend.ai-console/issues/617)


## v20.07.6 (20/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Project color in pull-down menu on top-right corner becomes white when selected [#614](https://github.com/lablup/backend.ai-console/issues/614)
- [**UI / UX**][**blocker**][**easy**][**enhancement**] Problems that do not support password autocomplete in web browsers [#613](https://github.com/lablup/backend.ai-console/issues/613)
- [**UI / UX**][**enhancement**][**library / SDK**] Add edit feature of .Renviron file in home directory [#608](https://github.com/lablup/backend.ai-console/issues/608)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**][**major**] 502 error found when launching app with Backend.AI 20.03 / Enterprise R2 beta [#601](https://github.com/lablup/backend.ai-console/issues/601)


## v20.07.5 (09/07/2020)

#### Bug Fixes:

- [**blocker**][**bug**][**library / SDK**][**major**] 502 error found when launching app with Backend.AI 20.03 / Enterprise R2 beta [#601](https://github.com/lablup/backend.ai-console/issues/601)


## v20.07.4 (06/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**] Set environment name with tags [#598](https://github.com/lablup/backend.ai-console/issues/598)


## v20.07.3 (06/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**major**][**hard**] Stabilize the resource broker with refactoring [#596](https://github.com/lablup/backend.ai-console/issues/596)


## v20.07.2 (03/07/2020)

#### Bug Fixes:

- [**bug**][**cloud**][**easy**] Error on re-send signup verification email [#595](https://github.com/lablup/backend.ai-console/issues/595)


## v20.07.1 (03/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**library / SDK**][**minor**] Show agent version on resource pane to check upgradable agents [#590](https://github.com/lablup/backend.ai-console/issues/590)

#### Bug Fixes:

- [**blocker**][**bug**][**major**] Cannot see templates / assign resource without GPU [#591](https://github.com/lablup/backend.ai-console/issues/591)


## v20.07.0 (02/07/2020)

#### Enhancements:

- [**UI / UX**][**enhancement**][**minor**] Migrate legacy dialogs to backend.ai dialog for unified look and feel [#584](https://github.com/lablup/backend.ai-console/issues/584)
- [**UI / UX**][**enhancement**][**minor**] Open notification when no virtual folder is attached on console [#583](https://github.com/lablup/backend.ai-console/issues/583)
- [**UI / UX**][**enhancement**][**library / SDK**][**major**][**working**] Unified session information crawler / store [#496](https://github.com/lablup/backend.ai-console/issues/496)

#### Bug Fixes:

- [**UI / UX**][**bug**][**minor**] TOS is not scrollable [#588](https://github.com/lablup/backend.ai-console/issues/588)


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
