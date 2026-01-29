import React, { useRef, useEffect, useState, useCallback } from "react";

const COLS = 16;
const ROWS = 10;
const CELL = 20;
const W = COLS * CELL;
const H = ROWS * CELL;
const TICK_MS = 180;

const DIR = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };

function randomFood(snake) {
  const occupied = new Set(snake.map(([x, y]) => `${x},${y}`));
  let x, y;
  do {
    x = Math.floor(Math.random() * COLS);
    y = Math.floor(Math.random() * ROWS);
  } while (occupied.has(`${x},${y}`));
  return [x, y];
}

function drawSmileFace(ctx, cx, cy, size) {
  // Left eye
  ctx.fillStyle = "#4A90E2";
  ctx.beginPath();
  ctx.arc(cx - size * 0.28, cy - size * 0.18, size * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.arc(cx + size * 0.28, cy - size * 0.18, size * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // Mouth
  ctx.strokeStyle = "#34D399";
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy + size * 0.05, size * 0.28, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

const SmileFaceWormGame = ({ darkMode = true }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try { return parseInt(localStorage.getItem("wormBest") || "0", 10); } catch { return 0; }
  });
  const [gameOver, setGameOver] = useState(false);

  const init = useCallback(() => {
    const startX = Math.floor(COLS / 2);
    const startY = Math.floor(ROWS / 2);
    const snake = [[startX, startY], [startX - 1, startY], [startX - 2, startY]];
    const state = {
      snake,
      dir: DIR.RIGHT,
      nextDir: DIR.RIGHT,
      food: randomFood(snake),
      particles: [],
      dead: false,
    };
    stateRef.current = state;
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => { init(); }, [init]);

  // Input handling
  useEffect(() => {
    const onKey = (e) => {
      const s = stateRef.current;
      if (!s) return;
      if (s.dead) { init(); return; }
      const map = { ArrowUp: DIR.UP, ArrowDown: DIR.DOWN, ArrowLeft: DIR.LEFT, ArrowRight: DIR.RIGHT, w: DIR.UP, s: DIR.DOWN, a: DIR.LEFT, d: DIR.RIGHT };
      const nd = map[e.key];
      if (!nd) return;
      e.preventDefault();
      // Prevent reversing
      if (nd[0] + s.dir[0] === 0 && nd[1] + s.dir[1] === 0) return;
      s.nextDir = nd;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [init]);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let touchStart = null;
    const onStart = (e) => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onEnd = (e) => {
      if (!touchStart) return;
      const s = stateRef.current;
      if (!s) return;
      if (s.dead) { init(); return; }
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      let nd;
      if (Math.abs(dx) > Math.abs(dy)) {
        nd = dx > 0 ? DIR.RIGHT : DIR.LEFT;
      } else {
        nd = dy > 0 ? DIR.DOWN : DIR.UP;
      }
      if (nd[0] + s.dir[0] === 0 && nd[1] + s.dir[1] === 0) return;
      s.nextDir = nd;
      touchStart = null;
    };
    canvas.addEventListener("touchstart", onStart, { passive: true });
    canvas.addEventListener("touchend", onEnd, { passive: true });
    return () => { canvas.removeEventListener("touchstart", onStart); canvas.removeEventListener("touchend", onEnd); };
  }, [init]);

  // Game loop
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    let animId;
    let lastTick = 0;

    const loop = (ts) => {
      animId = requestAnimationFrame(loop);
      const s = stateRef.current;
      if (!s) return;

      // Tick
      if (ts - lastTick >= TICK_MS && !s.dead) {
        lastTick = ts;
        s.dir = s.nextDir;
        const head = [s.snake[0][0] + s.dir[0], s.snake[0][1] + s.dir[1]];

        // Wall wrap-around (no death on walls)
        if (head[0] < 0) head[0] = COLS - 1;
        if (head[0] >= COLS) head[0] = 0;
        if (head[1] < 0) head[1] = ROWS - 1;
        if (head[1] >= ROWS) head[1] = 0;

        // Self collision
        if (s.snake.some(([x, y]) => x === head[0] && y === head[1])) {
          s.dead = true;
          setGameOver(true);
          const newBest = Math.max(best, s.snake.length - 3);
          if (newBest > best) { setBest(newBest); try { localStorage.setItem("wormBest", String(newBest)); } catch {} }
          setTimeout(() => init(), 1500);
        } else {
          s.snake.unshift(head);
          // Eat food?
          if (head[0] === s.food[0] && head[1] === s.food[1]) {
            const sc = s.snake.length - 3;
            setScore(sc);
            // Particles
            for (let i = 0; i < 8; i++) {
              const angle = (Math.PI * 2 * i) / 8;
              s.particles.push({
                x: s.food[0] * CELL + CELL / 2,
                y: s.food[1] * CELL + CELL / 2,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 1,
                color: i % 2 === 0 ? "#4A90E2" : "#34D399",
              });
            }
            s.food = randomFood(s.snake);
          } else {
            s.snake.pop();
          }
        }
      }

      // Update particles
      s.particles = s.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        return p.life > 0;
      });

      // --- Draw ---
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = darkMode ? "rgba(2,4,18,0.85)" : "rgba(30,30,60,0.85)";
      ctx.fillRect(0, 0, W, H);

      // Grid lines (subtle)
      ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke();
      }

      // Food (SmileFace)
      drawSmileFace(ctx, s.food[0] * CELL + CELL / 2, s.food[1] * CELL + CELL / 2, CELL * 0.9);

      // Worm
      s.snake.forEach(([x, y], i) => {
        const t = i / Math.max(s.snake.length - 1, 1);
        const r = Math.round(67 + t * (52 - 67));
        const g = Math.round(126 + t * (211 - 126));
        const b = Math.round(234 + t * (153 - 234));
        ctx.fillStyle = s.dead ? `rgba(255,80,80,${0.8 - t * 0.3})` : `rgb(${r},${g},${b})`;
        const pad = i === 0 ? 1 : 2;
        const sz = CELL - pad * 2;
        ctx.beginPath();
        ctx.roundRect(x * CELL + pad, y * CELL + pad, sz, sz, 4);
        ctx.fill();

        // Eyes on head
        if (i === 0 && !s.dead) {
          ctx.fillStyle = "#fff";
          const ex = x * CELL + CELL / 2;
          const ey = y * CELL + CELL / 2;
          ctx.beginPath();
          ctx.arc(ex - 3 + s.dir[0] * 2, ey - 2 + s.dir[1] * 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + 3 + s.dir[0] * 2, ey - 2 + s.dir[1] * 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // Pupils
          ctx.fillStyle = "#111";
          ctx.beginPath();
          ctx.arc(ex - 3 + s.dir[0] * 3, ey - 2 + s.dir[1] * 3, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + 3 + s.dir[0] * 3, ey - 2 + s.dir[1] * 3, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Particles
      s.particles.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Game over overlay
      if (s.dead) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", W / 2, H / 2 - 6);
        ctx.font = "13px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText("Restarting...", W / 2, H / 2 + 14);
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [darkMode, best, init]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded-2xl border border-white/10"
        style={{ imageRendering: "pixelated", touchAction: "none" }}
      />
      <div className="flex items-center gap-4 text-sm">
        <span className="text-emerald-300 font-semibold">Score: {score}</span>
        <span className="text-blue-300/60">Best: {best}</span>
      </div>
      <p className="text-white/30 text-xs">Arrow keys or swipe to play</p>
    </div>
  );
};

export default SmileFaceWormGame;
