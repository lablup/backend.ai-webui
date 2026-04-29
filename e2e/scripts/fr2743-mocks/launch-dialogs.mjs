// G1/G2/I2 launch dialog and resource panels — FR-2743.
import { PRIMARY, PRIMARY_LIGHT, DANGER, BORDER, TEXT, TEXT_SECONDARY } from './_shared.mjs';

const items = [];

function resourcePanel(lang, { resourceGroup, cpu, mem, shm, accelerator, sessions }) {
  const labels = {
    en: { resourceAllocation: 'Resource Allocation', resourceGroup: 'Resource Group', custom: 'Custom allocation', cpu: 'CPU', mem: 'MEM', shm: 'SHM', acc: 'AI Accelerator', sessions: 'Sessions' },
    ko: { resourceAllocation: '자원 할당', resourceGroup: '자원 그룹', custom: '사용자 정의 할당', cpu: 'CPU', mem: '메모리', shm: 'SHM', acc: 'AI 가속기', sessions: '세션' },
    ja: { resourceAllocation: 'リソース割り当て', resourceGroup: 'リソースグループ', custom: 'カスタム割り当て', cpu: 'CPU', mem: 'メモリ', shm: 'SHM', acc: 'AIアクセラレータ', sessions: 'セッション' },
    th: { resourceAllocation: 'การจัดสรรทรัพยากร', resourceGroup: 'กลุ่มทรัพยากร', custom: 'การจัดสรรกำหนดเอง', cpu: 'CPU', mem: 'หน่วยความจำ', shm: 'SHM', acc: 'AI Accelerator', sessions: 'เซสชัน' },
  }[lang];
  const sliderRow = (label, value, max) => `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
      <div style="flex:0 0 100px;font-size:13px;color:${TEXT};">${label}</div>
      <div style="flex:1;height:6px;background:#f0f0f0;border-radius:3px;position:relative;"><div style="position:absolute;left:0;top:0;width:${(parseFloat(value) / parseFloat(max)) * 100}%;height:100%;background:${PRIMARY};border-radius:3px;"></div></div>
      <div style="flex:0 0 100px;font-size:13px;color:${TEXT};text-align:right;">${value} / ${max}</div>
    </div>
  `;
  return `
    <div style="display:inline-block;padding:24px;background:#fff;width:560px;border:1px solid ${BORDER};border-radius:8px;">
      <div style="font-weight:600;font-size:16px;color:${TEXT};margin-bottom:16px;">${labels.resourceAllocation}</div>
      <div style="margin-bottom:16px;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.resourceGroup}</div><div style="border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;font-size:14px;color:${TEXT};">${resourceGroup} <span style="margin-left:auto;color:${TEXT_SECONDARY};">▾</span></div></div>
      <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:1px solid ${BORDER};">
        <div style="padding:6px 12px;border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;font-size:13px;">${labels.custom}</div>
      </div>
      ${sliderRow(labels.cpu, cpu.split('/')[0].trim(), cpu.split('/')[1].trim())}
      ${sliderRow(labels.mem, mem.split('/')[0].trim(), mem.split('/')[1].trim())}
      ${sliderRow(labels.shm, shm.split('/')[0].trim(), shm.split('/')[1].trim())}
      ${sliderRow(labels.acc, accelerator.split('/')[0].trim(), accelerator.split('/')[1].trim())}
      ${sessions ? sliderRow(labels.sessions, sessions.split('/')[0].trim(), sessions.split('/')[1].trim()) : ''}
    </div>
  `;
}

// session_launch_dialog_with_gpu (1142x1090) — Resource panel with 0.5 fGPU
items.push({
  file: 'session_launch_dialog_with_gpu',
  render: (lang) => resourcePanel(lang, { resourceGroup: 'nvidia-RTX', cpu: '3 / 256', mem: '4 / 256 GiB', shm: '0 / 256 GiB', accelerator: '0.5 / 8 fGPU' }),
});

// session_launch_dialog_2_sessions (1126x1336) — 2 sessions config
items.push({
  file: 'session_launch_dialog_2_sessions',
  render: (lang) => resourcePanel(lang, { resourceGroup: 'nvidia-RTX', cpu: '2 / 256', mem: '4 / 256 GiB', shm: '0 / 256 GiB', accelerator: '1.0 / 8 fGPU', sessions: '3 / 3' }),
});

// session-creation-by-specifying-image-name (1418x894) — Environments panel
items.push({
  file: 'session-creation-by-specifying-image-name',
  render: (lang) => {
    const labels = {
      en: { startSession: 'Start new session', environments: 'Environments', version: 'Version', imageManual: 'Image Name (Manual)', optional: 'optional', variable: 'Variable', addEnvVar: '+ Add environment variables' },
      ko: { startSession: '새 세션 시작', environments: '환경', version: '버전', imageManual: '이미지 이름 (수동)', optional: '선택', variable: '변수', addEnvVar: '+ 환경 변수 추가' },
      ja: { startSession: '新規セッション開始', environments: '環境', version: 'バージョン', imageManual: 'イメージ名 (手動)', optional: '任意', variable: '変数', addEnvVar: '+ 環境変数を追加' },
      th: { startSession: 'เริ่มเซสชันใหม่', environments: 'สภาพแวดล้อม', version: 'เวอร์ชัน', imageManual: 'ชื่ออิมเมจ (กำหนดเอง)', optional: 'ไม่บังคับ', variable: 'ตัวแปร', addEnvVar: '+ เพิ่มตัวแปรสภาพแวดล้อม' },
    }[lang];
    return `
      <div style="display:inline-block;padding:24px;background:#fff;width:700px;border:1px solid ${BORDER};border-radius:8px;">
        <div style="font-weight:600;font-size:16px;color:${TEXT};margin-bottom:16px;">${labels.startSession}</div>
        <div style="font-weight:500;font-size:14px;color:${TEXT};margin-bottom:12px;border-bottom:1px solid ${BORDER};padding-bottom:8px;">${labels.environments}</div>
        <div style="display:flex;gap:12px;margin-bottom:16px;">
          <div style="flex:1;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.environments}</div><div style="border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;color:${TEXT_SECONDARY};font-size:14px;justify-content:space-between;"><span></span><span>▾</span></div></div>
          <div style="flex:1;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.version}</div><div style="border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;color:${TEXT_SECONDARY};font-size:14px;justify-content:space-between;"><span></span><span>▾</span></div></div>
        </div>
        <div style="margin-bottom:16px;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.imageManual} <span style="font-size:11px;">(${labels.optional})</span></div><div style="border:1px solid ${BORDER};border-radius:6px;padding:6px 11px;font-family:monospace;font-size:12px;background:#fafafa;word-break:break-all;">bai-repo:7443/bai/ngc-pytorch-admin:22.12-py3-d230313@x86_64</div></div>
        <div style="font-weight:500;font-size:14px;color:${TEXT};margin-bottom:8px;">${labels.variable} <span style="font-size:12px;color:${TEXT_SECONDARY};">(${labels.optional})</span></div>
        <div style="border:1px dashed ${BORDER};border-radius:6px;padding:12px;text-align:center;color:${TEXT_SECONDARY};font-size:14px;cursor:pointer;">${labels.addEnvVar}</div>
      </div>
    `;
  },
});

function reviewStep(lang, { image, resourceGroup, preset, cores, mem, shm, sessionType = 'interactive' }) {
  const labels = {
    en: { confirmAndLaunch: 'Confirm and Launch', sessionType: 'Session Type', project: 'Project', image: 'Image', resourceAllocation: 'Resource Allocation', resourceGroup: 'Resource Group', preset: 'Preset', singleNode: 'Single Node', dataStorage: 'Data & Storage', noFolderMounted: 'No storage folder is mounted', network: 'Network', preopenPorts: 'Preopen Ports', none: 'None', reset: 'Reset', previous: 'Previous', launch: 'Launch' },
    ko: { confirmAndLaunch: '확인 및 시작', sessionType: '세션 유형', project: '프로젝트', image: '이미지', resourceAllocation: '자원 할당', resourceGroup: '자원 그룹', preset: '프리셋', singleNode: '단일 노드', dataStorage: '데이터 및 스토리지', noFolderMounted: '마운트된 스토리지 폴더 없음', network: '네트워크', preopenPorts: '사전 개방 포트', none: '없음', reset: '재설정', previous: '이전', launch: '시작' },
    ja: { confirmAndLaunch: '確認して起動', sessionType: 'セッションタイプ', project: 'プロジェクト', image: 'イメージ', resourceAllocation: 'リソース割り当て', resourceGroup: 'リソースグループ', preset: 'プリセット', singleNode: 'シングルノード', dataStorage: 'データとストレージ', noFolderMounted: 'マウントされているストレージフォルダはありません', network: 'ネットワーク', preopenPorts: '事前公開ポート', none: 'なし', reset: 'リセット', previous: '前へ', launch: '起動' },
    th: { confirmAndLaunch: 'ยืนยันและเริ่ม', sessionType: 'ประเภทเซสชัน', project: 'โปรเจกต์', image: 'อิมเมจ', resourceAllocation: 'การจัดสรรทรัพยากร', resourceGroup: 'กลุ่มทรัพยากร', preset: 'พรีเซต', singleNode: 'โหนดเดียว', dataStorage: 'ข้อมูลและที่เก็บข้อมูล', noFolderMounted: 'ไม่มีโฟลเดอร์ที่เก็บข้อมูลถูกเมาต์', network: 'เครือข่าย', preopenPorts: 'พอร์ตที่เปิดล่วงหน้า', none: 'ไม่มี', reset: 'รีเซ็ต', previous: 'ก่อนหน้า', launch: 'เริ่ม' },
  }[lang];
  const row = (label, value) => `<div style="display:flex;padding:6px 0;border-bottom:1px solid #f5f5f5;font-size:13px;"><div style="flex:0 0 140px;color:${TEXT_SECONDARY};">${label}</div><div style="flex:1;color:${TEXT};">${value}</div></div>`;
  return `
    <div style="display:inline-block;padding:24px;background:#fff;width:620px;border:1px solid ${BORDER};border-radius:8px;">
      <div style="font-weight:600;font-size:16px;color:${TEXT};margin-bottom:16px;">${labels.confirmAndLaunch}</div>
      <div style="font-weight:500;font-size:14px;color:${TEXT};margin:8px 0;">${labels.sessionType}</div>
      ${row(labels.sessionType, sessionType)}
      ${row(labels.project, 'default')}
      ${row(labels.image, image)}
      <div style="font-weight:500;font-size:14px;color:${TEXT};margin:16px 0 8px;">${labels.resourceAllocation}</div>
      ${row(labels.resourceGroup, resourceGroup)}
      ${row(labels.preset, preset)}
      ${row('CPU / MEM / SHM', `${cores} Core / ${mem} (SHM ${shm})`)}
      ${row(labels.singleNode, '✓')}
      <div style="font-weight:500;font-size:14px;color:${TEXT};margin:16px 0 8px;">${labels.dataStorage}</div>
      <div style="background:#fffbe6;border:1px solid #ffe58f;border-radius:6px;padding:8px 12px;font-size:13px;color:${TEXT};margin-bottom:8px;">⚠ ${labels.noFolderMounted}</div>
      <div style="font-weight:500;font-size:14px;color:${TEXT};margin:16px 0 8px;">${labels.network}</div>
      ${row(labels.preopenPorts, labels.none)}
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;border-top:1px solid ${BORDER};padding-top:12px;">
        <button style="padding:4px 15px;border:1px solid ${BORDER};background:#fff;border-radius:6px;cursor:pointer;font-size:13px;">${labels.reset}</button>
        <button style="padding:4px 15px;border:1px solid ${BORDER};background:#fff;border-radius:6px;cursor:pointer;font-size:13px;">${labels.previous}</button>
        <button style="padding:4px 15px;border:1px solid ${PRIMARY};background:${PRIMARY};color:#fff;border-radius:6px;cursor:pointer;font-size:13px;">${labels.launch}</button>
      </div>
    </div>
  `;
}

items.push({ file: 'session_launch_dialog_pytorch17', render: (lang) => reviewStep(lang, { image: 'Python Tensorflow 1.7 / x86_64 / Python 3.6 / GPU:CUDA10', resourceGroup: 'nvidia-H100', preset: '0-CPUmedium', cores: '8', mem: '16 GiB', shm: '1.00 GiB' }) });
items.push({ file: 'session_launch_dialog_tf115', render: (lang) => reviewStep(lang, { image: 'Python Tensorflow 1.15 / x86_64 / Python 3.6 / GPU:CUDA10', resourceGroup: 'nvidia-H100', preset: 'minimum-required', cores: '1', mem: '1.063 GiB', shm: '0.06 GiB' }) });
items.push({ file: 'session_launch_dialog_tf23', render: (lang) => reviewStep(lang, { image: 'Python Tensorflow 2.3 / x86_64 / Python 3.6 / GPU:CUDA10.1', resourceGroup: 'nvidia-RTX', preset: 'minimum-required', cores: '1', mem: '1.063 GiB', shm: '0.06 GiB' }) });

// various_kernel_images (1246x740) — Environments dropdown OPEN
items.push({
  file: 'various_kernel_images',
  render: (lang) => {
    const labels = {
      en: { searchPlaceholder: 'TensorFlow' },
      ko: { searchPlaceholder: 'TensorFlow' },
      ja: { searchPlaceholder: 'TensorFlow' },
      th: { searchPlaceholder: 'TensorFlow' },
    }[lang];
    const tag = (text, color = '#1890ff') => `<span style="display:inline-block;padding:1px 5px;background:#fff;border:1px solid ${color};color:${color};border-radius:3px;font-size:11px;margin-left:4px;">${text}</span>`;
    return `
      <div style="display:inline-block;padding:24px;background:#fff;width:580px;">
        <div style="border:2px solid ${PRIMARY};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;font-size:14px;color:${TEXT};margin-bottom:8px;box-shadow:0 0 0 2px rgba(255,92,0,0.1);"><span style="color:${TEXT_SECONDARY};">${labels.searchPlaceholder}</span> <span style="margin-left:auto;color:${TEXT_SECONDARY};">▾</span></div>
        <div style="background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08);padding:4px;max-width:540px;">
          ${[
            ['🐛 PyTorch (Fashion-How)', false],
            ['🐛 PyTorch (NGC)', false],
            [`🐛 PyTorch (NGC) ${tag('testing', '#52c41a')}`, false],
            [`🐛 PyTorch (NGC) ${tag('customized', '#1890ff')}`, false],
            [`🦅 Swift For TensorFlow ${tag('testing', '#52c41a')}`, false],
            ['🤖 TensorFlow', true],
            [`🤖 TensorFlow ${tag('testing', '#52c41a')}`, false],
            ['🤖 TensorFlow (Fashion-How)', false],
          ].map(([text, highlighted]) => `
            <div style="padding:8px 12px;font-size:14px;color:${TEXT};border-radius:4px;${highlighted ? `background:${PRIMARY_LIGHT};font-weight:600;` : ''}">${text}</div>
          `).join('')}
        </div>
      </div>
    `;
  },
});

// resource_presets_in_resource_monitor (1392x718)
items.push({
  file: 'resource_presets_in_resource_monitor',
  render: (lang) => {
    const labels = {
      en: { custom: 'Custom allocation', minRequirements: 'Minimum requirements', preset: 'Preset' },
      ko: { custom: '사용자 정의 할당', minRequirements: '최소 요구 사항', preset: '프리셋' },
      ja: { custom: 'カスタム割り当て', minRequirements: '最小要件', preset: 'プリセット' },
      th: { custom: 'การจัดสรรกำหนดเอง', minRequirements: 'ความต้องการขั้นต่ำ', preset: 'พรีเซต' },
    }[lang];
    const presetRow = (name, specs, highlighted = false, dimmed = false) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:4px;${highlighted ? `background:${PRIMARY_LIGHT};` : ''}${dimmed ? 'opacity:0.45;' : ''}">
        <div style="font-size:14px;color:${TEXT};${highlighted ? 'font-weight:600;' : ''}">${name}</div>
        <div style="font-size:13px;color:${TEXT_SECONDARY};">${specs}</div>
      </div>
    `;
    return `
      <div style="display:inline-flex;padding:24px;background:#fff;gap:16px;align-items:flex-start;">
        <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;width:480px;">
          <div style="padding:8px 12px;border-bottom:1px solid ${BORDER};display:flex;align-items:center;gap:8px;">
            <span style="color:${TEXT_SECONDARY};">🔍</span>
            <input value="cpu01-small" style="flex:1;border:none;outline:none;font-size:14px;" />
          </div>
          <div style="padding:4px;">
            <div style="padding:6px 12px;color:${TEXT};font-size:13px;font-weight:500;">${labels.custom}</div>
            <div style="padding:4px 12px;color:${TEXT_SECONDARY};font-size:12px;">${labels.minRequirements}</div>
            <div style="padding:4px 12px;color:${TEXT_SECONDARY};font-size:12px;font-weight:500;">${labels.preset}</div>
            ${presetRow('▤ cpu01-small', '1 Core / 1 GiB', true)}
            ${presetRow('▤ cpu02-medium', '4 Core / 8 GiB', false, true)}
            ${presetRow('▤ cpu03-large', '8 Core / 16 GiB', false, true)}
            ${presetRow('▦ cuda01-small', '1 Core / 4 GiB / 1 GPU')}
            ${presetRow('▦ cuda02-medium', '4 Core / 16 GiB / 2 GPU', false, true)}
          </div>
        </div>
        <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;padding:16px;width:200px;">
          <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">cpu01-small</div>
          <div style="font-size:14px;color:${TEXT};">1 Core / 1 GiB</div>
        </div>
      </div>
    `;
  },
});

export default items;
