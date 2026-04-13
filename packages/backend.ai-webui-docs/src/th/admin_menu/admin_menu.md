<a id="admin-menus"></a>

# เมนูผู้ดูแลระบบ

Logging in with an ผู้ดูแลระบบ account will reveal an extra Administration menu on the bottom left of the sidebar.
User information registered in Backend.AI is listed in the Users tab.
super-ผู้ดูแลระบบ role ผู้ใช้ can see all ผู้ใช้s' information, create and deactivate a ผู้ใช้.

User ID (email), Name (ผู้ใช้name), Role and Description(User Description) can be filtered by typing text in the
search box on each column header.

![](../images/admin_user_page.png)

<a id="create-and-update-users"></a>

## สร้างและปรับปรุงผู้ใช้

สามารถสร้างผู้ใช้ได้โดยคลิกปุ่ม '+ สร้างผู้ใช้' โปรดทราบว่ารหัสผ่านต้องมีความยาว 8 ตัวอักษรขึ้นไป และต้องมีตัวอักษร ตัวอักขระพิเศษ และตัวเลขอย่างน้อยอย่างละ 1 ตัว ความยาวสูงสุดที่อนุญาตสำหรับ E-Mail, Username และชื่อเต็ม คือ 64 ตัวอักษร

หากผู้ใช้ที่มีอีเมลหรือชื่อผู้ใช้งานเดียวกันมีอยู่แล้ว จะไม่สามารถสร้างบัญชีผู้ใช้ได้ กรุณาลองใช้อีเมลและชื่อผู้ใช้งานอื่น

![](../images/create_user_dialog.png)


ตรวจสอบว่าผู้ใช้ถูกสร้างแล้ว

![](../images/check_if_user_created.png)

คลิกปุ่มสีเขียวในคอลัมน์ 'การควบคุม' เพื่อดูข้อมูลผู้ใช้โดยละเอียด คุณยังสามารถตรวจสอบข้อมูลโดเมนและโปรเจกต์ที่ผู้ใช้สังกัดอยู่ได้

![](../images/user_detail_dialog.png)

คลิกปุ่ม 'การตั้งค่า' ในคอลัมน์ 'การควบคุม' เพื่ออัปเดตข้อมูลของผู้ใช้ที่มีอยู่แล้ว สามารถเปลี่ยนชื่อผู้ใช้ รหัสผ่าน สถานะการเปิดใช้งาน เป็นต้น User ID (อีเมล) ไม่สามารถเปลี่ยนแปลงได้

![](../images/user_update_dialog.png)


กล่องโต้ตอบสร้าง/อัปเดตผู้ใช้ประกอบด้วยฟิลด์ต่อไปนี้:

- **อีเมล**: ที่อยู่อีเมลของผู้ใช้ ใช้เป็น ID สำหรับเข้าสู่ระบบ ไม่สามารถเปลี่ยนแปลงได้หลังจากสร้างแล้ว
- **ชื่อผู้ใช้**: ตัวระบุเฉพาะของผู้ใช้ (สูงสุด 64 ตัวอักษร)
- **ชื่อเต็ม**: ชื่อที่แสดงของผู้ใช้ (สูงสุด 64 ตัวอักษร)
- **รหัสผ่าน**: ต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวอักษร ตัวอักขระพิเศษ และตัวเลขอย่างน้อยอย่างละ 1 ตัว
- **คำอธิบาย**: คำอธิบายเพิ่มเติมสำหรับผู้ใช้ (สูงสุด 500 ตัวอักษร)
- **สถานะผู้ใช้**: แสดงสถานะของผู้ใช้ ผู้ใช้ Inactive ไม่สามารถเข้าสู่ระบบได้ Before Verification เป็นสถานะที่บ่งบอกว่าผู้ใช้ต้องดำเนินการเพิ่มเติมเพื่อเปิดใช้งานบัญชี เช่น การยืนยันอีเมลหรือการอนุมัติจากผู้ดูแลระบบ ผู้ใช้ Inactive จะแสดงแยกในแท็บ Inactive

  ![](../images/active_user_selection.png)

- **บทบาท**: บทบาทของผู้ใช้ (user, admin, superadmin) ตัวเลือกที่มีจะขึ้นอยู่กับสิทธิ์ของผู้ใช้ปัจจุบัน
- **โดเมน**: โดเมนที่ผู้ใช้สังกัด สามารถกำหนดหรือแก้ไขได้ทั้งขณะสร้างผู้ใช้ใหม่และแก้ไขผู้ใช้
- **โปรเจกต์**: เลือกโปรเจกต์หนึ่งรายการขึ้นไปที่ผู้ใช้จะสังกัด โปรเจกต์ที่มีจะขึ้นอยู่กับโดเมนที่เลือก
- **ต้องเปลี่ยนรหัสผ่าน**: หากผู้ดูแลระบบเลือกรหัสผ่านแบบสุ่มขณะสร้างผู้ใช้เป็นกลุ่ม ฟิลด์นี้สามารถตั้งค่าเป็น ON เพื่อบ่งบอกว่าจำเป็นต้องเปลี่ยนรหัสผ่าน ผู้ใช้จะเห็นแถบด้านบนที่แจ้งให้อัปเดตรหัสผ่าน แต่นี่เป็นเพียงแฟล็กอธิบายซึ่งไม่มีผลต่อการใช้งานจริง
- **เปิดใช้งานเซสชัน sudo**: อนุญาตให้ผู้ใช้ใช้ sudo ในเซสชันการคำนวณ สิ่งนี้มีประโยชน์เมื่อผู้ใช้ต้องติดตั้งแพ็กเกจหรือรันคำสั่งที่ต้องใช้สิทธิ์ root อย่างไรก็ตาม ไม่แนะนำให้เปิดใช้ตัวเลือกนี้สำหรับผู้ใช้ทุกคน เนื่องจากอาจทำให้เกิดปัญหาด้านความปลอดภัย
- **2FA Enabled**: แฟล็กที่บ่งบอกว่าผู้ใช้ใช้การยืนยันตัวตนแบบสองปัจจัยหรือไม่ เมื่อใช้การยืนยันตัวตนแบบสองปัจจัย ผู้ใช้จะต้องกรอกรหัส OTP เพิ่มเติมเมื่อเข้าสู่ระบบ ผู้ดูแลระบบสามารถปิดการยืนยันตัวตนแบบสองปัจจัยของผู้ใช้อื่นได้เท่านั้น
- **นโยบายทรัพยากร**: ตั้งแต่ Backend.AI เวอร์ชัน 24.09 คุณสามารถเลือกนโยบายทรัพยากรผู้ใช้ที่ผู้ใช้สังกัดได้ สำหรับข้อมูลเพิ่มเติมเกี่ยวกับนโยบายทรัพยากรผู้ใช้ โปรดดูที่ส่วน [นโยบายทรัพยากรผู้ใช้](#user-resource-policy)
- **IP ไคลเอนต์ที่อนุญาต**: จำกัดที่อยู่ IP ที่สามารถเข้าถึงระบบโดยใช้บัญชีผู้ใช้นี้ ป้อนที่อยู่ IP หรือ CIDR (เช่น `10.20.30.40`, `10.20.30.0/24`) หากเว้นว่างไว้ อนุญาตให้เข้าถึงจาก IP ใดก็ได้
- **UID คอนเทนเนอร์**: User ID ตัวเลขที่กำหนดให้กับกระบวนการภายในคอนเทนเนอร์ มีประโยชน์เมื่อคอนเทนเนอร์ต้องตรงกับ UID เฉพาะสำหรับวัตถุประสงค์ด้านสิทธิ์ไฟล์
- **GID คอนเทนเนอร์**: Group ID ตัวเลขเริ่มต้นที่กำหนดให้กับกระบวนการภายในคอนเทนเนอร์
- **GID เสริม**: Group ID ตัวเลขเพิ่มเติมที่กำหนดให้กับกระบวนการคอนเทนเนอร์ ป้อน GID หลายตัวโดยคั่นด้วยเครื่องหมายจุลภาค
- **คีย์การเข้าถึงหลัก**: (แก้ไขเท่านั้น) เลือกคีย์การเข้าถึงหลักที่ใช้สำหรับการยืนยันตัวตน API จากคีย์แพร์ของผู้ใช้

<a id="bulk-create-users"></a>

### สร้างผู้ใช้แบบกลุ่ม

:::note
ฟีเจอร์นี้ใช้งานได้เฉพาะบน Backend.AI Manager เวอร์ชัน 26.2.0 ขึ้นไปเท่านั้น
:::

เมื่อคุณต้องการสร้างบัญชีผู้ใช้หลายบัญชีพร้อมกัน คุณสามารถใช้ฟีเจอร์สร้างผู้ใช้
แบบกลุ่มได้ บน Manager 26.2.0 ขึ้นไป ปุ่มดรอปดาวน์จุดไข่ปลา (`...`) จะปรากฏ
ข้างปุ่ม **สร้างผู้ใช้** ในหน้า Users คลิกปุ่มดรอปดาวน์นี้แล้วเลือก
**สร้างผู้ใช้แบบกลุ่ม** เพื่อเปิดไดอะล็อกการสร้างแบบกลุ่ม

![](../images/bulk_create_user_dropdown.png)

ไดอะล็อกการสร้างแบบกลุ่มประกอบด้วยฟิลด์ต่อไปนี้ แบนเนอร์แจ้งเตือนที่ด้านบนของ
ไดอะล็อกจะอธิบายว่าอีเมลและชื่อผู้ใช้จะถูกสร้างโดยอัตโนมัติโดยเติมเลขลำดับแบบ
zero-padded ต่อท้ายส่วนนำหน้า

- **ส่วนที่อยู่ก่อน @ ของอีเมล**: ส่วนนำหน้าของที่อยู่อีเมลที่สร้างโดยอัตโนมัติ
  ใช้ได้เฉพาะตัวอักษร ตัวเลข จุด ยัติภังค์ หรือขีดล่างเท่านั้น (สูงสุด 30 ตัวอักษร)
- **ส่วนต่อท้ายอีเมล (หลัง @)**: ส่วนโดเมนของที่อยู่อีเมลที่สร้างโดยอัตโนมัติ
  ฟิลด์นี้จะแสดงเครื่องหมาย `@` นำหน้าโดยอัตโนมัติ (สูงสุด 30 ตัวอักษร)
- **จำนวนผู้ใช้**: จำนวนบัญชีผู้ใช้ที่ต้องการสร้าง (1 ถึง 100) ด้านล่างฟิลด์นี้จะ
  แสดงตัวอย่างอีเมลที่จะสร้างแบบเรียลไทม์ หากมี 4 คนหรือน้อยกว่าจะแสดงอีเมล
  ทั้งหมด หากมากกว่า 4 คนจะแสดง 2 รายการแรก จุดไข่ปลา และรายการสุดท้าย
  (เช่น `student01@example.com, student02@example.com ... student10@example.com`)
- **รหัสผ่าน**: รหัสผ่านเริ่มต้นที่ใช้ร่วมกันสำหรับผู้ใช้ทั้งหมดที่สร้าง กฎรหัสผ่าน
  เดียวกันกับการสร้างผู้ใช้แบบเดี่ยวจะถูกนำมาใช้ (อย่างน้อย 8 ตัวอักษร ประกอบด้วย
  ตัวอักษร อักขระพิเศษ และตัวเลขอย่างน้อยอย่างละ 1 ตัว)
- **ต้องเปลี่ยนรหัสผ่าน**: ตั้งค่าเริ่มต้นเป็น ON สำหรับการสร้างแบบกลุ่ม
  เมื่อเปิดใช้งาน ผู้ใช้แต่ละคนจะได้รับแจ้งให้เปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก
- **โดเมน**: โดเมนที่ผู้ใช้ที่สร้างจะสังกัดอยู่
- ฟิลด์อื่นๆ เช่น **บทบาท**, **สถานะ**, **นโยบายทรัพยากร** และ **โปรเจกต์**
  จะเหมือนกับการสร้างผู้ใช้แบบเดี่ยว

![](../images/bulk_create_user_dialog.png)

ชื่อผู้ใช้และที่อยู่อีเมลจะถูกสร้างโดยอัตโนมัติตามส่วนนำหน้าและส่วนต่อท้ายที่คุณระบุ
เช่น หากคุณตั้งส่วนนำหน้าอีเมลเป็น `student` ส่วนต่อท้ายอีเมลเป็น `example.com`
และจำนวนผู้ใช้เป็น 10 บัญชีต่อไปนี้จะถูกสร้างขึ้น:

| ชื่อผู้ใช้ | อีเมล |
|-----------|-------|
| `student01` | `student01@example.com` |
| `student02` | `student02@example.com` |
| ... | ... |
| `student10` | `student10@example.com` |

:::note
เลขลำดับจะถูกเติม zero-padding ตามจำนวนผู้ใช้ทั้งหมด เช่น 3 คนจะได้
`student1` ถึง `student3`, 10 คนจะได้ `student01` ถึง `student10`, 100 คนจะได้
`student001` ถึง `student100`
:::

:::warning
หากชื่อผู้ใช้หรือที่อยู่อีเมลที่สร้างขึ้นบางส่วนมีอยู่แล้ว การดำเนินการจะสำเร็จ
บางส่วน ข้อความเตือนจะแสดงจำนวนผู้ใช้ที่สร้างสำเร็จและจำนวนที่ล้มเหลว
:::

<a id="inactivate-user-account"></a>

## Inactivate user account

Deleting user accounts is not allowed even for superadmins, to track usage
statistics per user, metric retention, and accidental account loss. Instead,
admins can inactivate user accounts to keep users from logging in. Click the
delete icon in the Controls panel. A popover asking confirmation appears, and
you can deactivate the user by clicking the Deactivate button.

![](../images/user_deactivate_confirmation.png)

To re-activate users, go to Users - Inactive tab, and select the status of
the target user to `Active`.

![](../images/user_inactivate_confirmation.png)

:::note
Please note that deactivating or reactivating the user does not change the user's credentials, since the user
account can have multiple keypairs, which brings it hard to decide which credential
should be reactivated.
:::

<a id="manage-users-keypairs"></a>

## Manage User's Keypairs

Each user account usually have one or more keypairs. A keypair is used for API
authentication to the Backend.AI server, after user logs in. Login requires
authentication via user email and password, but every request the user sends to
the server is authenticated based on the keypair.

A user can have multiple keypairs, but to reduce the user's burden of managing
keypairs, we are currently using only one of the user's keypairs to send requests.
Also, when you create a new user, a keypair is automatically created, so you do
not need to create and assign a keypair manually in most cases.

Keypairs can be listed on the Credentials tab of in the Users page. Active
keypairs are shown immediately, and to see the inactive keypairs, click the
Inactive panel at the bottom.

![](../images/credential_list_tab.png)

Like in Users tab, you can use the buttons in the Controls panel to view or
update keypair details. Click the green info icon button to see specific details of the keypair.
If necessary, you can copy the secret key by clicking the copy button.

![](../images/keypair_detail_dialog.png)

You can modify the resource policy and rate limit of the keypair by clicking the blue 'Setting (Gear)' button.
Please keep in mind that if the 'Rate Limit' value is small, API operations such as login may be blocked.

![](../images/keypair_update_dialog.png)

You can also deactivate or reactivate the keypair by clicking red 'Deactivate' button or black 'Activate' button in control column.
Unlike the User tab, the Inactive tab allows permanent deletion of key pairs.
However, you cannot permanently delete a key pair if it is currently being used as a user's main access key.

![](../images/keypair_delete_button.png)

![](../images/keypair_delete_confirmation.png)

If you
accidentally deleted a keypair, you can re-create keypair for the user by
clicking the '+ ADD CREDENTIAL' button at the upper right corner.

The Rate Limit field is where you specify the maximum number of requests that
can be sent to the Backend.AI server in 15 minutes. For example, if set to 1000,
and the keypair sends more than 1000 API requests in 15 minutes, and the server
throws an error and does not accept the request. It is recommended to use the
default value and increase it when the API request frequency goes up high
according to the user's pattern.

![](../images/add_keypair_dialog.png)

<a id="share-project-storage-folders-with-project-members"></a>

## Share project storage folders with project members

Backend.AI provides storage folders for projects, in addition to user's own
storage folder. A project storage folder is a folder belonging to a specific
project, not a specific user, and can be accessed by all users in that project.

:::note
Project folders can be created only by administrators. Normal users can only
access the contents of the project folder created by the administrator.
Depending on the system settings, project folders may not be allowed.
:::

First, log in with an admin account and create a project folder. After moving to
the Data page, click 'Create Folder' to open the folder creation dialog.
Enter the folder name, set the Type to Project. When the type is set to Project,
it will be automatically assigned to the project selected in the project selector in the header.
Permission is set to Read-Only.

![](../images/group_folder_creation.png)

After confirming that the folder has been created, log in with the User B's
account and check that the project folder just created on the Data & Storage page
is displayed without any invitation procedure. You can see that R (Read Only) is
also displayed in the Permission panel.

![](../images/group_folder_listed_in_B.png)

<a id="manage-models-cards"></a>

## จัดการการ์ดโมเดล

การ์ดโมเดลทั้งหมดในคลังโมเดลได้รับการจัดการโดยผู้ดูแลโปรเจกต์
หลังจากอัปโหลดคลังโมเดลพร้อมไฟล์ model-definition แล้ว
ผู้ใช้ทุกคนในโปรเจกต์สามารถเข้าถึงการ์ดโมเดลและโคลนได้หากจำเป็น

วิธีการดังต่อไปนี้คือการเพิ่มการ์ดโมเดลจาก Hugging Face

:::note
ก่อนที่จะสร้างการ์ดโมเดล จำเป็นต้องได้รับสิทธิ์การเข้าถึงโมเดลเฉพาะบน Hugging Face
สำหรับข้อมูลเพิ่มเติม โปรดดูที่ [Gated models](https://huggingface.co/docs/hub/models-gated)
:::

ขั้นแรก ตั้งค่าโปรเจกต์เป็น 'model-store'

![](../images/select_project_to_model_store.png)

ไปที่หน้าข้อมูลและคลิกปุ่ม 'สร้างโฟลเดอร์' ทางด้านขวา ใส่ชื่อโฟลเดอร์
และตั้งค่าการกำหนดค่าโฟลเดอร์ที่เหลือดังต่อไปนี้:

- โหมดการใช้งาน: Model
- ประเภท: project
- สิทธิ์: Read-Write
- โคลนได้: True

![](../images/model_store_folder.png)

หลังจากสร้างโฟลเดอร์แล้ว คุณจะต้องตั้งค่าและอัปโหลดไฟล์ model-definition.yaml
ไปยังโฟลเดอร์ที่คุณเพิ่งสร้างขึ้น ต่อไปนี้คือตัวอย่างไฟล์ model-definition
หากคุณต้องการทราบวิธีการเขียนไฟล์ model-definition
โปรดดูที่ส่วน [คู่มือการกำหนดโมเดล](#model-definition-guide)

```yaml
models:
  - name: "Llama-3.1-8B-Instruct"
    model_path: "/models/Llama-3.1-8B-Instruct"
    service:
      pre_start_actions:
        - action: run_command
          args:
            command:
              - huggingface-cli
              - download
              - --local-dir
              - /models/Llama-3.1-8B-Instruct
              - --token
              - hf_****
              - meta-llama/Llama-3.1-8B-Instruct
          start_command:
            - /usr/bin/python
            - -m
            - vllm.entrypoints.openai.api_server
            - --model
            - /models/Llama-3.1-8B-Instruct
            - --served-model-name
            - Llama-3.1-8B-Instruct
            - --tensor-parallel-size
            - "1"
            - --host
            - "0.0.0.0"
            - --port
            - "8000"
            - --max-model-len
            - "4096"
      port: 8000
      health_check:
        path: /v1/models
        max_retries: 500
```

เมื่ออัปโหลดไฟล์ model-definition แล้ว การ์ดโมเดลจะปรากฏในหน้าคลังโมเดล

![](../images/model_card_added.png)

:::note
คุณจะต้องดาวน์โหลดโมเดลด้วยตนเองหลังจากตั้งค่าไฟล์ model-definition
สำหรับการดาวน์โหลดไฟล์โมเดลไปยังโฟลเดอร์
คุณสามารถเมาท์โฟลเดอร์โมเดลเมื่อสร้างเซสชันและดาวน์โหลดไฟล์ไปยังตำแหน่งนั้นโดยดูที่
[Downloading models](https://huggingface.co/docs/hub/models-downloading)
:::

การคลิกที่การ์ดโมเดลที่คุณเพิ่งสร้างจะแสดงรายละเอียดของไฟล์ model-definition ที่คุณอัปโหลด
ตอนนี้สมาชิกทุกคนในโปรเจกต์สามารถเข้าถึงการ์ดโมเดลและโคลนได้

![](../images/model_card_detail.png)

:::note
เพื่อเปิดใช้งานปุ่ม "เรียกใช้รุ่นนี้" บนโมเดลการ์ด ต้องมีทั้งไฟล์
`model-definition.yaml` และ `service-definition.toml` ในโฟลเดอร์ หากไฟล์
ใดไฟล์หนึ่งหายไป ปุ่มจะถูกปิดใช้งาน สำหรับรายละเอียดเกี่ยวกับการสร้าง
ไฟล์กำหนดบริการ โปรดดูที่หัวข้อ
[ไฟล์กำหนดบริการ](#service-definition-file)
ในเอกสาร การให้บริการโมเดล
:::

<a id="model-store-page"></a>

## หน้า Model Store

หน้า Model Store เป็นหน้าที่ผู้ใช้สามารถเรียกดูและใช้งานโมเดลที่ผู้ดูแลระบบได้กำหนดค่าไว้ล่วงหน้า เมื่อไปที่หน้า Model Store จากแถบด้านข้าง คุณจะเห็นโมเดลการ์ดทั้งหมดที่ลงทะเบียนในโปรเจกต์ Model Store

![](../images/model_store_page_overview.png)

<!-- TODO: Capture screenshot of Model Store page showing model cards with buttons visible -->

โมเดลการ์ดแต่ละใบจะแสดงข้อมูลหลักดังนี้:

- ชื่อโมเดล (ชื่อโฟลเดอร์)
- เนื้อหา README (หากมีไฟล์ README ในโฟลเดอร์)
- เมตาดาต้าจากไฟล์ model-definition.yaml
- ปุ่มการดำเนินการสำหรับโต้ตอบกับโมเดล

คลิกที่โมเดลการ์ดเพื่อเปิดมุมมองรายละเอียดที่แสดงเนื้อหา README ทั้งหมดและการดำเนินการที่สามารถใช้ได้

![](../images/model_card_detail_with_buttons.png)

<!-- TODO: Capture screenshot of model card detail view showing README content and buttons -->

<a id="clone-to-folder"></a>

### โคลนไปยังโฟลเดอร์

ปุ่ม "โคลนไปยังโฟลเดอร์" ช่วยให้คุณสร้างสำเนาส่วนตัวของโฟลเดอร์ Model Store เนื่องจากโฟลเดอร์ Model Store เป็นแบบอ่านอย่างเดียวและแชร์กันทั้งโปรเจกต์ คุณจึงต้องโคลนไปยังพื้นที่จัดเก็บของคุณเองเพื่อแก้ไขไฟล์หรือใช้ในเวิร์กโฟลว์ที่กำหนดเอง

ในการโคลนโฟลเดอร์โมเดล:

1. คลิกปุ่ม "โคลนไปยังโฟลเดอร์" บนโมเดลการ์ด
2. กำหนดค่าการตั้งค่าต่อไปนี้ในกล่องโต้ตอบการโคลน:
   - **ชื่อโฟลเดอร์**: ชื่อสำหรับโฟลเดอร์ที่โคลน (ค่าเริ่มต้นจะเพิ่มคำต่อท้ายแบบสุ่มต่อชื่อเดิม)
   - **สิทธิ์**: ตั้งค่าสิทธิ์การเข้าถึงสำหรับโฟลเดอร์ที่โคลน (อ่านอย่างเดียว หรือ อ่าน-เขียน)
   - **โหมดการใช้งาน**: เลือกประเภทโฟลเดอร์ (ทั่วไป, โมเดล หรือ ต่อเชื่อมอัตโนมัติ)
3. คลิกปุ่ม "โคลน" เพื่อเริ่มกระบวนการโคลน

![](../images/model_store_clone_dialog.png)

<!-- TODO: Capture screenshot of clone folder dialog with field settings -->

:::note
ปัจจุบันการโคลนโฟลเดอร์รองรับเฉพาะภายในโฮสต์จัดเก็บเดียวกันเท่านั้น
:::

เมื่อการโคลนเสร็จสิ้น โฟลเดอร์ใหม่จะปรากฏในแท็บที่เกี่ยวข้องบนหน้าข้อมูล ตามโหมดการใช้งานที่เลือก

<a id="create-service-from-this-model"></a>

### สร้างบริการจากโมเดลนี้

ปุ่ม "เรียกใช้รุ่นนี้" ช่วยให้คุณสร้างบริการโมเดลได้โดยตรงจากโมเดลการ์ดด้วยการคลิกเพียงครั้งเดียว ฟีเจอร์นี้จะทำให้กระบวนการโคลนโฟลเดอร์โมเดลและสร้างเอ็นด์พอยท์ของบริการโมเดลเป็นไปโดยอัตโนมัติ

:::note
เพื่อเปิดใช้งานปุ่มนี้ ต้องเป็นไปตามเงื่อนไขต่อไปนี้:

- ต้องมีทั้งไฟล์ `model-definition.yaml` และ `service-definition.toml` ในโฟลเดอร์โมเดล หากไฟล์ใดไฟล์หนึ่งหายไป ปุ่มจะถูกปิดใช้งานและจะแสดงคำแนะนำเครื่องมือระบุว่าต้องการไฟล์ใด
- มีโควตาทรัพยากรเพียงพอสำหรับสร้างบริการโมเดล
- กลุ่มทรัพยากรอนุญาตประเภทเซสชันการอนุมาน
  :::

<a id="service-creation-workflow"></a>

#### เวิร์กโฟลว์การสร้างบริการ

เมื่อคุณคลิกปุ่ม "เรียกใช้รุ่นนี้" Backend.AI จะดำเนินตามเวิร์กโฟลว์ต่อไปนี้:

1. **ตรวจสอบไฟล์ที่จำเป็น**: ระบบจะตรวจสอบว่ามีทั้ง model-definition.yaml และ service-definition.toml อยู่ในโฟลเดอร์

2. **โคลนโฟลเดอร์ (หากจำเป็น)**: หากยังไม่มีสำเนาโคลนของโฟลเดอร์โมเดล:
   - จะมีกล่องโต้ตอบยืนยันถามว่าต้องการโคลนโฟลเดอร์หรือไม่
   - โฟลเดอร์จะถูกโคลนด้วยชื่อในรูปแบบ `{ชื่อเดิม}-{อักขระสุ่ม 4 ตัว}`
   - การแจ้งเตือนจะแสดงความคืบหน้าของการโคลน

![](../images/model_service_clone_confirmation.png)

<!-- TODO: Capture screenshot of clone confirmation dialog before service creation -->

3. **สร้างบริการ**: เมื่อโฟลเดอร์พร้อมแล้ว (จากการโคลนก่อนหน้าหรือการโคลนใหม่):
   - บริการจะถูกสร้างโดยอัตโนมัติโดยใช้การตั้งค่าจาก service-definition.toml
   - การแจ้งเตือนจะแสดงความคืบหน้าของการสร้างบริการ
   - คลิกการแจ้งเตือนเพื่อไปยังหน้าการให้บริการโมเดล

![](../images/model_service_creation_progress.png)

<!-- TODO: Capture screenshot of service creation progress notification -->

4. **ตรวจสอบรายละเอียดบริการ**: เมื่อสร้างเสร็จแล้ว ไปที่หน้าการให้บริการโมเดลเพื่อตรวจสอบรายละเอียดเอ็นด์พอยท์ ตรวจสอบสถานะบริการ และจัดการบริการ

![](../images/model_service_created_detail.png)

<!-- TODO: Capture screenshot of completed service in Model Serving page -->

:::note
หากมีโฟลเดอร์ที่โคลนจากการดำเนินการก่อนหน้าอยู่แล้ว ระบบจะใช้โฟลเดอร์นั้น
โดยอัตโนมัติเพื่อสร้างบริการ ในรุ่นอนาคตจะสามารถเลือกได้ว่าจะใช้โฟลเดอร์
โคลนใดเมื่อมีสำเนาหลายรายการ
:::

<a id="troubleshooting"></a>

#### การแก้ไขปัญหา

หากการสร้างบริการล้มเหลว:

- ตรวจสอบว่ารูปแบบของ model-definition.yaml และ service-definition.toml ถูกต้อง
- ตรวจสอบว่าโควตาทรัพยากรอนุญาตให้สร้างบริการโมเดลใหม่
- ตรวจสอบข้อความข้อผิดพลาดในสถานะบริการบนหน้าการให้บริการโมเดล
- สำหรับขั้นตอนการแก้ไขปัญหาโดยละเอียด โปรดดูเอกสาร [การให้บริการโมเดล](#model-serving)

สำหรับข้อมูลเพิ่มเติมเกี่ยวกับบริการโมเดล การกำหนดค่าบริการ และการจัดการเอ็นด์พอยท์ โปรดดูเอกสาร [การให้บริการโมเดล](#model-serving)

<a id="manage-resource-policy"></a>

## Manage Resource Policies

<a id="keypair-resource-policy"></a>

#### Keypair Resource Policy

In Backend.AI, administrators have the ability to set limits on the total resources available for each keypair, user, and project.
Resource policies enable you to define the maximum allowed resources and other compute session-related settings.
Additionally, it is possible to create multiple resource policies for different needs,
such as user or research requirements, and apply them on an individual basis.

The Resource Policies page allows administrators to view a list of all registered resource policies.
Administrators can review the resource policies established for keypairs, users, and projects directly on this page.
Let's begin by examining the resource policies for keypairs. In the figure below, there are
three policies in total (gardener, student, default). The infinity symbol (∞)
indicates that no resource restrictions have been applied to those resources.

![](../images/resource_policy_page.png)

The user account being used in this guide is currently assigned to the default
resource policy. This can be verified in the Credentials tab on the Users page.
You can also confirm that all resource policies are set to default in the Resource Policies panel.

![](../images/credentials.png)

To modify resource policies, click the 'Setting (Gear)' in the Control column of the
default policy group. In the Update Resource Policy dialog, every option is
editable except for Policy Name, which serves as the primary key for
distinguishing resource policies in the list. Uncheck the Unlimited checkbox
at the bottom of CPU, RAM, and fGPU, and set the resource limits to the desired
values. Ensure that the allocated resources are less than the total hardware
capacity. In this case, set CPU, RAM, and fGPU to 2, 4, and 1 respectively.
Click the OK button to apply the updated resource policy.

![](../images/update_resource_policy.png)

About details of each option in resource policy dialog, see the description below.

- Resource Policy
  - CPU: Specify the maximum amount of CPU cores. (max value: 512)
  - Memory: Specify the maximum amount of memory in GB. It would be good practice
    to set memory twice as large as the maximum value of GPU memory. (max value: 1024)
  - CUDA-capable GPU: Specify the maximum amount of physical GPUs. If fractional GPU
    is enabled by the server, this setting has no effect. (max value: 64)
  - CUDA-capable GPU (fractional): Fractional GPU (fGPU) is literally split a single
    GPU to multiple partitions in order to use GPU efficiently. Notice that the minimum
    amount of fGPU required is differed by each image. If fractional GPU is not enabled
    by the server, this settings has no effect. (max value: 256)

- Sessions
  - Cluster Size: Set the maximum limit for the number of multi-containers or
    multi-nodes that can be configured when creating a session.
  - Session Lifetime (sec.): Limits the maximum lifetime of a compute session
    from the reservation in the active status, including `PENDING` and
    `RUNNING` statuses. After this time, the session will be force-terminated
    even if it is fully utilized. This will be useful to prevent the session
    from running indefinitely.
  - Max Pending Session Count: Maximum number of compute sessions that can be in
    the `PENDING` status simultaneously.
  - Concurrent Jobs: Maximum number of concurrent compute session per keypair.
    If this value is set to 3, for example, users bound to this resource policy
    cannot create more than 3 compute sessions simultaneously. (max value: 100)
  - Idle timeout (sec.): Configurable period of time during which the user can
    leave their session untouched. If there is no activity at all on a
    compute session for idle timeout, the session will be garbage collected
    and destroyed automatically. The criteria of the "idleness" can be
    various and set by the administrators. (max value: 15552000 (approx. 180 days))
  - Max Concurrent SFTP Sessions: Maximum number of concurrent SFTP sessions.

- Folders
  - Allowed hosts: Backend.AI supports many NFS mountpoint. This field limits
    the accessibility to them. Even if a NFS named "data-1" is mounted on
    Backend.AI, users cannot access it unless it is allowed by resource policy.
  - (Deprecated since 23.09.4) Max. #: the maximum number of storage folders that
    can be created/invited. (max value: 100).

In the keypair resource policy list, check that the Resources value of the default
policy has been updated.

![](../images/keypair_resource_policy_update_check.png)

You can create a new resource policy by clicking the '+ Create' button. Each setting
value is the same as described above.

To create a resource policy and associate it with a keypair, go to the
Credentials tab of the Users page, click the gear button located in the
Controls column of the desired keypair, and click the Select Policy field to
choose it.

You can also delete each of resource keypairs by clicking trash can icon
in the Control column. When you click the icon, the confirmation popup will appears.
Click 'Delete' button to erase."

![](../images/resource_policy_delete_dialog.png)

:::note
If there's any users (including inactive users) following a resource policy to be deleted,
deletion may not be done. Before deleting a resource policy, please make sure that
no users remain under the resource policy.
:::

If you want to hide or show specific columns, click the 'Setting (Gear)' at the bottom right of the
table. This will bring up a dialog where you can select the columns you want to display.

![](../images/keypair_resource_policy_table_setting.png)

<a id="user-resource-policy"></a>

#### User Resource Policy

Starting from version 24.03, Backend.AI supports user resource policy management. While each
user can have multiple keypairs, a user can only have one user resource policy. In the user
resource policy page, users can set restrictions on various settings related to folders such as
Max Folder Count and Max Folder Size, as well as individual resource limits like Max Session
Count Per Model Session and Max Customized Image Count.

![](../images/user_resource_policy_list.png)

To create a new user resource policy, click the Create button.

![](../images/create_user_resource_policy.png)

- Name: The name of the user resource policy.
- Max Folder Count: The maximum number of folders that the user can create.
  If the user's folder count exceeds this value, user cannot create a new folder.
  If set to Unlimited, it is displayed as "∞".
- Max Folder Size: The maximum size of the user's storage space. If
  user's storage space exceeds this value, user cannot create a new data
  folder. If set to Unlimited, it is displayed as "∞".
- Max Session Count Per Model Session: The maximum number of available sessions per model
  service created by a user. Increasing this value can put a heavy load on the session
  scheduler and potentially lead to system downtime, so please caution when
  adjusting this setting.
- Max Customized Image Count: The maximum number of customized images that
  user can create. If user's customized image count exceeds this value,
  user cannot create a new customized image. If you want to know more about customized
  images, please refer to the [My Environments](#my-environments) section.

To update, click the 'Setting (Gear)' button in the control column. To delete, click the trash can
button.

:::note
Changing a resource policy may affect all users who use that policy, so use
it with caution.
:::

Similar to keypair resource policy, users can select and display only columns users want by
clicking the 'Setting (Gear)' button at the bottom right of the table.

<a id="project-resource-policy"></a>

#### นโยบายทรัพยากรโปรเจกต์

ตั้งแต่เวอร์ชัน 24.03 Backend.AI รองรับการจัดการนโยบายทรัพยากรโปรเจกต์ นโยบายทรัพยากรโปรเจกต์จัดการพื้นที่จัดเก็บ (โควตา) และข้อจำกัดที่เกี่ยวข้องกับโฟลเดอร์สำหรับโปรเจกต์

เมื่อคลิกแท็บ 'โปรเจกต์' ของหน้า 'นโยบายทรัพยากร' คุณจะเห็นรายการนโยบายทรัพยากรโปรเจกต์

![](../images/project_resource_policy_list.png)

หากต้องการสร้างนโยบายทรัพยากรโปรเจกต์ใหม่ ให้คลิกปุ่ม '+ สร้าง' ที่มุมบนขวาของตาราง

![](../images/create_project_resource_policy.png)

- **ชื่อ**: ชื่อของนโยบายทรัพยากรโปรเจกต์
- **จำนวนโฟลเดอร์สูงสุด**: จำนวนโฟลเดอร์โปรเจกต์สูงสุดที่ผู้ดูแลระบบสามารถสร้างได้ หากจำนวนโฟลเดอร์โปรเจกต์เกินค่านี้ ผู้ดูแลระบบจะไม่สามารถสร้างโฟลเดอร์โปรเจกต์ใหม่ได้ หากตั้งค่าเป็น Unlimited จะแสดงเป็น "∞"
- **ขนาดโฟลเดอร์สูงสุด**: ขนาดสูงสุดของพื้นที่จัดเก็บโปรเจกต์ หากพื้นที่จัดเก็บเกินค่านี้ ผู้ดูแลระบบจะไม่สามารถสร้างโฟลเดอร์โปรเจกต์ใหม่ได้ หากตั้งค่าเป็น Unlimited จะแสดงเป็น "∞"
- **จำนวนเครือข่ายสูงสุด**: จำนวนเครือข่ายสูงสุดที่สามารถสร้างสำหรับโปรเจกต์ได้ตั้งแต่ Backend.AI เวอร์ชัน 24.12 หากตั้งค่าเป็น Unlimited จะแสดงเป็น "∞"

ความหมายของแต่ละฟิลด์คล้ายกับนโยบายทรัพยากรผู้ใช้ ความแตกต่างคือนโยบายทรัพยากรโปรเจกต์จะใช้กับโฟลเดอร์โปรเจกต์ ในขณะที่นโยบายทรัพยากรผู้ใช้จะใช้กับโฟลเดอร์ผู้ใช้

หากต้องการเปลี่ยนแปลง ให้คลิกปุ่ม 'การตั้งค่า' ในคอลัมน์ 'การควบคุม' ชื่อนโยบายทรัพยากรไม่สามารถแก้ไขได้ การลบสามารถทำได้โดยคลิกปุ่มไอคอนถังขยะ

:::note
การเปลี่ยนนโยบายทรัพยากรอาจส่งผลกระทบต่อผู้ใช้ทั้งหมดที่ใช้นโยบายนั้น ดังนั้นควรใช้ด้วยความระมัดระวัง
:::

คุณสามารถเลือกและแสดงเฉพาะคอลัมน์ที่ต้องการโดยคลิกปุ่ม 'การตั้งค่า' ที่มุมล่างขวาของตาราง

หากต้องการบันทึกนโยบายทรัพยากรปัจจุบันเป็นไฟล์ ให้คลิกปุ่ม 'เพิ่มเติม' ที่มุมบนขวาของแต่ละแท็บ และเลือกเมนู 'ส่งออก CSV'

![](../images/keypair_export.png)

## มุมมองรวมสำหรับเซสชันที่รอดำเนินการ

ตั้งแต่ Backend.AI เวอร์ชัน 25.13.0 เป็นต้นไป มุมมองรวมสำหรับเซสชันที่รอดำเนินการจะพร้อมใช้งานในเมนูผู้ดูแลระบบ
หน้า Admin Session จะแสดงมุมมองรวมของเซสชันที่รอดำเนินการทั้งหมดภายใน
กลุ่มทรัพยากรที่เลือก หมายเลขดัชนีที่แสดงถัดจากสถานะจะระบุตำแหน่งในคิว
ที่เซสชันจะถูกสร้างเมื่อมีทรัพยากรเพียงพอ

![](../images/scheduler_page.png)

เช่นเดียวกับหน้า Session คุณสามารถคลิกชื่อเซสชันเพื่อเปิด drawer ที่แสดง
ข้อมูลรายละเอียดเกี่ยวกับเซสชันได้

<a id="manage-images"></a>

<a id="fair-share-scheduler"></a>

## ตัวจัดตาราง Fair Share

ตั้งแต่ Backend.AI core เวอร์ชัน 26.2.0 เป็นต้นไป หน้า Fair Share Scheduler จะพร้อมใช้งาน
ในเมนู Administration ฟีเจอร์นี้ช่วยให้ผู้ดูแลระบบสามารถจัดการน้ำหนักการจัดตาราง
Fair Share ตามโครงสร้างลำดับชั้นของกลุ่มทรัพยากร โดเมน โปรเจกต์ และผู้ใช้

การจัดตาราง Fair Share จะจัดสรรทรัพยากรการคำนวณโดยอิงจากรูปแบบการใช้งานในอดีต
เพื่อให้มั่นใจว่าทรัพยากรจะถูกกระจายอย่างเป็นธรรมในหมู่ผู้ใช้ ผู้ใช้ที่ใช้
ทรัพยากรน้อยในอดีตจะได้รับลำดับความสำคัญในการจัดตารางสูงกว่า ในขณะที่ผู้ใช้
ที่ใช้มากกว่าจะได้รับลำดับความสำคัญต่ำกว่า ผู้ดูแลระบบสามารถปรับแต่งพฤติกรรมนี้
ได้โดยการปรับน้ำหนักในแต่ละระดับของลำดับชั้น

:::note
Fair Share Scheduler จะพร้อมใช้งานเฉพาะเมื่อประเภทตัวจัดตารางของกลุ่มทรัพยากร
ถูกตั้งค่าเป็น `FAIR_SHARE` เท่านั้น สำหรับการกำหนดค่าประเภทตัวจัดตารางของ
กลุ่มทรัพยากร โปรดดูที่ส่วนจัดการกลุ่มทรัพยากร
:::

หากต้องการเข้าถึงฟีเจอร์นี้ ให้คลิกเมนู Scheduler ในส่วน Administration ของแถบด้านข้าง
หน้าจะแสดงแท็บการตั้งค่า Fair Share พร้อมอินเทอร์เฟซ drill-down 4 ขั้นตอน

![](../images/fair_share_resource_group_page.png)

หน้าถูกจัดระเบียบเป็น 4 ขั้นตอนตามลำดับชั้น:

1. **กลุ่มทรัพยากร**: กำหนดค่าพารามิเตอร์หลักของ Fair Share สำหรับแต่ละกลุ่มทรัพยากร
2. **โดเมน**: ตั้งค่าน้ำหนักสำหรับโดเมนภายในกลุ่มทรัพยากร
3. **โปรเจกต์**: ตั้งค่าน้ำหนักสำหรับโปรเจกต์ภายในโดเมน
4. **ผู้ใช้**: ตั้งค่าน้ำหนักสำหรับผู้ใช้แต่ละคนภายในโปรเจกต์

แถบตัวบ่งชี้ขั้นตอนที่ด้านบนของหน้าจะแสดงตำแหน่งปัจจุบันในลำดับชั้น
ขั้นตอนที่เสร็จสิ้นจะแสดงชื่อของรายการที่เลือก คุณสามารถคลิกที่ขั้นตอนที่
เสร็จสิ้นเพื่อย้อนกลับไปยังระดับนั้นได้

![](../images/fair_share_step_indicator.png)

หากกลุ่มทรัพยากรที่เลือกไม่ได้ตั้งค่าประเภทตัวจัดตารางเป็น `FAIR_SHARE`
จะมีการแจ้งเตือนเป็นคำเตือนว่า Fair Share Scheduler ไม่ได้เปิดใช้งานสำหรับ
กลุ่มทรัพยากรนั้น

![](../images/fair_share_scheduler_warning.png)

ในแต่ละขั้นตอน ฟีเจอร์ทั่วไปต่อไปนี้พร้อมใช้งาน:

- **การกรอง**: ใช้ตัวกรองค้นหาตามคุณสมบัติเพื่อจำกัดผลลัพธ์ตามชื่อ ในขั้นตอนผู้ใช้ จะมีตัวกรองเพิ่มเติมสำหรับอีเมลและสถานะการใช้งาน
- **การเรียงลำดับ**: คลิกส่วนหัวคอลัมน์เพื่อเรียงลำดับตารางตามคอลัมน์นั้น
- **การแบ่งหน้า**: นำทางผ่านผลลัพธ์พร้อมขนาดหน้าที่กำหนดค่าได้
- **รีเฟรชอัตโนมัติ**: ข้อมูลจะรีเฟรชอัตโนมัติทุก 7 วินาที ปุ่มรีเฟรชด้วยตนเองก็พร้อมใช้งานเช่นกัน

### กลุ่มทรัพยากร

ขั้นตอนกลุ่มทรัพยากรจะแสดงตารางของกลุ่มทรัพยากรทั้งหมดพร้อมการกำหนดค่า
Fair Share

![](../images/fair_share_resource_group_page.png)

ตารางประกอบด้วยคอลัมน์ต่อไปนี้:

- **ชื่อ**: ชื่อกลุ่มทรัพยากร คลิกชื่อเพื่อ drill down ไปยังการตั้งค่าระดับโดเมนของกลุ่มทรัพยากรนั้น
- **ตัวควบคุม**: ปุ่มตั้งค่า (เฟือง) ที่เปิด modal การตั้งค่า Fair Share ของกลุ่มทรัพยากร
- **การจัดสรร**: การใช้ทรัพยากรแสดงการใช้งาน/ความจุสำหรับแต่ละประเภททรัพยากรที่จัดสรรให้กลุ่มทรัพยากร (เช่น CPU, Memory, CUDA GPU)
- **น้ำหนักทรัพยากร**: น้ำหนักตามประเภททรัพยากร แสดง "ค่าเริ่มต้น" หากใช้น้ำหนักเริ่มต้น
- **น้ำหนักเริ่มต้น**: ค่าน้ำหนักสำรองสำหรับโดเมน โปรเจกต์ และผู้ใช้ที่ไม่ได้กำหนดน้ำหนัก
- **หน่วยการลดทอน**: ช่วงเวลา (เป็นวัน) สำหรับรวบรวมการใช้งาน
- **ครึ่งชีวิต**: ช่วงเวลา (เป็นวัน) ที่อัตราการสะท้อนการใช้งานลดลงครึ่งหนึ่ง
- **ช่วงเวลาย้อนหลัง**: ช่วง (เป็นวัน) ของประวัติการใช้งานที่สะท้อนในการคำนวณ

### การตั้งค่า Fair Share ของกลุ่มทรัพยากร

คลิกปุ่มตั้งค่า (เฟือง) ในคอลัมน์ตัวควบคุมของกลุ่มทรัพยากรเพื่อเปิด modal
การตั้งค่า Fair Share

![](../images/fair_share_resource_group_setting_modal.png)

:::warning
การเปลี่ยนแปลงจะยังไม่สะท้อนทันทีในการคำนวณ Fair Share และอาจใช้เวลา
ประมาณ 5 นาทีเนื่องจากรอบการคำนวณ
:::

modal ประกอบด้วยฟิลด์ต่อไปนี้:

- **กลุ่มทรัพยากร**: ฟิลด์อ่านอย่างเดียวที่แสดงชื่อกลุ่มทรัพยากร
- **ครึ่งชีวิต**: ช่วงเวลาที่อัตราการสะท้อนการใช้งานลดลงครึ่งหนึ่ง ระบุเป็นวัน (ขั้นต่ำ 1) ตัวอย่างเช่น หากตั้งเป็น 7 วัน การใช้งานเมื่อ 7 วันก่อนจะคำนวณที่ 50% และการใช้งานเมื่อ 14 วันก่อนที่ 25% แนะนำให้ตั้งค่าเป็นพหุคูณของหน่วยการลดทอน
- **ช่วงเวลาย้อนหลัง**: ช่วงของประวัติการใช้งานที่สะท้อนในการคำนวณ Fair Share ระบุเป็นวัน (ขั้นต่ำ 1) การใช้งานก่อนช่วงเวลานี้จะถูกยกเว้นจากการคำนวณ แนะนำให้ตั้งค่าเป็นพหุคูณของครึ่งชีวิต
- **น้ำหนักเริ่มต้น**: ค่าเริ่มต้นที่ใช้กับโดเมน โปรเจกต์ และผู้ใช้ที่ไม่ได้กำหนดน้ำหนัก (ขั้นต่ำ 1, ขั้น 0.1)
- **น้ำหนักทรัพยากร**: น้ำหนักตามประเภททรัพยากร (เช่น CPU, Memory, GPU) แต่ละรายการมีค่าขั้นต่ำ 1 และขั้น 0.1 ส่วนนี้จะแสดงเฉพาะเมื่อกลุ่มทรัพยากรมีน้ำหนักทรัพยากรเท่านั้น

### โดเมน

หลังจากเลือกกลุ่มทรัพยากร ขั้นตอนโดเมนจะแสดงตารางของโดเมนพร้อมน้ำหนัก
Fair Share และการใช้งานภายในกลุ่มทรัพยากรนั้น

![](../images/fair_share_domain_page.png)

ตารางประกอบด้วยคอลัมน์ต่อไปนี้:

- **ชื่อ**: ชื่อโดเมน คลิกชื่อเพื่อ drill down ไปยังการตั้งค่าระดับโปรเจกต์ของโดเมนนั้น
- **ตัวควบคุม**: ปุ่มตั้งค่า (เฟือง) ที่เปิด modal การตั้งค่าน้ำหนักของโดเมนนี้
- **น้ำหนัก**: ค่าน้ำหนักปัจจุบัน แสดง "ค่าเริ่มต้น" หากใช้น้ำหนักเริ่มต้น
- **ตัวคูณการแบ่งสัดส่วนอย่างเป็นธรรม**: ลำดับความสำคัญในการจัดตารางที่คำนวณโดยตัวจัดตาราง ค่าที่สูงกว่าหมายถึงลำดับความสำคัญที่สูงกว่า
- **การจัดสรรทรัพยากร**: การใช้ทรัพยากรเฉลี่ยต่อวันที่ถูกลดทอนตามประเภททรัพยากร (CPU, Memory, GPU / Day)
- **แก้ไขเมื่อ**: timestamp การแก้ไขครั้งล่าสุด
- **สร้างเมื่อ**: timestamp การสร้าง

คุณสามารถเลือกหลายแถวโดยใช้ช่องทำเครื่องหมายทางด้านซ้ายของตาราง เมื่อเลือก
แถวแล้ว จะมีปุ่มเพิ่มเติม 2 ปุ่มปรากฏขึ้น:

- **กราฟการใช้งาน** (ไอคอนแผนภูมิ): เปิด modal ประวัติการใช้งานสำหรับรายการที่เลือก
- **แก้ไขเป็นกลุ่ม** (ไอคอนเฟือง): เปิด modal การตั้งค่าน้ำหนักเพื่อแก้ไขน้ำหนักของรายการที่เลือกทั้งหมดพร้อมกัน

### โปรเจกต์

หลังจากเลือกโดเมน ขั้นตอนโปรเจกต์จะแสดงตารางของโปรเจกต์ที่มีโครงสร้าง
คอลัมน์เดียวกันกับขั้นตอนโดเมน คลิกชื่อโปรเจกต์เพื่อ drill down ไปยัง
ขั้นตอนผู้ใช้

![](../images/fair_share_project_page.png)

การดำเนินการเป็นกลุ่มเดียวกัน (กราฟการใช้งานและแก้ไขเป็นกลุ่ม) จะพร้อมใช้งานเมื่อเลือกแถว

### ผู้ใช้

หลังจากเลือกโปรเจกต์ ขั้นตอนผู้ใช้จะแสดงตารางของผู้ใช้แต่ละคนพร้อมน้ำหนัก
Fair Share และการใช้งาน

![](../images/fair_share_user_page.png)

ตารางประกอบด้วยคอลัมน์ต่อไปนี้:

- **อีเมล**: ที่อยู่อีเมลของผู้ใช้
- **ชื่อ**: ชื่อของผู้ใช้
- **ตัวควบคุม**: ปุ่มตั้งค่า (เฟือง) ที่เปิด modal การตั้งค่าน้ำหนักของผู้ใช้นี้
- **น้ำหนัก**: ค่าน้ำหนักปัจจุบัน แสดง "ค่าเริ่มต้น" หากใช้น้ำหนักเริ่มต้น
- **ตัวคูณการแบ่งสัดส่วนอย่างเป็นธรรม**: ลำดับความสำคัญในการจัดตารางที่คำนวณโดยตัวจัดตาราง
- **การจัดสรรทรัพยากร**: การใช้ทรัพยากรเฉลี่ยต่อวันที่ถูกลดทอนตามประเภททรัพยากร
- **แก้ไขเมื่อ**: timestamp การแก้ไขครั้งล่าสุด
- **สร้างเมื่อ**: timestamp การสร้าง

:::note
ในขั้นตอนผู้ใช้ จะมีคุณสมบัติตัวกรองเพิ่มเติม: อีเมล ชื่อ และสถานะการใช้งาน
:::

การดำเนินการเป็นกลุ่มเดียวกัน (กราฟการใช้งานและแก้ไขเป็นกลุ่ม) จะพร้อมใช้งานเมื่อเลือกแถว

### การแก้ไขน้ำหนัก Fair Share

หากต้องการแก้ไขน้ำหนัก Fair Share สำหรับโดเมน โปรเจกต์ หรือผู้ใช้ ให้คลิกปุ่ม
ตั้งค่า (เฟือง) ในคอลัมน์ตัวควบคุมของแถวที่ต้องการ modal การตั้งค่าน้ำหนักจะเปิดขึ้น

![](../images/fair_share_weight_setting_modal.png)

:::warning
การเปลี่ยนแปลงจะยังไม่สะท้อนทันทีในการคำนวณ Fair Share และอาจใช้เวลา
ประมาณ 5 นาทีเนื่องจากรอบการคำนวณ
:::

ในโหมดแก้ไขเดี่ยว modal จะแสดงชื่อรายการ (อ่านอย่างเดียว) และฟิลด์ป้อนน้ำหนัก

- **น้ำหนัก**: ตัวคูณฐานที่กำหนดลำดับความสำคัญสำหรับการจัดตารางแบบ Fair Share ยิ่งค่าสูง จะมีลำดับความสำคัญสูงขึ้น ค่าเริ่มต้นคือ "1.0" น้ำหนัก "2.0" จะมีลำดับความสำคัญเป็นสองเท่าของ "1.0" ค่าขั้นต่ำคือ 1 และขั้นคือ 0.1

หากต้องการแก้ไขน้ำหนักของหลายรายการพร้อมกัน ให้เลือกแถวที่ต้องการโดยใช้ช่อง
ทำเครื่องหมายในตาราง จากนั้นคลิกปุ่มแก้ไขเป็นกลุ่ม (ไอคอนเฟือง) ในโหมด
แก้ไขเป็นกลุ่ม modal จะแสดงรายการแท็กของรายการที่เลือกทั้งหมดและฟิลด์ป้อน
น้ำหนักเดียวที่จะใช้กับทุกรายการ

![](../images/fair_share_weight_bulk_edit_modal.png)

:::note
หากกลุ่มทรัพยากรที่เลือกไม่ได้ตั้งค่าประเภทตัวจัดตารางเป็น `FAIR_SHARE`
จะมีการแจ้งเตือนเป็นคำเตือนแสดงใน modal
:::

### การดูประวัติการใช้งาน

หากต้องการดูประวัติการใช้งานของโดเมน โปรเจกต์ หรือผู้ใช้ ให้เลือกแถวที่ต้องการ
โดยใช้ช่องทำเครื่องหมายในตาราง จากนั้นคลิกปุ่มกราฟการใช้งาน (ไอคอนแผนภูมิ)
modal ประวัติการใช้งานจะเปิดขึ้น

![](../images/fair_share_usage_bucket_modal.png)

modal จะแสดงข้อมูลต่อไปนี้:

- **ตัวเลือกช่วงวันที่**: เลือกช่วงวันที่สำหรับประวัติการใช้งาน มีพรีเซ็ตสำหรับ 7 วันที่ผ่านมา, 30 วันที่ผ่านมา และ 90 วันที่ผ่านมา
- **ปุ่มรีเฟรช**: รีเฟรชข้อมูลการใช้งานด้วยตนเอง
- **ข้อมูลบริบท**: แสดงกลุ่มทรัพยากร โดเมน และโปรเจกต์ (ขึ้นอยู่กับขั้นตอนปัจจุบัน)
- **รายการที่เลือก**: แสดงเป็นแท็กที่แสดงชื่อของรายการที่เลือก
- **แผนภูมิการใช้งาน**: แผนภูมิแสดงการใช้ทรัพยากรเฉลี่ยต่อวันในช่วงเวลาที่เลือก

<a id="manage-images"></a>

## การจัดการอิมเมจ

ผู้ดูแลระบบสามารถจัดการอิมเมจที่ใช้ในการสร้างเซสชันการคำนวณได้ในแท็บ Images ของหน้า Environments ในแท็บนี้จะแสดงข้อมูลเมตาของอิมเมจทั้งหมดที่อยู่ในเซิร์ฟเวอร์ Backend.AI ในปัจจุบัน คุณสามารถตรวจสอบข้อมูลต่างๆ เช่น registry, สถาปัตยกรรม, namespace, ชื่ออิมเมจ, digest และทรัพยากรขั้นต่ำที่จำเป็นสำหรับแต่ละอิมเมจ สำหรับอิมเมจที่ดาวน์โหลดไปยังโหนดเอเจนต์หนึ่งรายการขึ้นไป จะมีแท็ก `installed` ในคอลัมน์ Status

:::note
ฟีเจอร์การติดตั้งอิมเมจโดยเลือกเอเจนต์เฉพาะกำลังอยู่ระหว่างการพัฒนา
:::

![](../images/image_list_page.png)


รายการอิมเมจจะแสดงคอลัมน์เพิ่มเติมสำหรับข้อมูลอิมเมจที่ละเอียดยิ่งขึ้น:

- **สถาปัตยกรรม**: สถาปัตยกรรม CPU ของอิมเมจ (เช่น x86_64, aarch64)
- **เนมสเปซ**: เนมสเปซของอิมเมจภายในรีจิสทรี
- **ชื่อภาพฐาน**: ชื่อพื้นฐานของอิมเมจ พร้อมแท็กนามแฝงเพื่อให้ระบุตัวตนได้ง่ายขึ้น
- **เวอร์ชัน**: แท็กเวอร์ชันของอิมเมจ
- **แท็ก**: แท็กรายละเอียดที่เกี่ยวข้องกับอิมเมจ แสดงเป็นแท็กคู่พร้อมนามแฝง

คุณสามารถเลือกอิมเมจที่ยังไม่ได้ติดตั้งหลายรายการ แล้วคลิกปุ่ม `ติดตั้ง` เพื่อติดตั้งบนโหนดเอเจนต์ที่มีอยู่พร้อมกัน

You can change the minimum resource requirements for each image by clicking the
'Setting (Gear)' in the Controls panel. Each image has hardware and resource
requirements for minimal operation. (For example, for GPU-only images, there
must be a minimum allocated GPU.) The default value for the minimum resource
amount is provided as embedded in the image's metadata. If an attempt is made to
create a compute session with a resource that is less than the amount of
resources specified in each image, the request is automatically adjusted to the
minimum resource requirements for the image and then generated, not cancelled.

![](../images/update_image_resource_setting.png)

:::note
Don't change the minimum resource requirements to an amount less than the
predefined value! The minimum resource requirements included in the image
metadata are values that have been tested and determined. If you are not
really sure about the minimum amount of resources you want to change, leave
it in the default.
:::

Additionally, you can add or modify the supported apps for each image by clicking the 'Apps' icon located in the Controls column.
Once you click the icon, the name of the app and its corresponding port number will be displayed accordingly.

![](../images/manage_app_dialog.png)

In this interface, you can add supported custom applications by clicking the '+ Add' button below. To delete an application, simply click the 'red trash can' button on the right side of each row.

:::note
You need to reinstall the image after changing the managed app.

![](../images/confirmation_dialog_for_manage_app_change_in_image.png)
:::

<a id="manage-docker-registry"></a>

## การจัดการ Docker Registry

คุณสามารถคลิกแท็บ Registries ในหน้า Environments เพื่อดูข้อมูลของ Docker registry ที่เชื่อมต่ออยู่ในปัจจุบัน `cr.backend.ai` ถูกลงทะเบียนเป็นค่าเริ่มต้น ซึ่งเป็น registry ที่ให้บริการโดย Harbor

:::note
ในสภาพแวดล้อมแบบออฟไลน์ ไม่สามารถเข้าถึง registry เริ่มต้นได้ ให้คลิกไอคอนถังขยะทางขวาเพื่อลบออก
:::

คลิกไอคอนรีเฟรชในคอลัมน์ 'การควบคุม' เพื่ออัปเดตข้อมูลเมตาอิมเมจสำหรับ Backend.AI จาก registry ที่เชื่อมต่อ ข้อมูลอิมเมจที่ไม่มีเลเบลสำหรับ Backend.AI จะไม่ถูกอัปเดต

![](../images/image_registries_page.png)

คลิกปุ่ม '+ Add Registry' เพื่อเพิ่ม Docker registry ส่วนตัวของคุณ กล่องโต้ตอบสร้าง registry มีฟิลด์ต่อไปนี้:

- **ชื่อรีจิสทรี**: ชื่อเฉพาะของ registry (สูงสุด 50 ตัวอักษร) ต้องตรงกับคำนำหน้าที่ใช้ในชื่ออิมเมจที่จัดเก็บใน registry
- **URL ทะเบียน**: URL ของ registry ต้องมี scheme เช่น `http://` หรือ `https://` อย่างชัดเจน
- **ชื่อผู้ใช้**: ตัวเลือก กรอกหากมีการตั้งค่าการยืนยันตัวตนแยกต่างหากใน registry
- **รหัสผ่าน**: ตัวเลือก เมื่อแก้ไข registry ที่มีอยู่ ให้เลือกช่องทำเครื่องหมาย `Change Password` เพื่อเปลี่ยน
- **ประเภททะเบียน**: เลือกประเภทของ registry ประเภทที่รองรับ: `docker`, `harbor`, `harbor2`, `github`, `gitlab`, `ecr`, `ecr-public`
- **ชื่อโครงการ**: โปรเจกต์หรือ namespace ใน registry (จำเป็น) สำหรับ GitLab registry ให้ใช้เส้นทางเต็มรวม namespace และชื่อโปรเจกต์
- **ข้อมูลเพิ่มเติม**: สตริง JSON สำหรับการกำหนดค่าเพิ่มเติมที่จำเป็นสำหรับแต่ละประเภท registry ฟิลด์นี้ใช้ได้ตั้งแต่เวอร์ชัน 24.09.3

![](../images/add_registry_dialog.png)


<a id="gitlab-container-registry-configuration"></a>

### การกำหนดค่า GitLab Container Registry

เมื่อเพิ่ม GitLab container registry คุณต้องระบุ `api_endpoint` ในฟิลด์ Extra Information เนื่องจาก GitLab ใช้ endpoint แยกสำหรับ container registry และ GitLab API

สำหรับ **GitLab.com (public instance)**:

- Registry URL: `https://registry.gitlab.com`
- Extra Information: `{"api_endpoint": "https://gitlab.com"}`

สำหรับ **self-hosted (on-premise) GitLab**:

- Registry URL: URL ของ GitLab registry ของคุณ (เช่น `https://registry.example.com`)
- Extra Information: `{"api_endpoint": "https://gitlab.example.com"}`

:::note
`api_endpoint` ควรชี้ไปที่ URL ของ GitLab instance ของคุณ ไม่ใช่ URL ของ registry
:::

หมายเหตุการกำหนดค่าเพิ่มเติม:

- **รูปแบบเส้นทางโปรเจกต์**: เมื่อระบุโปรเจกต์ ให้ใช้เส้นทางเต็มรวม namespace และชื่อโปรเจกต์ (เช่น `namespace/project-name`) ทั้งสองส่วนจำเป็นสำหรับให้ registry ทำงานได้อย่างถูกต้อง

- **สิทธิ์ของ access token**: access token ที่ใช้สำหรับ registry ต้องมีทั้ง scope `read_registry` และ `read_api` scope `read_api` จำเป็นสำหรับ Backend.AI เพื่อสอบถาม GitLab API สำหรับข้อมูลเมตาอิมเมจระหว่างการ rescan

คุณยังสามารถอัปเดตข้อมูลของ registry ที่มีอยู่ได้ ยกเว้นชื่อรีจิสทรี

หลังจากสร้าง registry และอัปเดตข้อมูลเมตาอิมเมจแล้ว ผู้ใช้ยังไม่สามารถใช้อิมเมจได้ทันที คุณต้องเปิดใช้งาน registry โดยสลับสวิตช์ Enabled ในรายการ registry เพื่ออนุญาตให้ผู้ใช้เข้าถึงอิมเมจจาก registry

<a id="manage-resource-preset"></a>

## การจัดการ Resource Preset

Resource preset ที่กำหนดไว้ล่วงหน้าจะแสดงในแผง Resource allocation เมื่อสร้างเซสชันการคำนวณ Superadmin สามารถจัดการ resource preset เหล่านี้ได้

![](../images/resource_presets_in_resource_monitor.png)

ไปที่แท็บ Resource Presets ในหน้า Environment คุณสามารถตรวจสอบรายการ resource preset ที่กำหนดไว้ในปัจจุบัน

![](../images/resource_preset_list.png)

คุณสามารถตั้งค่าทรัพยากรเช่น CPU, RAM, fGPU เป็นต้น ที่จะให้บริการโดย resource preset ได้โดยคลิกปุ่ม 'การตั้งค่า' ในคอลัมน์ 'การควบคุม' โมดัลสร้างหรือแก้ไข Resource Preset จะแสดงฟิลด์ของทรัพยากรที่มีอยู่ในปัจจุบัน ขึ้นอยู่กับการตั้งค่าเซิร์ฟเวอร์ ทรัพยากรบางอย่างอาจไม่แสดง หลังจากตั้งค่าทรัพยากรตามต้องการ ให้บันทึกและตรวจสอบว่า preset ที่สอดคล้องกันจะแสดงเมื่อสร้างเซสชันการคำนวณ หากทรัพยากรที่มีน้อยกว่าปริมาณทรัพยากรที่กำหนดใน preset ที่สอดคล้องกัน preset จะไม่แสดง

ไดอะล็อกค่าที่กำหนดไว้ล่วงหน้าของทรัพยากรประกอบด้วย:

- **ชื่อค่าที่กำหนดไว้ล่วงหน้า**: ชื่อเฉพาะสำหรับค่าที่กำหนดไว้ล่วงหน้า (อนุญาตเฉพาะตัวอักษรและตัวเลข, จุด, ขีดกลาง และขีดล่าง)
- **กลุ่มทรัพยากร**: (แบบมีเงื่อนไข) เชื่อมโยง preset กับกลุ่มทรัพยากรเฉพาะ
- **ค่าที่กำหนดไว้ล่วงหน้าของทรัพยากร**: ฟิลด์แบบไดนามิกสำหรับทรัพยากรแต่ละประเภทที่มี (CPU, หน่วยความจำ, GPU เป็นต้น) ฟิลด์หน่วยความจำรองรับการป้อนหน่วยแบบไดนามิก (MiB, GiB, TiB, PiB)
- **หน่วยความจำที่ใช้ร่วมกัน**: ปริมาณหน่วยความจำที่ใช้ร่วมกันที่จัดสรรให้กับค่าที่กำหนดไว้ล่วงหน้า ค่านี้ต้องน้อยกว่าค่า**หน่วยความจำ**

![](../images/modify_resource_preset_dialog.png)

คุณยังสามารถสร้าง resource preset ได้โดยคลิกปุ่ม '+ สร้างค่าที่กำหนดไว้ล่วงหน้า' ที่มุมบนขวาของแท็บ Resource Presets คุณไม่สามารถสร้าง resource preset ที่มีชื่อเดียวกันกับที่มีอยู่แล้วได้ เนื่องจากเป็นค่าคีย์สำหรับแยกแยะแต่ละ resource preset

![](../images/create_resource_preset_dialog.png)

<a id="manage-agent-nodes"></a>

## การจัดการโหนดเอเจนต์

Superadmin สามารถดูรายการโหนดเอเจนต์ที่เชื่อมต่อกับ Backend.AI อยู่ในปัจจุบันได้โดยไปที่หน้า Resources คุณสามารถตรวจสอบ IP ของโหนดเอเจนต์ เวลาที่เชื่อมต่อ ทรัพยากรที่ใช้งานจริงอยู่ในปัจจุบัน เป็นต้น WebUI ไม่มีฟังก์ชันในการจัดการโหนดเอเจนต์

<a id="query-agent-nodes"></a>

#### สอบถามโหนดเอเจนต์

![](../images/agent_list.png)

คุณยังสามารถดูการใช้ทรัพยากรที่แน่นอนในโหนดเอเจนต์ได้โดยคลิกไอคอนโน้ตในคอลัมน์ 'การควบคุม'

![](../images/detailed_agent_node_usage_information.png)

ในแท็บ Terminated คุณสามารถตรวจสอบข้อมูลของเอเจนต์ที่เคยเชื่อมต่อแล้วถูกยกเลิกหรือตัดการเชื่อมต่อ สามารถใช้เป็นข้อมูลอ้างอิงสำหรับการจัดการโหนด หากรายการว่างเปล่า หมายความว่าไม่มีการตัดการเชื่อมต่อหรือการยกเลิกเกิดขึ้น

![](../images/terminated_agent_list.png)

<a id="set-schedulable-status-of-agent-nodes"></a>

#### ตั้งค่าสถานะ Schedulable ของโหนดเอเจนต์

คุณอาจต้องการป้องกันไม่ให้เซสชันการคำนวณใหม่ถูกจัดตารางไปยังบริการ Agent โดยไม่ต้องหยุดบริการ ในกรณีนี้ คุณสามารถปิดใช้งานสถานะ Schedulable ของ Agent จากนั้นคุณสามารถบล็อกการสร้างเซสชันใหม่ในขณะที่รักษาเซสชันที่มีอยู่บน Agent

![](../images/agent_settings.png)

<a id="manage-resource-group"></a>

## การจัดการกลุ่มทรัพยากร

เอเจนต์สามารถจัดกลุ่มเป็นหน่วยที่เรียกว่ากลุ่มทรัพยากร ตัวอย่างเช่น สมมติว่ามีเอเจนต์ 3 ตัวที่มี GPU V100 และเอเจนต์ 2 ตัวที่มี GPU P100 หากคุณต้องการแยก GPU สองประเภทให้ผู้ใช้เห็นแยกกัน คุณสามารถจัดกลุ่มเอเจนต์ V100 สามตัวเป็นกลุ่มทรัพยากรหนึ่ง และเอเจนต์ P100 สองตัวที่เหลือเป็นอีกกลุ่มทรัพยากรหนึ่ง

การเพิ่มเอเจนต์เฉพาะเข้ากลุ่มทรัพยากรเฉพาะยังไม่ได้จัดการใน WebUI ในปัจจุบัน สามารถทำได้โดยแก้ไขไฟล์ config ของเอเจนต์จากตำแหน่งที่ติดตั้งและรีสตาร์ท agent daemon การจัดการกลุ่มทรัพยากรสามารถทำได้ในแท็บ Resource Group ของหน้า Resource

![](../images/resource_group_page.png)

<a id="scheduling-methods"></a>

คุณสามารถแก้ไขกลุ่มทรัพยากรได้โดยคลิกปุ่ม 'การตั้งค่า' ในคอลัมน์ 'การควบคุม' ในฟิลด์ 'ตัวจัดกำหนดการ' คุณสามารถเลือกวิธีการจัดตารางสำหรับการสร้างเซสชันการคำนวณ ปัจจุบันมีสี่ประเภท: `FIFO`, `LIFO`, `DRF` และ `FAIR_SHARE` `FIFO` และ `LIFO` เป็นวิธีการจัดตารางที่สร้างเซสชันที่เข้าคิวเป็นลำดับแรกหรือลำดับสุดท้ายในคิวงาน `DRF` ย่อมาจาก Dominant Resource Fairness มีเป้าหมายเพื่อจัดสรรทรัพยากรอย่างเท่าเทียมที่สุดสำหรับแต่ละผู้ใช้ `FAIR_SHARE` จัดสรรทรัพยากรตามรูปแบบการใช้งานในอดีต สำหรับรายละเอียดเพิ่มเติม โปรดดูที่ส่วน [Fair Share Scheduler](#fair-share-scheduler) คุณสามารถปิดใช้งานนโยบายทรัพยากรได้โดยปิดสถานะ 'ใช้งาน'

![](../images/modify_resource_group.png)

กลุ่มทรัพยากรมีตัวเลือกเพิ่มเติมดังนี้:

- **ประเภทเซสชันที่อนุญาต**: ผู้ใช้สามารถเลือกประเภทของเซสชันได้ กลุ่มทรัพยากรสามารถอนุญาตประเภทเซสชันบางประเภท ประเภทเซสชันที่อนุญาต ได้แก่ Interactive, Batch, Inference และ System
- **ที่อยู่เซิร์ฟเวอร์ WSProxy**: ตั้งค่าที่อยู่ WSProxy สำหรับเอเจนต์ของกลุ่มทรัพยากร
- **โทเค็น API ของ WSProxy**: โทเค็น API สำหรับการยืนยันตัวตนกับ WSProxy
- **ใช้งาน**: เปิด/ปิดสถานะการใช้งานของกลุ่มทรัพยากร
- **สาธารณะ**: เปิดเผยกลุ่มทรัพยากรให้ผู้ใช้ทุกคนเห็น
- **การหมดเวลาที่รออยู่**: เซสชันการคำนวณจะถูกยกเลิกหากอยู่ในสถานะ `PENDING` นานกว่าการหมดเวลาที่รออยู่ ตั้งค่าเป็นศูนย์ (0) หากไม่ต้องการใช้ฟีเจอร์นี้
- **จำนวนครั้งที่พยายามข้ามเซสชันที่รออยู่**: จำนวนครั้งที่ scheduler พยายามก่อนข้ามเซสชัน PENDING

คุณสามารถสร้างกลุ่มทรัพยากรใหม่ได้โดยคลิกปุ่ม '+ สร้าง' เช่นเดียวกับตัวเลือกการสร้างอื่นๆ คุณไม่สามารถสร้างกลุ่มทรัพยากรที่มีชื่อเดียวกันกับที่มีอยู่แล้วได้ เนื่องจากชื่อเป็นค่าคีย์

![](../images/create_resource_group.png)

<a id="storages"></a>

## การจัดเก็บข้อมูล

On STORAGES tab, you can see what kind of mount volumes (usually NFS) exist.
From 23.03 version, We provide per-user/per-project quota setting on storage that supports quota management.
By using this feature, admin can easily manage and monitor the exact amount of storage usage for each user and project based folder.

![](../images/storage_list.png)

In order to set quota, you need to first access to storages tab in resource page.
And then, click 'Setting (Gear)' in control column.

:::note
Please remind that quota setting is only available in storage that provides quota setting
(e.g. XFS, CephFS, NetApp, Purestorage, etc.). Although you can see the usage of storage
in quota setting page regardless of storage, you cannot configure the quota which doesn't
support quota configuration internally.

![](../images/no_support_quota_setting.png)
:::

<a id="quota-setting-panel"></a>

#### Quota Setting Panel

In Quota setting page, there are two panels.

![](../images/quota_setting_page.png)

- Overview panel
  - Usage: Shows the actual amount usage of the selected storage.
  - Endpoint: Represents the mount point of the selected storage.
  - Backend Type: The type of storage.
  - Capabilities: The supported feature of the selected storage.

- Quota Settings
  - For User: Configure per-user quota setting here.
  - For Project: Configure per-project quota(project-folder) setting here.
  - ID: Corresponds to user or project id.
  - Hard Limit (GB): Currently set hard limit quota for selected quota.
  - Control: Provides editing the hard limit or even deleting the quota setting.

<a id="set-user-quota"></a>

#### Set User Quota

In Backend.AI, there are two types of vfolders created by user and admin(project). In this section,
we would like to show how to check current quota setting per-user and how to configure it.
First, make sure the active tab of quota settings panel is `For User`. Then, select user you desire to
check and edit the quota. You can see the quota id that corresponds to user's id and the configuration already set
in the table, if you already set the quota.

![](../images/per_user_quota.png)

Of course, if you want to edit the quota, you can simply click the Edit button in the control column. After Clicking `Edit` button, you may see the small modal that enables configuring quota setting.
After input the exact amount, don't forget to Click `OK` button, unless the changes will not be applied.

![](../images/quota_settings_panel.png)

<a id="set-project-quota"></a>

#### Set Project Quota

Setting a quota on project-folder is similar to setting a user quota. The difference between setting
project quota and user quota is to confirm setting the project quota requires one more procedure,
which is selecting the domain that the project is dependent on. The rest are the same.
As in the picture below, you need to first select the domain, and then select the project.

![](../images/per_project_quota.png)

<a id="unset-quota"></a>

#### Unset Quota

We also provides the feature to unset the quota. Please remind that after removing the quota setting, quota will automatically follows
user or project default quota, which cannot be set in WebUI. If you want to change the default quota setting, you may need to access to admin-only page.
By Clicking `Unset` button in control column, the small snackbar message will show up and confirm whether you really want to delete the current quota setting.
If you click `OK` button in the snackbar message, then it will delete the quota setting and automatically reset the quota follows to corresponding quota,
which depends on the quota type(user / project).

![](../images/unset_quota.png)

:::note
If there's no config per user/project, then corresponding values in the user/project resource policy will be set as
a default value. For example, If no hard limit value for quota is set, `max_vfolder_size` value in the resource policy
is used as the default value.
:::

<a id="download-session-lists"></a>

## Download session lists

:::note
This feature is currently not available on the default Session page.
To use this feature, please enable 'Classic Session list page' option in the 'Switch back to the Classic UI' section
on the User Setting page. For more details, please refer to [Backend.AI User Settings](#user-settings) section.
:::

There's additional feature in Session page for admin.
On the right side of the FINISHED tab there is a menu marked with `...`.
When you click this menu, a sub-menu export CSV appears.

![](../images/export_csv_menu.png)

If you click this menu, you can download the information of the comcpute sessions
created so far in CSV format. After the following dialog opens, enter an appropriate
file name (if necessary), click the EXPORT button and you will get the CSV file.
Please note that a file name can have up to 255 characters.

![](../images/export_session_dialog.png)

<a id="system-settings"></a>

## System settings

In the Configuration page, you can see main settings of Backend.AI server.
Currently, it provides several controls which can change and list settings.

You can change image auto install and update rule by selecting one option from
`Digest`, `Tag`, `None`. `Digest` is kind of checksum for the image which
verifies integrity of the image and also enhances efficiency in downloading images
by reusing duplicated layers. `Tag` is only for developing option since it does not
guarantee the Integrity of the image.

:::note
Don't change rule selection unless you completely understand the meaning of each rule.
:::

![](../images/system_setting_about_image.png)

หน้าการกำหนดค่ายังแสดงสถานะของปลั๊กอินและฟีเจอร์ระดับองค์กร:

**ปลั๊กอิน:**

- **การรองรับ Open-source CUDA GPU**: สถานะการรองรับ CUDA GPU
- **การรองรับ ROCm GPU**: สถานะการรองรับ ROCm GPU

**ฟีเจอร์ระดับองค์กร:**

- **Fractional GPU**: การจำลอง Fractional GPU (fGPU) สำหรับแชร์ GPU ระหว่างเซสชัน

Backend.AI รองรับตัวเร่งความเร็ว AI ที่หลากหลายจากผู้ผลิตหลายราย:

- **NVIDIA**
  - Spark (GB10)
  - Blackwell (B300, B200, RTX Pro 6000 เป็นต้น)
  - Hopper (H200, H100 NVL เป็นต้น)
  - Grace Superchip (GB300, GB200, GH200 เป็นต้น)
  - Turing (Titan RTX, RTX 8000, T4)
  - Ampere (A100, A40, A10 เป็นต้น)
  - Ada Lovelace (L40S, L4)
  - Jetson (TX, Xavier, Orin, Thor เป็นต้น)
- **Intel**
  - Gaudi 3
  - Gaudi 2
  - Gaudi 1
  - Arc
- **AMD**
  - Instinct MI Series (รวมถึง MI300X)
  - MI300A
  - MI250
- **Rebellions**
  - ATOM Max
  - ATOM+
  - REBEL
- **FuriosaAI**
  - RNGD
- **Tenstorrent**
  - Wormhole n150s
  - Wormhole n300s
- **Google**
  - TPU v7 (Ironwood)
  - Coral TPU v5p
  - Coral TPU v5e
  - TPU v4
- **Graphcore**
  - C600 IPU
  - Bow IPU
- **HyperAccel**
  - LPU
- **Groq**
  - LPU
- **Cerebras**
  - WSE-3
- **SambaNova**
  - SN40L

![](../images/system_setting_about_scaling_plugins.png)

When a user launches a multi-node cluster session, which is introduced at
version 20.09, Backend.AI will dynamically create an overlay network to support
private inter-node communication. Admins can set the value of the Maximum
Transmission Unit (MTU) for the overlay network, if it is certain that the value
will enhance the network speed.

![](../images/overlay_network_setting_dialog.png)

:::note
For more information about Backend.AI Cluster session, please refer to
[Backend.AI Cluster Compute Session](#backendai-cluster-compute-session) section.
:::

You can edit the configuration per job scheduler by clicking the Scheduler's config button.
The values in the scheduler setting are the defaults to use when there is no scheduler
setting in each [resource group](#scheduling-methods). If there is a resource
group-specific setting, this value will be ignored.

Currently supported scheduling methods include `FIFO`, `LIFO`, and `DRF`.
Each method of scheduling is exactly the same as the [scheduling methods](#scheduling-methods) above.
Scheduler options include session creation retries. Session creation retries refers to the number
of retries to create a session if it fails. If the session cannot be created within the trials,
the request will be ignored and Backend.AI will process the next request. Currently, changes are
only possible when the scheduler is FIFO.

![](../images/system_setting_dialog_scheduler_settings.png)

:::note
We will continue to add broader range of setting controls.
:::

:::note
System settings are default settings. If resource group has certain value,
then it overrides configured value in system settings.
:::

<a id="server-management"></a>

## Server management

Go to the Maintenance page and you will see some buttons to manage the server.

- RECALCULATE USAGE: Occasionally, due to unstable network connections or
  container management problem of Docker daemon, there may be a case where the
  resource occupied by Backend.AI does not match the resource actually used by
  the container. In this case, click the RECALCULATE USAGE button to manually
  correct the resource occupancy.
- RESCAN IMAGES: Update image meta information from all registered Docker
  registries. It can be used when a new image is pushed to a
  Backend.AI-connected docker registry.

![](../images/maintenance_page.png)

:::note
We will continue to add other settings needed for management, such as
removing unused images or registering periodic maintenance schedules.
:::

<a id="detailed-information"></a>

## Detailed Information

In Information page, you can see several detailed information and status of each feature.
To see Manager version and API version, check the Core panel. To see whether each component
for Backend.AI is compatible or not, check the Component panel.

:::note
This page is only for showing current information.
:::

![](../images/information_page.png)

## การจัดการ RBAC

การจัดการ RBAC (Role-Based Access Control) ช่วยให้ผู้ดูแลระบบระดับสูงสามารถกำหนดบทบาทที่มีสิทธิ์แบบละเอียดและมอบหมายให้กับผู้ใช้ได้ คุณสามารถควบคุมการดำเนินการที่ผู้ใช้เฉพาะสามารถทำได้กับทรัพยากรต่าง ๆ ในระบบ Backend.AI

:::note
การจัดการ RBAC ใช้ได้เฉพาะผู้ดูแลระบบระดับสูงเท่านั้น และต้องใช้ Backend.AI Manager เวอร์ชัน 25.4.0 ขึ้นไป
:::

สำหรับข้อมูลรายละเอียดเกี่ยวกับการจัดการบทบาท สิทธิ์ และการมอบหมายผู้ใช้ โปรดดูที่หน้า[การจัดการ RBAC](#rbac-management)
