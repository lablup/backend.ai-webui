# Top Bar คุณสมบัติs


The tob bar includes various features that support use of the WebUI.

![](images/header.png)

## Project selector


Users can switch between projects using the project selector provided in the top bar.
By default, the project that ผู้ใช้ currently belongs to is selected.
Since each project may have different resource policies, switching projects may also change the available resource policies.

## Notification


The bell shape button is the event notification button.
Events that need to be recorded during WebUI operation are displayed here.
When background tasks are running, such as creating a compute session,
you can check the jobs here. When the background task is finished.
Press the shortcut key (`]`) to open and close the notification area.

![](images/notification_collapse.png)

## Theme mode


You can change the theme mode of the WebUI via the dark mode button on the
right side of the header.

![](images/theme_mode.png)

## Help


Click question mark button to access the web version of this guide document.
You will be directed to the appropriate documentation based on the page you are currently on.

## User Menu


Click the person button on the right side of the top bar to see the ผู้ใช้ menu.
Each menu item has the following functions.

![](images/user_drop_down.png)

- About Backend.AI: Displays information such as version of Backend.AI WebUI,
  license type, etc.
- My Account: Check / Update information of current login ผู้ใช้.
- การตั้งค่า: ไปที่หน้าการตั้งค่าผู้ใช้.
- บันทึก / ข้อผิดพลาด: ไปที่หน้าบันทึก คุณสามารถตรวจสอบประวัติบันทึกและข้อผิดพลาดที่บันทึกไว้ในฝั่งคล้ายได้
- Download Desktop App: Download the stand-alone WebUI app for your platform.
- Log Out: Log out of the WebUI.

### My Account

ถ้าคุณคลิกที่ บัญชีของฉัน จะมีหน้าต่างถูกเปิดขึ้นดังนี้

![](images/my_account_information.png)

แต่ละรายการมีความหมายดังต่อไปนี้ ป้อนค่าที่ต้องการและคลิกปุ่ม UPDATE เพื่ออัปเดตข้อมูลผู้ใช้。

- ชื่อเต็ม: ชื่อผู้ใช้งาน (สูงสุด 64 ตัวอักษร).
- Original password: Original password. Click the right view button to see the
  input contents.
- New password: New password (8 characters or more containing at least 1
  alphabet, number, and symbol). Click the right view button to see the input
  contents. Ensure this is the same as the Original password.
- เปิดใช้งาน 2FA: การเปิดใช้งาน 2FA ผู้ใช้จำเป็นต้องป้อนรหัส OTP เมื่อเข้าสู่ระบบหากมีการเลือกใช้งาน


  Depending on the plugin settings, the `2FA Enabled` column might be invisible.
  In that case, please contact ผู้ดูแลระบบistrator of your system.

### การตั้งค่า 2FA
If you activate the `2FA Enabled` switch, the following dialog appears.

![](images/2fa_setup.png)

เปิดแอปพลิเคชัน 2FA ที่คุณใช้และสแกนรหัส QR หรือป้อนรหัสยืนยันด้วยตนเอง มีแอปพลิเคชันที่รองรับ 2FA หลายตัว เช่น Google Authenticator, 2STP, 1Password และ Bitwarden

จากนั้นให้ป้อนรหัส 6 หลักจากรายการที่เพิ่มไปยังแอปพลิเคชัน 2FA ของคุณในกล่องโต้ตอบด้านบน 2FA จะถูกเปิดใช้งานเมื่อคุณกดปุ่มยืนยัน

เมื่อคุณเข้าสู่ระบบในภายหลัง หากคุณใส่อีเมลและรหัสผ่าน จะมีฟิลด์เพิ่มเติมปรากฏขึ้นเพื่อขอรหัส OTP

![](images/ask_otp_when_login.png)

ในการเข้าสู่ระบบ คุณต้องเปิดแอปพลิเคชัน 2FA และป้อนรหัส 6 หลักในช่องรหัสผ่านใช้ครั้งเดียว

![](images/remove_2fa.png)

If you want to disable 2FA, turn off the `2FA Enabled` switch and click the confirm button in the
following dialog.