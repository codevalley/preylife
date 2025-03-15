import { Entity, EntityType } from '../entities/Entity';
import { Creature } from '../entities/Creature';
import { Resource } from '../entities/Resource';

export class EntityTooltip {
  private tooltipElement: HTMLElement;
  private detailsElement: HTMLElement;
  private isVisible: boolean = false;
  private selectedEntity: Entity | null = null;
  private updateInterval: number | null = null;
  
  constructor() {
    // Create tooltip element
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'entity-tooltip';
    this.tooltipElement.style.cssText = `
      position: absolute;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      display: none;
      max-width: 200px;
    `;
    document.body.appendChild(this.tooltipElement);
    
    // Create details panel for selected entity
    this.detailsElement = document.createElement('div');
    this.detailsElement.className = 'entity-details';
    this.detailsElement.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 1000;
      width: 250px;
      display: none;
      border: 1px solid #444;
    `;
    document.body.appendChild(this.detailsElement);
  }
  
  showTooltip(entity: Entity, x: number, y: number): void {
    // Set tooltip content based on entity type
    let content = '';
    
    switch (entity.type) {
      case EntityType.RESOURCE:
        const resource = entity as Resource;
        content = `
          <div style="font-weight: bold; color: #55cc55;">Resource</div>
          <div>Energy: ${resource.energy}</div>
        `;
        break;
        
      case EntityType.PREY:
      case EntityType.PREDATOR:
        const creature = entity as Creature;
        const typeColor = entity.type === EntityType.PREY ? '#5588ff' : '#ff5555';
        const typeName = entity.type === EntityType.PREY ? 'Prey' : 'Predator';
        
        content = `
          <div style="font-weight: bold; color: ${typeColor};">${typeName}</div>
          <div>Energy: ${Math.round(creature.energy)} / ${Math.round(creature.maxEnergy)}</div>
          <div>Age: ${creature.age.toFixed(1)}s</div>
          <div style="margin-top: 5px; font-size: 11px;">Click to track</div>
        `;
        break;
    }
    
    this.tooltipElement.innerHTML = content;
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
  
  selectEntity(entity: Entity): void {
    // Clear previous selection
    this.clearSelection();
    
    // Set new selection
    this.selectedEntity = entity;
    
    // Only show details panel for creatures
    if (entity.type === EntityType.PREY || entity.type === EntityType.PREDATOR) {
      this.updateDetailsPanel();
      this.detailsElement.style.display = 'block';
      
      // Set up interval to update details
      this.updateInterval = window.setInterval(() => {
        this.updateDetailsPanel();
      }, 100);
    }
  }
  
  clearSelection(): void {
    this.selectedEntity = null;
    this.detailsElement.style.display = 'none';
    
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  private updateDetailsPanel(): void {
    if (!this.selectedEntity) return;
    
    // Only show details for creatures
    if (this.selectedEntity.type === EntityType.RESOURCE) return;
    
    const creature = this.selectedEntity as Creature;
    const typeColor = this.selectedEntity.type === EntityType.PREY ? '#5588ff' : '#ff5555';
    const typeName = this.selectedEntity.type === EntityType.PREY ? 'Prey' : 'Predator';
    
    // Calculate energy percentage
    const energyPercentage = Math.round((creature.energy / creature.maxEnergy) * 100);
    
    // Check if entity is still alive
    if (creature.isDead) {
      this.clearSelection();
      return;
    }
    
    // Generate attribute bars
    const strengthBar = this.generateAttributeBar(creature.attributes.strength, '#ff6666');
    const stealthBar = this.generateAttributeBar(creature.attributes.stealth, '#66aaff');
    const learnabilityBar = this.generateAttributeBar(creature.attributes.learnability, '#ffcc44');
    const longevityBar = this.generateAttributeBar(creature.attributes.longevity, '#cc66cc');
    
    // Generate energy bar
    const energyBarColor = energyPercentage > 66 ? '#44cc44' : 
                           energyPercentage > 33 ? '#cccc44' : '#cc4444';
    const energyBar = `
      <div style="width: 100%; background-color: #333; height: 8px; border-radius: 4px; margin-top: 2px;">
        <div style="width: ${energyPercentage}%; background-color: ${energyBarColor}; height: 8px; border-radius: 4px;"></div>
      </div>
    `;
    
    const content = `
      <div style="font-weight: bold; color: ${typeColor}; font-size: 16px; border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 10px;">
        ${typeName} Details
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>Energy:</span>
          <span>${Math.round(creature.energy)} / ${Math.round(creature.maxEnergy)} (${energyPercentage}%)</span>
        </div>
        ${energyBar}
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="margin-bottom: 5px;">Age: ${creature.age.toFixed(1)}s</div>
      </div>
      
      <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px;">
        Genetic Attributes
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Strength:</span>
          <span>${creature.attributes.strength.toFixed(2)}</span>
        </div>
        ${strengthBar}
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Stealth:</span>
          <span>${creature.attributes.stealth.toFixed(2)}</span>
        </div>
        ${stealthBar}
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Learnability:</span>
          <span>${creature.attributes.learnability.toFixed(2)}</span>
        </div>
        ${learnabilityBar}
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <span>Longevity:</span>
          <span>${creature.attributes.longevity.toFixed(2)}</span>
        </div>
        ${longevityBar}
      </div>
      
      <div style="margin-top: 15px; font-size: 11px; text-align: center; color: #888;">
        Click anywhere else to unselect
      </div>
    `;
    
    this.detailsElement.innerHTML = content;
  }
  
  private generateAttributeBar(value: number, color: string): string {
    const percentage = Math.round(value * 100);
    return `
      <div style="width: 100%; background-color: #333; height: 6px; border-radius: 3px; margin-top: 2px;">
        <div style="width: ${percentage}%; background-color: ${color}; height: 6px; border-radius: 3px;"></div>
      </div>
    `;
  }
  
  isTooltipVisible(): boolean {
    return this.isVisible;
  }
  
  getSelectedEntity(): Entity | null {
    return this.selectedEntity;
  }
}