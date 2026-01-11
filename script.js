// 1. ИНИЦИАЛИЗАЦИЯ СЦЕНЫ И РЕНДЕРА
const scene = new THREE.Scene();

// Настройки камеры (Z-позиция вынесена в настройки отдаления ниже)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Четкость для Retina

// --- НАСТРОЙКИ КАЧЕСТВА И ЦВЕТА ---
renderer.outputEncoding = THREE.sRGBEncoding;      // Правильные, сочные цвета
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Кинематографическое освещение
renderer.toneMappingExposure = 1.5;                // Общая яркость сцены (можно увеличить до 2.0 если темно)

document.getElementById('container3d').appendChild(renderer.domElement);

// 2. ОСВЕЩЕНИЕ (Светлая схема для металла)
// Окружающий свет (подсвечивает тени, чтобы не были черными)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

// Главный свет (рисует блики и дает объем)
const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
mainLight.position.set(5, 10, 7);
scene.add(mainLight);

// Дополнительный заполняющий свет с другой стороны
const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
fillLight.position.set(-5, 0, -5);
scene.add(fillLight);

// 3. ЗАГРУЗКА МОДЕЛИ
let model;
const loader = new THREE.GLTFLoader();

loader.load('Security_camera.glb', (gltf) => {
    model = gltf.scene;

    // --- УЛУЧШЕНИЕ МАТЕРИАЛОВ МОДЕЛИ ---
    model.traverse((node) => {
        if (node.isMesh) {
            node.material.metalness = 1.0;     // Максимальный металл
            node.material.roughness = 0.2;     // Гладкая поверхность для бликов
            node.material.envMapIntensity = 2; // Яркость отражений

            // Если модель всё равно темная, принудительно делаем цвет материала светлее
            if (node.material.color) {
                node.material.color.multiplyScalar(1.5);
            }
        }
    });

    // Авто-центрирование
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Позиция: Сдвиг вправо
    model.position.x = 2.5;

    // Масштаб (1.0 - стандарт)
    model.scale.set(1.2, 1.2, 1.2);

    scene.add(model);
    setupAnimations();
}, undefined, (error) => {
    console.error('Ошибка при загрузке модели:', error);
});

// 4. НАСТРОЙКИ ОТДАЛЕНИЯ (Z) И ГРАФИКИ
// Если хочешь отдалить ЕЩЕ сильнее — ставь 15 или 20
camera.position.z = 12;

function setupAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Принудительная фиксация дистанции камеры через GSAP
    gsap.set(camera.position, { z: 350 });

    // Вращение при скролле
    gsap.to(model.rotation, {
        y: Math.PI * 2,
        scrollTrigger: {
            trigger: "main",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2
        }
    });

    // Эффект "парения" (Liquid Float)
    gsap.to(model.position, {
        y: "+=0.15",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
}

// 5. ЦИКЛ РЕНДЕРА
function animate() {
    requestAnimationFrame(animate);

    if (model) {
        // Фоновое медленное вращение
        model.rotation.y += 0.0015;
    }

    renderer.render(scene, camera);
}

// 6. АДАПТИВНОСТЬ ОКНА
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

