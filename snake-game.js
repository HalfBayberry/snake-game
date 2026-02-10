// 游戏变量
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const restartBtn = document.getElementById('restart-btn');

// 游戏设置
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed = 120; // 毫秒
let gameRunning = false;
let gameLoopId;

// 初始化游戏
function initGame() {
    // 初始化蛇的位置
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    
    // 生成第一个食物
    generateFood();
    
    // 重置方向
    direction = 'right';
    nextDirection = 'right';
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    
    // 隐藏游戏结束界面
    gameOverElement.classList.add('hidden');
}

// 生成食物
function generateFood() {
    // 创建随机位置的食物
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };
    
    // 确保食物不在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return generateFood();
        }
    }
}

// 绘制游戏元素
function draw() {
    // 清空画布
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线（可选）
    ctx.strokeStyle = '#222';
    for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#4CAF50';
        } else {
            // 蛇身
            ctx.fillStyle = '#8BC34A';
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        // 添加边框效果
        ctx.strokeStyle = '#388E3C';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // 绘制食物
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = {x: snake[0].x, y: snake[0].y};
    
    // 根据方向移动蛇头
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 生成新食物
        generateFood();
        
        // 增加游戏速度
        if (gameSpeed > 60) {
            gameSpeed -= 2;
        }
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 将新的头部添加到蛇身
    snake.unshift(head);
}

// 检测碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (
        head.x < 0 || 
        head.x >= gridWidth || 
        head.y < 0 || 
        head.y >= gridHeight
    ) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏循环
function gameLoop() {
    moveSnake();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    draw();
    
    if (gameRunning) {
        gameLoopId = setTimeout(gameLoop, gameSpeed);
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    // 显示最终得分
    finalScoreElement.textContent = score;
    
    // 显示游戏结束界面
    gameOverElement.classList.remove('hidden');
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop();
    }
}

// 暂停游戏
function pauseGame() {
    gameRunning = false;
    clearTimeout(gameLoopId);
}

// 重置游戏
function resetGame() {
    pauseGame();
    initGame();
    draw();
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    // 防止反向移动
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});

// 按钮事件监听器
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        startGame();
    }
});

pauseBtn.addEventListener('click', pauseGame);

resetBtn.addEventListener('click', resetGame);

restartBtn.addEventListener('click', () => {
    resetGame();
    startGame();
});

// 初始化游戏
initGame();
draw();

// 在窗口加载完成后设置最高分显示
window.onload = function() {
    highScoreElement.textContent = highScore;
};