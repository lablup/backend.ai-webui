// Misc items: B5 log modal, J1 banner, D1/D2 drawers, full-shell launchers — FR-2743.
import { modal, PRIMARY, PRIMARY_LIGHT, DANGER, BORDER, TEXT, TEXT_SECONDARY } from './_shared.mjs';

const items = [];

// log_modal_per_container (2658x1504) — Container Logs modal with terminal pre
items.push({
  file: 'log_modal_per_container',
  render: (lang) => {
    const labels = {
      en: { title: 'Container Logs', search: 'Search', main: 'main1 (default)', sub1: 'sub1 (CPU0)', sub2: 'sub2 (start)', cancel: 'Close', ok: 'OK' },
      ko: { title: '컨테이너 로그', search: '검색', main: 'main1 (기본)', sub1: 'sub1 (CPU0)', sub2: 'sub2 (시작)', cancel: '닫기', ok: '확인' },
      ja: { title: 'コンテナログ', search: '検索', main: 'main1 (デフォルト)', sub1: 'sub1 (CPU0)', sub2: 'sub2 (start)', cancel: '閉じる', ok: 'OK' },
      th: { title: 'บันทึกคอนเทนเนอร์', search: 'ค้นหา', main: 'main1 (เริ่มต้น)', sub1: 'sub1 (CPU0)', sub2: 'sub2 (เริ่ม)', cancel: 'ปิด', ok: 'ตกลง' },
    }[lang];
    const logLines = `[2026-04-15 09:21:33] INFO  Initializing kernel runtime...
[2026-04-15 09:21:34] INFO  Loaded environment: Python 3.10
[2026-04-15 09:21:34] INFO  Mounting vfolder: /home/work/data
[2026-04-15 09:21:35] INFO  Network interface eth0 ready
[2026-04-15 09:21:35] INFO  Allocated 4.00 GiB memory, 2 CPU cores
[2026-04-15 09:21:36] INFO  Starting Jupyter kernel server on port 2001
[2026-04-15 09:21:37] INFO  Server listening at http://0.0.0.0:2001
[2026-04-15 09:21:38] INFO  Health check passed
[2026-04-15 09:22:12] INFO  Connection from client 10.0.1.42
[2026-04-15 09:22:13] INFO  Authenticated user: admin@lablup.com
[2026-04-15 09:22:14] INFO  Executing cell: import torch
[2026-04-15 09:22:15] INFO  CUDA available: True
[2026-04-15 09:22:15] INFO  Device: NVIDIA GeForce RTX 3090
[2026-04-15 09:23:00] INFO  Cell completed in 0.85s
[2026-04-15 09:23:42] INFO  Heartbeat ok
[2026-04-15 09:24:18] INFO  Memory usage: 1.2 GiB / 4.0 GiB
[2026-04-15 09:25:05] INFO  Idle for 60s
[2026-04-15 09:26:00] INFO  Heartbeat ok
[2026-04-15 09:27:14] INFO  Cell execution: model.fit(X, y)
[2026-04-15 09:27:34] INFO  Epoch 1/10 - loss: 0.5234`;
    return `
      <div style="display:inline-block;padding:20px;">
        <div style="background:#fff;border-radius:8px;width:1280px;box-shadow:0 6px 16px rgba(0,0,0,0.08);">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid ${BORDER};">
            <div style="font-weight:600;font-size:16px;color:${TEXT};">${labels.title} · 8SAhZkScession (e7a05f1c-aef4-4b36-abe5-4113fe7ecfc)</div>
            <span style="cursor:pointer;color:rgba(0,0,0,0.45);font-size:16px;">✕</span>
          </div>
          <div style="display:flex;height:600px;">
            <div style="flex:0 0 200px;border-right:1px solid ${BORDER};padding:16px;background:#fafafa;">
              <div style="padding:8px 12px;background:${PRIMARY_LIGHT};color:${PRIMARY};border-radius:4px;font-size:13px;margin-bottom:4px;font-weight:500;">${labels.main}</div>
              <div style="padding:8px 12px;color:${TEXT};font-size:13px;margin-bottom:4px;">${labels.sub1}</div>
              <div style="padding:8px 12px;color:${TEXT};font-size:13px;">${labels.sub2}</div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;">
              <div style="padding:12px 16px;border-bottom:1px solid ${BORDER};display:flex;justify-content:flex-end;">
                <input placeholder="${labels.search}" style="padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;font-size:13px;width:220px;" />
              </div>
              <pre style="flex:1;margin:0;padding:16px;background:#1e1e1e;color:#d4d4d4;font-family:monospace;font-size:12px;line-height:1.6;overflow:auto;white-space:pre;">${logLines}</pre>
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

// start_announcement_banner (1280x720) — Modern Start page with banner
items.push({
  file: 'start_announcement_banner',
  render: (lang) => {
    const labels = {
      en: { adminSettings: 'Admin Settings', start: 'Start', dashboard: 'Dashboard', data: 'Data', sessions: 'Sessions', myEnv: 'My Environments', chat: 'Chat', service: 'Service', startWelcome: 'Welcome to Backend.AI', maintenance: 'Scheduled Maintenance Notice: This system will undergo scheduled maintenance on **April 20, 2026** from 2:00 AM to 4:00 AM UTC. Please save your work and terminate active sessions before the maintenance window.', createFolder: 'Create New Storage Folder', startInteractive: 'Start Interactive Session', startBatch: 'Start Batch Session', startFromUrl: 'Start From URL', startService: 'Start Model Service' },
      ko: { adminSettings: '관리자 설정', start: '시작', dashboard: '대시보드', data: '데이터', sessions: '세션', myEnv: '내 환경', chat: '채팅', service: '서비스', startWelcome: 'Backend.AI에 오신 것을 환영합니다', maintenance: '예정된 점검 안내: 시스템은 **2026년 4월 20일** UTC 기준 오전 2:00부터 4:00까지 예정된 점검을 진행합니다. 점검 시간 전에 작업을 저장하고 활성 세션을 종료해 주세요.', createFolder: '새 스토리지 폴더 생성', startInteractive: '대화형 세션 시작', startBatch: '배치 세션 시작', startFromUrl: 'URL에서 시작', startService: '모델 서비스 시작' },
      ja: { adminSettings: '管理者設定', start: '開始', dashboard: 'ダッシュボード', data: 'データ', sessions: 'セッション', myEnv: 'マイ環境', chat: 'チャット', service: 'サービス', startWelcome: 'Backend.AIへようこそ', maintenance: '定期メンテナンスのお知らせ: 本システムは**2026年4月20日**UTC午前2:00から4:00まで定期メンテナンスを実施します。メンテナンス時間前に作業を保存し、アクティブなセッションを終了してください。', createFolder: '新規ストレージフォルダ作成', startInteractive: 'インタラクティブセッション開始', startBatch: 'バッチセッション開始', startFromUrl: 'URLから開始', startService: 'モデルサービス開始' },
      th: { adminSettings: 'การตั้งค่าผู้ดูแล', start: 'เริ่ม', dashboard: 'แดชบอร์ด', data: 'ข้อมูล', sessions: 'เซสชัน', myEnv: 'สภาพแวดล้อมของฉัน', chat: 'แชต', service: 'บริการ', startWelcome: 'ยินดีต้อนรับสู่ Backend.AI', maintenance: 'ประกาศการบำรุงรักษาตามกำหนดการ: ระบบนี้จะดำเนินการบำรุงรักษาตามกำหนดการในวันที่ **20 เมษายน 2026** เวลา 2:00 น. ถึง 4:00 น. UTC โปรดบันทึกงานและสิ้นสุดเซสชันที่ใช้งานอยู่ก่อนช่วงเวลาบำรุงรักษา', createFolder: 'สร้างโฟลเดอร์จัดเก็บใหม่', startInteractive: 'เริ่มเซสชันแบบโต้ตอบ', startBatch: 'เริ่มเซสชันแบตช์', startFromUrl: 'เริ่มจาก URL', startService: 'เริ่มบริการโมเดล' },
    }[lang];
    const sidebarItem = (icon, text, active) => `<div style="padding:10px 16px;display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;${active ? `background:${PRIMARY_LIGHT};color:${PRIMARY};border-right:3px solid ${PRIMARY};` : `color:${TEXT};`}"><span style="font-size:14px;width:18px;text-align:center;">${icon}</span><span>${text}</span></div>`;
    const card = (title, icon, primary = false) => `<div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;${primary ? `border-color:${PRIMARY};box-shadow:0 2px 8px rgba(255,92,0,0.1);` : ''}min-height:140px;"><div style="font-size:36px;color:${primary ? PRIMARY : TEXT_SECONDARY};margin-bottom:8px;">${icon}</div><div style="font-size:13px;color:${TEXT};text-align:center;font-weight:500;">${title}</div></div>`;
    return `
      <div style="display:inline-block;padding:0;background:#fafafa;width:1100px;">
        <div style="background:linear-gradient(90deg,${PRIMARY} 0%,#FF8C42 100%);height:48px;display:flex;align-items:center;padding:0 16px;color:#fff;font-weight:600;font-size:14px;">Backend.AI</div>
        <div style="display:flex;">
          <div style="flex:0 0 200px;background:#fff;border-right:1px solid ${BORDER};min-height:520px;">
            ${sidebarItem('⚙', labels.adminSettings, false)}
            ${sidebarItem('▶', labels.start, true)}
            ${sidebarItem('▦', labels.dashboard, false)}
            ${sidebarItem('📁', labels.data, false)}
            ${sidebarItem('▤', labels.sessions, false)}
            ${sidebarItem('🌐', labels.myEnv, false)}
            ${sidebarItem('💬', labels.chat, false)}
            ${sidebarItem('🚀', labels.service, false)}
          </div>
          <div style="flex:1;padding:24px;">
            <div style="font-weight:600;font-size:20px;color:${TEXT};margin-bottom:16px;">${labels.startWelcome}</div>
            <!-- Banner -->
            <div style="background:#e6f7ff;border:1px solid #91d5ff;border-radius:6px;padding:12px 16px;margin-bottom:24px;display:flex;gap:8px;align-items:flex-start;">
              <span style="font-size:18px;">📢</span>
              <div style="font-size:13px;color:${TEXT};line-height:1.5;">${labels.maintenance}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
              ${card(labels.createFolder, '📁', false)}
              ${card(labels.startInteractive, '▶', true)}
              ${card(labels.startBatch, '▤', false)}
              ${card(labels.startFromUrl, '🔗', false)}
              ${card(labels.startService, '🚀', false)}
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

// folder_explorer_edit_button (1104x512) — Drawer crop with file row + Edit File popover
items.push({
  file: 'folder_explorer_edit_button',
  render: (lang) => {
    const labels = {
      en: { fileName: 'Name', size: 'Size', modified: 'Modified', editFile: 'Edit File', vfolderId: 'VFolder ID', status: 'Status', host: 'Host', owner: 'Owner', user: 'User', mount: 'Mount', readWrite: 'Read & Write' },
      ko: { fileName: '이름', size: '크기', modified: '수정일', editFile: '파일 편집', vfolderId: 'VFolder ID', status: '상태', host: '호스트', owner: '소유자', user: '사용자', mount: '마운트', readWrite: '읽기 및 쓰기' },
      ja: { fileName: '名前', size: 'サイズ', modified: '更新日', editFile: 'ファイル編集', vfolderId: 'VFolder ID', status: 'ステータス', host: 'ホスト', owner: '所有者', user: 'ユーザー', mount: 'マウント', readWrite: '読み取り/書き込み' },
      th: { fileName: 'ชื่อ', size: 'ขนาด', modified: 'แก้ไข', editFile: 'แก้ไขไฟล์', vfolderId: 'VFolder ID', status: 'สถานะ', host: 'โฮสต์', owner: 'เจ้าของ', user: 'ผู้ใช้', mount: 'เมาต์', readWrite: 'อ่าน/เขียน' },
    }[lang];
    return `
      <div style="display:inline-flex;padding:20px;background:#fff;gap:0;border:1px solid ${BORDER};border-radius:8px;">
        <div style="flex:1;min-width:380px;border-right:1px solid ${BORDER};padding:16px;">
          <table style="width:100%;border-collapse:separate;border-spacing:0;font-size:13px;">
            <thead><tr style="background:#fafafa;"><th style="padding:8px;text-align:left;color:${TEXT_SECONDARY};font-weight:500;">${labels.fileName}</th><th style="padding:8px;text-align:left;color:${TEXT_SECONDARY};font-weight:500;">${labels.modified}</th><th style="padding:8px;text-align:right;color:${TEXT_SECONDARY};font-weight:500;">${labels.size}</th><th style="padding:8px;width:40px;"></th></tr></thead>
            <tbody>
              <tr style="border-bottom:1px solid #f5f5f5;position:relative;">
                <td style="padding:8px;color:${TEXT};">📄 sample_config.txt</td>
                <td style="padding:8px;color:${TEXT};">Feb 10, 2026 9:52 PM</td>
                <td style="padding:8px;color:${TEXT};text-align:right;">133 B</td>
                <td style="padding:8px;text-align:center;color:${TEXT_SECONDARY};cursor:pointer;position:relative;">
                  ⋯
                  <div style="position:absolute;right:0;top:30px;background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.12);padding:4px;min-width:140px;z-index:10;">
                    <div style="padding:5px 12px;font-size:13px;color:${PRIMARY};background:${PRIMARY_LIGHT};border-radius:4px;">${labels.editFile}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="flex:0 0 320px;padding:16px;font-size:12px;">
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.vfolderId}</div><div style="color:${TEXT};font-family:monospace;filter:blur(5px);">dfa9da544b28ed3c8b1f7</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.status}</div><div style="color:${TEXT};">READY</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.host}</div><div style="color:${TEXT};">local:volume1</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.owner}</div><div style="color:${TEXT};">User</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.user}</div><div style="color:${TEXT};">user@lablup.com</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.mount}</div><div style="color:${TEXT};">${labels.readWrite}</div></div>
        </div>
      </div>
    `;
  },
});

// download_file_from_folder (3472x1262) — Larger drawer with full info pane
items.push({
  file: 'download_file_from_folder',
  render: (lang) => {
    const labels = {
      en: { fileName: 'Name', size: 'Size', modified: 'Modified', vfolderId: 'VFolder ID', path: 'Path', quotaScope: 'Quota Scope', status: 'Status', host: 'Host', owner: 'Owner', user: 'User', mount: 'Mount', readWrite: 'Read & Write', usageMode: 'Usage Mode', cloneable: 'Cloneable', maxSize: 'Max Size', createdAt: 'Created At' },
      ko: { fileName: '이름', size: '크기', modified: '수정일', vfolderId: 'VFolder ID', path: '경로', quotaScope: '쿼터 범위', status: '상태', host: '호스트', owner: '소유자', user: '사용자', mount: '마운트', readWrite: '읽기 및 쓰기', usageMode: '사용 모드', cloneable: '복제 가능', maxSize: '최대 크기', createdAt: '생성일' },
      ja: { fileName: '名前', size: 'サイズ', modified: '更新日', vfolderId: 'VFolder ID', path: 'パス', quotaScope: 'クォータスコープ', status: 'ステータス', host: 'ホスト', owner: '所有者', user: 'ユーザー', mount: 'マウント', readWrite: '読み取り/書き込み', usageMode: '使用モード', cloneable: 'クローン可', maxSize: '最大サイズ', createdAt: '作成日' },
      th: { fileName: 'ชื่อ', size: 'ขนาด', modified: 'แก้ไข', vfolderId: 'VFolder ID', path: 'เส้นทาง', quotaScope: 'ขอบเขตโควต้า', status: 'สถานะ', host: 'โฮสต์', owner: 'เจ้าของ', user: 'ผู้ใช้', mount: 'เมาต์', readWrite: 'อ่าน/เขียน', usageMode: 'โหมดการใช้งาน', cloneable: 'โคลนได้', maxSize: 'ขนาดสูงสุด', createdAt: 'สร้างเมื่อ' },
    }[lang];
    return `
      <div style="display:inline-flex;padding:20px;background:#fff;gap:0;border:1px solid ${BORDER};border-radius:8px;">
        <div style="flex:1;min-width:760px;border-right:1px solid ${BORDER};padding:16px;">
          <div style="font-weight:600;font-size:16px;color:${TEXT};margin-bottom:12px;">user2-vfolder</div>
          <table style="width:100%;border-collapse:separate;border-spacing:0;font-size:13px;">
            <thead><tr style="background:#fafafa;"><th style="padding:8px;text-align:left;color:${TEXT_SECONDARY};font-weight:500;">${labels.fileName}</th><th style="padding:8px;text-align:left;color:${TEXT_SECONDARY};font-weight:500;">${labels.modified}</th><th style="padding:8px;text-align:right;color:${TEXT_SECONDARY};font-weight:500;">${labels.size}</th><th style="padding:8px;width:80px;"></th></tr></thead>
            <tbody>
              <tr style="border-bottom:1px solid #f5f5f5;">
                <td style="padding:8px;color:${TEXT};">📄 test_file.txt</td>
                <td style="padding:8px;color:${TEXT};">Oct 24, 2025 4:42 PM</td>
                <td style="padding:8px;color:${TEXT};text-align:right;">1 B</td>
                <td style="padding:8px;text-align:center;color:${TEXT_SECONDARY};">↓ 🗑</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="flex:0 0 360px;padding:16px;font-size:13px;">
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.path}</div><div style="color:${TEXT};font-family:monospace;filter:blur(5px);">15/89/1543/abc</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.vfolderId}</div><div style="color:${TEXT};font-family:monospace;filter:blur(5px);">f38dea2350fa72ef</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.status}</div><div style="color:${TEXT};">READY</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.host}</div><div style="color:${TEXT};">local:volume1</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.owner}</div><div style="color:${TEXT};">user2@lablup.com</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.mount}</div><div style="color:${TEXT};">${labels.readWrite}</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.usageMode}</div><div style="color:${TEXT};">general</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.cloneable}</div><div style="color:${TEXT};">-</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.maxSize}</div><div style="color:${TEXT};">∞</div></div>
          <div style="margin-bottom:8px;"><div style="color:${TEXT_SECONDARY};">${labels.createdAt}</div><div style="color:${TEXT};">Oct 24, 2025 4:31 PM</div></div>
        </div>
      </div>
    `;
  },
});

// L1 service launcher full-shell (3 items: service_launcher1, 2, _command_mode)
function serviceLauncher(lang, { variant, env, extraSection }) {
  const labels = {
    en: { adminSettings: 'Admin Settings', start: 'Start', dashboard: 'Dashboard', storage: 'Storage', data: 'Data', workload: 'Workload', sessions: 'Sessions', myEnv: 'My Environments', playground: 'Playground', chat: 'Chat', service: 'Service', serving: 'Serving', modelStore: 'Model Store', metrics: 'Metrics', agentSummary: 'Agent Summary', statistics: 'Statistics', breadcrumb: 'Serving / Start New Service', heading: 'Model & Serving Configuration', serviceName: 'Service Name', openToPublic: 'Open To Public', modelStorage: 'Model Storage to mount', runtimeVariant: 'Inference Runtime Variant', environments: 'Environments', version: 'Version', noData: 'No data', runtimeParams: 'Runtime Parameters', sampling: 'Sampling', context: 'Context Engine', other: 'Other', temperature: 'Temperature' },
    ko: { adminSettings: '관리자 설정', start: '시작', dashboard: '대시보드', storage: '스토리지', data: '데이터', workload: '워크로드', sessions: '세션', myEnv: '내 환경', playground: '플레이그라운드', chat: '채팅', service: '서비스', serving: '서빙', modelStore: '모델 스토어', metrics: '메트릭', agentSummary: '에이전트 요약', statistics: '통계', breadcrumb: '서빙 / 새 서비스 시작', heading: '모델 및 서빙 구성', serviceName: '서비스 이름', openToPublic: '공개', modelStorage: '마운트할 모델 스토리지', runtimeVariant: '추론 런타임 변형', environments: '환경', version: '버전', noData: '데이터 없음', runtimeParams: '런타임 파라미터', sampling: '샘플링', context: '컨텍스트 엔진', other: '기타', temperature: '온도' },
    ja: { adminSettings: '管理者設定', start: '開始', dashboard: 'ダッシュボード', storage: 'ストレージ', data: 'データ', workload: 'ワークロード', sessions: 'セッション', myEnv: 'マイ環境', playground: 'プレイグラウンド', chat: 'チャット', service: 'サービス', serving: 'サービング', modelStore: 'モデルストア', metrics: 'メトリック', agentSummary: 'エージェントサマリー', statistics: '統計', breadcrumb: 'サービング / 新規サービス開始', heading: 'モデルとサービング設定', serviceName: 'サービス名', openToPublic: '公開', modelStorage: 'マウントするモデルストレージ', runtimeVariant: '推論ランタイム', environments: '環境', version: 'バージョン', noData: 'データなし', runtimeParams: 'ランタイムパラメータ', sampling: 'サンプリング', context: 'コンテキストエンジン', other: 'その他', temperature: '温度' },
    th: { adminSettings: 'การตั้งค่าผู้ดูแล', start: 'เริ่ม', dashboard: 'แดชบอร์ด', storage: 'ที่เก็บข้อมูล', data: 'ข้อมูล', workload: 'ปริมาณงาน', sessions: 'เซสชัน', myEnv: 'สภาพแวดล้อมของฉัน', playground: 'เพลย์กราวด์', chat: 'แชต', service: 'บริการ', serving: 'การให้บริการ', modelStore: 'ที่เก็บโมเดล', metrics: 'เมตริก', agentSummary: 'สรุปเอเจนต์', statistics: 'สถิติ', breadcrumb: 'การให้บริการ / เริ่มบริการใหม่', heading: 'การกำหนดค่าโมเดลและการให้บริการ', serviceName: 'ชื่อบริการ', openToPublic: 'เปิดสู่สาธารณะ', modelStorage: 'ที่เก็บโมเดลเพื่อเมาต์', runtimeVariant: 'รันไทม์การอนุมาน', environments: 'สภาพแวดล้อม', version: 'เวอร์ชัน', noData: 'ไม่มีข้อมูล', runtimeParams: 'พารามิเตอร์รันไทม์', sampling: 'การสุ่ม', context: 'Context Engine', other: 'อื่นๆ', temperature: 'อุณหภูมิ' },
  }[lang];
  const sidebarItem = (label, active) => `<div style="padding:8px 16px;font-size:13px;color:${active ? PRIMARY : TEXT};${active ? `background:${PRIMARY_LIGHT};border-right:3px solid ${PRIMARY};font-weight:500;` : ''}">${label}</div>`;
  const fieldRow = (label, value, isSelect = false) => `<div style="margin-bottom:14px;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${label}</div><div style="border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;font-size:13px;color:${TEXT};${value ? '' : `color:${TEXT_SECONDARY};`}">${value || ''}${isSelect ? `<span style="margin-left:auto;color:${TEXT_SECONDARY};">▾</span>` : ''}</div></div>`;
  return `
    <div style="display:inline-block;background:#fafafa;width:1500px;">
      <div style="background:linear-gradient(90deg,${PRIMARY} 0%,#FF8C42 100%);height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;color:#fff;">
        <div style="font-weight:600;font-size:14px;">Backend.AI</div>
        <div style="font-size:13px;">default | Admin Lablup</div>
      </div>
      <div style="display:flex;">
        <div style="flex:0 0 200px;background:#fff;border-right:1px solid ${BORDER};min-height:900px;">
          ${sidebarItem(labels.adminSettings, false)}
          ${sidebarItem(labels.start, false)}
          ${sidebarItem(labels.dashboard, false)}
          ${sidebarItem(`${labels.storage} → ${labels.data}`, false)}
          ${sidebarItem(`${labels.workload} → ${labels.sessions}`, false)}
          ${sidebarItem(labels.myEnv, false)}
          ${sidebarItem(`${labels.playground} → ${labels.chat}`, false)}
          ${sidebarItem(`${labels.service} → ${labels.serving}`, true)}
          ${sidebarItem(labels.modelStore, false)}
          ${sidebarItem(`${labels.metrics} → ${labels.agentSummary}`, false)}
          ${sidebarItem(labels.statistics, false)}
        </div>
        <div style="flex:1;padding:24px;">
          <div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:8px;">${labels.breadcrumb} /</div>
          <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;padding:24px;">
            <div style="font-weight:600;font-size:18px;color:${TEXT};margin-bottom:20px;">${labels.heading}</div>
            ${fieldRow(labels.serviceName, '')}
            <div style="margin-bottom:14px;display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:16px;height:16px;border:1px solid ${BORDER};background:#fafafa;border-radius:2px;"></span><span style="font-size:13px;color:${TEXT};">${labels.openToPublic}</span></div>
            ${fieldRow(labels.modelStorage, 'model-folder', true)}
            ${fieldRow(labels.runtimeVariant, variant, true)}
            <div style="display:flex;gap:12px;margin-bottom:14px;">
              <div style="flex:1;">${fieldRow(labels.environments, env, true)}</div>
              <div style="flex:1;">${fieldRow(labels.version, env === 'vllm' ? 'vllm' : '', true)}</div>
            </div>
            ${env === 'vllm' ? `<div style="background:#fafafa;border:1px solid ${BORDER};border-radius:6px;padding:24px;text-align:center;color:${TEXT_SECONDARY};font-size:13px;margin-bottom:14px;">📦 ${labels.noData}</div>` : ''}
            ${extraSection || ''}
            <div style="font-weight:500;font-size:14px;color:${TEXT};margin:16px 0 8px;">${labels.runtimeParams}</div>
            <div style="display:flex;gap:16px;border-bottom:1px solid ${BORDER};margin-bottom:12px;">
              <div style="padding:6px 0;border-bottom:2px solid ${PRIMARY};color:${PRIMARY};font-weight:500;font-size:13px;">${labels.sampling}</div>
              <div style="padding:6px 0;color:${TEXT_SECONDARY};font-size:13px;">${labels.context}</div>
              <div style="padding:6px 0;color:${TEXT_SECONDARY};font-size:13px;">${labels.other}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;"><div style="font-size:13px;color:${TEXT};">${labels.temperature}</div><div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:13px;">0.80</span><span style="display:inline-block;width:36px;height:20px;background:${PRIMARY};border-radius:10px;position:relative;"><span style="position:absolute;top:2px;right:2px;width:16px;height:16px;background:#fff;border-radius:50%;"></span></span></div></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

items.push({ file: 'service_launcher1', render: (lang) => serviceLauncher(lang, { variant: 'vLLM', env: 'vllm' }) });

items.push({
  file: 'service_launcher2',
  render: (lang) => {
    const labels = {
      en: { modelDef: 'Model Definition', enterCommand: 'Enter Command', useConfig: 'Use Config File', mountDest: 'Mount Destination For Model Folder', filePath: 'Model Definition File Path' },
      ko: { modelDef: '모델 정의', enterCommand: '명령 입력', useConfig: '구성 파일 사용', mountDest: '모델 폴더의 마운트 대상', filePath: '모델 정의 파일 경로' },
      ja: { modelDef: 'モデル定義', enterCommand: 'コマンド入力', useConfig: '構成ファイル使用', mountDest: 'モデルフォルダのマウント先', filePath: 'モデル定義ファイルパス' },
      th: { modelDef: 'นิยามโมเดล', enterCommand: 'ป้อนคำสั่ง', useConfig: 'ใช้ไฟล์การกำหนดค่า', mountDest: 'ปลายทางการเมาต์สำหรับโฟลเดอร์โมเดล', filePath: 'เส้นทางไฟล์นิยามโมเดล' },
    }[lang];
    return serviceLauncher(lang, {
      variant: 'Custom (Default)', env: 'Python 3.9 x86_64 Ubuntu 20.04',
      extraSection: `
        <div style="font-weight:500;font-size:14px;color:${TEXT};margin:16px 0 8px;">${labels.modelDef}</div>
        <div style="display:flex;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;margin-bottom:12px;">
          <div style="flex:1;padding:6px 12px;background:#fff;color:${TEXT};font-size:13px;text-align:center;">${labels.enterCommand}</div>
          <div style="flex:1;padding:6px 12px;background:${PRIMARY};color:#fff;font-size:13px;text-align:center;">${labels.useConfig}</div>
        </div>
        <div style="margin-bottom:14px;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.mountDest}</div><input value="/models" style="width:100%;padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;height:32px;font-size:13px;" /></div>
        <div style="margin-bottom:14px;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.filePath}</div><input placeholder="model-definition.yaml" style="width:100%;padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;height:32px;font-size:13px;color:${TEXT_SECONDARY};" /></div>
      `,
    });
  },
});

items.push({
  file: 'service_launcher_command_mode',
  render: (lang) => {
    const labels = {
      en: { modelDef: 'Model Definition', enterCommand: 'Enter Command', useConfig: 'Use Config File', startCommand: 'Start Command', modelMount: 'Model Mount', optional: 'optional' },
      ko: { modelDef: '모델 정의', enterCommand: '명령 입력', useConfig: '구성 파일 사용', startCommand: '시작 명령', modelMount: '모델 마운트', optional: '선택' },
      ja: { modelDef: 'モデル定義', enterCommand: 'コマンド入力', useConfig: '構成ファイル使用', startCommand: '開始コマンド', modelMount: 'モデルマウント', optional: '任意' },
      th: { modelDef: 'นิยามโมเดล', enterCommand: 'ป้อนคำสั่ง', useConfig: 'ใช้ไฟล์การกำหนดค่า', startCommand: 'คำสั่งเริ่มต้น', modelMount: 'การเมาต์โมเดล', optional: 'ไม่บังคับ' },
    }[lang];
    return serviceLauncher(lang, {
      variant: 'Custom (Default)', env: 'Python 3.9 x86_64 Ubuntu 20.04',
      extraSection: `
        <div style="font-weight:500;font-size:14px;color:${TEXT};margin:16px 0 8px;">${labels.modelDef}</div>
        <div style="display:flex;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;margin-bottom:12px;">
          <div style="flex:1;padding:6px 12px;background:${PRIMARY};color:#fff;font-size:13px;text-align:center;">${labels.enterCommand}</div>
          <div style="flex:1;padding:6px 12px;background:#fff;color:${TEXT};font-size:13px;text-align:center;">${labels.useConfig}</div>
        </div>
        <div style="margin-bottom:14px;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.startCommand}</div><input placeholder="e.g. vllm serve /models/my-model --tp 2" style="width:100%;padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;height:32px;font-size:13px;color:${TEXT_SECONDARY};font-family:monospace;" /></div>
        <div style="margin-bottom:14px;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.modelMount} <span style="font-size:11px;">(${labels.optional})</span></div><input value="/models" style="width:100%;padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;height:32px;font-size:13px;" /></div>
      `,
    });
  },
});

export default items;
