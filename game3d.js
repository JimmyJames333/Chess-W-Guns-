// THREE.JS SETUP
const scene = new THREE.Scene();

// CAMERA
const camera = new THREE.PerspectiveCamera(
  60,
  (window.innerWidth * 0.75) / window.innerHeight,
  0.1,
  1000
);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth * 0.75, window.innerHeight);
renderer.setClearColor(0x000000); // black background
document.getElementById("game-container").appendChild(renderer.domElement);

// CAMERA POSITION
camera.position.set(BOARD_SIZE / 2, BOARD_SIZE, BOARD_SIZE * 1.5);
camera.lookAt(BOARD_SIZE / 2, 0, BOARD_SIZE / 2);

// LIGHTING
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 50, 20);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// 3D BOARD
const boardGroup = new THREE.Group();

for (let x = 0; x < BOARD_SIZE; x++) {
  for (let y = 0; y < BOARD_SIZE; y++) {
    const color = (x + y) % 2 === 0 ? 0xffffff : 0x444444;
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.2, 1),
      new THREE.MeshPhongMaterial({ color })
    );
    tile.position.set(x, 0, y);
    boardGroup.add(tile);
  }
}

scene.add(boardGroup);

// PAWN CREATOR
function createPawn(color) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 0.4, 16),
    new THREE.MeshPhongMaterial({ color })
  );
  group.add(base);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16),
    new THREE.MeshPhongMaterial({ color })
  );
  body.position.y = 0.6;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshPhongMaterial({ color })
  );
  head.position.y = 1.2;
  group.add(head);

  return group;
}

// PAWNS
window.player3D = createPawn(0xffffff);
scene.add(player3D);

window.enemy3D = createPawn(0x000000);
scene.add(enemy3D);

// INITIAL POSITIONS
player3D.position.set(0, 0.2, 7);
enemy3D.position.set(7, 0.2, 0);

// ANIMATION LOOP
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
