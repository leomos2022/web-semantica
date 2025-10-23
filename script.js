// ============================================
// FinFlow Intelligence - JavaScript Interactivo
// ============================================

// Configuración global
const CONFIG = {
    animations: {
        duration: 2000,
        easing: 'easeInOutCubic'
    },
    neural: {
        nodes: 50,
        connections: 30,
        learningRate: 0.01
    },
    simulation: {
        processTime: 1500,
        inferenceSteps: 8
    }
};

// Variables globales
let scene, camera, renderer, neuralNetwork, animationId;
let isAnimating = false;
let currentEpoch = 0;
let currentError = 1.0;
let accuracyChart, timeChart;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función principal de inicialización
function initializeApp() {
    setTimeout(() => {
        hideLoader();
        initializeNavigation();
        initializeHeroBackground();
        initializeScrollAnimations();
        initializeBackpropagationViz();
        initializeArchitectureViz();
        initializeSimulation();
        initializeCharts();
        initializeMathJax();
    }, 2000);
}

// ============================================
// LOADER Y NAVEGACIÓN
// ============================================

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle del menú hamburguesa
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Navegación suave
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Cerrar menú móvil
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Activar enlace basado en scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ============================================
// HERO BACKGROUND CON THREE.JS
// ============================================

function initializeHeroBackground() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    // Configuración de Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    // Crear red neuronal de fondo
    createNeuralNetworkBackground();
    
    // Posicionar cámara
    camera.position.z = 50;

    // Iniciar animación
    animateBackground();

    // Responsivo
    window.addEventListener('resize', onWindowResize);
}

function createNeuralNetworkBackground() {
    const nodes = [];
    const connections = [];

    // Crear nodos
    for (let i = 0; i < CONFIG.neural.nodes; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6),
            transparent: true,
            opacity: 0.8
        });
        const node = new THREE.Mesh(geometry, material);
        
        node.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40
        );
        
        nodes.push(node);
        scene.add(node);
    }

    // Crear conexiones
    for (let i = 0; i < CONFIG.neural.connections; i++) {
        const startNode = nodes[Math.floor(Math.random() * nodes.length)];
        const endNode = nodes[Math.floor(Math.random() * nodes.length)];
        
        if (startNode !== endNode) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array([
                startNode.position.x, startNode.position.y, startNode.position.z,
                endNode.position.x, endNode.position.y, endNode.position.z
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.LineBasicMaterial({
                color: 0x667eea,
                transparent: true,
                opacity: 0.3
            });
            
            const line = new THREE.Line(geometry, material);
            connections.push(line);
            scene.add(line);
        }
    }

    // Guardar referencias
    scene.userData.nodes = nodes;
    scene.userData.connections = connections;
}

function animateBackground() {
    animationId = requestAnimationFrame(animateBackground);

    // Animar nodos
    if (scene.userData.nodes) {
        scene.userData.nodes.forEach((node, index) => {
            node.rotation.x += 0.01;
            node.rotation.y += 0.01;
            
            // Movimiento ondulatorio
            node.position.y += Math.sin(Date.now() * 0.001 + index) * 0.02;
            
            // Pulso de opacidad
            node.material.opacity = 0.5 + Math.sin(Date.now() * 0.003 + index) * 0.3;
        });
    }

    // Animar conexiones
    if (scene.userData.connections) {
        scene.userData.connections.forEach((connection, index) => {
            connection.material.opacity = 0.1 + Math.sin(Date.now() * 0.002 + index) * 0.2;
        });
    }

    // Rotar cámara ligeramente
    camera.position.x = Math.sin(Date.now() * 0.0005) * 5;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

function onWindowResize() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas || !camera || !renderer) return;

    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

// ============================================
// ANIMACIONES DE SCROLL
// ============================================

function initializeScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animaciones específicas por elemento
                if (entry.target.classList.contains('content-card')) {
                    animateContentCard(entry.target);
                } else if (entry.target.classList.contains('semantic-card')) {
                    animateSemanticCard(entry.target);
                } else if (entry.target.classList.contains('step')) {
                    animateStep(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observar elementos animables
    document.querySelectorAll('.content-card, .semantic-card, .step, .problem-item, .ontology-card, .result-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

function animateContentCard(card) {
    card.style.animation = 'fadeInUp 0.6s ease forwards';
}

function animateSemanticCard(card) {
    card.style.animation = 'slideInLeft 0.6s ease forwards';
}

function animateStep(step) {
    step.style.animation = 'slideInRight 0.6s ease forwards';
}

// ============================================
// VISUALIZACIÓN BACKPROPAGATION 3D
// ============================================

function initializeBackpropagationViz() {
    const container = document.getElementById('backprop-viz');
    if (!container) return;

    // Configurar Three.js para backpropagation
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x0f0f23);
    container.appendChild(renderer.domElement);
    
    // Guardar referencia a la escena en el contenedor
    container.__threeScene = scene;

    // Crear red neuronal 3D
    const network = createNeuralNetwork3D(scene);
    
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    // Controles de animación
    setupBackpropControls(network, scene, camera, renderer);
    
    // Iluminación mejorada
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Luz principal
    const mainLight = new THREE.DirectionalLight(0x667eea, 0.8);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);
    
    // Luces de acento
    const accentLight1 = new THREE.PointLight(0x4ecdc4, 0.6, 50);
    accentLight1.position.set(-10, 5, 5);
    scene.add(accentLight1);
    
    const accentLight2 = new THREE.PointLight(0xff6b6b, 0.6, 50);
    accentLight2.position.set(10, -5, -5);
    scene.add(accentLight2);
    
    // Luz de relleno
    const fillLight = new THREE.HemisphereLight(0x667eea, 0x4ecdc4, 0.3);
    scene.add(fillLight);
    
    // Agregar partículas de fondo
    createBackgroundParticles(scene);

    // Render loop mejorado
    function animate() {
        requestAnimationFrame(animate);
        
        // Siempre actualizar animación básica
        updateNetworkAnimation(network);
        
        // Rotación sutil de la cámara
        if (!isAnimating) {
            camera.position.x = Math.sin(Date.now() * 0.0003) * 2;
            camera.position.y = Math.cos(Date.now() * 0.0002) * 1;
            camera.lookAt(0, 0, 0);
        }
        
        renderer.render(scene, camera);
    }
    animate();

    // Responsivo
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function createBackgroundParticles(scene) {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        
        const color = new THREE.Color();
        color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Animar partículas
    scene.userData.backgroundParticles = particles;
}

function createNeuralNetwork3D(scene) {
    const network = {
        layers: [],
        connections: [],
        signals: [],
        particles: [],
        errorParticles: []
    };

    const layerSizes = [5, 8, 8, 4]; // Red más grande
    const layerSpacing = 8; // Más espaciado
    const nodeSpacing = 2.5; // Nodos más separados

    // Crear capas
    layerSizes.forEach((size, layerIndex) => {
        const layer = [];
        const startY = -(size - 1) * nodeSpacing / 2;
        
        for (let i = 0; i < size; i++) {
            // Geometría del nodo más grande y detallada
            const geometry = new THREE.SphereGeometry(0.4, 32, 32);
            const material = new THREE.MeshLambertMaterial({
                color: layerIndex === 0 ? 0x4ecdc4 : 
                       layerIndex === layerSizes.length - 1 ? 0xff6b6b : 0x667eea,
                transparent: true,
                opacity: 0.9,
                emissive: layerIndex === 0 ? 0x0a3330 : 
                          layerIndex === layerSizes.length - 1 ? 0x331a1a : 0x1a1f3a
            });
            
            const node = new THREE.Mesh(geometry, material);
            node.position.set(
                (layerIndex - layerSizes.length / 2 + 0.5) * layerSpacing,
                startY + i * nodeSpacing,
                0
            );
            
            // Añadir etiqueta
            const label = createNodeLabel(layerIndex === 0 ? 'Input' : 
                                        layerIndex === layerSizes.length - 1 ? 'Output' : 'Hidden');
            label.position.copy(node.position);
            label.position.y += 0.8;
            
            layer.push({ mesh: node, label: label, activation: 0 });
            scene.add(node);
            scene.add(label);
        }
        
        network.layers.push(layer);
    });

    // Crear conexiones
    for (let l = 0; l < network.layers.length - 1; l++) {
        const currentLayer = network.layers[l];
        const nextLayer = network.layers[l + 1];
        
        currentLayer.forEach(currentNode => {
            nextLayer.forEach(nextNode => {
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array([
                    currentNode.mesh.position.x, currentNode.mesh.position.y, currentNode.mesh.position.z,
                    nextNode.mesh.position.x, nextNode.mesh.position.y, nextNode.mesh.position.z
                ]);
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                
                const material = new THREE.LineBasicMaterial({
                    color: 0x667eea,
                    transparent: true,
                    opacity: 0.4,
                    linewidth: 2
                });
                
                const connection = new THREE.Line(geometry, material);
                network.connections.push({
                    line: connection,
                    weight: Math.random() * 2 - 1,
                    from: currentNode,
                    to: nextNode
                });
                scene.add(connection);
            });
        });
    }

    return network;
}

function createNodeLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 32;
    
    context.fillStyle = '#ffffff';
    context.font = '16px Inter, sans-serif';
    context.textAlign = 'center';
    context.fillText(text, 64, 20);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 0.5, 1);
    
    return sprite;
}

function setupBackpropControls(network, scene, camera, renderer) {
    const playBtn = document.getElementById('play-animation');
    const pauseBtn = document.getElementById('pause-animation');
    const resetBtn = document.getElementById('reset-animation');
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            isAnimating = true;
            startBackpropAnimation(network);
            updateAnimationStatus('Entrenando red neuronal...');
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            isAnimating = false;
            updateAnimationStatus('Animación pausada');
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            isAnimating = false;
            resetNetworkAnimation(network);
            currentEpoch = 0;
            currentError = 1.0;
            updateMetrics();
            updateAnimationStatus('Red neuronal reiniciada');
        });
    }
    
    // Efectos especiales durante la simulación
    function createNeuralStorm() {
        if (!isAnimating) return;
        
        // Generar múltiples pulsos simultáneos
        network.connections.forEach((conn, index) => {
            if (Math.random() < 0.3) {
                setTimeout(() => {
                    createConnectionPulse(conn);
                }, Math.random() * 1000);
            }
        });
        
        // Destellos coordinados en nodos activos
        network.layers.forEach((layer, layerIndex) => {
            layer.forEach((node, nodeIndex) => {
                if (Math.random() < 0.2) {
                    setTimeout(() => {
                        createNodeFlash(node.mesh.position, new THREE.Color().setHSL(Math.random(), 0.8, 0.6));
                    }, Math.random() * 500);
                }
            });
        });
        
        // Programar próxima tormenta neuronal
        if (isAnimating) {
            setTimeout(createNeuralStorm, 2000 + Math.random() * 3000);
        }
    }
    
    // Iniciar efectos especiales cuando comience la animación
    if (playBtn) {
        const originalClickHandler = playBtn.onclick;
        playBtn.addEventListener('click', () => {
            setTimeout(createNeuralStorm, 1000);
        });
    }
}

function startBackpropAnimation(network) {
    // Crear partículas de datos
    createDataParticles(network);
    
    // Simular forward pass con animación fluida
    setTimeout(() => {
        animateForwardPass(network);
    }, 500);
    
    // Simular backward pass
    setTimeout(() => {
        animateBackwardPass(network);
    }, 2500);
    
    // Actualizar métricas y continuar animación
    setTimeout(() => {
        currentEpoch++;
        currentError = Math.max(0.01, currentError * 0.95);
        updateMetrics();
        
        // Repetir animación si sigue activa
        if (isAnimating) {
            setTimeout(() => startBackpropAnimation(network), 1000);
        }
    }, 4500);
}

function createDataParticles(network) {
    if (!network.particles) {
        network.particles = [];
    }
    
    // Limpiar partículas anteriores
    network.particles.forEach(particle => {
        if (particle.parent) {
            particle.parent.remove(particle);
        }
    });
    network.particles = [];
    
    // Crear nuevas partículas de datos
    for (let i = 0; i < 5; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.1 + i * 0.15, 1, 0.5),
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(geometry, material);
        
        // Posición inicial en la primera capa
        const firstLayer = network.layers[0];
        const startNode = firstLayer[i % firstLayer.length];
        particle.position.copy(startNode.mesh.position);
        particle.position.x -= 2;
        
        particle.userData = {
            speed: 0.05 + Math.random() * 0.03,
            currentLayer: 0,
            targetNode: startNode,
            isActive: true
        };
        
        network.particles.push(particle);
        startNode.mesh.parent.add(particle);
    }
}

function animateForwardPass(network) {
    updateAnimationStatus('Forward Pass - Propagando señales de datos...');
    
    // Animar partículas moviéndose a través de la red
    animateDataFlow(network, 'forward');
    
    network.layers.forEach((layer, layerIndex) => {
        setTimeout(() => {
            layer.forEach((node, nodeIndex) => {
                // Efecto de pulso más dramático
                const pulseIntensity = 0.3 + Math.random() * 0.4;
                node.mesh.material.emissive.setHex(0x00ff00);
                node.mesh.scale.setScalar(1 + pulseIntensity);
                node.activation = Math.random();
                
                // Crear ondas de energía
                createEnergyWave(node.mesh.position, 0x00ff00);
                
                // Animar conexiones salientes con efecto de flujo
                network.connections
                    .filter(conn => conn.from === node)
                    .forEach((conn, connIndex) => {
                        setTimeout(() => {
                            animateConnectionFlow(conn, 0x00ff00);
                        }, connIndex * 50);
                    });
                
                // Resetear con animación suave
                setTimeout(() => {
                    animateNodeReset(node, network);
                }, 800 + Math.random() * 400);
            });
        }, layerIndex * 300);
    });
}

function animateDataFlow(network, direction) {
    if (!network.particles) return;
    
    network.particles.forEach((particle, index) => {
        if (!particle.userData.isActive) return;
        
        setTimeout(() => {
            moveParticleThroughNetwork(particle, network, direction);
        }, index * 100);
    });
}

function moveParticleThroughNetwork(particle, network, direction) {
    const layers = direction === 'forward' ? network.layers : [...network.layers].reverse();
    let currentLayerIndex = particle.userData.currentLayer;
    
    if (currentLayerIndex >= layers.length - 1) {
        particle.userData.isActive = false;
        particle.visible = false;
        return;
    }
    
    const nextLayer = layers[currentLayerIndex + 1];
    const targetNode = nextLayer[Math.floor(Math.random() * nextLayer.length)];
    
    // Animar movimiento suave hacia el siguiente nodo
    animateParticleMovement(particle, targetNode.mesh.position, () => {
        particle.userData.currentLayer++;
        particle.userData.targetNode = targetNode;
        
        // Continuar al siguiente nodo
        setTimeout(() => {
            if (particle.userData.isActive) {
                moveParticleThroughNetwork(particle, network, direction);
            }
        }, 200);
    });
}

function animateParticleMovement(particle, targetPosition, onComplete) {
    const startPosition = particle.position.clone();
    const distance = startPosition.distanceTo(targetPosition);
    const duration = 800;
    const startTime = Date.now();
    
    function updatePosition() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Curva de Bezier para movimiento suave
        const t = easeInOutCubic(progress);
        const currentPos = new THREE.Vector3().lerpVectors(startPosition, targetPosition, t);
        
        // Agregar movimiento ondulatorio
        currentPos.y += Math.sin(progress * Math.PI * 2) * 0.2;
        currentPos.z += Math.sin(progress * Math.PI * 4) * 0.1;
        
        particle.position.copy(currentPos);
        
        // Efecto de rastro
        particle.material.opacity = 0.8 - (progress * 0.3);
        particle.scale.setScalar(1 + Math.sin(progress * Math.PI) * 0.3);
        
        if (progress < 1) {
            requestAnimationFrame(updatePosition);
        } else {
            onComplete();
        }
    }
    
    updatePosition();
}

function createEnergyWave(position, color) {
    const geometry = new THREE.RingGeometry(0, 0.1, 16);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const wave = new THREE.Mesh(geometry, material);
    wave.position.copy(position);
    
    // Agregar a la escena (necesitarás acceso a la escena)
    const scene = wave.parent || document.querySelector('#backprop-viz').__threeScene;
    if (scene) scene.add(wave);
    
    // Animar expansión de la onda
    let scale = 0;
    const maxScale = 2;
    const expandWave = () => {
        scale += 0.1;
        wave.scale.setScalar(scale);
        wave.material.opacity = 0.6 * (1 - scale / maxScale);
        
        if (scale < maxScale) {
            requestAnimationFrame(expandWave);
        } else {
            if (scene) scene.remove(wave);
        }
    };
    expandWave();
}

function animateConnectionFlow(connection, color) {
    // Crear efecto de flujo a lo largo de la conexión
    const originalColor = connection.line.material.color.getHex();
    const originalOpacity = connection.line.material.opacity;
    
    connection.line.material.color.setHex(color);
    connection.line.material.opacity = 1.0;
    
    // Animar grosor de línea simulado con opacity
    let phase = 0;
    const animateFlow = () => {
        phase += 0.2;
        const pulse = Math.sin(phase) * 0.3 + 0.7;
        connection.line.material.opacity = pulse;
        
        if (phase < Math.PI * 4) {
            requestAnimationFrame(animateFlow);
        } else {
            connection.line.material.color.setHex(originalColor);
            connection.line.material.opacity = originalOpacity;
        }
    };
    animateFlow();
}

function animateNodeReset(node, network) {
    // Animación suave de regreso al estado normal
    let scale = node.mesh.scale.x;
    const targetScale = 1;
    
    const resetAnimation = () => {
        scale = THREE.MathUtils.lerp(scale, targetScale, 0.1);
        node.mesh.scale.setScalar(scale);
        node.mesh.material.emissive.lerpColors(
            node.mesh.material.emissive, 
            new THREE.Color(0x000000), 
            0.1
        );
        
        if (Math.abs(scale - targetScale) > 0.01) {
            requestAnimationFrame(resetAnimation);
        }
    };
    resetAnimation();
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateBackwardPass(network) {
    updateAnimationStatus('Backward Pass - Retropropagando errores y actualizando pesos...');
    
    // Crear partículas de error que van hacia atrás
    createErrorParticles(network);
    
    // Animar desde la última capa hacia la primera
    for (let l = network.layers.length - 1; l >= 0; l--) {
        setTimeout(() => {
            network.layers[l].forEach((node, nodeIndex) => {
                // Efecto de error con color naranja/rojo
                const errorIntensity = 0.4 + Math.random() * 0.3;
                node.mesh.material.emissive.setHex(0xff4500);
                node.mesh.scale.setScalar(1 + errorIntensity);
                
                // Crear ondas de error
                createEnergyWave(node.mesh.position, 0xff4500);
                
                // Animar conexiones entrantes con actualización de pesos
                network.connections
                    .filter(conn => conn.to === node)
                    .forEach((conn, connIndex) => {
                        setTimeout(() => {
                            animateWeightUpdate(conn);
                        }, connIndex * 30);
                    });
                
                // Mostrar cambio de peso visualmente
                setTimeout(() => {
                    showWeightChange(node);
                }, 400);
                
                // Resetear con animación
                setTimeout(() => {
                    animateNodeReset(node, network);
                }, 600 + Math.random() * 200);
            });
        }, (network.layers.length - 1 - l) * 250);
    }
}

function createErrorParticles(network) {
    if (!network.errorParticles) {
        network.errorParticles = [];
    }
    
    // Limpiar partículas anteriores
    network.errorParticles.forEach(particle => {
        if (particle.parent) {
            particle.parent.remove(particle);
        }
    });
    network.errorParticles = [];
    
    // Crear partículas de error desde la última capa
    const lastLayer = network.layers[network.layers.length - 1];
    for (let i = 0; i < lastLayer.length; i++) {
        const geometry = new THREE.SphereGeometry(0.03, 6, 6);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            transparent: true,
            opacity: 0.9
        });
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.copy(lastLayer[i].mesh.position);
        particle.position.x += 1;
        
        particle.userData = {
            speed: 0.04,
            currentLayer: network.layers.length - 1,
            direction: -1, // Moverse hacia atrás
            isActive: true
        };
        
        network.errorParticles.push(particle);
        lastLayer[i].mesh.parent.add(particle);
        
        // Animar partícula hacia atrás
        setTimeout(() => {
            moveErrorParticle(particle, network);
        }, i * 80);
    }
}

function moveErrorParticle(particle, network) {
    if (!particle.userData.isActive || particle.userData.currentLayer <= 0) {
        particle.userData.isActive = false;
        particle.visible = false;
        return;
    }
    
    const currentLayer = network.layers[particle.userData.currentLayer];
    const previousLayer = network.layers[particle.userData.currentLayer - 1];
    const targetNode = previousLayer[Math.floor(Math.random() * previousLayer.length)];
    
    animateParticleMovement(particle, targetNode.mesh.position, () => {
        particle.userData.currentLayer--;
        
        // Continuar hacia la capa anterior
        setTimeout(() => {
            if (particle.userData.isActive) {
                moveErrorParticle(particle, network);
            }
        }, 150);
    });
}

function animateWeightUpdate(connection) {
    // Simular actualización de peso con efecto visual
    const oldWeight = connection.weight;
    connection.weight += (Math.random() - 0.5) * CONFIG.neural.learningRate * 2;
    
    // Efecto visual del cambio de peso
    const colorIntensity = Math.abs(connection.weight - oldWeight) * 50;
    const weightColor = connection.weight > oldWeight ? 0x00ff00 : 0xff0000;
    
    connection.line.material.color.setHex(weightColor);
    connection.line.material.opacity = Math.min(1.0, 0.5 + colorIntensity);
    
    // Crear pequeña explosión en el punto medio de la conexión
    const midPoint = new THREE.Vector3().lerpVectors(
        new THREE.Vector3().setFromMatrixPosition(connection.from.mesh.matrixWorld),
        new THREE.Vector3().setFromMatrixPosition(connection.to.mesh.matrixWorld),
        0.5
    );
    
    createWeightUpdateEffect(midPoint, weightColor);
    
    // Gradualmente volver al color normal
    setTimeout(() => {
        let opacity = connection.line.material.opacity;
        const fadeOut = () => {
            opacity = THREE.MathUtils.lerp(opacity, 0.3, 0.05);
            connection.line.material.opacity = opacity;
            connection.line.material.color.lerp(new THREE.Color(0x667eea), 0.05);
            
            if (opacity > 0.31) {
                requestAnimationFrame(fadeOut);
            }
        };
        fadeOut();
    }, 300);
}

function createWeightUpdateEffect(position, color) {
    const geometry = new THREE.SphereGeometry(0.02, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1
    });
    const effect = new THREE.Mesh(geometry, material);
    effect.position.copy(position);
    
    // Agregar a la escena
    const scene = effect.parent || document.querySelector('#backprop-viz').__threeScene;
    if (scene) scene.add(effect);
    
    // Animar explosión pequeña
    let scale = 0;
    const maxScale = 0.5;
    const explode = () => {
        scale += 0.05;
        effect.scale.setScalar(scale);
        effect.material.opacity = 1 - (scale / maxScale);
        
        if (scale < maxScale) {
            requestAnimationFrame(explode);
        } else {
            if (scene) scene.remove(effect);
        }
    };
    explode();
}

function showWeightChange(node) {
    // Mostrar texto flotante indicando cambio de peso
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 32;
    
    context.fillStyle = '#ff4500';
    context.font = 'bold 12px Arial';
    context.textAlign = 'center';
    context.fillText('Δw', 32, 20);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        opacity: 1
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.5, 0.25, 1);
    sprite.position.copy(node.mesh.position);
    sprite.position.y += 0.5;
    
    node.mesh.parent.add(sprite);
    
    // Animar texto flotante hacia arriba y desvanecer
    let yOffset = 0;
    let opacity = 1;
    const floatUp = () => {
        yOffset += 0.02;
        opacity -= 0.03;
        sprite.position.y = node.mesh.position.y + 0.5 + yOffset;
        sprite.material.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(floatUp);
        } else {
            node.mesh.parent.remove(sprite);
        }
    };
    floatUp();
}

function updateNetworkAnimation(network) {
    const time = Date.now() * 0.001;
    
    // Animar partículas de fondo
    if (network.scene && network.scene.userData.backgroundParticles) {
        const particles = network.scene.userData.backgroundParticles;
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;
        
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + i) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Respiración y efectos dramáticos de los nodos
    network.layers.forEach((layer, layerIndex) => {
        layer.forEach((node, nodeIndex) => {
            // Respiración más pronunciada
            const breathe = 1 + Math.sin(time * 3 + nodeIndex * 0.8) * 0.15;
            
            // Activación basada en la simulación
            const activation = node.activation || Math.random() * 0.3;
            const activationScale = 1 + activation * 0.4;
            
            // Efecto de capa más dinámico
            const layerPhase = Math.sin(time * 1.5 + layerIndex * 2) * 0.1;
            
            node.mesh.scale.setScalar(breathe * activationScale + layerPhase);
            
            // Efectos de brillo más dramáticos
            const baseEmissive = layerIndex === 0 ? 0x0a3330 : 
                                layerIndex === network.layers.length - 1 ? 0x331a1a : 0x1a1f3a;
            
            if (activation > 0.5) {
                const glowIntensity = Math.sin(time * 8 + nodeIndex * 2) * 0.3 + 0.4;
                const emissiveColor = new THREE.Color(baseEmissive);
                emissiveColor.multiplyScalar(glowIntensity);
                node.mesh.material.emissive.copy(emissiveColor);
                
                // Crear destellos ocasionales
                if (Math.random() < 0.005 && !isAnimating) {
                    createNodeFlash(node.mesh.position, node.mesh.material.color);
                }
            } else {
                node.mesh.material.emissive.lerp(new THREE.Color(baseEmissive), 0.05);
            }
            
            // Rotación sutil de nodos
            node.mesh.rotation.y += 0.005;
            node.mesh.rotation.x += 0.003;
        });
    });
    
    // Ondulación más dramática en las conexiones
    network.connections.forEach((conn, index) => {
        const wave = Math.sin(time * 4 + index * 0.5) * 0.3 + 0.5;
        const pulse = Math.sin(time * 2 + index * 0.3) * 0.2 + 0.8;
        conn.line.material.opacity = Math.max(0.3, wave * pulse);
        
        // Color que cambia sutilmente
        const hue = (time * 0.1 + index * 0.1) % 1;
        const color = new THREE.Color().setHSL(0.6 + hue * 0.2, 0.8, 0.6);
        conn.line.material.color.lerp(color, 0.02);
        
        // Efecto de datos fluyendo más frecuente
        if (Math.random() < 0.008 && !isAnimating) {
            createDataPulse(conn);
        }
        
        // Pulsos de energía ocasionales
        if (Math.random() < 0.003) {
            createConnectionPulse(conn);
        }
    });
    
    // Actualizar partículas si existen
    if (network.particles) {
        network.particles.forEach(particle => {
            if (particle.userData.isActive) {
                // Rotación y brillo de partículas
                particle.rotation.y += 0.1;
                particle.rotation.x += 0.05;
                
                const pulse = Math.sin(time * 8) * 0.2 + 0.8;
                particle.material.opacity = pulse;
            }
        });
    }
    
    if (network.errorParticles) {
        network.errorParticles.forEach(particle => {
            if (particle.userData.isActive) {
                particle.rotation.y -= 0.15;
                particle.rotation.z += 0.1;
            }
        });
    }
}

function createDataPulse(connection) {
    // Crear pulso de datos que viaja a lo largo de la conexión
    const geometry = new THREE.SphereGeometry(0.02, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        transparent: true,
        opacity: 0.8
    });
    const pulse = new THREE.Mesh(geometry, material);
    
    // Posición inicial
    const startPos = new THREE.Vector3();
    startPos.setFromMatrixPosition(connection.from.mesh.matrixWorld);
    pulse.position.copy(startPos);
    
    const endPos = new THREE.Vector3();
    endPos.setFromMatrixPosition(connection.to.mesh.matrixWorld);
    
    // Agregar a la escena
    connection.from.mesh.parent.add(pulse);
    
    // Animar a lo largo de la conexión
    let progress = 0;
    const speed = 0.02;
    
    const movePulse = () => {
        progress += speed;
        pulse.position.lerpVectors(startPos, endPos, progress);
        pulse.material.opacity = 0.8 * (1 - progress);
        
        if (progress < 1) {
            requestAnimationFrame(movePulse);
        } else {
            connection.from.mesh.parent.remove(pulse);
        }
    };
    movePulse();
}

function createNodeFlash(position, color) {
    const geometry = new THREE.SphereGeometry(0.6, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const flash = new THREE.Mesh(geometry, material);
    flash.position.copy(position);
    
    // Obtener la escena
    const container = document.getElementById('backprop-viz');
    const scene = container.__threeScene;
    if (scene) scene.add(flash);
    
    // Animar destello
    let scale = 0.1;
    let opacity = 0.8;
    const flashAnimation = () => {
        scale += 0.1;
        opacity -= 0.08;
        flash.scale.setScalar(scale);
        flash.material.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(flashAnimation);
        } else {
            if (scene) scene.remove(flash);
        }
    };
    flashAnimation();
}

function createConnectionPulse(connection) {
    if (!connection || !connection.from || !connection.to) return;
    
    const geometry = new THREE.SphereGeometry(0.08, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.15 + Math.random() * 0.7, 1, 0.7),
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
    });
    const pulse = new THREE.Mesh(geometry, material);
    
    // Posicionar en el nodo de origen
    pulse.position.copy(connection.from.mesh.position);
    
    // Agregar a la escena
    const scene = connection.from.mesh.parent;
    if (scene) scene.add(pulse);
    
    // Animar movimiento del pulso desde origen hasta destino
    let progress = 0;
    const startPos = connection.from.mesh.position.clone();
    const endPos = connection.to.mesh.position.clone();
    
    const pulseAnimation = () => {
        progress += 0.05;
        
        // Interpolar posición
        pulse.position.lerpVectors(startPos, endPos, progress);
        
        // Efecto de escala y opacidad
        const scale = 1 + Math.sin(progress * Math.PI) * 0.5;
        pulse.scale.setScalar(scale);
        pulse.material.opacity = 1 - progress * 0.7;
        
        if (progress < 1) {
            requestAnimationFrame(pulseAnimation);
        } else {
            if (scene) scene.remove(pulse);
        }
    };
    pulseAnimation();
}

function createDataPulse(connection) {
    if (!connection || !connection.from || !connection.to) return;
    
    const geometry = new THREE.RingGeometry(0.02, 0.06, 8);
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.5 + Math.random() * 0.3, 0.9, 0.8),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });
    const dataPulse = new THREE.Mesh(geometry, material);
    
    // Posicionar en el nodo de origen
    dataPulse.position.copy(connection.from.mesh.position);
    
    // Agregar a la escena
    const scene = connection.from.mesh.parent;
    if (scene) scene.add(dataPulse);
    
    // Animar flujo de datos
    let progress = 0;
    const startPos = connection.from.mesh.position.clone();
    const endPos = connection.to.mesh.position.clone();
    
    const dataAnimation = () => {
        progress += 0.08;
        
        // Movimiento suave entre nodos
        dataPulse.position.lerpVectors(startPos, endPos, progress);
        
        // Rotación para efecto visual
        dataPulse.rotation.z += 0.2;
        
        // Efecto de desvanecimiento
        dataPulse.material.opacity = 0.9 * (1 - progress);
        
        if (progress < 1) {
            requestAnimationFrame(dataAnimation);
        } else {
            if (scene) scene.remove(dataPulse);
        }
    };
    dataAnimation();
}

function resetNetworkAnimation(network) {
    network.layers.forEach(layer => {
        layer.forEach(node => {
            node.mesh.material.emissive.setHex(0x000000);
            node.mesh.scale.setScalar(1);
            node.activation = 0;
        });
    });
    
    network.connections.forEach(conn => {
        conn.line.material.opacity = 0.3;
        conn.line.material.color.setHex(0x667eea);
    });
}

function updateAnimationStatus(status) {
    const statusEl = document.getElementById('animation-status');
    if (statusEl) {
        statusEl.textContent = status;
    }
}

function updateMetrics() {
    const epochEl = document.getElementById('epoch');
    const errorEl = document.getElementById('error');
    const accuracyEl = document.getElementById('accuracy');
    
    if (epochEl) epochEl.textContent = currentEpoch;
    if (errorEl) errorEl.textContent = currentError.toFixed(3);
    if (accuracyEl) accuracyEl.textContent = Math.round((1 - currentError) * 100) + '%';
    
    // Efecto visual especial cada 10 épocas
    if (currentEpoch > 0 && currentEpoch % 10 === 0) {
        createEpochCelebration();
    }
}

function createEpochCelebration() {
    const container = document.getElementById('backprop-viz');
    const scene = container.__threeScene;
    if (!scene) return;
    
    // Crear explosión de partículas doradas
    const particleCount = 30;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.08, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.15, 1, 0.8),
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });
        const particle = new THREE.Mesh(geometry, material);
        
        // Posición inicial en el centro
        particle.position.set(0, 0, 0);
        
        // Velocidad aleatoria
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            ),
            life: 1.0
        };
        
        scene.add(particle);
        particles.push(particle);
    }
    
    // Animar partículas de celebración
    function animateCelebration() {
        let stillAlive = false;
        
        particles.forEach(particle => {
            if (particle.userData.life > 0) {
                stillAlive = true;
                
                // Mover partícula
                particle.position.add(particle.userData.velocity);
                
                // Reducir vida y opacidad
                particle.userData.life -= 0.015;
                particle.material.opacity = particle.userData.life;
                
                // Cambiar color gradualmente
                const hue = 0.15 + (1 - particle.userData.life) * 0.4;
                particle.material.color.setHSL(hue, 1, 0.8);
                
                // Aplicar gravedad sutil
                particle.userData.velocity.y -= 0.003;
            }
        });
        
        if (stillAlive) {
            requestAnimationFrame(animateCelebration);
        } else {
            // Limpiar partículas
            particles.forEach(particle => {
                scene.remove(particle);
            });
        }
    }
    
    animateCelebration();
}

// ============================================
// VISUALIZACIÓN DE ARQUITECTURA
// ============================================

function initializeArchitectureViz() {
    const container = document.getElementById('architecture-viz');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x0f0f23, 0.8);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Crear arquitectura del sistema más grande
    const architecture = createSystemArchitecture(scene);
    
    // Agregar iluminación mejorada para el espacio aumentado
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x4ecdc4, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    const pointLight1 = new THREE.PointLight(0x667eea, 0.5, 20);
    pointLight1.position.set(-5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xf093fb, 0.5, 20);
    pointLight2.position.set(5, 5, 5);
    scene.add(pointLight2);
    
    // Ajustar cámara para mejor vista con el espacio aumentado
    camera.position.set(12, 8, 18);
    camera.lookAt(0, 2, 0);

    // Controles de capas
    setupArchitectureControls(architecture, scene);

    // Función de redimensionamiento
    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    // Event listener para redimensionamiento
    window.addEventListener('resize', handleResize);
    
    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        animateArchitecture(architecture);
        renderer.render(scene, camera);
    }
    animate();
}

function createSystemArchitecture(scene) {
    const architecture = {
        layers: {},
        dataFlow: []
    };

    // Definir capas del sistema con posiciones más amplias
    const layers = [
        { name: 'input', color: 0x4ecdc4, position: [-8, 0, 0], label: 'Entrada de Datos' },
        { name: 'processing', color: 0x667eea, position: [-3, 0, 0], label: 'Procesamiento NLP' },
        { name: 'inference', color: 0xf093fb, position: [3, 0, 0], label: 'Motor de Inferencia' },
        { name: 'output', color: 0xff6b6b, position: [8, 0, 0], label: 'Salida Inteligente' }
    ];

    layers.forEach(layerDef => {
        // Crear caja representativa más grande
        const geometry = new THREE.BoxGeometry(2.5, 4, 1.5);
        const material = new THREE.MeshLambertMaterial({
            color: layerDef.color,
            transparent: true,
            opacity: 0.8,
            emissive: new THREE.Color(layerDef.color).multiplyScalar(0.1)
        });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(...layerDef.position);
        box.castShadow = true;
        box.receiveShadow = true;
        
        // Crear etiqueta más grande
        const label = createArchitectureLabel(layerDef.label);
        label.position.set(layerDef.position[0], layerDef.position[1] + 3, layerDef.position[2]);
        label.scale.set(1.5, 1.5, 1.5);
        
        architecture.layers[layerDef.name] = { box, label, visible: true };
        scene.add(box);
        scene.add(label);
    });

    // Crear flujo de datos
    for (let i = 0; i < layers.length - 1; i++) {
        const from = layers[i].position;
        const to = layers[i + 1].position;
        
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(from[0] + 1, from[1], from[2]),
            new THREE.Vector3((from[0] + to[0]) / 2, from[1] + 1, from[2]),
            new THREE.Vector3(to[0] - 1, to[1], to[2])
        );
        
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5
        });
        
        const flow = new THREE.Line(geometry, material);
        architecture.dataFlow.push(flow);
        scene.add(flow);
    }

    return architecture;
}

function createArchitectureLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = '#ffffff';
    context.font = 'bold 20px Inter, sans-serif';
    context.textAlign = 'center';
    context.fillText(text, 128, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 1, 1);
    
    return sprite;
}

function setupArchitectureControls(architecture, scene) {
    const layerButtons = document.querySelectorAll('.layer-btn');
    
    layerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos
            layerButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const layerName = btn.dataset.layer;
            highlightLayer(architecture, layerName);
        });
    });
}

function highlightLayer(architecture, layerName) {
    // Resetear opacidad
    Object.values(architecture.layers).forEach(layer => {
        layer.box.material.opacity = 0.3;
    });
    
    architecture.dataFlow.forEach(flow => {
        flow.material.opacity = 0.2;
    });
    
    // Destacar capa seleccionada
    if (architecture.layers[layerName]) {
        architecture.layers[layerName].box.material.opacity = 1.0;
        architecture.layers[layerName].box.material.emissive.setHex(0x333333);
        
        setTimeout(() => {
            architecture.layers[layerName].box.material.emissive.setHex(0x000000);
        }, 1000);
    }
}

function animateArchitecture(architecture) {
    const time = Date.now() * 0.001;
    
    Object.values(architecture.layers).forEach((layer, index) => {
        layer.box.rotation.y = Math.sin(time + index) * 0.1;
        layer.box.position.y = Math.sin(time * 0.5 + index) * 0.2;
    });
}

// ============================================
// SIMULACIÓN INTERACTIVA
// ============================================

function initializeSimulation() {
    const runBtn = document.getElementById('run-simulation');
    const amountSlider = document.getElementById('amount');
    const amountDisplay = document.getElementById('amount-display');
    
    // Actualizar display del monto
    if (amountSlider && amountDisplay) {
        amountSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            amountDisplay.textContent = `$${value.toLocaleString()}`;
        });
    }
    
    // Ejecutar simulación
    if (runBtn) {
        runBtn.addEventListener('click', runSimulation);
    }
}

async function runSimulation() {
    const requestType = document.getElementById('request-type').value;
    const clientProfile = document.getElementById('client-profile').value;
    const amount = document.getElementById('amount').value;
    
    // Actualizar UI
    updateSimulationUI('running');
    
    // Simular procesamiento
    const results = await processRequest(requestType, clientProfile, amount);
    
    // Mostrar resultados
    displaySimulationResults(results);
    
    // Crear visualización del flujo
    createProcessFlow(results.steps);
    
    updateSimulationUI('completed');
}

async function processRequest(type, profile, amount) {
    const startTime = Date.now();
    
    // Simular pasos de inferencia
    const steps = [
        'Analizando tipo de solicitud...',
        'Evaluando perfil del cliente...',
        'Consultando políticas aplicables...',
        'Aplicando reglas de negocio...',
        'Calculando nivel de riesgo...',
        'Determinando departamento...',
        'Generando respuesta automática...',
        'Proceso completado'
    ];
    
    const inferenceLog = document.getElementById('inference-log');
    
    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (inferenceLog) {
            const logEntry = document.createElement('div');
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${steps[i]}`;
            logEntry.style.color = i === steps.length - 1 ? '#4ecdc4' : '#e2e8f0';
            inferenceLog.appendChild(logEntry);
            inferenceLog.scrollTop = inferenceLog.scrollHeight;
        }
    }
    
    // Calcular resultados basados en inputs
    const processingTime = Date.now() - startTime;
    const decision = calculateDecision(type, profile, amount);
    const department = assignDepartment(type, decision);
    const confidence = calculateConfidence(profile, amount);
    
    return {
        decision,
        department,
        processingTime,
        confidence,
        steps
    };
}

function calculateDecision(type, profile, amount) {
    const decisions = {
        'credito': ['Aprobado', 'Requiere Evaluación', 'Rechazado'],
        'refinanciacion': ['Aprobado', 'Condiciones Especiales', 'Rechazado'],
        'cancelacion': ['Procesado', 'Requiere Confirmación'],
        'reclamo': ['Escalado', 'Resuelto Automáticamente']
    };
    
    const profileWeight = {
        'premium': 0.9,
        'gold': 0.7,
        'silver': 0.5,
        'nuevo': 0.3
    };
    
    const amountFactor = amount > 50000 ? 0.6 : amount > 20000 ? 0.8 : 1.0;
    const score = profileWeight[profile] * amountFactor;
    
    const options = decisions[type];
    const index = score > 0.7 ? 0 : score > 0.4 ? 1 : options.length - 1;
    
    return options[index];
}

function assignDepartment(type, decision) {
    const departments = {
        'credito': decision === 'Aprobado' ? 'Créditos Automáticos' : 'Evaluación Manual',
        'refinanciacion': 'Restructuración',
        'cancelacion': 'Atención al Cliente',
        'reclamo': decision === 'Escalado' ? 'Gerencia de Reclamos' : 'Bot de Respuestas'
    };
    
    return departments[type] || 'Atención General';
}

function calculateConfidence(profile, amount) {
    const baseConfidence = {
        'premium': 95,
        'gold': 85,
        'silver': 70,
        'nuevo': 60
    };
    
    const amountPenalty = amount > 75000 ? 10 : amount > 50000 ? 5 : 0;
    return Math.max(50, baseConfidence[profile] - amountPenalty);
}

function displaySimulationResults(results) {
    document.getElementById('decision-result').textContent = results.decision;
    document.getElementById('department-result').textContent = results.department;
    document.getElementById('time-result').textContent = `${results.processingTime} ms`;
    document.getElementById('confidence-result').textContent = `${results.confidence}%`;
    
    // Actualizar colores basados en resultados
    updateResultCardColors(results);
    
    // Actualizar gráficos
    updateChartsWithResults(results);
}

function updateResultCardColors(results) {
    const decisionCard = document.getElementById('decision-result');
    const confidenceCard = document.getElementById('confidence-result');
    
    // Color de decisión
    if (results.decision.includes('Aprobado') || results.decision.includes('Procesado')) {
        decisionCard.style.backgroundColor = 'rgba(78, 205, 196, 0.2)';
        decisionCard.style.color = '#4ecdc4';
    } else if (results.decision.includes('Requiere') || results.decision.includes('Escalado')) {
        decisionCard.style.backgroundColor = 'rgba(254, 202, 87, 0.2)';
        decisionCard.style.color = '#feca57';
    } else {
        decisionCard.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
        decisionCard.style.color = '#ff6b6b';
    }
    
    // Color de confianza
    if (results.confidence >= 80) {
        confidenceCard.style.backgroundColor = 'rgba(78, 205, 196, 0.2)';
        confidenceCard.style.color = '#4ecdc4';
    } else if (results.confidence >= 60) {
        confidenceCard.style.backgroundColor = 'rgba(254, 202, 87, 0.2)';
        confidenceCard.style.color = '#feca57';
    } else {
        confidenceCard.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
        confidenceCard.style.color = '#ff6b6b';
    }
}

function createProcessFlow(steps) {
    const flowContainer = document.getElementById('process-flow');
    if (!flowContainer) return;
    
    // Limpiar contenido anterior
    flowContainer.innerHTML = '';
    
    // Crear visualización del flujo usando Canvas
    const canvas = document.createElement('canvas');
    canvas.width = flowContainer.clientWidth;
    canvas.height = flowContainer.clientHeight;
    flowContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Animar el flujo
    let currentStep = 0;
    const animateFlow = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar pasos
        steps.forEach((step, index) => {
            const x = 50 + (index % 4) * 150;
            const y = 50 + Math.floor(index / 4) * 100;
            
            // Círculo del paso
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = index <= currentStep ? '#4ecdc4' : '#667eea';
            ctx.fill();
            
            // Número del paso
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(index + 1, x, y + 5);
            
            // Línea de conexión
            if (index < steps.length - 1 && (index % 4) < 3) {
                ctx.beginPath();
                ctx.moveTo(x + 20, y);
                ctx.lineTo(x + 130, y);
                ctx.strokeStyle = index < currentStep ? '#4ecdc4' : '#667eea';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
        
        // Avanzar al siguiente paso
        if (currentStep < steps.length - 1) {
            currentStep++;
            setTimeout(animateFlow, 300);
        }
    };
    
    animateFlow();
}

function updateSimulationUI(state) {
    const runBtn = document.getElementById('run-simulation');
    const inferenceLog = document.getElementById('inference-log');
    
    if (state === 'running') {
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        if (inferenceLog) inferenceLog.innerHTML = '';
    } else if (state === 'completed') {
        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fas fa-play"></i> Ejecutar Simulación';
    }
}

// ============================================
// GRÁFICOS CON CHART.JS
// ============================================

function initializeCharts() {
    createAccuracyChart();
    createProcessingTimeChart();
}

function createAccuracyChart() {
    const ctx = document.getElementById('accuracy-chart');
    if (!ctx) return;
    
    const data = {
        labels: ['Época 1', 'Época 2', 'Época 3', 'Época 4', 'Época 5', 'Época 6'],
        datasets: [{
            label: 'Precisión del Modelo (%)',
            data: [45, 62, 73, 81, 87, 92],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };
    
    accuracyChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolución de la Precisión'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function createProcessingTimeChart() {
    const ctx = document.getElementById('processing-time-chart');
    if (!ctx) return;
    
    const data = {
        labels: ['Crédito', 'Refinanciación', 'Cancelación', 'Reclamo'],
        datasets: [{
            label: 'Tiempo de Procesamiento (ms)',
            data: [245, 180, 95, 320],
            backgroundColor: [
                'rgba(78, 205, 196, 0.8)',
                'rgba(102, 126, 234, 0.8)',
                'rgba(240, 147, 251, 0.8)',
                'rgba(255, 107, 107, 0.8)'
            ],
            borderColor: [
                '#4ecdc4',
                '#667eea',
                '#f093fb',
                '#ff6b6b'
            ],
            borderWidth: 2
        }]
    };
    
    timeChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Tiempo de Procesamiento por Tipo'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + 'ms';
                        }
                    }
                }
            }
        }
    });
}

function updateChartsWithResults(results) {
    // Actualizar gráfico de tiempo con nuevo dato
    if (timeChart && results.processingTime) {
        // Simular actualización con nuevo dato
        const randomIndex = Math.floor(Math.random() * timeChart.data.datasets[0].data.length);
        timeChart.data.datasets[0].data[randomIndex] = results.processingTime;
        timeChart.update();
    }
}

// ============================================
// MATHJAX Y CONTENIDO ACADÉMICO
// ============================================

function initializeMathJax() {
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']]
        },
        svg: {
            fontCache: 'global'
        },
        startup: {
            ready: () => {
                console.log('MathJax está listo');
                MathJax.startup.defaultReady();
            }
        }
    };
}

// ============================================
// UTILIDADES Y HELPERS
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimizar scroll listener
const debouncedScrollHandler = debounce(updateActiveNavLink, 10);
window.addEventListener('scroll', debouncedScrollHandler);

// ============================================
// CLEANUP Y GESTIÓN DE MEMORIA
// ============================================

window.addEventListener('beforeunload', () => {
    // Cancelar animaciones
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Limpiar Three.js
    if (renderer) {
        renderer.dispose();
    }
    
    // Limpiar gráficos
    if (accuracyChart) {
        accuracyChart.destroy();
    }
    if (timeChart) {
        timeChart.destroy();
    }
});

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================

window.scrollToSection = scrollToSection;