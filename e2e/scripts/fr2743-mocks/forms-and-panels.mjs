// Form modals and content panels for FR-2743.
import { modal, PRIMARY, PRIMARY_LIGHT, DANGER, BORDER, TEXT, TEXT_SECONDARY } from './_shared.mjs';

const items = [];

// keypair_export (3356x720) — Project resource policy table with annotation overlay
items.push({
  file: 'keypair_export',
  render: (lang) => {
    const labels = {
      en: { breadcrumb: 'Resource Policy', keypair: 'Keypair', user: 'User', project: 'Project', cols: ['Name', 'Max Folder Count', 'Max Quota Scope Size (GB)', 'Max Network Count', 'ID', 'Created At'], exportCsv: 'export CSV' },
      ko: { breadcrumb: '자원 정책', keypair: '키페어', user: '사용자', project: '프로젝트', cols: ['이름', '최대 폴더 수', '최대 쿼터 범위 크기 (GB)', '최대 네트워크 수', 'ID', '생성일'], exportCsv: 'CSV 내보내기' },
      ja: { breadcrumb: 'リソースポリシー', keypair: 'キーペア', user: 'ユーザー', project: 'プロジェクト', cols: ['名前', '最大フォルダ数', '最大クォータスコープサイズ (GB)', '最大ネットワーク数', 'ID', '作成日'], exportCsv: 'CSVエクスポート' },
      th: { breadcrumb: 'นโยบายทรัพยากร', keypair: 'คีย์แพร์', user: 'ผู้ใช้', project: 'โปรเจกต์', cols: ['ชื่อ', 'จำนวนโฟลเดอร์สูงสุด', 'ขนาดขอบเขตโควต้าสูงสุด (GB)', 'จำนวนเครือข่ายสูงสุด', 'ID', 'สร้างเมื่อ'], exportCsv: 'ส่งออก CSV' },
    }[lang];
    return `
      <div style="display:inline-block;padding:20px;background:#fff;min-width:3000px;">
        <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">${labels.breadcrumb} /</div>
        <div style="display:flex;gap:24px;border-bottom:1px solid ${BORDER};margin-bottom:12px;">
          <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.keypair}</div>
          <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.user}</div>
          <div style="padding:8px 0;border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;font-size:14px;">${labels.project}</div>
        </div>
        <div style="position:relative;">
          <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;width:3000px;">
            <thead><tr style="background:#fafafa;">${labels.cols.map(c => `<th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};">${c}</th>`).join('')}</tr></thead>
            <tbody><tr>
              <td style="padding:12px 16px;font-size:14px;color:${TEXT};">default</td>
              <td style="padding:12px 16px;font-size:14px;color:${TEXT};">∞</td>
              <td style="padding:12px 16px;font-size:14px;color:${TEXT};">∞</td>
              <td style="padding:12px 16px;font-size:14px;color:${TEXT};">3</td>
              <td style="padding:12px 16px;font-size:14px;color:${TEXT};font-family:monospace;">ProjectResourcePolicy:default</td>
              <td style="padding:12px 16px;font-size:14px;color:${TEXT};">Oct 23, 2025 1:42 PM</td>
            </tr></tbody>
          </table>
          <!-- Toolbar with red rect annotation around export -->
          <div style="position:absolute;top:-50px;right:0;display:flex;align-items:center;gap:8px;">
            <button style="width:32px;height:32px;border:1px solid ${BORDER};background:#fff;border-radius:50%;cursor:pointer;color:${TEXT_SECONDARY};font-size:18px;">⋯</button>
            <button style="width:32px;height:32px;border:1px solid ${BORDER};background:#fff;border-radius:50%;cursor:pointer;color:${TEXT_SECONDARY};">↻</button>
            <button style="padding:4px 15px;border:1px solid ${PRIMARY};background:${PRIMARY};color:#fff;border-radius:6px;cursor:pointer;font-size:14px;">+ Create</button>
            <!-- export csv dropdown -->
            <div style="position:absolute;top:32px;right:120px;background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08);padding:4px;min-width:140px;">
              <div style="padding:5px 12px;font-size:14px;color:${TEXT};">↓ ${labels.exportCsv}</div>
            </div>
            <!-- red annotation rect overlay -->
            <div style="position:absolute;top:-8px;right:-8px;width:200px;height:50px;border:2px solid ${DANGER};border-radius:6px;pointer-events:none;"></div>
          </div>
        </div>
      </div>
    `;
  },
});

// manage_app_dialog (1020x906)
items.push({
  file: 'manage_app_dialog',
  render: (lang) => {
    const labels = {
      en: { title: 'Manage Apps', cols: ['App Name', 'Protocol', 'Port'], add: '+ Add', cancel: 'Cancel', ok: 'OK' },
      ko: { title: '앱 관리', cols: ['앱 이름', '프로토콜', '포트'], add: '+ 추가', cancel: '취소', ok: '확인' },
      ja: { title: 'アプリ管理', cols: ['アプリ名', 'プロトコル', 'ポート'], add: '+ 追加', cancel: 'キャンセル', ok: 'OK' },
      th: { title: 'จัดการแอป', cols: ['ชื่อแอป', 'โปรโตคอล', 'พอร์ต'], add: '+ เพิ่ม', cancel: 'ยกเลิก', ok: 'ตกลง' },
    }[lang];
    const inputCell = (val) => `<td style="padding:8px;"><input value="${val}" style="width:100%;padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;font-size:14px;color:${TEXT};" /></td>`;
    const apps = [
      ['ipython', 'pty', '3000'],
      ['jupyter', 'http', '8070'],
      ['jupyterlab', 'http', '8090'],
      ['vscode', 'http', '8180'],
    ];
    return modal({
      title: labels.title,
      width: 500,
      body: `
        <table style="width:100%;border-collapse:separate;border-spacing:0;">
          <thead><tr style="border-bottom:1px solid #f0f0f0;">${labels.cols.map(c => `<th style="padding:8px;text-align:left;font-size:13px;font-weight:500;color:${TEXT_SECONDARY};">${c}</th>`).join('')}<th style="padding:8px;width:40px;"></th></tr></thead>
          <tbody>
            ${apps.map(([name, proto, port]) => `<tr>${inputCell(name)}${inputCell(proto)}${inputCell(port)}<td style="padding:8px;text-align:center;color:${DANGER};cursor:pointer;">🗑</td></tr>`).join('')}
            <tr><td colspan="4" style="padding:12px;text-align:center;border:1px dashed ${BORDER};border-radius:6px;color:${TEXT_SECONDARY};cursor:pointer;">${labels.add}</td></tr>
          </tbody>
        </table>
      `,
      cancelText: labels.cancel,
      okText: labels.ok,
    });
  },
});

// model_store_folder (1330x1338)
items.push({
  file: 'model_store_folder',
  render: (lang) => {
    const labels = {
      en: {
        title: 'Create a new storage folder',
        usageMode: 'Usage Mode', general: 'General', autoMount: 'Auto Mount', models: 'Models',
        folderName: 'Folder name',
        location: 'Location',
        type: 'Type', user: 'User', project: 'Project',
        permission: 'Permission', readWrite: 'Read & Write', readOnly: 'Read only',
        cloneable: 'Cloneable',
        helper: 'A folder accessible by "model-store" project users will be created.',
        reset: 'Reset', cancel: 'Cancel', create: 'Create',
      },
      ko: {
        title: '새 스토리지 폴더 생성',
        usageMode: '사용 모드', general: '일반', autoMount: '자동 마운트', models: '모델',
        folderName: '폴더 이름',
        location: '위치',
        type: '유형', user: '사용자', project: '프로젝트',
        permission: '권한', readWrite: '읽기 및 쓰기', readOnly: '읽기 전용',
        cloneable: '복제 가능',
        helper: '"model-store" 프로젝트 사용자가 액세스할 수 있는 폴더가 생성됩니다.',
        reset: '재설정', cancel: '취소', create: '생성',
      },
      ja: {
        title: '新規ストレージフォルダの作成',
        usageMode: '使用モード', general: '一般', autoMount: 'オートマウント', models: 'モデル',
        folderName: 'フォルダ名',
        location: '場所',
        type: 'タイプ', user: 'ユーザー', project: 'プロジェクト',
        permission: '権限', readWrite: '読み取り/書き込み', readOnly: '読み取り専用',
        cloneable: 'クローン可',
        helper: '"model-store"プロジェクトのユーザーがアクセスできるフォルダが作成されます。',
        reset: 'リセット', cancel: 'キャンセル', create: '作成',
      },
      th: {
        title: 'สร้างโฟลเดอร์จัดเก็บใหม่',
        usageMode: 'โหมดการใช้งาน', general: 'ทั่วไป', autoMount: 'เมาต์อัตโนมัติ', models: 'โมเดล',
        folderName: 'ชื่อโฟลเดอร์',
        location: 'ตำแหน่ง',
        type: 'ประเภท', user: 'ผู้ใช้', project: 'โปรเจกต์',
        permission: 'สิทธิ์', readWrite: 'อ่าน/เขียน', readOnly: 'อ่านอย่างเดียว',
        cloneable: 'โคลนได้',
        helper: 'จะสร้างโฟลเดอร์ที่ผู้ใช้โปรเจกต์ "model-store" เข้าถึงได้',
        reset: 'รีเซ็ต', cancel: 'ยกเลิก', create: 'สร้าง',
      },
    }[lang];
    const radio = (text, checked) => `<label style="display:inline-flex;align-items:center;gap:6px;margin-right:16px;font-size:14px;cursor:pointer;color:${TEXT};">
      <span style="display:inline-block;width:16px;height:16px;border:1px solid ${checked ? PRIMARY : BORDER};border-radius:50%;background:#fff;position:relative;">${checked ? `<span style="position:absolute;inset:3px;background:${PRIMARY};border-radius:50%;"></span>` : ''}</span>
      ${text}
    </label>`;
    return modal({
      title: labels.title,
      width: 600,
      body: `
        <div style="margin-bottom:16px;"><div style="font-size:14px;color:${TEXT};margin-bottom:8px;">${labels.usageMode}</div><div>${radio(labels.general, false)}${radio(labels.autoMount, false)}${radio(labels.models, true)}</div></div>
        <div style="margin-bottom:16px;"><div style="font-size:14px;color:${TEXT};margin-bottom:6px;">${labels.folderName}</div><input value="meta-llama-3-8b-instruct" style="width:100%;padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;height:32px;font-size:14px;color:${TEXT};" /></div>
        <div style="margin-bottom:16px;"><div style="font-size:14px;color:${TEXT};margin-bottom:6px;">${labels.location}</div><div style="border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;justify-content:space-between;font-size:14px;color:${TEXT};">local:volume1 <span style="color:${TEXT_SECONDARY};">▾</span></div></div>
        <div style="margin-bottom:8px;"><div style="font-size:14px;color:${TEXT};margin-bottom:8px;">${labels.type}</div><div>${radio(labels.user, false)}${radio(labels.project, true)}</div></div>
        <div style="background:${PRIMARY_LIGHT};border:1px solid ${PRIMARY};border-radius:4px;padding:8px 12px;font-size:13px;color:${PRIMARY};margin-bottom:16px;">${labels.helper}</div>
        <div style="margin-bottom:16px;"><div style="font-size:14px;color:${TEXT};margin-bottom:8px;">${labels.permission}</div><div>${radio(labels.readWrite, true)}${radio(labels.readOnly, false)}</div></div>
        <div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;"><div style="font-size:14px;color:${TEXT};">${labels.cloneable}</div><div style="width:36px;height:20px;background:${PRIMARY};border-radius:10px;position:relative;"><div style="position:absolute;top:2px;right:2px;width:16px;height:16px;background:#fff;border-radius:50%;"></div></div></div>
      `,
      cancelText: `${labels.reset}`,
      okText: labels.create,
    });
  },
  // Need extra cancel button rendered manually — modal helper has only 2 buttons. Skip Reset button as separate, accept 2-button form.
});

// system_setting_about_image (2242x606) — Configurations tab page strip
items.push({
  file: 'system_setting_about_image',
  render: (lang) => {
    const labels = {
      en: { configurations: 'Configurations', search: 'Search', displayChanges: 'Display Only Changes', reset: 'Reset', all: 'All (14)', general: 'General (3)', plugins: 'Plugins (2)', generalH: 'General', subheading: 'Image auto install / update rule', desc: 'Configure automatic installation and update behavior for kernel images. Choose between digest-based or tag-based image identification.', digest: 'Digest' },
      ko: { configurations: '구성', search: '검색', displayChanges: '변경된 항목만 표시', reset: '초기화', all: '전체 (14)', general: '일반 (3)', plugins: '플러그인 (2)', generalH: '일반', subheading: '이미지 자동 설치/업데이트 규칙', desc: '커널 이미지의 자동 설치 및 업데이트 동작을 구성합니다. 다이제스트 기반 또는 태그 기반 이미지 식별 중 선택하세요.', digest: '다이제스트' },
      ja: { configurations: '構成', search: '検索', displayChanges: '変更のみ表示', reset: 'リセット', all: 'すべて (14)', general: '一般 (3)', plugins: 'プラグイン (2)', generalH: '一般', subheading: 'イメージ自動インストール/更新ルール', desc: 'カーネルイメージの自動インストールおよび更新動作を構成します。ダイジェストベースまたはタグベースのイメージ識別を選択します。', digest: 'ダイジェスト' },
      th: { configurations: 'การกำหนดค่า', search: 'ค้นหา', displayChanges: 'แสดงเฉพาะที่เปลี่ยนแปลง', reset: 'รีเซ็ต', all: 'ทั้งหมด (14)', general: 'ทั่วไป (3)', plugins: 'ปลั๊กอิน (2)', generalH: 'ทั่วไป', subheading: 'กฎการติดตั้ง/อัปเดตอิมเมจอัตโนมัติ', desc: 'กำหนดค่าการติดตั้งและการอัปเดตอัตโนมัติสำหรับอิมเมจเคอร์เนล เลือกระหว่างการระบุอิมเมจตามไดเจสต์หรือตามแท็ก', digest: 'ไดเจสต์' },
    }[lang];
    return `
      <div style="display:inline-block;padding:20px;background:#fff;min-width:2000px;">
        <div style="display:flex;gap:24px;border-bottom:1px solid ${BORDER};margin-bottom:16px;">
          <div style="padding:8px 0;border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;font-size:14px;">${labels.configurations}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div style="position:relative;width:240px;"><span style="position:absolute;left:8px;top:6px;color:${TEXT_SECONDARY};">🔍</span><input placeholder="${labels.search}" style="width:100%;padding:4px 11px 4px 28px;border:1px solid ${BORDER};border-radius:6px;height:32px;font-size:14px;" /></div>
          <label style="display:inline-flex;align-items:center;gap:6px;font-size:14px;color:${TEXT};"><span style="display:inline-block;width:16px;height:16px;border:1px solid ${BORDER};background:#fafafa;border-radius:2px;"></span>${labels.displayChanges}</label>
          <button style="padding:4px 12px;border:1px solid ${BORDER};background:#fff;border-radius:6px;cursor:pointer;font-size:14px;">↻ ${labels.reset}</button>
        </div>
        <div style="display:flex;gap:24px;">
          <div style="flex:0 0 220px;border-right:1px solid ${BORDER};padding-right:16px;">
            <div style="padding:8px 12px;background:${PRIMARY_LIGHT};color:${PRIMARY};border-radius:4px;font-size:14px;font-weight:500;margin-bottom:4px;">${labels.all}</div>
            <div style="padding:8px 12px;color:${TEXT};font-size:14px;margin-bottom:4px;">${labels.general}</div>
            <div style="padding:8px 12px;color:${TEXT};font-size:14px;">${labels.plugins}</div>
          </div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:18px;color:${TEXT};margin-bottom:16px;border-bottom:1px solid ${BORDER};padding-bottom:8px;">${labels.generalH}</div>
            <div style="margin-bottom:8px;font-weight:500;font-size:14px;color:${TEXT};">${labels.subheading}</div>
            <div style="font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;margin-bottom:12px;">${labels.desc}</div>
            <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;border:1px solid ${BORDER};border-radius:6px;font-size:14px;color:${TEXT};min-width:200px;justify-content:space-between;">${labels.digest} <span style="color:${TEXT_SECONDARY};">▾</span></div>
          </div>
        </div>
      </div>
    `;
  },
});

// system_setting_about_scaling_plugins (1280x720)
items.push({
  file: 'system_setting_about_scaling_plugins',
  render: (lang) => {
    const labels = {
      en: { all: 'All (15)', general: 'General (3)', plugins: 'Plugins (2)', enterprise: 'Enterprise Features (10)', autoInstall: 'Image auto install / update rule', overlayNetwork: 'Overlay Network', scheduler: 'Scheduler', pluginsHeader: 'Plugins' },
      ko: { all: '전체 (15)', general: '일반 (3)', plugins: '플러그인 (2)', enterprise: '엔터프라이즈 기능 (10)', autoInstall: '이미지 자동 설치/업데이트 규칙', overlayNetwork: '오버레이 네트워크', scheduler: '스케줄러', pluginsHeader: '플러그인' },
      ja: { all: 'すべて (15)', general: '一般 (3)', plugins: 'プラグイン (2)', enterprise: 'エンタープライズ機能 (10)', autoInstall: 'イメージ自動インストール/更新ルール', overlayNetwork: 'オーバーレイネットワーク', scheduler: 'スケジューラ', pluginsHeader: 'プラグイン' },
      th: { all: 'ทั้งหมด (15)', general: 'ทั่วไป (3)', plugins: 'ปลั๊กอิน (2)', enterprise: 'คุณสมบัติองค์กร (10)', autoInstall: 'กฎการติดตั้ง/อัปเดตอิมเมจอัตโนมัติ', overlayNetwork: 'เครือข่ายโอเวอร์เลย์', scheduler: 'ตัวจัดตาราง', pluginsHeader: 'ปลั๊กอิน' },
    }[lang];
    return `
      <div style="display:inline-block;padding:20px;background:#fff;min-width:1100px;">
        <div style="display:flex;gap:24px;">
          <div style="flex:0 0 220px;border-right:1px solid ${BORDER};padding-right:16px;">
            <div style="padding:8px 12px;color:${TEXT};font-size:14px;margin-bottom:4px;">${labels.all}</div>
            <div style="padding:8px 12px;color:${TEXT};font-size:14px;margin-bottom:4px;">${labels.general}</div>
            <div style="padding:8px 12px;background:${PRIMARY_LIGHT};color:${PRIMARY};border-radius:4px;font-size:14px;font-weight:500;margin-bottom:4px;">${labels.plugins}</div>
            <div style="padding:8px 12px;color:${TEXT};font-size:14px;">${labels.enterprise}</div>
          </div>
          <div style="flex:1;min-width:600px;">
            <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid ${BORDER};"><div style="font-weight:500;font-size:14px;color:${TEXT};">${labels.autoInstall}</div></div>
            <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid ${BORDER};"><div style="font-weight:500;font-size:14px;color:${TEXT};">${labels.overlayNetwork}</div></div>
            <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid ${BORDER};"><div style="font-weight:500;font-size:14px;color:${TEXT};">${labels.scheduler}</div></div>
            <div style="font-weight:600;font-size:18px;color:${TEXT};margin:16px 0 8px;">${labels.pluginsHeader}</div>
          </div>
        </div>
      </div>
    `;
  },
});

// model_card_detail (2440x1438) — Model store card with tags + table + README
items.push({
  file: 'model_card_detail',
  render: (lang) => {
    const labels = {
      en: { author: 'Author', version: 'Version', architecture: 'Architecture', framework: 'Framework', created: 'Created', lastModified: 'Last Modified', minResource: 'Min Resource', clone: 'Clone to a folder', close: 'Close', readme: 'README.md', modelDetails: 'Model Details', modelDetailsBody: 'Meta Llama 3 is a family of large language models developed by Meta AI. The Meta-Llama-3-8B-Instruct version is the instruction-tuned variant fine-tuned for dialogue use cases. It outperforms many of the available open-source chat models on common industry benchmarks.', variations: 'Variations', variationsBody: 'Available in 8B and 70B parameter sizes, with both pretrained and instruction-tuned variants for each.' },
      ko: { author: '저자', version: '버전', architecture: '아키텍처', framework: '프레임워크', created: '생성', lastModified: '최종 수정', minResource: '최소 자원', clone: '폴더에 복제', close: '닫기', readme: 'README.md', modelDetails: '모델 세부 정보', modelDetailsBody: 'Meta Llama 3는 Meta AI에서 개발한 대규모 언어 모델 제품군입니다. Meta-Llama-3-8B-Instruct 버전은 대화 사용 사례를 위해 미세 조정된 명령어 조정 변형입니다. 일반적인 산업 벤치마크에서 사용 가능한 많은 오픈 소스 채팅 모델을 능가합니다.', variations: '변형', variationsBody: '8B 및 70B 매개변수 크기로 제공되며, 각각에 대해 사전 학습된 변형과 명령어 조정 변형이 모두 제공됩니다.' },
      ja: { author: '作成者', version: 'バージョン', architecture: 'アーキテクチャ', framework: 'フレームワーク', created: '作成日', lastModified: '最終更新', minResource: '最小リソース', clone: 'フォルダにクローン', close: '閉じる', readme: 'README.md', modelDetails: 'モデル詳細', modelDetailsBody: 'Meta Llama 3は、Meta AIによって開発された大規模言語モデルファミリーです。Meta-Llama-3-8B-Instructバージョンは、対話ユースケース向けに微調整された命令調整バリアントです。一般的な業界ベンチマークで利用可能な多くのオープンソースチャットモデルを上回ります。', variations: 'バリエーション', variationsBody: '8Bおよび70Bのパラメータサイズで提供され、それぞれに事前学習済みおよび命令調整済みのバリアントがあります。' },
      th: { author: 'ผู้สร้าง', version: 'เวอร์ชัน', architecture: 'สถาปัตยกรรม', framework: 'เฟรมเวิร์ก', created: 'สร้าง', lastModified: 'แก้ไขล่าสุด', minResource: 'ทรัพยากรขั้นต่ำ', clone: 'โคลนไปยังโฟลเดอร์', close: 'ปิด', readme: 'README.md', modelDetails: 'รายละเอียดโมเดล', modelDetailsBody: 'Meta Llama 3 เป็นตระกูลโมเดลภาษาขนาดใหญ่ที่พัฒนาโดย Meta AI เวอร์ชัน Meta-Llama-3-8B-Instruct เป็นเวอร์ชันที่ปรับแต่งคำสั่งสำหรับการสนทนา มีประสิทธิภาพเหนือกว่าโมเดลแชทโอเพนซอร์สที่มีอยู่หลายตัวในเกณฑ์มาตรฐานอุตสาหกรรมทั่วไป', variations: 'รูปแบบ', variationsBody: 'มีในขนาดพารามิเตอร์ 8B และ 70B พร้อมทั้งเวอร์ชันที่ผ่านการฝึกล่วงหน้าและเวอร์ชันที่ปรับแต่งคำสั่ง' },
    }[lang];
    const tagPill = (text) => `<span style="display:inline-block;padding:2px 8px;background:#f0f2f5;color:${TEXT};border-radius:4px;font-size:12px;margin-right:6px;margin-bottom:4px;">${text}</span>`;
    return `
      <div style="display:inline-block;padding:24px;background:#fff;width:1180px;">
        <div style="font-weight:600;font-size:20px;color:${TEXT};margin-bottom:12px;">meta-llama/Meta-Llama-3-8B-Instruct</div>
        <div style="margin-bottom:16px;">${['huggingface','text-generation','facebook','meta','pytorch','llama','llama-3','llama3'].map(tagPill).join('')}</div>
        <table style="width:100%;border-collapse:separate;border-spacing:0;background:#fafafa;border-radius:6px;margin-bottom:20px;">
          <tbody>
            <tr><td style="padding:8px 16px;font-size:13px;color:${TEXT_SECONDARY};font-weight:500;width:30%;">${labels.author}</td><td style="padding:8px 16px;font-size:13px;color:${TEXT};">meta-llama</td></tr>
            <tr><td style="padding:8px 16px;font-size:13px;color:${TEXT_SECONDARY};font-weight:500;">${labels.version}</td><td style="padding:8px 16px;font-size:13px;color:${TEXT};">-</td></tr>
            <tr><td style="padding:8px 16px;font-size:13px;color:${TEXT_SECONDARY};font-weight:500;">${labels.architecture}</td><td style="padding:8px 16px;font-size:13px;color:${TEXT};">LlamaForCausalLM</td></tr>
            <tr><td style="padding:8px 16px;font-size:13px;color:${TEXT_SECONDARY};font-weight:500;">${labels.framework}</td><td style="padding:8px 16px;font-size:13px;color:${TEXT};">transformers</td></tr>
            <tr><td style="padding:8px 16px;font-size:13px;color:${TEXT_SECONDARY};font-weight:500;">${labels.created}</td><td style="padding:8px 16px;font-size:13px;color:${TEXT};">Apr 17, 2024 9:35 AM</td></tr>
            <tr><td style="padding:8px 16px;font-size:13px;color:${TEXT_SECONDARY};font-weight:500;">${labels.lastModified}</td><td style="padding:8px 16px;font-size:13px;color:${TEXT};">May 29, 2024 12:27 PM</td></tr>
            <tr><td style="padding:8px 16px;font-size:13px;color:${TEXT_SECONDARY};font-weight:500;">${labels.minResource}</td><td style="padding:8px 16px;font-size:13px;color:${TEXT};">2.43 fGPU</td></tr>
          </tbody>
        </table>
        <div style="border-top:1px solid ${BORDER};padding-top:16px;">
          <div style="font-weight:600;font-size:14px;color:${TEXT_SECONDARY};margin-bottom:12px;">${labels.readme}</div>
          <div style="font-weight:600;font-size:18px;color:${TEXT};margin-bottom:8px;">${labels.modelDetails}</div>
          <div style="font-size:14px;line-height:1.6;color:${TEXT};margin-bottom:16px;">${labels.modelDetailsBody}</div>
          <div style="font-weight:600;font-size:18px;color:${TEXT};margin-bottom:8px;">${labels.variations}</div>
          <div style="font-size:14px;line-height:1.6;color:${TEXT};margin-bottom:16px;">${labels.variationsBody}</div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px;">
          <button style="padding:4px 15px;border:1px solid ${PRIMARY};background:${PRIMARY};color:#fff;border-radius:6px;cursor:pointer;font-size:14px;">${labels.clone}</button>
          <button style="padding:4px 15px;border:1px solid ${BORDER};background:#fff;border-radius:6px;cursor:pointer;font-size:14px;">${labels.close}</button>
        </div>
      </div>
    `;
  },
});

export default items;
