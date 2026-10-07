const enc = new TextEncoder();
const dec = new TextDecoder('utf-8', { fatal: true });

function bytesToB64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function b64ToBytes(b64: string): Uint8Array {
  // Accepts standard and URL-safe alphabets, with or without padding.
  const s = b64.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

const toUrl = (b64: string) => b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const b64Encode = (text: string, url = false) => {
  const b64 = bytesToB64(enc.encode(text));
  return url ? toUrl(b64) : b64;
};
export const b64Decode = (b64: string) => dec.decode(b64ToBytes(b64));

async function hs256(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toUrl(bytesToB64(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)))));
}

export async function jwtEncode(payloadJson: string, secret: string): Promise<string> {
  const payload = JSON.parse(payloadJson); // throws on invalid JSON
  const data = b64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }), true) + '.' + b64Encode(JSON.stringify(payload), true);
  return data + '.' + (await hs256(data, secret));
}

export async function jwtDecode(token: string, secret = '') {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Un JWT deve avere 3 parti separate da "."');
  const header = JSON.parse(b64Decode(parts[0]));
  const payload = JSON.parse(b64Decode(parts[1]));
  let valid: boolean | null = null;
  if (secret) {
    if (header.alg !== 'HS256') throw new Error(`Verifica supportata solo per HS256 (alg: ${header.alg})`);
    valid = (await hs256(parts[0] + '.' + parts[1], secret)) === parts[2];
  }
  return { header, payload, valid };
}
