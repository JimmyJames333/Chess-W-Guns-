// GAME VARIABLES
const hpEl = document.getElementById("hp");
const atkEl = document.getElementById("atk");
const waveEl = document.getElementById("wave");
const scdEl = document.getElementById("scd");
const turnEl = document.getElementById("turn");
const logEl = document.getElementById("log");

let playerName = "Player";
let enemyName = "Enemy";

const BOARD_SIZE = 8;

let player = { x: 0, y: 7, hp: 20, atk: 5, shield: false, shieldCooldown: 0 };
let enemy = null;
let wave = 1;

let playerTurn = true;
let hasShotThisTurn = false;

// LOG
function log(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
}

// RENDER (syncs 3D)
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

// START GAME
document.getElementById("playbutton").addEventListener("click", () => {
    const nameInput = document.getElementById("playername").value.trim();
    if (nameInput.length > 0) playerName = nameInput;

    document.getElementById("homescreen").style.display = "none";

    spawnEnemy();
    render();
    log("Welcome, " + playerName + "! Your turn.");
});

// GAME OVER
function gameOver() {
    document.getElementById("gameover").style.display = "flex";
    playerTurn = false;
    document.body.style.pointerEvents = "none";
    log("GAME OVER");
}

// SPAWN ENEMY
function spawnEnemy() {
    wave++;
    waveEl.textContent = wave;

    const heal = Math.floor(player.hp * 0.1);
    player.hp += heal;
    log("You heal " + heal + " HP!");

    let ex, ey;
    do {
        ex = Math.floor(Math.random() * BOARD_SIZE);
        ey = Math.floor(Math.random() * BOARD_SIZE);
    } while (ex === player.x && ey === player.y);

    enemyName = "Enemy " + wave;

    enemy = {
        x: ex,
        y: ey,
        hp: 10 + wave * 2,
        atk: 3 + Math.floor(wave / 2)
    };

    log(enemyName + " appears!");
    render();
}

// PATHFINDING
function findNextStep(sx, sy, tx, ty) {
    const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];

    const visited = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(false)
    );
    const queue = [];
    const parent = {};

    function key(x, y) { return x + "," + y; }

    queue.push({ x: sx, y: sy });
    visited[sy][sx] = true;
    parent[key(sx, sy)] = null;

    while (queue.length > 0) {
        const c = queue.shift();
        if (c.x === tx && c.y === ty) break;

        for (const d of dirs) {
            const nx = c.x + d.dx;
            const ny = c.y + d.dy;

            if (
                nx >= 0 && nx < BOARD_SIZE &&
                ny >= 0 && ny < BOARD_SIZE &&
                !visited[ny][nx]
            ) {
                visited[ny][nx] = true;
                parent[key(nx, ny)] = c;
                queue.push({ x: nx, y: ny });
            }
        }
    }

    let step = { x: tx, y: ty };
    let prev = parent[key(tx, ty)];

    while (prev && !(prev.x === sx && prev.y === sy)) {
        step = prev;
        prev = parent[key(step.x, step.y)];
    }

    return step;
}

// TURN SYSTEM
function endPlayerTurn() {
    playerTurn = false;
    hasShotThisTurn = false;
    document.body.style.pointerEvents = "none";
    render();
    setTimeout(enemyTurn, 600);
}

function enemyTurn() {
    if (!enemy || enemy.hp <= 0) {
        playerTurn = true;
        document.body.style.pointerEvents = "auto";
        render();
        return;
    }

    if (Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y) === 1) {
        if (player.shield) {
            log(enemyName + " hits your shield!");
            player.shield = false;
            player.shieldCooldown = 3;
        } else {
            player.hp -= enemy.atk;
            log(enemyName + " hits you for " + enemy.atk);

            if (player.hp <= 0) {
                gameOver();
                return;
            }
        }

        playerTurn = true;
        document.body.style.pointerEvents = "auto";
        render();
        return;
    }

    const next = findNextStep(enemy.x, enemy.y, player.x, player.y);
    enemy.x = next.x;
    enemy.y = next.y;

    log(enemyName + " moves.");
    playerTurn = true;
    document.body.style.pointerEvents = "auto";
    render();
}

// MOVEMENT
function movePlayer(dx, dy) {
    if (!playerTurn) return;

    const nx = player.x + dx;
    const ny = player.y + dy;

    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
        log("Can't move off board.");
        return;
    }

    player.x = nx;
    player.y = ny;

    if (player.shieldCooldown > 0) player.shieldCooldown--;

    log(playerName + " moves.");
    render();
    endPlayerTurn();
}

// BLOCK
function block() {
    if (!playerTurn) return;

    if (player.shieldCooldown > 0) {
        log("Shield on cooldown!");
        return;
    }

    player.shield = true;
    log(playerName + " raises shield!");
    render();
}

// SHOOT
function shoot() {
    if (!playerTurn) return;
    if (hasShotThisTurn) return;
    if (!enemy) return;

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;

    if (dx !== 0 && dy !== 0) {
        log("Enemy not in line.");
        return;
    }

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        log("Enemy too far.");
        return;
    }

    hasShotThisTurn = true;

    enemy.hp -= player.atk;
    log("You shoot " + enemyName + "! HP: " + enemy.hp);

    if (enemy.hp <= 0) {
        log(enemyName + " defeated!");
        enemy = null;
        spawnEnemy();
    }

    render();
    endPlayerTurn();
}

// INPUT
document.addEventListener("keydown", e => {
    if (!playerTurn) return;

    if (e.key === "w") movePlayer(0, -1);
    if (e.key === "s") movePlayer(0, 1);
    if (e.key === "a") movePlayer(-1, 0);
    if (e.key === "d") movePlayer(1, 0);

    if (e.key === "o") shoot();
    if (e.key === "p") block();
});
