// src/index.ts

function calculateSum(a: number, b: number): number {
    return a + b;
}

// 2. Створення змінних з явним типом (це добрий стиль для початківців)
const num1: number = 15;
const num2: number = 27;
const helloWorld: string = 'Hello World';

// 3. Виклик функції та виведення результату
const result: number = calculateSum(num1, num2);

console.log(`Обчислення: ${num1} + ${num2}`);
console.log(`Результат: ${result}`);
console.log(helloWorld);
