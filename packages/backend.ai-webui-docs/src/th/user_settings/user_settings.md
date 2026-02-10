# การตั้งค่าผู้ใช้


ผู้ใช้สามารถเข้าถึงหน้าการตั้งค่าผ่านการเลือกเมนู Preferences ที่ปรากฏหลังจากคลิกที่ไอคอนคนที่มุมขวาบน ผู้ใช้สามารถเปลี่ยนสภาพแวดล้อมที่ต้องการจากการตั้งค่าภาษา, การจัดการ SSH keypair, การแก้ไขสคริปต์กำหนดค่าผู้ใช้ และแม้กระทั่งการใช้ฟีเจอร์ Beta.

![](images/preferences.png)


## แท็บทั่วไป


![](images/user_settings_page.png)

There are lots of preference menu in แท็บทั่วไป. you can search it by search field on top of the section,
or you may just filter that you changed by clicking `Display Only Changes`. If you want to rollback the changes to before,
click Reset button on the right top of the section.

### Enables การแจ้งเตือนบนเดสก์ท็อปs

Enables or disables the desktop notification feature. If the browser and
operating system support it, various  messages that appear in the WebUI
will also appear in the desktop notification panel. If disabled from the
operating system during the first run, the desktop message may not be displayed
even if the option is turned on here. Regardless of the value of this option,
the notification inside the WebUI still works.

### Set Compact Sidebar as Default

เมื่อเปิดใช้งานตัวเลือกนี้แถบด้านซ้ายจะถูกแสดงในรูปแบบกะทัดรัด (ความกว้างที่แคบกว่า) การเปลี่ยนแปลงของตัวเลือกจะมีผลเมื่อมีการรีเฟรชเบราว์เซอร์ หากคุณต้องการเปลี่ยนประเภทของแถบด้านข้างทันทีโดยไม่ต้องรีเฟรชหน้า ให้คลิกที่ไอคอนทางซ้ายสุดที่ด้านบนของหัวเรื่อง

### ภาษา

ตั้งค่าภาษาที่แสดงบน UI ขณะนี้ Backend.AI รองรับมากกว่าห้าภาษารวมถึงภาษาอังกฤษและภาษาเกาหลี อย่างไรก็ตาม อาจมีบางรายการใน UI ที่ไม่ได้อัปเดตภาษาให้ก่อนที่หน้าจะถูกรีเฟรช

- Default: Use the operating system's default language.
- ตั้งค่าอังกฤษเป็นภาษาหลัก
- ตั้งภาษาเกาหลีเป็นภาษาที่ตั้งค่าเริ่มต้น
- ตั้งค่าภาษาโปรตุเกสบราซิลเป็นภาษาพื้นฐาน
- ตั้งค่าเป็นภาษา จีน (แบบย่อ) เป็นภาษาที่ต้องการเริ่มต้น
- ตั้งค่าเป็นภาษาจีน (ดั้งเดิม) เป็นภาษาพื้นฐาน
- ตั้งค่าเป็นภาษาฝรั่งเศสเป็นภาษาหลัก
- ฟินแลนด์: ตั้งค่าให้ฟินแลนด์เป็นภาษาพื้นฐาน
- เยอรมัน: ตั้งค่าเยอรมันเป็นภาษาหลัก
- กรีก: ตั้งค่ากรีกเป็นภาษาที่ตั้งไว้เริ่มต้น
- อินโดนีเซีย: ตั้งค่าอินโดนีเซียเป็นภาษาพื้นฐาน。
- อิตาลี: ตั้งค่าอิตาลีเป็นภาษาหลัก
- ญี่ปุ่น: ตั้งค่าให้ภาษาญี่ปุ่นเป็นภาษาพื้นฐาน
- มองโกเลีย: ตั้งค่าภาษามองโกเลียเป็นภาษาหลัก
- โปแลนด์: ตั้งโปแลนด์เป็นภาษาพื้นฐาน
- ตั้งภาษาโปรตุเกสเป็นภาษาหลัก
- รัสเซีย: ตั้งค่ารัสเซียเป็นภาษาหลัก
- ตั้งภาษาสเปนเป็นภาษาที่ตั้งค่าเริ่มต้น
- ตั้งภาษาไทยเป็นภาษาหลัก
- ตุรกี: ตั้งค่าตุรกีเป็นภาษาที่ตั้งค่าเริ่มต้น
- ภาษาเวียดนาม: ตั้งค่าให้ภาษาเวียดนามเป็นภาษามาตรฐาน



   Some of translated items may be marked as `__NOT_TRANSLATED__`, which
   indicates the item is not yet translated for that language. Since Backend.AI
   WebUI is open sourced, anyone who willing to make the translation better
   can contribute: https://github.com/lablup/backend.ai-webui.

### การตรวจสอบการอัปเดตอัตโนมัติ

A notification window pops up when a new WebUI version is detected.
It works only in an environment where Internet access is available.

### ออกจากระบบอัตโนมัติ

Log out automatically when all Backend.AI WebUI pages are closed except for
pages created to run apps in session (e.g. Jupyter notebook, web terminal,
etc.).

### ข้อมูล กุญแจpair ของฉัน

ผู้ใช้แต่ละคนมีคีย์คู่คืนหนึ่งคู่หรือมากกว่า คุณสามารถดูคีย์คู่การเข้าถึงและคีย์ลับได้โดยคลิกที่ปุ่มการตั้งค่าด้านล่าง จำไว้ว่าคีย์คู่การเข้าถึงหลักมีเพียงหนึ่งคู่เท่านั้น

![](images/my_keypair_information.png)


### การจัดการคู่กุญแจ SSH

When using the WebUI app, you can create SSH/SFTP connection directly to the
compute session. Once you signed up for Backend.AI, a public keypair is
provided. If you click the button on the right to the การจัดการคู่กุญแจ SSH
section, the following dialog appears. Click the copy button on the right to
copy the existing SSH public key. You can update SSH keypair by clicking
GENERATE button at the bottom of the dialog. SSH public/private keys are
randomly generated and stored as ผู้ใช้ information. Please note that the secret
key cannot be checked again unless it is saved manually immediately after
creation.

![](images/ssh_keypair_dialog.png)


   Backend.AI ใช้คู่กุญแจ SSH ที่อิงตาม OpenSSH บน หน้าต่าง คุณสามารถแปลงสิ่งนี้เป็นกุญแจ PPK ได้

From 22.09, Backend.AI WebUI supports adding your own ssh keypair in order to provide
flexibility such as accessing to a private ที่เก็บข้อมูล. In order to add your own ssh keypair, click `ENTER MANUALLY` button. Then, you will see
two text area which corresponds to "public" and "private" key.

![](images/add_ssh_keypair_manually_dialog.png)

please enter the keys inside, and click `SAVE` button. Now you can access to backend.ai session using your own key.

![](images/ssh_keypair_dialog_after.png)

### Edit Bootstrap Script

หากคุณต้องการเรียกใช้งานสคริปต์ครั้งเดียวหลังจากที่เซสชันการประมวลผลของคุณเริ่มต้นขึ้น ให้เขียนเนื้อหาที่นี่

![](images/edit_bootstrap_script.png)


   The compute session will be at the `PREPARING` status until the bootstrap
   script finishes its execution. Since a ผู้ใช้ cannot use the session until it
   is `RUNNING`, if the script contains a long-running tasks, it might be
   better to remove them out of the bootstrap script and run them in a terminal
   app.

### Edit User Config Script

You can write some config scripts to replace the default ones in a compute
session. Files like `.bashrc`, `.tmux.conf.local`, `.vimrc`, etc. can be
customized. The scripts are saved for each ผู้ใช้ and can be used when certain
automation tasks are required. For example, you can modify the `.bashrc`
script to register your command aliases or specify that certain files are always
downloaded to a specific location.

ใช้เมนูแบบเลื่อนลงที่ด้านบนเพื่อเลือกประเภทของสคริปต์ที่คุณต้องการเขียนแล้วเขียนเนื้อหา คุณสามารถบันทึกสคริปต์โดยการคลิกปุ่มบันทึก (SAVE) หรือบันทึกและปิด (SAVE AND CLOSE) คลิกปุ่มลบ (DELETE) เพื่อลบสคริปต์

![](images/edit_user_config_script.png)

### Switch back to the Classic UI

If you want to switch back to the classic Backend.AI interface, enable the following options.

![](images/switch_classic_ui.png)

### Experimental คุณสมบัติs

You can enable or disable experimental features before they are officially released.

![](images/experimental_features.png)

## แท็บ LOGS

แสดงข้อมูลรายละเอียดของบันทึกต่างๆ ที่บันทึกไว้ในด้านของลูกค้า คุณสามารถไปที่หน้านี้เพื่อหาข้อมูลเพิ่มเติมเกี่ยวกับข้อผิดพลาดที่เกิดขึ้น คุณสามารถค้นหา กรองบันทึกข้อผิดพลาด อัปเดตและล้างบันทึกโดยการคลิกที่ปุ่มล้างบันทึกที่มุมขวาบน

![](images/user_log.png)


   หากคุณล็อกอินอยู่เพียงหน้าหนึ่ง การคลิกที่ปุ่ม REFRESH อาจไม่แสดงผลอย่างถูกต้อง หน้าบันทึกเป็นการรวมคำขอไปยังเซิร์ฟเวอร์และการตอบสนองจากเซิร์ฟเวอร์ หากหน้าปัจจุบันคือหน้าบันทึก มันจะไม่ส่งคำขอใด ๆ ไปยังเซิร์ฟเวอร์นอกเหนือจากการรีเฟรชหน้าตามที่ระบุ หากต้องการตรวจสอบว่าบันทึกกำลังถูกจัดเรียงอย่างถูกต้อง กรุณาเปิดหน้าอื่นและคลิกปุ่ม REFRESH

หากคุณต้องการซ่อนหรือแสดงคอลัมน์บางอย่าง ให้คลิกที่ไอคอนเฟืองที่มุมขวาล่างของตาราง จากนั้นคุณจะสามารถเห็นกล่องโต้ตอบด้านล่างเพื่อเลือกคอลัมน์ที่คุณต้องการเห็น

![](images/logs_table_setting.png)