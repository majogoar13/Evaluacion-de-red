// --- THREE.JS BACKGROUND (Gas flow simulation) ---
function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles representing gas molecules
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800; // number of gas particles
    
    const posArray = new Float32Array(particlesCount * 3);
    const speedArray = new Float32Array(particlesCount);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
        // x, y, z positions distributed in space
        posArray[i] = (Math.random() - 0.5) * 150;     // x
        posArray[i+1] = (Math.random() - 0.5) * 150;   // y
        posArray[i+2] = (Math.random() - 0.5) * 100;   // z
        
        // Random upward speed for gas
        speedArray[i/3] = Math.random() * 0.05 + 0.01;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Shader or simple points material with blue/cyan tint
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.5,
        color: 0x06b6d4, // Tailwind cyan
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Move particles upwards (like gas)
        const positions = particlesGeometry.attributes.position.array;
        for(let i = 1; i < particlesCount * 3; i+=3) {
            positions[i] += speedArray[Math.floor(i/3)];
            
            // Subtle horizontal drift
            positions[i-1] += Math.sin(elapsedTime * 0.5 + positions[i]) * 0.01;
            
            // Reset particle when it goes too high
            if (positions[i] > 75) {
                positions[i] = -75;
                positions[i-1] = (Math.random() - 0.5) * 150;
            }
        }
        particlesGeometry.attributes.position.needsUpdate = true;

        // Subtle camera movement based on mouse
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    
    animate();
}

// --- GSAP & ANIME.JS ANIMATIONS ---
function initAnimations() {
    // Reveal main content on load
    gsap.from(".page-content", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out"
    });

    // Highlight active link
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        // Handle root index / matches or exact path matches
        if (href === currentPath || (currentPath.endsWith('/') && href.endsWith('index.html')) || (currentPath.includes(href) && href !== '/')) {
            // Very basic matching, might need refine for subdirs
            link.classList.add('active');
        }
    });

    // Anime.js to stagger list items if present
    const listItems = document.querySelectorAll('.prose-brand ul li');
    if(listItems.length > 0) {
        anime({
            targets: listItems,
            translateX: [-20, 0],
            opacity: [0, 1],
            delay: anime.stagger(100, {start: 300}),
            easing: 'easeOutQuad',
            duration: 800
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initAnimations();
});
