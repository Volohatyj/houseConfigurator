// src/js/scene.js

import * as THREE from 'three';
// 1. Змінюємо імпорт на новий HDRLoader
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'; 

/**
 * Ініціалізує сцену, налаштовує фон та HDR освітлення.
 */
export function initScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    // 2. Використовуємо HDRLoader замість RGBELoader
    const hdrLoader = new HDRLoader();
    
    hdrLoader.load('/assets/hdr/cedar_bridge_05k.hdr', (texture: THREE.DataTexture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.LinearSRGBColorSpace; 

        scene.environment = texture; 
        scene.background = new THREE.Color(0xeeeeee);
    });

    return scene;
}