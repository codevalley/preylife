import * as THREE from 'three';
import { Entity, EntityType } from '../entities/Entity';
import { SimulationEngine } from '../engine/SimulationEngine';
import { EntityTooltip } from '../ui/EntityTooltip';

export class Renderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  
  private entityMeshes: Map<string, THREE.Mesh> = new Map();
  private entityTooltip: EntityTooltip;
  
  // For raycasting and interaction
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private hoveredEntity: Entity | null = null;
  
  constructor(
    private container: HTMLElement,
    private width: number = 1000,
    private height: number = 600,
    private simulation: SimulationEngine
  ) {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);
    
    // Create orthographic camera
    const aspectRatio = width / height;
    const frustumSize = height;
    
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspectRatio / -2,
      frustumSize * aspectRatio / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
    );
    this.camera.position.z = 100;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add to container
    container.appendChild(this.renderer.domElement);
    
    // Initialize tooltip
    this.entityTooltip = new EntityTooltip();
    
    // Initialize raycaster and mouse
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Set up event listeners
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('click', this.onClick.bind(this));
    document.addEventListener('click', this.onDocumentClick.bind(this));
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  private onMouseMove(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Find intersections with meshes
    const intersects = this.raycaster.intersectObjects(Array.from(this.entityMeshes.values()), false);
    
    if (intersects.length > 0) {
      // Get the first intersected object
      const mesh = intersects[0].object as THREE.Mesh;
      
      // Find the entity associated with this mesh
      const entity = this.findEntityByMesh(mesh);
      
      if (entity) {
        // Update hover state
        if (this.hoveredEntity !== entity) {
          // Highlight the entity (could change material, scale, etc.)
          this.hoveredEntity = entity;
        }
        
        // Show tooltip
        this.entityTooltip.showTooltip(entity, event.clientX, event.clientY);
        
        return;
      }
    }
    
    // If no intersections, clear hover state
    if (this.hoveredEntity) {
      // Remove highlight
      this.hoveredEntity = null;
    }
    
    // Hide tooltip
    this.entityTooltip.hideTooltip();
  }
  
  private onClick(event: MouseEvent): void {
    // If we have a hovered entity, select it
    if (this.hoveredEntity) {
      this.entityTooltip.selectEntity(this.hoveredEntity);
      event.stopPropagation(); // Prevent document click from clearing selection
    }
  }
  
  private onDocumentClick(event: MouseEvent): void {
    // If click is outside canvas or not on an entity, clear selection
    if (event.target !== this.renderer.domElement || !this.hoveredEntity) {
      this.entityTooltip.clearSelection();
    }
  }
  
  private findEntityByMesh(mesh: THREE.Mesh): Entity | null {
    // Find the entity that owns this mesh
    for (const [id, entityMesh] of this.entityMeshes.entries()) {
      if (entityMesh === mesh) {
        // Find the entity in the simulation
        const allEntities = this.simulation.getAllEntities();
        return allEntities.find(entity => entity.id === id) || null;
      }
    }
    return null;
  }
  
  private onWindowResize(): void {
    const newWidth = this.container.clientWidth;
    const newHeight = this.container.clientHeight;
    const aspectRatio = newWidth / newHeight;
    const frustumSize = newHeight;
    
    this.camera.left = frustumSize * aspectRatio / -2;
    this.camera.right = frustumSize * aspectRatio / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = frustumSize / -2;
    
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(newWidth, newHeight);
  }
  
  updateEntities(entities: Entity[]): void {
    // Track which entities are still in the simulation
    const currentEntityIds = new Set<string>();
    
    // Update existing entities and add new ones
    for (const entity of entities) {
      currentEntityIds.add(entity.id);
      
      if (this.entityMeshes.has(entity.id)) {
        // Update existing mesh position
        entity.updateMeshPosition();
      } else {
        // Create new mesh for entity
        const mesh = entity.createMesh();
        this.entityMeshes.set(entity.id, mesh);
        this.scene.add(mesh);
      }
    }
    
    // Remove meshes for entities that no longer exist
    for (const [id, mesh] of this.entityMeshes.entries()) {
      if (!currentEntityIds.has(id)) {
        this.scene.remove(mesh);
        this.entityMeshes.delete(id);
      }
    }
  }
  
  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  getElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
  
  dispose(): void {
    // Clean up meshes
    for (const mesh of this.entityMeshes.values()) {
      this.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      } else if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose());
      }
    }
    
    this.entityMeshes.clear();
    
    // Remove event listeners
    this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.removeEventListener('click', this.onClick.bind(this));
    document.removeEventListener('click', this.onDocumentClick.bind(this));
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    // Remove renderer from DOM
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    
    // Dispose renderer
    this.renderer.dispose();
  }
}