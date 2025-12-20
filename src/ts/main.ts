// index.ts

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initCamera } from './camera'; 
import { initRenderer } from './renderer';
import { initScene } from './scene';
import { loadGLTFModel } from './loaders'; // Використовуємо наш створений раніше лоадер

// 1. Ініціалізація бази
const renderer = initRenderer();
const scene = initScene();
const camera = initCamera();

scene.add(new THREE.GridHelper(10, 10)); // Додасть сітку під ногами
// renderer.setClearColor(0x0000ff); // Яскраво синій колір для тестування

// 2. Налаштування OrbitControls
const cameraTargetPosition = new THREE.Vector3(0, 0.4, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.copy(cameraTargetPosition);
controls.maxPolarAngle = Math.PI / 2 + 0.1;

// 3. Освітлення
const dirLight = new THREE.DirectionalLight(0xff6000, 0.5);
dirLight.color.setHSL(0.1, 1, 0.95);
dirLight.position.set(60, 60, 6); // 2,2,0.2 * 30
dirLight.castShadow = true;

// Налаштування тіней
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
const d = 150;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = -0.0001;

scene.add(dirLight);

// 4. Площина для тіней (Shadow Catcher)
const catcherPlaneGeometry = new THREE.PlaneGeometry(20, 10);
const catcherMaterial = new THREE.ShadowMaterial({ opacity: 0.02 });
const catcherPlaneMesh = new THREE.Mesh(catcherPlaneGeometry, catcherMaterial);

catcherPlaneMesh.position.y = 0.005;
catcherPlaneMesh.rotation.x = -Math.PI / 2;
catcherPlaneMesh.receiveShadow = true;
scene.add(catcherPlaneMesh);

// 5. Завантаження моделі (використовуємо нашу функцію з loaders.ts)
loadGLTFModel('assets/glb/BASE_structural_parts.glb', (gltf) => {
    gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Оновлюємо матеріали для HDR
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                materials.forEach((m: any) => {
                    if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
                        m.needsUpdate = true;
                    }
                });
            }
        }
    });
    scene.add(gltf.scene);
});

// 6. Параметри обмеження камери
const maxCameraRadius = 15;
const cameraMinY = 0.5;
const cameraMaxY = 15;

// 7. Цикл анімації
function animate(): void {
    requestAnimationFrame(animate);
    controls.update();

    // Обмеження висоти (Y)
    camera.position.y = Math.max(cameraMinY, Math.min(cameraMaxY, camera.position.y));

    // Обмеження радіусу (XZ)
    const currentRadius = Math.sqrt(
        camera.position.x * camera.position.x +
        camera.position.z * camera.position.z
    );

    if (currentRadius > maxCameraRadius) {
        const scaleXZ = maxCameraRadius / currentRadius;
        camera.position.x *= scaleXZ;
        camera.position.z *= scaleXZ;
    }

    renderer.render(scene, camera);
}

animate();

// 8. Респонсивність
// Функція для оновлення розмірів при зміні вікна (або відкритті DevTools)
window.addEventListener('resize', () => {
    // 1. Оновлюємо співвідношення сторін камери
    camera.aspect = window.innerWidth / window.innerHeight;
    
    // 2. Оновлюємо матрицю проекції (це прибере ефект "стиснення")
    camera.updateProjectionMatrix();
    
    // 3. Оновлюємо розмір самого рендерера
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // 4. (Опціонально) Якщо у вас високий DPI монітор (Retina), оновіть піксельний коефіцієнт
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


// 1. Енум для Типу Колон (для майбутньої гнучкості)
enum ColumnType {
    Generated = 'Generated',
    UserAdded = 'UserAdded'
}

export class Column {
    // Приватні Атрибути (Інкапсуляція: захист даних)
    private _x: number;
    private _y: number;
    private _isVisible: boolean;
    private _type: ColumnType;

    // Публічний ID для легкого пошуку в колекції
    public id: number;

    constructor(id: number, x: number, y: number, type: ColumnType = ColumnType.Generated) {
        this.id = id;
        this._x = x;
        this._y = y;
        this._isVisible = true; // За замовчуванням видима
        this._type = type;
    }

    // Публічний метод для зміни стану (як ми обговорювали)
    public setVisibility(isVisible: boolean): void {
        this._isVisible = isVisible;
    }

    // Публічні методи для читання (Getter)
    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public isVisible(): boolean { return this._isVisible; }
    public getType(): ColumnType { return this._type; }
}

export class ColumnGrid {
    // Приватні Атрибути (Композиція: містить колекцію)
    private _columns: Column[] = [];
    private _maxSpan: number;
    private _minSpan: number; // Новий важливий параметр для валідації

    constructor(maxSpan: number, minSpan: number) {
        this._maxSpan = maxSpan;
        this._minSpan = minSpan;
    }

    // Публічний метод: Додавання нової колони
    public addColumn(x: number, y: number): void {
        const newId = this._columns.length + 1;
        const newColumn = new Column(newId, x, y, ColumnType.UserAdded);
        this._columns.push(newColumn);

        console.log(`\n=== Додано нову колону: ID ${newId} на (${x}, ${y}) ===`);
        // Після додавання завжди викликаємо валідацію
        this.validateAndAdjust();
    }

    // Публічний метод: Видалення (приховування) колони
    public removeColumn(id: number): void {
        const column = this._columns.find(c => c.id === id);
        if (column && column.getType() !== ColumnType.Generated) {
            column.setVisibility(false);
            console.log(`\n--- Колона ID ${id} прихована ---`);
            // Після видалення (приховування) завжди викликаємо валідацію
            this.validateAndAdjust();
        }
    }

    // Приватний метод: Логіка Валідації (Інкапсуляція: деталі приховані)
    private validateAndAdjust(): void {
        const visibleColumns = this._columns.filter(c => c.isVisible()).sort((a, b) => a.x - b.x);

        console.log(`\n[Валідація] Перевірка ${visibleColumns.length} видимих колон...`);

        // Перевірка прогонів по осі X
        for (let i = 0; i < visibleColumns.length - 1; i++) {
            const colA = visibleColumns[i];
            const colB = visibleColumns[i + 1];
            const span = colB.x - colA.x;

            if (span > this._maxSpan) {
                console.warn(`[ПОПЕРЕДЖЕННЯ] Прогін між ${colA.id} та ${colB.id} (${span}м) перевищує MAX SPAN (${this._maxSpan}м).`);
                // Тут мала б бути логіка, що не дозволяє додавати.
            }

            // Ключова логіка: Приховати колону, якщо прогін замалий
            if (span < this._minSpan) {
                // Ми приховуємо останню додану колону (colB)
                colB.setVisibility(false);
                console.log(`[АВТО-ПРИХОВАННЯ] Прогін ${span}м менший за MIN SPAN (${this._minSpan}м). Колона ID ${colB.id} прихована.`);
                // Рекурсивно викликаємо валідацію ще раз, щоб перевірити новий прогін
                this.validateAndAdjust(); 
                return; 
            }
        }
    }
    
    // Публічний метод для відображення стану
    public getStatus(): void {
        console.log(`\n--- Поточний Стан Сітки (Max: ${this._maxSpan}м, Min: ${this._minSpan}м) ---`);
        this._columns.forEach(c => {
            console.log(`ID: ${c.id}, X: ${c.x}м, Y: ${c.y}м, Visible: ${c.isVisible()}, Type: ${c.getType()}`);
        });
    }
}

// Створюємо екземпляр класу Grid
const grid = new ColumnGrid(5.0, 1.5); // Макс. прогін 5м, Мін. прогін 1.5м

// 1. Початкова сітка (ручне додавання для прикладу)
console.log('1. Початкова сітка (ручне додавання для прикладу)');
grid.addColumn(0, 0); // ID 1
grid.addColumn(2.5, 0); // ID 2
grid.addColumn(5.0, 0); // ID 3
grid.addColumn(7.5, 0); // ID 4 (Всі прогони 2.5м, OK)

grid.getStatus();
console.log('====================================================');

// 2. Сценарій: Користувач додає колону занадто близько (Порушення MIN_SPAN)
// Додаємо колону на 3.5м. Прогін (3.5 - 2.5) = 1.0м. Це менше 1.5м.
grid.addColumn(3.5, 0); // ID 5
// Очікуваний результат: Колона ID 5 має бути прихована.

grid.getStatus();
console.log('====================================================');

// 3. Сценарій: Користувач видаляє колону, що збільшує прогін
grid.removeColumn(3); // Видаляємо ID 3 (на 5.0м)
// Тепер прогін між 2 (2.5м) та 4 (7.5м) = 5.0м. Це в межах MAX_SPAN.
// Валідація не повинна приховувати жодної колони.

grid.getStatus();
