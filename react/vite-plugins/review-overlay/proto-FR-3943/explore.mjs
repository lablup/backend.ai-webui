import { chromium } from '/home/ubuntu/backend.ai-webui/node_modules/@playwright/test/index.mjs';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('/home/ubuntu/backend.ai-webui/e2e/envs/.env.playwright','utf8').split('\n').filter(l=>/^[A-Z0-9_]+=/.test(l)).map(l=>{const i=l.indexOf('=');return [l.slice(0,i), l.slice(i+1).replace(/^"|"$/g,'')]}));
const BASE = 'https://fr-3930-pr9658-edit-pin-s.localhost:1336';
const browser = await chromium.launch(); const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1400, height: 900 } }); const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Email or Username').fill(env.E2E_ADMIN_EMAIL); await page.getByLabel('Password').fill(env.E2E_ADMIN_PASSWORD);
const ep = page.getByRole('textbox', { name: 'Endpoint', exact: true }); if (!(await ep.isVisible({timeout:500}).catch(()=>false))) await page.getByText('Advanced').click(); await ep.fill('http://10.82.0.130:8090');
await page.getByRole('button', { name: 'Login', exact: true }).click();
await page.waitForSelector('[data-testid="user-dropdown-button"]', { timeout: 60000 });
console.log('logged in at', page.url());
const dump = async (label) => { const r = await page.evaluate(() => ({ tids: [...document.querySelectorAll('[data-testid]')].filter(e=>e.getBoundingClientRect().width>0).map(e=>e.getAttribute('data-testid')).slice(0,60), btns: [...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width>0).map(e=>e.innerText.trim()).filter(Boolean).slice(0,40), tabs: [...document.querySelectorAll('[role=tab]')].map(e=>e.innerText.trim()), dialogs: [...document.querySelectorAll('[role=dialog]')].length })); console.log('---', label, page.url()); console.log(JSON.stringify(r)); };
await page.goto(BASE + '/data', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(6000); await dump('data');
const create = page.getByRole('button', { name: /create folder|폴더 생성|new folder/i }).first();
if (await create.isVisible().catch(()=>false)) { await create.click(); await page.waitForTimeout(2500); await dump('create-folder modal'); await page.keyboard.press('Escape'); }
await page.goto(BASE + '/session/start', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(6000); await dump('session start');
await browser.close();
