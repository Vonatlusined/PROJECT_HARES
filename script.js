import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

gsap.registerPlugin(ScrollTrigger);

const scene = new THREE.Scene();
// Увеличиваем Far до 100000, чтобы огромная модель не обрезалась
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3d').appendChild(renderer.domElement);

// Мощный свет со всех сторон
scene.add(new THREE.AmbientLight(0xffffff, 3));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(0, 100, 100);
scene.add(light);

let model;
const loader = new GLTFLoader();

loader.load('security_camera.glb', (gltf) => {
    model = gltf.scene;
    scene.add(model);

    // Упрощенное центрирование
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // ВАЖНО: Если модель огромная, мы просто отодвигаем камеру ОЧЕНЬ далеко
    // Давай попробуем поставить камеру на расстояние 5000 единиц
    camera.position.z = 250;

    // Анимация вращения
    gsap.to(model.rotation, {
        y: Math.PI * 2,
        scrollTrigger: {
            trigger: "main",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});