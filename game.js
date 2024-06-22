const gameCanvas = document.getElementById('gameCanvas');
const leftPaddle = document.getElementById('leftPaddle');
const rightPaddle = document.getElementById('rightPaddle');
const ball = document.getElementById('ball');
const leftScoreElement = document.getElementById('leftScore');
const rightScoreElement = document.getElementById('rightScore');
const countdownElement = document.getElementById('countdown');
const winnerMessage = document.getElementById('winnerMessage');

const canvasWidth = gameCanvas.offsetWidth;
const canvasHeight = gameCanvas.offsetHeight;
const paddleHeight = 100;
const playerPaddleSpeed = 20;  // Increased player paddle speed
const aiPaddleSpeed = 5;  // Easier AI paddle speed
const serveSpeed = 7;  // Serve speed
const ballSpeed = 13;  // Ball speed
let leftScore = 0;
let rightScore = 0;
let serveSide = 'left';  // Initial serve side

let leftPaddleY = canvasHeight / 2 - paddleHeight / 2;
let rightPaddleY = canvasHeight / 2 - paddleHeight / 2;
let ballX = canvasWidth / 2 - 5;
let ballY = canvasHeight / 2 - 5;
let ballDirectionX = 0;
let ballDirectionY = 0;
let firstHit = false;  // To track the first hit
let keysPressed = {};
let gameRunning = false;

function movePaddle() {
    if (keysPressed['w'] || keysPressed['W'] || keysPressed['ArrowUp']) {
        leftPaddleY = Math.max(0, leftPaddleY - playerPaddleSpeed);
    }
    if (keysPressed['s'] || keysPressed['S'] || keysPressed['ArrowDown']) {
        leftPaddleY = Math.min(canvasHeight - paddleHeight - 10, leftPaddleY + playerPaddleSpeed); // Ensure paddle stays within bottom limit
    }
    updatePaddlePositions();
}

function updatePaddlePositions() {
    leftPaddle.style.top = leftPaddleY + 'px';
    rightPaddle.style.top = rightPaddleY + 'px';
}

function moveBall() {
    if (!gameRunning) return;

    ballX += ballDirectionX;
    ballY += ballDirectionY;

    if (ballY <= 0 || ballY >= canvasHeight - ball.offsetHeight - 10) { // Ensure ball stays within bottom limit
        ballDirectionY = -ballDirectionY;
    }

    // Detect collision with left paddle
    if (ballX <= leftPaddle.offsetWidth && ballY + ball.offsetHeight >= leftPaddleY && ballY <= leftPaddleY + paddleHeight) {
        if (!firstHit) {
            firstHit = true;
        }
        const hitPos = (ballY - leftPaddleY) / paddleHeight;
        const angle = (hitPos - 0.5) * Math.PI / 2;  // Calculate angle based on hit position
        ballDirectionX = ballSpeed * Math.cos(angle);
        ballDirectionY = ballSpeed * Math.sin(angle);
    }

    // Detect collision with right paddle
    else if (ballX >= canvasWidth - rightPaddle.offsetWidth - ball.offsetWidth && ballY + ball.offsetHeight >= rightPaddleY && ballY <= rightPaddleY + paddleHeight) {
        if (!firstHit) {
            firstHit = true;
        }
        const hitPos = (ballY - rightPaddleY) / paddleHeight;
        const angle = (hitPos - 0.5) * Math.PI / 2;  // Calculate angle based on hit position
        ballDirectionX = -ballSpeed * Math.cos(angle);
        ballDirectionY = ballSpeed * Math.sin(angle);
    }

    // Detect if ball goes out of bounds
    else if (ballX <= 0) {
        rightScore++;
        updateScore();
        serveSide = 'right';
        resetBall();
    } else if (ballX >= canvasWidth - ball.offsetWidth) {
        leftScore++;
        updateScore();
        serveSide = 'left';
        resetBall();
    }

    updateBallPosition();
}

function updateBallPosition() {
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
}

function initBallMovement() {
    const angle = (Math.random() * Math.PI / 2) - (Math.PI / 4);
    ballDirectionX = serveSide === 'left' ? serveSpeed * Math.cos(angle) : -serveSpeed * Math.cos(angle);
    ballDirectionY = serveSpeed * Math.sin(angle);
    firstHit = false;  // Reset first hit tracker
    gameRunning = true;  // Start the game only after ball movement is initialized
}

function resetBall() {
    ballX = canvasWidth / 2 - ball.offsetWidth / 2;
    ballY = canvasHeight / 2 - ball.offsetHeight / 2;
    ballDirectionX = 0;
    ballDirectionY = 0;
    updateBallPosition();
    if (gameRunning) {
        setTimeout(initBallMovement, 1000); // Continue the game without countdown
    }
}

function updateScore() {
    leftScoreElement.textContent = leftScore;
    rightScoreElement.textContent = rightScore;

    if (leftScore >= 3) {
        gameRunning = false;
        showWinnerMessage("Left Player Wins!");
        setTimeout(() => {
            resetGame();
            countdown(3, initBallMovement);  // Show the countdown before restarting the game
        }, 3000);
    } else if (rightScore >= 3) {
        gameRunning = false;
        showWinnerMessage("Right Player Wins!");
        setTimeout(() => {
            resetGame();
            countdown(3, initBallMovement);  // Show the countdown before restarting the game
        }, 3000);
    }
}

function showWinnerMessage(message) {
    winnerMessage.textContent = message;
    winnerMessage.classList.remove('hidden');
    winnerMessage.style.display = 'block';
}

function resetGame() {
    leftScore = 0;
    rightScore = 0;
    updateScore();
    leftPaddleY = canvasHeight / 2 - paddleHeight / 2;
    rightPaddleY = canvasHeight / 2 - paddleHeight / 2;
    updatePaddlePositions();
    winnerMessage.classList.add('hidden');
    winnerMessage.style.display = 'none';
}

function moveRightPaddle() {
    if (!gameRunning || (ballDirectionX === 0 && ballDirectionY === 0)) {
        // Prevent shaking before the ball starts moving
        return;
    }

    const targetY = ballY - (paddleHeight / 2);

    // Introduce a delay or inaccuracy
    if (Math.random() < 0.2) {  // 20% chance to make an incorrect move
        rightPaddleY += (targetY - rightPaddleY) * 0.1; // Move slower towards the target
    } else {
        // Smoothly move towards the target position
        rightPaddleY += (targetY - rightPaddleY) * 0.2;
    }

    rightPaddleY = Math.max(0, Math.min(canvasHeight - paddleHeight - 10, rightPaddleY)); // Ensure paddle stays within bottom limit
    updatePaddlePositions();
}

function gameLoop() {
    movePaddle();
    moveBall();
    moveRightPaddle();
    updatePaddlePositions();
}

function countdown(seconds, callback) {
    countdownElement.style.display = 'block'; // Show countdown
    countdownElement.style.top = '50%';
    countdownElement.style.left = '50%';
    countdownElement.style.transform = 'translate(-50%, -50%)';
    countdownElement.textContent = seconds; // Start with the full seconds

    countdownInterval = setInterval(() => {
        if (seconds > 0) {
            countdownElement.textContent = seconds;
            seconds--;
        } else {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none'; // Hide countdown
            callback();
        }
    }, 1000);
}

document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
});

setInterval(gameLoop, 20);

// Initialize positions and start with countdown
updatePaddlePositions();
countdown(3, initBallMovement);
