const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('startScreen');
const gameArea   = document.getElementById('gameArea');
const restartBtn = document.getElementById('restartBtn');

let hearts = [];
let score = 0;
let timeLeft = 30;
let gameOver = false;
let gameDuration = 30;      // definido pelo usuário
let heartSpawner, timer;
let currentKey = 'highscore-30'; // chave do localStorage para o ranking atual

// ---------- Funções utilitárias ----------
function randomX() {
  return Math.random() * (canvas.width - 30);
}

function createHeart() {
  if (gameOver) return;
  const isGolden = Math.random() < 0.1;
  hearts.push({
    x: randomX(),
    y: -30,
    speed: 2 + Math.random() * 3,
    size: 30,
    golden: isGolden
  });
}

function drawHeart(x, y, size, golden = false) {
  ctx.fillStyle = golden ? 'gold' : 'red';
  ctx.beginPath();
  ctx.moveTo(x + size/2, y + size/4);
  ctx.bezierCurveTo(x + size/2, y, x + size, y, x + size, y + size/4);
  ctx.bezierCurveTo(x + size, y + size/2, x + size/2, y + size*3/4, x + size/2, y + size);
  ctx.bezierCurveTo(x + size/2, y + size*3/4, x, y + size/2, x, y + size/4);
  ctx.bezierCurveTo(x, y, x + size/2, y, x + size/2, y + size/4);
  ctx.fill();
}

function update() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hearts.forEach((h, i) => {
    h.y += h.speed;
    drawHeart(h.x, h.y, h.size, h.golden);
    if (h.y > canvas.height) {
      hearts.splice(i, 1);
    }
  });
  requestAnimationFrame(update);
}

// ---------- Clique ----------
canvas.addEventListener('click', e => {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  hearts.forEach((h, i) => {
    if (clickX >= h.x && clickX <= h.x + h.size &&
        clickY >= h.y && clickY <= h.y + h.size) {
      score += h.golden ? 5 : 1;
      document.getElementById('score').textContent = 'Pontos: ' + score;
      if (h.golden) timeLeft += 3;
      hearts.splice(i, 1);
    }
  });
});

// ---------- Inicializar jogo ----------
function startGame(duration) {
  gameDuration = duration;
  currentKey = 'highscore-' + duration;
  timeLeft = duration;
  score = 0;
  hearts = [];
  gameOver = false;

  // Exibe ranking específico do tempo escolhido
  const bestScore = localStorage.getItem(currentKey) || 0;
  document.getElementById('best').textContent = 'Recorde: ' + bestScore;

  document.getElementById('score').textContent = 'Pontos: 0';
  document.getElementById('timer').textContent = 'Tempo: ' + timeLeft;
  document.getElementById('message').textContent = '';
  restartBtn.style.display = 'none';

  startScreen.style.display = 'none';
  gameArea.style.display = 'block';

  heartSpawner = setInterval(createHeart, 500);

  timer = setInterval(() => {
    if (timeLeft <= 0) endGame();
    else {
      timeLeft--;
      document.getElementById('timer').textContent = 'Tempo: ' + timeLeft;
    }
  }, 1000);

  update();
}

function endGame() {
  clearInterval(timer);
  clearInterval(heartSpawner);
  gameOver = true;

  const bestScore = localStorage.getItem(currentKey) || 0;
  if (score > bestScore) {
    localStorage.setItem(currentKey, score);
  }

  const finalBest = localStorage.getItem(currentKey);
  document.getElementById('message').innerHTML =
    `💖 Fim de jogo!<br>Pontos: ${score}<br>Recorde (${gameDuration}s): ${finalBest}<br>
     <strong>Você é meu maior prêmio! ❤️</strong>`;
  restartBtn.style.display = 'inline-block';
}

// ---------- Botões ----------
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => startGame(parseInt(btn.dataset.time)));
});

restartBtn.addEventListener('click', () => {
  startScreen.style.display = 'block';
  gameArea.style.display = 'none';
});
