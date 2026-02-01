import { Creature, GeneticAttributes } from '../entities/Creature';
import { EntityType } from '../entities/Entity';
import { OceanicColors } from './DashboardPanel';

export class CreatureDrawer {
  private container: HTMLElement;
  private content: HTMLElement;
  private isOpen = false;
  private selectedCreature: Creature | null = null;
  private updateInterval: number | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 280px;
      height: 100vh;
      background: rgba(8, 25, 45, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-left: 1px solid ${OceanicColors.borderPrimary};
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
      z-index: 150;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      overflow-y: auto;
      font-family: 'Inter', system-ui, sans-serif;
      color: ${OceanicColors.textPrimary};
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '\u00d7';
    closeBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      color: ${OceanicColors.textMuted};
      font-size: 24px;
      cursor: pointer;
      padding: 4px 8px;
      line-height: 1;
      z-index: 10;
      transition: color 0.2s;
    `;
    closeBtn.addEventListener('click', () => this.close());
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.color = OceanicColors.textPrimary;
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.color = OceanicColors.textMuted;
    });

    this.content = document.createElement('div');
    this.content.style.cssText = 'padding: 16px; padding-top: 40px;';

    this.container.appendChild(closeBtn);
    this.container.appendChild(this.content);
    document.body.appendChild(this.container);
  }

  open(creature: Creature): void {
    this.selectedCreature = creature;
    this.isOpen = true;
    this.container.style.transform = 'translateX(0)';
    this.update();

    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = window.setInterval(() => this.update(), 100);
  }

  close(): void {
    this.isOpen = false;
    this.selectedCreature = null;
    this.container.style.transform = 'translateX(100%)';
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  isDrawerOpen(): boolean {
    return this.isOpen;
  }

  private update(): void {
    if (!this.selectedCreature) return;
    const creature = this.selectedCreature;

    if (creature.isDead) {
      this.close();
      return;
    }

    const isPrey = creature.type === EntityType.PREY;
    const color = isPrey ? OceanicColors.prey : OceanicColors.predator;
    const speciesName = isPrey ? 'Bioluminescent Fish' : 'Deep Sea Hunter';
    const dominantTrait = this.getDominantTraitFromAttrs(creature.attributes);

    const energyPct = Math.round((creature.energy / creature.maxEnergy) * 100);
    const energyColor = this.getEnergyColor(energyPct);
    const ageDays = (creature.age / 10).toFixed(1);

    // All values are derived from internal simulation state, not user input
    this.content.innerHTML = [
      this.renderHeader(speciesName, color, dominantTrait),
      this.renderEnergyBar(creature, energyPct, energyColor),
      this.renderGenetics(creature),
      this.renderStats(creature, ageDays),
      this.renderLineage(creature),
    ].join('');
  }

  private renderHeader(speciesName: string, color: string, dominantTrait: string): string {
    return `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 16px; font-weight: 600; color: ${color}; text-shadow: 0 0 10px ${color}40;">
          ${speciesName}
        </div>
        <div style="font-size: 12px; color: ${OceanicColors.textMuted}; margin-top: 2px;">
          ${dominantTrait}
        </div>
      </div>
    `;
  }

  private renderEnergyBar(creature: Creature, energyPct: number, energyColor: string): string {
    return `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span style="color: ${OceanicColors.textSecondary};">Energy</span>
          <span style="color: ${energyColor};">
            ${Math.round(creature.energy)} / ${Math.round(creature.maxEnergy)} (${energyPct}%)
          </span>
        </div>
        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;">
          <div style="width: ${energyPct}%; height: 100%; background: ${energyColor}; border-radius: 3px; transition: width 0.2s;"></div>
        </div>
      </div>
    `;
  }

  private renderGenetics(creature: Creature): string {
    return `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: ${OceanicColors.textPrimary}; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid rgba(80, 180, 220, 0.2);">
          Genetics
        </div>
        ${this.renderTraitBar('Strength', creature.attributes.strength, '#ff6666')}
        ${this.renderTraitBar('Stealth', creature.attributes.stealth, '#66aaff')}
        ${this.renderTraitBar('Learnability', creature.attributes.learnability, '#ffcc44')}
        ${this.renderTraitBar('Longevity', creature.attributes.longevity, '#cc66cc')}
      </div>
    `;
  }

  private renderStats(creature: Creature, ageDays: string): string {
    return `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: ${OceanicColors.textPrimary}; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid rgba(80, 180, 220, 0.2);">
          Stats
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px;">
          <div style="color: ${OceanicColors.textMuted};">Age</div>
          <div style="text-align: right;">${ageDays} days</div>
          <div style="color: ${OceanicColors.textMuted};">Generation</div>
          <div style="text-align: right;">#${creature.generation}</div>
          <div style="color: ${OceanicColors.textMuted};">Offspring</div>
          <div style="text-align: right;">${creature.offspringCount}</div>
          <div style="color: ${OceanicColors.textMuted};">Food consumed</div>
          <div style="text-align: right;">${creature.foodConsumed}</div>
        </div>
      </div>
    `;
  }

  private renderTraitBar(label: string, value: number, color: string): string {
    const pct = Math.round(value * 100);
    return `
      <div style="margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
          <span style="color: ${OceanicColors.textSecondary};">${label}</span>
          <span style="color: ${color};">${value.toFixed(2)}</span>
        </div>
        <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px;">
          <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 2px;"></div>
        </div>
      </div>
    `;
  }

  private renderLineage(creature: Creature): string {
    const sectionHeader = `
      <div style="font-size: 13px; font-weight: 600; color: ${OceanicColors.textPrimary}; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid rgba(80, 180, 220, 0.2);">
    `;

    if (creature.generation === 0 && !creature.parentTraits) {
      return `
        <div style="margin-bottom: 16px;">
          ${sectionHeader}Lineage</div>
          <div style="font-size: 11px; color: ${OceanicColors.textMuted}; font-style: italic;">
            First generation (spawned)
          </div>
        </div>
      `;
    }

    let html = `
      <div style="margin-bottom: 16px;">
        ${sectionHeader}Lineage &mdash; Gen ${creature.generation}</div>
        <div style="padding-left: 8px; border-left: 2px solid rgba(80, 180, 220, 0.2);">
    `;

    if (creature.parentTraits) {
      const parentLabel = this.getSpeciesLabel(creature.parentSpecies);
      const parentColor = this.getSpeciesColor(creature.parentSpecies);
      html += this.renderAncestor('Parent', parentLabel, parentColor, creature.parentTraits);
    }

    if (creature.grandparentTraits) {
      html += this.renderAncestor('Grandparent', '', OceanicColors.textMuted, creature.grandparentTraits);
    }

    if (creature.greatGrandparentTraits) {
      html += this.renderAncestor('Great-grandparent', '', OceanicColors.textMuted, creature.greatGrandparentTraits);
    }

    html += '</div></div>';
    return html;
  }

  private renderAncestor(label: string, speciesLabel: string, color: string, traits: GeneticAttributes): string {
    const dominant = this.getDominantTraitFromAttrs(traits);
    const suffix = speciesLabel ? ` (${speciesLabel})` : '';
    return `
      <div style="margin-bottom: 8px; font-size: 11px;">
        <div style="color: ${color}; font-weight: 500;">${label}${suffix}</div>
        <div style="color: ${OceanicColors.textMuted}; margin-top: 2px;">
          ${dominant} &mdash;
          Str:${traits.strength.toFixed(2)}
          Stl:${traits.stealth.toFixed(2)}
          Lrn:${traits.learnability.toFixed(2)}
          Lng:${traits.longevity.toFixed(2)}
        </div>
      </div>
    `;
  }

  private getSpeciesLabel(species: EntityType | null): string {
    switch (species) {
      case EntityType.PREY: return 'Fish';
      case EntityType.PREDATOR: return 'Hunter';
      default: return 'Unknown';
    }
  }

  private getSpeciesColor(species: EntityType | null): string {
    switch (species) {
      case EntityType.PREY: return OceanicColors.prey;
      case EntityType.PREDATOR: return OceanicColors.predator;
      default: return OceanicColors.textMuted;
    }
  }

  private getEnergyColor(energyPct: number): string {
    if (energyPct > 66) return '#44cc44';
    if (energyPct > 33) return '#cccc44';
    return '#cc4444';
  }

  private getDominantTraitFromAttrs(attrs: GeneticAttributes): string {
    const max = Math.max(attrs.strength, attrs.stealth, attrs.learnability, attrs.longevity);
    if (max === attrs.strength) return 'Strong';
    if (max === attrs.stealth) return 'Stealthy';
    if (max === attrs.learnability) return 'Adaptive';
    return 'Hardy';
  }
}
