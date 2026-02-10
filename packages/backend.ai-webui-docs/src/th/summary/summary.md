This feature is deprecated, so please use the [dashboard<dashboard>](#dashboard<dashboard>) page going forward. Also, technical support
   and bug fixes for this feature are no longer provided. Please understand that issues may not be addressed.

# หน้าสรุป

On the สรุป page, ผู้ใช้s can check resource status and session usage.

![](images/summary.png)

### สถิติทรัพยากร

จะแสดงจำนวนรวมของทรัพยากรที่ผู้ใช้สามารถจัดสรรได้และจำนวนทรัพยากรที่ถูกจัดสรรอยู่ในขณะนี้ คุณสามารถตรวจสอบการใช้ทรัพยากร CPU, หน่วยความจำ และ GPU ของผู้ใช้และโควต้าได้ตามลำดับ นอกจากนี้ในสไลเดอร์ เซสชัน คุณยังสามารถดูจำนวนเซสชันการคำนวณสูงสุดที่คุณสามารถสร้างพร้อมกันและจำนวนเซสชันการคำนวณที่กำลังทำงานอยู่ในขณะนี้

คุณสามารถเปลี่ยนกลุ่มทรัพยากรได้โดยการคลิกที่ฟิลด์กลุ่มทรัพยากรด้านบน กลุ่มทรัพยากรเป็นแนวคิดในการรวมหน่วยงาน Agent หลาย ๆ ตัวเป็นหน่วยทรัพยากรเดียว หากคุณมีหน่วยงาน Agent หลายตัว คุณสามารถตั้งค่าต่าง ๆ เช่น การกำหนดพวกเขาให้กับโครงการเฉพาะสำหรับแต่ละกลุ่มทรัพยากร เมื่อมีหน่วยงาน Agent เพียงตัวเดียว จะเป็นเรื่องปกติที่จะเห็นเพียงกลุ่มทรัพยากรเดียว หากคุณเปลี่ยนกลุ่มทรัพยากร ปริมาณทรัพยากรอาจเปลี่ยนแปลงไปตามจำนวนทรัพยากรที่กลุ่มทรัพยากรนั้นถืออยู่ (หน่วยงานที่เป็นของมัน)

### ทรัพยากรระบบ

จะแสดงจำนวนโหนดของ Agent worker ที่เชื่อมต่อกับระบบ Backend.AI และจำนวนเซสชันการคำนวณทั้งหมดที่สร้างขึ้นในปัจจุบัน คุณยังสามารถตรวจสอบการใช้ CPU, หน่วยความจำ และ GPU ของโหนดตัวแทนได้ หากคุณล็อกอินเป็นผู้ใช้ทั่วไป จะมีการแสดงผลเฉพาะจำนวนเซสชันการคำนวณที่คุณสร้างขึ้นเท่านั้น

### คำเชิญ

หากผู้ใช้คนอื่นได้แชร์โฟลเดอร์ที่เก็บข้อมูลของพวกเขาให้คุณ มันจะแสดงที่นี่ หากคุณยอมรับคำขอการแชร์ คุณสามารถดูและเข้าถึงโฟลเดอร์ที่แชร์ในโฟลเดอร์ข้อมูลและที่จัดเก็บ ข้อสิทธิ์การเข้าถึงจะถูกกำหนดโดยผู้ที่ส่งคำขอการแชร์ แน่นอนว่าคุณสามารถปฏิเสธคำขอการแชร์ได้

### ดาวน์โหลดแอป Backend.AI Web UI

Backend.AI WebUI supports desktop applications.
By using desktop app, you can use desktop app specific features, such as [SSH/SFTP connection to a Compute Session<ssh-sftp-container>](#SSH/SFTP connection to a Compute Session<ssh-sftp-container>) .
For now Backend.AI WebUI provides desktop application with following OS:

- หน้าต่าง
- ลินุกซ์
- แมค


   When you click the button that match with your local environment (e.g. OS, Architecture), It will automatically downloads the same version of current webUI version.
   If you want to download later or former version of WebUI as a desktop app, please visit [here](https://github.com/lablup/backend.ai-webui/releases?page=1) and download the desired version(s).