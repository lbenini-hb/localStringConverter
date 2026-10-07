import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { jwtDecode, jwtEncode } from './codec';

@Component({
  selector: 'app-jwt',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <a class="back" routerLink="/">← Home</a>
      <section>
        <h2>JWT (HS256)</h2>
        <label>Secret<input type="text" [(ngModel)]="secret" placeholder="usato per firmare e verificare" /></label>
        <label class="grow">Token<textarea [(ngModel)]="token"></textarea></label>
        <div class="row">
          <button (click)="decode()">Decode ↓</button>
          <button (click)="encode()">Encode ↑</button>
        </div>
        @if (valid !== null) {
          <p [class]="valid ? 'ok' : 'error'">{{ valid ? '✔ Firma valida' : '✘ Firma NON valida' }}</p>
        }
        @if (error) { <p class="error">{{ error }}</p> }
        @if (header) { <label>Header<textarea rows="3" readonly [value]="header"></textarea></label> }
        <label class="grow">Payload (JSON)<textarea [(ngModel)]="payload"></textarea></label>
      </section>
    </div>
  `,
})
export class JwtComponent {
  secret = '';
  payload = '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}';
  token = '';
  header = '';
  valid: boolean | null = null;
  error = '';

  async encode() {
    this.reset();
    try {
      this.token = await jwtEncode(this.payload, this.secret);
    } catch (e) {
      this.error = (e as Error).message;
    }
  }

  async decode() {
    this.reset();
    try {
      const r = await jwtDecode(this.token, this.secret);
      this.header = JSON.stringify(r.header, null, 2);
      this.payload = JSON.stringify(r.payload, null, 2);
      this.valid = r.valid;
    } catch (e) {
      this.error = (e as Error).message;
    }
  }

  private reset() {
    this.error = '';
    this.header = '';
    this.valid = null;
  }
}
