import { OceanicColors } from './DashboardPanel';

type DataPoint = { prey: number; predator: number; resource: number };
type HealthState = 'balanced' | 'imbalanced' | 'critical';

const HEALTH_COLORS: Record<HealthState, { color: string; bg: string; border: string; glow: string }> = {
  balanced:   { color: '#44cc44', bg: 'rgba(68, 204, 68, 0.04)',  border: 'rgba(68, 204, 68, 0.4)',  glow: 'rgba(68, 204, 68, 0.15)' },
  imbalanced: { color: '#ffaa44', bg: 'rgba(255, 170, 68, 0.06)', border: 'rgba(255, 170, 68, 0.5)', glow: 'rgba(255, 170, 68, 0.2)' },
  critical:   { color: '#ff4444', bg: 'rgba(255, 68, 68, 0.08)',  border: 'rgba(255, 68, 68, 0.5)',  glow: 'rgba(255, 68, 68, 0.25)' },
};

const HEALTH_LABELS: Record<HealthState, string> = {
  balanced: 'Balanced',
  imbalanced: 'Imbalanced',
  critical: 'Critical',
};

export class PopulationSparkline {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private healthDotEl: HTMLElement;
  private healthTextEl: HTMLElement;
  private modeLabel: HTMLElement;
  private wrapper: HTMLElement;
  private data: DataPoint[] = [];
  private fullData: DataPoint[] = [];
  private readonly maxDataPoints = 200;
  private expanded = false;
  private showFullHistory = false;
  private currentHealth: HealthState = 'balanced';

  // Canvas dimensions
  private smallWidth = 260;
  private smallHeight = 90;
  private largeWidth = 500;
  private largeHeight = 220;

  // Chart area padding
  private readonly padLeft = 36;
  private readonly padRight = 8;
  private readonly padTop = 8;
  private readonly padBottom = 18;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 16px;
      z-index: 100;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    this.wrapper = document.createElement('div');
    this.wrapper.style.cssText = `
      background: rgba(8, 25, 45, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1.5px solid ${HEALTH_COLORS.balanced.border};
      border-radius: 12px;
      padding: 8px;
      box-shadow: 0 4px 16px rgba(0, 50, 80, 0.3), inset 0 0 20px ${HEALTH_COLORS.balanced.glow};
      transition: all 0.5s ease;
    `;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.smallWidth;
    this.canvas.height = this.smallHeight;
    this.canvas.style.cssText = 'display: block; border-radius: 6px;';
    this.ctx = this.canvas.getContext('2d')!;

    this.wrapper.appendChild(this.canvas);

    // Status row: health label left, mode label right
    const statusRow = document.createElement('div');
    statusRow.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 2px 0;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px;
    `;

    // Health label built with DOM (no innerHTML)
    const healthContainer = document.createElement('div');
    healthContainer.style.cssText = `
      display: flex; align-items: center; gap: 4px;
      color: ${HEALTH_COLORS.balanced.color};
      transition: color 0.5s ease;
    `;
    this.healthDotEl = document.createElement('span');
    this.healthDotEl.style.cssText = `
      display: inline-block; width: 6px; height: 6px; border-radius: 50%;
      background: ${HEALTH_COLORS.balanced.color};
      transition: background 0.5s ease;
    `;
    this.healthTextEl = document.createElement('span');
    this.healthTextEl.textContent = 'Balanced';
    healthContainer.appendChild(this.healthDotEl);
    healthContainer.appendChild(this.healthTextEl);

    // Mode label (visible only when expanded)
    this.modeLabel = document.createElement('div');
    this.modeLabel.style.cssText = `
      display: none;
      color: ${OceanicColors.textMuted};
      cursor: pointer;
    `;
    this.modeLabel.textContent = 'Recent';

    statusRow.appendChild(healthContainer);
    statusRow.appendChild(this.modeLabel);
    this.wrapper.appendChild(statusRow);

    this.container.appendChild(this.wrapper);

    this.container.addEventListener('click', (e) => {
      if (this.expanded && e.target === this.modeLabel) {
        this.showFullHistory = !this.showFullHistory;
        this.modeLabel.textContent = this.showFullHistory ? 'Full History' : 'Recent';
        this.draw();
        return;
      }
      this.toggleExpanded();
    });

    this.container.addEventListener('mouseenter', () => {
      this.wrapper.style.boxShadow = `0 4px 20px rgba(0, 50, 80, 0.5), inset 0 0 24px ${HEALTH_COLORS[this.currentHealth].glow}`;
    });
    this.container.addEventListener('mouseleave', () => {
      this.wrapper.style.boxShadow = `0 4px 16px rgba(0, 50, 80, 0.3), inset 0 0 20px ${HEALTH_COLORS[this.currentHealth].glow}`;
    });

    document.body.appendChild(this.container);
  }

  addDataPoint(prey: number, predator: number, resource: number): void {
    const point = { prey, predator, resource };
    this.fullData.push(point);
    this.data.push(point);
    if (this.data.length > this.maxDataPoints) {
      this.data.shift();
    }
    this.updateHealth(prey, predator, resource);
    this.draw();
  }

  reset(): void {
    this.data = [];
    this.fullData = [];
    this.showFullHistory = false;
    this.currentHealth = 'balanced';
    if (this.expanded) {
      this.modeLabel.textContent = 'Recent';
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.applyHealthStyle('balanced');
  }

  private draw(): void {
    const activeData = (this.expanded && this.showFullHistory) ? this.fullData : this.data;
    if (activeData.length < 2) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    const chartLeft = this.padLeft;
    const chartRight = w - this.padRight;
    const chartTop = this.padTop;
    const chartBottom = h - this.padBottom;
    const chartW = chartRight - chartLeft;
    const chartH = chartBottom - chartTop;

    // Subtle background tint reflecting ecology state
    ctx.fillStyle = HEALTH_COLORS[this.currentHealth].bg;
    ctx.fillRect(chartLeft, chartTop, chartW, chartH);

    // Max per-species (overlapping, not stacked)
    let maxVal = 1;
    for (const d of activeData) {
      if (d.prey > maxVal) maxVal = d.prey;
      if (d.predator > maxVal) maxVal = d.predator;
      if (d.resource > maxVal) maxVal = d.resource;
    }

    const niceMax = this.niceMaxValue(maxVal);

    this.drawAxes(ctx, chartLeft, chartTop, chartW, chartH, chartBottom, niceMax, activeData.length);

    const totalPoints = (this.expanded && this.showFullHistory) ? activeData.length : this.maxDataPoints;
    const stepX = chartW / (totalPoints - 1);
    const offsetX = chartLeft + (totalPoints - activeData.length) * stepX;

    // Draw order: resource behind, prey middle, predator front
    const series: Array<{ key: keyof DataPoint; fill: string; stroke: string }> = [
      { key: 'resource', fill: 'rgba(68, 255, 170, 0.12)', stroke: 'rgba(68, 255, 170, 0.7)' },
      { key: 'prey',     fill: 'rgba(0, 200, 255, 0.12)',  stroke: 'rgba(0, 200, 255, 0.7)' },
      { key: 'predator', fill: 'rgba(255, 120, 30, 0.12)', stroke: 'rgba(255, 120, 30, 0.8)' },
    ];

    for (const s of series) {
      this.drawSeries(ctx, activeData, s.key, offsetX, stepX, chartBottom, chartH, niceMax, s.fill, s.stroke);
    }
  }

  private drawSeries(
    ctx: CanvasRenderingContext2D,
    data: DataPoint[],
    key: keyof DataPoint,
    offsetX: number,
    stepX: number,
    chartBottom: number,
    chartH: number,
    maxVal: number,
    fillColor: string,
    strokeColor: string,
  ): void {
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = offsetX + i * stepX;
      const y = chartBottom - (data[i][key] / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(offsetX + (data.length - 1) * stepX, chartBottom);
    ctx.lineTo(offsetX, chartBottom);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = offsetX + i * stepX;
      const y = chartBottom - (data[i][key] / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawAxes(
    ctx: CanvasRenderingContext2D,
    chartLeft: number,
    chartTop: number,
    chartW: number,
    chartH: number,
    chartBottom: number,
    maxVal: number,
    dataLen: number,
  ): void {
    const isExpanded = this.expanded;
    const gridCount = isExpanded ? 4 : 3;
    const fontSize = isExpanded ? 11 : 10;

    ctx.save();

    // Y-axis gridlines and labels
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridCount; i++) {
      const val = Math.round((maxVal / gridCount) * i);
      const y = chartBottom - (val / maxVal) * chartH;

      if (i > 0) {
        ctx.strokeStyle = 'rgba(96, 144, 168, 0.18)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(chartLeft + chartW, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const label = val >= 1000 ? (val / 1000).toFixed(val >= 10000 ? 0 : 1) + 'k' : String(val);
      ctx.fillStyle = 'rgba(160, 192, 216, 0.7)';
      ctx.fillText(label, chartLeft - 4, y);
    }

    // X-axis baseline
    ctx.strokeStyle = 'rgba(96, 144, 168, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    ctx.lineTo(chartLeft + chartW, chartBottom);
    ctx.stroke();

    // Y-axis line
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartTop);
    ctx.lineTo(chartLeft, chartBottom);
    ctx.stroke();

    // X-axis time labels
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(160, 192, 216, 0.6)';
    const xLabelY = chartBottom + 4;

    ctx.textAlign = 'right';
    ctx.fillText('now', chartLeft + chartW, xLabelY);

    ctx.textAlign = 'left';
    if (this.showFullHistory && this.expanded) {
      ctx.fillText('t=0', chartLeft, xLabelY);
    } else if (dataLen > 20) {
      ctx.fillText('\u2212' + Math.min(this.maxDataPoints, dataLen), chartLeft, xLabelY);
    }

    if (isExpanded) {
      ctx.textAlign = 'center';
      const midX = chartLeft + chartW / 2;
      ctx.strokeStyle = 'rgba(96, 144, 168, 0.2)';
      ctx.beginPath();
      ctx.moveTo(midX, chartBottom);
      ctx.lineTo(midX, chartBottom + 3);
      ctx.stroke();

      const halfLen = this.showFullHistory ? Math.round(dataLen / 2) : Math.round(Math.min(this.maxDataPoints, dataLen) / 2);
      if (halfLen > 1) {
        ctx.fillText('\u2212' + halfLen, midX, xLabelY);
      }
    }

    ctx.restore();
  }

  private niceMaxValue(val: number): number {
    if (val <= 0) return 10;
    const magnitude = Math.pow(10, Math.floor(Math.log10(val)));
    const normalized = val / magnitude;
    if (normalized <= 1) return magnitude;
    if (normalized <= 2) return 2 * magnitude;
    if (normalized <= 5) return 5 * magnitude;
    return 10 * magnitude;
  }

  private updateHealth(prey: number, predator: number, resource: number): void {
    const total = prey + predator + resource;
    let state: HealthState;

    if (total === 0 || prey === 0 || predator === 0) {
      state = 'critical';
    } else {
      const preyRatio = prey / total;
      const predatorRatio = predator / total;
      state = (preyRatio > 0.7 || predatorRatio > 0.7) ? 'imbalanced' : 'balanced';
    }

    if (state !== this.currentHealth) {
      this.currentHealth = state;
      this.applyHealthStyle(state);
    }
  }

  private applyHealthStyle(state: HealthState): void {
    const h = HEALTH_COLORS[state];
    this.wrapper.style.borderColor = h.border;
    this.wrapper.style.boxShadow = `0 4px 16px rgba(0, 50, 80, 0.3), inset 0 0 20px ${h.glow}`;
    this.healthDotEl.style.background = h.color;
    this.healthTextEl.textContent = HEALTH_LABELS[state];
    const parent = this.healthDotEl.parentElement;
    if (parent) parent.style.color = h.color;
  }

  private toggleExpanded(): void {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.canvas.width = this.largeWidth;
      this.canvas.height = this.largeHeight;
      this.modeLabel.style.display = 'block';
    } else {
      this.canvas.width = this.smallWidth;
      this.canvas.height = this.smallHeight;
      this.showFullHistory = false;
      this.modeLabel.textContent = 'Recent';
      this.modeLabel.style.display = 'none';
    }
    this.draw();
  }

  getContainer(): HTMLElement {
    return this.container;
  }
}
