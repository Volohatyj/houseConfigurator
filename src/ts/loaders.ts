// src/ts/loaders.js

import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Типізуємо функції зворотного виклику (callbacks)
 */
type OnLoadCallback = (gltf: GLTF) => void;
type OnProgressCallback = (progress: number) => void;
type OnErrorCallback = (error: ErrorEvent) => void;

export function loadGLTFModel(
    path: string, 
    onLoad: OnLoadCallback, 
    onProgress?: OnProgressCallback, 
    onError?: OnErrorCallback
): void {
    const loader = new GLTFLoader();
    
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/'); 
    loader.setDRACOLoader(dracoLoader);

    loader.load(
        path,
        (gltf: GLTF) => {
            console.log(`Модель з ${path} успішно завантажена.`);
            onLoad(gltf); 
        },
        (xhr: ProgressEvent) => {
            const progress = xhr.total > 0 ? xhr.loaded / xhr.total : 0;
            if (onProgress) {
                onProgress(progress);
            } else {
                console.log(`${(progress * 100).toFixed(2)}% завантажено`);
            }
        },
        (error: any) => {
            console.error(`Помилка завантаження GLTF моделі з ${path}:`, error);
            if (onError) onError(error);
        }
    );
}