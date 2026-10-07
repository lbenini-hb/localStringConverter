import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { b64Decode, b64Encode, jwtDecode, jwtEncode } from './codec';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  template: `
    <header>
      <h1>Local String Converter</h1>
    </header>

    <div class="grid">
      <section>
        <h2>Base64</h2>
        <label>Base64<textarea rows="4" [(ngModel)]="b64"></textarea></label>
        <div class="row">
          <button (click)="decodeB64()">Decode ↓</button>
          <button (click)="encodeB64()">Encode ↑</button>
          <label class="inline"><input type="checkbox" [(ngModel)]="urlSafe" /> URL-safe</label>
        </div>
        <label>Testo<textarea rows="4" [(ngModel)]="plain"></textarea></label>
        @if (b64Error) { <p class="error">{{ b64Error }}</p> }
      </section>

      <section>
        <h2>JWT (HS256)</h2>
        <label>Secret<input type="text" [(ngModel)]="secret" placeholder="usato per firmare e verificare" /></label>
        <label>Token<textarea rows="4" [(ngModel)]="token"></textarea></label>
        <div class="row">
          <button (click)="decodeJwt()">Decode ↓</button>
          <button (click)="encodeJwt()">Encode ↑</button>
        </div>
        @if (valid !== null) {
          <p [class]="valid ? 'ok' : 'error'">{{ valid ? '✔ Firma valida' : '✘ Firma NON valida' }}</p>
        }
        @if (jwtError) { <p class="error">{{ jwtError }}</p> }
        @if (header) { <label>Header<textarea rows="3" readonly [value]="header"></textarea></label> }
        <label>Payload (JSON)<textarea rows="6" [(ngModel)]="payload"></textarea></label>
      </section>
    </div>
  `,
  styles: `
    :host { display: block; max-width: 1200px; margin: 0 auto; padding: 48px 16px 64px; }
    header { margin-bottom: 32px; }
    h1 { margin: 0; font-size: clamp(1.8rem, 5vw, 2.6rem); font-weight: 700; letter-spacing: -0.03em;
      background: linear-gradient(90deg, var(--text), var(--accent)); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .hint { color: var(--muted); margin: 8px 0 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr)); gap: 24px; align-items: start; }
    section { background: color-mix(in srgb, var(--surface) 85%, transparent); border: 1px solid var(--border); border-radius: 16px;
      padding: 20px 24px; backdrop-filter: blur(8px); box-shadow: 0 10px 30px #0006; }
    h2 { margin: 0 0 12px; font-size: 1.05rem; font-weight: 600; display: flex; align-items: center; gap: 10px; }
    h2::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--accent); }
    label { display: block; margin: 14px 0; font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
    label.inline { display: inline-flex; align-items: center; gap: 6px; margin: 0 0 0 auto; text-transform: none; letter-spacing: 0; font-size: .9rem; cursor: pointer; }
    input[type=checkbox] { accent-color: var(--accent); width: 16px; height: 16px; }
    textarea, input[type=text] { display: block; width: 100%; margin-top: 6px; padding: 10px 12px; resize: vertical;
      font: 14px/1.5 'JetBrains Mono', ui-monospace, monospace; color: var(--text); background: #0a0d0d;
      border: 1px solid var(--border); border-radius: 10px; outline: none; transition: border-color .15s, box-shadow .15s; }
    textarea:focus, input[type=text]:focus { border-color: var(--accent); box-shadow: 0 0 0 3px #2dd4bf33; }
    textarea[readonly] { color: var(--muted); }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    button { padding: 9px 18px; font: 600 .9rem Inter, system-ui, sans-serif; color: #04201c; cursor: pointer;
      background: linear-gradient(135deg, var(--accent), var(--accent-strong)); border: 0; border-radius: 10px;
      transition: transform .1s, box-shadow .15s, filter .15s; }
    button:hover { box-shadow: 0 6px 20px #2dd4bf40; filter: brightness(1.08); }
    button:active { transform: translateY(1px); }
    button:focus-visible { outline: 2px solid var(--text); outline-offset: 2px; }
    button + button { background: transparent; color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
    button + button:hover { background: #2dd4bf14; }
    .error, .ok { margin: 8px 0 0; padding: 8px 12px; border-radius: 8px; font-size: .9rem; }
    .error { color: var(--error); background: #f871711a; }
    .ok { color: var(--accent); background: #2dd4bf1a; }
  `,
})
export class AppComponent {
  plain = '';
  b64 = '';
  urlSafe = false;
  b64Error = '';

  secret = '';
  payload = '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}';
  token = '';
  header = '';
  valid: boolean | null = null;
  jwtError = '';

  encodeB64() {
    this.b64Error = '';
    this.b64 = b64Encode(this.plain, this.urlSafe);
  }

  decodeB64() {
    this.b64Error = '';
    try {
      this.plain = b64Decode(this.b64);
    } catch {
      this.b64Error = 'Input Base64 non valido (o non è testo UTF-8).';
    }
  }

  async encodeJwt() {
    this.reset();
    try {
      this.token = await jwtEncode(this.payload, this.secret);
    } catch (e) {
      this.jwtError = (e as Error).message;
    }
  }

  async decodeJwt() {
    this.reset();
    try {
      const r = await jwtDecode(this.token, this.secret);
      this.header = JSON.stringify(r.header, null, 2);
      this.payload = JSON.stringify(r.payload, null, 2);
      this.valid = r.valid;
    } catch (e) {
      this.jwtError = (e as Error).message;
    }
  }

  private reset() {
    this.jwtError = '';
    this.header = '';
    this.valid = null;
  }
}
