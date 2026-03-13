import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ImmersiveBackground = () => {
    const containerRef = useRef();

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 0.1); // Slightly offset from center

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create Sphere
        const geometry = new THREE.SphereGeometry(15, 64, 64);
        // Invert the sphere to see it from the inside
        geometry.scale(-1, 1, 1);

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('/museum_bg.webp', (tex) => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.repeat.set(1, 1);
        });
        
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6
        });

        const sphere = new THREE.Mesh(geometry, material);
        // Rotate sphere so the center of the texture is facing the camera
        sphere.rotation.y = Math.PI * 0.5;
        scene.add(sphere);

        // Movement variables
        let targetRotation = { x: 0, y: 0 };
        let currentRotation = { x: 0, y: 0 };
        let targetZoom = 1;
        let currentZoom = 1;

        // Handle Mouse movement for desktop
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 0.4;
            const y = (e.clientY / window.innerHeight - 0.5) * 0.4;
            targetRotation.y = -x;
            targetRotation.x = -y;
        };

        // Handle Device Orientation (Gyro)
        const handleOrientation = (e) => {
            if (e.beta !== null && e.gamma !== null) {
                // beta: tilt front/back
                // gamma: tilt left/right
                // We map these to camera rotation
                
                // Adjust for natural holding angle (roughly 45-70 degrees)
                const betaAdjusted = e.beta - 60; 
                targetRotation.x = (betaAdjusted) * (Math.PI / 180) * 0.5;
                targetRotation.y = (e.gamma) * (Math.PI / 180) * 0.5;
                
                // Clamp rotations to prevent flipping over
                targetRotation.x = THREE.MathUtils.clamp(targetRotation.x, -Math.PI/4, Math.PI/4);
                targetRotation.y = THREE.MathUtils.clamp(targetRotation.y, -Math.PI/4, Math.PI/4);
            }
        };

        // Permission Request for iOS
        const requestPermission = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && 
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const response = await DeviceOrientationEvent.requestPermission();
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                } catch (e) {
                    console.error("Orientation permission denied", e);
                }
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', requestPermission, { once: true });
        window.addEventListener('touchstart', requestPermission, { once: true });

        // Animation Loop
        let startTime = Date.now();
        const animate = () => {
            requestAnimationFrame(animate);
            const time = (Date.now() - startTime) * 0.001;

            // 1. Smooth Rotation Interpolation
            currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
            currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

            // 2. Subtle Constant Drift
            sphere.rotation.y = time * 0.05 + currentRotation.y;
            sphere.rotation.x = Math.sin(time * 0.2) * 0.1 + currentRotation.x;

            // 3. Zoom In/Out Effect (Atmospheric breathing)
            targetZoom = 1 + Math.sin(time * 0.5) * 0.05;
            currentZoom += (targetZoom - currentZoom) * 0.02;
            camera.zoom = currentZoom;
            camera.updateProjectionMatrix();

            renderer.render(scene, camera);
        };

        animate();

        // Handle Resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('click', requestPermission);
            window.removeEventListener('touchstart', requestPermission);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            texture.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="absolute inset-0 z-0 pointer-events-none" 
            style={{ filter: 'contrast(1.1) brightness(0.9)' }}
        />
    );
};

export default ImmersiveBackground;
