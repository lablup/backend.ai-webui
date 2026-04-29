// Tables, table strips, and small panels for FR-2743.
import { PRIMARY, PRIMARY_LIGHT, DANGER, BORDER, TEXT, TEXT_SECONDARY } from './_shared.mjs';

const items = [];

// Generic antd-like table styling
const TABLE_HEADER_BG = '#fafafa';

function tablePanel({ title, columns, rows, footerText = '', width = 1400, leftToolbar = '', rightToolbar = '' }) {
  return `
    <div style="display:inline-block;padding:20px;background:#fff;">
      ${title ? `<div style="font-weight:600;font-size:16px;color:${TEXT};margin-bottom:12px;">${title}</div>` : ''}
      ${leftToolbar || rightToolbar ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;width:${width}px;">${leftToolbar}<div>${rightToolbar}</div></div>` : ''}
      <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;width:${width}px;">
        <thead>
          <tr style="background:${TABLE_HEADER_BG};">
            ${columns.map(c => `<th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};white-space:nowrap;">${c}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(cell => `<td style="padding:12px 16px;font-size:14px;color:${TEXT};border-bottom:1px solid ${BORDER};">${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      ${footerText ? `<div style="margin-top:12px;text-align:right;font-size:14px;color:${TEXT_SECONDARY};">${footerText}</div>` : ''}
    </div>
  `;
}

const statusPill = (text, color = PRIMARY) => `<span style="display:inline-block;padding:2px 8px;border:1px solid ${color};color:${color};border-radius:4px;font-size:12px;">${text}</span>`;
const tag = (text, color = '#1890ff') => `<span style="display:inline-block;padding:1px 6px;background:#fff;border:1px solid ${color};color:${color};border-radius:4px;font-size:12px;margin-right:4px;">${text}</span>`;

// 1. check_if_user_created (1679x385) — Users tab table strip
items.push({
  file: 'check_if_user_created',
  render: (lang) => {
    const labels = {
      en: { breadcrumb: 'User Credentials & Policies', users: 'Users', credentials: 'Credentials', active: 'Active', inactive: 'Inactive', cols: ['User ID ↕', 'Name', 'Role', 'Description', 'Created At', 'Control'], chip: 'User ID:', userDesc: "test-user's Account", create: '+ Create User', pagination: '1 - 1 of 1 items, 10 / page' },
      ko: { breadcrumb: '사용자 자격 증명 및 정책', users: '사용자', credentials: '자격 증명', active: '활성', inactive: '비활성', cols: ['사용자 ID ↕', '이름', '역할', '설명', '생성일', '제어'], chip: '사용자 ID:', userDesc: 'test-user의 계정', create: '+ 사용자 생성', pagination: '1 - 1 / 1개 항목, 10 / 페이지' },
      ja: { breadcrumb: 'ユーザー認証情報とポリシー', users: 'ユーザー', credentials: '認証情報', active: 'アクティブ', inactive: '非アクティブ', cols: ['ユーザーID ↕', '名前', 'ロール', '説明', '作成日', '制御'], chip: 'ユーザーID:', userDesc: 'test-userのアカウント', create: '+ ユーザー作成', pagination: '1 - 1 / 1 件、10 / ページ' },
      th: { breadcrumb: 'ข้อมูลรับรองและนโยบายผู้ใช้', users: 'ผู้ใช้', credentials: 'ข้อมูลรับรอง', active: 'ใช้งานอยู่', inactive: 'ไม่ใช้งาน', cols: ['รหัสผู้ใช้ ↕', 'ชื่อ', 'บทบาท', 'คำอธิบาย', 'สร้างเมื่อ', 'ควบคุม'], chip: 'รหัสผู้ใช้:', userDesc: 'บัญชีของ test-user', create: '+ สร้างผู้ใช้', pagination: '1 - 1 / 1 รายการ, 10 / หน้า' },
    }[lang];
    return `
      <div style="display:inline-block;padding:20px;background:#fff;min-width:1500px;">
        <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">${labels.breadcrumb} /</div>
        <div style="display:flex;gap:24px;border-bottom:1px solid ${BORDER};margin-bottom:12px;">
          <div style="padding:8px 0;border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;font-size:14px;">${labels.users}</div>
          <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.credentials}</div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;">
          <div style="display:flex;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;">
            <div style="padding:4px 12px;background:${PRIMARY};color:#fff;font-size:13px;">${labels.active}</div>
            <div style="padding:4px 12px;background:#fff;color:${TEXT};font-size:13px;">${labels.inactive}</div>
          </div>
          <div style="display:inline-flex;align-items:center;gap:4px;background:${PRIMARY_LIGHT};border:1px solid ${PRIMARY};color:${PRIMARY};padding:2px 8px;border-radius:4px;font-size:12px;">${labels.chip} test-user ✕</div>
          <div style="flex:1;"></div>
          <button style="padding:4px 15px;border:1px solid ${PRIMARY};background:${PRIMARY};color:#fff;border-radius:6px;cursor:pointer;font-size:14px;">${labels.create}</button>
        </div>
        <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;width:1500px;">
          <thead><tr style="background:${TABLE_HEADER_BG};">${labels.cols.map(c => `<th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};">${c}</th>`).join('')}</tr></thead>
          <tbody><tr>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">test-user@lablup.com</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">testuser</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">user</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">${labels.userDesc}</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">Oct 23, 2025 3:37 PM</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">⋯</td>
          </tr></tbody>
        </table>
        <div style="margin-top:12px;text-align:right;font-size:14px;color:${TEXT_SECONDARY};">${labels.pagination}</div>
      </div>
    `;
  },
});

// 2. keypair_delete_button (1678x383) — Credentials tab Inactive segment
items.push({
  file: 'keypair_delete_button',
  render: (lang) => {
    const labels = {
      en: { breadcrumb: 'User Credentials & Policies', users: 'Users', credentials: 'Credentials', active: 'Active', inactive: 'Inactive', cols: ['Email', 'Access Key', 'Permission', 'Key Age', 'Created At', 'Resource Policy', 'Allocation'] },
      ko: { breadcrumb: '사용자 자격 증명 및 정책', users: '사용자', credentials: '자격 증명', active: '활성', inactive: '비활성', cols: ['이메일', '액세스 키', '권한', '키 사용 기간', '생성일', '자원 정책', '할당'] },
      ja: { breadcrumb: 'ユーザー認証情報とポリシー', users: 'ユーザー', credentials: '認証情報', active: 'アクティブ', inactive: '非アクティブ', cols: ['メールアドレス', 'アクセスキー', '権限', 'キー有効期間', '作成日', 'リソースポリシー', '割り当て'] },
      th: { breadcrumb: 'ข้อมูลรับรองและนโยบายผู้ใช้', users: 'ผู้ใช้', credentials: 'ข้อมูลรับรอง', active: 'ใช้งานอยู่', inactive: 'ไม่ใช้งาน', cols: ['อีเมล', 'คีย์การเข้าถึง', 'สิทธิ์', 'อายุคีย์', 'สร้างเมื่อ', 'นโยบายทรัพยากร', 'การจัดสรร'] },
    }[lang];
    return `
      <div style="display:inline-block;padding:20px;background:#fff;min-width:1500px;">
        <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">${labels.breadcrumb} /</div>
        <div style="display:flex;gap:24px;border-bottom:1px solid ${BORDER};margin-bottom:12px;">
          <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.users}</div>
          <div style="padding:8px 0;border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;font-size:14px;">${labels.credentials}</div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <div style="display:flex;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;">
            <div style="padding:4px 12px;background:#fff;color:${TEXT};font-size:13px;">${labels.active}</div>
            <div style="padding:4px 12px;background:${PRIMARY};color:#fff;font-size:13px;">${labels.inactive}</div>
          </div>
        </div>
        <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;width:1500px;">
          <thead><tr style="background:${TABLE_HEADER_BG};">${labels.cols.map(c => `<th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};white-space:nowrap;">${c}</th>`).join('')}</tr></thead>
          <tbody><tr>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">domain-admin@lablup.com</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};font-family:monospace;">AKIAHUKCHDEZGEXAMPLE</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">${tag('admin', PRIMARY)}${tag('user', '#1890ff')}</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">2 Days</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">Oct 21, 2025 10:51 AM</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">default</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">0 Sessions / 30000 Req per 15 min / 0 Queries</td>
          </tr></tbody>
        </table>
        <div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px;">
          <button style="width:32px;height:32px;border:2px solid ${PRIMARY};background:#fff;border-radius:6px;color:${DANGER};font-size:14px;cursor:pointer;">🗑</button>
        </div>
      </div>
    `;
  },
});

// 3. cluster_session_created (1146x304) — Kernels table for cluster session
items.push({
  file: 'cluster_session_created',
  render: (lang) => {
    const labels = {
      en: { kernels: 'Kernels', cols: ['Kernel', 'Status', 'Agent ID', 'Kernel ID', 'Container ID'] },
      ko: { kernels: '커널', cols: ['커널', '상태', '에이전트 ID', '커널 ID', '컨테이너 ID'] },
      ja: { kernels: 'カーネル', cols: ['カーネル', 'ステータス', 'エージェントID', 'カーネルID', 'コンテナID'] },
      th: { kernels: 'เคอร์เนล', cols: ['เคอร์เนล', 'สถานะ', 'รหัสเอเจนต์', 'รหัสเคอร์เนล', 'รหัสคอนเทนเนอร์'] },
    }[lang];
    const rows = [
      ['main1', statusPill('RUNNING', '#52c41a'), 'i-haplo02', '0e2c0515-7b45-440f-b4bc-de44811dbbef ⎘', 'a502e06bf90a9e8702fb737... ⎘'],
      ['sub1', statusPill('RUNNING', '#52c41a'), 'i-haplo02', '57b78ab9-80df-4b94-a05e-97845b421030 ⎘', 'b3d2f8a1e9c8...'],
      ['sub2', statusPill('RUNNING', '#52c41a'), 'i-haplo02', '47eafb2d-ecae-4bb0-9aa4-ceb4598fe6c7 ⎘', 'c4e3a9b2f0d9...'],
    ];
    return tablePanel({ title: labels.kernels, columns: labels.cols, rows, width: 1000 });
  },
});

// 4. vfolder_automount_folders (2272x668)
items.push({
  file: 'vfolder_automount_folders',
  render: (lang) => {
    const labels = {
      en: { folders: 'Folders', created: 'Created', trash: 'Trash', all: 'All', general: 'General', pipeline: 'Pipeline', autoMount: 'Auto Mount', models: 'Models', cols: ['Name', 'Controls', 'Status', 'Location', 'Type', 'Mount Permission', 'Owner'], pagination: 'Total 1 items / 1 / 10 page' },
      ko: { folders: '폴더', created: '생성됨', trash: '휴지통', all: '전체', general: '일반', pipeline: '파이프라인', autoMount: '자동 마운트', models: '모델', cols: ['이름', '제어', '상태', '위치', '유형', '마운트 권한', '소유자'], pagination: '총 1개 항목 / 1 / 10 페이지' },
      ja: { folders: 'フォルダ', created: '作成済み', trash: 'ゴミ箱', all: 'すべて', general: '一般', pipeline: 'パイプライン', autoMount: 'オートマウント', models: 'モデル', cols: ['名前', '制御', 'ステータス', '場所', 'タイプ', 'マウント権限', '所有者'], pagination: '合計 1 件 / 1 / 10 ページ' },
      th: { folders: 'โฟลเดอร์', created: 'สร้าง', trash: 'ถังขยะ', all: 'ทั้งหมด', general: 'ทั่วไป', pipeline: 'ไปป์ไลน์', autoMount: 'เมาต์อัตโนมัติ', models: 'โมเดล', cols: ['ชื่อ', 'ควบคุม', 'สถานะ', 'ตำแหน่ง', 'ประเภท', 'สิทธิ์เมาต์', 'เจ้าของ'], pagination: 'รวม 1 รายการ / 1 / 10 หน้า' },
    }[lang];
    const filterChip = (text, active) => `<div style="padding:2px 12px;border:1px solid ${active ? PRIMARY : BORDER};background:${active ? PRIMARY_LIGHT : '#fff'};color:${active ? PRIMARY : TEXT};border-radius:4px;font-size:13px;">${text}</div>`;
    return `
      <div style="display:inline-block;padding:20px;background:#fff;min-width:2050px;">
        <div style="font-weight:600;font-size:16px;color:${TEXT};margin-bottom:12px;">${labels.folders}</div>
        <div style="display:flex;gap:24px;border-bottom:1px solid ${BORDER};margin-bottom:12px;">
          <div style="padding:8px 0;border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;font-size:14px;">${labels.created} <span style="background:${PRIMARY};color:#fff;border-radius:10px;padding:1px 8px;font-size:12px;margin-left:4px;">3</span></div>
          <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.trash} <span style="background:#bfbfbf;color:#fff;border-radius:10px;padding:1px 8px;font-size:12px;margin-left:4px;">3</span></div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          ${filterChip(labels.all, false)}
          ${filterChip(labels.general, false)}
          ${filterChip(labels.pipeline, false)}
          ${filterChip(labels.autoMount, true)}
          ${filterChip(labels.models, false)}
        </div>
        <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;width:2050px;">
          <thead><tr style="background:${TABLE_HEADER_BG};">${labels.cols.map(c => `<th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};">${c}</th>`).join('')}</tr></thead>
          <tbody><tr>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">📁 .local</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">⤴ 🗑</td>
            <td style="padding:12px 16px;">${statusPill('READY', '#faad14')}</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">local:volume1</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">User</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">${tag('R', '#52c41a')}${tag('W', '#1890ff')}</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">✓</td>
          </tr></tbody>
        </table>
        <div style="margin-top:12px;text-align:right;font-size:14px;color:${TEXT_SECONDARY};">${labels.pagination}</div>
      </div>
    `;
  },
});

// 5. model_type_folder_list (2272x668) — Models filter, model-service row
const folderListPanel = (lang, rowName, createdCount, trashCount) => {
  const labels = {
    en: { folders: 'Folders', created: 'Created', trash: 'Trash', all: 'All', general: 'General', pipeline: 'Pipeline', autoMount: 'Auto Mount', models: 'Models', cols: ['Name', 'Controls', 'Status', 'Location', 'Type', 'Mount Permission', 'Owner'], pagination: 'Total 1 items / 1 / 10 page' },
    ko: { folders: '폴더', created: '생성됨', trash: '휴지통', all: '전체', general: '일반', pipeline: '파이프라인', autoMount: '자동 마운트', models: '모델', cols: ['이름', '제어', '상태', '위치', '유형', '마운트 권한', '소유자'], pagination: '총 1개 항목 / 1 / 10 페이지' },
    ja: { folders: 'フォルダ', created: '作成済み', trash: 'ゴミ箱', all: 'すべて', general: '一般', pipeline: 'パイプライン', autoMount: 'オートマウント', models: 'モデル', cols: ['名前', '制御', 'ステータス', '場所', 'タイプ', 'マウント権限', '所有者'], pagination: '合計 1 件 / 1 / 10 ページ' },
    th: { folders: 'โฟลเดอร์', created: 'สร้าง', trash: 'ถังขยะ', all: 'ทั้งหมด', general: 'ทั่วไป', pipeline: 'ไปป์ไลน์', autoMount: 'เมาต์อัตโนมัติ', models: 'โมเดล', cols: ['ชื่อ', 'ควบคุม', 'สถานะ', 'ตำแหน่ง', 'ประเภท', 'สิทธิ์เมาต์', 'เจ้าของ'], pagination: 'รวม 1 รายการ / 1 / 10 หน้า' },
  }[lang];
  const filterChip = (text, active) => `<div style="padding:2px 12px;border:1px solid ${active ? PRIMARY : BORDER};background:${active ? PRIMARY_LIGHT : '#fff'};color:${active ? PRIMARY : TEXT};border-radius:4px;font-size:13px;">${text}</div>`;
  return `
    <div style="display:inline-block;padding:20px;background:#fff;min-width:2050px;">
      <div style="font-weight:600;font-size:16px;color:${TEXT};margin-bottom:12px;">${labels.folders}</div>
      <div style="display:flex;gap:24px;border-bottom:1px solid ${BORDER};margin-bottom:12px;">
        <div style="padding:8px 0;border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;font-size:14px;">${labels.created} <span style="background:${PRIMARY};color:#fff;border-radius:10px;padding:1px 8px;font-size:12px;margin-left:4px;">${createdCount}</span></div>
        <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.trash}${trashCount ? ` <span style="background:#bfbfbf;color:#fff;border-radius:10px;padding:1px 8px;font-size:12px;margin-left:4px;">${trashCount}</span>` : ''}</div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        ${filterChip(labels.all, false)}
        ${filterChip(labels.general, false)}
        ${filterChip(labels.pipeline, false)}
        ${filterChip(labels.autoMount, false)}
        ${filterChip(labels.models, true)}
      </div>
      <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;width:2050px;">
        <thead><tr style="background:${TABLE_HEADER_BG};">${labels.cols.map(c => `<th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};">${c}</th>`).join('')}</tr></thead>
        <tbody><tr>
          <td style="padding:12px 16px;font-size:14px;color:${TEXT};">📁 ${rowName}</td>
          <td style="padding:12px 16px;font-size:14px;color:${TEXT};">⤴ 🗑</td>
          <td style="padding:12px 16px;">${statusPill('READY', '#faad14')}</td>
          <td style="padding:12px 16px;font-size:14px;color:${TEXT};">local:volume1</td>
          <td style="padding:12px 16px;font-size:14px;color:${TEXT};">User</td>
          <td style="padding:12px 16px;font-size:14px;color:${TEXT};">${tag('R', '#52c41a')}${tag('W', '#1890ff')}</td>
          <td style="padding:12px 16px;font-size:14px;color:${TEXT};">✓</td>
        </tr></tbody>
      </table>
      <div style="margin-top:12px;text-align:right;font-size:14px;color:${TEXT_SECONDARY};">${labels.pagination}</div>
    </div>
  `;
};

items.push({ file: 'model_type_folder_list', render: (lang) => folderListPanel(lang, 'model-service', 4, 0) });
items.push({ file: 'models', render: (lang) => folderListPanel(lang, 'model_folder', 4, 3) });

// 8. pending_session_list (1956x526) — legacy compute_session table
const legacySessionTable = (lang, rows, headerLabel = 'Sessions') => {
  const labels = {
    en: { sessions: headerLabel, running: 'Running', finished: 'Finished', sessionName: 'Session Name', cols: ['Session Name', 'Status', 'Util', 'AI Acc.', 'CPU', 'Memory', 'Elapsed Time'] },
    ko: { sessions: '세션', running: '실행 중', finished: '완료', sessionName: '세션 이름', cols: ['세션 이름', '상태', '사용률', 'AI 가속기', 'CPU', '메모리', '경과 시간'] },
    ja: { sessions: 'セッション', running: '実行中', finished: '完了', sessionName: 'セッション名', cols: ['セッション名', 'ステータス', '使用率', 'AIアクセラレータ', 'CPU', 'メモリ', '経過時間'] },
    th: { sessions: 'เซสชัน', running: 'กำลังทำงาน', finished: 'เสร็จสิ้น', sessionName: 'ชื่อเซสชัน', cols: ['ชื่อเซสชัน', 'สถานะ', 'การใช้งาน', 'AI Acc.', 'CPU', 'หน่วยความจำ', 'เวลาที่ผ่านไป'] },
  }[lang];
  return `
    <div style="display:inline-block;padding:20px;background:#fff;min-width:1700px;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
        <div style="font-weight:600;font-size:16px;color:${TEXT};">${labels.sessions}</div>
        <div style="display:flex;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;">
          <div style="padding:4px 12px;background:${PRIMARY};color:#fff;font-size:13px;">${labels.running}</div>
          <div style="padding:4px 12px;background:#fff;color:${TEXT};font-size:13px;">${labels.finished}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:${TEXT_SECONDARY};">↕ ${labels.sessionName}</div>
        <div style="margin-left:auto;">
          <button style="width:32px;height:32px;border:1px solid ${BORDER};background:#fff;border-radius:6px;cursor:pointer;color:${TEXT_SECONDARY};">↻</button>
        </div>
      </div>
      <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;width:1700px;">
        <thead><tr style="background:${TABLE_HEADER_BG};">${labels.cols.map(c => `<th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};white-space:nowrap;">${c}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(cell => `<td style="padding:12px 16px;font-size:14px;color:${TEXT};border-bottom:1px solid ${BORDER};">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  `;
};

items.push({
  file: 'pending_session_list',
  render: (lang) => legacySessionTable(lang, [
    ['test-for-multi-QlO-1', statusPill('PENDING', '#faad14'), '0% / 3% / 0%', '1 fGPU', '2', '4 GiB', '00:02:57'],
    ['test-for-multi-FSp-2', statusPill('RUNNING', '#52c41a'), '0% / 3% / 0%', '1 fGPU', '2', '4 GiB', '00:02:57'],
    ['test-for-multi-Omk-0', statusPill('RUNNING', '#52c41a'), '0% / 3% / 0%', '1 fGPU', '2', '4 GiB', '00:02:57'],
  ]),
});

items.push({
  file: 'pending_to_running',
  render: (lang) => legacySessionTable(lang, [
    ['test-for-multi-QlO-1', statusPill('RUNNING', '#52c41a'), '0% / 3% / 0%', '1 fGPU', '2', '4 GiB', '00:04:34'],
    ['test-for-multi-Omk-0', statusPill('RUNNING', '#52c41a'), '0% / 3% / 0%', '1 fGPU', '2', '4 GiB', '00:04:34'],
  ]),
});

// 10. session_list_with_gpu (2052x524) — Sessions page with GPU row
items.push({
  file: 'session_list_with_gpu',
  render: (lang) => {
    const labels = {
      en: { sessions: 'Sessions', all: 'All', interactive: 'Interactive', batch: 'Batch', inference: 'Inference', upload: 'Upload Sessions', running: 'Running', finished: 'Finished', sessionName: 'Session Name', cols: ['Session Name', 'Status', 'Util', 'AI Acc.', 'CPU', 'Memory', 'Elapsed Time'] },
      ko: { sessions: '세션', all: '전체', interactive: '대화형', batch: '배치', inference: '추론', upload: '업로드 세션', running: '실행 중', finished: '완료', sessionName: '세션 이름', cols: ['세션 이름', '상태', '사용률', 'AI 가속기', 'CPU', '메모리', '경과 시간'] },
      ja: { sessions: 'セッション', all: 'すべて', interactive: 'インタラクティブ', batch: 'バッチ', inference: '推論', upload: 'アップロードセッション', running: '実行中', finished: '完了', sessionName: 'セッション名', cols: ['セッション名', 'ステータス', '使用率', 'AIアクセラレータ', 'CPU', 'メモリ', '経過時間'] },
      th: { sessions: 'เซสชัน', all: 'ทั้งหมด', interactive: 'อินเทอร์แอกทีฟ', batch: 'แบตช์', inference: 'การอนุมาน', upload: 'อัปโหลดเซสชัน', running: 'กำลังทำงาน', finished: 'เสร็จสิ้น', sessionName: 'ชื่อเซสชัน', cols: ['ชื่อเซสชัน', 'สถานะ', 'การใช้งาน', 'AI Acc.', 'CPU', 'หน่วยความจำ', 'เวลาที่ผ่านไป'] },
    }[lang];
    return `
      <div style="display:inline-block;padding:20px;background:#fff;min-width:1850px;">
        <div style="display:flex;align-items:center;gap:24px;border-bottom:1px solid ${BORDER};margin-bottom:12px;">
          <div style="padding:8px 0;border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;font-size:14px;">${labels.all} (49)</div>
          <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.interactive} (5)</div>
          <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.batch} (11)</div>
          <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.inference} (33)</div>
          <div style="padding:8px 0;color:${TEXT_SECONDARY};font-size:14px;">${labels.upload}</div>
        </div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
          <div style="display:flex;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;">
            <div style="padding:4px 12px;background:${PRIMARY};color:#fff;font-size:13px;">${labels.running}</div>
            <div style="padding:4px 12px;background:#fff;color:${TEXT};font-size:13px;">${labels.finished}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:${TEXT_SECONDARY};">↕ ${labels.sessionName}</div>
        </div>
        <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;width:1800px;">
          <thead><tr style="background:${TABLE_HEADER_BG};">${labels.cols.map(c => `<th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};white-space:nowrap;">${c}</th>`).join('')}</tr></thead>
          <tbody><tr>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">test-session-for-docs</td>
            <td style="padding:12px 16px;">${statusPill('RUNNING', '#52c41a')}</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">0% / 3% / 0%</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">0.5 fGPU</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">3</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">4 GiB</td>
            <td style="padding:12px 16px;font-size:14px;color:${TEXT};">00:04:13</td>
          </tr></tbody>
        </table>
      </div>
    `;
  },
});

// 11. auto_scaling_rules_v2 (1212x315)
items.push({
  file: 'auto_scaling_rules_v2',
  render: (lang) => {
    const labels = {
      en: { rules: 'Auto Scaling Rules', cols: ['Metric Source', 'Condition', 'Cooldown', 'Step', 'Min/Max', 'Created At', 'Last Triggered', 'Control'], filter: 'Created At / after / Select date and time', pagination: '1-2 of 2 items' },
      ko: { rules: '자동 스케일링 규칙', cols: ['메트릭 소스', '조건', '대기 시간', '단계', '최소/최대', '생성일', '마지막 트리거', '제어'], filter: '생성일 / 이후 / 날짜와 시간 선택', pagination: '1-2 / 2개 항목' },
      ja: { rules: '自動スケーリングルール', cols: ['メトリックソース', '条件', 'クールダウン', 'ステップ', '最小/最大', '作成日', '最終トリガー', '制御'], filter: '作成日 / 以降 / 日時を選択', pagination: '1-2 / 2 件' },
      th: { rules: 'กฎ Auto Scaling', cols: ['แหล่งเมตริก', 'เงื่อนไข', 'คูลดาวน์', 'ขั้น', 'ต่ำสุด/สูงสุด', 'สร้างเมื่อ', 'ทริกเกอร์ล่าสุด', 'ควบคุม'], filter: 'สร้างเมื่อ / หลัง / เลือกวันที่และเวลา', pagination: '1-2 / 2 รายการ' },
    }[lang];
    const condTag = (text) => `<span style="display:inline-block;padding:2px 6px;background:#f5f5f5;border:1px solid ${BORDER};border-radius:4px;font-family:monospace;font-size:12px;">${text}</span>`;
    return `
      <div style="display:inline-block;padding:20px;background:#fff;min-width:1100px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:13px;color:${TEXT_SECONDARY};">📅 ${labels.filter}</div>
        <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;width:1100px;">
          <thead><tr style="background:${TABLE_HEADER_BG};">${labels.cols.map(c => `<th style="padding:8px 10px;text-align:left;font-size:12px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};">${c}</th>`).join('')}</tr></thead>
          <tbody>
            <tr>
              <td style="padding:8px 10px;font-size:12px;">${tag('KERNEL', PRIMARY)}</td>
              <td style="padding:8px 10px;font-size:12px;">${condTag('30 < mem < 80')}</td>
              <td style="padding:8px 10px;font-size:12px;">60s</td>
              <td style="padding:8px 10px;font-size:12px;">±1</td>
              <td style="padding:8px 10px;font-size:12px;">1 / 5</td>
              <td style="padding:8px 10px;font-size:12px;">Apr 17, 2026 5:34 PM</td>
              <td style="padding:8px 10px;font-size:12px;color:${TEXT_SECONDARY};">-</td>
              <td style="padding:8px 10px;font-size:12px;">✎ 🗑</td>
            </tr>
            <tr>
              <td style="padding:8px 10px;font-size:12px;">${tag('KERNEL', PRIMARY)}</td>
              <td style="padding:8px 10px;font-size:12px;">${condTag('80 < cpu_util')}</td>
              <td style="padding:8px 10px;font-size:12px;">60s</td>
              <td style="padding:8px 10px;font-size:12px;">-1</td>
              <td style="padding:8px 10px;font-size:12px;">1 / -</td>
              <td style="padding:8px 10px;font-size:12px;">Apr 17, 2026 5:34 PM</td>
              <td style="padding:8px 10px;font-size:12px;color:${TEXT_SECONDARY};">-</td>
              <td style="padding:8px 10px;font-size:12px;">✎ 🗑</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top:12px;text-align:right;font-size:13px;color:${TEXT_SECONDARY};">${labels.pagination}</div>
      </div>
    `;
  },
});

// 12. vfolder_status (2930x604) — Data page header strip with 3 cards
items.push({
  file: 'vfolder_status',
  render: (lang) => {
    const labels = {
      en: { breadcrumb: 'Data', createFolder: 'Create New Storage Folder', storageStatus: 'Storage Status', myFolders: 'My Folders', projectFolders: 'Project Folders', invitedFolders: 'Invited Folders', quota: 'Quota per storage volume', project: 'Project', user: 'User' },
      ko: { breadcrumb: '데이터', createFolder: '새 스토리지 폴더 생성', storageStatus: '스토리지 상태', myFolders: '내 폴더', projectFolders: '프로젝트 폴더', invitedFolders: '초대받은 폴더', quota: '스토리지 볼륨별 쿼터', project: '프로젝트', user: '사용자' },
      ja: { breadcrumb: 'データ', createFolder: '新規ストレージフォルダ作成', storageStatus: 'ストレージステータス', myFolders: 'マイフォルダ', projectFolders: 'プロジェクトフォルダ', invitedFolders: '招待されたフォルダ', quota: 'ストレージボリュームごとのクォータ', project: 'プロジェクト', user: 'ユーザー' },
      th: { breadcrumb: 'ข้อมูล', createFolder: 'สร้างโฟลเดอร์จัดเก็บใหม่', storageStatus: 'สถานะที่เก็บข้อมูล', myFolders: 'โฟลเดอร์ของฉัน', projectFolders: 'โฟลเดอร์โปรเจกต์', invitedFolders: 'โฟลเดอร์ที่ได้รับเชิญ', quota: 'โควต้าต่อโวลุ่ม', project: 'โปรเจกต์', user: 'ผู้ใช้' },
    }[lang];
    return `
      <div style="display:inline-block;padding:20px;background:#fff;min-width:2700px;">
        <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">${labels.breadcrumb} /</div>
        <div style="display:flex;gap:16px;">
          <!-- Create Folder card -->
          <div style="flex:0 0 380px;border:1px dashed ${BORDER};border-radius:8px;padding:24px;background:#fafafa;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-size:48px;color:${PRIMARY};margin-bottom:8px;">📁+</div>
            <div style="font-size:14px;color:${TEXT};font-weight:500;text-align:center;">${labels.createFolder}</div>
          </div>
          <!-- Storage Status card -->
          <div style="flex:1;border:1px solid ${BORDER};border-radius:8px;padding:20px;background:#fff;">
            <div style="font-weight:600;font-size:14px;color:${TEXT};margin-bottom:16px;">${labels.storageStatus}</div>
            <div style="display:flex;justify-content:space-around;text-align:center;">
              <div><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">${labels.myFolders}</div><div style="font-size:24px;color:${TEXT};font-weight:500;">2 <span style="font-size:14px;color:${TEXT_SECONDARY};">/ 20</span></div></div>
              <div><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">${labels.projectFolders}</div><div style="font-size:24px;color:${TEXT};font-weight:500;">1</div></div>
              <div><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">${labels.invitedFolders}</div><div style="font-size:24px;color:${TEXT};font-weight:500;">0</div></div>
            </div>
          </div>
          <!-- Quota card -->
          <div style="flex:1;border:1px solid ${BORDER};border-radius:8px;padding:20px;background:#fff;">
            <div style="font-weight:600;font-size:14px;color:${TEXT};margin-bottom:16px;">${labels.quota} <span style="font-family:monospace;color:${TEXT_SECONDARY};">local:myceph</span></div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              <div><div style="display:flex;justify-content:space-between;font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;"><span>${labels.project} default</span><span>0%</span></div><div style="height:6px;background:#f0f0f0;border-radius:3px;"></div></div>
              <div><div style="display:flex;justify-content:space-between;font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;"><span>${labels.user} Lablup</span><span>0%</span></div><div style="height:6px;background:#f0f0f0;border-radius:3px;"></div></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

export default items;
