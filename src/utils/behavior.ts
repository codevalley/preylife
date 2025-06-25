import { Vector2 } from 'three';
import { Creature } from '../entities/Creature';
import { SimulationConfig } from '../config';

export function applyRepulsion(creature: Creature, others: Creature[], type: 'prey' | 'predator'): void {
  const radius = SimulationConfig.creatures.personalSpaceRadius[type];
  const factor = SimulationConfig.creatures.repulsionFactor[type];
  const repulsionVector = new Vector2(0, 0);
  let count = 0;

  for (const other of others) {
    if (other === creature) continue;
    const distance = creature.position.distanceTo(other.position);
    if (distance < radius) {
      const away = creature.position.clone().sub(other.position).normalize();
      const strength = 1 - distance / radius;
      repulsionVector.add(away.multiplyScalar(strength));
      count++;
    }
  }

  if (count > 0 && repulsionVector.lengthSq() > 0.0001) {
    repulsionVector.normalize();
    const energyRatio = creature.energy / creature.maxEnergy;
    const repulsionFactor = factor * Math.min(1, energyRatio * 2);
    const comp = repulsionVector.clone().multiplyScalar(creature.speed * repulsionFactor);
    creature.velocity.add(comp);
    if (creature.velocity.lengthSq() > 0.0001) {
      creature.velocity.normalize().multiplyScalar(creature.speed);
    }
  }
}
