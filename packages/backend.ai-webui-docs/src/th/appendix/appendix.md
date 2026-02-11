# ภาคผนวก

## การใช้ GPU เสมือนและการจัดสรร GPU แบบเศษส่วน

Backend.AI supports GPU virtualization technology which allows single physical
GPU can be divided and shared by multiple ผู้ใช้s simultaneously. Therefore, if
you want to execute a task that does not require much GPU computation
capability, you can create a compute session by allocating a portion of the GPU.
The amount of GPU resources that 1 fGPU actually allocates may vary from system
to system depending on ผู้ดูแลระบบistrator settings. For example, if the ผู้ดูแลระบบistrator
has set one physical GPU to be divided into five pieces, 5 fGPU means 1 physical
GPU, or 1 fGPU means 0.2 physical GPU. If you set 1 fGPU when creating a compute
session, the session can utilize the streaming multiprocessor (SM) and GPU
memory equivalent to 0.2 physical GPU.

ในส่วนนี้ เราจะสร้างเซสชันการคำนวณโดยการจัดสรรส่วนหนึ่งของ GPU แล้วตรวจสอบว่า GPU ที่ถูกตรวจพบภายในคอนเทนเนอร์การคำนวณนั้นตรงกับ GPU ฟิสิกส์บางส่วนจริงหรือไม่

First, let's check the type of physical GPU installed in the
host node and the amount of memory. The GPU node used in this guide is equipped
with a GPU with 8 GB of memory as in the following figure. And through the
ผู้ดูแลระบบistrator settings, 1 fGPU is set to an amount equivalent to 0.5 physical
GPU (or 1 physical GPU is 2 fGPU).

![](images/host_gpu.png)

Now let's go to the เซสชัน page and create a compute session by allocating 0.5
fGPU as follows:

![](images/session_launch_dialog_with_gpu.png)

In the AI Accelerator panel of the session list, you can see that
0.5 fGPU is allocated.

![](images/session_list_with_gpu.png)

Now, let's connect directly to the container and check if the allocated GPU
memory is really equivalent to 0.5 units (~2 GB). Let's bring up a web
terminal. When the terminal comes up, run the `nvidia-smi` command. As you can
see in the following figure, you can see that about 2 GB of GPU memory is
allocated. This shows that the physical GPU is actually divided into quarters and allocated inside the
container for this compute session, which is not possible by a way like PCI passthrough.

![](images/nvidia_smi_inside_container.png)

มาเปิด Jupyter Notebook และรันโค้ดการฝึก ML ง่ายๆ กันเถอะ

![](images/mnist_train.png)

While training is in progress, connect to the shell of the GPU host node and
execute the `nvidia-smi` command. You can see that there is one GPU attached
to the process and this process is occupying about 25% of the resources of the
physical GPU. (GPU occupancy can vary greatly depending on training code and GPU
model.)

![](images/host_nvidia_smi.png)

Alternatively, you can run the `nvidia-smi` command from the web terminal to query the GPU usage history inside the container.


## การกำหนดตารางงานอัตโนมัติ

เซิร์ฟเวอร์ Backend.AI มีตัวจัดตารางงานที่พัฒนาขึ้นเองในตัว มันจะตรวจสอบทรัพยากรที่มีอยู่ของโหนดผู้ทำงานทั้งหมดโดยอัตโนมัติและมอบหมายคำขอในการสร้างเซสชันการคอมพิวเตอร์ไปยังผู้ทำงานที่ตรงตามคำขอทรัพยากรของผู้ใช้ นอกจากนี้ เมื่อทรัพยากรไม่เพียงพอ คำขอของผู้ใช้ในการสร้างเซสชันการคอมพิวเตอร์จะถูกลงทะเบียนในสถานะ PENDING ในคิวงาน ภายหลัง เมื่อทรัพยากรมีให้ใช้งานอีกครั้ง คำขอที่ถูกระงับจะถูกดำเนินการต่อเพื่อสร้างเซสชันการคอมพิวเตอร์

คุณสามารถตรวจสอบการทำงานของตัวจัดกำหนดงานได้ในลักษณะง่าย ๆ จากผู้ใช้ Web-UI เมื่อโฮสต์ GPU สามารถจัดสรร fGPU ได้สูงสุด 2 ตัว ให้เราสร้างเซสชันการคำนวณ 3 เซสชันพร้อมกันโดยขอจัดสรร fGPU 1 ตัวตามลำดับ ในส่วนการจัดสรรแบบกำหนดเองของกล่องโต้ตอบการเปิดเซสชัน จะมีตัวเลื่อนสำหรับ GPU และเซสชัน หากคุณระบุค่าที่มากกว่า 1 ในเซสชันและคลิกปุ่ม LAUNCH จำนวนเซสชันจะถูกขอพร้อมกัน ให้เราตั้งค่า GPU และเซสชันเป็น 1 และ 3 ตามลำดับ นี่คือสถานการณ์ที่มีเซสชัน 3 เซสชันที่ขอ fGPU ทั้งหมด 3 ตัว ในขณะที่มี fGPU เพียง 2 ตัวเท่านั้น

![](images/session_launch_dialog_2_sessions.png)

รอครู่หนึ่งแล้วคุณจะเห็นการเซสชันการคอมพิวเตอร์สามรายการถูกแสดงอยู่ ถ้าคุณสังเกตอย่างใกล้ชิดที่แผงสถานะ คุณจะเห็นว่าการเซสชันการคอมพิวเตอร์สองจากสามรายการอยู่ในสถานะ RUNNING แต่การเซสชันการคอมพิวเตอร์อีกหนึ่งรายการยังคงอยู่ในสถานะ PENDING การเซสชัน PENDING นี้ถูกลงทะเบียนในคิวงานเท่านั้นและยังไม่ได้ถูกจัดสรรคอนเทนเนอร์จริงเนื่องจากทรัพยากร GPU ไม่เพียงพอ

![](images/pending_session_list.png)

ตอนนี้เราจะทำลายหนึ่งในสองเซสชันที่อยู่ในสถานะ RUNNING จากนั้นคุณจะเห็นว่าเซสชันการคอมพิวเตอร์ในสถานะ PENDING จะถูกจัดสรรทรัพยากรโดยตัวจัดกำหนดงานและเปลี่ยนเป็นสถานะ RUNNING ในไม่ช้า ในลักษณะนี้ ตัวจัดกำหนดงานจะใช้คิวงานเพื่อเก็บคำขอเซสชันการคอมพิวเตอร์ของผู้ใช้และประมวลผลคำขอโดยอัตโนมัติเมื่อมีทรัพยากรพร้อมใช้งาน

![](images/pending_to_running.png)


## การสนับสนุนคอนเทนเนอร์การเรียนรู้ของเครื่องหลายเวอร์ชัน

Backend.AI มีภาพเคอร์เนล ML และ HPC ที่สร้างไว้ล่วงหน้าหลายแบบ ผู้ใช้จึงสามารถใช้ห้องสมุดและแพ็คเกจหลักได้ทันทีโดยไม่ต้องติดตั้งแพ็คเกจด้วยตนเอง ที่นี่เราจะแสดงตัวอย่างที่ใช้ประโยชน์จากหลายเวอร์ชันของห้องสมุด ML หลายตัวทันที

ไปที่หน้า เซสชัน และเปิดกล่องสนทนาเริ่มต้นเซสชัน อาจมีภาพเคอร์เนลหลายประเภทขึ้นอยู่กับการตั้งค่าการติดตั้ง

![](images/various_kernel_images.png)

Here, let's select the TensorFlow 2.3 environment and created a session.

![](images/session_launch_dialog_tf23.png)

Open the web terminal of the created session and run the following Python
command. You can see that TensorFlow 2.3 version is installed.

![](images/tf23_version_print.png)

This time, let's select the TensorFlow 1.15 environment to create a compute
session. If resources are insufficient, delete the previous session.

![](images/session_launch_dialog_tf115.png)

Open the web terminal of the created session and run the same Python command as
before. You can see that TensorFlow 1.15(.4) version is installed.

![](images/tf115_version_print.png)

Finally, create a compute session using PyTorch version 1.7.

![](images/session_launch_dialog_pytorch17.png)

Open the web terminal of the created session and run the following Python
command. You can see that PyTorch 1.8 version is installed.

![](images/pytorch17_version_print.png)

เช่นนี้ คุณสามารถใช้เวอร์ชันต่าง ๆ ของไลบรารีหลัก เช่น TensorFlow และ PyTorch ผ่าน Backend.AI โดยไม่ต้องพยายามติดตั้งโดยไม่จำเป็น


## แปลงเซสชันการคอมพิวเตอร์เป็นภาพ Docker ส่วนตัวใหม่

หากคุณต้องการแปลงเซสชันการประมวลผลที่กำลังทำงาน (คอนเทนเนอร์) เป็นภาพ Docker ใหม่ที่คุณสามารถใช้ในภายหลังเพื่อสร้างเซสชันการประมวลผลใหม่ คุณต้องเตรียมสภาพแวดล้อมของเซสชันการประมวลผลของคุณและขอให้ผู้ดูแลระบบทำการแปลงมัน

- ก่อนอื่น ให้เตรียมเซสชันการคอมพิวเตอร์ของคุณโดยการติดตั้งแพ็คเกจที่คุณต้องการและปรับแต่งการตั้งค่าตามที่คุณต้องการ

  .. note``
If you want to install OS packages, for example via `apt` command, it
usually requires the `sudo` privilege. Depending on the security policy
of the institute, you may not be allowed to use `sudo` inside a
container.

It is recommended to use [automount folder<using-automount-folder>](#automount folder<using-automount-folder>) to
install [Python packages via pip<install_pip_pkg>](#Python packages via pip<install_pip_pkg>). However, if you
want to add Python packages in a new image, you should install them with
`sudo pip install <package-name>` to save them not in your home but in
the system directory. The contents in your home directory, usually
`/home/work__PROTECTED_8____PROTECTED_9____PROTECTED_10____PROTECTED_11____PROTECTED_12____PROTECTED_13____PROTECTED_14__`
หลังจากการฝึกอบรมไม่กี่ครั้ง คุณสามารถเปรียบเทียบโมเดลที่ฝึกอบรมแล้วกับผลลัพธ์ได้

![](images/mlflow_multiple_execution.png)