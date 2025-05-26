document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const gameBoard = document.getElementById('gameBoard');
    const ball = document.getElementById('ball');
    const target = document.getElementById('target');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const soundBtn = document.getElementById('soundBtn');
    const levelDisplay = document.getElementById('level');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const gameMessage = document.getElementById('gameMessage');
    
    // Audio elements
    const targetSound = document.getElementById('targetSound');
    const obstacleSound = document.getElementById('obstacleSound');
    const gameOverSound = document.getElementById('gameOverSound');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const moveSound = document.getElementById('moveSound');
    
    // Game variables
    let ballX = 50;
    let ballY = 50;
    let score = 0;
    let level = 1;
    let timeLeft = 60;
    let gameInterval;
    let timeInterval;
    let isGameRunning = false;
    let keysPressed = {};
    let isSoundOn = true;
    let lastMoveSoundTime = 0;
    
    // Initialize game
    function initGame() {
        // Set initial positions
        ballX = 50;
        ballY = 50;
        updateBallPosition();
        
        // Place target randomly
        placeTarget();
        
        // Reset obstacles
        resetObstacles();
        
        // Update displays
        updateDisplays();
        
        // Reset ball appearance
        ball.style.backgroundColor = '#e74c3c';
        ball.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        ball.style.animation = '';
    }
    
    // Place target at random position
    function placeTarget() {
        const boardWidth = gameBoard.offsetWidth;
        const boardHeight = gameBoard.offsetHeight;
        
        const targetX = Math.random() * (boardWidth - 60) + 10;
        const targetY = Math.random() * (boardHeight - 60) + 10;
        
        target.style.left = `${targetX}px`;
        target.style.top = `${targetY}px`;
        
        // Add entrance animation
        target.style.animation = 'none';
        setTimeout(() => {
            target.style.animation = 'pulse 1.5s infinite, glow 2s infinite alternate';
        }, 10);
    }
    
    // Reset obstacles for current level
    function resetObstacles() {
        // Remove existing obstacles
        const existingObstacles = document.querySelectorAll('.obstacle');
        existingObstacles.forEach(obs => obs.remove());
        
        // Add new obstacles based on level
        const boardWidth = gameBoard.offsetWidth;
        const boardHeight = gameBoard.offsetHeight;
        const obstacleCount = level + 2;
        
        for (let i = 0; i < obstacleCount; i++) {
            const obstacle = document.createElement('div');
            obstacle.className = 'obstacle';
            
            // Random position that's not too close to ball or target
            let obstacleX, obstacleY;
            do {
                obstacleX = Math.random() * (boardWidth - 80) + 10;
                obstacleY = Math.random() * (boardHeight - 80) + 10;
            } while (
                (Math.abs(obstacleX - ballX) < 100 && Math.abs(obstacleY - ballY) < 100) ||
                (Math.abs(obstacleX - parseFloat(target.style.left)) < 100 && 
                Math.abs(obstacleY - parseFloat(target.style.top)) < 100)
            );
            
            obstacle.style.left = `${obstacleX}px`;
            obstacle.style.top = `${obstacleY}px`;
            
            // Random size for variety
            const size = 50 + Math.random() * 40;
            obstacle.style.width = `${size}px`;
            obstacle.style.height = `${size}px`;
            
            // Random color variation
            const hue = 30 + Math.random() * 20; // Orange color range
            obstacle.style.backgroundColor = `hsl(${hue}, 80%, 50%)`;
            
            gameBoard.appendChild(obstacle);
        }
    }
    
    // Update ball position
    function updateBallPosition() {
        ball.style.left = `${ballX}px`;
        ball.style.top = `${ballY}px`;
    }
    
    // Update displays
    function updateDisplays() {
        levelDisplay.textContent = level;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        
        // Animate score change
        scoreDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => {
            scoreDisplay.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Check collision between ball and element
    function checkCollision(ball, element) {
        const ballRect = ball.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        return !(
            ballRect.right < elementRect.left ||
            ballRect.left > elementRect.right ||
            ballRect.bottom < elementRect.top ||
            ballRect.top > elementRect.bottom
        );
    }
    
    // Create particles effect
    function createParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.backgroundColor = color;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Random direction and distance
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            gameBoard.appendChild(particle);
            
            // Remove after animation
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }
    
    // Show score popup
    function showScorePopup(amount, x, y) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${amount}`;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        gameBoard.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    // Play sound with check for sound setting
    function playSound(sound) {
        if (isSoundOn) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio play failed:", e));
        }
    }
    
    // Move ball based on keys pressed
    function moveBall() {
        const speed = 5 + level * 0.5; // Increase speed with level
        const boardWidth = gameBoard.offsetWidth;
        const boardHeight = gameBoard.offsetHeight;
        let moved = false;
        
        if (keysPressed['ArrowUp'] && ballY > 0) {
            ballY -= speed;
            ball.style.transform = 'translateY(-5px)';
            moved = true;
        }
        if (keysPressed['ArrowDown'] && ballY < boardHeight - 40) {
            ballY += speed;
            ball.style.transform = 'translateY(5px)';
            moved = true;
        }
        if (keysPressed['ArrowLeft'] && ballX > 0) {
            ballX -= speed;
            ball.style.transform = 'translateX(-5px)';
            moved = true;
        }
        if (keysPressed['ArrowRight'] && ballX < boardWidth - 40) {
            ballX += speed;
            ball.style.transform = 'translateX(5px)';
            moved = true;
        }
        
        // Play move sound (with throttle)
        if (moved && Date.now() - lastMoveSoundTime > 100) {
            playSound(moveSound);
            lastMoveSoundTime = Date.now();
        }
        
        // Reset transform if no keys pressed
        if (!Object.keys(keysPressed).some(key => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key))) {
            ball.style.transform = 'translate(0)';
        }
        
        updateBallPosition();
        
        // Check target collision
        if (checkCollision(ball, target)) {
            const points = 10 * level;
            score += points;
            level++;
            timeLeft += 10; // Add time for reaching target
            updateDisplays();
            
            // Play sound and effects
            playSound(targetSound);
            createParticles(ballX + 20, ballY + 20, '#2ecc77', 15);
            showScorePopup(points, ballX, ballY - 20);
            
            // Celebrate
            ball.style.animation = 'bounce 0.5s';
            setTimeout(() => {
                ball.style.animation = '';
            }, 500);
            
            // Place new target and obstacles
            placeTarget();
            resetObstacles();
        }
        
        // Check obstacle collision
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            if (checkCollision(ball, obstacle)) {
                score = Math.max(0, score - 5);
                timeLeft = Math.max(0, timeLeft - 3);
                updateDisplays();
                
                // Play sound and effects
                playSound(obstacleSound);
                createParticles(ballX + 20, ballY + 20, '#f39c12', 8);
                
                // Push ball away from obstacle
                const obstacleRect = obstacle.getBoundingClientRect();
                const obstacleCenterX = obstacleRect.left + obstacleRect.width / 2;
                const obstacleCenterY = obstacleRect.top + obstacleRect.height / 2;
                
                if (ballX < obstacleCenterX) ballX -= 15;
                else ballX += 15;
                
                if (ballY < obstacleCenterY) ballY -= 15;
                else ballY += 15;
                
                updateBallPosition();
                
                // Visual feedback
                ball.style.animation = 'shake 0.5s';
                ball.style.backgroundColor = '#ff6b6b';
                ball.style.boxShadow = '0 0 20px #ff6b6b';
                setTimeout(() => {
                    ball.style.animation = '';
                    ball.style.backgroundColor = '#e74c3c';
                    ball.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
                }, 500);
            }
        });
    }
    
    // Start game
    function startGame() {
        if (isGameRunning) return;
        
        isGameRunning = true;
        score = 0;
        level = 1;
        timeLeft = 60;
        updateDisplays();
        initGame();
        
        gameMessage.style.display = 'none';
        
        // Start game loop
        gameInterval = setInterval(moveBall, 20);
        
        // Start timer
        timeInterval = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            
            // Flash timer when low
            if (timeLeft <= 10) {
                timeDisplay.style.animation = 'pulse 0.5s infinite';
                timeDisplay.style.color = '#e74c3c';
            }
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        
        // Start background music
        if (isSoundOn) {
            backgroundMusic.volume = 0.3;
            backgroundMusic.play().catch(e => console.log("Background music play failed:", e));
        }
    }
    
    // End game
    function endGame() {
        isGameRunning = false;
        clearInterval(gameInterval);
        clearInterval(timeInterval);
        
        // Stop background music
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        
        // Play game over sound
        playSound(gameOverSound);
        
        // Show game over message with animation
        gameMessage.textContent = `Game Over!\nFinal Score: ${score}`;
        gameMessage.style.display = 'block';
        gameMessage.style.animation = 'bounce 0.5s';
        
        // Reset timer display
        timeDisplay.style.animation = '';
        timeDisplay.style.color = '';
    }
    
    // Reset game
    function resetGame() {
        endGame();
        initGame();
    }
    
    // Toggle sound
    function toggleSound() {
        isSoundOn = !isSoundOn;
        soundBtn.textContent = isSoundOn ? '🔊 Sound On' : '🔇 Sound Off';
        
        if (isGameRunning && isSoundOn) {
            backgroundMusic.play().catch(e => console.log("Background music play failed:", e));
        } else {
            backgroundMusic.pause();
        }
    }
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    soundBtn.addEventListener('click', toggleSound);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            keysPressed[e.key] = true;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            delete keysPressed[e.key];
        }
    });
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    gameBoard.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });
    
    gameBoard.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Determine swipe direction
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0) {
                // Left swipe
                keysPressed['ArrowLeft'] = true;
                setTimeout(() => delete keysPressed['ArrowLeft'], 100);
            } else {
                // Right swipe
                keysPressed['ArrowRight'] = true;
                setTimeout(() => delete keysPressed['ArrowRight'], 100);
            }
        } else {
            // Vertical swipe
            if (diffY > 0) {
                // Up swipe
                keysPressed['ArrowUp'] = true;
                setTimeout(() => delete keysPressed['ArrowUp'], 100);
            } else {
                // Down swipe
                keysPressed['ArrowDown'] = true;
                setTimeout(() => delete keysPressed['ArrowDown'], 100);
            }
        }
        
        touchStartX = 0;
        touchStartY = 0;
        e.preventDefault();
    }, { passive: false });
    
    // Initialize game
    initGame();
});