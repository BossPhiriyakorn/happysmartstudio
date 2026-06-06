import fs from 'fs';

const i18nPath = new URL('../lib/i18n.ts', import.meta.url);
const source = fs.readFileSync(i18nPath, 'utf8');
const objectSource = source
  .replace(/^export function[\s\S]*$/m, '')
  .replace(/^export const messages = /m, 'const messages = ')
  .replace(/\} as const;/, '};');
const fn = new Function(`${objectSource}\nreturn messages;`);
const messages = fn();

function pick(keys) {
  const out = {};
  for (const key of keys) {
    out[key] = messages[key];
  }
  return out;
}

const editUiBody = `/** ข้อความ UI หน้าแก้ไข (/edit) — ไม่เก็บใน DB */
export const editUi = ${JSON.stringify(pick(['common', 'edit']), null, 2)} as const;

export function editUiLabel(key: string): string {
  const parts = key.split('.');
  let value: unknown = editUi;
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }
  return typeof value === 'string' ? value : key;
}
`;

const publicUiBody = `/** ข้อความ UI สาธารณะคงที่ — เนื้อหาหลักอยู่ใน branding / DB */
export const publicUi = ${JSON.stringify(pick(['header', 'footer', 'home', 'modal', 'stylePage']), null, 2)} as const;

export function publicUiLabel(key: string): string {
  const parts = key.split('.');
  let value: unknown = publicUi;
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }
  return typeof value === 'string' ? value : key;
}
`;

fs.writeFileSync(new URL('../lib/editUi.ts', import.meta.url), editUiBody, 'utf8');
fs.writeFileSync(new URL('../lib/publicUi.ts', import.meta.url), publicUiBody, 'utf8');
console.log('OK', fs.readFileSync(new URL('../lib/editUi.ts', import.meta.url), 'utf8').includes('ศูนย์ควบคุม'));
