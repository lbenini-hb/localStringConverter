import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { b64Decode, b64Encode } from './codec';

@Component({
  selector: 'app-base64',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <a class="back" routerLink="/">← Home</a>
      <section>
        <h2>Base64</h2>
        <label class="grow">Base64<textarea [(ngModel)]="b64"></textarea></label>
        <div class="row">
          <button (click)="decode()">Decode ↓</button>
          <button (click)="encode()">Encode ↑</button>
          <label class="inline"><input type="checkbox" [(ngModel)]="urlSafe" /> URL-safe</label>
        </div>
        @if (error) { <p class="error">{{ error }}</p> }
        <label class="grow">Testo<textarea [(ngModel)]="plain"></textarea></label>
      </section>
    </div>
  `,
})
export class Base64Component {
  plain = '';
  b64 = '';
  urlSafe = false;
  error = '';

  encode() {
    this.error = '';
    this.b64 = b64Encode(this.plain, this.urlSafe);
  }

  decode() {
    this.error = '';
    try {
      this.plain = b64Decode(this.b64);
    } catch {
      this.error = 'Input Base64 non valido (o non è testo UTF-8).';
    }
  }
}
