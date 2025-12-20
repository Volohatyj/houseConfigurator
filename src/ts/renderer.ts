// src/ts/renderer.js

import * as THREE from 'three';

/**
 * Ініціалізує WebGL рендерер.
 * @returns {THREE.WebGLRenderer} Об'єкт рендерера Three.js
 */
export function initRenderer(): THREE.WebGLRenderer {
    // Створюємо екземпляр рендерера
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        precision: 'highp' 
    });

    // Встановлюємо розміри
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Налаштування кольорів та світла
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1;

    // Включаємо тіні
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Додаємо canvas у дерево документа
    // TypeScript знає, що renderer.domElement — це HTMLCanvasElement
    document.body.appendChild(renderer.domElement);

    return renderer;
}
