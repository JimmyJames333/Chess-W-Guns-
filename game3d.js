// THREE.JS SETUP
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60,
    (window.innerWidth * 0.75) / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth * 0.75, window.innerHeight);
document.getElementById("game-container").appendChild(renderer.domElement);

// Camera position
camera.position.set(10, 15, 20);
camera.lookAt(BOARD_SIZE / 2, 0, BOARD_SIZE / 2);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 50, 20);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

// 3D BOARD
const tileSize = 1;
const boardGroup = new THREE.Group();

for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
        const color = (x + y) % 2 === 0 ? 0xffffff : 0x444444;
        const tileGeo = new THREE.BoxGeometry(tileSize, 0.2, tileSize);
        const tileMat = new THREE.MeshPhongMaterial({ color });
        const tile = new THREE.Mesh(tileGeo, tileMat);

        tile.position.set(x * tileSize, 0, y * tileSize);
        boardGroup.add(tile);
    }
}

boardGroup.position.set(0, 0, 0);
scene.add(boardGroup);

// PAWN CREATOR
function createPawn(color) {
    const group = new THREE.Group();

    const baseGeo = new THREE.CylinderGeometry(0.4, 0.6, 0.4, 16);
    const baseMat = new THREE.MeshPhongMaterial({ color });
    const base = new THREE.Mesh(baseGeo, baseMat);
    group.add(base);

    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
    const body = new THREE.Mesh(bodyGeo, baseMat);
    body.position.y = 0.6;
    group.add(body);

    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const head = new THREE.Mesh(headGeo, baseMat);
    head.position.y = 1.2;
    group.add(head);

    return group;
}

const player3D = createPawn(0xffffff);
scene.add(player3D);

const enemy3D = createPawn(0x000000);
scene.add(enemy3D);

// ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
