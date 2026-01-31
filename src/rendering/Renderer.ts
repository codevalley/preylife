import * as THREE from 'three';
import { Entity } from '../entities/Entity';
import { SimulationEngine } from '../core/SimulationEngine';
import { EntityTooltip } from '../ui/EntityTooltip';
import { OceanBackground } from './OceanBackground';
import { MarineSnow } from './MarineSnow';
import { PostProcessing } from './PostProcessing';

export class Renderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  private entityMeshes: Map<string, THREE.Mesh> = new Map();
  private entityTooltip: EntityTooltip;

  // Ocean atmosphere systems
  private oceanBackground: OceanBackground;
  private marineSnow: MarineSnow;
  private postProcessing: PostProcessing;
  private usePostProcessing: boolean = true;

  // For raycasting and interaction
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private hoveredEntity: Entity | null = null;

  // Timing for animations
  private lastFrameTime: number = 0;

  constructor(
    container: HTMLElement,
    private width: number = window.innerWidth,
    private height: number = window.innerHeight,
    private simulation: SimulationEngine
  ) {
    // Create scene
    this.scene = new THREE.Scene();
    // Remove static background - we'll use the shader background instead
    this.scene.background = null;

    // Get initial window dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Create orthographic camera
    const aspectRatio = this.width / this.height;
    const frustumSize = 600; // Base scale for the world (fixed height)

    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspectRatio / -2,
      frustumSize * aspectRatio / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
    );
    this.camera.position.z = 100;

    // Create renderer with alpha support for proper blending
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    this.renderer.setClearColor(0x000000, 1);

    // Make renderer fill the container
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';

    // Add to container
    container.appendChild(this.renderer.domElement);

    // Initialize ocean atmosphere
    this.oceanBackground = new OceanBackground(
      frustumSize * aspectRatio,
      frustumSize
    );
    this.scene.add(this.oceanBackground.getMesh());

    // Initialize marine snow particles
    this.marineSnow = new MarineSnow(
      frustumSize * aspectRatio,
      frustumSize,
      150 // Particle count - balanced for atmosphere vs performance
    );
    this.scene.add(this.marineSnow.getPoints());

    // Initialize post-processing
    this.postProcessing = new PostProcessing(
      this.renderer,
      this.scene,
      this.camera,
      this.width,
      this.height
    );

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

    // Do an initial resize to ensure correct size
    this.onWindowResize();

    this.lastFrameTime = performance.now();
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
    // Get new window dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const aspectRatio = this.width / this.height;

    // Keep a fixed height for the camera to maintain scale of the simulation
    const frustumSize = 600; // Fixed height

    // Update camera frustum
    this.camera.left = frustumSize * aspectRatio / -2;
    this.camera.right = frustumSize * aspectRatio / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = frustumSize / -2;

    // Update camera matrix
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(this.width, this.height);

    // Update ocean systems
    this.oceanBackground.setResolution(frustumSize * aspectRatio, frustumSize);
    this.marineSnow.setBounds(frustumSize * aspectRatio, frustumSize);
    this.postProcessing.setSize(this.width, this.height);
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
    // Calculate delta time for animations
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // Update ocean atmosphere animations
    this.oceanBackground.update(deltaTime);
    this.marineSnow.update(deltaTime);

    // Render with or without post-processing
    if (this.usePostProcessing) {
      this.postProcessing.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Toggle post-processing effects
   */
  setPostProcessingEnabled(enabled: boolean): void {
    this.usePostProcessing = enabled;
  }

  /**
   * Set bloom intensity for glow effects
   */
  setBloomIntensity(strength: number): void {
    this.postProcessing.setBloomStrength(strength);
  }

  /**
   * Set caustic light intensity in background
   */
  setCausticIntensity(intensity: number): void {
    this.oceanBackground.setCausticIntensity(intensity);
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

    // Dispose ocean systems
    this.oceanBackground.dispose();
    this.marineSnow.dispose();
    this.postProcessing.dispose();

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
