// src/js/camera.ts

import * as THREE from 'three';

// Виносимо типи для конфігурації (необов'язково, але корисно для порядку)
interface CameraPosition {
    x: number;
    y: number;
    z: number;
}

const cameraPosition: CameraPosition = {
    x: -3,
    y: 1.8,
    z: 5
};

/**
 * Ініціалізує камеру для сцени.
 * Повертає об'єкт типу THREE.PerspectiveCamera.
 * ": THREE.PerspectiveCamera" - явне вказання типу значення, яке повертає функція
 */
export function initCamera(): THREE.PerspectiveCamera {
    const aspectRatio = window.innerWidth / window.innerHeight;
    const verticalFov = 50;

    const camera = new THREE.PerspectiveCamera(
        verticalFov,
        aspectRatio,
        0.1,
        1000
    );

    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

    return camera;
}
