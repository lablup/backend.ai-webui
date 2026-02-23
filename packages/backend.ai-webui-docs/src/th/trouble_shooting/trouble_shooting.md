# คำถามที่พบบ่อย & การแก้ปัญหา

## คู่มือการแก้ปัญหาสำหรับผู้ใช้

### รายการเซสชันแสดงไม่ถูกต้อง

เนื่องจากปัญหาเครือข่ายที่เกิดขึ้นเป็นระยะเวลาและ/หรือเหตุผลต่างๆ รายชื่อเซสชันอาจไม่แสดงอย่างถูกต้อง ในส่วนใหญ่ของเวลา ปัญหานี้จะหายไปเพียงแค่การรีเฟรชเบราว์เซอร์

- Web-based Web-UI: รีเฟรชหน้าเบราว์เซอร์ (ใช้ทางลัดที่เบราว์เซอร์จัดให้ เช่น Ctrl-R) เนื่องจากแคชของเบราว์เซอร์อาจทำให้เกิดปัญหาในบางครั้ง แนะนำให้รีเฟรชหน้าด้วยการข้ามแคช (เช่น Shift-Ctrl-R แต่คีย์อาจแตกต่างกันในแต่ละเบราว์เซอร์)
- Web-UI แอป: กดแป้น Ctrl-R เพื่อรีเฟรชแอป

### ทันใดนั้น ฉันไม่สามารถเข้าสู่ระบบด้วยบัญชีของฉันได้

หากมีปัญหาในการรับรู้คุกกี้การพิสูจน์ตัวตน ผู้ใช้อาจไม่สามารถเข้าสู่ระบบได้ชั่วคราว ลองเข้าสู่ระบบด้วยหน้าต่างเบราว์เซอร์ส่วนตัว หากเข้าสู่ระบบได้ กรุณาล้างแคชของเบราว์เซอร์และ/หรือข้อมูลแอปพลิเคชัน


<a id="installing_apt_pkg"></a>

### วิธีการติดตั้งแพ็กเกจ apt?

Inside a compute session, ผู้ใช้s cannot access `root` account and perform
operations that require `sudo` privilege for security reasons. Therefore, it
is not allowed to install packages with `apt` or `yum` since they require
`sudo`. If it is really required, you can request to ผู้ดูแลระบบs to allow `sudo`
permission.

Alternatively, ผู้ใช้s may use Homebrew to install OS packages. Please refer to
the [guide on using Homebrew with automount folder](../mount_vfolder/mount_vfolder.md#using-linuxbrew-with-automountfolder).


<a id="install_pip_pkg"></a>

### วิธีติดตั้งแพ็คเกจด้วย pip คืออะไร?

By default, when you install a pip package, it will be installed under
`~/.local`. So, if you create a automount data folder named `.local`, you
can keep the installed packages after a compute session is destroyed, and then
reus them for the next compute session. Just install the packages with pip like:

```shell
$ pip install aiohttp
```
For more information, please refer to the [guide on installing Python
packages with automount folder](../mount_vfolder/mount_vfolder.md#using-pip-with-automountfolder).

### I have created a compute session, but cannot launch Jupyter Notebook

If you installed a Jupyter package with pip by yourself, it may be conflict with
the Jupyter package that a compute session provides by default. Especially, if you
have created `~/.local` directory, the manually installed Jupyter packages
persists for every compute session. In this case, try to remove the `.local`
automount folder and then try to launch Jupyter Notebook again.

### เลย์เอาต์ของหน้าเสียหาย

Backend.AI Web-UI ใช้ฟีเจอร์ JavaScript และ/หรือเบราว์เซอร์สมัยใหม่ล่าสุด กรุณาใช้เวอร์ชันล่าสุดของเบราว์เซอร์สมัยใหม่ (เช่น Chrome)

### การตัดการเชื่อมต่อ SFTP

เมื่อแอป Web-UI เริ่มเชื่อมต่อ SFTP จะใช้เซิร์ฟเวอร์พร็อกซี่ท้องถิ่นที่ฝังอยู่ในแอป หากคุณออกจากแอป Web-UI ในระหว่างการถ่ายโอนไฟล์ด้วยโปรโตคอล SFTP การถ่ายโอนจะล้มเหลวทันทีเนื่องจากการเชื่อมต่อที่สร้างขึ้นผ่านเซิร์ฟเวอร์พร็อกซี่ท้องถิ่นถูกตัดการเชื่อมต่อ ดังนั้น แม้ว่าคุณจะไม่ได้ใช้เซสชันการคอมพิวเตอร์ คุณไม่ควรออกจากแอป Web-UI ขณะใช้ SFTP หากคุณต้องการรีเฟรชหน้า เราขอแนะนำให้ใช้คีย์ลัด Ctrl-R

หากแอป Web-UI ถูกปิดและเริ่มต้นใหม่ บริการ SFTP จะไม่ได้ถูกเริ่มต้นอัตโนมัติสำหรับเซสชันการประมวลผลที่มีอยู่ คุณต้องเริ่มบริการ SSH/SFTP ในคอนเทนเนอร์ที่ต้องการโดยชัดเจนเพื่อสร้างการเชื่อมต่อ SFTP


## คู่มือการแก้ไขปัญหาสำหรับผู้ดูแลระบบ

### ผู้ใช้ไม่สามารถเริ่มใช้งานแอปพลิเคชันเช่น Jupyter Notebook ได้

There may be a problem on connecting WSProxy service. Try to stop and restart
the service by referencing the guide on start/stop/restart WSProxy service.

### ทรัพยากรที่ระบุไม่ตรงกับการจัดสรรจริง

บางครั้งเนื่องจากการเชื่อมต่อเครือข่ายที่ไม่เสถียรหรือปัญหาการจัดการคอนเทนเนอร์ของ Docker daemon อาจมีกรณีที่ทรัพยากรที่ถูกใช้งานโดย Backend.AI ไม่ตรงกับทรัพยากรที่ใช้โดยคอนเทนเนอร์จริง ในกรณีนี้ให้ทำตามขั้นตอนด้านล่าง

- เข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ
- ไปที่หน้า Maintenance
- คลิกปุ่ม RECALCULATE USAGE เพื่อปรับแก้การเข้าถึงทรัพยากรด้วยตนเอง

### ภาพไม่แสดงหลังจากที่ถูกนำขึ้นไปยัง docker registry


:::note
ฟีเจอร์นี้มีให้ใช้เฉพาะสำหรับซูเปอร์แอดมินเท่านั้น
:::

หากมีการดันภาพใหม่ไปยังหนึ่งในรีจิสทรี docker ของ Backend.AI เมตาดาทาต้องได้รับการอัปเดตใน Backend.AI เพื่อที่จะใช้ในการสร้างเซสชันคอมพิวเตอร์ การอัปเดตเมตาดาทาสามารถทำได้โดยการคลิกที่ปุ่ม RESCAN IMAGES บนหน้า Maintenance ซึ่งจะปรับปรุงเมตาดาทาสำหรับรีจิสทรี docker ทุกตัว หากมีรีจิสทรีหลายตัว

หากคุณต้องการอัปเดตข้อมูลเมตาสำหรับ docker registry ที่เฉพาะเจาะจง คุณสามารถไปที่แท็บ Registries ในหน้าสภาพแวดล้อม เพียงคลิกปุ่มรีเฟรชในแผงควบคุมของ registry ที่ต้องการ ระมัดระวังไม่ให้ลบ registry โดยการคลิกที่ไอคอนถังขยะ