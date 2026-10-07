import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <canvas #canvas aria-hidden="true"></canvas>
    <main>
      <h1>Local String Converter</h1>
      <p class="hint">Tutto avviene nel browser: nessun dato lascia la pagina.</p>
      <nav>
        <a class="btn" routerLink="/base64">Base64</a>
        <a class="btn" routerLink="/jwt">JWT</a>
      </nav>
    </main>
  `,
  styles: `
    canvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; }
    main { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center; padding: 16px; }
    h1 { font-size: clamp(2.2rem, 7vw, 4rem); }
    nav { display: flex; gap: 16px; margin-top: 40px; flex-wrap: wrap; justify-content: center; }
    .btn { min-width: 180px; padding: 16px 32px; font-size: 1.1rem; }
  `,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private frame = 0;
  private onResize = () => this.resize();
  private particles: { x: number; y: number; vx: number; vy: number }[] = [];

  ngAfterViewInit() {
    this.resize();
    window.addEventListener('resize', this.onResize);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) this.draw();
    else this.loop();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.onResize);
  }

  private resize() {
    const c = this.canvas().nativeElement;
    const dpr = devicePixelRatio || 1;
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(120, Math.round((innerWidth * innerHeight) / 12000));
    this.particles = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));
  }

  private loop = () => {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
    }
    this.draw();
    this.frame = requestAnimationFrame(this.loop);
  };

  // ponytail: O(n²) link check, fine up to the 120-particle cap.
  private draw() {
    const ctx = this.canvas().nativeElement.getContext('2d')!;
    const ps = this.particles;
    const max = 130;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
        if (d < max) {
          ctx.strokeStyle = `rgba(45, 212, 191, ${(1 - d / max) * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(ps[i].x, ps[i].y);
          ctx.lineTo(ps[j].x, ps[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = '#5eead4';
    for (const p of ps) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
