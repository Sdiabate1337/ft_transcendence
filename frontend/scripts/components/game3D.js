class Game3DRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.createGameElements();
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x0f172a); // Match the game background
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 15;
        this.camera.position.y = 5;
        this.camera.lookAt(0, 0, 0);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(10, 10, 10);
        mainLight.castShadow = true;
        this.scene.add(mainLight);

        // Accent lights
        const blueLight = new THREE.PointLight(0x3b82f6, 1, 100);
        blueLight.position.set(-10, 5, 5);
        this.scene.add(blueLight);

        const purpleLight = new THREE.PointLight(0x8b5cf6, 1, 100);
        purpleLight.position.set(10, -5, 5);
        this.scene.add(purpleLight);
    }

    createGameElements() {
        // Create game field
        this.createField();
        
        // Create paddles
        this.paddle1 = this.createPaddle();
        this.paddle2 = this.createPaddle();
        this.paddle1.position.x = -9;
        this.paddle2.position.x = 9;
        
        // Create ball
        this.ball = this.createBall();
        
        // Add to scene
        this.scene.add(this.paddle1);
        this.scene.add(this.paddle2);
        this.scene.add(this.ball);
    }

    createField() {
        // Field dimensions
        const fieldWidth = 20;
        const fieldHeight = 12;
        
        // Create field plane
        const fieldGeometry = new THREE.PlaneGeometry(fieldWidth, fieldHeight);
        const fieldMaterial = new THREE.MeshPhongMaterial({
            color: 0x1e293b,
            side: THREE.DoubleSide
        });
        this.field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        this.field.rotation.x = -Math.PI / 2;
        this.field.receiveShadow = true;
        
        // Create center line
        const lineGeometry = new THREE.PlaneGeometry(0.1, fieldHeight);
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        this.centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
        this.centerLine.rotation.x = -Math.PI / 2;
        
        // Add field elements to scene
        this.scene.add(this.field);
        this.scene.add(this.centerLine);
    }

    createPaddle() {
        const geometry = new THREE.BoxGeometry(0.3, 2, 1);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x3b82f6,
            emissiveIntensity: 0.2
        });
        const paddle = new THREE.Mesh(geometry, material);
        paddle.castShadow = true;
        return paddle;
    }

    createBall() {
        const geometry = new THREE.SphereGeometry(0.2, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x60a5fa,
            emissiveIntensity: 0.5
        });
        const ball = new THREE.Mesh(geometry, material);
        ball.castShadow = true;
        return ball;
    }

    updateGameState(state) {
        // Update paddle positions
        if (state.paddle1) {
            this.paddle1.position.y = state.paddle1.y;
        }
        if (state.paddle2) {
            this.paddle2.position.y = state.paddle2.y;
        }
        
        // Update ball position
        if (state.ball) {
            // Use GSAP for smooth ball movement
            gsap.to(this.ball.position, {
                duration: 0.1,
                x: state.ball.x,
                y: state.ball.y,
                ease: "none"
            });
            
            // Add some rotation to the ball for visual effect
            this.ball.rotation.x += 0.1;
            this.ball.rotation.z += 0.1;
        }
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Add any additional animations here
        
        this.renderer.render(this.scene, this.camera);
    }
}
