import { Entity, EntityType } from '../entities/Entity';
import { Creature } from '../entities/Creature';
import { OceanicColors } from './DashboardPanel';

export class EntityTooltip {
  private tooltipElement: HTMLElement;
  private isVisible: boolean = false;

  constructor() {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'entity-tooltip';
    this.tooltipElement.style.cssText = `
      position: absolute;
      background: rgba(8, 25, 45, 0.9);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid ${OceanicColors.borderPrimary};
      border-radius: 8px;
      padding: 8px 12px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      color: ${OceanicColors.textPrimary};
      pointer-events: none;
      z-index: 1000;
      display: none;
      max-width: 220px;
    `;
    document.body.appendChild(this.tooltipElement);
  }

  showTooltip(entity: Entity, x: number, y: number): void {
    // All values are derived from internal simulation state, not user input
    this.tooltipElement.innerHTML = this.buildTooltipContent(entity);

    // Set accent border color based on species
    const accentColor = entity.type === EntityType.PREY
      ? OceanicColors.prey
      : entity.type === EntityType.PREDATOR
        ? OceanicColors.predator
        : OceanicColors.resource;
    this.tooltipElement.style.borderLeft = `3px solid ${accentColor}`;

    this.tooltipElement.style.left = `${x + 15}px`;
    this.tooltipElement.style.top = `${y + 15}px`;
    this.tooltipElement.style.display = 'block';
    this.isVisible = true;
  }

  hideTooltip(): void {
    if (this.isVisible) {
      this.tooltipElement.style.display = 'none';
      this.tooltipElement.style.borderLeft = `1px solid ${OceanicColors.borderPrimary}`;
      this.isVisible = false;
    }
  }

  isTooltipVisible(): boolean {
    return this.isVisible;
  }

  getSelectedEntity(): Entity | null {
    return null;
  }

  // Content generated from internal simulation state, not user input
  private buildTooltipContent(entity: Entity): string {
    if (entity.type === EntityType.RESOURCE) {
      return `
        <div style="font-weight: bold; color: ${OceanicColors.resource};">Resource</div>
        <div style="margin-top: 4px; font-size: 11px; color: ${OceanicColors.textMuted};">
          Energy: ${Math.round(entity.energy)}
        </div>
      `;
    }

    const creature = entity as Creature;
    const isPrey = entity.type === EntityType.PREY;
    const color = isPrey ? OceanicColors.prey : OceanicColors.predator;
    const species = isPrey ? 'Fish' : 'Hunter';
    const dominantTrait = this.getDominantTrait(creature);
    const energyPct = Math.round((creature.energy / creature.maxEnergy) * 100);
    const energyColor = energyPct > 66 ? '#44cc44' : energyPct > 33 ? '#cccc44' : '#cc4444';

    // Get top 2 traits
    const traitPills = this.getTopTraitPills(creature);

    return `
      <div style="font-weight: bold; color: ${color};">${dominantTrait} ${species}</div>
      <div style="margin-top: 4px;">
        <div style="width: 100px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px;">
          <div style="width: ${energyPct}%; height: 100%; background: ${energyColor}; border-radius: 2px;"></div>
        </div>
      </div>
      <div style="margin-top: 5px; display: flex; gap: 6px;">
        ${traitPills}
      </div>
      <div style="margin-top: 4px; font-size: 10px; color: ${OceanicColors.textMuted};">Click for details</div>
    `;
  }

  private getTopTraitPills(creature: Creature): string {
    const a = creature.attributes;
    const traits: Array<{ emoji: string; value: number; color: string }> = [
      { emoji: '\u{1F4AA}', value: a.strength, color: '#ff6666' },
      { emoji: '\u{1F977}', value: a.stealth, color: '#66aaff' },
      { emoji: '\u{1F9E0}', value: a.learnability, color: '#ffcc44' },
      { emoji: '\u2764\uFE0F', value: a.longevity, color: '#cc66cc' },
    ];

    traits.sort((x, y) => y.value - x.value);
    const top2 = traits.slice(0, 2);

    return top2.map(t =>
      `<span style="font-size: 10px; background: rgba(255,255,255,0.06); border-radius: 6px; padding: 1px 5px; color: ${t.color};">${t.emoji} ${t.value.toFixed(2)}</span>`
    ).join('');
  }

  private getDominantTrait(creature: Creature): string {
    const a = creature.attributes;
    const max = Math.max(a.strength, a.stealth, a.learnability, a.longevity);
    if (max === a.strength) return 'Strong';
    if (max === a.stealth) return 'Stealthy';
    if (max === a.learnability) return 'Adaptive';
    return 'Hardy';
  }
}
