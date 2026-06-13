const BOARD_SIZE = 8;

let player = { x: 0, y: 7, hp: 20, atk: 5, shield: false, shieldCooldown: 0 };
let enemy = null;
let wave = 1;
let playerTurn = true;

const hpEl = document.getElementById("hp");
const atkEl = document.getElementById("atk");
const waveEl = document.getElementById("wave");
const scdEl = document.getElementById("scd");
const turnEl = document.getElementById("turn");
const logEl = document.getElementById("log");

function log(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
}

function render() {
    hpEl.textContent = player.hp;
    atkEl.textContent = player.atk;
    waveEl.textContent = wave;
    scdEl.textContent = player.shieldCooldown;
    turnEl.textContent = playerTurn ? "Player" : "Enemy";

    if (window.player3D) {
        player3D.position.set(player.x, 0.2, player.y);
    }
    if (window.enemy3D) {
        if (enemy) {
            enemy3D.visible = true;
            enemy3D.position.set(enemy.x, 0.2, enemy.y);
        } else {
            enemy3D.visible = false;
        }
    }
}

function spawnEnemy() {
    wave++;
    waveEl.textContent = wave;

    let ex, ey;
    do {
        ex = Math.floor(Math.random() * BOARD_SIZE);
        ey = Math.floor(Math.random() * BOARD_SIZE);
    } while (ex === player.x && ey === player.y);

    enemy = { x: ex, y: ey, hp: 10 + wave * 2, atk: 3 };
    log("Enemy spawned at " + ex + "," + ey);
    render();
}

spawnEnemy();
render();

document.addEventListener("keydown", e => {
    if (!playerTurn) return;

    if (e.key === "w") player.y = Math.max(0, player.y - 1);
    if (e.key === "s") player.y = Math.min(7, player.y + 1);
    if (e.key === "a") player.x = Math.max(0, player.x - 1);
    if (e.key === "d") player.x = Math.min(7, player.x + 1);

    render();
});
