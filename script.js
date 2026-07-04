const targetDate = new Date(2026, 7, 8, 14, 40, 0);

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
  const now = new Date();
  let diff = Math.max(0, targetDate - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff %= 1000 * 60 * 60 * 24;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff %= 1000 * 60 * 60;

  const minutes = Math.floor(diff / (1000 * 60));
  diff %= 1000 * 60;

  const seconds = Math.floor(diff / 1000);

  setNumber(daysEl, String(days));
  setNumber(hoursEl, String(hours).padStart(2, "0"));
  setNumber(minutesEl, String(minutes).padStart(2, "0"));
  setNumber(secondsEl, String(seconds).padStart(2, "0"));
}

function setNumber(el, value) {
  if (el.textContent !== value) {
    el.textContent = value;
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

const sparkleCanvas = document.getElementById("sparkles");
const lineCanvas = document.getElementById("wave");
const sparkleCtx = sparkleCanvas.getContext("2d");
const lineCtx = lineCanvas.getContext("2d");

let W = 0;
let H = 0;
let dpr = 1;

const particles = [];
const twinkles = [];

function waveY(x, t) {
  const base = lineCanvas.clientHeight * 0.56;
  const w = lineCanvas.clientWidth || 1;

  return (
    base +
    Math.sin((x / w) * Math.PI * 2.3 + t * 0.00115) * 10 +
    Math.sin((x / w) * Math.PI * 5.7 + t * 0.00155) * 4
  );
}

function createParticle(x, y) {
  return {
    x: x ?? Math.random() * W,
    y: y ?? H * (0.58 + Math.random() * 0.26),
    size: 0.7 + Math.random() * 2.8,
    vx: (Math.random() - 0.5) * 0.55,
    vy: -(0.22 + Math.random() * 0.78),
    drift: (Math.random() - 0.5) * 0.45,
    alpha: 0.3 + Math.random() * 0.7,
    life: 90 + Math.random() * 130,
    age: Math.random() * 80,
    type: Math.random() > 0.72 ? "star" : "dot",
    spin: Math.random() * Math.PI * 2,
  };
}

function createTwinkle() {
  return {
    x: Math.random() * W,
    y: H * (0.42 + Math.random() * 0.46),
    size: 0.7 + Math.random() * 2.3,
    alpha: 0.18 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
  };
}

function resizeCanvases() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  W = sparkleCanvas.clientWidth;
  H = sparkleCanvas.clientHeight;

  sparkleCanvas.width = Math.floor(W * dpr);
  sparkleCanvas.height = Math.floor(H * dpr);
  sparkleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  lineCanvas.width = Math.floor(lineCanvas.clientWidth * dpr);
  lineCanvas.height = Math.floor(lineCanvas.clientHeight * dpr);
  lineCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  particles.length = 0;
  twinkles.length = 0;

  for (let i = 0; i < 45; i++) {
    particles.push(createParticle(Math.random() * W, H * (0.55 + Math.random() * 0.34)));
  }

  for (let i = 0; i < 3; i++) {
    twinkles.push(createTwinkle());
  }
}

function drawGlowDot(ctx, x, y, r, alpha) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 7);
  glow.addColorStop(0, `rgba(255, 245, 205, ${alpha})`);
  glow.addColorStop(0.22, `rgba(255, 210, 100, ${alpha * 0.8})`);
  glow.addColorStop(0.65, `rgba(255, 160, 40, ${alpha * 0.18})`);
  glow.addColorStop(1, "rgba(255, 160, 40, 0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 238, 180, ${Math.min(1, alpha + 0.2)})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(ctx, x, y, r, alpha, spin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);

  ctx.strokeStyle = `rgba(255, 238, 185, ${alpha})`;
  ctx.lineWidth = 0.7;
  ctx.shadowColor = "rgba(255, 190, 70, 0.8)";
  ctx.shadowBlur = 9;

  ctx.beginPath();
  ctx.moveTo(-r * 4, 0);
  ctx.lineTo(r * 4, 0);
  ctx.moveTo(0, -r * 4);
  ctx.lineTo(0, r * 4);
  ctx.stroke();

  ctx.restore();
}

function spawnFromLine() {
  // 横幅全体から発生
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * W;

    // ラインの上〜下まで広く発生させる
    const y = H * (0.62 + Math.random() * 0.18);

    particles.push(createParticle(x, y));
  }

  if (particles.length > 300) {
    particles.splice(0, particles.length - 180);
  }
}

function drawSparkles(time) {
  sparkleCtx.clearRect(0, 0, W, H);
  sparkleCtx.save();
  sparkleCtx.globalCompositeOperation = "lighter";

  spawnFromLine();

  for (const t of twinkles) {
    const pulse = 0.35 + 0.65 * Math.sin(time * 0.0008 + t.phase);
    const alpha = t.alpha * pulse;

    if (t.size > 3.4) {
      drawStar(sparkleCtx, t.x, t.y, t.size, alpha, t.phase);
    } else {
      drawGlowDot(sparkleCtx, t.x, t.y, t.size, alpha * 0.75);
    }
  }

  for (const p of particles) {
    p.age++;
    p.x += p.vx + Math.sin(time * 0.0012 + p.age * 0.05) * p.drift;
    p.y += p.vy;
    p.spin += 0.025;

    const fade = Math.max(0, 1 - p.age / p.life);
    const alpha = p.alpha * fade;

    if (p.type === "star") {
      drawStar(sparkleCtx, p.x, p.y, p.size, alpha, p.spin);
    } else {
      drawGlowDot(sparkleCtx, p.x, p.y, p.size, alpha);
    }

    if (p.age > p.life || p.y < H * 0.38 || p.x < -30 || p.x > W + 30) {
      Object.assign(p, createParticle(Math.random() * W, H * (0.62 + Math.random() * 0.2)));
    }
  }

  sparkleCtx.restore();
}

function drawWave(time) {
  const width = lineCanvas.clientWidth;
  const height = lineCanvas.clientHeight;

  lineCtx.clearRect(0, 0, width, height);
  lineCtx.save();
  lineCtx.globalCompositeOperation = "lighter";
  lineCtx.lineCap = "round";

  const baseY = height * 0.58;

  // 細い金色ラインを複数重ねる
  for (let layer = 0; layer < 4; layer++) {
    lineCtx.beginPath();

    for (let x = 0; x <= width; x += 3) {
      const y =
        baseY +
        Math.sin((x / width) * Math.PI * 2.2 + time * 0.0012) * 12 +
        Math.sin((x / width) * Math.PI * 5.5 + time * 0.0017) * 3 +
        layer * 4;

      if (x === 0) lineCtx.moveTo(x, y);
      else lineCtx.lineTo(x, y);
    }

    lineCtx.strokeStyle =
      layer === 0
        ? "rgba(255,245,190,0.95)"
        : layer === 1
        ? "rgba(255,205,85,0.58)"
        : layer === 2
        ? "rgba(255,175,55,0.32)"
        : "rgba(255,245,190,0.16)";

    lineCtx.lineWidth = layer === 0 ? 2.2 : 1.1;
    lineCtx.shadowColor = "rgba(255,195,70,0.95)";
    lineCtx.shadowBlur = layer === 0 ? 18 : 10;
    lineCtx.stroke();
  }

  // ライン全体から細かい光がにじむ
  for (let i = 0; i < 95; i++) {
    const x = Math.random() * width;

    const y =
      baseY +
      Math.sin((x / width) * Math.PI * 2.2 + time * 0.0012) * 12 +
      Math.sin((x / width) * Math.PI * 5.5 + time * 0.0017) * 3 +
      Math.random() * 18 - 8;

    const r = 0.6 + Math.random() * 1.8;
    const alpha = 0.18 + Math.random() * 0.55;

    const glow = lineCtx.createRadialGradient(x, y, 0, x, y, r * 10);
    glow.addColorStop(0, `rgba(255,245,205,${alpha})`);
    glow.addColorStop(0.28, `rgba(255,210,95,${alpha * 0.75})`);
    glow.addColorStop(1, "rgba(255,180,50,0)");

    lineCtx.fillStyle = glow;
    lineCtx.beginPath();
    lineCtx.arc(x, y, r * 10, 0, Math.PI * 2);
    lineCtx.fill();
  }

  // ラインから上に立ち上がる細い光
  for (let i = 0; i < 24; i++) {
    const x = Math.random() * width;

    const startY =
      baseY +
      Math.sin((x / width) * Math.PI * 2.2 + time * 0.0012) * 12;

    const length = 18 + Math.random() * 58;
    const alpha = 0.08 + Math.random() * 0.22;

    const grad = lineCtx.createLinearGradient(x, startY, x, startY - length);
    grad.addColorStop(0, `rgba(255,220,120,${alpha})`);
    grad.addColorStop(1, "rgba(255,220,120,0)");

    lineCtx.strokeStyle = grad;
    lineCtx.lineWidth = 0.7;
    lineCtx.shadowColor = "rgba(255,205,90,0.5)";
    lineCtx.shadowBlur = 8;

    lineCtx.beginPath();
    lineCtx.moveTo(x, startY);
    lineCtx.lineTo(x, startY - length);
    lineCtx.stroke();
  }

  lineCtx.restore();
}
function animate() {
  const time = performance.now();
  drawSparkles(time);
  requestAnimationFrame(animate);
}
window.addEventListener("resize", resizeCanvases);
resizeCanvases();
animate();
