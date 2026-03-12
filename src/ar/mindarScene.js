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
 * Creates a soft rectangular glow texture for the museum spotlight effect.
 */
const createGlowTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create a soft rectangular glow using a gradient or blur
    // We use a linear gradient from center out to create a rectangular fade
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Simple way: Draw a soft rectangle
    ctx.shadowBlur = 60;
    ctx.shadowColor = 'white';
    ctx.fillStyle = 'white';
    
    // Draw centered rectangle smaller than canvas to allow blur space
    const rectW = canvas.width * 0.7;
    const rectH = canvas.height * 0.6;
    ctx.fillRect(centerX - rectW / 2, centerY - rectH / 2, rectW, rectH);
    
    return new THREE.CanvasTexture(canvas);
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
        const glowTexture = createGlowTexture();
        const activeTargets = new Map();

        portraits.forEach((portrait, index) => {
            const anchor = mindarThree.addAnchor(index);

            // Container for all elements to allow consistent floating
            const group = new THREE.Group();
            anchor.group.add(group);

            // 1. Overlay Title Plane
            const texture = createPortraitOverlayTexture(portrait);
            const geometry = new THREE.PlaneGeometry(1, 0.5);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0,
                side: THREE.FrontSide,
                depthWrite: false
            });
            const plane = new THREE.Mesh(geometry, material);
            plane.position.set(0, 0.65, 0.01);
            plane.scale.set(0.85, 0.85, 0.85);
            group.add(plane);

            // 2. Glow Highlight Effect (Museum Spotlight)
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xc6a15b, // warm museum gold
                map: glowTexture,
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), glowMaterial);
            glow.position.set(0, 0.65, -0.01); // Behind overlay plane
            group.add(glow);

            let animFrame = null;
            let startTime = null;
            let isStabilized = false;

            anchor.onTargetFound = () => {
                if (onTargetFound) onTargetFound(index);

                startTime = performance.now();
                activeTargets.set(index, true);
                isStabilized = false;
                console.log("Glow animation start");

                const animate = (now) => {
                    if (!activeTargets.has(index)) return;
                    
                    const elapsed = now - startTime;
                    const time = now / 1000;

                    // Micro Floating Motion
                    group.position.y = Math.sin(time * 0.8) * 0.005;

                    // Overlay Title Animation
                    if (elapsed < 280) {
                        const t = elapsed / 280;
                        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
                        plane.scale.set(0.85 + (ease * 0.15), 0.85 + (ease * 0.15), 1);
                        material.opacity = ease * 0.95;
                    } else {
                        plane.scale.set(1, 1, 1);
                        material.opacity = 0.95;
                    }

                    // Refined Glow HighLight Effect (PART 5)
                    if (elapsed < 500) {
                        const t = elapsed / 500;
                        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
                        
                        // 0 -> 0.45 -> 0.3 Logic for better visibility
                        if (t < 0.6) {
                            glowMaterial.opacity = (t / 0.6) * 0.45;
                        } else {
                            glowMaterial.opacity = 0.45 - ((t - 0.6) / 0.4) * 0.15;
                        }
                    } else {
                        if (!isStabilized) {
                            console.log("Glow stabilized");
                            isStabilized = true;
                        }
                        // Idle Breathing Animation (PART 6)
                        const breathe = Math.sin(time * 0.6) * 0.03 + 0.3; 
                        glowMaterial.opacity = breathe; // Oscillates 0.27 <-> 0.33
                    }

                    animFrame = requestAnimationFrame(animate);
                };
                animFrame = requestAnimationFrame(animate);
            };

            anchor.onTargetLost = () => {
                activeTargets.delete(index);
                if (onTargetLost) onTargetLost(index);
                console.log("Glow fade out: expanding to full screen");

                // Cinematic "Bloom Out" Fade (PART 7 - REFINED)
                const fadeStart = performance.now();
                const currentOpacity = material.opacity;
                const currentGlowOpacity = glowMaterial.opacity;
                const duration = 400; // Slightly longer for dramatic expansion

                const animateOut = (now) => {
                    const elapsed = now - fadeStart;
                    const t = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - t, 3); // easeOutCubic
                    
                    // Dramatic Scale Expansion
                    // We scale the glow up massively to cover the view before it fades
                    const scaleFactor = 1 + (easeOut * 15); 
                    glow.scale.set(scaleFactor, scaleFactor, 1);
                    
                    material.opacity = currentOpacity * (1 - t);
                    glowMaterial.opacity = currentGlowOpacity * (1 - t);
                    
                    if (t < 1) {
                        requestAnimationFrame(animateOut);
                    } else {
                        // Reset for next detection
                        glow.scale.set(1, 1, 1);
                        material.opacity = 0;
                        glowMaterial.opacity = 0;
                    }
                };
                requestAnimationFrame(animateOut);
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
