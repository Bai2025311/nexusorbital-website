// Mars Base 3D Model System for NexusOrbital Space Colonization Community
// Utilizes Three.js for 3D rendering and allows users to interact with and modify the base

import { agentSystem } from '../agents/agentSystem.js';
import languageSwitcher from '../lang/languageSwitcher.js';

class MarsBaseModel {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = null;
    this.mouse = null;
    this.baseModules = [];
    this.selectedModule = null;
    this.dragEnabled = false;
    this.terrain = null;
    this.marsTexture = null;
    this.moduleTypes = [
      {
        id: 'habitat',
        name: 'Habitat Module',
        description: 'Living quarters for astronauts',
        model: 'models/habitat.glb',
        scale: 1.0,
        rotationY: 0,
        color: 0x66BBFF
      },
      {
        id: 'laboratory',
        name: 'Science Lab',
        description: 'Research and experiments facility',
        model: 'models/laboratory.glb',
        scale: 1.2,
        rotationY: 0,
        color: 0xFFAA66
      },
      {
        id: 'greenhouse',
        name: 'Greenhouse',
        description: 'Food production system',
        model: 'models/greenhouse.glb',
        scale: 1.0,
        rotationY: 0,
        color: 0x88DD66
      },
      {
        id: 'power',
        name: 'Power Module',
        description: 'Power generation and storage',
        model: 'models/power.glb',
        scale: 0.8,
        rotationY: 0,
        color: 0xFFCC44
      },
      {
        id: 'connector',
        name: 'Connector Tunnel',
        description: 'Connects modules together',
        model: 'models/connector.glb',
        scale: 0.7,
        rotationY: 0,
        color: 0xAAAAAA
      }
    ];
    this.initialModules = [
      { type: 'habitat', position: { x: 0, y: 0, z: 0 }, rotation: 0 },
      { type: 'laboratory', position: { x: 30, y: 0, z: 20 }, rotation: Math.PI / 4 },
      { type: 'greenhouse', position: { x: -25, y: 0, z: 15 }, rotation: -Math.PI / 6 },
      { type: 'power', position: { x: 10, y: 0, z: -30 }, rotation: Math.PI },
      { type: 'connector', position: { x: 15, y: 0, z: 10 }, rotation: Math.PI / 8 }
    ];
  }

  async init() {
    // Import Three.js dynamically
    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js');
      const { OrbitControls } = await import('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js');
      const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js');
      const { DRACOLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/DRACOLoader.js');
      
      this.THREE = THREE;
      this.OrbitControls = OrbitControls;
      this.GLTFLoader = GLTFLoader;
      this.DRACOLoader = DRACOLoader;
      
      // Get container element
      this.container = document.getElementById(this.containerId);
      if (!this.container) {
        console.error(`Container with ID "${this.containerId}" not found.`);
        return false;
      }
      
      // Initialize scene
      this.initScene();
      
      // Add lighting
      this.addLighting();
      
      // Create Mars terrain
      await this.createMarsTerrain();
      
      // Load initial modules
      await this.loadInitialModules();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Start animation loop
      this.animate();
      
      // Add UI controls
      this.addUIControls();
      
      return true;
    } catch (error) {
      console.error('Error initializing Mars Base Model:', error);
      return false;
    }
  }

  initScene() {
    const { THREE } = this;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111122); // Dark blue space background
    
    // Add fog for atmosphere
    this.scene.fog = new THREE.FogExp2(0xAA7744, 0.002);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(50, 40, 70);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    
    // Add orbit controls
    this.controls = new this.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 200;
    this.controls.maxPolarAngle = Math.PI / 2;
    
    // Initialize raycaster and mouse vector for selection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  addLighting() {
    const { THREE } = this;
    
    // Ambient light for overall scene
    const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sunlight)
    const sunLight = new THREE.DirectionalLight(0xFFFFAA, 1.0);
    sunLight.position.set(50, 80, 50);
    sunLight.castShadow = true;
    
    // Configure shadow properties
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    
    this.scene.add(sunLight);
    
    // Hemisphere light (for better ambient lighting based on sky/ground)
    const hemisphereLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.6);
    this.scene.add(hemisphereLight);
  }

  async createMarsTerrain() {
    const { THREE } = this;
    
    // Load Mars texture
    const textureLoader = new THREE.TextureLoader();
    this.marsTexture = await new Promise(resolve => {
      textureLoader.load(
        '/models/mars_texture.jpg',
        texture => resolve(texture),
        undefined,
        error => {
          console.error('Error loading Mars texture:', error);
          resolve(null);
        }
      );
    });
    
    // Create a backup basic material in case texture doesn't load
    const material = this.marsTexture 
      ? new THREE.MeshStandardMaterial({ 
          map: this.marsTexture, 
          bumpMap: this.marsTexture,
          bumpScale: 0.5,
          roughness: 0.8,
          metalness: 0.1
        })
      : new THREE.MeshStandardMaterial({ 
          color: 0xBB5533, 
          roughness: 0.9,
          metalness: 0.1
        });
    
    // Create Mars terrain
    const geometry = new THREE.PlaneGeometry(500, 500, 64, 64);
    
    // Add some random elevation to the terrain
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      // Don't elevate the center area where the base will be
      const x = vertices[i];
      const z = vertices[i + 2];
      const distFromCenter = Math.sqrt(x * x + z * z);
      
      if (distFromCenter > 30) {
        // More elevation as we get further from center
        const elevationFactor = Math.min(1.0, (distFromCenter - 30) / 100);
        vertices[i + 1] = (Math.random() * 8 - 4) * elevationFactor;
      }
    }
    
    // Update geometry
    geometry.computeVertexNormals();
    
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.rotation.x = -Math.PI / 2; // Rotate to horizontal
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);
    
    // Add stars in the background
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    
    for (let i = 0; i < 5000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      
      // Don't place stars too close to the scene center
      if (Math.abs(x) < 300 && Math.abs(y) < 300 && Math.abs(z) < 300) continue;
      
      starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.7 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
  }

  async loadInitialModules() {
    // Load each initial module
    for (const moduleData of this.initialModules) {
      await this.addModule(moduleData.type, moduleData.position, moduleData.rotation);
    }
  }

  async addModule(moduleType, position, rotation = 0) {
    const { THREE } = this;
    const moduleTypeData = this.moduleTypes.find(type => type.id === moduleType);
    
    if (!moduleTypeData) {
      console.error(`Module type "${moduleType}" not found.`);
      return null;
    }
    
    // For now, create a simple box as placeholder for the module
    // In a real implementation, we would load the GLTF model
    const geometry = new THREE.BoxGeometry(10, 5, 15);
    const material = new THREE.MeshStandardMaterial({ 
      color: moduleTypeData.color,
      roughness: 0.7,
      metalness: 0.2
    });
    
    // Create module mesh
    const moduleMesh = new THREE.Mesh(geometry, material);
    moduleMesh.position.set(position.x, position.y + 2.5, position.z); // Lift it above ground
    moduleMesh.rotation.y = rotation;
    moduleMesh.castShadow = true;
    moduleMesh.receiveShadow = true;
    
    // Add metadata to the mesh
    moduleMesh.userData = {
      type: moduleType,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: moduleTypeData.name,
      description: moduleTypeData.description,
      isBaseModule: true
    };
    
    // Add to scene and tracking array
    this.scene.add(moduleMesh);
    this.baseModules.push(moduleMesh);
    
    return moduleMesh;
  }

  setupEventListeners() {
    const { THREE } = this;
    const canvas = this.renderer.domElement;
    
    // Mouse move event for hover effects
    canvas.addEventListener('mousemove', event => {
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Only process if we're not dragging
      if (!this.dragEnabled) {
        this.checkModuleHover();
      }
    });
    
    // Click event for selection
    canvas.addEventListener('mousedown', event => {
      if (event.button === 0) { // Left click
        this.handleModuleSelection();
      }
    });
    
    // Drag events
    canvas.addEventListener('mousedown', event => {
      if (event.button === 0 && this.selectedModule) { // Left click and module selected
        this.dragEnabled = true;
        this.controls.enabled = false; // Disable orbit controls while dragging
      }
    });
    
    canvas.addEventListener('mousemove', event => {
      if (this.dragEnabled && this.selectedModule) {
        this.handleModuleDrag();
      }
    });
    
    const endDrag = () => {
      if (this.dragEnabled) {
        this.dragEnabled = false;
        this.controls.enabled = true; // Re-enable orbit controls
      }
    };
    
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('mouseleave', endDrag);
    
    // Key events for rotation and deletion
    document.addEventListener('keydown', event => {
      if (!this.selectedModule) return;
      
      switch (event.key) {
        case 'r': // Rotate module
          this.selectedModule.rotation.y += Math.PI / 8;
          break;
        case 'Delete': // Delete module
          if (this.selectedModule) {
            this.removeModule(this.selectedModule);
          }
          break;
      }
    });
  }

  checkModuleHover() {
    const { THREE } = this;
    
    // Update the raycaster with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Find intersections with base modules
    const intersects = this.raycaster.intersectObjects(this.baseModules);
    
    // Reset all module materials
    this.baseModules.forEach(module => {
      if (module !== this.selectedModule) {
        module.material.emissive.setHex(0x000000);
      }
    });
    
    // If hovering over a module, highlight it
    if (intersects.length > 0) {
      const hoveredModule = intersects[0].object;
      if (hoveredModule !== this.selectedModule) {
        hoveredModule.material.emissive.setHex(0x444444);
      }
      
      // Show tooltip with module info
      this.showModuleTooltip(hoveredModule, intersects[0].point);
    } else {
      // Hide tooltip if not hovering over any module
      this.hideModuleTooltip();
    }
  }

  handleModuleSelection() {
    // Update the raycaster with camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Find intersections with base modules
    const intersects = this.raycaster.intersectObjects(this.baseModules);
    
    // Reset previously selected module
    if (this.selectedModule) {
      this.selectedModule.material.emissive.setHex(0x000000);
    }
    
    // If clicking on a module, select it
    if (intersects.length > 0) {
      this.selectedModule = intersects[0].object;
      this.selectedModule.material.emissive.setHex(0x00FF00);
      
      // Update UI to show selected module info
      this.updateModuleInfoUI(this.selectedModule);
    } else {
      this.selectedModule = null;
      this.clearModuleInfoUI();
    }
  }

  handleModuleDrag() {
    // Update the raycaster with camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Find intersection with Mars terrain
    const intersects = this.raycaster.intersectObject(this.terrain);
    
    if (intersects.length > 0) {
      // Move selected module to intersection point
      const point = intersects[0].point;
      this.selectedModule.position.x = point.x;
      this.selectedModule.position.z = point.z;
      
      // Keep the module above the terrain surface
      this.selectedModule.position.y = 2.5; // Half the height of module
    }
  }

  removeModule(module) {
    // Remove from scene
    this.scene.remove(module);
    
    // Remove from tracking array
    const index = this.baseModules.indexOf(module);
    if (index !== -1) {
      this.baseModules.splice(index, 1);
    }
    
    // Clear selection
    this.selectedModule = null;
    this.clearModuleInfoUI();
  }

  showModuleTooltip(module, position) {
    // Implementation will depend on your UI system
    // This is a placeholder for custom tooltip implementation
    const tooltip = document.getElementById('module-tooltip');
    if (tooltip) {
      tooltip.textContent = module.userData.name;
      
      // Position tooltip near the 3D position
      const vector = position.clone().project(this.camera);
      const x = (vector.x * 0.5 + 0.5) * this.container.clientWidth;
      const y = (vector.y * -0.5 + 0.5) * this.container.clientHeight;
      
      tooltip.style.display = 'block';
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    }
  }

  hideModuleTooltip() {
    // Implementation will depend on your UI system
    const tooltip = document.getElementById('module-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  updateModuleInfoUI(module) {
    // Implementation will depend on your UI system
    // This is a placeholder for displaying module info in your UI
    const infoPanel = document.getElementById('module-info-panel');
    if (infoPanel) {
      const nameElem = infoPanel.querySelector('.module-name');
      const descElem = infoPanel.querySelector('.module-description');
      
      if (nameElem) nameElem.textContent = module.userData.name;
      if (descElem) descElem.textContent = module.userData.description;
      
      infoPanel.style.display = 'block';
    }
  }

  clearModuleInfoUI() {
    // Implementation will depend on your UI system
    const infoPanel = document.getElementById('module-info-panel');
    if (infoPanel) {
      infoPanel.style.display = 'none';
    }
  }

  addUIControls() {
    // Create module palette for adding new modules
    const palette = document.createElement('div');
    palette.className = 'module-palette';
    
    // Create buttons for each module type
    this.moduleTypes.forEach(moduleType => {
      const button = document.createElement('button');
      button.className = 'module-button';
      button.dataset.moduleType = moduleType.id;
      button.innerHTML = `
        <i class="fas fa-cube"></i>
        <span>${moduleType.name}</span>
      `;
      
      // Add click event to create new module
      button.addEventListener('click', () => {
        // Create new module at a default position
        this.addModule(moduleType.id, { x: 0, y: 0, z: 0 });
      });
      
      palette.appendChild(button);
    });
    
    // Add palette to container
    this.container.appendChild(palette);
    
    // Add tooltip element for module hover
    const tooltip = document.createElement('div');
    tooltip.id = 'module-tooltip';
    tooltip.className = 'module-tooltip';
    this.container.appendChild(tooltip);
    
    // Add info panel for selected module
    const infoPanel = document.createElement('div');
    infoPanel.id = 'module-info-panel';
    infoPanel.className = 'module-info-panel';
    infoPanel.innerHTML = `
      <h3 class="module-name"></h3>
      <p class="module-description"></p>
      <div class="module-controls">
        <button class="rotate-btn" title="Rotate Module (R key)">
          <i class="fas fa-sync-alt"></i>
        </button>
        <button class="delete-btn" title="Delete Module (Delete key)">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    // Add event listeners for buttons
    const rotateBtn = infoPanel.querySelector('.rotate-btn');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        if (this.selectedModule) {
          this.selectedModule.rotation.y += Math.PI / 8;
        }
      });
    }
    
    const deleteBtn = infoPanel.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (this.selectedModule) {
          this.removeModule(this.selectedModule);
        }
      });
    }
    
    this.container.appendChild(infoPanel);
    
    // Hide info panel initially
    infoPanel.style.display = 'none';
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Update controls
    this.controls.update();
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  // Export base design as JSON
  exportBaseDesign() {
    const design = {
      modules: this.baseModules.map(module => ({
        type: module.userData.type,
        id: module.userData.id,
        position: {
          x: module.position.x,
          y: module.position.y,
          z: module.position.z
        },
        rotation: module.rotation.y
      })),
      name: document.getElementById('base-name')?.value || 'Mars Base Alpha',
      creator: document.getElementById('base-creator')?.value || 'Anonymous',
      created: new Date().toISOString()
    };
    
    return design;
  }

  // Import base design from JSON
  importBaseDesign(design) {
    // Clear existing modules
    this.baseModules.forEach(module => {
      this.scene.remove(module);
    });
    this.baseModules = [];
    
    // Add modules from design
    design.modules.forEach(moduleData => {
      this.addModule(
        moduleData.type,
        moduleData.position,
        moduleData.rotation
      );
    });
    
    // Update UI elements if they exist
    if (document.getElementById('base-name')) {
      document.getElementById('base-name').value = design.name;
    }
    
    if (document.getElementById('base-creator')) {
      document.getElementById('base-creator').value = design.creator;
    }
  }
}

export default MarsBaseModel;
