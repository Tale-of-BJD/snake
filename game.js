(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.querySelector('#score');
  const bestEl = document.querySelector('#best');
  const statusEl = document.querySelector('#status');
  const statusDot = document.querySelector('#status-dot');
  const speedEl = document.querySelector('#speed');
  const overlay = document.querySelector('#overlay');
  const overlayTitle = document.querySelector('#overlay-title');
  const overlayCopy = document.querySelector('#overlay-copy');
  const overlayIcon = document.querySelector('#overlay-icon');
  const overlayButton = document.querySelector('#overlay-button');
  const startButton = document.querySelector('#start-button');
  const cells = 24;
  const cell = canvas.width / cells;
  let snake, direction, nextDirection, food, score, best, timer, state, tickMs;

  try { best = Number(localStorage.getItem('snake-best')) || 0; } catch { best = 0; }
  bestEl.textContent = best;

  function reset() {
    snake = [{x: 8, y: 12}, {x: 7, y: 12}, {x: 6, y: 12}, {x: 5, y: 12}];
    direction = {x: 1, y: 0}; nextDirection = {x: 1, y: 0};
    score = 0; tickMs = 145; scoreEl.textContent = score; speedEl.textContent = '1';
    placeFood(); draw();
  }

  function placeFood() {
    do { food = {x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells)}; }
    while (snake.some(part => part.x === food.x && part.y === food.y));
  }

  function setState(value) {
    state = value;
    statusEl.textContent = value === 'playing' ? '游戏进行中' : value === 'paused' ? '已暂停' : value === 'over' ? '游戏结束' : '准备就绪';
    statusDot.classList.toggle('active', value === 'playing');
    overlay.classList.toggle('hidden', value === 'playing');
    if (value === 'ready') { overlayIcon.textContent = '✦'; overlayTitle.textContent = '准备好了吗？'; overlayCopy.textContent = '按方向键或点击下方按钮开始'; overlayButton.innerHTML = '开始游戏 <span>→</span>'; }
    if (value === 'paused') { overlayIcon.textContent = 'Ⅱ'; overlayTitle.textContent = '游戏暂停'; overlayCopy.textContent = '休息一下，准备好后继续'; overlayButton.innerHTML = '继续游戏 <span>→</span>'; }
    if (value === 'over') { overlayIcon.textContent = '↻'; overlayTitle.textContent = '游戏结束'; overlayCopy.textContent = `本局得分：${score} 分，再来一局？`; overlayButton.innerHTML = '再玩一次 <span>→</span>'; }
  }

  function start() {
    if (state === 'over' || state === 'ready') reset();
    clearInterval(timer); setState('playing'); timer = setInterval(step, tickMs);
  }
  function pause() { if (state === 'playing') { clearInterval(timer); setState('paused'); } else if (state === 'paused') start(); }
  function end() {
    clearInterval(timer); setState('over');
    if (score > best) { best = score; bestEl.textContent = best; try { localStorage.setItem('snake-best', best); } catch {} }
  }

  function step() {
    direction = nextDirection;
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    const ate = head.x === food.x && head.y === food.y;
    const body = ate ? snake : snake.slice(0, -1);
    if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells || body.some(part => part.x === head.x && part.y === head.y)) { end(); return; }
    snake.unshift(head);
    if (ate) {
      score += 10; scoreEl.textContent = score; placeFood();
      const nextTick = Math.max(72, 145 - Math.floor(score / 50) * 8);
      if (nextTick !== tickMs) { tickMs = nextTick; speedEl.textContent = String(1 + Math.floor(score / 50)); clearInterval(timer); timer = setInterval(step, tickMs); }
    } else snake.pop();
    draw();
  }

  function roundedRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  }

  function draw() {
    ctx.fillStyle = '#142019'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff07'; ctx.lineWidth = 1;
    for (let i = 0; i <= cells; i++) { const p = i * cell; ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, canvas.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(canvas.width, p); ctx.stroke(); }
    const fx = food.x * cell + cell / 2, fy = food.y * cell + cell / 2;
    ctx.shadowColor = '#ff8055a0'; ctx.shadowBlur = 17; ctx.fillStyle = '#ff8a56'; ctx.beginPath(); ctx.arc(fx, fy, cell * .3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd1a6'; ctx.beginPath(); ctx.arc(fx - 2, fy - 2, cell * .075, 0, Math.PI * 2); ctx.fill();
    snake.forEach((part, i) => {
      const inset = 2.1; const x = part.x * cell + inset; const y = part.y * cell + inset;
      ctx.fillStyle = i === 0 ? '#c4f58a' : `rgb(${Math.round(153 - i * .27)},${Math.round(220 - i * .14)},${Math.round(102 - i * .08)})`;
      roundedRect(x, y, cell - inset * 2, cell - inset * 2, i === 0 ? 6 : 5);
      if (i === 0) {
        ctx.fillStyle = '#263b20';
        const eye1 = {x: x + cell * .29, y: y + cell * .34}, eye2 = {x: x + cell * .66, y: y + cell * .34};
        if (direction.x !== 0) { eye1.y = y + cell * .3; eye2.y = y + cell * .68; eye1.x = eye2.x = direction.x > 0 ? x + cell * .67 : x + cell * .28; }
        else { eye1.x = x + cell * .3; eye2.x = x + cell * .68; eye1.y = eye2.y = direction.y > 0 ? y + cell * .67 : y + cell * .28; }
        [eye1, eye2].forEach(eye => { ctx.beginPath(); ctx.arc(eye.x, eye.y, 1.6, 0, Math.PI * 2); ctx.fill(); });
      }
    });
  }

  function turn(dir) {
    if (state === 'ready' || state === 'over') start();
    if (state !== 'playing') return;
    const vectors = {up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0}};
    const candidate = vectors[dir];
    if (candidate && !(candidate.x === -direction.x && candidate.y === -direction.y)) nextDirection = candidate;
  }

  document.addEventListener('keydown', event => {
    const keys = {ArrowUp:'up', w:'up', W:'up', ArrowDown:'down', s:'down', S:'down', ArrowLeft:'left', a:'left', A:'left', ArrowRight:'right', d:'right', D:'right'};
    if (keys[event.key]) { event.preventDefault(); turn(keys[event.key]); }
    else if (event.code === 'Space') { event.preventDefault(); if (state === 'ready' || state === 'over') start(); else pause(); }
    else if (event.key.toLowerCase() === 'r') { clearInterval(timer); reset(); setState('playing'); timer = setInterval(step, tickMs); }
  });
  document.querySelectorAll('[data-dir]').forEach(button => button.addEventListener('pointerdown', event => { event.preventDefault(); turn(button.dataset.dir); }));
  startButton.addEventListener('click', start);
  overlayButton.addEventListener('click', () => state === 'paused' ? start() : start());
  reset(); setState('ready');
})();
