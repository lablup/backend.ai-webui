// Shared translations and helpers for FR-2743 mock UI.
// Each entry maps en → ko/ja/th.

export const t = {
  // Buttons / common UI
  cancel: { en: 'Cancel', ko: '취소', ja: 'キャンセル', th: 'ยกเลิก' },
  ok: { en: 'OK', ko: '확인', ja: 'OK', th: 'ตกลง' },
  save: { en: 'Save', ko: '저장', ja: '保存', th: 'บันทึก' },
  delete: { en: 'Delete', ko: '삭제', ja: '削除', th: 'ลบ' },
  reset: { en: 'Reset', ko: '재설정', ja: 'リセット', th: 'รีเซ็ต' },
  create: { en: 'Create', ko: '생성', ja: '作成', th: 'สร้าง' },
  add: { en: 'Add', ko: '추가', ja: '追加', th: 'เพิ่ม' },
  edit: { en: 'Edit', ko: '편집', ja: '編集', th: 'แก้ไข' },
  view: { en: 'View', ko: '보기', ja: '表示', th: 'ดู' },
  refresh: { en: 'Refresh', ko: '새로고침', ja: '更新', th: 'รีเฟรช' },
  search: { en: 'Search', ko: '검색', ja: '検索', th: 'ค้นหา' },
  export: { en: 'Export', ko: '내보내기', ja: 'エクスポート', th: 'ส่งออก' },
  next: { en: 'Next', ko: '다음', ja: '次へ', th: 'ถัดไป' },
  previous: { en: 'Previous', ko: '이전', ja: '前へ', th: 'ก่อนหน้า' },
  launch: { en: 'Launch', ko: '실행', ja: '起動', th: 'เปิด' },
  close: { en: 'Close', ko: '닫기', ja: '閉じる', th: 'ปิด' },
  unset: { en: 'Unset', ko: '해제', ja: '解除', th: 'ยกเลิกการตั้งค่า' },
  activate: { en: 'Activate', ko: '활성화', ja: '有効化', th: 'เปิดใช้งาน' },
  deactivate: { en: 'Deactivate', ko: '비활성화', ja: '無効化', th: 'ปิดใช้งาน' },

  // Generic field labels
  name: { en: 'Name', ko: '이름', ja: '名前', th: 'ชื่อ' },
  email: { en: 'Email', ko: '이메일', ja: 'メールアドレス', th: 'อีเมล' },
  status: { en: 'Status', ko: '상태', ja: 'ステータス', th: 'สถานะ' },
  control: { en: 'Control', ko: '제어', ja: '制御', th: 'ควบคุม' },
  type: { en: 'Type', ko: '유형', ja: 'タイプ', th: 'ประเภท' },
  permission: { en: 'Permission', ko: '권한', ja: '権限', th: 'สิทธิ์' },
  owner: { en: 'Owner', ko: '소유자', ja: '所有者', th: 'เจ้าของ' },
  created_at: { en: 'Created At', ko: '생성일', ja: '作成日', th: 'สร้างเมื่อ' },
  description: { en: 'Description', ko: '설명', ja: '説明', th: 'คำอธิบาย' },
  role: { en: 'Role', ko: '역할', ja: 'ロール', th: 'บทบาท' },

  // i18n labels for app sections
  user_id: { en: 'User ID', ko: '사용자 ID', ja: 'ユーザーID', th: 'รหัสผู้ใช้' },
  user_credentials_policies: {
    en: 'User Credentials & Policies',
    ko: '사용자 자격 증명 및 정책',
    ja: 'ユーザー認証情報とポリシー',
    th: 'ข้อมูลรับรองและนโยบายผู้ใช้',
  },
  users: { en: 'Users', ko: '사용자', ja: 'ユーザー', th: 'ผู้ใช้' },
  credentials: { en: 'Credentials', ko: '자격 증명', ja: '認証情報', th: 'ข้อมูลรับรอง' },
  active: { en: 'Active', ko: '활성', ja: 'アクティブ', th: 'ใช้งานอยู่' },
  inactive: { en: 'Inactive', ko: '비활성', ja: '非アクティブ', th: 'ไม่ใช้งาน' },
  before_verification: { en: 'Before Verification', ko: '인증 대기', ja: '認証前', th: 'ก่อนยืนยัน' },
  deleted: { en: 'Deleted', ko: '삭제됨', ja: '削除済み', th: 'ลบแล้ว' },
  create_user: { en: 'Create User', ko: '사용자 생성', ja: 'ユーザー作成', th: 'สร้างผู้ใช้' },
  user_account_desc: {
    en: "test-user's Account",
    ko: 'test-user의 계정',
    ja: 'test-userのアカウント',
    th: 'บัญชีของ test-user',
  },
};

// Antd-mimicking constants
export const PRIMARY = '#FF5C00'; // Backend.AI orange
export const PRIMARY_LIGHT = '#FFF7E6';
export const DANGER = '#FF4D4F';
export const BORDER = '#d9d9d9';
export const TEXT = 'rgba(0,0,0,0.88)';
export const TEXT_SECONDARY = 'rgba(0,0,0,0.65)';

// Helper: Modal box wrapper. Returns inline-block-wrapped modal so bounding-box is content-sized.
export function modal({ title, width = 460, body, okText, cancelText, okType = 'primary', closable = true }) {
  const okClass = okType === 'danger' ? 'ant-btn-dangerous ant-btn-primary' : 'ant-btn-primary';
  return `
    <div style="display:inline-block;padding:20px;">
      <div class="ant-modal" style="width:${width}px;background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #f0f0f0;">
          <div style="font-weight:600;font-size:16px;color:${TEXT};">${title}</div>
          ${closable ? '<span style="cursor:pointer;color:rgba(0,0,0,0.45);font-size:16px;">✕</span>' : ''}
        </div>
        <div style="padding:24px;color:${TEXT};">${body}</div>
        <div style="padding:10px 16px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;gap:8px;">
          <button class="ant-btn ant-btn-default" style="padding:4px 15px;border:1px solid ${BORDER};background:#fff;border-radius:6px;cursor:pointer;font-size:14px;">${cancelText}</button>
          <button class="ant-btn ${okClass}" style="padding:4px 15px;border:1px solid ${okType === 'danger' ? DANGER : PRIMARY};background:${okType === 'danger' ? DANGER : PRIMARY};color:#fff;border-radius:6px;cursor:pointer;font-size:14px;box-shadow:0 0 0 2px ${okType === 'danger' ? 'rgba(255,77,79,0.2)' : 'rgba(255,92,0,0.2)'};">${okText}</button>
        </div>
      </div>
    </div>
  `;
}

// Helper: Popconfirm box
export function popconfirm({ title, body, okText, cancelText, okType = 'primary', triggerIcon = '⊘' }) {
  const okBg = okType === 'danger' ? DANGER : PRIMARY;
  return `
    <div style="display:inline-flex;flex-direction:column;align-items:flex-start;padding:20px;">
      <div style="position:relative;background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:12px 16px;min-width:240px;">
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <span style="color:#faad14;font-size:14px;flex-shrink:0;margin-top:2px;">⚠</span>
          <div style="flex:1;">
            <div style="font-weight:500;font-size:14px;color:${TEXT};margin-bottom:4px;">${title}</div>
            <div style="font-size:14px;color:${TEXT_SECONDARY};margin-bottom:12px;">${body}</div>
            <div style="display:flex;justify-content:flex-end;gap:8px;">
              <button style="padding:0 7px;height:24px;border:1px solid ${BORDER};background:#fff;border-radius:4px;cursor:pointer;font-size:12px;">${cancelText}</button>
              <button style="padding:0 7px;height:24px;border:1px solid ${okBg};background:${okBg};color:#fff;border-radius:4px;cursor:pointer;font-size:12px;">${okText}</button>
            </div>
          </div>
        </div>
        <!-- arrow -->
        <div style="position:absolute;left:24px;bottom:-6px;width:12px;height:12px;background:#fff;transform:rotate(45deg);box-shadow:3px 3px 7px -3px rgba(0,0,0,0.08);"></div>
      </div>
      <div style="margin-top:14px;margin-left:18px;">
        <button style="padding:4px;border:2px solid ${PRIMARY};background:#fff;border-radius:4px;cursor:pointer;font-size:14px;line-height:1;color:${TEXT_SECONDARY};">${triggerIcon}</button>
      </div>
    </div>
  `;
}

// Antd-style Select dropdown panel
export function selectDropdown({ options, selectedIndex = 0, width = 200 }) {
  return `
    <div class="ant-select-dropdown" style="width:${width}px;background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:4px;">
      ${options.map((opt, i) => `
        <div style="padding:5px 12px;font-size:14px;color:${TEXT};cursor:pointer;border-radius:4px;${i === selectedIndex ? `background:${PRIMARY_LIGHT};font-weight:500;` : ''}">
          ${opt}
        </div>
      `).join('')}
    </div>
  `;
}

// Tooltip black with arrow
export function blackTooltip({ text, placement = 'top' }) {
  const arrowStyle = placement === 'top'
    ? 'left:50%;bottom:-4px;transform:translateX(-50%) rotate(45deg);'
    : 'left:50%;top:-4px;transform:translateX(-50%) rotate(45deg);';
  return `
    <div style="display:inline-block;position:relative;background:rgba(0,0,0,0.85);color:#fff;border-radius:6px;padding:6px 8px;font-size:14px;line-height:1.5;">
      ${text}
      <div style="position:absolute;width:8px;height:8px;background:rgba(0,0,0,0.85);${arrowStyle}"></div>
    </div>
  `;
}

// Wrap content with viewport-style background
export function wrap(content, opts = {}) {
  const { background = '#fff', padding = '0', minHeight = 'auto' } = opts;
  return `<div style="background:${background};padding:${padding};min-height:${minHeight};box-sizing:border-box;">${content}</div>`;
}
