// Chat panels for B3 (LLM endpoint) and B4 (chat session) — FR-2743.
import { PRIMARY, PRIMARY_LIGHT, DANGER, BORDER, TEXT, TEXT_SECONDARY } from './_shared.mjs';

const items = [];

// Common chat card mock
function chatCard({ width = 800, height = 480, modelName, modelLabel, body, headerExtra = '' }) {
  return `
    <div style="display:inline-block;padding:24px;background:#fafafa;">
      <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;width:${width}px;height:${height}px;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #f0f0f0;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;padding:4px 10px;border:1px solid ${BORDER};border-radius:6px;font-size:13px;color:${TEXT};">${modelLabel}<span style="color:${PRIMARY};margin-left:4px;">ⓘ</span></span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;color:${TEXT_SECONDARY};">${headerExtra}</div>
        </div>
        <div style="flex:1;overflow:auto;padding:16px;">${body}</div>
        <div style="padding:8px 16px;border-top:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:${TEXT_SECONDARY};">
          <div></div>
          <div>0.0 TPS / 0 tokens</div>
        </div>
      </div>
    </div>
  `;
}

// LLM_chat (1676x960) — single chat with hello/world Q&A
items.push({
  file: 'LLM_chat',
  render: (lang) => {
    const labels = {
      en: { hi: 'hello', reply: "Hello! It's nice to meet you. Is there something I can help you with, or would you like to chat?" },
      ko: { hi: '안녕하세요', reply: '안녕하세요! 만나서 반갑습니다. 도와드릴 일이 있나요, 아니면 대화를 나누고 싶으신가요?' },
      ja: { hi: 'こんにちは', reply: 'こんにちは！お会いできて嬉しいです。お手伝いできることはありますか？それとも、おしゃべりしたいですか？' },
      th: { hi: 'สวัสดี', reply: 'สวัสดีครับ! ยินดีที่ได้พบคุณ มีอะไรให้ช่วยไหม หรืออยากคุยเล่น?' },
    }[lang];
    return chatCard({
      width: 800, height: 460,
      modelName: 'llama',
      modelLabel: 'llama / llama-3B',
      body: `
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px;"><div style="background:${PRIMARY_LIGHT};color:${TEXT};border-radius:12px;padding:8px 14px;max-width:60%;font-size:14px;">${labels.hi}</div></div>
        <div style="display:flex;margin-bottom:16px;"><div style="background:#f5f5f5;color:${TEXT};border-radius:12px;padding:8px 14px;max-width:80%;font-size:14px;line-height:1.6;">${labels.reply}</div></div>
      `,
      headerExtra: '+',
    });
  },
});

// LLM_chat_custom_model (1670x960) — custom model with yellow alert
function customModelBody(labels, basePath) {
  return `
    <div style="background:#fffbe6;border:1px solid #ffe58f;border-radius:6px;padding:12px;display:flex;gap:8px;align-items:flex-start;margin-bottom:16px;">
      <span style="color:#faad14;font-size:16px;">⚠</span>
      <div style="font-size:13px;color:${TEXT};line-height:1.5;">${labels.alert}</div>
    </div>
    <div style="margin-bottom:12px;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.basePath}</div><div style="display:flex;gap:8px;"><input value="${basePath}" style="flex:1;padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;height:32px;font-size:13px;" /><div style="padding:4px 11px;border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;font-size:13px;background:#fafafa;">v1</div></div></div>
    <div style="margin-bottom:12px;"><div style="font-size:13px;color:${TEXT_SECONDARY};margin-bottom:4px;">${labels.token}</div><div style="border:1px solid ${BORDER};border-radius:6px;height:32px;display:flex;align-items:center;padding:0 11px;color:${TEXT_SECONDARY};font-size:13px;justify-content:space-between;"><span></span><span>▾</span></div></div>
    <button style="padding:4px 15px;border:1px solid ${PRIMARY};background:${PRIMARY};color:#fff;border-radius:6px;cursor:pointer;font-size:14px;">↻ ${labels.refresh}</button>
  `;
}

items.push({
  file: 'LLM_chat_custom_model',
  render: (lang) => {
    const labels = {
      en: { alert: "LLM models not found. Verify the base path and token compatibility with OpenAI, then press 'Refresh Model Information'", basePath: 'Base Path', token: 'Token', refresh: 'Refresh Model Information' },
      ko: { alert: 'LLM 모델을 찾을 수 없습니다. 기본 경로와 토큰의 OpenAI 호환성을 확인한 후 "모델 정보 새로 고침"을 누르세요.', basePath: '기본 경로', token: '토큰', refresh: '모델 정보 새로 고침' },
      ja: { alert: 'LLMモデルが見つかりません。ベースパスとトークンのOpenAI互換性を確認し、「モデル情報の更新」を押してください。', basePath: 'ベースパス', token: 'トークン', refresh: 'モデル情報の更新' },
      th: { alert: 'ไม่พบโมเดล LLM ตรวจสอบความเข้ากันได้ของ Base Path และ Token กับ OpenAI จากนั้นกด "รีเฟรชข้อมูลโมเดล"', basePath: 'Base Path', token: 'โทเคน', refresh: 'รีเฟรชข้อมูลโมเดล' },
    }[lang];
    return chatCard({ width: 800, height: 460, modelName: 'testChat', modelLabel: 'testChat', body: customModelBody(labels, 'https://testChat.test.app.backend.ai/'), headerExtra: '+' });
  },
});

// custom_model (1546x958) — chatTest custom model
items.push({
  file: 'custom_model',
  render: (lang) => {
    const labels = {
      en: { alert: "LLM models not found. Verify the base path and token compatibility with OpenAI, then press 'Refresh Model Information'", basePath: 'Base Path', token: 'Token', refresh: 'Refresh Model Information' },
      ko: { alert: 'LLM 모델을 찾을 수 없습니다. 기본 경로와 토큰의 OpenAI 호환성을 확인한 후 "모델 정보 새로 고침"을 누르세요.', basePath: '기본 경로', token: '토큰', refresh: '모델 정보 새로 고침' },
      ja: { alert: 'LLMモデルが見つかりません。ベースパスとトークンのOpenAI互換性を確認し、「モデル情報の更新」を押してください。', basePath: 'ベースパス', token: 'トークン', refresh: 'モデル情報の更新' },
      th: { alert: 'ไม่พบโมเดล LLM ตรวจสอบความเข้ากันได้ของ Base Path และ Token กับ OpenAI จากนั้นกด "รีเฟรชข้อมูลโมเดล"', basePath: 'Base Path', token: 'โทเคน', refresh: 'รีเฟรชข้อมูลโมเดล' },
    }[lang];
    return chatCard({ width: 740, height: 460, modelName: 'chatTest', modelLabel: 'chatTest', body: customModelBody(labels, 'https://chattest.test.backend.ai/'), headerExtra: '+' });
  },
});

// new_chat (1548x960) — empty card with red highlight on + icon
items.push({
  file: 'new_chat',
  render: (lang) => {
    return chatCard({
      width: 740, height: 460,
      modelLabel: 'llama-3-Kor-Bllossom-8B / llama-3-Korean-Bllossom-8B',
      body: '',
      headerExtra: `<span style="position:relative;display:inline-block;padding:4px;border:2px solid ${DANGER};border-radius:4px;">+</span> 🕐 ⋯`,
    });
  },
});

// history_button (1548x960) — same with red box on clock icon
items.push({
  file: 'history_button',
  render: (lang) => {
    return chatCard({
      width: 740, height: 460,
      modelLabel: 'llama-3-Kor-Bllossom-8B / llama-3-Korean-Bllossom-8B',
      body: '',
      headerExtra: `+ <span style="position:relative;display:inline-block;padding:4px;border:2px solid ${DANGER};border-radius:4px;">🕐</span> ⋯`,
    });
  },
});

// delete_chatting_session (326x166) — small popover with Clear/Delete menu
items.push({
  file: 'delete_chatting_session',
  render: (lang) => {
    const labels = {
      en: { clear: 'Clear Chat', del: 'Delete Chat' },
      ko: { clear: '대화 초기화', del: '채팅 삭제' },
      ja: { clear: 'チャットをクリア', del: 'チャットを削除' },
      th: { clear: 'ล้างแชต', del: 'ลบแชต' },
    }[lang];
    return `
      <div style="display:inline-block;padding:20px;">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <span style="display:inline-block;padding:4px 10px;border:1px solid ${BORDER};border-radius:6px;font-size:13px;color:${TEXT};">llama</span>
          <div style="position:relative;">
            <button style="padding:4px;border:2px solid ${DANGER};background:#fff;border-radius:4px;cursor:pointer;color:${TEXT_SECONDARY};">⋯</button>
            <div style="position:absolute;top:30px;right:0;background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08);padding:4px;min-width:140px;z-index:10;">
              <div style="padding:5px 12px;font-size:14px;color:${TEXT};">${labels.clear}</div>
              <div style="padding:5px 12px;font-size:14px;color:${DANGER};">${labels.del}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

// chat_history (1548x960) — card with side history drawer
items.push({
  file: 'chat_history',
  render: (lang) => {
    const labels = {
      en: { history: 'History' },
      ko: { history: '기록' },
      ja: { history: '履歴' },
      th: { history: 'ประวัติ' },
    }[lang];
    return `
      <div style="display:inline-flex;padding:20px;background:#fafafa;gap:0;">
        <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;width:540px;height:460px;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #f0f0f0;">
            <span style="display:inline-block;padding:4px 10px;border:1px solid ${BORDER};border-radius:6px;font-size:13px;color:${TEXT};">llama-3-Kor-Bllossom-8B / llama-3-Korean-Bllossom-8B<span style="color:${PRIMARY};margin-left:4px;">ⓘ</span></span>
            <div style="color:${TEXT_SECONDARY};">+ 🕐 ⋯</div>
          </div>
        </div>
        <div style="background:#fff;border:1px solid ${BORDER};border-left:none;border-radius:0 8px 8px 0;width:240px;height:460px;padding:16px;">
          <div style="font-weight:500;font-size:14px;color:${TEXT};margin-bottom:12px;">${labels.history}</div>
          <div style="padding:8px;border-radius:6px;background:#fafafa;margin-bottom:8px;display:flex;align-items:center;gap:8px;font-size:13px;color:${TEXT};">
            <span style="width:8px;height:8px;background:${DANGER};border-radius:50%;"></span>
            <span style="flex:1;">Chat 2025-10-23 16:00:38</span>
            <span style="color:${TEXT_SECONDARY};cursor:pointer;">🗑</span>
          </div>
          <div style="padding:8px;border-radius:6px;display:flex;align-items:center;gap:8px;font-size:13px;color:${TEXT_SECONDARY};">
            <span style="flex:1;">Chat 2025-10-23 15:57:18</span>
            <span style="cursor:pointer;">🗑</span>
          </div>
        </div>
      </div>
    `;
  },
});

// parameter_settings (444x538) — popover with sliders
items.push({
  file: 'parameter_settings',
  render: (lang) => {
    const labels = {
      en: { paramSettings: 'Parameters', optional: 'optional' },
      ko: { paramSettings: '파라미터', optional: '선택' },
      ja: { paramSettings: 'パラメータ', optional: '任意' },
      th: { paramSettings: 'พารามิเตอร์', optional: 'ไม่บังคับ' },
    }[lang];
    const param = (label, value) => `
      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <div style="font-size:13px;color:${TEXT};">${label} <span style="color:${TEXT_SECONDARY};font-size:11px;">(${labels.optional})</span></div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-family:monospace;font-size:13px;color:${TEXT};">${value}</span>
            <span style="display:inline-block;width:28px;height:14px;background:${BORDER};border-radius:7px;position:relative;"><span style="position:absolute;left:2px;top:2px;width:10px;height:10px;background:#fff;border-radius:50%;"></span></span>
          </div>
        </div>
      </div>
    `;
    return `
      <div style="display:inline-flex;align-items:flex-start;padding:20px;gap:16px;">
        <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08);width:300px;padding:16px;">
          <div style="font-weight:500;font-size:14px;color:${TEXT};margin-bottom:12px;border-bottom:1px solid ${BORDER};padding-bottom:8px;">${labels.paramSettings}</div>
          ${param('Max Tokens', '4096')}
          ${param('Temperature', '0.70')}
          ${param('Top P', '1.00')}
          ${param('Top K', '1')}
          ${param('Frequency Penalty', '1.00')}
          ${param('Presence Penalty', '1.00')}
        </div>
        <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;width:60px;height:200px;padding:8px;">
          <span style="font-size:11px;color:${TEXT_SECONDARY};">llama / 70b</span>
        </div>
      </div>
    `;
  },
});

// add_cards (1548x962) — two cards with comparison icon highlighted
items.push({
  file: 'add_cards',
  render: (lang) => {
    const labels = {
      en: { alert: "LLM models not found. Verify the base path and token compatibility with OpenAI, then press 'Refresh Model Information'", basePath: 'Base Path', token: 'Token', refresh: 'Refresh Model Information' },
      ko: { alert: 'LLM 모델을 찾을 수 없습니다. 기본 경로와 토큰의 OpenAI 호환성을 확인한 후 "모델 정보 새로 고침"을 누르세요.', basePath: '기본 경로', token: '토큰', refresh: '모델 정보 새로 고침' },
      ja: { alert: 'LLMモデルが見つかりません。ベースパスとトークンのOpenAI互換性を確認し、「モデル情報の更新」を押してください。', basePath: 'ベースパス', token: 'トークン', refresh: 'モデル情報の更新' },
      th: { alert: 'ไม่พบโมเดล LLM ตรวจสอบความเข้ากันได้ของ Base Path และ Token กับ OpenAI จากนั้นกด "รีเฟรชข้อมูลโมเดล"', basePath: 'Base Path', token: 'โทเคน', refresh: 'รีเฟรชข้อมูลโมเดล' },
    }[lang];
    return `
      <div style="display:inline-block;padding:24px;background:#fafafa;position:relative;">
        <div style="position:absolute;top:8px;right:24px;padding:4px;border:2px solid ${DANGER};border-radius:4px;font-size:14px;color:${TEXT_SECONDARY};">⊞</div>
        <div style="display:flex;gap:16px;">
          <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;width:380px;height:400px;display:flex;flex-direction:column;">
            <div style="padding:12px 16px;border-bottom:1px solid #f0f0f0;"><span style="display:inline-block;padding:4px 10px;border:1px solid ${BORDER};border-radius:6px;font-size:13px;color:${TEXT};">llama / llama-8B<span style="color:${PRIMARY};margin-left:4px;">ⓘ</span></span></div>
            <div style="flex:1;padding:16px;"></div>
          </div>
          <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;width:380px;height:400px;display:flex;flex-direction:column;">
            <div style="padding:12px 16px;border-bottom:1px solid #f0f0f0;"><span style="display:inline-block;padding:4px 10px;border:1px solid ${BORDER};border-radius:6px;font-size:13px;color:${TEXT};">chatTest<span style="color:${PRIMARY};margin-left:4px;">ⓘ</span></span></div>
            <div style="flex:1;padding:16px;overflow:auto;">
              <div style="background:#fffbe6;border:1px solid #ffe58f;border-radius:6px;padding:8px;font-size:11px;color:${TEXT};margin-bottom:8px;">⚠ ${labels.alert}</div>
              <div style="margin-bottom:8px;"><div style="font-size:11px;color:${TEXT_SECONDARY};">${labels.basePath}</div><input value="https://chattest.backend.ai/" style="width:100%;padding:4px;border:1px solid ${BORDER};border-radius:6px;font-size:11px;" /></div>
              <button style="padding:4px 10px;border:1px solid ${PRIMARY};background:${PRIMARY};color:#fff;border-radius:6px;font-size:11px;">↻ ${labels.refresh}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

// synchronized_input (1550x958) — two panes with bubble sort code/markdown
items.push({
  file: 'synchronized_input',
  render: (lang) => {
    const labels = {
      en: {
        question: 'Explain bubble sort algorithm',
        codeAnswer: '<b>Bubble Sort</b><br>1. Compare adjacent elements<br>2. Swap if in wrong order<br>3. Repeat until sorted',
        mdHeading: 'Overview',
        mdBody: 'Bubble sort repeatedly steps through the list, comparing adjacent elements and swapping them if they are in the wrong order.',
        howItWorks: 'How It Works',
        steps: '<ol><li>Start at the beginning</li><li>Compare adjacent</li><li>Swap if needed</li><li>Repeat for each pass</li></ol>',
        example: 'Example',
      },
      ko: {
        question: '버블 정렬 알고리즘 설명',
        codeAnswer: '<b>버블 정렬</b><br>1. 인접한 요소 비교<br>2. 순서가 틀리면 교환<br>3. 정렬될 때까지 반복',
        mdHeading: '개요',
        mdBody: '버블 정렬은 목록을 반복적으로 순회하며, 인접한 요소를 비교하고 순서가 잘못된 경우 교환합니다.',
        howItWorks: '작동 방식',
        steps: '<ol><li>처음부터 시작</li><li>인접 요소 비교</li><li>필요하면 교환</li><li>각 패스마다 반복</li></ol>',
        example: '예시',
      },
      ja: {
        question: 'バブルソートアルゴリズムを説明',
        codeAnswer: '<b>バブルソート</b><br>1. 隣接する要素を比較<br>2. 順序が間違っていれば交換<br>3. ソートされるまで繰り返す',
        mdHeading: '概要',
        mdBody: 'バブルソートはリストを繰り返し走査し、隣接する要素を比較して順序が間違っていれば交換します。',
        howItWorks: '動作の仕組み',
        steps: '<ol><li>先頭から開始</li><li>隣接要素を比較</li><li>必要なら交換</li><li>各パスで繰り返し</li></ol>',
        example: '例',
      },
      th: {
        question: 'อธิบายอัลกอริทึมการเรียงแบบฟอง',
        codeAnswer: '<b>การเรียงแบบฟอง</b><br>1. เปรียบเทียบองค์ประกอบที่อยู่ติดกัน<br>2. สลับหากลำดับไม่ถูกต้อง<br>3. ทำซ้ำจนกว่าจะเรียงเสร็จ',
        mdHeading: 'ภาพรวม',
        mdBody: 'การเรียงแบบฟองจะวนซ้ำในรายการ เปรียบเทียบองค์ประกอบที่อยู่ติดกัน และสลับหากลำดับไม่ถูกต้อง',
        howItWorks: 'วิธีการทำงาน',
        steps: '<ol><li>เริ่มจากต้นรายการ</li><li>เปรียบเทียบองค์ประกอบที่อยู่ติดกัน</li><li>สลับหากจำเป็น</li><li>ทำซ้ำในแต่ละรอบ</li></ol>',
        example: 'ตัวอย่าง',
      },
    }[lang];
    return `
      <div style="display:inline-flex;padding:24px;background:#fafafa;gap:16px;">
        <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;width:380px;height:420px;display:flex;flex-direction:column;">
          <div style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:11px;"><span style="padding:2px 6px;border:1px solid ${BORDER};border-radius:4px;">llama / llama-7B<span style="color:${PRIMARY};">ⓘ</span></span></div>
          <div style="flex:1;padding:12px;overflow:auto;">
            <div style="display:flex;justify-content:flex-end;margin-bottom:12px;"><div style="background:${PRIMARY_LIGHT};border-radius:12px;padding:6px 10px;font-size:12px;">${labels.question}</div></div>
            <div style="display:flex;margin-bottom:8px;"><div style="background:#f5f5f5;border-radius:12px;padding:8px 12px;font-size:12px;line-height:1.5;font-family:monospace;">${labels.codeAnswer}</div></div>
          </div>
        </div>
        <div style="background:#fff;border:1px solid ${BORDER};border-radius:8px;width:380px;height:420px;display:flex;flex-direction:column;">
          <div style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:11px;"><span style="padding:2px 6px;border:1px solid ${BORDER};border-radius:4px;">llama / llama-70b<span style="color:${PRIMARY};">ⓘ</span></span></div>
          <div style="flex:1;padding:12px;overflow:auto;">
            <div style="display:flex;justify-content:flex-end;margin-bottom:12px;"><div style="background:${PRIMARY_LIGHT};border-radius:12px;padding:6px 10px;font-size:12px;">${labels.question}</div></div>
            <div style="display:flex;margin-bottom:8px;"><div style="background:#f5f5f5;border-radius:12px;padding:10px 14px;font-size:12px;line-height:1.5;">
              <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${labels.mdHeading}</div>
              <div style="margin-bottom:8px;">${labels.mdBody}</div>
              <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${labels.howItWorks}</div>
              ${labels.steps}
              <div style="font-weight:600;font-size:13px;margin:8px 0 4px;">${labels.example}</div>
              <div style="font-family:monospace;font-size:11px;background:#fafafa;padding:6px;border-radius:4px;">[3, 1, 4, 1, 5] → [1, 1, 3, 4, 5]</div>
            </div></div>
          </div>
        </div>
      </div>
    `;
  },
});

export default items;
