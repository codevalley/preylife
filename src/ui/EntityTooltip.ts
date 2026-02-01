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
      max-width: 200px;
    `;
    document.body.appendChild(this.tooltipElement);
  }

  showTooltip(entity: Entity, x: number, y: number): void {
    // All values are derived from internal simulation state, not user input
    this.tooltipElement.innerHTML = this.buildTooltipContent(entity);
    this.tooltipElement.style.left = `${x + 15}px`;
    this.tooltipElement.style.top = `${y + 15}px`;
    this.tooltipElement.style.display = 'block';
    this.isVisible = true;
  }

  hideTooltip(): void {
    if (this.isVisible) {
      this.tooltipElement.style.display = 'none';
      this.isVisible = false;
    }
  }

  isTooltipVisible(): boolean {
    return this.isVisible;
  }

  getSelectedEntity(): Entity | null {
    return null;
  }

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

    return `
      <div style="font-weight: bold; color: ${color};">${dominantTrait} ${species}</div>
      <div style="margin-top: 4px;">
        <div style="width: 80px; height: 3px; background: rgba(255,255,255,0.15); border-radius: 2px;">
          <div style="width: ${energyPct}%; height: 100%; background: ${energyColor}; border-radius: 2px;"></div>
        </div>
      </div>
    `;
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
