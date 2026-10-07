// Run: npm run check
import { b64Decode, b64Encode, jwtDecode, jwtEncode } from './codec';

const eq = (a: unknown, b: unknown) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };

(async () => {
  eq(b64Encode('hello'), 'aGVsbG8=');
  eq(b64Encode('àè€😀'), 'w6DDqOKCrPCfmIA=');
  eq(b64Decode('w6DDqOKCrPCfmIA'), 'àè€😀'); // no padding
  eq(b64Decode(b64Encode('??>>', true)), '??>>'); // url-safe
  // Reference token from jwt.io (secret: "your-256-bit-secret")
  const ref = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  eq(await jwtEncode('{"sub":"1234567890","name":"John Doe","iat":1516239022}', 'your-256-bit-secret'), ref);
  eq((await jwtDecode(ref, 'your-256-bit-secret')).valid, true);
  eq((await jwtDecode(ref, 'wrong')).valid, false);
  eq((await jwtDecode(ref)).payload.name, 'John Doe');
  console.log('OK');
})().catch((e) => { console.error(e); process.exit(1); });
