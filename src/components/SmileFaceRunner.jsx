import React, { useState, useEffect, useRef, useCallback } from 'react';

const GAME_WIDTH = 320;
const GAME_HEIGHT = 160;
const GROUND_Y = 130;
const PLAYER_SIZE = 30;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_MIN_HEIGHT = 25;
const OBSTACLE_MAX_HEIGHT = 45;
const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const GAME_SPEED_INITIAL = 3;
const GAME_SPEED_MAX = 7;

const SmileFaceRunner = ({ darkMode = true }) => {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    playerY: GROUND_Y - PLAYER_SIZE,
    velocityY: 0,
    isJumping: false,
    obstacles: [],
    score: 0,
    speed: GAME_SPEED_INITIAL,
    frameCount: 0,
    isBlinking: false,
    blinkTimer: 0,
  });
  const animFrameRef = useRef(null);

  const jump = useCallback(() => {
    const game = gameRef.current;
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

    const drawSmileFace = (x, y, scale, blinking) => {
      const eyeColor = '#4A90E2';
      const mouthColor = '#34D399';
      const eyeSize = 3 * scale;
      const eyeGap = 8 * scale;
      const mouthWidth = 16 * scale;
      const mouthHeight = 10 * scale;
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

      // Mouth
      ctx.strokeStyle = mouthColor;
      ctx.lineWidth = mouthBorder;
      ctx.lineCap = 'round';
      ctx.shadowColor = mouthColor;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(x, y + 4 * scale, mouthWidth / 2, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawObstacle = (obstacle) => {
      const colors = ['#f093fb', '#667eea', '#43e97b', '#38f9d7', '#f6d365'];
      const color = colors[obstacle.colorIdx % colors.length];

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      // Draw as a rounded rectangle
      const radius = 4;
      const x = obstacle.x;
      const y = GROUND_Y - obstacle.height;
      const w = OBSTACLE_WIDTH;
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

    const gameLoop = () => {
      const game = gameRef.current;
      game.frameCount++;

      // Clear
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Ground line
      ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_WIDTH, GROUND_Y);
      ctx.stroke();

      // Ground dots
      ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
      for (let i = 0; i < GAME_WIDTH; i += 20) {
        const dotX = (i - game.frameCount * game.speed * 0.5) % GAME_WIDTH;
        const adjustedX = dotX < 0 ? dotX + GAME_WIDTH : dotX;
        ctx.fillRect(adjustedX, GROUND_Y + 5, 2, 2);
      }

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

      // Spawn obstacles
      if (game.frameCount % Math.max(60, 100 - game.score * 2) === 0) {
        game.obstacles.push({
          x: GAME_WIDTH + 10,
          height: OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT),
          colorIdx: Math.floor(Math.random() * 5),
        });
      }

      // Update obstacles
      game.obstacles = game.obstacles.filter((obs) => {
        obs.x -= game.speed;
        return obs.x > -OBSTACLE_WIDTH;
      });

      // Collision check
      const playerLeft = 30;
      const playerRight = 30 + PLAYER_SIZE * 0.7;
      const playerTop = game.playerY + 5;
      const playerBottom = game.playerY + PLAYER_SIZE;

      let hit = false;
      game.obstacles.forEach((obs) => {
        const obsTop = GROUND_Y - obs.height;
        if (
          playerRight > obs.x + 4 &&
          playerLeft < obs.x + OBSTACLE_WIDTH - 4 &&
          playerBottom > obsTop + 4
        ) {
          hit = true;
        }
      });

      if (hit) {
        // Reset instead of game over (it's a loading screen)
        game.obstacles = [];
        game.score = 0;
        game.speed = GAME_SPEED_INITIAL;
      }

      // Score
      game.obstacles.forEach((obs) => {
        if (Math.abs(obs.x - 30) < game.speed && obs.x < 30) {
          game.score++;
          game.speed = Math.min(GAME_SPEED_MAX, GAME_SPEED_INITIAL + game.score * 0.3);
        }
      });

      // Draw obstacles
      game.obstacles.forEach(drawObstacle);

      // Draw player (SmileFace)
      const squash = game.isJumping ? 0.85 : 1;
      drawSmileFace(30 + PLAYER_SIZE / 2, game.playerY + PLAYER_SIZE / 2 * squash, 1.8, game.isBlinking);

      // Score display
      ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${game.score}`, GAME_WIDTH - 10, 20);

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
