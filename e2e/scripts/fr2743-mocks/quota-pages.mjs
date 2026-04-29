// E1 storage quota pages — FR-2743.
import { PRIMARY, PRIMARY_LIGHT, DANGER, BORDER, TEXT, TEXT_SECONDARY } from './_shared.mjs';

const items = [];

function storageHeader(lang, { volumeName, usagePercent, usedSize, totalSize, endpoint, backendType, capabilities }) {
  const labels = {
    en: { breadcrumb: 'Storage Setting', usage: 'Usage', used: 'Used', total: 'Total', endpoint: 'Endpoint', backendType: 'Backend Type', capabilities: 'Capabilities' },
    ko: { breadcrumb: '스토리지 설정', usage: '사용률', used: '사용 중', total: '총 용량', endpoint: '엔드포인트', backendType: '백엔드 유형', capabilities: '기능' },
    ja: { breadcrumb: 'ストレージ設定', usage: '使用率', used: '使用中', total: '合計', endpoint: 'エンドポイント', backendType: 'バックエンドタイプ', capabilities: '機能' },
    th: { breadcrumb: 'การตั้งค่าพื้นที่จัดเก็บ', usage: 'การใช้งาน', used: 'ใช้แล้ว', total: 'ทั้งหมด', endpoint: 'จุดเชื่อมต่อ', backendType: 'ประเภทแบ็กเอนด์', capabilities: 'ความสามารถ' },
  }[lang];
  const tag = (text) => `<span style="display:inline-block;padding:2px 8px;background:${PRIMARY_LIGHT};color:${PRIMARY};border:1px solid ${PRIMARY};border-radius:4px;font-size:12px;margin-right:6px;">${text}</span>`;
  return `
    <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">${labels.breadcrumb} /</div>
    <div style="font-weight:600;font-size:18px;color:${TEXT};margin-bottom:16px;">${volumeName}</div>
    <div style="display:flex;gap:24px;margin-bottom:24px;">
      <div style="flex:0 0 280px;">
        <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.usage}</div>
        <div style="font-weight:600;font-size:24px;color:${TEXT};margin-bottom:4px;">${usagePercent}%</div>
        <div style="font-size:12px;color:${TEXT_SECONDARY};">${labels.used} ${usedSize} / ${labels.total} ${totalSize}</div>
      </div>
      <div style="flex:1;font-size:13px;">
        <table style="width:100%;border-collapse:separate;border-spacing:0;">
          <tr><td style="padding:6px 0;color:${TEXT_SECONDARY};width:140px;">${labels.endpoint}</td><td style="padding:6px 0;color:${TEXT};font-family:monospace;">${endpoint}</td></tr>
          <tr><td style="padding:6px 0;color:${TEXT_SECONDARY};">${labels.backendType}</td><td style="padding:6px 0;color:${TEXT};font-family:monospace;">${backendType}</td></tr>
          <tr><td style="padding:6px 0;color:${TEXT_SECONDARY};vertical-align:top;">${labels.capabilities}</td><td style="padding:6px 0;color:${TEXT};">${capabilities.map(tag).join('')}</td></tr>
        </table>
      </div>
    </div>
  `;
}

// no_support_quota_setting (3356x1018)
items.push({
  file: 'no_support_quota_setting',
  render: (lang) => {
    const labels = {
      en: { quotaSettings: 'Quota Settings', noSupport: 'This storage backend does not support quota.' },
      ko: { quotaSettings: '쿼터 설정', noSupport: '이 스토리지 백엔드는 쿼터를 지원하지 않습니다.' },
      ja: { quotaSettings: 'クォータ設定', noSupport: 'このストレージバックエンドはクォータをサポートしていません。' },
      th: { quotaSettings: 'การตั้งค่าโควต้า', noSupport: 'แบ็กเอนด์ที่เก็บข้อมูลนี้ไม่รองรับโควต้า' },
    }[lang];
    return `
      <div style="display:inline-block;padding:24px;background:#fff;min-width:3000px;">
        ${storageHeader(lang, { volumeName: 'local:volume1', usagePercent: '39.7', usedSize: '11.95 GB', totalSize: '30.08 GB', endpoint: '/home/ubuntu/backend.ai/vfroot/local', backendType: 'vfs', capabilities: ['vfolder'] })}
        <div style="border:1px solid ${BORDER};border-radius:6px;background:#fff;padding:48px;text-align:center;">
          <div style="font-weight:600;font-size:16px;color:${TEXT};margin-bottom:12px;">${labels.quotaSettings}</div>
          <div style="font-size:48px;color:${TEXT_SECONDARY};margin-bottom:12px;">📦</div>
          <div style="font-size:14px;color:${TEXT_SECONDARY};">${labels.noSupport}</div>
        </div>
      </div>
    `;
  },
});

function vastHeader(lang) {
  return storageHeader(lang, { volumeName: '/vast', usagePercent: '3.8', usedSize: '11.7 TB', totalSize: '310.17 TB', endpoint: '/vast', backendType: 'vast', capabilities: ['quota', 'fast-size', 'vfolder', 'metric', 'fast-fs-size'] });
}

function quotaTabsHeader(lang, activeTab) {
  const labels = {
    en: { forUser: 'For User', forProject: 'For Project' },
    ko: { forUser: '사용자별', forProject: '프로젝트별' },
    ja: { forUser: 'ユーザー別', forProject: 'プロジェクト別' },
    th: { forUser: 'ตามผู้ใช้', forProject: 'ตามโปรเจกต์' },
  }[lang];
  return `
    <div style="display:flex;gap:24px;border-bottom:1px solid ${BORDER};margin-bottom:16px;">
      <div style="padding:8px 0;${activeTab === 'user' ? `border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;` : `color:${TEXT_SECONDARY};`}font-size:14px;">${labels.forUser}</div>
      <div style="padding:8px 0;${activeTab === 'project' ? `border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;` : `color:${TEXT_SECONDARY};`}font-size:14px;">${labels.forProject}</div>
    </div>
  `;
}

function emptyQuotaTable(lang, placeholder) {
  const labels = {
    en: { cols: ['Quota Scope ID', 'Hard Limit (GB)', 'Usage (GB)', 'Control'] },
    ko: { cols: ['쿼터 범위 ID', '최대 한도 (GB)', '사용량 (GB)', '제어'] },
    ja: { cols: ['クォータスコープID', 'ハードリミット (GB)', '使用量 (GB)', '制御'] },
    th: { cols: ['รหัสขอบเขตโควต้า', 'ขีดจำกัดสูงสุด (GB)', 'การใช้งาน (GB)', 'ควบคุม'] },
  }[lang];
  return `
    <table style="width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;">
      <thead><tr style="background:#fafafa;">${labels.cols.map(c => `<th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};">${c}</th>`).join('')}</tr></thead>
      <tbody><tr><td colspan="4" style="padding:48px;text-align:center;color:${TEXT_SECONDARY};font-size:14px;">${placeholder}</td></tr></tbody>
    </table>
  `;
}

// per_project_quota (3354x1372)
items.push({
  file: 'per_project_quota',
  render: (lang) => {
    const labels = {
      en: { domain: 'Domain', project: 'Project', placeholder: 'Please select a user or project from the selector above.', generalGroup: 'General', modelStoreGroup: 'Model Store' },
      ko: { domain: '도메인', project: '프로젝트', placeholder: '위의 선택기에서 사용자 또는 프로젝트를 선택하세요.', generalGroup: '일반', modelStoreGroup: '모델 스토어' },
      ja: { domain: 'ドメイン', project: 'プロジェクト', placeholder: '上のセレクターからユーザーまたはプロジェクトを選択してください。', generalGroup: '一般', modelStoreGroup: 'モデルストア' },
      th: { domain: 'โดเมน', project: 'โปรเจกต์', placeholder: 'โปรดเลือกผู้ใช้หรือโปรเจกต์จากตัวเลือกด้านบน', generalGroup: 'ทั่วไป', modelStoreGroup: 'ที่เก็บโมเดล' },
    }[lang];
    return `
      <div style="display:inline-block;padding:24px;background:#fff;min-width:3000px;">
        ${vastHeader(lang)}
        ${quotaTabsHeader(lang, 'project')}
        <div style="display:flex;gap:16px;margin-bottom:16px;">
          <div style="flex:1;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.domain}</div><div style="border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;font-size:14px;color:${TEXT};">default <span style="margin-left:auto;color:${TEXT_SECONDARY};">▾</span></div></div>
          <div style="flex:1;position:relative;">
            <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.project}</div>
            <div style="border:2px solid ${PRIMARY};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;font-size:14px;color:${TEXT};box-shadow:0 0 0 2px rgba(255,92,0,0.1);">default <span style="margin-left:auto;color:${TEXT_SECONDARY};">▾</span></div>
            <div style="position:absolute;top:60px;left:0;width:100%;background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08);padding:4px;z-index:5;">
              <div style="padding:4px 12px;font-size:12px;color:${TEXT_SECONDARY};">${labels.generalGroup}</div>
              <div style="padding:5px 12px;font-size:14px;color:${TEXT};background:${PRIMARY_LIGHT};border-radius:4px;">default</div>
              <div style="padding:5px 12px;font-size:14px;color:${TEXT};">test-project</div>
              <div style="padding:4px 12px;font-size:12px;color:${TEXT_SECONDARY};margin-top:4px;">${labels.modelStoreGroup}</div>
              <div style="padding:5px 12px;font-size:14px;color:${TEXT};">model-store</div>
            </div>
          </div>
        </div>
        <div style="margin-top:120px;">${emptyQuotaTable(lang, labels.placeholder)}</div>
      </div>
    `;
  },
});

// per_user_quota (3354x1452)
items.push({
  file: 'per_user_quota',
  render: (lang) => {
    const labels = {
      en: { user: 'User', placeholder: 'No quota settings. If you want to set quota configs, click the button below.', addConfigs: '+ Add Quota Configs' },
      ko: { user: '사용자', placeholder: '쿼터 설정 없음. 쿼터 구성을 설정하려면 아래 버튼을 클릭하세요.', addConfigs: '+ 쿼터 구성 추가' },
      ja: { user: 'ユーザー', placeholder: 'クォータ設定なし。クォータ構成を設定するには、下のボタンをクリックしてください。', addConfigs: '+ クォータ構成の追加' },
      th: { user: 'ผู้ใช้', placeholder: 'ไม่มีการตั้งค่าโควต้า หากต้องการตั้งค่าโควต้า คลิกปุ่มด้านล่าง', addConfigs: '+ เพิ่มการกำหนดค่าโควต้า' },
    }[lang];
    return `
      <div style="display:inline-block;padding:24px;background:#fff;min-width:3000px;">
        ${vastHeader(lang)}
        ${quotaTabsHeader(lang, 'user')}
        <div style="margin-bottom:16px;position:relative;">
          <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.user}</div>
          <div style="border:2px solid ${PRIMARY};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;font-size:14px;color:${TEXT};">admin <span style="margin-left:auto;color:${TEXT_SECONDARY};">▾</span></div>
          <div style="position:absolute;top:60px;left:0;width:300px;background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08);padding:4px;z-index:5;">
            <div style="padding:5px 12px;font-size:14px;color:${TEXT};background:${PRIMARY_LIGHT};border-radius:4px;">admin@lablup.com</div>
            <div style="padding:5px 12px;font-size:14px;color:${TEXT};filter:blur(5px);">someuser@lablup.com</div>
          </div>
        </div>
        <div style="margin-top:120px;border:1px solid ${BORDER};border-radius:6px;padding:48px;text-align:center;background:#fff;">
          <div style="font-size:14px;color:${TEXT_SECONDARY};margin-bottom:16px;">${labels.placeholder}</div>
          <button style="padding:6px 16px;border:1px dashed ${PRIMARY};background:#fff;color:${PRIMARY};border-radius:6px;font-size:14px;cursor:pointer;">${labels.addConfigs}</button>
        </div>
      </div>
    `;
  },
});

// quota_setting_page (3356x1370) — vast empty For User initial state
items.push({
  file: 'quota_setting_page',
  render: (lang) => {
    const labels = {
      en: { user: 'User', searchPlaceholder: 'Search and select User', placeholder: 'Please select a user or project from the selector above.' },
      ko: { user: '사용자', searchPlaceholder: '사용자 검색 및 선택', placeholder: '위의 선택기에서 사용자 또는 프로젝트를 선택하세요.' },
      ja: { user: 'ユーザー', searchPlaceholder: 'ユーザーを検索して選択', placeholder: '上のセレクターからユーザーまたはプロジェクトを選択してください。' },
      th: { user: 'ผู้ใช้', searchPlaceholder: 'ค้นหาและเลือกผู้ใช้', placeholder: 'โปรดเลือกผู้ใช้หรือโปรเจกต์จากตัวเลือกด้านบน' },
    }[lang];
    return `
      <div style="display:inline-block;padding:24px;background:#fff;min-width:3000px;">
        ${vastHeader(lang)}
        ${quotaTabsHeader(lang, 'user')}
        <div style="margin-bottom:16px;">
          <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.user}</div>
          <div style="border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;font-size:14px;color:${TEXT_SECONDARY};">${labels.searchPlaceholder} <span style="margin-left:auto;">▾</span></div>
        </div>
        ${emptyQuotaTable(lang, labels.placeholder)}
      </div>
    `;
  },
});

export default items;
