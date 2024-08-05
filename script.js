const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rocketUpImage = new Image();
rocketUpImage.src = 'rocket_up.png';

const rocketDownImage = new Image();
rocketDownImage.src = 'rocket_down.png';

let rocket = {
    x: 500,
    y: 140,
    width: 64,
    height: 64,
    gravity: 0.1,
    lift: -4,
    velocity: 0
};

let pipes = [];
let frameCount = 0;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
const pipeWidth = 50;
const pipeGap = 200;
const pipeSpacing = 180;
let gameOver = false;

function drawrocket() {
    if (rocket.velocity < 0) {
        ctx.drawImage(rocketUpImage, rocket.x, rocket.y, rocket.width, rocket.height);
    } else {
        ctx.drawImage(rocketDownImage, rocket.x, rocket.y, rocket.width, rocket.height);
    }
}

function updaterocket() {
    rocket.velocity += rocket.gravity;
    rocket.y += rocket.velocity;

    if (rocket.y < 0) {
        rocket.y = 0;
        rocket.velocity = 0;
    }

    if (rocket.y + rocket.height > canvas.height) {
        endGame();
    }
}

function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

function updatePipes() {
    frameCount++;

    if (frameCount % pipeSpacing === 0) {
        const topPipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
        pipes.push({
            x: canvas.width,
            top: topPipeHeight,
            bottom: canvas.height - topPipeHeight - pipeGap
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= 2;
    });

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function checkCollision() {
    const collisionMargin = 10; // Ajuste este valor conforme necessário
    
    pipes.forEach(pipe => {
        if (rocket.x + collisionMargin < pipe.x + pipeWidth &&
            rocket.x + rocket.width - collisionMargin > pipe.x) {
            
            if (rocket.y + collisionMargin < pipe.top || 
                rocket.y + rocket.height - collisionMargin > canvas.height - pipe.bottom) {
                endGame();
            }
        }
    });
}

function endGame() {
    gameOver = true;
    finalScore.textContent = score;
    gameOverScreen.style.display = 'block';
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
    }
}

function resetGame() {
    gameOver = false;
    rocket.y = 150;
    rocket.velocity = 0;
    pipes = [];
    frameCount = 0;
    score = 0;
    gameOverScreen.style.display = 'none';
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Pontuação: ${score}`, 10, 25);
    ctx.fillText(`Recorde: ${bestScore}`, 10, 55);
}

function updateScore() {
    pipes.forEach(pipe => {
        if (pipe.x + pipeWidth === rocket.x) {
            score++;
        }
    });
}

function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawrocket();
        updaterocket();
        drawPipes();
        updatePipes();
        checkCollision();
        updateScore();
        drawScore();
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        rocket.velocity = rocket.lift;
    }
});

restartButton.addEventListener('click', () => {
    resetGame();
    gameLoop();
});

gameLoop();