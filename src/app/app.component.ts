import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { b64Decode, b64Encode, jwtDecode, jwtEncode } from './codec';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  template: `
    <h1>Local String Converter</h1>
    <p class="hint">Tutto avviene nel browser: nessun dato lascia la pagina.</p>

    <section>
      <h2>Base64</h2>
      <label>Testo<textarea rows="4" [(ngModel)]="plain"></textarea></label>
      <div class="row">
        <button (click)="encodeB64()">Encode ↓</button>
        <button (click)="decodeB64()">Decode ↑</button>
        <label class="inline"><input type="checkbox" [(ngModel)]="urlSafe" /> URL-safe</label>
      </div>
      <label>Base64<textarea rows="4" [(ngModel)]="b64"></textarea></label>
      @if (b64Error) { <p class="error">{{ b64Error }}</p> }
    </section>

    <section>
      <h2>JWT (HS256)</h2>
      <label>Secret<input type="text" [(ngModel)]="secret" placeholder="usato per firmare e verificare" /></label>
      <label>Payload (JSON)<textarea rows="6" [(ngModel)]="payload"></textarea></label>
      <div class="row">
        <button (click)="encodeJwt()">Encode ↓</button>
        <button (click)="decodeJwt()">Decode ↑</button>
      </div>
      <label>Token<textarea rows="4" [(ngModel)]="token"></textarea></label>
      @if (header) { <label>Header<textarea rows="3" readonly [value]="header"></textarea></label> }
      @if (valid !== null) {
        <p [class]="valid ? 'ok' : 'error'">{{ valid ? '✔ Firma valida' : '✘ Firma NON valida' }}</p>
      }
      @if (jwtError) { <p class="error">{{ jwtError }}</p> }
    </section>
  `,
  styles: `
    :host { display: block; max-width: 760px; margin: 0 auto; padding: 16px; font-family: system-ui, sans-serif; }
    section { border: 1px solid #8884; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
    label { display: block; margin: 8px 0; font-weight: 600; }
    label.inline { display: inline; font-weight: normal; }
    textarea, input[type=text] { display: block; width: 100%; box-sizing: border-box; margin-top: 4px; font-family: ui-monospace, monospace; font-size: 14px; padding: 6px; }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    button { padding: 6px 14px; cursor: pointer; }
    .hint { opacity: .7; }
    .error { color: #d33; }
    .ok { color: #2a2; }
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
