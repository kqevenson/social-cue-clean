/**
 * AvatarRenderer.jsx
 * Direct Three.js avatar renderer with lip-sync and emotion support
 * Bypasses model-viewer limitations for morph target control
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// RPM Viseme names
const RPM_VISEMES = [
  "viseme_sil", "viseme_PP", "viseme_FF", "viseme_TH", "viseme_DD",
  "viseme_kk", "viseme_CH", "viseme_SS", "viseme_nn", "viseme_RR",
  "viseme_aa", "viseme_E", "viseme_I", "viseme_O", "viseme_U"
];

// Character to viseme mapping
const CHAR_TO_VISEME = {
  'a': 10, 'e': 11, 'i': 12, 'o': 13, 'u': 14,
  'p': 1, 'b': 1, 'm': 1,
  'f': 2, 'v': 2,
  't': 4, 'd': 4,
  'n': 8, 'l': 8,
  'k': 5, 'g': 5, 'c': 5, 'q': 5,
  's': 7, 'z': 7, 'x': 7,
  'r': 9,
  'h': 0, 'w': 14, 'y': 12,
  'j': 6, 'sh': 6, 'ch': 6,
  ' ': 0, '.': 0, ',': 0, '!': 0, '?': 0, '-': 0
};

// Emotion blendshapes
const EMOTIONS = {
  joy: { mouthSmileLeft: 0.7, mouthSmileRight: 0.7, eyeSquintLeft: 0.3, eyeSquintRight: 0.3 },
  happiness: { mouthSmileLeft: 0.5, mouthSmileRight: 0.5 },
  sadness: { mouthFrownLeft: 0.5, mouthFrownRight: 0.5, browDownLeft: 0.3, browDownRight: 0.3 },
  anger: { browDownLeft: 0.6, browDownRight: 0.6, mouthFrownLeft: 0.4, mouthFrownRight: 0.4 },
  surprise: { eyeWideLeft: 0.7, eyeWideRight: 0.7, browInnerUp: 0.6, mouthOpen: 0.3 },
  fear: { eyeWideLeft: 0.6, eyeWideRight: 0.6, browInnerUp: 0.5 },
  neutral: {}
};

const AvatarRenderer = ({
  avatarUrl,
  isSpeaking = false,
  speakingText = '',
  emotion = 'neutral',
  emotionIntensity = 0.8,
  width = 320,
  height = 500,
  className = '',
  onLoad,
  onError
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const meshesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lipSyncRef = useRef({ active: false, chars: [], index: 0 });
  const blinkTimeoutRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // Set a blendshape value across all meshes
  const setBlendshape = useCallback((name, value) => {
    meshesRef.current.forEach(mesh => {
      if (mesh.morphTargetDictionary && mesh.morphTargetDictionary[name] !== undefined) {
        const idx = mesh.morphTargetDictionary[name];
        mesh.morphTargetInfluences[idx] = Math.max(0, Math.min(1, value));
      }
    });
  }, []);

  // Reset all visemes
  const resetVisemes = useCallback(() => {
    RPM_VISEMES.forEach(v => setBlendshape(v, 0));
    setBlendshape('jawOpen', 0);
  }, [setBlendshape]);

  // Apply a viseme
  const applyViseme = useCallback((index, intensity = 1) => {
    resetVisemes();
    if (index > 0 && index < RPM_VISEMES.length) {
      setBlendshape(RPM_VISEMES[index], intensity);
      // Open jaw for vowels
      if (index >= 10) {
        setBlendshape('jawOpen', intensity * 0.4);
      }
    }
  }, [setBlendshape, resetVisemes]);

  // Apply emotion
  const applyEmotion = useCallback((emotionName, intensity = 0.8) => {
    // Reset emotion blendshapes
    Object.values(EMOTIONS).forEach(emo => {
      Object.keys(emo).forEach(name => setBlendshape(name, 0));
    });

    // Apply new emotion
    const emo = EMOTIONS[emotionName?.toLowerCase()] || EMOTIONS.neutral;
    Object.entries(emo).forEach(([name, value]) => {
      setBlendshape(name, value * intensity);
    });
  }, [setBlendshape]);

  // Blink animation
  const blink = useCallback(() => {
    setBlendshape('eyeBlinkLeft', 1);
    setBlendshape('eyeBlinkRight', 1);
    setTimeout(() => {
      setBlendshape('eyeBlinkLeft', 0);
      setBlendshape('eyeBlinkRight', 0);
    }, 150);
  }, [setBlendshape]);

  // Schedule random blinking
  const scheduleBlink = useCallback(() => {
    const delay = 2000 + Math.random() * 4000;
    blinkTimeoutRef.current = setTimeout(() => {
      blink();
      scheduleBlink();
    }, delay);
  }, [blink]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !avatarUrl) return;

    console.log('🎭 Initializing Three.js scene for avatar:', avatarUrl);

    // Clean up previous renderer if exists
    if (rendererRef.current) {
      console.log('🎭 Cleaning up previous renderer');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
        blinkTimeoutRef.current = null;
      }
      // Safely remove canvas if it's a child of the container
      try {
        if (containerRef.current && rendererRef.current.domElement &&
            containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      } catch (e) {
        console.warn('🎭 Could not remove previous canvas:', e);
      }
      rendererRef.current.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      modelRef.current = null;
      meshesRef.current = [];
      setIsLoaded(false);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera setup - positioned for full body view
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 2.5);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor(0x000000, 0); // Transparent clear color

    // Style the canvas
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    console.log('🎭 Three.js renderer created, canvas:', renderer.domElement);

    // Lighting - bright enough to see the model
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1);
    frontLight.position.set(0, 2, 10);
    scene.add(frontLight);

    // Store reference to test cube so we can remove it later
    const testGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const testMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.name = 'testCube';
    testCube.position.set(0, 1, 0);
    scene.add(testCube);
    console.log('🎭 Added test cube (will be removed when model loads)');

    // Load avatar model
    const loader = new GLTFLoader();

    // Log the full URL being loaded
    console.log('🎭 Loading avatar from URL:', avatarUrl);

    // Add error handling for CORS issues
    loader.load(
      avatarUrl,
      (gltf) => {
        console.log('🎭 GLTF loaded successfully:', gltf);
        const model = gltf.scene;
        modelRef.current = model;

        // Fix materials for proper rendering
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;

            // Ensure materials render correctly
            if (node.material) {
              node.material.needsUpdate = true;
              // Fix for some GLB materials not rendering
              if (node.material.map) {
                node.material.map.colorSpace = THREE.SRGBColorSpace;
              }
              // Ensure double-sided rendering
              node.material.side = THREE.DoubleSide;
              // Fix transparency issues
              node.material.transparent = false;
              node.material.depthWrite = true;
            }

            console.log('🎭 Processed mesh:', node.name, 'material:', node.material?.type);
          }
        });

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log('🎭 Model bounds:', {
          min: { x: box.min.x, y: box.min.y, z: box.min.z },
          max: { x: box.max.x, y: box.max.y, z: box.max.z },
          size: { x: size.x, y: size.y, z: size.z }
        });

        // Position model so it's centered in view
        // Move model so feet are at y=0
        model.position.x = -center.x;
        model.position.y = -box.min.y;
        model.position.z = -center.z;

        // Calculate camera position to show full body
        const modelHeight = size.y;
        const modelWidth = size.x;

        // Camera should be far enough to see the whole model
        // Using FOV of 30deg, we need distance = (height/2) / tan(15deg)
        const fovRad = (30 / 2) * (Math.PI / 180);
        const distanceForHeight = (modelHeight / 2) / Math.tan(fovRad);
        const distance = Math.max(distanceForHeight * 1.2, modelWidth * 2, 2);

        // Look at the center of the model (which is now at modelHeight/2 since feet are at 0)
        const lookAtY = modelHeight * 0.45;

        camera.position.set(0, lookAtY, distance);
        camera.lookAt(0, lookAtY, 0);
        camera.updateProjectionMatrix();

        console.log('🎭 Model height:', modelHeight, 'Camera distance:', distance);
        console.log('🎭 Camera position:', camera.position);
        console.log('🎭 Looking at y:', lookAtY);

        // Remove test cube
        const existingCube = scene.getObjectByName('testCube');
        if (existingCube) {
          scene.remove(existingCube);
          console.log('🎭 Removed test cube');
        }

        // Add model to scene
        scene.add(model);
        console.log('🎭 Model added to scene, total children:', scene.children.length);

        // Find all meshes with morph targets
        const meshes = [];
        model.traverse((node) => {
          if (node.isMesh && node.morphTargetDictionary && node.morphTargetInfluences) {
            meshes.push(node);
            console.log('🎭 Found mesh:', node.name, 'with', Object.keys(node.morphTargetDictionary).length, 'morphs');
          }
        });
        meshesRef.current = meshes;

        console.log('🎭 Avatar loaded with', meshes.length, 'animated meshes');
        setIsLoaded(true);
        onLoad?.();

        // Start blinking
        scheduleBlink();

        // Test - briefly open mouth
        console.log('🎭 Testing mouth animation...');
        setBlendshape('jawOpen', 0.5);
        setBlendshape('viseme_aa', 0.7);
        setTimeout(() => {
          setBlendshape('jawOpen', 0);
          setBlendshape('viseme_aa', 0);
          console.log('🎭 Mouth test complete');
        }, 1000);
      },
      (progress) => {
        if (progress.total > 0) {
          console.log('🎭 Loading:', Math.round((progress.loaded / progress.total) * 100) + '%');
        }
      },
      (error) => {
        console.error('🎭 GLTFLoader error:', error);
        console.error('🎭 Failed URL:', avatarUrl);
        // Check if it's a CORS error
        if (error.message && error.message.includes('Failed to fetch')) {
          console.error('🎭 This may be a CORS issue. Try adding crossorigin parameter to the URL.');
        }
        onError?.(error);
      }
    );

    // Animation loop with lip sync timing
    let lastLipSyncTime = 0;
    const LIP_SYNC_INTERVAL = 70; // ms between phonemes (~14 per second for natural speech)

    const animate = (currentTime) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Process lip sync at controlled rate
      if (lipSyncRef.current.active) {
        if (currentTime - lastLipSyncTime >= LIP_SYNC_INTERVAL) {
          const { chars, index } = lipSyncRef.current;
          if (index < chars.length) {
            const char = chars[index];
            const visemeIndex = CHAR_TO_VISEME[char] ?? 0;
            applyViseme(visemeIndex, 0.7 + Math.random() * 0.3);
            lipSyncRef.current.index++;
            lastLipSyncTime = currentTime;
          } else {
            lipSyncRef.current.active = false;
            resetVisemes();
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate(0);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
        blinkTimeoutRef.current = null;
      }
      // Safely remove canvas
      try {
        if (rendererRef.current && containerRef.current &&
            containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
      } catch (e) {
        console.warn('🎭 Cleanup error:', e);
      }
      meshesRef.current = [];
      sceneRef.current = null;
      modelRef.current = null;
    };
  }, [avatarUrl, width, height, onLoad, onError, setBlendshape, applyViseme, resetVisemes, scheduleBlink]);

  // Handle speaking/lip sync
  useEffect(() => {
    if (isSpeaking && speakingText && isLoaded) {
      console.log('🎭 Starting lip sync for:', speakingText.substring(0, 30) + '...');
      const chars = speakingText.toLowerCase().replace(/[^a-z\s]/g, '').split('');
      lipSyncRef.current = { active: true, chars, index: 0 };
    } else if (!isSpeaking) {
      lipSyncRef.current.active = false;
      resetVisemes();
    }
  }, [isSpeaking, speakingText, isLoaded, resetVisemes]);

  // Handle emotion changes
  useEffect(() => {
    if (isLoaded) {
      applyEmotion(emotion, emotionIntensity);
    }
  }, [emotion, emotionIntensity, isLoaded, applyEmotion]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: '16px',
        overflow: 'hidden',
        zIndex: 10
      }}
    >
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '14px',
          background: 'rgba(0,0,0,0.5)',
          padding: '10px 20px',
          borderRadius: '8px'
        }}>
          Loading avatar...
        </div>
      )}
    </div>
  );
};

export default AvatarRenderer;
