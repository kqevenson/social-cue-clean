import React, { useState, useEffect, useRef, useCallback } from 'react';

const GAME_WIDTH = 320;
const GAME_HEIGHT = 160;
const GROUND_Y = 130;
const PLAYER_SIZE = 30;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_MIN_HEIGHT = 25;
const OBSTACLE_MAX_HEIGHT = 50;
const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const GAME_SPEED_INITIAL = 3;
const GAME_SPEED_MAX = 9;

const SmileFaceRunner = ({ darkMode = true }) => {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    playerY: GROUND_Y - PLAYER_SIZE,
    velocityY: 0,
    isJumping: false,
    obstacles: [],
    score: 0,
    bestScore: 0,
    speed: GAME_SPEED_INITIAL,
    frameCount: 0,
    isBlinking: false,
    blinkTimer: 0,
    // Death animation state
    isDead: false,
    deathTimer: 0,
    deathParticles: [],
    shakeX: 0,
    shakeY: 0,
    flashOpacity: 0,
  });
  const animFrameRef = useRef(null);

  const jump = useCallback(() => {
    const game = gameRef.current;
    if (game.isDead) return;
    if (!game.isJumping) {
      game.velocityY = JUMP_FORCE;
      game.isJumping = true;
    }
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawSmileFace = (x, y, scale, blinking, sad = false) => {
      const eyeColor = sad ? '#e74c3c' : '#4A90E2';
      const mouthColor = sad ? '#e74c3c' : '#34D399';
      const eyeSize = 3 * scale;
      const eyeGap = 8 * scale;
      const mouthBorder = 2.5 * scale;

      // Eyes
      ctx.fillStyle = eyeColor;
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 4;
      const eyeHeight = blinking ? eyeSize * 0.2 : eyeSize;
      ctx.beginPath();
      ctx.ellipse(x - eyeGap / 2, y - 4 * scale, eyeSize, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + eyeGap / 2, y - 4 * scale, eyeSize, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Mouth (flipped when sad)
      ctx.strokeStyle = mouthColor;
      ctx.lineWidth = mouthBorder;
      ctx.lineCap = 'round';
      ctx.shadowColor = mouthColor;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      if (sad) {
        // Frown - arc goes upward
        ctx.arc(x, y + 10 * scale, 8 * scale * 0.8, 1.1 * Math.PI, 1.9 * Math.PI);
      } else {
        // Smile
        ctx.arc(x, y + 4 * scale, 8 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawObstacle = (obstacle) => {
      const colors = ['#f093fb', '#667eea', '#43e97b', '#38f9d7', '#f6d365'];
      const color = colors[obstacle.colorIdx % colors.length];

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      const radius = 4;
      const x = obstacle.x;
      const y = GROUND_Y - obstacle.height;
      const w = obstacle.width || OBSTACLE_WIDTH;
      const h = obstacle.height;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawParticle = (p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const spawnDeathParticles = (x, y) => {
      const colors = ['#4A90E2', '#34D399', '#f093fb', '#667eea', '#f6d365'];
      const particles = [];
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const speed = 2 + Math.random() * 3;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: 2 + Math.random() * 3,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      return particles;
    };

    const resetGame = (game) => {
      game.isDead = false;
      game.deathTimer = 0;
      game.obstacles = [];
      game.score = 0;
      game.speed = GAME_SPEED_INITIAL;
      game.playerY = GROUND_Y - PLAYER_SIZE;
      game.velocityY = 0;
      game.isJumping = false;
      game.deathParticles = [];
      game.shakeX = 0;
      game.shakeY = 0;
      game.flashOpacity = 0;
    };

    const gameLoop = () => {
      const game = gameRef.current;
      game.frameCount++;

      // --- DEATH ANIMATION STATE ---
      if (game.isDead) {
        game.deathTimer++;

        // Screen shake (first 15 frames)
        if (game.deathTimer < 15) {
          game.shakeX = (Math.random() - 0.5) * 6;
          game.shakeY = (Math.random() - 0.5) * 4;
        } else {
          game.shakeX *= 0.8;
          game.shakeY *= 0.8;
        }

        // Flash fades out
        game.flashOpacity = Math.max(0, 0.4 - game.deathTimer * 0.01);

        // Update particles
        game.deathParticles = game.deathParticles.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.life -= 0.02;
          return p.life > 0;
        });

        // Draw death frame
        ctx.save();
        ctx.translate(game.shakeX, game.shakeY);
        ctx.clearRect(-10, -10, GAME_WIDTH + 20, GAME_HEIGHT + 20);

        // Ground
        ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(GAME_WIDTH, GROUND_Y);
        ctx.stroke();

        // Draw remaining obstacles
        game.obstacles.forEach(drawObstacle);

        // Draw sad face
        drawSmileFace(30 + PLAYER_SIZE / 2, game.playerY + PLAYER_SIZE / 2, 1.2, false, true);

        // Draw particles
        game.deathParticles.forEach(drawParticle);

        // Red flash overlay
        if (game.flashOpacity > 0) {
          ctx.fillStyle = `rgba(231, 76, 60, ${game.flashOpacity})`;
          ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }

        // Score and best score text
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Score: ${game.bestScore === game.score ? 'NEW BEST! ' : ''}${game.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10);
        if (game.bestScore > 0) {
          ctx.font = '11px monospace';
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillText(`Best: ${game.bestScore}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
        }

        ctx.restore();

        // Restart after 90 frames (~1.5 seconds)
        if (game.deathTimer > 90) {
          resetGame(game);
        }

        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // --- ACTIVE GAME STATE ---
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Ground line
      ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_WIDTH, GROUND_Y);
      ctx.stroke();

      // Ground dots (scroll speed matches game speed)
      ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
      for (let i = 0; i < GAME_WIDTH; i += 20) {
        const dotX = (i - game.frameCount * game.speed * 0.5) % GAME_WIDTH;
        const adjustedX = dotX < 0 ? dotX + GAME_WIDTH : dotX;
        ctx.fillRect(adjustedX, GROUND_Y + 5, 2, 2);
      }

      // Progressive difficulty: speed increases over time
      const timeSpeed = Math.min(2, game.frameCount * 0.0005);
      game.speed = Math.min(GAME_SPEED_MAX, GAME_SPEED_INITIAL + game.score * 0.25 + timeSpeed);

      // Physics
      game.velocityY += GRAVITY;
      game.playerY += game.velocityY;

      if (game.playerY >= GROUND_Y - PLAYER_SIZE) {
        game.playerY = GROUND_Y - PLAYER_SIZE;
        game.velocityY = 0;
        game.isJumping = false;
      }

      // Blink timer
      game.blinkTimer++;
      if (game.blinkTimer > 120 && !game.isBlinking) {
        game.isBlinking = true;
        game.blinkTimer = 0;
      }
      if (game.isBlinking && game.blinkTimer > 8) {
        game.isBlinking = false;
        game.blinkTimer = 0;
      }

      // Spawn obstacles - gets more frequent and taller as score increases
      const spawnRate = Math.max(35, 90 - game.score * 4);
      if (game.frameCount % spawnRate === 0) {
        const heightBonus = Math.min(20, game.score * 2);
        const minH = OBSTACLE_MIN_HEIGHT + heightBonus * 0.3;
        const maxH = Math.min(OBSTACLE_MAX_HEIGHT + heightBonus, 70);

        // Chance of wider obstacle at higher scores
        const isWide = game.score >= 5 && Math.random() < 0.3;

        game.obstacles.push({
          x: GAME_WIDTH + 10,
          height: minH + Math.random() * (maxH - minH),
          width: isWide ? OBSTACLE_WIDTH * 1.5 : OBSTACLE_WIDTH,
          colorIdx: Math.floor(Math.random() * 5),
        });

        // Double obstacle chance at high scores
        if (game.score >= 8 && Math.random() < 0.25) {
          game.obstacles.push({
            x: GAME_WIDTH + 10 + OBSTACLE_WIDTH + 15 + Math.random() * 20,
            height: OBSTACLE_MIN_HEIGHT + Math.random() * 15,
            width: OBSTACLE_WIDTH,
            colorIdx: Math.floor(Math.random() * 5),
          });
        }
      }

      // Update obstacles
      game.obstacles = game.obstacles.filter((obs) => {
        obs.x -= game.speed;
        return obs.x > -(obs.width || OBSTACLE_WIDTH);
      });

      // Collision check
      const playerLeft = 30;
      const playerRight = 30 + PLAYER_SIZE * 0.7;
      const playerBottom = game.playerY + PLAYER_SIZE;

      let hit = false;
      game.obstacles.forEach((obs) => {
        const obsTop = GROUND_Y - obs.height;
        const obsWidth = obs.width || OBSTACLE_WIDTH;
        if (
          playerRight > obs.x + 4 &&
          playerLeft < obs.x + obsWidth - 4 &&
          playerBottom > obsTop + 4
        ) {
          hit = true;
        }
      });

      if (hit) {
        // Start death animation
        game.isDead = true;
        game.deathTimer = 0;
        game.bestScore = Math.max(game.bestScore, game.score);
        game.deathParticles = spawnDeathParticles(
          30 + PLAYER_SIZE / 2,
          game.playerY + PLAYER_SIZE / 2
        );
        game.flashOpacity = 0.4;
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Score - mark obstacle as scored when it passes the player
      game.obstacles.forEach((obs) => {
        if (!obs.scored && obs.x + (obs.width || OBSTACLE_WIDTH) < 30) {
          obs.scored = true;
          game.score++;
        }
      });

      // Draw obstacles
      game.obstacles.forEach(drawObstacle);

      // Draw player (SmileFace)
      const squash = game.isJumping ? 0.85 : 1;
      drawSmileFace(30 + PLAYER_SIZE / 2, game.playerY + PLAYER_SIZE / 2 * squash, 1.2, game.isBlinking);

      // Score display
      ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${game.score}`, GAME_WIDTH - 10, 20);

      // Best score (if any)
      if (game.bestScore > 0) {
        ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)';
        ctx.font = '10px monospace';
        ctx.fillText(`Best: ${game.bestScore}`, GAME_WIDTH - 10, 34);
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [darkMode]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
        className="rounded-xl cursor-pointer"
        style={{
          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          maxWidth: '100%',
        }}
      />
      <p className="text-white/40 text-xs">Tap or press Space to jump!</p>
    </div>
  );
};

export default SmileFaceRunner;
