"use client";
import React, { useRef, useEffect } from 'react';

const StickHeroGame = () => {
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    phase: 'waiting',
    score: 0,
    heroX: 0,
    heroY: 0,
    sceneOffset: 0,
    platforms: [],
    sticks: [],
    trees: [],
    lastTimestamp: null,
  });

  // Configuration constants (scaled dynamically for full screen coverage)
  const scaleFactor = Math.min(window.innerWidth / 750, window.innerHeight / 750); // Dynamic scaling based on screen size
  const canvasWidth = window.innerWidth; // Full width
  const canvasHeight = window.innerHeight; // Full height
  const platformHeight = 100 * scaleFactor;
  const heroDistanceFromEdge = 15 * scaleFactor;
  const paddingX = 150 * scaleFactor;
  const perfectAreaSize = 15 * scaleFactor;
  const backgroundSpeedMultiplier = 0.2;
  const stretchingSpeed = 4 / scaleFactor; // Adjust speed for scaling
  const turningSpeed = 4 / scaleFactor;
  const walkingSpeed = 4 / scaleFactor;
  const transitioningSpeed = 2 / scaleFactor;
  const fallingSpeed = 2 / scaleFactor;
  const heroWidth = 25 * scaleFactor;
  const heroHeight = 45 * scaleFactor;

  // Utility functions
  const last = (arr) => arr[arr.length - 1];
  const sinus = (degree) => Math.sin((degree / 180) * Math.PI);

  // Game setup and reset
  const resetGame = () => {
    const state = gameStateRef.current;
    state.phase = 'waiting';
    state.lastTimestamp = null;
    state.sceneOffset = 0;
    state.score = 0;
    state.platforms = [{ x: 50 * scaleFactor, w: 50 * scaleFactor }];
    state.sticks = [
      { x: state.platforms[0].x + state.platforms[0].w, length: 0, rotation: 0 },
    ];
    state.heroX = state.platforms[0].x + state.platforms[0].w - heroDistanceFromEdge;
    state.heroY = 0;

    for (let i = 0; i < 4; i++) generatePlatform();
    state.trees = [];
    for (let i = 0; i < 10; i++) generateTree();

    updateUI();
    draw();
  };

  const generatePlatform = () => {
    const minGap = 40 * scaleFactor;
    const maxGap = 200 * scaleFactor;
    const minWidth = 20 * scaleFactor;
    const maxWidth = 100 * scaleFactor;
    const lastPlatform = last(gameStateRef.current.platforms);
    const x = lastPlatform.x + lastPlatform.w + minGap + Math.floor(Math.random() * (maxGap - minGap));
    const w = minWidth + Math.floor(Math.random() * (maxWidth - minWidth));
    gameStateRef.current.platforms.push({ x, w });
  };

  const generateTree = () => {
    const minGap = 30 * scaleFactor;
    const maxGap = 150 * scaleFactor;
    const lastTree = last(gameStateRef.current.trees) || { x: 0 };
    const x = lastTree.x + minGap + Math.floor(Math.random() * (maxGap - minGap));
    const colors = ['#6D8821', '#8FAC34', '#98B333'];
    gameStateRef.current.trees.push({ x, color: colors[Math.floor(Math.random() * 3)] });
  };

  // Animation loop
  const animate = (timestamp) => {
    const state = gameStateRef.current;
    if (!state.lastTimestamp) {
      state.lastTimestamp = timestamp;
      requestAnimationFrame(animate);
      return;
    }

    const delta = timestamp - state.lastTimestamp;

    switch (state.phase) {
      case 'waiting':
        return;
      case 'stretching':
        state.sticks[state.sticks.length - 1].length += (delta / stretchingSpeed) * scaleFactor;
        break;
      case 'turning':
        state.sticks[state.sticks.length - 1].rotation += delta / turningSpeed;
        if (state.sticks[state.sticks.length - 1].rotation > 90) {
          state.sticks[state.sticks.length - 1].rotation = 90;
          const [nextPlatform, perfectHit] = thePlatformTheStickHits();
          if (nextPlatform) {
            state.score += perfectHit ? 2 : 1;
            if (perfectHit) {
              document.getElementById('perfect').style.opacity = 1;
              setTimeout(() => (document.getElementById('perfect').style.opacity = 0), 1000);
            }
            generatePlatform();
            generateTree();
            generateTree();
          }
          state.phase = 'walking';
        }
        break;
      case 'walking':
        state.heroX += (delta / walkingSpeed) * scaleFactor;
        const [nextPlatform] = thePlatformTheStickHits();
        if (nextPlatform) {
          const maxHeroX = nextPlatform.x + nextPlatform.w - heroDistanceFromEdge;
          if (state.heroX > maxHeroX) {
            state.heroX = maxHeroX;
            state.phase = 'transitioning';
          }
        } else {
          const maxHeroX = last(state.sticks).x + last(state.sticks).length + heroWidth;
          if (state.heroX > maxHeroX) {
            state.heroX = maxHeroX;
            state.phase = 'falling';
          }
        }
        break;
      case 'transitioning':
        state.sceneOffset += (delta / transitioningSpeed) * scaleFactor;
        const next = thePlatformTheStickHits()[0];
        if (next && state.sceneOffset > next.x + next.w - paddingX) {
          state.sticks.push({ x: next.x + next.w, length: 0, rotation: 0 });
          state.phase = 'waiting';
        }
        break;
      case 'falling':
        if (state.sticks[state.sticks.length - 1].rotation < 180) {
          state.sticks[state.sticks.length - 1].rotation += delta / turningSpeed;
        }
        state.heroY += (delta / fallingSpeed) * scaleFactor;
        const maxHeroY = platformHeight + 100 * scaleFactor + (canvasHeight - canvasHeight) / 2;
        if (state.heroY > maxHeroY) {
          document.getElementById('restart').style.display = 'block';
          return;
        }
        break;
      default:
        break;
    }

    draw();
    updateUI();
    state.lastTimestamp = timestamp;
    requestAnimationFrame(animate);
  };

  const thePlatformTheStickHits = () => {
    const stick = last(gameStateRef.current.sticks);
    const stickFarX = stick.x + stick.length;
    const platform = gameStateRef.current.platforms.find((p) => p.x < stickFarX && stickFarX < p.x + p.w);
    if (
      platform &&
      platform.x + platform.w / 2 - perfectAreaSize / 2 < stickFarX &&
      stickFarX < platform.x + platform.w / 2 + perfectAreaSize / 2
    ) {
      return [platform, true];
    }
    return [platform, false];
  };

  // Drawing functions
  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    const state = gameStateRef.current;
    ctx.save();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBackground(ctx);
    ctx.translate((canvasWidth - canvasWidth) / 2 - state.sceneOffset, (canvasHeight - canvasHeight) / 2);
    drawPlatforms(ctx);
    drawHero(ctx);
    drawSticks(ctx);
    ctx.restore();
  };

  const drawBackground = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#BBD691');
    gradient.addColorStop(1, '#FEF1E1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    drawHill(ctx, 100 * scaleFactor, 10 * scaleFactor, 1, '#95C629');
    drawHill(ctx, 70 * scaleFactor, 20 * scaleFactor, 0.5, '#659F1C');
    gameStateRef.current.trees.forEach((tree) => drawTree(ctx, tree.x, tree.color));
  };

  const drawHill = (ctx, baseHeight, amplitude, stretch, color) => {
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
    for (let i = 0; i < canvasWidth; i++) {
      ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
    }
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const getHillY = (x, baseHeight, amplitude, stretch) =>
    sinus((gameStateRef.current.sceneOffset * backgroundSpeedMultiplier + x) * stretch) * amplitude +
    (canvasHeight - baseHeight);

  const drawTree = (ctx, x, color) => {
    ctx.save();
    ctx.translate(
      (-gameStateRef.current.sceneOffset * backgroundSpeedMultiplier + x) * 1,
      getHillY(x, 100 * scaleFactor, 10 * scaleFactor, 1)
    );
    ctx.fillStyle = '#7D833C';
    ctx.fillRect(-1 * scaleFactor, -5 * scaleFactor, 2 * scaleFactor, 5 * scaleFactor);
    ctx.beginPath();
    ctx.moveTo(-5 * scaleFactor, -5 * scaleFactor);
    ctx.lineTo(0, -30 * scaleFactor);
    ctx.lineTo(5 * scaleFactor, -5 * scaleFactor);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  const drawPlatforms = (ctx) => {
    gameStateRef.current.platforms.forEach(({ x, w }) => {
      ctx.fillStyle = 'black';
      ctx.fillRect(x, canvasHeight - platformHeight, w, platformHeight + (canvasHeight - canvasHeight) / 2);
      if (last(gameStateRef.current.sticks).x < x) {
        ctx.fillStyle = 'red';
        ctx.fillRect(x + w / 2 - perfectAreaSize / 2, canvasHeight - platformHeight, perfectAreaSize, perfectAreaSize);
      }
    });
  };

  const drawHero = (ctx) => {
    const state = gameStateRef.current;
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.translate(state.heroX - heroWidth / 2, state.heroY + canvasHeight - platformHeight - heroHeight / 2);
    drawRoundedRect(ctx, -heroWidth / 2, -heroHeight / 2, heroWidth, heroHeight - 4 * scaleFactor, 5 * scaleFactor);
    ctx.beginPath();
    ctx.arc(5 * scaleFactor, 11.5 * scaleFactor, 3 * scaleFactor, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-5 * scaleFactor, 11.5 * scaleFactor, 3 * scaleFactor, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(5 * scaleFactor, -7 * scaleFactor, 3 * scaleFactor, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'red';
    ctx.fillRect(-heroWidth / 2 - 1 * scaleFactor, -12 * scaleFactor, heroWidth + 2 * scaleFactor, 4.5 * scaleFactor);
    ctx.beginPath();
    ctx.moveTo(-9 * scaleFactor, -14.5 * scaleFactor);
    ctx.lineTo(-17 * scaleFactor, -18.5 * scaleFactor);
    ctx.lineTo(-14 * scaleFactor, -8.5 * scaleFactor);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10 * scaleFactor, -10.5 * scaleFactor);
    ctx.lineTo(-15 * scaleFactor, -3.5 * scaleFactor);
    ctx.lineTo(-5 * scaleFactor, -7 * scaleFactor);
    ctx.fill();
    ctx.restore();
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
  };

  const drawSticks = (ctx) => {
    gameStateRef.current.sticks.forEach((stick) => {
      ctx.save();
      ctx.translate(stick.x, canvasHeight - platformHeight);
      ctx.rotate((Math.PI / 180) * stick.rotation);
      ctx.beginPath();
      ctx.lineWidth = 2 * scaleFactor;
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -stick.length);
      ctx.stroke();
      ctx.restore();
    });
  };

  // UI updates
  const updateUI = () => {
    const state = gameStateRef.current;
    document.getElementById('score').innerText = state.score;
    document.getElementById('introduction').style.opacity = state.phase === 'waiting' ? 1 : 0;
    document.getElementById('restart').style.display =
      state.phase === 'falling' && state.heroY > platformHeight + 100 * scaleFactor ? 'block' : 'none';
  };

  // Event handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    const state = gameStateRef.current;
    if (state.phase === 'waiting') {
      state.sticks[state.sticks.length - 1].length = 0;
      state.phase = 'stretching';
      state.lastTimestamp = null;
      requestAnimationFrame(animate);
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    if (gameStateRef.current.phase === 'stretching') {
      gameStateRef.current.phase = 'turning';
    }
  };

  const handleRestart = (e) => {
    e.preventDefault();
    resetGame();
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      resetGame();
    }
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(); // Redraw on resize to cover full screen
  };

  // Initial setup
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetGame();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="container" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <style>
        {`
          html, body {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            cursor: pointer;
          }
          .container {
            display: block;
            height: 100vh;
            width: 100vw;
            position: fixed;
            top: 0;
            left: 0;
            margin: 0;
            padding: 0;
          }
          #game {
            width: 100vw;
            height: 100vh;
            object-fit: contain; /* Preserve aspect ratio */
          }
          #score {
            position: absolute;
            top: ${30 * scaleFactor}px;
            right: ${30 * scaleFactor}px;
            font-size: ${2 * scaleFactor}em;
            font-weight: 900;
            z-index: 10;
          }
          #introduction {
            width: ${200 * scaleFactor}px;
            height: ${150 * scaleFactor}px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-weight: 600;
            font-size: ${0.8 * scaleFactor}em;
            text-align: center;
            transition: opacity 2s;
            z-index: 10;
          }
          #restart {
            width: ${120 * scaleFactor}px;
            height: ${120 * scaleFactor}px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            color: white;
            background-color: red;
            border: none;
            font-weight: 700;
            font-size: ${1.2 * scaleFactor}em;
            display: none;
            cursor: pointer;
            z-index: 10;
          }
          #perfect {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: opacity 2s;
            font-size: ${1 * scaleFactor}em;
            z-index: 10;
          }
        `}
      </style>
      <div id="score">{gameStateRef.current.score}</div>
      <canvas ref={canvasRef} id="game" />
      <div id="introduction">Hold down the mouse to stretch out a stick</div>
      <div id="perfect">DOUBLE SCORE</div>
      <button id="restart" onClick={handleRestart}>RESTART</button>
    </div>
  );
};

export default StickHeroGame;