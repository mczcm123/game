
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas.getContext('2d');

// 缓存DOM元素
const DOM = {
    health: document.getElementById('health'),
    ammo: document.getElementById('ammo'),
    score: document.getElementById('score'),
    wave: document.getElementById('wave'),
    enemies: document.getElementById('enemies'),
    staminaBar: document.getElementById('staminaBar'),
    damageOverlay: document.getElementById('damageOverlay'),
    crosshair: document.getElementById('crosshair'),
    scopeOverlay: document.getElementById('scopeOverlay'),
    reloadIndicator: document.getElementById('reloadIndicator'),
    reloadProgress: document.querySelector('.reloadProgress'),
    reloadText: document.querySelector('.reloadText'),
    shopScreen: document.getElementById('shopScreen'),
    shopCoins: document.getElementById('shopCoins'),
    cheatScreen: document.getElementById('cheatScreen'),
    cheatInput: document.getElementById('cheatInput'),
    cheatMessage: document.getElementById('cheatMessage'),
    weaponWheel: document.getElementById('weaponWheel'),
    weaponPistol: document.getElementById('weaponPistol'),
    weaponAutoRifle: document.getElementById('weaponAutoRifle'),
    weaponAutoRiflePro: document.getElementById('weaponAutoRiflePro'),
    weaponSniper: document.getElementById('weaponSniper'),
    weaponLMG: document.getElementById('weaponLMG'),
    currentWeapon: document.getElementById('currentWeapon'),
    settingsScreen: document.getElementById('settingsScreen'),
    startScreen: document.getElementById('startScreen'),
    virtualControls: document.getElementById('virtualControls'),
    quitButton: document.getElementById('quitButton'),
    shootButton: document.getElementById('shootButton'),
    joystick: document.getElementById('joystick'),
    actionButtons: document.getElementById('actionButtons'),
    sensitivitySlider: document.getElementById('sensitivitySlider'),
    sensitivityValue: document.getElementById('sensitivityValue'),
    gameContainer: document.getElementById('gameContainer')
};

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;
const MAP_SIZE = 24;
const TILE_SIZE = 64;
const FOV = Math.PI / 3;
const NUM_RAYS = 320;
const MAX_DEPTH = 20;

const WALL_HEIGHT = 1;
const WALL_COLOR_LIGHT = '#8B4513';
const WALL_COLOR_DARK = '#654321';
const FLOOR_COLOR = '#2d2d2d';
const CEILING_COLOR = '#1a1a2e';

const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,0,1,1,1],
    [1,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,1,1,0,0,0,0,1,1,0,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,1,0,1,1,0,0,0,0,1,1,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,1],
    [1,1,1,0,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let player = {
    x: 2.5,
    y: 2.5,
    angle: 0,
    health: 150,
    maxHealth: 150,
    stamina: 100,
    maxStamina: 100,
    ammo: 100,
    maxAmmo: 100,
    currentMagazine: 15,
    score: 0,
    kills: 0,
    reloadTime: 0,
    damageFlash: 0,
    hasAutoRifleNormal: false,
    hasAutoRifle: false,
    hasChestRig: false,
    hasSniperRifle: false,
    hasLightMachineGun: false,
    isShooting: false,
    isReloading: false
};

let enemies = [];
let bullets = [];
let particles = [];
let keys = {};
let mouseX = 0;
let gameRunning = false;
let shopActive = false;
let cheatActive = false;
let weaponWheelActive = false;
let pauseMenuActive = false;
let wave = 1;
let currentWeapon = 'pistol';
let isScoped = false;
let pitch = 0;
let sensitivity = 1;
let arrowKeyMovement = false;
let spaceShoot = false;
let seeThroughWalls = true;
let radarEnabled = false;
let gameStartTime = 0;
let virtualControlsEnabled = false;
let portraitMode = false;
let autoAimEnabled = false;
let autoAimStrength = 90; // 吸附角度范围（度）

// 虚拟按键相关
let joystickActive = false;
let joystickStartX = 0;
let joystickStartY = 0;
let joystickDeltaX = 0;
let joystickDeltaY = 0;

// 视角控制滑块相关
let cameraSliderActive = false;
let cameraSliderStartX = 0;
let cameraSliderDelta = 0;

const defaultStats = {
    pistol: { damage: 20, fireRate: 15, canAutoFire: false, isDual: false, spread: 0.08, spreadVertical: 0.04, zoom: 1.25, magazineSize: 15, reloadTime: 60 },
    autoRifle: { damage: 35, fireRate: 5, canAutoFire: true, isDual: false, spread: 0.04, spreadVertical: 0.02, zoom: 1.25, magazineSize: 45, reloadTime: 120 },
    autoRiflePro: { damage: 35, fireRate: 10, canAutoFire: true, isDual: false, spread: 0.035, spreadVertical: 0.018, zoom: 1.25, magazineSize: 45, reloadTime: 120 },
    sniper: { damage: 70, fireRate: 21, canAutoFire: false, isDual: false, spread: 0.18, spreadVertical: 0.09, zoom: 2.0, magazineSize: 20, reloadTime: 150 },
    lmg: { damage: 20, fireRate: 15, canAutoFire: false, isDual: true, spread: 0.11, spreadVertical: 0.055, zoom: 1.25, magazineSize: 100, reloadTime: 300 }
};
let enemiesPerWave = 3;

const ENEMY_TYPES = {
    zombie: { color: '#6b8e4e', health: 30, speed: 0.012, damage: 5, score: 100, size: 0.32, attackRange: 1.5, isRanged: false },
    demon: { color: '#ff4444', health: 60, speed: 0.015, damage: 8, score: 200, size: 0.38, attackRange: 1.5, isRanged: false },
    crawler: { color: '#aa44cc', health: 20, speed: 0.05, damage: 3, score: 150, size: 0.28, attackRange: 1.2, isRanged: false },
    boss: { color: '#ff0000', health: 500, speed: 0.02, damage: 20, score: 2000, size: 0.5, attackRange: 2, isRanged: false },
    bigBoss: { color: '#ff0066', health: 800, speed: 0.015, damage: 30, score: 5000, size: 0.6, attackRange: 2.5, isRanged: false },
    shooter: { color: '#4488ff', health: 15, speed: 0.018, damage: 10, score: 180, size: 0.25, attackRange: 6, isRanged: true, shootCooldown: 120 }
};

function spawnEnemy(typeOverride = null) {
    let type = typeOverride;
    if (!type) {
        const types = Object.keys(ENEMY_TYPES).filter(t => t !== 'boss' && t !== 'bigBoss');
        if (wave < 3) type = 'zombie';
        else if (wave < 5) type = Math.random() > 0.4 ? 'zombie' : 'shooter';
        else if (wave < 8) {
            type = types[Math.floor(Math.random() * types.length)];
        } else {
            type = Math.random() > 0.3 ? types[Math.floor(Math.random() * types.length)] : 'shooter';
        }
    }
    
    let x, y;
    do {
        x = Math.random() * (MAP_SIZE - 4) + 2;
        y = Math.random() * (MAP_SIZE - 4) + 2;
    } while (Math.hypot(x - player.x, y - player.y) < 5 || !isValidPosition(x, y));
    
    let enemyHealth = ENEMY_TYPES[type].health;
    if (type !== 'boss') {
        enemyHealth *= (1 + wave * 0.1);
    }
    
    enemies.push({
        x, y,
        type,
        health: enemyHealth,
        maxHealth: enemyHealth,
        angle: Math.random() * Math.PI * 2,
        attackCooldown: 0,
        hitFlash: 0,
        lastShootTime: 0
    });
}

function isValidPosition(x, y) {
    for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
        for (let dy = -0.5; dy <= 0.5; dy += 0.5) {
            let mapX = Math.floor(x + dx);
            let mapY = Math.floor(y + dy);
            if (mapX < 0 || mapX >= MAP_SIZE || mapY < 0 || mapY >= MAP_SIZE) {
                return false;
            }
            if (map[mapY][mapX] === 1) {
                return false;
            }
        }
    }
    return true;
}

function castRay(angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    
    for (let depth = 0; depth < MAX_DEPTH; depth += 0.02) {
        let x = player.x + cos * depth;
        let y = player.y + sin * depth;
        
        let mapX = Math.floor(x);
        let mapY = Math.floor(y);
        
        if (mapX < 0 || mapX >= MAP_SIZE || mapY < 0 || mapY >= MAP_SIZE) {
            return { depth, wallX: 0, side: 0 };
        }
        
        if (map[mapY][mapX] === 1) {
            let wallX = x - mapX;
            let side = 0;
            if (wallX > 0.9 || wallX < 0.1) side = 1;
            return { depth, wallX, side };
        }
    }
    return { depth: MAX_DEPTH, wallX: 0, side: 0 };
}

function render() {
    document.getElementById('staminaBar').style.width = `${(player.stamina / player.maxStamina) * 100}%`;
    
    let zoom = isScoped ? defaultStats[currentWeapon].zoom : 1;
    let currentFOV = FOV / zoom;
    
    let rayWidth = SCREEN_WIDTH / NUM_RAYS;
    
    let verticalOffset = pitch / (Math.PI * 85 / 180) * SCREEN_HEIGHT * 0.25;
    
    for (let i = 0; i < NUM_RAYS; i++) {
        let rayAngle = player.angle - currentFOV / 2 + (i / NUM_RAYS) * currentFOV;
        let ray = castRay(rayAngle);
        
        let correctedDepth = ray.depth * Math.cos(rayAngle - player.angle);
        let wallHeight = Math.min(SCREEN_HEIGHT * 2, SCREEN_HEIGHT / correctedDepth * zoom);
        
        let brightness = Math.max(0.3, 1 - ray.depth / MAX_DEPTH);
        let sideBrightness = ray.side === 1 ? brightness * 0.7 : brightness;
        
        let baseColor = ray.side === 1 ? WALL_COLOR_DARK : WALL_COLOR_LIGHT;
        ctx.fillStyle = adjustBrightness(baseColor, sideBrightness);
        
        let wallTop = (SCREEN_HEIGHT - wallHeight) / 2 + verticalOffset;
        
        let ceilingHeight = wallTop;
        if (ceilingHeight > 0) {
            ctx.fillStyle = CEILING_COLOR;
            ctx.fillRect(i * rayWidth, 0, rayWidth + 1, ceilingHeight);
        }
        
        ctx.fillStyle = adjustBrightness(baseColor, sideBrightness);
        ctx.fillRect(i * rayWidth, Math.max(0, wallTop), rayWidth + 1, wallHeight);
        
        let floorY = wallTop + wallHeight;
        if (floorY < SCREEN_HEIGHT) {
            ctx.fillStyle = FLOOR_COLOR;
            ctx.fillRect(i * rayWidth, floorY, rayWidth + 1, SCREEN_HEIGHT - floorY);
        }
    }
    
    renderSprites(zoom, verticalOffset);
    renderBullets();
    renderParticles();
    
    renderMinimap();
    
    updateScopeUI();
}

function renderSprites(zoom = 1, verticalOffset = 0) {
    let visibleEnemies = [...enemies];
    let currentFOV = FOV / zoom;
    
    visibleEnemies.sort((a, b) => {
        let distA = Math.hypot(a.x - player.x, a.y - player.y);
        let distB = Math.hypot(b.x - player.x, b.y - player.y);
        return distB - distA;
    });
    
    for (let enemy of visibleEnemies) {
        let dx = enemy.x - player.x;
        let dy = enemy.y - player.y;
        let dist = Math.hypot(dx, dy);
        
        let angleToEnemy = Math.atan2(dy, dx);
        let relativeAngle = angleToEnemy - player.angle;
        
        while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
        while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
        
        if (Math.abs(relativeAngle) > currentFOV / 2 + 0.5) continue;
        
        if (!seeThroughWalls && !playerCanSeeEnemy(enemy)) continue;
        
        let screenX = SCREEN_WIDTH / 2 + (relativeAngle / currentFOV) * SCREEN_WIDTH;
        let spriteHeight = (SCREEN_HEIGHT / dist) * ENEMY_TYPES[enemy.type].size * zoom;
        let spriteWidth = spriteHeight * 0.8;
        
        let brightness = Math.max(0.3, 1 - dist / MAX_DEPTH);
        let enemyColor = adjustBrightness(ENEMY_TYPES[enemy.type].color, brightness);
        
        if (enemy.hitFlash > 0) {
            enemyColor = '#fff';
        }
        
        let baseX = screenX;
        let baseY = SCREEN_HEIGHT / 2 - spriteHeight / 2 + verticalOffset;
        
        drawEnemy(ctx, enemy.type, baseX, baseY, spriteWidth, spriteHeight, enemyColor, brightness);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX - 15, baseY - 10, 30, 5);
        ctx.fillStyle = '#e94560';
        ctx.fillRect(screenX - 15, baseY - 10, 30 * (enemy.health / enemy.maxHealth), 5);
    }
}

function drawEnemy(ctx, type, x, y, w, h, color, brightness) {
    ctx.fillStyle = color;
    
    if (type === 'zombie') {
        let headRadius = w * 0.25;
        ctx.beginPath();
        ctx.arc(x, y + headRadius, headRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillRect(x - w * 0.2, y + headRadius * 2, w * 0.4, h * 0.5);
        
        ctx.fillStyle = adjustBrightness('#2d4a1c', brightness);
        ctx.fillRect(x - w * 0.35, y + headRadius * 2, w * 0.15, h * 0.35);
        ctx.fillRect(x + w * 0.2, y + headRadius * 2, w * 0.15, h * 0.35);
        
        ctx.fillRect(x - w * 0.15, y + headRadius * 2 + h * 0.5, w * 0.12, h * 0.25);
        ctx.fillRect(x + w * 0.03, y + headRadius * 2 + h * 0.5, w * 0.12, h * 0.25);
        
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(x - w * 0.1, y + headRadius * 0.8, w * 0.05, 0, Math.PI * 2);
        ctx.arc(x + w * 0.1, y + headRadius * 0.8, w * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
    } else if (type === 'demon') {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w * 0.5, y + h * 0.3);
        ctx.lineTo(x + w * 0.4, y + h);
        ctx.lineTo(x - w * 0.4, y + h);
        ctx.lineTo(x - w * 0.5, y + h * 0.3);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = adjustBrightness('#8b0000', brightness);
        ctx.beginPath();
        ctx.moveTo(x - w * 0.35, y);
        ctx.lineTo(x - w * 0.2, y - h * 0.15);
        ctx.lineTo(x - w * 0.1, y + h * 0.05);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + w * 0.35, y);
        ctx.lineTo(x + w * 0.2, y - h * 0.15);
        ctx.lineTo(x + w * 0.1, y + h * 0.05);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x - w * 0.15, y + h * 0.25, w * 0.08, 0, Math.PI * 2);
        ctx.arc(x + w * 0.15, y + h * 0.25, w * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = adjustBrightness('#660000', brightness);
        ctx.beginPath();
        ctx.moveTo(x, y + h * 0.5);
        ctx.lineTo(x - w * 0.15, y + h * 0.65);
        ctx.lineTo(x + w * 0.15, y + h * 0.65);
        ctx.closePath();
        ctx.fill();
        
    } else if (type === 'crawler') {
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.4, w * 0.4, h * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = adjustBrightness('#6622aa', brightness);
        for (let i = 0; i < 4; i++) {
            let angle = (i / 4) * Math.PI - Math.PI / 2;
            let tentX = x + Math.cos(angle) * w * 0.3;
            let tentY = y + h * 0.5 + Math.sin(angle) * h * 0.2;
            
            ctx.beginPath();
            ctx.moveTo(tentX, tentY);
            ctx.quadraticCurveTo(
                tentX + Math.cos(angle + 0.5) * w * 0.3,
                tentY + h * 0.2,
                tentX + Math.cos(angle) * w * 0.4,
                tentY + h * 0.4
            );
            ctx.lineTo(tentX + Math.cos(angle) * w * 0.35, tentY + h * 0.35);
            ctx.quadraticCurveTo(
                tentX + Math.cos(angle - 0.5) * w * 0.25,
                tentY + h * 0.15,
                tentX,
                tentY
            );
            ctx.fill();
        }
        
        ctx.fillStyle = adjustBrightness('#8833cc', brightness);
        ctx.beginPath();
        ctx.arc(x, y + h * 0.15, w * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(x - w * 0.08, y + h * 0.12, w * 0.05, 0, Math.PI * 2);
        ctx.arc(x + w * 0.08, y + h * 0.12, w * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
    } else if (type === 'boss') {
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w * 0.5, y + h * 0.2);
        ctx.lineTo(x + w * 0.45, y + h * 0.6);
        ctx.lineTo(x + w * 0.35, y + h);
        ctx.lineTo(x - w * 0.35, y + h);
        ctx.lineTo(x - w * 0.45, y + h * 0.6);
        ctx.lineTo(x - w * 0.5, y + h * 0.2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.4, y);
        ctx.lineTo(x - w * 0.2, y - h * 0.3);
        ctx.lineTo(x - w * 0.05, y + h * 0.1);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + w * 0.4, y);
        ctx.lineTo(x + w * 0.2, y - h * 0.3);
        ctx.lineTo(x + w * 0.05, y + h * 0.1);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.35, w * 0.25, w * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x - w * 0.12, y + h * 0.32, w * 0.1, 0, Math.PI * 2);
        ctx.arc(x + w * 0.12, y + h * 0.32, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - w * 0.12, y + h * 0.32, w * 0.05, 0, Math.PI * 2);
        ctx.arc(x + w * 0.12, y + h * 0.32, w * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.15, y + h * 0.55);
        ctx.lineTo(x, y + h * 0.65);
        ctx.lineTo(x + w * 0.15, y + h * 0.55);
        ctx.lineTo(x, y + h * 0.5);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = adjustBrightness('#4a0000', brightness);
        ctx.fillRect(x - w * 0.35, y + h * 0.4, w * 0.12, h * 0.4);
        ctx.fillRect(x + w * 0.23, y + h * 0.4, w * 0.12, h * 0.4);
    }
}

function hasLineOfSight(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let dist = Math.hypot(dx, dy);
    
    if (dist < 0.5) return true;
    
    let steps = Math.max(Math.abs(dx), Math.abs(dy)) * 20;
    steps = Math.max(steps, 20);
    
    let stepX = dx / steps;
    let stepY = dy / steps;
    
    for (let i = 1; i < steps; i++) {
        let checkX = x1 + stepX * i;
        let checkY = y1 + stepY * i;
        
        let mapX = Math.floor(checkX);
        let mapY = Math.floor(checkY);
        
        if (mapX < 0 || mapX >= MAP_SIZE || mapY < 0 || mapY >= MAP_SIZE) {
            return false;
        }
        
        if (map[mapY][mapX] === 1) {
            return false;
        }
    }
    
    return true;
}

function renderBullets() {
    for (let bullet of bullets) {
        let dx = bullet.x - player.x;
        let dy = bullet.y - player.y;
        let dist = Math.hypot(dx, dy);
        
        if (dist > MAX_DEPTH) continue;
        
        let angleToBullet = Math.atan2(dy, dx);
        let relativeAngle = angleToBullet - player.angle;
        
        while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
        while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
        
        if (Math.abs(relativeAngle) > FOV / 2) continue;
        
        let screenX = SCREEN_WIDTH / 2 + (relativeAngle / FOV) * SCREEN_WIDTH;
        let screenY = SCREEN_HEIGHT / 2;
        let bulletSize = Math.max(2, 10 - dist * 0.5);
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(screenX, screenY, bulletSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function renderParticles() {
    for (let p of particles) {
        let dx = p.x - player.x;
        let dy = p.y - player.y;
        let dist = Math.hypot(dx, dy);
        
        if (dist > MAX_DEPTH) continue;
        
        let angleToP = Math.atan2(dy, dx);
        let relativeAngle = angleToP - player.angle;
        
        while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
        while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
        
        if (Math.abs(relativeAngle) > FOV / 2) continue;
        
        let screenX = SCREEN_WIDTH / 2 + (relativeAngle / FOV) * SCREEN_WIDTH;
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(screenX - p.size / 2, SCREEN_HEIGHT / 2 - p.size / 2, p.size, p.size);
        ctx.globalAlpha = 1;
    }
}

function renderMinimap() {
    minimapCtx.fillStyle = '#000';
    minimapCtx.fillRect(0, 0, 150, 150);
    
    let scale = 150 / MAP_SIZE;
    
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            if (map[y][x] === 1) {
                minimapCtx.fillStyle = '#444';
                minimapCtx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }
    
    for (let enemy of enemies) {
        minimapCtx.fillStyle = ENEMY_TYPES[enemy.type].color;
        minimapCtx.beginPath();
        minimapCtx.arc(enemy.x * scale, enemy.y * scale, 3, 0, Math.PI * 2);
        minimapCtx.fill();
        
        if (radarEnabled && enemy.canSeePlayer) {
            minimapCtx.strokeStyle = '#ff0';
            minimapCtx.lineWidth = 1;
            minimapCtx.beginPath();
            minimapCtx.arc(enemy.x * scale, enemy.y * scale, 6, 0, Math.PI * 2);
            minimapCtx.stroke();
            minimapCtx.beginPath();
            minimapCtx.arc(enemy.x * scale, enemy.y * scale, 8, 0, Math.PI * 2);
            minimapCtx.stroke();
        }
    }
    
    minimapCtx.fillStyle = '#e94560';
    minimapCtx.beginPath();
    minimapCtx.arc(player.x * scale, player.y * scale, 3, 0, Math.PI * 2);
    minimapCtx.fill();
    
    minimapCtx.strokeStyle = '#e94560';
    minimapCtx.beginPath();
    minimapCtx.moveTo(player.x * scale, player.y * scale);
    minimapCtx.lineTo(
        player.x * scale + Math.cos(player.angle) * 8,
        player.y * scale + Math.sin(player.angle) * 8
    );
    minimapCtx.stroke();
}

function adjustBrightness(color, brightness) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    r = Math.floor(r * brightness);
    g = Math.floor(g * brightness);
    b = Math.floor(b * brightness);
    
    return `rgb(${r},${g},${b})`;
}

function updatePlayer() {
    let moveSpeed = 0.025;
    let strafeSpeed = 0.018;
    
    let isMoving = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'];
    if (arrowKeyMovement) {
        isMoving = isMoving || keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight'];
    }
    // 检查虚拟摇杆是否在移动
    if (joystickActive && (Math.abs(joystickDeltaX) > 10 || Math.abs(joystickDeltaY) > 10)) {
        isMoving = true;
    }
    let isSprinting = (keys['ShiftLeft'] || keys['ShiftRight']) && player.stamina > 0.5 && isMoving;
    
    if (isScoped) {
        moveSpeed *= 0.5;
        strafeSpeed *= 0.5;
    }
    
    let staminaConsumeRate = 0.5;
    let staminaRecoverRate = 0.1;
    
    if (player.hasStaminaSlow) {
        staminaConsumeRate *= 0.5;
    }
    if (player.hasStaminaFast) {
        staminaRecoverRate *= 2;
    }
    
    if (isSprinting) {
        moveSpeed = 0.045 * (isScoped ? 0.5 : 1);
        strafeSpeed = 0.035 * (isScoped ? 0.5 : 1);
        player.stamina -= staminaConsumeRate;
    } else if (player.stamina < player.maxStamina) {
        player.stamina += staminaRecoverRate;
    }
    
    if (player.stamina < 0) player.stamina = 0;
    if (player.stamina > player.maxStamina) player.stamina = player.maxStamina;

    let newX = player.x;
    let newY = player.y;

    // 键盘控制
    if (keys['KeyW'] || (arrowKeyMovement && keys['ArrowUp'])) {
        newX += Math.cos(player.angle) * moveSpeed;
        newY += Math.sin(player.angle) * moveSpeed;
    }
    if (keys['KeyS'] || (arrowKeyMovement && keys['ArrowDown'])) {
        newX -= Math.cos(player.angle) * moveSpeed;
        newY -= Math.sin(player.angle) * moveSpeed;
    }
    if (keys['KeyA'] || (arrowKeyMovement && keys['ArrowLeft'])) {
        newX -= Math.cos(player.angle + Math.PI / 2) * strafeSpeed;
        newY -= Math.sin(player.angle + Math.PI / 2) * strafeSpeed;
    }
    if (keys['KeyD'] || (arrowKeyMovement && keys['ArrowRight'])) {
        newX += Math.cos(player.angle + Math.PI / 2) * strafeSpeed;
        newY += Math.sin(player.angle + Math.PI / 2) * strafeSpeed;
    }

    // 虚拟摇杆控制
    if (joystickActive) {
        const deadZone = 15;
        const maxDelta = 60;
        
        if (Math.abs(joystickDeltaY) > deadZone) {
            let factor = Math.min(Math.abs(joystickDeltaY) / maxDelta, 1);
            if (joystickDeltaY < 0) {
                newX += Math.cos(player.angle) * moveSpeed * factor;
                newY += Math.sin(player.angle) * moveSpeed * factor;
            } else {
                newX -= Math.cos(player.angle) * moveSpeed * factor;
                newY -= Math.sin(player.angle) * moveSpeed * factor;
            }
        }
        if (Math.abs(joystickDeltaX) > deadZone) {
            let factor = Math.min(Math.abs(joystickDeltaX) / maxDelta, 1);
            if (joystickDeltaX > 0) {
                newX += Math.cos(player.angle + Math.PI / 2) * strafeSpeed * factor;
                newY += Math.sin(player.angle + Math.PI / 2) * strafeSpeed * factor;
            } else {
                newX -= Math.cos(player.angle + Math.PI / 2) * strafeSpeed * factor;
                newY -= Math.sin(player.angle + Math.PI / 2) * strafeSpeed * factor;
            }
        }
    }

    if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
        player.x = newX;
        player.y = newY;
    }

    if (player.reloadTime > 0) {
        player.reloadTime--;
        if (player.reloadTime === 0 && player.isReloading) {
            const weapon = defaultStats[currentWeapon];
            let ammoNeeded = weapon.magazineSize - player.currentMagazine;
            player.ammo -= ammoNeeded;
            player.currentMagazine = weapon.magazineSize;
            player.isReloading = false;
            updateUI();
        }
    }
    if (player.damageFlash > 0) player.damageFlash--;
    
    if (player.damageFlash > 0) {
        document.getElementById('damageOverlay').style.opacity = 1;
    } else {
        document.getElementById('damageOverlay').style.opacity = 0;
    }
    
    if (player.isShooting && defaultStats[currentWeapon].canAutoFire) {
        shoot();
    }
    
    applyAutoAim();
}

function reload() {
    if (player.isReloading || player.reloadTime > 0) return;
    const weapon = defaultStats[currentWeapon];
    let ammoNeeded = weapon.magazineSize - player.currentMagazine;
    if (ammoNeeded <= 0 || player.ammo < ammoNeeded) return;
    
    player.isReloading = true;
    player.reloadTime = weapon.reloadTime;
    player.initialReloadTime = weapon.reloadTime;
}

function shoot() {
    if (player.ammo <= 0 || player.reloadTime > 0 || player.isReloading) return;
    
    const weapon = defaultStats[currentWeapon];
    let ammoCost = weapon.isDual ? 1 : 1;
    let bulletsToFire = weapon.isDual ? 2 : 1;
    
    if (player.currentMagazine <= 0) return;
    
    player.currentMagazine -= ammoCost;
    player.reloadTime = weapon.fireRate;
    
    for (let b = 0; b < bulletsToFire; b++) {
        let baseSpread = weapon.isDual ? (b === 0 ? -0.03 : 0.03) : 0;
        let spreadMultiplier = isScoped ? 0 : 1;
        let randomSpread = (Math.random() - 0.5) * weapon.spread * 2 * spreadMultiplier;
        let totalSpread = baseSpread * spreadMultiplier + randomSpread;
        
        bullets.push({
            x: player.x + Math.cos(player.angle) * 0.5,
            y: player.y + Math.sin(player.angle) * 0.5,
            vx: Math.cos(player.angle + totalSpread) * 0.3,
            vy: Math.sin(player.angle + totalSpread) * 0.3,
            vz: 0,
            life: 100,
            damage: weapon.damage
        });
    }
    
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: player.x + Math.cos(player.angle) * 0.5,
            y: player.y + Math.sin(player.angle) * 0.5,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            life: 0.5 + Math.random() * 0.5,
            color: '#ffff00',
            size: 2 + Math.random() * 2
        });
    }
    
    updateUI();
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;
        
        if (bullet.life <= 0 || map[Math.floor(bullet.y)][Math.floor(bullet.x)] === 1) {
            bullets.splice(i, 1);
            continue;
        }
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            let enemy = enemies[j];
            if (Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) < ENEMY_TYPES[enemy.type].size) {
                enemy.health -= bullet.damage;
                enemy.hitFlash = 10;
                
                for (let k = 0; k < 8; k++) {
                    particles.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: (Math.random() - 0.5) * 0.15,
                        vy: (Math.random() - 0.5) * 0.15,
                        life: 0.5 + Math.random() * 0.5,
                        color: '#ff0000',
                        size: 3 + Math.random() * 3
                    });
                }
                
                bullets.splice(i, 1);
                
                if (enemy.health <= 0) {
                    player.score += ENEMY_TYPES[enemy.type].score;
                    player.kills++;
                    for (let k = 0; k < 15; k++) {
                        particles.push({
                            x: enemy.x,
                            y: enemy.y,
                            vx: (Math.random() - 0.5) * 0.2,
                            vy: (Math.random() - 0.5) * 0.2,
                            life: 0.5 + Math.random(),
                            color: ENEMY_TYPES[enemy.type].color,
                            size: 4 + Math.random() * 4
                        });
                    }
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }
}

function canSeePlayer(enemy) {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.hypot(dx, dy);
    
    if (dist > 10) return false;
    
    let angle = Math.atan2(dy, dx);
    let step = 0.2;
    
    for (let t = 0; t < dist; t += step) {
        let x = enemy.x + Math.cos(angle) * t;
        let y = enemy.y + Math.sin(angle) * t;
        
        if (map[Math.floor(y)] && map[Math.floor(y)][Math.floor(x)] === 1) {
            return false;
        }
    }
    
    return true;
}

function playerCanSeeEnemy(enemy) {
    let dx = enemy.x - player.x;
    let dy = enemy.y - player.y;
    let dist = Math.hypot(dx, dy);
    
    if (dist > 15) return false;
    
    let angle = Math.atan2(dy, dx);
    let step = 0.1;
    
    for (let t = step; t < dist; t += step) {
        let x = player.x + Math.cos(angle) * t;
        let y = player.y + Math.sin(angle) * t;
        
        if (map[Math.floor(y)] && map[Math.floor(y)][Math.floor(x)] === 1) {
            return false;
        }
    }
    
    return true;
}

function updateEnemies() {
    let anyEnemySeesPlayer = enemies.some(e => canSeePlayer(e));
    
    for (let enemy of enemies) {
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let dist = Math.hypot(dx, dy);
        
        enemy.angle = Math.atan2(dy, dx);
        
        let seesPlayer = canSeePlayer(enemy);
        enemy.canSeePlayer = seesPlayer;
        
        if (!enemy.wanderAngle) enemy.wanderAngle = Math.random() * Math.PI * 2;
        if (!enemy.wanderTimer) enemy.wanderTimer = 0;
        
        if (dist > 1) {
            let speed = ENEMY_TYPES[enemy.type].speed;
            let moved = false;
            
            let preferredAngle;
            
            if (seesPlayer || anyEnemySeesPlayer) {
                preferredAngle = Math.atan2(dy, dx);
                enemy.wanderAngle = preferredAngle;
            } else if (dist <= 5) {
                enemy.wanderTimer++;
                if (enemy.wanderTimer > 30 || Math.random() < 0.03) {
                    enemy.wanderAngle += (Math.random() - 0.5) * Math.PI * 0.3;
                    enemy.wanderTimer = 0;
                }
                preferredAngle = enemy.wanderAngle;
            } else {
                enemy.wanderTimer++;
                if (enemy.wanderTimer > 60 || Math.random() < 0.02) {
                    enemy.wanderAngle += (Math.random() - 0.5) * Math.PI * 0.5;
                    enemy.wanderTimer = 0;
                }
                preferredAngle = enemy.wanderAngle;
            }
            
            if (!enemy.stuckCounter) enemy.stuckCounter = 0;
            if (!enemy.lastPos) enemy.lastPos = { x: enemy.x, y: enemy.y };
            
            let dxLast = enemy.x - enemy.lastPos.x;
            let dyLast = enemy.y - enemy.lastPos.y;
            let movedDist = Math.hypot(dxLast, dyLast);
            
            if (movedDist < speed * 0.1) {
                enemy.stuckCounter++;
            } else {
                enemy.stuckCounter = 0;
            }
            
            enemy.lastPos = { x: enemy.x, y: enemy.y };
            
            let anglesToTry = [preferredAngle];
            
            if (enemy.stuckCounter > 30) {
                for (let i = 1; i <= 4; i++) {
                    anglesToTry.push(preferredAngle + (i * Math.PI / 8));
                    anglesToTry.push(preferredAngle - (i * Math.PI / 8));
                }
                enemy.stuckCounter = 0;
            } else if (enemy.stuckCounter > 10) {
                anglesToTry.push(preferredAngle + Math.PI / 4);
                anglesToTry.push(preferredAngle - Math.PI / 4);
            }
            
            for (let angle of anglesToTry) {
                let newX = enemy.x + Math.cos(angle) * speed;
                let newY = enemy.y + Math.sin(angle) * speed;
                
                if (isValidPosition(newX, newY)) {
                    enemy.x = newX;
                    enemy.y = newY;
                    moved = true;
                    break;
                }
            }
            
            if (!moved) {
                for (let angle of anglesToTry) {
                    let newX = enemy.x + Math.cos(angle) * speed * 0.5;
                    let newY = enemy.y + Math.sin(angle) * speed * 0.5;
                    
                    if (isValidPosition(newX, newY)) {
                        enemy.x = newX;
                        enemy.y = newY;
                        moved = true;
                        break;
                    }
                }
            }
            
            if (!moved && enemy.stuckCounter > 60) {
                let randAngle = Math.random() * Math.PI * 2;
                let newX = enemy.x + Math.cos(randAngle) * speed;
                let newY = enemy.y + Math.sin(randAngle) * speed;
                if (isValidPosition(newX, newY)) {
                    enemy.x = newX;
                    enemy.y = newY;
                }
            }
        }
        
        if (enemy.attackCooldown > 0) enemy.attackCooldown--;
        
        if (dist < 1.2 && enemy.attackCooldown === 0) {
            player.health -= ENEMY_TYPES[enemy.type].damage;
            player.damageFlash = 30;
            enemy.attackCooldown = 60;
            updateUI();
            
            if (player.health <= 0) {
                gameOver();
            }
        }
        
        if (enemy.hitFlash > 0) enemy.hitFlash--;
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.size *= 0.95;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function updateUI() {
    DOM.health.textContent = `生命: ${Math.max(0, player.health)}`;
    DOM.ammo.textContent = `弹药: ${player.currentMagazine}/${player.ammo}`;
    DOM.score.textContent = `金币: ${player.score}`;
    DOM.wave.textContent = `波次: ${wave}`;
    DOM.enemies.textContent = `敌人: ${enemies.length}`;
}

function updateScopeUI() {
    if (isScoped) {
        DOM.crosshair.classList.add('scoped');
        DOM.scopeOverlay.classList.add('scoped');
    } else {
        DOM.crosshair.classList.remove('scoped');
        DOM.scopeOverlay.classList.remove('scoped');
    }
}

function updateReloadUI() {
    if (player.isReloading) {
        DOM.reloadIndicator.classList.add('active');
        const progress = 1 - (player.reloadTime / player.initialReloadTime);
        const dashOffset = 283 * (1 - progress);
        DOM.reloadProgress.style.strokeDashoffset = dashOffset;
        
        const secondsLeft = Math.ceil(player.reloadTime / 60);
        DOM.reloadText.textContent = `换弹中... ${secondsLeft}s`;
    } else {
        DOM.reloadIndicator.classList.remove('active');
    }
}

function openShop() {
    shopActive = true;
    DOM.shopScreen.style.display = 'flex';
    DOM.shopCoins.textContent = `金币: ${player.score}`;
    updateShopButtons();
    document.body.style.cursor = 'default';
    if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
    }
}

function closeShop() {
    shopActive = false;
    isScoped = false;
    DOM.shopScreen.style.display = 'none';
    document.body.style.cursor = 'none';
    startNextWave();
}

function openCheat() {
    cheatActive = true;
    DOM.cheatScreen.style.display = 'flex';
    DOM.cheatInput.value = '';
    DOM.cheatMessage.textContent = '';
    document.body.style.cursor = 'default';
    if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
    }
    DOM.cheatInput.focus();
}

function closeCheat() {
    cheatActive = false;
    isScoped = false;
    DOM.cheatScreen.style.display = 'none';
    document.body.style.cursor = 'none';
}

function openWeaponWheel() {
    if (shopActive || cheatActive) return;
    weaponWheelActive = true;
    DOM.weaponWheel.style.display = 'block';
    document.body.style.cursor = 'default';
    if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
    }
    updateWeaponWheel();
}

function closeWeaponWheel() {
    weaponWheelActive = false;
    isScoped = false;
    DOM.weaponWheel.style.display = 'none';
    document.body.style.cursor = 'none';
}

function updateWeaponWheel() {
    DOM.weaponPistol.classList.toggle('selected', currentWeapon === 'pistol');
    DOM.weaponAutoRifle.classList.toggle('selected', currentWeapon === 'autoRifle');
    DOM.weaponAutoRiflePro.classList.toggle('selected', currentWeapon === 'autoRiflePro');
    DOM.weaponSniper.classList.toggle('selected', currentWeapon === 'sniper');
    DOM.weaponLMG.classList.toggle('selected', currentWeapon === 'lmg');
    
    DOM.weaponAutoRifle.disabled = !player.hasAutoRifleNormal;
    DOM.weaponAutoRiflePro.disabled = !player.hasAutoRifle;
    DOM.weaponSniper.disabled = !player.hasSniperRifle;
    DOM.weaponLMG.disabled = !player.hasLightMachineGun;
    
    const weaponNames = {
        pistol: '手枪',
        autoRifle: '高速自动步枪',
        autoRiflePro: '自动步枪',
        sniper: '射手步枪',
        lmg: '轻机枪'
    };
    DOM.currentWeapon.textContent = `当前武器: ${weaponNames[currentWeapon]}`;
}

function selectWeapon(weaponType) {
    if (weaponType === 'pistol' ||
        (weaponType === 'autoRifle' && player.hasAutoRifleNormal) ||
        (weaponType === 'autoRiflePro' && player.hasAutoRifle) ||
        (weaponType === 'sniper' && player.hasSniperRifle) ||
        (weaponType === 'lmg' && player.hasLightMachineGun)) {
        const weapon = defaultStats[weaponType];
        let ammoExcess = player.currentMagazine - weapon.magazineSize;
        if (ammoExcess > 0) {
            player.ammo += ammoExcess;
            player.currentMagazine = weapon.magazineSize;
        }
        let ammoNeeded = weapon.magazineSize - player.currentMagazine;
        if (ammoNeeded > 0) {
            let ammoToTake = Math.min(ammoNeeded, player.ammo);
            player.ammo -= ammoToTake;
            player.currentMagazine += ammoToTake;
        }
        currentWeapon = weaponType;
        updateWeaponWheel();
        updateUI();
    }
}

function updateShopButtons() {
    document.getElementById('buyHealth').disabled = player.score < 500;
    document.getElementById('buyMaxHealth').disabled = player.score < 1000;
    document.getElementById('buyAmmo').disabled = player.score < 800;
    document.getElementById('buyAutoRifleNormal').disabled = player.score < 1500 || player.hasAutoRifleNormal || player.hasAutoRifle;
    document.getElementById('buyAutoRifle').disabled = player.score < 2000 || player.hasAutoRifle;
    document.getElementById('buySniperRifle').disabled = player.score < 3000 || player.hasSniperRifle;
    document.getElementById('buyLightMachineGun').disabled = player.score < 2500 || player.hasLightMachineGun;
    document.getElementById('buyChestRig').disabled = player.score < 1500 || player.hasChestRig;
    document.getElementById('buyStaminaSlow').disabled = player.score < 1200 || player.hasStaminaSlow;
    document.getElementById('buyStaminaFast').disabled = player.score < 1500 || player.hasStaminaFast;
}

function submitCheat() {
    const password = document.getElementById('cheatInput').value;
    if (password === '212599') {
        player.score += 100000;
        document.getElementById('cheatMessage').textContent = '密码正确！获得100000金币！';
        document.getElementById('cheatMessage').style.color = '#00ff00';
        updateUI();
        setTimeout(() => {
            closeCheat();
        }, 2000);
    } else if (password.toLowerCase() === 'kill') {
        player.health = 0;
        document.getElementById('cheatMessage').textContent = '已执行自杀！';
        document.getElementById('cheatMessage').style.color = '#ff0000';
        setTimeout(() => {
            closeCheat();
            gameOver();
        }, 1000);
    } else {
        document.getElementById('cheatMessage').textContent = '密码错误！';
        document.getElementById('cheatMessage').style.color = '#ff0000';
    }
}

function updateShopButtons() {
    document.getElementById('buyHealth').disabled = player.score < 500;
    document.getElementById('buyMaxHealth').disabled = player.score < 1000;
    document.getElementById('buyAmmo').disabled = player.score < 800;
    document.getElementById('buyAutoRifleNormal').disabled = player.score < 1500 || player.hasAutoRifleNormal || player.hasAutoRifle;
    document.getElementById('buyAutoRifle').disabled = player.score < 2000 || player.hasAutoRifle;
    document.getElementById('buySniperRifle').disabled = player.score < 3000 || player.hasSniperRifle;
    document.getElementById('buyLightMachineGun').disabled = player.score < 2500 || player.hasLightMachineGun;
    document.getElementById('buyChestRig').disabled = player.score < 1500 || player.hasChestRig;
    document.getElementById('buyStaminaSlow').disabled = player.score < 1200 || player.hasStaminaSlow;
    document.getElementById('buyStaminaFast').disabled = player.score < 1500 || player.hasStaminaFast;
}

function selectShopCategory(category) {
    document.querySelectorAll('.categoryBtn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('cat' + category).classList.add('active');
    
    document.querySelectorAll('.shopCategory').forEach(cat => cat.style.display = 'none');
    document.getElementById('catContent' + category).style.display = 'flex';
}

function buyStaminaSlow() {
    if (player.score >= 1200 && !player.hasStaminaSlow) {
        player.score -= 1200;
        player.hasStaminaSlow = true;
        purchaseComplete();
    }
}

function purchaseComplete() {
    DOM.shopCoins.textContent = `金币: ${player.score}`;
    updateShopButtons();
    updateUI();
}

function buyStaminaFast() {
    if (player.score >= 1500 && !player.hasStaminaFast) {
        player.score -= 1500;
        player.hasStaminaFast = true;
        purchaseComplete();
    }
}

function buyHealth() {
    if (player.score >= 500) {
        player.score -= 500;
        player.health = Math.min(player.maxHealth, player.health + 20);
        purchaseComplete();
    }
}

function buyMaxHealth() {
    if (player.score >= 1000) {
        player.score -= 1000;
        player.maxHealth += 10;
        player.health += 10;
        purchaseComplete();
    }
}

function buyAmmo() {
    if (player.score >= 800) {
        player.score -= 800;
        player.ammo = Math.min(player.maxAmmo, player.ammo + 50);
        purchaseComplete();
    }
}

function buyAutoRifleNormal() {
    if (player.score >= 1500 && !player.hasAutoRifleNormal && !player.hasAutoRifle) {
        player.score -= 1500;
        player.hasAutoRifleNormal = true;
        player.fireRate = 5;
        purchaseComplete();
    }
}

function buyAutoRifle() {
    if (player.score >= 2000 && !player.hasAutoRifle) {
        player.score -= 2000;
        player.hasAutoRifle = true;
        player.weaponDamage += 15;
        player.fireRate = Math.floor(player.fireRate * 0.7);
        purchaseComplete();
    }
}

function buySniperRifle() {
    if (player.score >= 3000 && !player.hasSniperRifle) {
        player.score -= 3000;
        player.hasSniperRifle = true;
        player.weaponDamage += 50;
        player.fireRate = Math.floor(player.fireRate * 1.4);
        purchaseComplete();
    }
}

function buyLightMachineGun() {
    if (player.score >= 2500 && !player.hasLightMachineGun) {
        player.score -= 2500;
        player.hasLightMachineGun = true;
        purchaseComplete();
    }
}

function buyChestRig() {
    if (player.score >= 1500 && !player.hasChestRig) {
        player.score -= 1500;
        player.hasChestRig = true;
        player.maxAmmo += 500;
        player.ammo += 500;
        purchaseComplete();
    }
}

function startNextWave() {
    enemiesPerWave = 3 + Math.floor(wave * 1.2);
    for (let i = 0; i < enemiesPerWave; i++) {
        setTimeout(() => spawnEnemy(), i * 500);
    }
    
    if (wave % 10 === 0) {
        setTimeout(() => spawnBoss(), enemiesPerWave * 500 + 1000);
        setTimeout(() => spawnBigBoss(), enemiesPerWave * 500 + 3000);
    }
    
    player.ammo = Math.min(player.maxAmmo, player.ammo + 25);
    player.health = Math.min(player.maxHealth, player.health + 25);
    updateUI();
}

function spawnBoss() {
    let x, y;
    do {
        x = Math.random() * (MAP_SIZE - 4) + 2;
        y = Math.random() * (MAP_SIZE - 4) + 2;
    } while (Math.hypot(x - player.x, y - player.y) < 8 || !isValidPosition(x, y));
    
    enemies.push({
        x, y,
        type: 'boss',
        health: ENEMY_TYPES['boss'].health,
        maxHealth: ENEMY_TYPES['boss'].health,
        angle: Math.random() * Math.PI * 2,
        attackCooldown: 0,
        hitFlash: 0,
        lastShootTime: 0
    });
}

function spawnBigBoss() {
    let x, y;
    do {
        x = Math.random() * (MAP_SIZE - 4) + 2;
        y = Math.random() * (MAP_SIZE - 4) + 2;
    } while (Math.hypot(x - player.x, y - player.y) < 10 || !isValidPosition(x, y));
    
    enemies.push({
        x, y,
        type: 'bigBoss',
        health: ENEMY_TYPES['bigBoss'].health,
        maxHealth: ENEMY_TYPES['bigBoss'].health,
        angle: Math.random() * Math.PI * 2,
        attackCooldown: 0,
        hitFlash: 0,
        isBoss: true
    });
}

function checkWaveComplete() {
    if (enemies.length === 0) {
        wave++;
        startNextWave();
    }
}

let lastFrameTime = 0;
const TARGET_FRAME_TIME = 1000 / 60;

function gameLoop(currentTime) {
    if (!gameRunning) return;
    
    const deltaTime = currentTime - lastFrameTime;
    
    if (deltaTime >= TARGET_FRAME_TIME) {
        lastFrameTime = currentTime - (deltaTime % TARGET_FRAME_TIME);
        
        if (!shopActive && !cheatActive && !weaponWheelActive) {
            updateCameraFromSlider();
            updatePlayer();
            updateBullets();
            updateEnemies();
            updateParticles();
            checkWaveComplete();
            updateReloadUI();
        }
        
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    currentWeapon = 'pistol';
    isScoped = false;
    player = {
        x: 2.5,
        y: 2.5,
        angle: 0,
        health: 150,
        maxHealth: 150,
        stamina: 100,
        maxStamina: 100,
        ammo: 100,
        maxAmmo: 100,
        currentMagazine: 15,
        score: 0,
        kills: 0,
        reloadTime: 0,
        initialReloadTime: 0,
        damageFlash: 0,
        hasAutoRifleNormal: false,
        hasAutoRifle: false,
        hasChestRig: false,
        hasSniperRifle: false,
        hasLightMachineGun: false,
        hasStaminaSlow: false,
        hasStaminaFast: false,
        isShooting: false,
        isReloading: false
    };
    
    enemies = [];
    bullets = [];
    particles = [];
    wave = 1;
    enemiesPerWave = 3;
    shopActive = false;
    
    document.getElementById('shopScreen').style.display = 'none';
    document.getElementById('scopeOverlay').classList.remove('scoped');
    
    for (let i = 0; i < enemiesPerWave; i++) {
        spawnEnemy();
    }
    
    updateUI();
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('pauseMenu').style.display = 'none';
    
    gameStartTime = Date.now();
    gameRunning = true;
    pauseMenuActive = false;
    gameLoop();
}

function gameOver() {
    gameRunning = false;
    
    // 关闭所有其他界面
    document.getElementById('shopScreen').style.display = 'none';
    document.getElementById('cheatScreen').style.display = 'none';
    document.getElementById('weaponWheel').style.display = 'none';
    document.getElementById('pauseMenu').style.display = 'none';
    
    const survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(survivalTime / 60);
    const seconds = survivalTime % 60;
    const survivalTimeStr = `${minutes}分${seconds}秒`;
    
    try {
        saveGameRecord(player.score, currentWave, player.kills, survivalTimeStr);
    } catch (e) {
        console.error('保存游戏记录失败:', e);
    }
    
    document.getElementById('finalScore').textContent = `最终分数: ${player.score}`;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function togglePauseMenu() {
    pauseMenuActive = !pauseMenuActive;
    if (pauseMenuActive) {
        document.getElementById('pauseMenu').style.display = 'flex';
    } else {
        document.getElementById('pauseMenu').style.display = 'none';
    }
}

function resumeGame() {
    pauseMenuActive = false;
    document.getElementById('pauseMenu').style.display = 'none';
    if (!virtualControlsEnabled) {
        canvas.requestPointerLock();
    }
}

function quitToMenu() {
    gameRunning = false;
    pauseMenuActive = false;
    
    // 关闭所有界面
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('shopScreen').style.display = 'none';
    document.getElementById('cheatScreen').style.display = 'none';
    document.getElementById('weaponWheel').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('userCenterScreen').style.display = 'none';
    
    // 显示主菜单
    document.getElementById('startScreen').style.display = 'flex';
}

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        e.preventDefault();
        if (spaceShoot && gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
            shoot();
        }
    }
    if (e.code === 'KeyR') {
        if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
            reload();
        }
    }
    if (e.code === 'Digit5') {
        if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
            openShop();
        }
    }
    if (e.code === 'Digit0') {
        if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
            openCheat();
        }
    }
    if (e.code === 'Digit8') {
        if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
            openWeaponWheel();
        } else if (weaponWheelActive) {
            closeWeaponWheel();
        }
    }
    if (e.code === 'Escape') {
        if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive) {
            togglePauseMenu();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

canvas.addEventListener('click', () => {
    if (!virtualControlsEnabled) {
        canvas.requestPointerLock();
    }
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas && !shopActive) {
        player.angle += e.movementX * 0.01 * sensitivity;
        pitch -= e.movementY * 0.02 * sensitivity;
        pitch = Math.max(-Math.PI * 85 / 180, Math.min(Math.PI * 85 / 180, pitch));
    }
});

document.addEventListener('pointerlockchange', () => {
    if (!virtualControlsEnabled && document.pointerLockElement !== canvas && gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
        pauseMenuActive = true;
        document.getElementById('pauseMenu').style.display = 'flex';
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        if (!virtualControlsEnabled) {
            shoot();
            if (defaultStats[currentWeapon].canAutoFire) {
                player.isShooting = true;
            }
        }
    }
    if (e.button === 2) {
        if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive) {
            isScoped = true;
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        if (!virtualControlsEnabled) {
            player.isShooting = false;
        }
    }
    if (e.button === 2) {
        isScoped = false;
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('backToMenuBtn').addEventListener('click', quitToMenu);
document.getElementById('resumeBtn').addEventListener('click', resumeGame);
document.getElementById('quitBtn').addEventListener('click', quitToMenu);
document.getElementById('closeShop').addEventListener('click', closeShop);
document.getElementById('buyHealth').addEventListener('click', buyHealth);
document.getElementById('buyMaxHealth').addEventListener('click', buyMaxHealth);
document.getElementById('buyAmmo').addEventListener('click', buyAmmo);
document.getElementById('buyAutoRifleNormal').addEventListener('click', buyAutoRifleNormal);
document.getElementById('buyAutoRifle').addEventListener('click', buyAutoRifle);
document.getElementById('buySniperRifle').addEventListener('click', buySniperRifle);
document.getElementById('buyLightMachineGun').addEventListener('click', buyLightMachineGun);
document.getElementById('buyChestRig').addEventListener('click', buyChestRig);
document.getElementById('closeCheat').addEventListener('click', closeCheat);
document.getElementById('submitCheat').addEventListener('click', submitCheat);
document.getElementById('cheatInput').addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        submitCheat();
    }
});

document.getElementById('weaponPistol').addEventListener('click', () => { selectWeapon('pistol'); closeWeaponWheel(); });
document.getElementById('weaponAutoRifle').addEventListener('click', () => { selectWeapon('autoRifle'); closeWeaponWheel(); });
document.getElementById('weaponAutoRiflePro').addEventListener('click', () => { selectWeapon('autoRiflePro'); closeWeaponWheel(); });
document.getElementById('weaponSniper').addEventListener('click', () => { selectWeapon('sniper'); closeWeaponWheel(); });
document.getElementById('weaponLMG').addEventListener('click', () => { selectWeapon('lmg'); closeWeaponWheel(); });

document.getElementById('catMedical').addEventListener('click', () => { selectShopCategory('Medical'); });
document.getElementById('catEquipment').addEventListener('click', () => { selectShopCategory('Equipment'); });
document.getElementById('catAmmo').addEventListener('click', () => { selectShopCategory('Ammo'); });
document.getElementById('catInjectors').addEventListener('click', () => { selectShopCategory('Injectors'); });

document.getElementById('buyStaminaSlow').addEventListener('click', buyStaminaSlow);
document.getElementById('buyStaminaFast').addEventListener('click', buyStaminaFast);

document.getElementById('settingsBtn').addEventListener('click', openSettings);
document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);

document.getElementById('userCenterBtn').addEventListener('click', openUserCenter);
document.getElementById('closeUserCenterBtn').addEventListener('click', closeUserCenter);

document.getElementById('tabSensitivity').addEventListener('click', () => { selectSettingsTab('Sensitivity'); });
document.getElementById('tabMobile').addEventListener('click', () => { selectSettingsTab('Mobile'); });
document.getElementById('tabControls').addEventListener('click', () => { selectSettingsTab('Controls'); });

document.getElementById('sensitivitySlider').addEventListener('input', updateSensitivity);
document.getElementById('toggleArrowKeys').addEventListener('click', toggleArrowKeys);
document.getElementById('toggleSpaceShoot').addEventListener('click', toggleSpaceShoot);
document.getElementById('toggleSeeThroughWalls').addEventListener('click', toggleSeeThroughWalls);
document.getElementById('toggleRadar').addEventListener('click', toggleRadar);
document.getElementById('toggleVirtualControls').addEventListener('click', toggleVirtualControls);
document.getElementById('togglePortrait').addEventListener('click', togglePortrait);
document.getElementById('toggleAutoAim').addEventListener('click', toggleAutoAim);
document.getElementById('autoAimSlider').addEventListener('input', function(e) {
    updateAutoAimStrength(e.target.value);
});

// 虚拟按键事件监听
document.getElementById('reloadButton').addEventListener('touchstart', virtualReload);
document.getElementById('reloadButton').addEventListener('touchend', (e) => e.preventDefault());
document.getElementById('reloadButton').addEventListener('click', virtualReload);
document.getElementById('reloadButton').addEventListener('pointerdown', virtualReload);
document.getElementById('reloadButton').addEventListener('pointerup', (e) => e.preventDefault());

document.getElementById('shootButton').addEventListener('touchstart', virtualShootStart);
document.getElementById('shootButton').addEventListener('touchend', virtualShootEnd);
document.getElementById('shootButton').addEventListener('mousedown', virtualShootStart);
document.getElementById('shootButton').addEventListener('mouseup', virtualShootEnd);

document.getElementById('shopBtn').addEventListener('touchstart', virtualOpenShop);
document.getElementById('shopBtn').addEventListener('click', virtualOpenShop);

document.getElementById('weaponBtn').addEventListener('touchstart', virtualOpenWeaponWheel);
document.getElementById('weaponBtn').addEventListener('click', virtualOpenWeaponWheel);

document.getElementById('cheatBtn').addEventListener('touchstart', virtualOpenCheat);
document.getElementById('cheatBtn').addEventListener('click', virtualOpenCheat);

document.getElementById('quitButton').addEventListener('touchstart', virtualQuit);
document.getElementById('quitButton').addEventListener('click', virtualQuit);

// 虚拟摇杆事件
const joystick = document.getElementById('joystick');
const joystickContainer = document.getElementById('joystickContainer');

joystick.addEventListener('touchstart', joystickStart);
joystick.addEventListener('touchmove', joystickMove);
joystick.addEventListener('touchend', joystickEnd);

joystick.addEventListener('mousedown', joystickStart);
joystickContainer.addEventListener('mousemove', joystickMove);
joystickContainer.addEventListener('mouseup', joystickEnd);
joystickContainer.addEventListener('mouseleave', joystickEnd);

// 视角控制滑块事件
const cameraSlider = document.getElementById('cameraSlider');
const cameraSliderContainer = document.getElementById('cameraSliderContainer');

cameraSlider.addEventListener('touchstart', cameraSliderStart);
cameraSliderContainer.addEventListener('touchmove', cameraSliderMove);
cameraSliderContainer.addEventListener('touchend', cameraSliderEnd);
cameraSliderContainer.addEventListener('touchcancel', cameraSliderEnd);

cameraSlider.addEventListener('mousedown', cameraSliderStart);
cameraSliderContainer.addEventListener('mousemove', cameraSliderMove);
cameraSliderContainer.addEventListener('mouseup', cameraSliderEnd);
cameraSliderContainer.addEventListener('mouseleave', cameraSliderEnd);

function openSettings() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
}

let userId = '';

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userId = data.ip;
        document.getElementById('userId').textContent = userId;
        localStorage.setItem('userId', userId);
    } catch (error) {
        userId = localStorage.getItem('userId') || 'Unknown';
        document.getElementById('userId').textContent = userId;
    }
}

function saveGameRecord(score, wave, kills, survivalTime) {
    let history = JSON.parse(localStorage.getItem('gameHistory')) || [];
    const record = {
        date: new Date().toLocaleString('zh-CN'),
        score: score,
        wave: wave,
        kills: kills,
        survivalTime: survivalTime
    };
    history.unshift(record);
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    localStorage.setItem('gameHistory', JSON.stringify(history));
}

function loadGameHistory() {
    const history = JSON.parse(localStorage.getItem('gameHistory')) || [];
    const historyList = document.getElementById('historyList');
    const noHistory = document.getElementById('noHistory');
    
    if (history.length === 0) {
        noHistory.style.display = 'block';
        return;
    }
    
    noHistory.style.display = 'none';
    historyList.innerHTML = '';
    
    history.forEach((record, index) => {
        const item = document.createElement('div');
        item.className = 'historyItem';
        item.innerHTML = `
            <h3>第 ${index + 1} 局 - ${record.date}</h3>
            <p>分数: ${record.score}</p>
            <p>波次: ${record.wave}</p>
            <p>击杀数: ${record.kills}</p>
            <p>存活时间: ${record.survivalTime}</p>
        `;
        historyList.appendChild(item);
    });
}

function openUserCenter() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('userCenterScreen').style.display = 'flex';
    getUserIP();
    loadGameHistory();
}

function closeUserCenter() {
    document.getElementById('userCenterScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
}

function selectSettingsTab(tab) {
    document.querySelectorAll('.tabBtn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab' + tab).classList.add('active');
    
    document.querySelectorAll('.settingsTab').forEach(t => t.style.display = 'none');
    document.getElementById('tabContent' + tab).style.display = 'flex';
}

function updateSensitivity() {
    sensitivity = parseFloat(document.getElementById('sensitivitySlider').value);
    document.getElementById('sensitivityValue').textContent = sensitivity.toFixed(1) + 'x';
}

function toggleArrowKeys() {
    let toggle = document.getElementById('toggleArrowKeys');
    arrowKeyMovement = !arrowKeyMovement;
    toggle.classList.toggle('active');
}

function toggleSpaceShoot() {
    let toggle = document.getElementById('toggleSpaceShoot');
    spaceShoot = !spaceShoot;
    toggle.classList.toggle('active');
}

function toggleSeeThroughWalls() {
    let toggle = document.getElementById('toggleSeeThroughWalls');
    seeThroughWalls = !seeThroughWalls;
    toggle.classList.toggle('active');
}

function toggleRadar() {
    let toggle = document.getElementById('toggleRadar');
    radarEnabled = !radarEnabled;
    toggle.classList.toggle('active');
}

function toggleVirtualControls() {
    let toggle = document.getElementById('toggleVirtualControls');
    virtualControlsEnabled = !virtualControlsEnabled;
    toggle.classList.toggle('active');
    const virtualControls = document.getElementById('virtualControls');
    if (virtualControlsEnabled) {
        virtualControls.classList.add('active');
    } else {
        virtualControls.classList.remove('active');
    }
    updateAutoAimEnabled();
}

function togglePortrait() {
    let toggle = document.getElementById('togglePortrait');
    portraitMode = !portraitMode;
    toggle.classList.toggle('active');
    const body = document.body;
    if (portraitMode) {
        body.classList.add('portrait');
    } else {
        body.classList.remove('portrait');
    }
    updateAutoAimEnabled();
}

function updateAutoAimEnabled() {
    const autoAimToggle = document.getElementById('toggleAutoAim');
    const autoAimSlider = document.getElementById('autoAimSlider');
    const canEnable = virtualControlsEnabled && portraitMode;
    
    autoAimToggle.disabled = !canEnable;
    
    if (!canEnable || !autoAimEnabled) {
        autoAimSlider.disabled = true;
    } else {
        autoAimSlider.disabled = false;
    }
    
    if (!canEnable && autoAimEnabled) {
        autoAimEnabled = false;
        autoAimToggle.classList.remove('active');
    }
}

function toggleAutoAim() {
    if (!virtualControlsEnabled || !portraitMode) return;
    
    let toggle = document.getElementById('toggleAutoAim');
    autoAimEnabled = !autoAimEnabled;
    toggle.classList.toggle('active');
    updateAutoAimEnabled();
}

function updateAutoAimStrength(value) {
    autoAimStrength = parseInt(value);
    document.getElementById('autoAimValue').textContent = `${Math.round((autoAimStrength / 180) * 100)}%`;
}

// 自动瞄准吸附逻辑
function applyAutoAim() {
    if (!autoAimEnabled || !virtualControlsEnabled || !portraitMode || enemies.length === 0) return;
    
    let closestEnemy = null;
    let closestDistance = Infinity;
    let closestAngle = 0;
    
    for (let enemy of enemies) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < closestDistance) {
            // 检查是否有视线（不穿墙）
            if (hasLineOfSight(player.x, player.y, enemy.x, enemy.y)) {
                closestDistance = distance;
                closestEnemy = enemy;
                closestAngle = Math.atan2(dy, dx);
            }
        }
    }
    
    if (closestEnemy) {
        const angleDiff = closestAngle - player.angle;
        const normalizedDiff = ((angleDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
        
        const maxAngle = (autoAimStrength * Math.PI) / 180;
        
        if (Math.abs(normalizedDiff) < maxAngle) {
            const lerpFactor = 0.1;
            player.angle += normalizedDiff * lerpFactor;
        }
    }
}

// 视线检测函数（射线检测）
function hasLineOfSight(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy);
    
    const steps = Math.ceil(distance * 2);
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    for (let i = 0; i <= steps; i++) {
        const x = x1 + stepX * i;
        const y = y1 + stepY * i;
        
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);
        
        if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
            if (map[tileY][tileX] !== 0) {
                return false;
            }
        }
    }
    
    return true;
}

// 虚拟摇杆函数
function joystickStart(e) {
    e.preventDefault();
    joystickActive = true;
    const rect = joystickContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    if (e.touches) {
        joystickStartX = e.touches[0].clientX - centerX;
        joystickStartY = e.touches[0].clientY - centerY;
    } else {
        joystickStartX = e.clientX - centerX;
        joystickStartY = e.clientY - centerY;
    }
    
    joystickDeltaX = 0;
    joystickDeltaY = 0;
}

function joystickMove(e) {
    if (!joystickActive) return;
    e.preventDefault();
    
    const rect = joystickContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    joystickDeltaX = clientX - centerX;
    joystickDeltaY = clientY - centerY;
    
    const maxDelta = 60;
    const distance = Math.sqrt(joystickDeltaX * joystickDeltaX + joystickDeltaY * joystickDeltaY);
    
    if (distance > maxDelta) {
        joystickDeltaX = (joystickDeltaX / distance) * maxDelta;
        joystickDeltaY = (joystickDeltaY / distance) * maxDelta;
    }
    
    joystick.style.transform = `translate(${joystickDeltaX}px, ${joystickDeltaY}px)`;
}

function joystickEnd() {
    joystickActive = false;
    joystickDeltaX = 0;
    joystickDeltaY = 0;
    joystick.style.transform = 'translate(-50%, -50%)';
}

// 视角控制滑块函数
function cameraSliderStart(e) {
    e.preventDefault();
    cameraSliderActive = true;
    const rect = cameraSliderContainer.getBoundingClientRect();
    
    if (e.touches) {
        cameraSliderStartX = e.touches[0].clientX - rect.left;
    } else {
        cameraSliderStartX = e.clientX - rect.left;
    }
    cameraSliderDelta = 0;
}

function cameraSliderMove(e) {
    if (!cameraSliderActive) return;
    e.preventDefault();
    
    const rect = cameraSliderContainer.getBoundingClientRect();
    let clientX;
    
    if (e.touches) {
        clientX = e.touches[0].clientX;
    } else {
        clientX = e.clientX;
    }
    
    cameraSliderDelta = (clientX - rect.left) - cameraSliderStartX;
    
    const maxDelta = rect.width / 2 - 20;
    cameraSliderDelta = Math.max(-maxDelta, Math.min(maxDelta, cameraSliderDelta));
    
    cameraSlider.style.transform = `translate(calc(-50% + ${cameraSliderDelta}px), -50%)`;
}

// 在游戏循环中处理视角转动
function updateCameraFromSlider() {
    if (!cameraSliderActive) return;
    
    const maxDelta = cameraSliderContainer.getBoundingClientRect().width / 2 - 20;
    const percentage = cameraSliderDelta / maxDelta;
    
    // 使用平滑的转动速度
    const rotationSpeed = 0.08;
    player.angle += percentage * rotationSpeed;
}

function cameraSliderEnd() {
    cameraSliderActive = false;
    cameraSliderDelta = 0;
    cameraSlider.style.transform = 'translate(-50%, -50%)';
}

// 虚拟射击按钮
function virtualShootStart(e) {
    e.preventDefault();
    if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
        shoot();
        if (defaultStats[currentWeapon].canAutoFire) {
            player.isShooting = true;
        }
    }
}

function virtualShootEnd() {
    player.isShooting = false;
}

// 虚拟换弹按钮
function virtualReload(e) {
    e.preventDefault();
    if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
        reload();
    }
}

// 虚拟摇杆函数虚拟商店按钮
function virtualOpenShop(e) {
    e.preventDefault();
    if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
        openShop();
    }
}

// 虚拟武器轮盘按钮
function virtualOpenWeaponWheel(e) {
    e.preventDefault();
    if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
        openWeaponWheel();
    }
}

// 虚拟作弊菜单按钮
function virtualOpenCheat(e) {
    e.preventDefault();
    if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
        openCheat();
    }
}

// 虚拟退出按钮
function virtualQuit(e) {
    e.preventDefault();
    if (gameRunning) {
        togglePauseMenu();
    }
}

render();
updateUI();