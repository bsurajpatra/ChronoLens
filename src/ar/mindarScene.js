import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import portraits from '../data/portraits.json';

let mindarThree = null;

/**
 * Helper to wrap text on a canvas context.
 */
const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
        testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
            lineCount++;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
    return y;
};

/**
 * Creates a pre-rendered canvas texture for high performance.
 */
const createPortraitOverlayTexture = (portrait) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Museum Card Background
    ctx.fillStyle = 'rgba(15, 15, 15, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Heritage Gold Border
    ctx.strokeStyle = '#c6a15b';
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    const maxWidth = canvas.width - 80; // Margin for safety

    // Title (Gold Serif) - With Word Wrap
    ctx.fillStyle = '#c6a15b';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    
    // Start drawing title and get the last Y position
    const startY = 80;
    const lastTitleY = wrapText(ctx, portrait.title, canvas.width / 2, startY, maxWidth, 45);

    // Artist (Ivory) - Positioned relative to title
    ctx.fillStyle = '#f5f1e6';
    ctx.font = '26px serif';
    ctx.fillText(portrait.artist, canvas.width / 2, lastTitleY + 55);

    // Year (Muted)
    ctx.fillStyle = '#b8b4a8';
    ctx.font = 'italic 20px serif';
    ctx.fillText(portrait.year, canvas.width / 2, lastTitleY + 95);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
};

/**
 * Phase-6: Multi-Portrait AR Engine Logic
 */
export const startAR = async (container, onTargetFound, onTargetLost) => {
    if (mindarThree) return { success: true }; // Guard against double initialization

    try {
        mindarThree = new MindARThree({
            container: container,
            imageTargetSrc: '/targets.mind',
            uiScanning: 'no',
            uiLoading: 'no',
            filterMinCF: 1, // Increased to reduce high-frequency jitter
            filterBeta: 1,  // Decreased to smooth out movement 
        });

        const { renderer, scene, camera } = mindarThree;

        // Mobile Render Clamp
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.antialias = false;
        renderer.setClearColor(new THREE.Color('black'), 0);

        // One Ambient Light Source - Optimized
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambientLight);

        // --- Multi-Portrait Dynamic Anchor Loop ---
        portraits.forEach((portrait, index) => {
            const anchor = mindarThree.addAnchor(index);

            // Texture Pre-generation
            const texture = createPortraitOverlayTexture(portrait);
            const geometry = new THREE.PlaneGeometry(1, 0.5);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0, // Start invisible for fade-in
                side: THREE.FrontSide, // Render only the front face to prevent ghosting
                depthWrite: false     // Prevents z-fighting artifacts
            });
            const plane = new THREE.Mesh(geometry, material);

            plane.position.set(0, 0.65, 0); // Positioned above frame
            plane.scale.set(0.8, 0.8, 0.8); // Initial scale for pop effect
            anchor.group.add(plane);

            // Lifecycle Callbacks - React Sync
            anchor.onTargetFound = () => {
                console.log(`Target detected: ${portrait.title}`);
                if (onTargetFound) onTargetFound(index);

                // Phase-7 Pop & Glow Entry
                let progress = 0;
                const animateIn = () => {
                    if (progress < 1) {
                        progress += 0.05;
                        const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out
                        plane.scale.set(0.8 + ease * 0.2, 0.8 + ease * 0.2, 0.8 + ease * 0.2);
                        material.opacity = ease * 0.95;
                        requestAnimationFrame(animateIn);
                    }
                };
                animateIn();
            };

            anchor.onTargetLost = () => {
                console.log(`Target lost: ${index}`);
                material.opacity = 0;
                plane.scale.set(0.8, 0.8, 0.8);
                if (onTargetLost) onTargetLost(index);
            };
        });

        // Start High-Frequency AR Stream
        await mindarThree.start();
        console.log("Multi-target AR ready");

        // Force viewport alignment for mobile
        window.dispatchEvent(new Event('resize'));

        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });

        return { success: true };
    } catch (e) {
        console.error("Multi-target AR Init Error:", e);
        throw e;
    }
};

/**
 * Stops AR and handles memory cleanup.
 */
export const stopAR = () => {
    if (mindarThree) {
        try {
            // Safer stop sequence
            if (typeof mindarThree.stop === 'function') {
                mindarThree.stop();
            }
            
            const { renderer } = mindarThree;
            if (renderer) {
                renderer.setAnimationLoop(null);
                renderer.dispose();
            }

            // Forced stream killing
            const video = document.querySelector('video');
            if (video && video.srcObject) {
                const tracks = video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
                console.log("Camera stream terminated cleanly");
            }

            mindarThree = null;
        } catch (e) {
            console.warn("Cleanup warning (suppressed):", e.message);
        }
    }
};
