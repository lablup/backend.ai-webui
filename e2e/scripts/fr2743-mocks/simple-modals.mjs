// Simple modals / popconfirms / dropdowns for FR-2743.
import { t, modal, popconfirm, selectDropdown, blackTooltip, wrap, PRIMARY, PRIMARY_LIGHT, DANGER, BORDER, TEXT, TEXT_SECONDARY } from './_shared.mjs';

const items = [];

// 1. user_deactivate_confirmation (486x224) — Popconfirm + trigger button
items.push({
  file: 'user_deactivate_confirmation',
  render: (lang) => {
    const labels = {
      en: { title: 'Deactivate user', cancel: 'Cancel', ok: 'Deactivate' },
      ko: { title: '사용자 비활성화', cancel: '취소', ok: '비활성화' },
      ja: { title: 'ユーザーの無効化', cancel: 'キャンセル', ok: '無効化' },
      th: { title: 'ปิดใช้งานผู้ใช้', cancel: 'ยกเลิก', ok: 'ปิดใช้งาน' },
    }[lang];
    return popconfirm({
      title: labels.title,
      body: 'test-user@test.com',
      cancelText: labels.cancel,
      okText: labels.ok,
      okType: 'danger',
      triggerIcon: '⊘',
    });
  },
});

// 2. user_inactivate_confirmation (500x226) — Activate popconfirm
items.push({
  file: 'user_inactivate_confirmation',
  render: (lang) => {
    const labels = {
      en: { title: 'Activate user', cancel: 'Cancel', ok: 'Activate' },
      ko: { title: '사용자 활성화', cancel: '취소', ok: '활성화' },
      ja: { title: 'ユーザーの有効化', cancel: 'キャンセル', ok: '有効化' },
      th: { title: 'เปิดใช้งานผู้ใช้', cancel: 'ยกเลิก', ok: 'เปิดใช้งาน' },
    }[lang];
    return popconfirm({
      title: labels.title,
      body: 'test-user@lablup.com',
      cancelText: labels.cancel,
      okText: labels.ok,
      okType: 'primary',
      triggerIcon: '↶',
    });
  },
});

// 3. confirmation_dialog_for_manage_app_change_in_image (848x506)
items.push({
  file: 'confirmation_dialog_for_manage_app_change_in_image',
  render: (lang) => {
    const labels = {
      en: {
        title: 'Image reinstallation required',
        body: 'Changes to the app configuration require reinstallation of the image. The image will be downloaded again on the next session start.',
        cancel: 'Cancel', ok: 'OK',
      },
      ko: {
        title: '이미지 재설치 필요',
        body: '앱 구성 변경에는 이미지 재설치가 필요합니다. 다음 세션 시작 시 이미지가 다시 다운로드됩니다.',
        cancel: '취소', ok: '확인',
      },
      ja: {
        title: 'イメージの再インストールが必要',
        body: 'アプリ構成の変更にはイメージの再インストールが必要です。次回のセッション開始時にイメージが再ダウンロードされます。',
        cancel: 'キャンセル', ok: 'OK',
      },
      th: {
        title: 'ต้องติดตั้งอิมเมจใหม่',
        body: 'การเปลี่ยนแปลงการกำหนดค่าแอปต้องติดตั้งอิมเมจใหม่ อิมเมจจะถูกดาวน์โหลดอีกครั้งในการเริ่มเซสชันครั้งถัดไป',
        cancel: 'ยกเลิก', ok: 'ตกลง',
      },
    }[lang];
    return modal({
      title: labels.title,
      width: 416,
      body: `<div style="font-size:14px;line-height:1.6;color:${TEXT};">${labels.body}</div>`,
      cancelText: labels.cancel,
      okText: labels.ok,
    });
  },
});

// 4. keypair_delete_confirmation (854x428)
items.push({
  file: 'keypair_delete_confirmation',
  render: (lang) => {
    const labels = {
      en: {
        title: 'Delete credential',
        body: "You are about to delete this user's credential:",
        warning: 'WARNING: this cannot be undone!',
        cancel: 'Cancel', ok: 'Delete',
      },
      ko: {
        title: '자격 증명 삭제',
        body: '다음 사용자의 자격 증명을 삭제하려고 합니다:',
        warning: '경고: 이 작업은 취소할 수 없습니다!',
        cancel: '취소', ok: '삭제',
      },
      ja: {
        title: '認証情報を削除',
        body: 'このユーザーの認証情報を削除しようとしています:',
        warning: '警告: この操作は取り消せません！',
        cancel: 'キャンセル', ok: '削除',
      },
      th: {
        title: 'ลบข้อมูลรับรอง',
        body: 'คุณกำลังจะลบข้อมูลรับรองของผู้ใช้นี้:',
        warning: 'คำเตือน: ไม่สามารถยกเลิกการดำเนินการนี้ได้!',
        cancel: 'ยกเลิก', ok: 'ลบ',
      },
    }[lang];
    return modal({
      title: labels.title,
      width: 420,
      body: `
        <div style="font-size:14px;color:${TEXT};margin-bottom:8px;">${labels.body}</div>
        <div style="font-weight:600;font-size:14px;color:${TEXT};margin-bottom:16px;">domain-admin@lablup.com</div>
        <div style="color:${DANGER};font-size:14px;font-weight:500;">⚠ ${labels.warning}</div>
      `,
      cancelText: labels.cancel,
      okText: labels.ok,
      okType: 'danger',
    });
  },
});

// 5. export_session_dialog (798x498)
items.push({
  file: 'export_session_dialog',
  render: (lang) => {
    const labels = {
      en: { title: 'Export Session list to CSV File', fileName: 'File name', export: 'EXPORT CSV FILE', cancel: 'Cancel' },
      ko: { title: '세션 목록을 CSV 파일로 내보내기', fileName: '파일 이름', export: 'CSV 파일 내보내기', cancel: '취소' },
      ja: { title: 'セッション一覧をCSVファイルにエクスポート', fileName: 'ファイル名', export: 'CSVファイルをエクスポート', cancel: 'キャンセル' },
      th: { title: 'ส่งออกรายการเซสชันเป็นไฟล์ CSV', fileName: 'ชื่อไฟล์', export: 'ส่งออกไฟล์ CSV', cancel: 'ยกเลิก' },
    }[lang];
    return modal({
      title: labels.title,
      width: 400,
      body: `
        <div style="margin-bottom:8px;font-size:14px;color:${TEXT};">${labels.fileName} <span style="color:${DANGER};">*</span></div>
        <div style="border-bottom:2px solid ${PRIMARY};padding:4px 0;font-size:14px;color:${TEXT};">session_2025-04-10_14-13-56</div>
      `,
      cancelText: labels.cancel,
      okText: `↓ ${labels.export}`,
    });
  },
});

// 6. overlay_network_setting_dialog (626x522)
items.push({
  file: 'overlay_network_setting_dialog',
  render: (lang) => {
    const labels = {
      en: { title: 'Overlay Network settings', mtu: 'MTU', unset: 'Unset', save: 'Save', cancel: 'Cancel' },
      ko: { title: '오버레이 네트워크 설정', mtu: 'MTU', unset: '해제', save: '저장', cancel: '취소' },
      ja: { title: 'オーバーレイネットワーク設定', mtu: 'MTU', unset: '解除', save: '保存', cancel: 'キャンセル' },
      th: { title: 'การตั้งค่าเครือข่ายโอเวอร์เลย์', mtu: 'MTU', unset: 'ยกเลิก', save: 'บันทึก', cancel: 'ยกเลิก' },
    }[lang];
    return modal({
      title: `${labels.title} <span style="color:rgba(0,0,0,0.45);font-size:14px;font-weight:400;">ⓘ</span>`,
      width: 520,
      body: `
        <div style="margin-bottom:6px;font-size:14px;color:${TEXT};">${labels.mtu} <span style="color:rgba(0,0,0,0.45);">ⓘ</span></div>
        <input disabled style="width:100%;padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;background:rgba(0,0,0,0.04);color:rgba(0,0,0,0.25);height:32px;font-size:14px;" />
        <div style="margin-top:12px;display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:16px;height:16px;border:1px solid ${PRIMARY};background:${PRIMARY};border-radius:2px;color:#fff;text-align:center;line-height:16px;font-size:12px;">✓</span>
          <span style="font-size:14px;color:${TEXT};">${labels.unset}</span>
        </div>
      `,
      cancelText: labels.cancel,
      okText: labels.save,
    });
  },
});

// 7. update_image_resource_setting (1068x736)
items.push({
  file: 'update_image_resource_setting',
  render: (lang) => {
    const labels = {
      en: {
        title: 'Modify Minimum Image Resource Limit',
        memory: 'Memory', gpuFrac: 'CUDA-capable GPU (fractional)', gpu: 'CUDA-capable GPU', cpu: 'CPU',
        cancel: 'Cancel', ok: 'OK',
      },
      ko: {
        title: '최소 이미지 자원 제한 수정',
        memory: '메모리', gpuFrac: 'CUDA 지원 GPU (분할)', gpu: 'CUDA 지원 GPU', cpu: 'CPU',
        cancel: '취소', ok: '확인',
      },
      ja: {
        title: '最小イメージリソース制限の変更',
        memory: 'メモリ', gpuFrac: 'CUDA対応GPU（分割）', gpu: 'CUDA対応GPU', cpu: 'CPU',
        cancel: 'キャンセル', ok: 'OK',
      },
      th: {
        title: 'แก้ไขขีดจำกัดทรัพยากรอิมเมจขั้นต่ำ',
        memory: 'หน่วยความจำ', gpuFrac: 'GPU ที่รองรับ CUDA (แบบเศษส่วน)', gpu: 'GPU ที่รองรับ CUDA', cpu: 'CPU',
        cancel: 'ยกเลิก', ok: 'ตกลง',
      },
    }[lang];
    const fieldRow = (label, value, suffix) => `
      <div style="margin-bottom:14px;">
        <div style="font-size:14px;color:${TEXT};margin-bottom:6px;">${label}</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="flex:1;display:flex;align-items:center;border:1px solid ${BORDER};border-radius:6px;height:32px;">
            <input value="${value}" style="flex:1;padding:0 11px;border:none;outline:none;font-size:14px;color:${TEXT};" />
            <span style="padding:0 11px;color:rgba(0,0,0,0.45);font-size:14px;border-left:1px solid ${BORDER};">${suffix}</span>
          </div>
        </div>
      </div>
    `;
    return modal({
      title: labels.title,
      width: 520,
      body: `
        ${fieldRow(labels.memory, '1', 'GiB')}
        ${fieldRow(labels.gpuFrac, '0.0', 'fGPU')}
        ${fieldRow(labels.gpu, '1', 'GPU')}
        ${fieldRow(labels.cpu, '1', 'Core')}
      `,
      cancelText: labels.cancel,
      okText: labels.ok,
    });
  },
});

// 8. system_setting_dialog_scheduler_settings (584x790)
items.push({
  file: 'system_setting_dialog_scheduler_settings',
  render: (lang) => {
    const labels = {
      en: {
        title: 'Scheduler settings',
        scheduler: 'Scheduler',
        helper: 'Select the scheduler to change the options.',
        options: 'Scheduler Options',
        retries: 'Session creation retries',
        unset: 'Unset', save: 'Save', cancel: 'Cancel',
      },
      ko: {
        title: '스케줄러 설정', scheduler: '스케줄러',
        helper: '옵션을 변경할 스케줄러를 선택하세요.',
        options: '스케줄러 옵션', retries: '세션 생성 재시도',
        unset: '해제', save: '저장', cancel: '취소',
      },
      ja: {
        title: 'スケジューラ設定', scheduler: 'スケジューラ',
        helper: 'オプションを変更するスケジューラを選択してください。',
        options: 'スケジューラオプション', retries: 'セッション作成リトライ',
        unset: '解除', save: '保存', cancel: 'キャンセル',
      },
      th: {
        title: 'การตั้งค่าตัวจัดตาราง', scheduler: 'ตัวจัดตาราง',
        helper: 'เลือกตัวจัดตารางเพื่อเปลี่ยนตัวเลือก',
        options: 'ตัวเลือกตัวจัดตาราง', retries: 'จำนวนครั้งที่สร้างเซสชันใหม่',
        unset: 'ยกเลิก', save: 'บันทึก', cancel: 'ยกเลิก',
      },
    }[lang];
    return modal({
      title: labels.title,
      width: 460,
      body: `
        <div style="margin-bottom:12px;">
          <div style="font-size:14px;color:${TEXT};margin-bottom:6px;">${labels.scheduler}</div>
          <div style="border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;color:rgba(0,0,0,0.25);justify-content:space-between;font-size:14px;">
            <span></span>
            <span>▾</span>
          </div>
          <div style="font-size:12px;color:${TEXT_SECONDARY};margin-top:6px;">${labels.helper}</div>
        </div>
        <div style="font-weight:600;font-size:14px;color:${TEXT};margin:24px 0 12px;">${labels.options}</div>
        <div>
          <div style="font-size:14px;color:${TEXT};margin-bottom:6px;">${labels.retries}</div>
          <input disabled style="width:100%;padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;background:rgba(0,0,0,0.04);height:32px;font-size:14px;" />
          <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:16px;height:16px;border:1px solid ${BORDER};background:#fafafa;border-radius:2px;"></span>
            <span style="font-size:14px;color:rgba(0,0,0,0.45);">${labels.unset}</span>
          </div>
        </div>
      `,
      cancelText: labels.cancel,
      okText: labels.save,
    });
  },
});

// 9. quota_settings_panel (1028x520)
items.push({
  file: 'quota_settings_panel',
  render: (lang) => {
    const labels = {
      en: { title: 'Quota Settings', hardLimit: 'Hard Limit', cancel: 'Cancel', ok: 'OK' },
      ko: { title: '쿼터 설정', hardLimit: '최대 한도', cancel: '취소', ok: '확인' },
      ja: { title: 'クォータ設定', hardLimit: 'ハードリミット', cancel: 'キャンセル', ok: 'OK' },
      th: { title: 'การตั้งค่าโควต้า', hardLimit: 'ขีดจำกัดสูงสุด', cancel: 'ยกเลิก', ok: 'ตกลง' },
    }[lang];
    return modal({
      title: labels.title,
      width: 416,
      body: `
        <div style="margin-bottom:6px;font-size:14px;color:${TEXT};">${labels.hardLimit}</div>
        <div style="display:flex;align-items:center;border:1px solid ${BORDER};border-radius:6px;height:32px;">
          <input value="2" style="flex:1;padding:0 11px;border:none;outline:none;font-size:14px;color:${TEXT};" />
          <span style="padding:0 11px;color:rgba(0,0,0,0.45);font-size:14px;border-left:1px solid ${BORDER};">GB</span>
        </div>
      `,
      cancelText: labels.cancel,
      okText: labels.ok,
    });
  },
});

// 10. unset_quota (702x240) — popconfirm + Edit/Unset action buttons
items.push({
  file: 'unset_quota',
  render: (lang) => {
    const labels = {
      en: { title: 'Unset custom settings', body: 'Are you sure you want to unset? If you unset, the quota of this user or project will use default value.', cancel: 'Cancel', ok: 'OK', control: 'Control' },
      ko: { title: '사용자 정의 설정 해제', body: '해제하시겠습니까? 해제하면 이 사용자 또는 프로젝트의 쿼터는 기본값을 사용합니다.', cancel: '취소', ok: '확인', control: '제어' },
      ja: { title: 'カスタム設定を解除', body: '解除してもよろしいですか？解除すると、このユーザーまたはプロジェクトのクォータはデフォルト値を使用します。', cancel: 'キャンセル', ok: 'OK', control: '制御' },
      th: { title: 'ยกเลิกการตั้งค่ากำหนดเอง', body: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิก? หากยกเลิก โควต้าของผู้ใช้หรือโปรเจกต์นี้จะใช้ค่าเริ่มต้น', cancel: 'ยกเลิก', ok: 'ตกลง', control: 'ควบคุม' },
    }[lang];
    return `
      <div style="display:inline-flex;flex-direction:column;align-items:flex-start;padding:24px;">
        <div style="font-size:14px;color:${TEXT_SECONDARY};margin-bottom:8px;font-weight:500;">${labels.control}</div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;">
          <button style="width:32px;height:32px;border:1px solid ${BORDER};background:#fff;border-radius:6px;cursor:pointer;color:${TEXT_SECONDARY};">✎</button>
          <button style="width:32px;height:32px;border:1px solid ${DANGER};background:#fff;border-radius:6px;cursor:pointer;color:${DANGER};">✕</button>
        </div>
        <div style="background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:12px 16px;max-width:340px;">
          <div style="display:flex;gap:8px;align-items:flex-start;">
            <span style="color:#faad14;font-size:14px;flex-shrink:0;margin-top:2px;">⚠</span>
            <div style="flex:1;">
              <div style="font-weight:500;font-size:14px;color:${TEXT};margin-bottom:4px;">${labels.title}</div>
              <div style="font-size:14px;color:${TEXT_SECONDARY};margin-bottom:12px;line-height:1.5;">${labels.body}</div>
              <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button style="padding:0 7px;height:24px;border:1px solid ${BORDER};background:#fff;border-radius:4px;cursor:pointer;font-size:12px;">${labels.cancel}</button>
                <button style="padding:0 7px;height:24px;border:1px solid ${PRIMARY};background:${PRIMARY};color:#fff;border-radius:4px;cursor:pointer;font-size:12px;">${labels.ok}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

// 11. select_project_to_model_store (312x286) — small open dropdown crop
items.push({
  file: 'select_project_to_model_store',
  render: (lang) => {
    const labels = {
      en: { project: 'Project', generalGroup: 'General', modelStoreGroup: 'Model Store', summary: 'Summary' },
      ko: { project: '프로젝트', generalGroup: '일반', modelStoreGroup: '모델 스토어', summary: '요약' },
      ja: { project: 'プロジェクト', generalGroup: '一般', modelStoreGroup: 'モデルストア', summary: 'サマリー' },
      th: { project: 'โปรเจกต์', generalGroup: 'ทั่วไป', modelStoreGroup: 'ที่เก็บโมเดล', summary: 'สรุป' },
    }[lang];
    return `
      <div style="background:linear-gradient(90deg,${PRIMARY} 0%, #FF8C42 100%);padding:12px 20px;width:240px;">
        <div style="color:#fff;font-size:12px;font-weight:500;margin-bottom:6px;opacity:0.9;">${labels.summary} /</div>
        <div style="color:#fff;font-size:14px;margin-bottom:8px;">${labels.project}</div>
        <div style="background:#fff;border:2px solid ${PRIMARY};border-radius:6px;padding:4px 11px;height:30px;display:flex;align-items:center;font-size:14px;color:${TEXT};">default</div>
      </div>
      <div style="margin:6px 0 0 20px;width:200px;">
        ${selectDropdown({
          options: [
            `<div style="font-size:12px;color:${TEXT_SECONDARY};padding:0 4px;">${labels.generalGroup}</div>`,
            'default',
            `<div style="font-size:12px;color:${TEXT_SECONDARY};padding:0 4px;margin-top:4px;">${labels.modelStoreGroup}</div>`,
            'model-store',
          ],
          selectedIndex: 1,
          width: 200,
        })}
      </div>
    `;
  },
});

// 12. export_csv_menu (382x264)
items.push({
  file: 'export_csv_menu',
  render: (lang) => {
    const labels = {
      en: { finished: 'FINISHED', exportCsv: 'export CSV' },
      ko: { finished: '완료됨', exportCsv: 'CSV 내보내기' },
      ja: { finished: '完了', exportCsv: 'CSVエクスポート' },
      th: { finished: 'เสร็จสิ้น', exportCsv: 'ส่งออก CSV' },
    }[lang];
    return `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:20px;width:340px;">
        <div style="font-size:14px;color:${TEXT};font-weight:500;letter-spacing:0.5px;">${labels.finished}</div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;">
          <button style="width:32px;height:32px;border:1px solid ${BORDER};background:#fff;border-radius:50%;cursor:pointer;color:${TEXT_SECONDARY};font-size:18px;line-height:1;">⋯</button>
          <div style="margin-top:8px;background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:4px;min-width:140px;">
            <div style="padding:5px 12px;font-size:14px;color:${TEXT};cursor:pointer;border-radius:4px;">↓ ${labels.exportCsv}</div>
          </div>
        </div>
      </div>
    `;
  },
});

// 13. active_user_selection (458x290)
items.push({
  file: 'active_user_selection',
  render: (lang) => {
    const labels = {
      en: { active: 'Active', inactive: 'Inactive', beforeVerification: 'Before Verification', deleted: 'Deleted' },
      ko: { active: '활성', inactive: '비활성', beforeVerification: '인증 대기', deleted: '삭제됨' },
      ja: { active: 'アクティブ', inactive: '非アクティブ', beforeVerification: '認証前', deleted: '削除済み' },
      th: { active: 'ใช้งานอยู่', inactive: 'ไม่ใช้งาน', beforeVerification: 'ก่อนยืนยัน', deleted: 'ลบแล้ว' },
    }[lang];
    return `
      <div style="padding:20px;display:inline-flex;flex-direction:column;align-items:flex-start;">
        <div style="border:2px solid ${PRIMARY};border-radius:6px;padding:4px 11px;background:#fff;width:160px;display:flex;justify-content:space-between;align-items:center;font-size:14px;color:${TEXT};box-shadow:0 0 0 2px rgba(255,92,0,0.1);">
          <span>${labels.active}</span>
          <span style="color:rgba(0,0,0,0.45);">▾</span>
        </div>
        <div style="margin-top:4px;">
          ${selectDropdown({
            options: [labels.active, labels.inactive, labels.beforeVerification, labels.deleted],
            selectedIndex: 0,
            width: 200,
          })}
        </div>
      </div>
    `;
  },
});

// 14. keypair_resource_policy_update_check (582x246) — tiny table cell
items.push({
  file: 'keypair_resource_policy_update_check',
  render: (lang) => {
    const labels = {
      en: { name: 'Name', resourcePolicy: 'Resource Policy' },
      ko: { name: '이름', resourcePolicy: '자원 정책' },
      ja: { name: '名前', resourcePolicy: 'リソースポリシー' },
      th: { name: 'ชื่อ', resourcePolicy: 'นโยบายทรัพยากร' },
    }[lang];
    return `
      <div style="padding:20px;display:inline-block;">
        <table style="border-collapse:separate;border-spacing:0;background:#fff;border:1px solid ${BORDER};border-radius:6px;overflow:hidden;">
          <thead>
            <tr style="background:#fafafa;">
              <th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};">${labels.name} ↕</th>
              <th style="padding:12px 16px;text-align:left;font-size:14px;font-weight:500;color:${TEXT};border-bottom:1px solid ${BORDER};">${labels.resourcePolicy}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:12px 16px;font-size:14px;color:${TEXT};">default</td>
              <td style="padding:12px 16px;font-size:14px;color:${TEXT};">
                <span style="display:inline-flex;align-items:center;gap:6px;">
                  <span style="display:inline-flex;align-items:center;gap:3px;"><span style="color:${PRIMARY};">▤</span> 2 Core</span>
                  <span style="display:inline-flex;align-items:center;gap:3px;"><span style="color:${PRIMARY};">▥</span> 4 GiB</span>
                  <span style="display:inline-flex;align-items:center;gap:3px;"><span style="color:${PRIMARY};">▦</span> 1 GPU</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },
});

// 15. LLM_chat_test (1108x262) — Service Endpoint row + tooltip on chat icon
items.push({
  file: 'LLM_chat_test',
  render: (lang) => {
    const labels = {
      en: { serviceEndpoint: 'Service Endpoint', tooltip: 'LLM Chat Test' },
      ko: { serviceEndpoint: '서비스 엔드포인트', tooltip: 'LLM 채팅 테스트' },
      ja: { serviceEndpoint: 'サービスエンドポイント', tooltip: 'LLMチャットテスト' },
      th: { serviceEndpoint: 'จุดเชื่อมต่อบริการ', tooltip: 'ทดสอบแชต LLM' },
    }[lang];
    return `
      <div style="padding:24px;background:#fff;display:inline-block;min-width:520px;">
        <div style="display:flex;align-items:center;border-bottom:1px solid #f0f0f0;padding:12px 0;">
          <div style="width:160px;font-size:14px;font-weight:500;color:${TEXT};">${labels.serviceEndpoint}</div>
          <div style="flex:1;display:flex;align-items:center;gap:8px;">
            <span style="filter:blur(6px);background:#f5f5f5;border-radius:4px;padding:4px 12px;font-size:13px;font-family:monospace;">https://endpoint.app.backend.ai/v1</span>
            <button style="border:1px solid ${BORDER};background:#fff;width:28px;height:28px;border-radius:4px;cursor:pointer;color:${TEXT_SECONDARY};">⎘</button>
            <div style="position:relative;">
              <button style="border:1px solid ${BORDER};background:#fff;width:28px;height:28px;border-radius:4px;cursor:pointer;color:${TEXT_SECONDARY};">💬</button>
              <div style="position:absolute;left:50%;bottom:36px;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;border-radius:6px;padding:6px 8px;font-size:12px;line-height:1.5;white-space:nowrap;">
                ${labels.tooltip}
                <div style="position:absolute;left:50%;bottom:-4px;transform:translateX(-50%) rotate(45deg);width:8px;height:8px;background:rgba(0,0,0,0.85);"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

export default items;
