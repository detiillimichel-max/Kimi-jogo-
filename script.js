
// Jogo: desvie dos blocos que caem
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const menu = document.getElementById('menu');
  const gameover = document.getElementById('gameover');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const finalScoreEl = document.getElementById('finalScore');

  // Ajuste de resolução para telas high-DPI mantendo tamanho CSS
  function setupCanvas() {
    const cssWidth = canvas.clientWidth;
    const cssHeight = Math.round(cssWidth * (600 / 360));
    canvas.style.height = cssHeight + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  setupCanvas();
  window.addEventListener('resize', setupCanvas);

  // Estado do jogo
  const state = {
    running: false,
    score: 0,
    best: Number(localStorage.getItem('db_best') || 0),
    player: { x: 160, y: 520, w: 40, h: 40, speed: 5, targetX: 160 },
    obstacles: [],
    t: 0,
    spawnEvery: 48, // frames
    speed: 2.0
  };
  bestEl.textContent = state.best;

  // Entrada
  const keys = { left: false, right: false };
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  });

  // Toque (mobile): tocar à esquerda/direita move o alvo
  canvas.addEventListener('pointerdown', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    state.player.targetX = x - state.player.w / 2;
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pressure === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    state.player.targetX = x - state.player.w / 2;
  });

  function reset() {
    state.running = true;
    state.score = 0;
    state.obstacles = [];
    state.t = 0;
    state.spawnEvery = 48;
    state.speed = 2.0;
    state.player.x = 160;
    state.player.targetX = 160;
    scoreEl.textContent = '0';
    menu.classList.add('hidden');
    gameover.classList.add('hidden');
  }

  startBtn.addEventListener('click', reset);
  restartBtn.addEventListener('click', reset);

  // Util
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Loop
  function update() {
    if (!state.running) return;

    state.t++;

    // Spawn obstáculos
    if (state.t % state.spawnEvery === 0) {
      const laneW = 60 + rand(-10, 10);
      const gap = 40 + rand(-12, 12);
      const count = Math.random() < 0.7 ? 2 : 3;
      const xs = [];
      for (let i = 0; i < count; i++) {
        xs.push(rand(0, canvas.clientWidth - laneW));
      }
      xs.forEach(x => {
        state.obstacles.push({
          x, y: -60, w: laneW, h: 20 + rand(10, 50), vy: state.speed + rand(0, 0.8),
          hue: 210 + rand(-10, 10)
        });
      });
      // Aumenta dificuldade gradualmente
      state.speed = Math.min(state.speed + 0.02, 6);
      state.spawnEvery = Math.max(18, state.spawnEvery - 0.2);
    }

    // Mover jogador
    if (keys.left) state.player.targetX -= state.player.speed * 2;
    if (keys.right) state.player.targetX += state.player.speed * 2;
    // Suavização
    state.player.x += (state.player.targetX - state.player.x) * 0.25;
    // Limites
    state.player.x = Math.max(0, Math.min(canvas.clientWidth - state.player.w, state.player.x));

    // Atualiza obstáculos
    state.obstacles.forEach(o => { o.y += o.vy; });
    // Remove os que saíram
    state.obstacles = state.obstacles.filter(o => o.y < canvas.clientHeight + 50);

    // Colisão
    for (const o of state.obstacles) {
      if (rectsOverlap(
        { x: state.player.x, y: state.player.y, w: state.player.w, h: state.player.h },
        { x: o.x, y: o.y, w: o.w, h: o.h }
      )) {
        gameOver();
        break;
      }
    }

    // Score
    state.score += 1;
    scoreEl.textContent = String(state.score);

    draw();
    requestAnimationFrame(update);
  }

  function draw() {
    // Limpa
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Estrelas de fundo leves
    ctx.save();
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 30; i++) {
      const x = (i * 97 + state.t * 0.3) % canvas.clientWidth;
      const y = (i * 53 + state.t * 0.2) % canvas.clientHeight;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();

    // Obstáculos
    for (const o of state.obstacles) {
      const g = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      g.addColorStop(0, `hsl(${o.hue} 60% 55% / 0.9)`);
      g.addColorStop(1, `hsl(${o.hue} 80% 35% / 0.9)`);
      ctx.fillStyle = g;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      // borda
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeRect(o.x + 0.5, o.y + 0.5, o.w - 1, o.h - 1);
    }

    // Jogador
    const p = state.player;
    ctx.fillStyle = '#6ee7ff';
    ctx.shadowColor = '#6ee7ff55';
    ctx.shadowBlur = 12;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.shadowBlur = 0;
  }

  function gameOver() {
    state.running = false;
    finalScoreEl.textContent = String(state.score);
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem('db_best', String(state.best));
      bestEl.textContent = state.best;
    }
    gameover.classList.remove('hidden');
  }

  // Inicia o loop passivo; o jogo começa ao clicar "Jogar"
  requestAnimationFrame(function raf() {
    if (state.running) update();
    else requestAnimationFrame(raf);
  });
})();
      
