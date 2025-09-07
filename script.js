document.addEventListener('DOMContentLoaded', () => {
    // 获取Canvas元素和上下文
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    
    // 获取按钮和分数元素
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const speedSelect = document.getElementById('speed-select');
    
    // 游戏配置
    const gridSize = 20; // 网格大小
    const tileCount = canvas.width / gridSize; // 网格数量
    let speed = parseInt(speedSelect.value); // 游戏速度，从下拉菜单获取
    
    // 游戏状态
    let gameRunning = false;
    let gamePaused = false;
    let gameOver = false;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    // 蛇的初始位置和速度
    let snake = [
        { x: 10, y: 10 }
    ];
    let velocityX = 0;
    let velocityY = 0;
    
    // 食物位置
    let foodX;
    let foodY;
    
    // 上一次按键方向
    let lastDirection = '';
    
    // 游戏循环
    let gameInterval;
    
    // 初始化游戏
    function initGame() {
        snake = [{ x: 10, y: 10 }];
        velocityX = 0;
        velocityY = 0;
        lastDirection = '';
        score = 0;
        scoreElement.textContent = score;
        gameOver = false;
        placeFood();
    }
    
    // 随机放置食物
    function placeFood() {
        // 生成随机位置
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        
        // 确保食物不会出现在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                placeFood(); // 如果食物出现在蛇身上，重新放置
                return;
            }
        }
    }
    
    // 游戏主循环
    function gameLoop() {
        if (gamePaused || gameOver) return;
        
        // 更新游戏状态
        moveSnake();
        
        // 检查游戏是否结束
        if (checkCollision()) {
            endGame();
            return;
        }
        
        // 清空画布
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制食物
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(
            foodX * gridSize + gridSize / 2,
            foodY * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // 绘制蛇
        ctx.fillStyle = '#2ecc71';
        for (let i = 0; i < snake.length; i++) {
            // 蛇头绘制为不同颜色
            if (i === 0) {
                ctx.fillStyle = '#27ae60';
            } else {
                ctx.fillStyle = '#2ecc71';
            }
            
            // 绘制圆角矩形作为蛇的身体
            drawRoundedRect(
                snake[i].x * gridSize,
                snake[i].y * gridSize,
                gridSize - 2,
                gridSize - 2,
                5
            );
        }
        
        // 绘制网格线（可选）
        drawGrid();
    }
    
    // 绘制圆角矩形
    function drawRoundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
    
    // 绘制网格线
    function drawGrid() {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }
    
    // 移动蛇
    function moveSnake() {
        // 创建新的蛇头
        const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
        
        // 将新蛇头添加到蛇身体的前面
        snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === foodX && head.y === foodY) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;
            
            // 更新最高分
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // 放置新的食物
            placeFood();
            
            // 不再自动增加游戏速度，由用户通过下拉菜单控制
        } else {
            // 如果没有吃到食物，移除蛇尾
            snake.pop();
        }
    }
    
    // 检查碰撞
    function checkCollision() {
        const head = snake[0];
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
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
    
    // 结束游戏
    function endGame() {
        gameOver = true;
        gameRunning = false;
        clearInterval(gameInterval);
        
        // 显示游戏结束信息
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Microsoft YaHei';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.font = '20px Microsoft YaHei';
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('按"重新开始"按钮再玩一次', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    // 开始游戏
    function startGame() {
        if (!gameRunning) {
            initGame();
            gameRunning = true;
            gamePaused = false;
            gameInterval = setInterval(gameLoop, 1000 / speed);
        }
    }
    
    // 暂停游戏
    function togglePause() {
        if (!gameRunning || gameOver) return;
        
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? '继续' : '暂停';
        
        if (gamePaused) {
            // 显示暂停信息
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '30px Microsoft YaHei';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2);
        } else {
            // 继续游戏，清除暂停信息
            gameLoop();
        }
    }
    
    // 重新开始游戏
    function restartGame() {
        clearInterval(gameInterval);
        initGame();
        gameRunning = true;
        gamePaused = false;
        pauseBtn.textContent = '暂停';
        gameInterval = setInterval(gameLoop, 1000 / speed);
    }
    
    // 更新游戏速度
    function updateGameSpeed() {
        speed = parseInt(speedSelect.value);
        
        // 如果游戏正在运行，重新设置游戏循环间隔
        if (gameRunning && !gamePaused) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, 1000 / speed);
        }
    }
    
    // 键盘控制
    function keyDown(e) {
        // 如果游戏结束或暂停，不处理按键
        if (gameOver || gamePaused) return;
        
        // 方向键控制
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (lastDirection !== 'down') {
                    velocityX = 0;
                    velocityY = -1;
                    lastDirection = 'up';
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (lastDirection !== 'up') {
                    velocityX = 0;
                    velocityY = 1;
                    lastDirection = 'down';
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (lastDirection !== 'right') {
                    velocityX = -1;
                    velocityY = 0;
                    lastDirection = 'left';
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (lastDirection !== 'left') {
                    velocityX = 1;
                    velocityY = 0;
                    lastDirection = 'right';
                }
                break;
            case ' ': // 空格键暂停/继续
                togglePause();
                break;
        }
        
        // 如果游戏尚未开始但按了方向键，自动开始游戏
        if (!gameRunning && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                            e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                            e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd' ||
                            e.key === 'W' || e.key === 'A' || e.key === 'S' || e.key === 'D')) {
            startGame();
        }
    }
    
    // 触摸控制（适用于移动设备）
    let touchStartX = 0;
    let touchStartY = 0;
    
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        // 防止滚动
        e.preventDefault();
    }
    
    function handleTouchMove(e) {
        if (!gameRunning && !gameOver) {
            startGame();
        }
        
        if (gameOver || gamePaused) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // 确定滑动方向（需要有足够的滑动距离）
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) {
                // 水平滑动
                if (dx > 0 && lastDirection !== 'left') {
                    velocityX = 1;
                    velocityY = 0;
                    lastDirection = 'right';
                } else if (dx < 0 && lastDirection !== 'right') {
                    velocityX = -1;
                    velocityY = 0;
                    lastDirection = 'left';
                }
            } else {
                // 垂直滑动
                if (dy > 0 && lastDirection !== 'up') {
                    velocityX = 0;
                    velocityY = 1;
                    lastDirection = 'down';
                } else if (dy < 0 && lastDirection !== 'down') {
                    velocityX = 0;
                    velocityY = -1;
                    lastDirection = 'up';
                }
            }
            
            // 更新触摸起始点
            touchStartX = touchEndX;
            touchStartY = touchEndY;
        }
        
        // 防止滚动
        e.preventDefault();
    }
    
    // 事件监听
    document.addEventListener('keydown', keyDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    speedSelect.addEventListener('change', updateGameSpeed);
    
    // 初始化游戏
    initGame();
    
    // 绘制初始画面
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    ctx.font = '20px Microsoft YaHei';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.fillText('按"开始游戏"按钮或方向键开始', canvas.width / 2, canvas.height / 2);
});