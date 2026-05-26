
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
    rpgScopeOverlay: document.getElementById('rpgScopeOverlay'),
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
    weaponRPG: document.getElementById('weaponRPG'),
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
    gameContainer: document.getElementById('gameContainer'),
    weaponModel: document.getElementById('weaponModel')
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
    [1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
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
    hasRPG: false,
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
let halfScreenJoystick = false; // 半屏摇杆模式
let autoAimEnabled = false;
let autoAimStrength = 90; // 吸附角度范围（度）
let virtualSprintActive = false; // 虚拟疾跑
let sprintToggleState = false; // 疾跑开关状态
let weaponModelEnabled = true; // 武器模型开关
let scopeShakeEnabled = false; // 开镜晃动开关
let autoShootEnabled = false; // 自动射击开关
let scopeStyle = 'classic'; // 瞄准镜样式

// 武器动画相关
let weaponRecoil = 0; // 后坐力
let weaponBob = 0; // 行走晃动
let weaponSway = 0; // 武器摇摆
let weaponReloadProgress = 0; // 换弹进度
let weaponScopeZoom = 1; // 开镜缩放
let scopeShake = 0; // 开镜镜头晃动
let scopeShakeX = 0; // 开镜晃动X偏移
let scopeShakeY = 0; // 开镜晃动Y偏移
let weaponModelCtx = null;

// 虚拟按键相关
let joystickActive = false;
let joystickStartX = 0;
let joystickStartY = 0;
let joystickDeltaX = 0;
let joystickDeltaY = 0;
let joystickTouchId = null; // 用于追踪触摸ID

// 视角控制滑块相关
let cameraSliderActive = false;
let cameraSliderStartX = 0;
let cameraSliderDelta = 0;

const defaultStats = {
    pistol: { damage: 20, fireRate: 15, canAutoFire: false, isDual: false, spread: 0.08, spreadVertical: 0.04, zoom: 1.25, magazineSize: 15, reloadTime: 60 },
    autoRifle: { damage: 35, fireRate: 5, canAutoFire: true, isDual: false, spread: 0.04, spreadVertical: 0.02, zoom: 1.25, magazineSize: 45, reloadTime: 120 },
    autoRiflePro: { damage: 35, fireRate: 10, canAutoFire: true, isDual: false, spread: 0.035, spreadVertical: 0.018, zoom: 1.25, magazineSize: 45, reloadTime: 120 },
    sniper: { damage: 70, fireRate: 21, canAutoFire: false, isDual: false, spread: 0.18, spreadVertical: 0.09, zoom: 2.0, magazineSize: 20, reloadTime: 150 },
    lmg: { damage: 20, fireRate: 15, canAutoFire: false, isDual: true, spread: 0.11, spreadVertical: 0.055, zoom: 1.25, magazineSize: 100, reloadTime: 300 },
    rpg: { damage: 100, fireRate: 60, canAutoFire: false, isDual: false, spread: 0.02, spreadVertical: 0.01, zoom: 1.5, magazineSize: 3, reloadTime: 120, splashRadius: 2.5 }
};
let enemiesPerWave = 6;

const ENEMY_TYPES = {
    zombie: { color: '#6b8e4e', health: 30, speed: 0.012, damage: 5, score: 100, size: 0.32, attackRange: 1.5, isRanged: false },
    demon: { color: '#ff4444', health: 60, speed: 0.015, damage: 8, score: 200, size: 0.38, attackRange: 1.5, isRanged: false },
    crawler: { color: '#aa44cc', health: 20, speed: 0.025, damage: 3, score: 150, size: 0.28, attackRange: 1.2, isRanged: false },
    boss: { color: '#ff0000', health: 500, speed: 0.02, damage: 20, score: 2000, size: 0.5, attackRange: 2, isRanged: false },
    bigboss: { color: '#ff0066', health: 800, speed: 0.015, damage: 30, score: 5000, size: 0.6, attackRange: 2.5, isRanged: false },
    shooter: { color: '#4488ff', health: 15, speed: 0.018, damage: 10, score: 180, size: 0.25, attackRange: 6, isRanged: true, shootCooldown: 120 },
    shadow: { color: '#00ffff', health: 45, speed: 0.018, damage: 8, score: 250, size: 0.35, attackRange: 5, isRanged: true, showOutline: true, projectileType: 'sonic' }
};

function spawnEnemy(typeOverride = null) {
    let type = typeOverride;
    if (!type) {
        if (wave < 3) type = 'zombie';
        else if (wave < 5) {
            const rand = Math.random();
            if (rand > 0.5) type = 'zombie';
            else if (rand > 0.25) type = 'crawler';
            else type = 'shooter';
        } else if (wave < 8) {
            const rand = Math.random();
            if (rand > 0.4) type = 'zombie';
            else if (rand > 0.2) type = 'crawler';
            else if (rand > 0.05) type = 'demon';
            else type = 'shooter';
        } else {
            const rand = Math.random();
            if (rand > 0.35) type = 'zombie';
            else if (rand > 0.15) type = 'crawler';
            else if (rand > 0.05) type = 'demon';
            else type = 'shooter';
        }
    }
    
    if (wave >= 4 && Math.random() > 0.7) {
        type = 'shadow';
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
    
    // 更新开镜晃动
    if (isScoped && scopeShakeEnabled) {
        scopeShake += 0.1;
        scopeShakeX = Math.sin(scopeShake * 2) * 3 + Math.sin(scopeShake * 0.7) * 2;
        scopeShakeY = Math.cos(scopeShake * 1.5) * 3 + Math.cos(scopeShake * 0.5) * 2;
    } else {
        scopeShakeX = 0;
        scopeShakeY = 0;
    }
    
    let rayWidth = SCREEN_WIDTH / NUM_RAYS;
    
    let verticalOffset = pitch / (Math.PI * 85 / 180) * SCREEN_HEIGHT * 0.25 + scopeShakeY;
    
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
    drawWeaponModel();
    drawScopeCrosshair();
}

// 绘制瞄准镜（不受武器模型开关影响）
function drawScopeCrosshair() {
    if (!isScoped) return;
    
    let scopeX = SCREEN_WIDTH / 2;
    let scopeY = SCREEN_HEIGHT / 2;
    
    // 竖屏模式下瞄准镜缩小并上移
    let isPortrait = portraitMode && window.innerHeight > window.innerWidth;
    let scopeScale = isPortrait ? 0.5 : 0.7;
    let scopeOffsetY = isPortrait ? -SCREEN_HEIGHT * 0.08 : 0;
    
    scopeY += scopeOffsetY;
    
    // 根据武器类型确定基础尺寸
    let baseScopeSize = currentWeapon === 'sniper' ? 0.15 : 0.12;
    let scopeSize = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * baseScopeSize * scopeScale;
    
    // 根据样式绘制瞄准镜
    switch(scopeStyle) {
        case 'classic':
            drawClassicScope(scopeX, scopeY, scopeSize);
            break;
        case 'dot':
            drawDotScope(scopeX, scopeY, scopeSize);
            break;
        case 'holo':
            drawHoloScope(scopeX, scopeY, scopeSize);
            break;
        case 'simple':
            drawSimpleScope(scopeX, scopeY, scopeSize);
            break;
        case 'cross':
            drawCrossScope(scopeX, scopeY, scopeSize);
            break;
    }
}

// 经典样式
function drawClassicScope(x, y, size) {
    if (currentWeapon === 'sniper') {
        // 圆形瞄准镜
        ctx.strokeStyle = 'rgba(60, 60, 60, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
        ctx.lineWidth = 0.5;
        let lineLen = size * 0.6;
        ctx.beginPath();
        ctx.moveTo(x - lineLen, y);
        ctx.lineTo(x + lineLen, y);
        ctx.moveTo(x, y - lineLen);
        ctx.lineTo(x, y + lineLen);
        ctx.stroke();
    } else {
        // 方框瞄准镜
        let halfSize = size / 2;
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - halfSize, y - halfSize, size, size);
        
        // 四角标记
        ctx.strokeStyle = 'rgba(120, 120, 120, 0.5)';
        ctx.lineWidth = 1;
        let cornerLen = size * 0.2;
        // 左上角
        ctx.beginPath();
        ctx.moveTo(x - halfSize, y - halfSize + cornerLen);
        ctx.lineTo(x - halfSize, y - halfSize);
        ctx.lineTo(x - halfSize + cornerLen, y - halfSize);
        ctx.stroke();
        // 右上角
        ctx.beginPath();
        ctx.moveTo(x + halfSize - cornerLen, y - halfSize);
        ctx.lineTo(x + halfSize, y - halfSize);
        ctx.lineTo(x + halfSize, y - halfSize + cornerLen);
        ctx.stroke();
        // 左下角
        ctx.beginPath();
        ctx.moveTo(x - halfSize, y + halfSize - cornerLen);
        ctx.lineTo(x - halfSize, y + halfSize);
        ctx.lineTo(x - halfSize + cornerLen, y + halfSize);
        ctx.stroke();
        // 右下角
        ctx.beginPath();
        ctx.moveTo(x + halfSize - cornerLen, y + halfSize);
        ctx.lineTo(x + halfSize, y + halfSize);
        ctx.lineTo(x + halfSize, y + halfSize - cornerLen);
        ctx.stroke();
        
        // 细十字线（在方框内）
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.lineWidth = 0.5;
        let lineLen = halfSize * 0.7;
        ctx.beginPath();
        ctx.moveTo(x - lineLen, y);
        ctx.lineTo(x + lineLen, y);
        ctx.moveTo(x, y - lineLen);
        ctx.lineTo(x, y + lineLen);
        ctx.stroke();
    }
    
    // 中心红点
    ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
}

// 红点样式
function drawDotScope(x, y, size) {
    // 外框
    if (currentWeapon === 'sniper') {
        ctx.strokeStyle = 'rgba(40, 150, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        let halfSize = size / 2;
        ctx.strokeStyle = 'rgba(40, 150, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - halfSize, y - halfSize, size, size);
    }
    
    // 中心大红点
    ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
}

// 全息样式
function drawHoloScope(x, y, size) {
    // 全息网格效果
    ctx.strokeStyle = 'rgba(0, 255, 150, 0.3)';
    ctx.lineWidth = 1;
    
    let gridSize = size * 0.15;
    for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - size * 0.5, y + i * gridSize);
        ctx.lineTo(x + size * 0.5, y + i * gridSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + i * gridSize, y - size * 0.5);
        ctx.lineTo(x + i * gridSize, y + size * 0.5);
        ctx.stroke();
    }
    
    // 外圈
    ctx.strokeStyle = 'rgba(0, 255, 150, 0.5)';
    ctx.lineWidth = 2;
    if (currentWeapon === 'sniper') {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        let halfSize = size / 2;
        ctx.strokeRect(x - halfSize, y - halfSize, size, size);
    }
    
    // 中心菱形
    ctx.strokeStyle = 'rgba(0, 255, 150, 0.7)';
    ctx.lineWidth = 2;
    let diamondSize = size * 0.1;
    ctx.beginPath();
    ctx.moveTo(x, y - diamondSize);
    ctx.lineTo(x + diamondSize, y);
    ctx.lineTo(x, y + diamondSize);
    ctx.lineTo(x - diamondSize, y);
    ctx.closePath();
    ctx.stroke();
    
    // 中心点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

// 简洁样式
function drawSimpleScope(x, y, size) {
    // 极简十字线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    
    let lineLen = size * 0.4;
    ctx.beginPath();
    ctx.moveTo(x - lineLen, y);
    ctx.lineTo(x + lineLen, y);
    ctx.moveTo(x, y - lineLen);
    ctx.lineTo(x, y + lineLen);
    ctx.stroke();
    
    // 中心小白点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

// 十字样式
function drawCrossScope(x, y, size) {
    // 粗十字线
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.8)';
    ctx.lineWidth = 2;
    
    let mainLen = size * 0.5;
    let shortLen = size * 0.15;
    
    // 水平线
    ctx.beginPath();
    ctx.moveTo(x - mainLen, y);
    ctx.lineTo(x - shortLen, y);
    ctx.moveTo(x + shortLen, y);
    ctx.lineTo(x + mainLen, y);
    ctx.stroke();
    
    // 垂直线
    ctx.beginPath();
    ctx.moveTo(x, y - mainLen);
    ctx.lineTo(x, y - shortLen);
    ctx.moveTo(x, y + shortLen);
    ctx.lineTo(x, y + mainLen);
    ctx.stroke();
    
    // 四角延伸线
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
    ctx.lineWidth = 1;
    let cornerLen = size * 0.3;
    // 左上
    ctx.beginPath();
    ctx.moveTo(x - cornerLen, y - cornerLen);
    ctx.lineTo(x - cornerLen * 0.6, y - cornerLen * 0.6);
    ctx.stroke();
    // 右上
    ctx.beginPath();
    ctx.moveTo(x + cornerLen, y - cornerLen);
    ctx.lineTo(x + cornerLen * 0.6, y - cornerLen * 0.6);
    ctx.stroke();
    // 左下
    ctx.beginPath();
    ctx.moveTo(x - cornerLen, y + cornerLen);
    ctx.lineTo(x - cornerLen * 0.6, y + cornerLen * 0.6);
    ctx.stroke();
    // 右下
    ctx.beginPath();
    ctx.moveTo(x + cornerLen, y + cornerLen);
    ctx.lineTo(x + cornerLen * 0.6, y + cornerLen * 0.6);
    ctx.stroke();
    
    // 中心橙点
    ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
}

// 中心红点（通用）
function drawCenterDot(x, y) {
    ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
    ctx.beginPath();
    ctx.arc(scopeX, scopeY, 2, 0, Math.PI * 2);
    ctx.fill();
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
        let spriteWidth = spriteHeight * 0.9;
        
        let brightness = Math.max(0.3, 1 - dist / MAX_DEPTH);
        let enemyColor = adjustBrightness(ENEMY_TYPES[enemy.type].color, brightness);
        
        if (enemy.hitFlash > 0) {
            enemyColor = '#fff';
        }
        
        let baseX = screenX;
        let baseY = SCREEN_HEIGHT / 2 - spriteHeight / 2 + verticalOffset;
        
        if (ENEMY_TYPES[enemy.type].showOutline) {
            ctx.save();
            ctx.strokeStyle = enemyColor;
            ctx.lineWidth = 3;
            ctx.shadowColor = enemyColor;
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.arc(baseX, baseY + spriteHeight / 2, spriteWidth / 2, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(baseX, baseY + spriteHeight / 2, spriteWidth / 2 - 5, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        } else {
            drawEnemy(ctx, enemy.type, baseX, baseY, spriteWidth, spriteHeight, enemyColor, brightness);
        }
        
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
        
    } else if (type === 'shooter') {
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.5, w * 0.35, h * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = adjustBrightness('#2244aa', brightness);
        ctx.fillRect(x - w * 0.3, y + h * 0.25, w * 0.6, h * 0.5);
        
        ctx.fillStyle = adjustBrightness('#6688ff', brightness);
        ctx.beginPath();
        ctx.arc(x, y + h * 0.2, w * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - w * 0.08, y + h * 0.18, w * 0.05, 0, Math.PI * 2);
        ctx.arc(x + w * 0.08, y + h * 0.18, w * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - w * 0.08, y + h * 0.18, w * 0.03, 0, Math.PI * 2);
        ctx.arc(x + w * 0.08, y + h * 0.18, w * 0.03, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = adjustBrightness('#1a3388', brightness);
        ctx.fillRect(x + w * 0.15, y + h * 0.35, w * 0.4, h * 0.08);
        
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
    } else if (type === 'bigboss') {
        // Big Boss - 更大更强大的Boss
        ctx.fillStyle = '#aa0044';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w * 0.55, y + h * 0.15);
        ctx.lineTo(x + w * 0.5, y + h * 0.5);
        ctx.lineTo(x + w * 0.4, y + h);
        ctx.lineTo(x - w * 0.4, y + h);
        ctx.lineTo(x - w * 0.5, y + h * 0.5);
        ctx.lineTo(x - w * 0.55, y + h * 0.15);
        ctx.closePath();
        ctx.fill();
        
        // 角
        ctx.fillStyle = '#ff0066';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.45, y);
        ctx.lineTo(x - w * 0.25, y - h * 0.4);
        ctx.lineTo(x - w * 0.1, y + h * 0.05);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + w * 0.45, y);
        ctx.lineTo(x + w * 0.25, y - h * 0.4);
        ctx.lineTo(x + w * 0.1, y + h * 0.05);
        ctx.closePath();
        ctx.fill();
        
        // 胸部护甲
        ctx.fillStyle = '#cc0055';
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.4, w * 0.3, w * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#ff3399';
        ctx.beginPath();
        ctx.arc(x - w * 0.15, y + h * 0.35, w * 0.12, 0, Math.PI * 2);
        ctx.arc(x + w * 0.15, y + h * 0.35, w * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - w * 0.15, y + h * 0.35, w * 0.06, 0, Math.PI * 2);
        ctx.arc(x + w * 0.15, y + h * 0.35, w * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴巴
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.18, y + h * 0.55);
        ctx.lineTo(x, y + h * 0.68);
        ctx.lineTo(x + w * 0.18, y + h * 0.55);
        ctx.lineTo(x, y + h * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // 手臂
        ctx.fillStyle = adjustBrightness('#660033', brightness);
        ctx.fillRect(x - w * 0.4, y + h * 0.35, w * 0.15, h * 0.5);
        ctx.fillRect(x + w * 0.25, y + h * 0.35, w * 0.15, h * 0.5);
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
        
        // 根据子弹类型设置颜色和样式
        if (bullet.isSonic) {
            // 超声波炮 - 青色带脉动效果
            let pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
            if (bullet.isMain) {
                ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
                ctx.beginPath();
                ctx.arc(screenX, screenY, bulletSize * 1.2, 0, Math.PI * 2);
                ctx.fill();
                // 添加外圈光晕
                ctx.fillStyle = `rgba(0, 255, 255, ${pulse * 0.3})`;
                ctx.beginPath();
                ctx.arc(screenX, screenY, bulletSize * 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = `rgba(0, 200, 255, ${pulse * 0.7})`;
                ctx.beginPath();
                ctx.arc(screenX, screenY, bulletSize * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (bullet.isRPG) {
            // RPG火箭弹 - 简化渲染
            // 尾焰
            ctx.fillStyle = 'rgba(255, 150, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(screenX - bulletSize, screenY, bulletSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 火箭弹主体
            ctx.fillStyle = '#ff3232';
            ctx.beginPath();
            ctx.arc(screenX, screenY, bulletSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 内部亮点
            ctx.fillStyle = '#ff6666';
            ctx.beginPath();
            ctx.arc(screenX, screenY, bulletSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(screenX, screenY, bulletSize, 0, Math.PI * 2);
            ctx.fill();
        }
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
    
    // 疾跑条件：Shift键或虚拟疾跑按钮按下，且有体力
    let isSprinting = (keys['ShiftLeft'] || keys['ShiftRight'] || virtualSprintActive) && player.stamina > 0.5 && isMoving;
    
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
    
    // 添加后坐力
    weaponRecoil = 1;
    
    const weapon = defaultStats[currentWeapon];
    let ammoCost = currentWeapon === 'rpg' ? 3 : (weapon.isDual ? 1 : 1);
    let bulletsToFire = weapon.isDual ? 2 : 1;
    
    if (player.currentMagazine < ammoCost) return;
    
    player.currentMagazine -= ammoCost;
    player.reloadTime = weapon.fireRate;
    
    // 火箭筒一次性发射所有弹匣中的子弹（3发）
    const rpgBurstCount = currentWeapon === 'rpg' ? player.currentMagazine + ammoCost : bulletsToFire;
    
    for (let b = 0; b < rpgBurstCount; b++) {
        let baseSpread = weapon.isDual ? (b === 0 ? -0.03 : 0.03) : 0;
        let spreadMultiplier = isScoped ? 0 : 1;
        let randomSpread = (Math.random() - 0.5) * weapon.spread * 2 * spreadMultiplier;
        let totalSpread = baseSpread * spreadMultiplier + randomSpread;
        
        // 火箭筒三发散射
        if (currentWeapon === 'rpg') {
            let burstSpread = (b - 1) * 0.03; // 三发分别向-0.03, 0, +0.03方向散射
            totalSpread += burstSpread;
        }
        
        bullets.push({
            x: player.x + Math.cos(player.angle) * 0.5,
            y: player.y + Math.sin(player.angle) * 0.5,
            vx: Math.cos(player.angle + totalSpread) * 0.3,
            vy: Math.sin(player.angle + totalSpread) * 0.3,
            vz: 0,
            life: 100,
            damage: weapon.damage,
            isRPG: weapon.splashRadius ? true : false,
            splashRadius: weapon.splashRadius
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

function createExplosion(x, y, radius, damage) {
    // 创建爆炸粒子效果
    for (let i = 0; i < 30; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 0.3 + 0.1;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: Math.random() > 0.5 ? '#ff6600' : '#ffff00',
            size: Math.random() * 4 + 2
        });
    }
    
    // 对范围内的敌人造成伤害
    for (let enemy of enemies) {
        let dist = Math.hypot(enemy.x - x, enemy.y - y);
        if (dist <= radius) {
            // 根据距离计算伤害，取整避免浮点数
            let damageMultiplier = 1 - (dist / radius) * 0.5;
            let damageDealt = Math.max(1, Math.floor(damage * damageMultiplier));
            enemy.health -= damageDealt;
            enemy.hitFlash = 20;
            
            if (enemy.health <= 0) {
                // 标记敌人死亡
                enemy.health = 0;
            }
        }
    }
    
    // 对玩家造成伤害（如果在范围内）
    let playerDist = Math.hypot(player.x - x, player.y - y);
    if (playerDist <= radius * 0.8) {
        let damageMultiplier = 1 - (playerDist / (radius * 0.8)) * 0.5;
        let damageDealt = Math.max(1, Math.floor(damage * 0.3 * damageMultiplier));
        player.health -= damageDealt;
        player.damageFlash = 30;
        updateUI();
        
        if (player.health <= 0) {
            gameOver();
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;
        
        if (bullet.life <= 0 || map[Math.floor(bullet.y)][Math.floor(bullet.x)] === 1) {
            // RPG火箭弹爆炸
            if (bullet.isRPG) {
                createExplosion(bullet.x, bullet.y, bullet.splashRadius || 2.5, bullet.damage);
            }
            bullets.splice(i, 1);
            continue;
        }
        
        if (bullet.isEnemyBullet) {
            let distToPlayer = Math.hypot(bullet.x - player.x, bullet.y - player.y);
            if (distToPlayer < 0.5) {
                player.health -= bullet.damage;
                player.damageFlash = 30;
                bullets.splice(i, 1);
                updateUI();
                
                if (player.health <= 0) {
                    gameOver();
                }
                continue;
            }
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
        if (enemy.lastShootTime > 0) enemy.lastShootTime--;
        
        let enemyType = ENEMY_TYPES[enemy.type];
        
        if (enemyType.isRanged && seesPlayer && dist < enemyType.attackRange) {
            if (enemy.lastShootTime === 0) {
                let bulletAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                
                // 根据怪物类型发射不同类型的子弹
                if (enemyType.projectileType === 'sonic') {
                    // 超声波炮 - 宽范围扇形攻击
                    for (let i = -1; i <= 1; i++) {
                        let spreadAngle = bulletAngle + i * 0.2;
                        bullets.push({
                            x: enemy.x + Math.cos(bulletAngle) * enemyType.size,
                            y: enemy.y + Math.sin(bulletAngle) * enemyType.size,
                            vx: Math.cos(spreadAngle) * 0.12,
                            vy: Math.sin(spreadAngle) * 0.12,
                            vz: 0,
                            life: 45,
                            damage: enemyType.damage,
                            isEnemyBullet: true,
                            isSonic: true
                        });
                    }
                    // 主弹道更强
                    bullets.push({
                        x: enemy.x + Math.cos(bulletAngle) * enemyType.size,
                        y: enemy.y + Math.sin(bulletAngle) * enemyType.size,
                        vx: Math.cos(bulletAngle) * 0.15,
                        vy: Math.sin(bulletAngle) * 0.15,
                        vz: 0,
                        life: 50,
                        damage: enemyType.damage * 1.5,
                        isEnemyBullet: true,
                        isSonic: true,
                        isMain: true
                    });
                } else {
                    // 普通子弹
                    bullets.push({
                        x: enemy.x + Math.cos(bulletAngle) * enemyType.size,
                        y: enemy.y + Math.sin(bulletAngle) * enemyType.size,
                        vx: Math.cos(bulletAngle) * 0.15,
                        vy: Math.sin(bulletAngle) * 0.15,
                        vz: 0,
                        life: 60,
                        damage: enemyType.damage,
                        isEnemyBullet: true
                    });
                }
                
                enemy.lastShootTime = enemyType.shootCooldown || 120;
            }
        } else if (dist < 1.2 && enemy.attackCooldown === 0) {
            player.health -= enemyType.damage;
            player.damageFlash = 30;
            enemy.attackCooldown = 60;
            updateUI();
            
            if (player.health <= 0) {
                gameOver();
            }
        }
        
        if (enemy.hitFlash > 0) enemy.hitFlash--;
    }
    
    // 移除死亡的敌人
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].health <= 0) {
            let enemy = enemies[i];
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
            enemies.splice(i, 1);
        }
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
        if (currentWeapon === 'rpg') {
            // 火箭筒使用特殊的日字形瞄准镜
            DOM.rpgScopeOverlay.classList.add('active');
        } else {
            DOM.scopeOverlay.classList.add('scoped');
        }
    } else {
        DOM.crosshair.classList.remove('scoped');
        DOM.scopeOverlay.classList.remove('scoped');
        DOM.rpgScopeOverlay.classList.remove('active');
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
    DOM.weaponRPG.classList.toggle('selected', currentWeapon === 'rpg');
    
    DOM.weaponAutoRifle.disabled = !player.hasAutoRifleNormal;
    DOM.weaponAutoRiflePro.disabled = !player.hasAutoRifle;
    DOM.weaponSniper.disabled = !player.hasSniperRifle;
    DOM.weaponLMG.disabled = !player.hasLightMachineGun;
    DOM.weaponRPG.disabled = !player.hasRPG;
    
    const weaponNames = {
        pistol: '手枪',
        autoRifle: '高速自动步枪',
        autoRiflePro: '自动步枪',
        sniper: '射手步枪',
        lmg: '轻机枪',
        rpg: '火箭筒'
    };
    DOM.currentWeapon.textContent = `当前武器: ${weaponNames[currentWeapon]}`;
}

function selectWeapon(weaponType) {
    if (weaponType === 'pistol' ||
        (weaponType === 'autoRifle' && player.hasAutoRifleNormal) ||
        (weaponType === 'autoRiflePro' && player.hasAutoRifle) ||
        (weaponType === 'sniper' && player.hasSniperRifle) ||
        (weaponType === 'lmg' && player.hasLightMachineGun) ||
        (weaponType === 'rpg' && player.hasRPG)) {
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
    document.getElementById('buyRPG').disabled = player.score < 8000 || player.hasRPG;
    document.getElementById('buyChestRig').disabled = player.score < 1500 || player.hasChestRig;
    document.getElementById('buyStaminaSlow').disabled = player.score < 1200 || player.hasStaminaSlow;
    document.getElementById('buyStaminaFast').disabled = player.score < 1500 || player.hasStaminaFast;
}

function submitCheat() {
    const password = document.getElementById('cheatInput').value.toLowerCase();
    if (password === 'coin') {
        player.score += 100000;
        document.getElementById('cheatMessage').textContent = '密码正确！获得100000金币！';
        document.getElementById('cheatMessage').style.color = '#00ff00';
        updateUI();
        setTimeout(() => {
            closeCheat();
        }, 2000);
    } else if (password === 'kill') {
        player.health = 0;
        document.getElementById('cheatMessage').textContent = '已执行自杀！';
        document.getElementById('cheatMessage').style.color = '#ff0000';
        setTimeout(() => {
            closeCheat();
            gameOver();
        }, 1000);
    } else if (ENEMY_TYPES[password]) {
        spawnEnemy(password);
        document.getElementById('cheatMessage').textContent = `已生成一只 ${password}！`;
        document.getElementById('cheatMessage').style.color = '#00ff00';
        updateUI();
        setTimeout(() => {
            closeCheat();
        }, 1500);
    } else {
        document.getElementById('cheatMessage').textContent = '密码错误！可用怪物: zombie, demon, crawler, shooter, shadow, boss, bigboss';
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
    document.getElementById('buyRPG').disabled = player.score < 8000 || player.hasRPG;
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

function buyRPG() {
    if (player.score >= 8000 && !player.hasRPG) {
        player.score -= 8000;
        player.hasRPG = true;
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
        setTimeout(() => spawnbigboss(), enemiesPerWave * 500 + 3000);
    }
    
    player.ammo = Math.min(player.maxAmmo, player.ammo + 10);
    player.health = Math.min(player.maxHealth, player.health + 5);
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

function spawnbigboss() {
    let x, y;
    do {
        x = Math.random() * (MAP_SIZE - 4) + 2;
        y = Math.random() * (MAP_SIZE - 4) + 2;
    } while (Math.hypot(x - player.x, y - player.y) < 10 || !isValidPosition(x, y));
    
    enemies.push({
        x, y,
        type: 'bigboss',
        health: ENEMY_TYPES['bigboss'].health,
        maxHealth: ENEMY_TYPES['bigboss'].health,
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
    // 初始化武器模型画布
    weaponModelCtx = DOM.weaponModel.getContext('2d');
    
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
    
    // 重置疾跑状态
    sprintToggleState = false;
    virtualSprintActive = false;
    document.getElementById('sprintButton').classList.remove('active');
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
document.getElementById('buyRPG').addEventListener('click', buyRPG);
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
document.getElementById('weaponRPG').addEventListener('click', () => { selectWeapon('rpg'); closeWeaponWheel(); });

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
document.getElementById('toggleWeaponModel').addEventListener('click', toggleWeaponModel);
document.getElementById('toggleScopeShake').addEventListener('click', toggleScopeShake);
document.getElementById('toggleVirtualControls').addEventListener('click', toggleVirtualControls);
document.getElementById('togglePortrait').addEventListener('click', togglePortrait);
document.getElementById('toggleHalfScreenJoystick').addEventListener('click', toggleHalfScreenJoystick);
document.getElementById('toggleAutoAim').addEventListener('click', toggleAutoAim);
document.getElementById('autoAimSlider').addEventListener('input', function(e) {
    updateAutoAimStrength(e.target.value);
});
document.getElementById('buttonSizeSlider').addEventListener('input', updateButtonSize);
document.getElementById('toggleAutoShoot').addEventListener('click', toggleAutoShoot);
document.getElementById('scopeStyleSelector').addEventListener('change', updateScopeStyle);

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

document.getElementById('scopeButton').addEventListener('touchstart', virtualScopeStart);
document.getElementById('scopeButton').addEventListener('touchend', virtualScopeEnd);
document.getElementById('scopeButton').addEventListener('mousedown', virtualScopeStart);
document.getElementById('scopeButton').addEventListener('mouseup', virtualScopeEnd);

document.getElementById('shopBtn').addEventListener('touchstart', virtualOpenShop);
document.getElementById('shopBtn').addEventListener('click', virtualOpenShop);

document.getElementById('weaponBtn').addEventListener('touchstart', virtualOpenWeaponWheel);
document.getElementById('weaponBtn').addEventListener('click', virtualOpenWeaponWheel);

document.getElementById('cheatBtn').addEventListener('touchstart', virtualOpenCheat);
document.getElementById('cheatBtn').addEventListener('click', virtualOpenCheat);

document.getElementById('quitButton').addEventListener('touchstart', virtualQuit);
document.getElementById('quitButton').addEventListener('click', virtualQuit);

// 疾跑按钮事件
document.getElementById('sprintButton').addEventListener('touchstart', virtualSprintStart);
document.getElementById('sprintButton').addEventListener('touchend', virtualSprintEnd);
document.getElementById('sprintButton').addEventListener('mousedown', virtualSprintStart);
document.getElementById('sprintButton').addEventListener('mouseup', virtualSprintEnd);

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

function updateButtonSize() {
    let size = parseFloat(document.getElementById('buttonSizeSlider').value);
    document.getElementById('buttonSizeValue').textContent = size + '%';
    
    // 应用缩放比例
    let scale = size / 100;
    
    // 更新所有虚拟按键的大小
    const buttons = [
        { id: 'shootButton', baseSize: 80, baseFont: 24 },
        { id: 'reloadButton', baseSize: 80, baseFont: 24 },
        { id: 'scopeButton', baseSize: 80, baseFont: 24 },
        { id: 'sprintButton', baseSize: 70, baseFont: 24 },
        { id: 'actionButtons', childClass: 'actionBtn', baseSize: 50, baseFont: 18 }
    ];
    
    buttons.forEach(btn => {
        if (btn.childClass) {
            // 处理包含子按钮的容器
            const container = document.getElementById(btn.id);
            if (container) {
                const children = container.querySelectorAll('.' + btn.childClass);
                children.forEach(child => {
                    child.style.width = (btn.baseSize * scale) + 'px';
                    child.style.height = (btn.baseSize * scale) + 'px';
                    child.style.fontSize = (btn.baseFont * scale) + 'px';
                });
                // 更新间距
                container.style.gap = (20 * scale) + 'px';
            }
        } else {
            const button = document.getElementById(btn.id);
            if (button) {
                button.style.width = (btn.baseSize * scale) + 'px';
                button.style.height = (btn.baseSize * scale) + 'px';
                button.style.fontSize = (btn.baseFont * scale) + 'px';
            }
        }
    });
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

function toggleWeaponModel() {
    let toggle = document.getElementById('toggleWeaponModel');
    weaponModelEnabled = !weaponModelEnabled;
    toggle.classList.toggle('active');
}

function toggleScopeShake() {
    let toggle = document.getElementById('toggleScopeShake');
    scopeShakeEnabled = !scopeShakeEnabled;
    toggle.classList.toggle('active');
}

function toggleAutoShoot() {
    let toggle = document.getElementById('toggleAutoShoot');
    autoShootEnabled = !autoShootEnabled;
    toggle.classList.toggle('active');
}

function updateScopeStyle() {
    scopeStyle = document.getElementById('scopeStyleSelector').value;
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

function toggleHalfScreenJoystick() {
    let toggle = document.getElementById('toggleHalfScreenJoystick');
    halfScreenJoystick = !halfScreenJoystick;
    toggle.classList.toggle('active');
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
    
    if (e.touches) {
        joystickTouchId = e.touches[0].identifier;
    }
    
    joystickActive = true;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    // 如果开启半屏模式且点击在左半边，移动摇杆到点击位置
    if (halfScreenJoystick && clientX < window.innerWidth / 2) {
        joystickContainer.style.left = (clientX - 60) + 'px';
        joystickContainer.style.bottom = 'auto';
        joystickContainer.style.top = (clientY - 60) + 'px';
    }
    
    const rect = joystickContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    joystickStartX = clientX - centerX;
    joystickStartY = clientY - centerY;
    
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

function joystickEnd(e) {
    joystickActive = false;
    joystickDeltaX = 0;
    joystickDeltaY = 0;
    joystickTouchId = null;
    joystick.style.transform = 'translate(-50%, -50%)';
        
    // 如果开启半屏模式，重置位置
    if (halfScreenJoystick) {
        joystickContainer.style.left = '';
        joystickContainer.style.top = '';
        joystickContainer.style.bottom = '30px';
    }
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
// 虚拟疾跑按钮（开关式）
function virtualSprintStart(e) {
    e.preventDefault();
    if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
        sprintToggleState = !sprintToggleState;
        virtualSprintActive = sprintToggleState;
        document.getElementById('sprintButton').classList.toggle('active', sprintToggleState);
    }
}

function virtualSprintEnd(e) {
    // 开关式，不需要在松开时关闭
}

// 虚拟换弹按钮
function virtualReload(e) {
    e.preventDefault();
    if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
        reload();
    }
}

// 虚拟瞄准按钮
function virtualScopeStart(e) {
    e.preventDefault();
    if (gameRunning && !shopActive && !cheatActive && !weaponWheelActive && !pauseMenuActive) {
        isScoped = true;
    }
}

function virtualScopeEnd(e) {
    e.preventDefault();
    isScoped = false;
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

// 绘制伪3D武器模型
function drawWeaponModel() {
    if (!weaponModelCtx || !gameRunning || !weaponModelEnabled) {
        if (weaponModelCtx) weaponModelCtx.clearRect(0, 0, DOM.weaponModel.width, DOM.weaponModel.height);
        return;
    }
    
    const ctx = weaponModelCtx;
    const w = DOM.weaponModel.width;
    const h = DOM.weaponModel.height;
    
    // 清空画布
    ctx.clearRect(0, 0, w, h);
    
    // 如果换弹中，显示独特的换弹动画
    if (player.isReloading) {
        let reloadProgress = 1 - (player.reloadTime / player.initialReloadTime);
        
        ctx.save();
        ctx.translate(w * 0.7, h * 0.85);
        
        // 根据武器类型显示独特的换弹动画
        if (currentWeapon === 'pistol') {
            drawPistolReload(ctx, reloadProgress);
        } else if (currentWeapon === 'autoRifle') {
            drawAutoRifleReload(ctx, reloadProgress);
        } else if (currentWeapon === 'autoRiflePro') {
            drawAutoRifleProReload(ctx, reloadProgress);
        } else if (currentWeapon === 'sniper') {
            drawSniperReload(ctx, reloadProgress);
        } else if (currentWeapon === 'lmg') {
            drawLMGReload(ctx, reloadProgress);
        } else if (currentWeapon === 'rpg') {
            drawRPGReload(ctx, reloadProgress);
        } else {
            // 默认换弹动画
            drawDefaultReload(ctx, reloadProgress);
        }
        
        ctx.restore();
        return;
    }
    
    // 更新换弹进度
    weaponReloadProgress = 0;
    
    // 竖屏模式检测
    let isPortrait = portraitMode && window.innerHeight > window.innerWidth;
    let portraitScale = isPortrait ? 0.5 : 1;
    let portraitOffsetX = isPortrait ? w * 0.15 : 0;
    let portraitOffsetY = isPortrait ? h * 0.05 : 0;
    
    // 计算武器位置 - 更靠右下方
    let baseX = w * 0.8 + portraitOffsetX;
    let baseY = h * 0.92 + portraitOffsetY;
    
    // 应用后坐力（更大）
    let recoilOffset = weaponRecoil * 40 * portraitScale;
    
    // 应用行走晃动
    let bobOffset = Math.sin(weaponBob) * 8 * portraitScale;
    
    // 开镜时武器缩小并稍微上移
    let scopeOffset = 0;
    let weaponScale = portraitScale;
    if (isScoped) {
        weaponScale *= 0.7;
        recoilOffset *= 0.5;
        bobOffset *= 0.3;
    }
    
    // 武器颜色配置（更精细的颜色）
    const weaponColors = {
        pistol: { 
            body: '#3a3a3a', bodyLight: '#5a5a5a', bodyDark: '#252525',
            grip: '#2a1a0a', gripLight: '#3d2a15', 
            metal: '#666666', metalLight: '#888888', metalDark: '#444444',
            accent: '#e94560', muzzle: '#1a1a1a'
        },
        autoRifle: { 
            body: '#2d2d2d', bodyLight: '#454545', bodyDark: '#1a1a1a',
            bodyDark2: '#0f0f0f', rail: '#333333',
            grip: '#1a1a1a', gripLight: '#2a2a2a',
            metal: '#555555', metalLight: '#777777', metalDark: '#333333',
            accent: '#ff6600', muzzle: '#222222', magazine: '#1a1a1a'
        },
        autoRiflePro: { 
            body: '#252525', bodyLight: '#3d3d3d', bodyDark: '#111111',
            bodyDark2: '#0a0a0a', rail: '#2a2a2a',
            grip: '#151515', gripLight: '#222222',
            metal: '#4a4a4a', metalLight: '#6a6a6a', metalDark: '#2a2a2a',
            accent: '#00ff88', muzzle: '#1a1a1a', magazine: '#101010'
        },
        sniper: { 
            body: '#1a1a1a', bodyLight: '#2a2a2a', bodyDark: '#0a0a0a',
            bodyDark2: '#050505', rail: '#222222',
            stock: '#1a1208', stockLight: '#2a1a0a', stockDark: '#0f0a05',
            metal: '#444444', metalLight: '#666666', metalDark: '#222222',
            accent: '#00aaff', muzzle: '#151515', 
            scope: '#1a1a1a', scopeLens: '#004466'
        },
        lmg: { 
            body: '#333333', bodyLight: '#4a4a4a', bodyDark: '#1a1a1a',
            bodyDark2: '#0f0f0f',
            barrel: '#222222', barrelDark: '#151515',
            metal: '#555555', metalLight: '#777777', metalDark: '#333333',
            accent: '#ffcc00', drum: '#ffaa00', grip: '#1a1a1a'
        },
        rpg: {
            body: '#4a4a4a', bodyLight: '#666666', bodyDark: '#2a2a2a',
            tube: '#3a3a3a', tubeLight: '#555555', tubeDark: '#1a1a1a',
            metal: '#666666', metalLight: '#888888', metalDark: '#444444',
            accent: '#ff6600', warhead: '#222222', fins: '#1a1a1a',
            grip: '#2a1a0a', gripLight: '#3d2a15', trigger: '#1a1a1a'
        }
    };
    
    let c = weaponColors[currentWeapon] || weaponColors.pistol;
    
    // 保存状态
    ctx.save();
    
    // 移动到武器位置
    ctx.translate(baseX, baseY + bobOffset + recoilOffset + scopeOffset);
    
    // 应用缩放（开镜时缩小）
    ctx.scale(weaponScale, weaponScale);
    
    // 不旋转，保持枪口朝右（第一人称视角）
    
    // 根据武器类型绘制
    if (currentWeapon === 'pistol') {
        // === 手枪 ===
        
        // 枪身主体（带渐变效果）
        ctx.fillStyle = c.body;
        ctx.beginPath();
        ctx.roundRect(-55, -28, 95, 38, 4);
        ctx.fill();
        
        // 枪身上部导轨
        ctx.fillStyle = c.bodyLight;
        ctx.fillRect(-50, -30, 60, 6);
        
        // 枪管
        ctx.fillStyle = c.metalDark;
        ctx.fillRect(35, -20, 35, 14);
        ctx.fillStyle = c.metal;
        ctx.fillRect(35, -18, 35, 4);
        
        // 枪口
        ctx.fillStyle = c.muzzle;
        ctx.beginPath();
        ctx.arc(70, -13, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(70, -13, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 握把
        ctx.fillStyle = c.grip;
        ctx.beginPath();
        ctx.moveTo(-50, -5);
        ctx.lineTo(-35, -5);
        ctx.lineTo(-30, 35);
        ctx.lineTo(-50, 35);
        ctx.closePath();
        ctx.fill();
        
        // 握把纹理
        ctx.fillStyle = c.gripLight;
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(-48, 0 + i * 6, 15, 2);
        }
        
        // 扳机护圈
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.arc(-25, 15, 15, 0, Math.PI);
        ctx.fill();
        
        // 扳机
        ctx.fillStyle = c.metal;
        ctx.fillRect(-28, 5, 6, 15);
        
        // 滑套
        ctx.fillStyle = c.bodyLight;
        ctx.fillRect(-55, -28, 25, 38);
        
        // 准星
        ctx.fillStyle = c.metalLight;
        ctx.fillRect(-52, -35, 4, 8);
        
        // 击锤
        ctx.fillStyle = c.metalDark;
        ctx.beginPath();
        ctx.moveTo(-55, -15);
        ctx.lineTo(-60, -20);
        ctx.lineTo(-55, -25);
        ctx.closePath();
        ctx.fill();
        
        // 弹匣释放按钮
        ctx.fillStyle = c.accent;
        ctx.fillRect(-10, 5, 8, 5);
        
    } else if (currentWeapon === 'autoRifle') {
        // === 突击步枪 ===
        
        // 枪身主体
        ctx.fillStyle = c.body;
        ctx.fillRect(-80, -35, 150, 45);
        
        // 顶部导轨
        ctx.fillStyle = c.rail;
        ctx.fillRect(-75, -38, 120, 6);
        for (let i = 0; i < 12; i++) {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(-72 + i * 10, -37, 2, 4);
        }
        
        // 枪托
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(-120, -30, 45, 35);
        ctx.fillStyle = c.body;
        ctx.fillRect(-118, -28, 40, 8);
        ctx.fillRect(-118, -10, 40, 8);
        
        // 枪托橡胶垫
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-120, 0, 8, 20);
        
        // 枪管护套
        ctx.fillStyle = c.bodyLight;
        ctx.fillRect(60, -28, 50, 30);
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(65, -25, 40, 24);
        
        // 枪口
        ctx.fillStyle = c.metalDark;
        ctx.beginPath();
        ctx.arc(110, -13, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.muzzle;
        ctx.beginPath();
        ctx.arc(110, -13, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 消焰器
        ctx.fillStyle = c.metal;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(108 + i * 3, -18 + i * 3, 4, 10 - i * 2);
        }
        
        // 瞄准镜
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(-30, -55, 50, 20);
        ctx.fillStyle = c.bodyLight;
        ctx.fillRect(-28, -53, 46, 16);
        ctx.fillStyle = c.accent;
        ctx.fillRect(-10, -51, 20, 12);
        // 镜片反光
        ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';
        ctx.fillRect(-8, -50, 8, 10);
        
        // 弹匣
        ctx.fillStyle = c.magazine;
        ctx.beginPath();
        ctx.moveTo(-20, 10);
        ctx.lineTo(5, 10);
        ctx.lineTo(10, 55);
        ctx.lineTo(-25, 55);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(-18, 15, 20, 5);
        
        // 握把
        ctx.fillStyle = c.grip;
        ctx.beginPath();
        ctx.moveTo(-40, 10);
        ctx.lineTo(-25, 10);
        ctx.lineTo(-20, 40);
        ctx.lineTo(-45, 40);
        ctx.closePath();
        ctx.fill();
        
        // 前握把
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(20, 10, 15, 25);
        
        // 扳机
        ctx.fillStyle = c.metal;
        ctx.fillRect(-35, 10, 8, 20);
        
        // 保险
        ctx.fillStyle = c.bodyLight;
        ctx.fillRect(-80, -5, 15, 6);
        
    } else if (currentWeapon === 'autoRiflePro') {
        // === 高级步枪 ===
        
        // 枪身主体（更流线型）
        ctx.fillStyle = c.body;
        ctx.beginPath();
        ctx.moveTo(-85, -30);
        ctx.lineTo(65, -30);
        ctx.lineTo(65, 15);
        ctx.lineTo(-85, 15);
        ctx.closePath();
        ctx.fill();
        
        // 顶部导轨（皮卡汀尼）
        ctx.fillStyle = c.rail;
        ctx.fillRect(-80, -35, 130, 8);
        for (let i = 0; i < 14; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#2a2a2a' : '#333333';
            ctx.fillRect(-78 + i * 9, -34, 7, 5);
        }
        
        // 枪托（可折叠）
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.moveTo(-85, -25);
        ctx.lineTo(-110, -25);
        ctx.lineTo(-115, 10);
        ctx.lineTo(-85, 10);
        ctx.closePath();
        ctx.fill();
        // 枪托沟槽
        ctx.fillStyle = c.bodyDark2;
        ctx.fillRect(-105, -20, 25, 3);
        ctx.fillRect(-105, -10, 25, 3);
        
        // 枪管（更长）
        ctx.fillStyle = c.metalDark;
        ctx.fillRect(65, -22, 60, 18);
        ctx.fillStyle = c.metal;
        ctx.fillRect(65, -20, 60, 6);
        
        // 枪口螺纹
        ctx.fillStyle = c.metal;
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(120 + i * 2, -24, 1, 22);
        }
        
        // 高级瞄准镜
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(-25, -58, 60, 25);
        ctx.fillStyle = c.body;
        ctx.fillRect(-22, -55, 54, 19);
        // 镜片
        ctx.fillStyle = c.scopeLens;
        ctx.beginPath();
        ctx.arc(25, -45, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 150, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(25, -45, 8, 0, Math.PI * 2);
        ctx.fill();
        // 十字线
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(17, -45);
        ctx.lineTo(33, -45);
        ctx.moveTo(25, -53);
        ctx.lineTo(25, -37);
        ctx.stroke();
        
        // 弹匣（STANAG）
        ctx.fillStyle = c.magazine;
        ctx.beginPath();
        ctx.moveTo(-15, 15);
        ctx.lineTo(15, 15);
        ctx.lineTo(20, 60);
        ctx.lineTo(-20, 60);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-12, 20, 27, 35);
        
        // 握把（人体工学）
        ctx.fillStyle = c.grip;
        ctx.beginPath();
        ctx.moveTo(-35, 15);
        ctx.lineTo(-15, 15);
        ctx.quadraticCurveTo(-10, 35, -20, 50);
        ctx.lineTo(-40, 50);
        ctx.quadraticCurveTo(-45, 35, -35, 15);
        ctx.fill();
        
        // 散热孔
        ctx.fillStyle = c.bodyDark2;
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(0 + i * 12, -15, 8, 20);
        }
        
    } else if (currentWeapon === 'sniper') {
        // === 狙击步枪 ===
        
        // 主体
        ctx.fillStyle = c.body;
        ctx.fillRect(-100, -30, 180, 40);
        
        // 顶部导轨
        ctx.fillStyle = c.rail;
        ctx.fillRect(-95, -35, 140, 8);
        
        // 枪托（木质）
        ctx.fillStyle = c.stock;
        ctx.beginPath();
        ctx.moveTo(-100, -25);
        ctx.lineTo(-150, -25);
        ctx.lineTo(-155, 10);
        ctx.lineTo(-100, 10);
        ctx.closePath();
        ctx.fill();
        // 枪托纹理
        ctx.fillStyle = c.stockLight;
        ctx.fillRect(-145, -20, 40, 3);
        ctx.fillRect(-140, -10, 35, 3);
        ctx.fillRect(-145, 0, 30, 3);
        
        // 枪托底板
        ctx.fillStyle = c.metalDark;
        ctx.fillRect(-155, -5, 8, 18);
        
        // 枪管
        ctx.fillStyle = c.metalDark;
        ctx.fillRect(75, -18, 70, 20);
        ctx.fillStyle = c.metal;
        ctx.fillRect(75, -15, 70, 6);
        ctx.fillStyle = c.metalLight;
        ctx.fillRect(75, -14, 70, 2);
        
        // 枪口
        ctx.fillStyle = c.muzzle;
        ctx.beginPath();
        ctx.arc(145, -8, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(145, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞄准镜
        ctx.fillStyle = c.scope;
        ctx.fillRect(-20, -70, 90, 38);
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(-18, -68, 20, 34);
        ctx.fillRect(60, -68, 12, 34);
        
        // 镜片
        ctx.fillStyle = c.scopeLens;
        ctx.beginPath();
        ctx.arc(0, -50, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 100, 200, 0.5)';
        ctx.beginPath();
        ctx.arc(0, -50, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // 镜筒金属环
        ctx.fillStyle = c.metal;
        ctx.fillRect(-18, -68, 8, 34);
        ctx.fillRect(52, -68, 8, 34);
        
        // 脚架
        ctx.fillStyle = c.metalDark;
        // 左脚架
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(0, 10);
        ctx.lineTo(-5, 70);
        ctx.lineTo(5, 70);
        ctx.closePath();
        ctx.fill();
        // 右脚架
        ctx.beginPath();
        ctx.moveTo(50, 10);
        ctx.lineTo(40, 10);
        ctx.lineTo(35, 70);
        ctx.lineTo(45, 70);
        ctx.closePath();
        ctx.fill();
        // 脚架连接
        ctx.fillRect(5, 10, 40, 8);
        
        // 弹匣
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(20, 10);
        ctx.lineTo(25, 45);
        ctx.lineTo(-15, 45);
        ctx.closePath();
        ctx.fill();
        
        // 扳机
        ctx.fillStyle = c.metal;
        ctx.fillRect(-25, 10, 10, 25);
        
        // 保险
        ctx.fillStyle = c.bodyLight;
        ctx.fillRect(-95, -5, 20, 8);
        
    } else if (currentWeapon === 'lmg') {
        // === 轻机枪 ===
        
        // 主体（厚重）
        ctx.fillStyle = c.body;
        ctx.fillRect(-90, -38, 160, 55);
        
        // 顶部散热孔
        ctx.fillStyle = c.bodyDark;
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(-80 + i * 15, -35, 10, 25);
        }
        
        // 枪管
        ctx.fillStyle = c.barrel;
        ctx.fillRect(65, -25, 55, 28);
        ctx.fillStyle = c.metalDark;
        ctx.beginPath();
        ctx.arc(120, -11, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // 枪口
        ctx.fillStyle = c.metal;
        ctx.beginPath();
        ctx.arc(120, -11, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 弹鼓（圆形）
        ctx.fillStyle = c.drum;
        ctx.beginPath();
        ctx.arc(0, 30, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.arc(0, 30, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.arc(0, 30, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(0, 30, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 枪托
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(-130, -30, 45, 40);
        ctx.fillStyle = c.body;
        ctx.fillRect(-128, -28, 40, 10);
        ctx.fillRect(-128, -8, 40, 10);
        
        // 把手
        ctx.fillStyle = c.grip;
        ctx.beginPath();
        ctx.moveTo(-50, 17);
        ctx.lineTo(-30, 17);
        ctx.lineTo(-25, 55);
        ctx.lineTo(-55, 55);
        ctx.closePath();
        ctx.fill();
        
        // 瞄准镜
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(-20, -55, 40, 20);
        ctx.fillStyle = c.body;
        ctx.fillRect(-18, -53, 36, 16);
        ctx.fillStyle = c.accent;
        ctx.fillRect(-5, -51, 10, 12);
        
        // 散热片
        ctx.fillStyle = c.metalLight;
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(70 + i * 8, -22, 3, 22);
        }
    } else if (currentWeapon === 'rpg') {
        // === RPG火箭筒 ===
        
        // 发射器主体（长筒）
        ctx.fillStyle = c.tubeDark;
        ctx.fillRect(-100, -25, 160, 30);
        ctx.fillStyle = c.tube;
        ctx.fillRect(-98, -23, 156, 26);
        
        // 筒身加强环
        ctx.fillStyle = c.metalDark;
        ctx.fillRect(-70, -27, 8, 34);
        ctx.fillRect(-20, -27, 8, 34);
        ctx.fillRect(30, -27, 8, 34);
        
        // 火箭弹头部
        ctx.fillStyle = c.warhead;
        ctx.beginPath();
        ctx.moveTo(58, -10);
        ctx.lineTo(85, -10);
        ctx.lineTo(95, 0);
        ctx.lineTo(85, 10);
        ctx.lineTo(58, 10);
        ctx.closePath();
        ctx.fill();
        
        // 弹头尖端
        ctx.fillStyle = c.accent;
        ctx.beginPath();
        ctx.moveTo(85, -8);
        ctx.lineTo(100, 0);
        ctx.lineTo(85, 8);
        ctx.closePath();
        ctx.fill();
        
        // 尾翼
        ctx.fillStyle = c.fins;
        // 上尾翼
        ctx.fillRect(55, -25, 5, 15);
        // 下尾翼
        ctx.fillRect(55, 10, 5, 15);
        
        // 握把
        ctx.fillStyle = c.grip;
        ctx.beginPath();
        ctx.moveTo(-50, 5);
        ctx.lineTo(-35, 5);
        ctx.lineTo(-30, 50);
        ctx.lineTo(-55, 50);
        ctx.closePath();
        ctx.fill();
        
        // 握把纹理
        ctx.fillStyle = c.gripLight;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(-52, 10 + i * 10, 15, 3);
        }
        
        // 扳机护圈
        ctx.fillStyle = c.bodyDark;
        ctx.beginPath();
        ctx.arc(-25, 20, 12, 0, Math.PI);
        ctx.fill();
        
        // 扳机
        ctx.fillStyle = c.metal;
        ctx.fillRect(-28, 12, 6, 12);
        
        // 肩托
        ctx.fillStyle = c.bodyDark;
        ctx.fillRect(-130, -20, 35, 25);
        ctx.fillStyle = c.body;
        ctx.fillRect(-128, -18, 30, 8);
        
        // 瞄准具
        ctx.fillStyle = c.metalDark;
        ctx.fillRect(-80, -35, 15, 8);
        ctx.fillRect(-40, -35, 15, 8);
        
        // 标尺刻度
        ctx.fillStyle = c.accent;
        ctx.fillRect(-78, -40, 2, 5);
        ctx.fillRect(-38, -40, 2, 5);
        
        // 发射管内部（左侧开口）
        ctx.fillStyle = '#111';
        ctx.fillRect(-100, -18, 5, 16);
    }
    
    ctx.restore();
    
    // 更新后坐力
    if (weaponRecoil > 0) {
        weaponRecoil *= 0.85;
        if (weaponRecoil < 0.01) weaponRecoil = 0;
    }
    
    // 更新行走晃动
    if (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] || joystickActive) {
        weaponBob += 0.15;
    }
}

// === 换弹动画函数 ===

function drawPistolReload(ctx, progress) {
    // 手枪换弹 - 单手操作，弹夹从底部抽出
    let gunX = 0, gunY = 0;
    let magX = 0, magY = 0;
    let rotate = 0;
    
    if (progress < 0.2) {
        // 阶段1: 向下倾斜
        let t = progress / 0.2;
        rotate = t * -0.3;
        gunY = t * 20;
    } else if (progress < 0.45) {
        // 阶段2: 弹夹弹出
        let t = (progress - 0.2) / 0.25;
        rotate = -0.3;
        gunY = 20;
        magY = t * 40;
    } else if (progress < 0.7) {
        // 阶段3: 新弹夹装入
        let t = (progress - 0.45) / 0.25;
        rotate = -0.3 + t * 0.3;
        gunY = 20 - t * 10;
        magY = 40 * (1 - t);
    } else {
        // 阶段4: 复位
        let t = (progress - 0.7) / 0.3;
        rotate = t * -0.1;
        gunY = 10 * (1 - t);
    }
    
    ctx.save();
    ctx.rotate(rotate);
    
    // 枪身
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.roundRect(-55 + gunX, -28 + gunY, 95, 38, 4);
    ctx.fill();
    
    // 枪管
    ctx.fillStyle = '#444444';
    ctx.fillRect(35 + gunX, -20 + gunY, 35, 14);
    
    // 握把
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-50 + gunX, -5 + gunY, 18, 40);
    
    // 弹夹（会分离）
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-35 + gunX, 35 + gunY + magY, 15, 30);
    
    ctx.restore();
}

function drawAutoRifleReload(ctx, progress) {
    // 突击步枪换弹 - 战术换弹动作
    let gunX = 0, gunY = 0;
    let magX = 0, magY = 0;
    let boltOpen = 0;
    
    if (progress < 0.15) {
        // 阶段1: 武器后拉
        let t = progress / 0.15;
        gunX = t * -30;
        gunY = t * 15;
    } else if (progress < 0.35) {
        // 阶段2: 弹匣释放
        let t = (progress - 0.15) / 0.2;
        gunX = -30;
        gunY = 15;
        magY = t * 60;
        boltOpen = 1;
    } else if (progress < 0.55) {
        // 阶段3: 插入新弹匣
        let t = (progress - 0.35) / 0.2;
        gunX = -30 + t * 20;
        gunY = 15 - t * 5;
        magY = 60 * (1 - t);
    } else if (progress < 0.8) {
        // 阶段4: 拉动枪栓
        let t = (progress - 0.55) / 0.25;
        gunX = -10 + t * 10;
        gunY = 10;
        boltOpen = 1 - t;
    } else {
        // 阶段5: 复位
        let t = (progress - 0.8) / 0.2;
        gunX = t * 10;
        gunY = 10 * (1 - t);
    }
    
    ctx.save();
    
    // 枪身主体
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(-80 + gunX, -35 + gunY, 150, 45);
    
    // 枪管
    ctx.fillStyle = '#333333';
    ctx.fillRect(60 + gunX, -28 + gunY, 50, 30);
    
    // 枪托
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-120 + gunX, -30 + gunY, 45, 35);
    
    // 枪栓（开合动画）
    ctx.fillStyle = '#555555';
    ctx.fillRect(-40 + gunX - boltOpen * 15, -40 + gunY, 20, 10);
    
    // 弹匣
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-20 + gunX + magX, 10 + gunY + magY, 25, 45);
    
    ctx.restore();
}

function drawAutoRifleProReload(ctx, progress) {
    // 高级步枪换弹 - 更快更流畅
    let gunX = 0, gunY = 0;
    let magX = 0, magY = 0;
    let insertAnim = 0;
    
    if (progress < 0.2) {
        // 阶段1: 快速释放弹匣
        let t = progress / 0.2;
        magY = t * 50;
        gunY = t * 10;
    } else if (progress < 0.5) {
        // 阶段2: 快速插入新弹匣
        let t = (progress - 0.2) / 0.3;
        insertAnim = t;
        magY = 50 * (1 - t);
        gunY = 10 - t * 5;
    } else if (progress < 0.7) {
        // 阶段3: 释放按钮回弹
        let t = (progress - 0.5) / 0.2;
        gunY = 5;
    } else {
        // 阶段4: 快速复位
        let t = (progress - 0.7) / 0.3;
        gunY = 5 * (1 - t);
    }
    
    ctx.save();
    
    // 枪身
    ctx.fillStyle = '#252525';
    ctx.fillRect(-85 + gunX, -30 + gunY, 150, 45);
    
    // 枪管
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(60 + gunX, -22 + gunY, 65, 18);
    
    // 枪托（折叠）
    ctx.fillStyle = '#151515';
    ctx.fillRect(-110 + gunX, -25 + gunY, 30, 30);
    
    // 弹匣（带动作）
    ctx.fillStyle = '#101010';
    ctx.fillRect(-15 + gunX, 15 + gunY + magY, 25, 45);
    
    // 插入动画特效
    if (insertAnim > 0.5) {
        ctx.fillStyle = '#00ff88';
        ctx.globalAlpha = (insertAnim - 0.5) * 2;
        ctx.fillRect(-15 + gunX, 15 + gunY, 25, 5);
        ctx.globalAlpha = 1;
    }
    
    ctx.restore();
}

function drawSniperReload(ctx, progress) {
    // 狙击步枪换弹 - 手动拉栓
    let gunX = 0, gunY = 0;
    let boltPos = 0;
    let magX = 0, magY = 0;
    
    if (progress < 0.2) {
        // 阶段1: 打开枪栓
        let t = progress / 0.2;
        boltPos = t * 25;
    } else if (progress < 0.4) {
        // 阶段2: 退出弹壳
        let t = (progress - 0.2) / 0.2;
        boltPos = 25;
        gunY = Math.sin(t * Math.PI) * 10;
    } else if (progress < 0.6) {
        // 阶段3: 手动装弹
        let t = (progress - 0.4) / 0.2;
        boltPos = 25 * (1 - t);
        magY = t * 20;
    } else if (progress < 0.8) {
        // 阶段4: 关闭枪栓
        let t = (progress - 0.6) / 0.2;
        boltPos = t * -10;
    } else {
        // 阶段5: 复位
        let t = (progress - 0.8) / 0.2;
        boltPos = -10 * (1 - t);
        gunY = 0;
    }
    
    ctx.save();
    
    // 主体
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-100 + gunX, -30 + gunY, 180, 40);
    
    // 长枪管
    ctx.fillStyle = '#222222';
    ctx.fillRect(75 + gunX, -18 + gunY, 70, 20);
    
    // 木质枪托
    ctx.fillStyle = '#1a1208';
    ctx.fillRect(-150 + gunX, -25 + gunY, 55, 35);
    
    // 枪栓
    ctx.fillStyle = '#444444';
    ctx.fillRect(-20 + gunX + boltPos, -38 + gunY, 30, 15);
    
    // 瞄准镜
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-20 + gunX, -70 + gunY, 90, 38);
    
    // 弹匣
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-10 + gunX, 10 + gunY + magY, 30, 35);
    
    ctx.restore();
}

function drawLMGReload(ctx, progress) {
    // 轻机枪换弹 - 弹鼓更换
    let gunX = 0, gunY = 0;
    let drumAngle = 0;
    let drumY = 0;
    
    if (progress < 0.3) {
        // 阶段1: 抬起武器
        let t = progress / 0.3;
        gunY = t * -20;
        drumAngle = t * -0.5;
    } else if (progress < 0.55) {
        // 阶段2: 卸下弹鼓
        let t = (progress - 0.3) / 0.25;
        gunY = -20;
        drumAngle = -0.5;
        drumY = t * 50;
    } else if (progress < 0.8) {
        // 阶段3: 安装新弹鼓
        let t = (progress - 0.55) / 0.25;
        gunY = -20 + t * 10;
        drumAngle = -0.5 + t * 0.5;
        drumY = 50 * (1 - t);
    } else {
        // 阶段4: 复位
        let t = (progress - 0.8) / 0.2;
        gunY = -10 * (1 - t);
    }
    
    ctx.save();
    
    // 厚重主体
    ctx.fillStyle = '#333333';
    ctx.fillRect(-90 + gunX, -38 + gunY, 160, 55);
    
    // 枪管
    ctx.fillStyle = '#222222';
    ctx.fillRect(65 + gunX, -25 + gunY, 55, 28);
    
    // 枪托
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-130 + gunX, -30 + gunY, 45, 40);
    
    // 弹鼓（会旋转并分离）
    ctx.save();
    ctx.translate(gunX, gunY);
    ctx.rotate(drumAngle);
    
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(0, 30 + drumY, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(0, 30 + drumY, 35, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    ctx.restore();
}

function drawRPGReload(ctx, progress) {
    // 火箭筒换弹 - 装填火箭弹
    let gunX = 0, gunY = 0;
    let rocketX = 0, rocketY = 0;
    let insertProgress = 0;
    
    if (progress < 0.25) {
        // 阶段1: 武器后移
        let t = progress / 0.25;
        gunX = t * -40;
        gunY = t * 20;
    } else if (progress < 0.5) {
        // 阶段2: 火箭弹从下方进入
        let t = (progress - 0.25) / 0.25;
        gunX = -40;
        gunY = 20;
        rocketX = t * -30;
        rocketY = 80 - t * 40;
    } else if (progress < 0.75) {
        // 阶段3: 火箭弹装入
        let t = (progress - 0.5) / 0.25;
        gunX = -40 + t * 20;
        gunY = 20 - t * 10;
        insertProgress = t;
        rocketX = -30 + t * 30;
        rocketY = 40 * (1 - t);
    } else {
        // 阶段4: 复位
        let t = (progress - 0.75) / 0.25;
        gunX = -20 + t * 20;
        gunY = 10 * (1 - t);
    }
    
    ctx.save();
    
    // 发射器主体
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-100 + gunX, -25 + gunY, 160, 30);
    
    // 火箭弹（会移动）
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.moveTo(58 + rocketX, -10 + rocketY);
    ctx.lineTo(95 + rocketX, -10 + rocketY);
    ctx.lineTo(105 + rocketX, rocketY);
    ctx.lineTo(95 + rocketX, 10 + rocketY);
    ctx.lineTo(58 + rocketX, 10 + rocketY);
    ctx.closePath();
    ctx.fill();
    
    // 弹头
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(95 + rocketX, -8 + rocketY);
    ctx.lineTo(115 + rocketX, rocketY);
    ctx.lineTo(95 + rocketX, 8 + rocketY);
    ctx.closePath();
    ctx.fill();
    
    // 握把
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-50 + gunX, 5 + gunY, 20, 45);
    
    // 肩托
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-130 + gunX, -20 + gunY, 35, 25);
    
    ctx.restore();
}

function drawDefaultReload(ctx, progress) {
    // 默认换弹动画
    let offsetX = 0, offsetY = 0;
    
    if (progress < 0.3) {
        let t = progress / 0.3;
        offsetX = t * 80;
        offsetY = t * 60;
    } else if (progress < 0.6) {
        offsetX = 80;
        offsetY = 60;
    } else if (progress < 0.85) {
        let t = (progress - 0.6) / 0.25;
        offsetX = 80 * (1 - t);
        offsetY = 60 * (1 - t);
    } else {
        let t = (progress - 0.85) / 0.15;
        offsetX = t * -20;
    }
    
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-60 - offsetX, -25 - offsetY, 100, 40);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-15 - offsetX, 15 - offsetY, 25, 30);
}

render();
updateUI();
