export class PopulationSparkline {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private healthDot: HTMLElement;
  private data: Array<{ prey: number; predator: number; resource: number }> = [];
  private readonly maxDataPoints = 200;
  private expanded = false;

  // Canvas dimensions
  private smallWidth = 220;
  private smallHeight = 70;
  private largeWidth = 450;
  private largeHeight = 180;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 16px;
      display: flex;
      align-items: flex-end;
      gap: 8px;
      z-index: 100;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      background: rgba(8, 25, 45, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(80, 180, 220, 0.3);
      border-radius: 12px;
      padding: 8px;
      box-shadow: 0 4px 16px rgba(0, 50, 80, 0.3);
      transition: all 0.3s ease;
    `;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.smallWidth;
    this.canvas.height = this.smallHeight;
    this.canvas.style.cssText = `
      display: block;
      border-radius: 6px;
      transition: all 0.3s ease;
    `;
    this.ctx = this.canvas.getContext('2d')!;

    wrapper.appendChild(this.canvas);

    this.healthDot = document.createElement('div');
    this.healthDot.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #44cc44;
      box-shadow: 0 0 8px rgba(68, 204, 68, 0.5);
      transition: all 0.5s ease;
      flex-shrink: 0;
    `;

    this.container.appendChild(wrapper);
    this.container.appendChild(this.healthDot);

    this.container.addEventListener('click', () => this.toggleExpanded());

    this.container.addEventListener('mouseenter', () => {
      wrapper.style.borderColor = 'rgba(100, 200, 255, 0.5)';
      wrapper.style.boxShadow = '0 4px 20px rgba(0, 50, 80, 0.5)';
    });
    this.container.addEventListener('mouseleave', () => {
      wrapper.style.borderColor = 'rgba(80, 180, 220, 0.3)';
      wrapper.style.boxShadow = '0 4px 16px rgba(0, 50, 80, 0.3)';
    });

    document.body.appendChild(this.container);
  }

  addDataPoint(prey: number, predator: number, resource: number): void {
    this.data.push({ prey, predator, resource });
    if (this.data.length > this.maxDataPoints) {
      this.data.shift();
    }
    this.draw();
    this.updateHealthDot(prey, predator, resource);
  }

  reset(): void {
    this.data = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.healthDot.style.background = '#44cc44';
    this.healthDot.style.boxShadow = '0 0 8px rgba(68, 204, 68, 0.5)';
  }

  private draw(): void {
    if (this.data.length < 2) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    let maxVal = 1;
    for (const d of this.data) {
      const total = d.prey + d.predator + d.resource;
      if (total > maxVal) maxVal = total;
    }

    const stepX = w / (this.maxDataPoints - 1);
    const offsetX = (this.maxDataPoints - this.data.length) * stepX;

    // Draw stacked areas (bottom-up: resource, prey, predator)
    this.drawArea(ctx, offsetX, stepX, h, maxVal,
      () => 0, d => d.resource,
      'rgba(68, 255, 170, 0.3)', 'rgba(68, 255, 170, 0.6)');

    this.drawArea(ctx, offsetX, stepX, h, maxVal,
      d => d.resource, d => d.resource + d.prey,
      'rgba(0, 200, 255, 0.3)', 'rgba(0, 200, 255, 0.6)');

    this.drawArea(ctx, offsetX, stepX, h, maxVal,
      d => d.resource + d.prey, d => d.resource + d.prey + d.predator,
      'rgba(255, 120, 30, 0.3)', 'rgba(255, 120, 30, 0.6)');
  }

  private drawArea(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    stepX: number,
    h: number,
    maxVal: number,
    bottomFn: (d: { prey: number; predator: number; resource: number }) => number,
    topFn: (d: { prey: number; predator: number; resource: number }) => number,
    fillColor: string,
    strokeColor: string
  ): void {
    // Fill area
    ctx.beginPath();
    for (let i = 0; i < this.data.length; i++) {
      const x = offsetX + i * stepX;
      const y = h - (topFn(this.data[i]) / maxVal) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = this.data.length - 1; i >= 0; i--) {
      const x = offsetX + i * stepX;
      const y = h - (bottomFn(this.data[i]) / maxVal) * h;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Top stroke
    ctx.beginPath();
    for (let i = 0; i < this.data.length; i++) {
      const x = offsetX + i * stepX;
      const y = h - (topFn(this.data[i]) / maxVal) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private updateHealthDot(prey: number, predator: number, resource: number): void {
    const total = prey + predator + resource;

    if (total === 0 || prey === 0 || predator === 0) {
      this.healthDot.style.background = '#ff4444';
      this.healthDot.style.boxShadow = '0 0 8px rgba(255, 68, 68, 0.5)';
      return;
    }

    const preyRatio = prey / total;
    const predatorRatio = predator / total;

    if (preyRatio > 0.7 || predatorRatio > 0.7) {
      this.healthDot.style.background = '#ffaa44';
      this.healthDot.style.boxShadow = '0 0 8px rgba(255, 170, 68, 0.5)';
    } else {
      this.healthDot.style.background = '#44cc44';
      this.healthDot.style.boxShadow = '0 0 8px rgba(68, 204, 68, 0.5)';
    }
  }

  private toggleExpanded(): void {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.canvas.width = this.largeWidth;
      this.canvas.height = this.largeHeight;
    } else {
      this.canvas.width = this.smallWidth;
      this.canvas.height = this.smallHeight;
    }
    this.draw();
  }

  getContainer(): HTMLElement {
    return this.container;
  }
}
