const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-value');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game objects
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 30,
    speed: 5,
    color: '#00ff00',
    direction: 1 // 1 for right, -1 for left
};

const targets = [];
const bullets = [];
let score = 0;

// Game controls
const keys = {
    w: false,
    s: false,
    a: false,
    d: false
};

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
    }
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Update player direction based on mouse position
    player.direction = mouseX > player.x ? 1 : -1;
    
    // Calculate bullet direction
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    bullets.push({
        x: player.x + (player.direction * 20), // Spawn bullet from gun position
        y: player.y - 5,
        speed: 10,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        size: 3
    });
});

// Draw character function
function drawCharacter(x, y, size, isPlayer, direction = 1) {
    // Body
    ctx.fillStyle = isPlayer ? '#4a90e2' : '#e74c3c';
    ctx.fillRect(x - size/2, y - size, size, size * 2);
    
    // Head
    ctx.beginPath();
    ctx.arc(x, y - size - size/4, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    if (isPlayer) {
        // Gun
        ctx.fillStyle = '#333';
        ctx.fillRect(x + (direction * size/2), y - size/4, direction * size, size/4);
    }
    
    // Legs
    ctx.fillStyle = isPlayer ? '#2c3e50' : '#c0392b';
    ctx.fillRect(x - size/2, y + size, size/3, size/2);
    ctx.fillRect(x + size/6, y + size, size/3, size/2);
}

// Spawn targets
function spawnTarget() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
        case 0: // top
            x = Math.random() * canvas.width;
            y = -20;
            break;
        case 1: // right
            x = canvas.width + 20;
            y = Math.random() * canvas.height;
            break;
        case 2: // bottom
            x = Math.random() * canvas.width;
            y = canvas.height + 20;
            break;
        case 3: // left
            x = -20;
            y = Math.random() * canvas.height;
            break;
    }

    targets.push({
        x,
        y,
        size: 20,
        speed: 2,
        direction: 1
    });
}

// Update game objects
function update() {
    // Update player position
    if (keys.w && player.y > player.size * 2) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.a && player.x > player.size) {
        player.x -= player.speed;
        player.direction = -1;
    }
    if (keys.d && player.x < canvas.width - player.size) {
        player.x += player.speed;
        player.direction = 1;
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].dx * bullets[i].speed;
        bullets[i].y += bullets[i].dy * bullets[i].speed;

        if (bullets[i].x < 0 || bullets[i].x > canvas.width ||
            bullets[i].y < 0 || bullets[i].y > canvas.height) {
            bullets.splice(i, 1);
        }
    }

    // Update targets
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        const dx = player.x - target.x;
        const dy = player.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        target.direction = dx > 0 ? 1 : -1;
        target.x += (dx / distance) * target.speed;
        target.y += (dy / distance) * target.speed;

        // Check for collision with player
        if (distance < player.size * 1.5) {
            alert(`Game Over! Final Score: ${score}`);
            resetGame();
            return;
        }

        // Check for collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const bulletDx = bullet.x - target.x;
            const bulletDy = bullet.y - target.y;
            const bulletDistance = Math.sqrt(bulletDx * bulletDx + bulletDy * bulletDy);

            if (bulletDistance < target.size * 1.5) {
                targets.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                scoreElement.textContent = score;
                break;
            }
        }
    }
}

// Draw game objects
function draw() {
    // Clear canvas
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    drawCharacter(player.x, player.y, player.size, true, player.direction);

    // Draw targets
    targets.forEach(target => {
        drawCharacter(target.x, target.y, target.size, false, target.direction);
    });

    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);

    // Spawn new targets
    if (Math.random() < 0.02) {
        spawnTarget();
    }
}

// Reset game
function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    targets.length = 0;
    bullets.length = 0;
    score = 0;
    scoreElement.textContent = score;
}

// Start game
gameLoop(); 