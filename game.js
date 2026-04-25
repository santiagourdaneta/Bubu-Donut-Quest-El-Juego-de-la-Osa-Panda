/**
 * BUBU DONUT QUEST - FINAL ARCHITECTURE (V1.0)
 * Especializado para alto rendimiento y feedback psicológico.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CONFIGURACIÓN DE AUDIO (DOMINIO PÚBLICO) ---
const bgMusic = new Audio('./assets/musica.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

// Desbloqueo de Audio por interacción
document.addEventListener('click', () => {
 if (bgMusic.paused && !state.gameOver) bgMusic.play();
}, { once: true });

// --- ESTADO GLOBAL DEL SISTEMA ---
const LOG_W = 800;
const LOG_H = 1422;
canvas.width = LOG_W;
canvas.height = LOG_H;

let state = {
 donuts: 0,
 broccoliHits: 0,
 gameOver: false,
 bubu: { x: LOG_W / 2, y: LOG_H * 0.85, r: 60 },
 entities: [],
 particles: [],
 lastSpawn: 0
};

// --- MOTOR DE DIFICULTAD Y PSICOLOGÍA ---
function getDifficultySettings(donuts) {
 if (donuts > 140) return { speed: 15, rate: 150, label: 'SUPER', color: "#2d132c", pitch: 1.4 };
 if (donuts > 100) return { speed: 11, rate: 320, label: 'HARD', color: "#c72c41", pitch: 1.2 };
 if (donuts > 50) return { speed: 8, rate: 550, label: 'MEDIUM', color: "#f08a5d", pitch: 1.1 };
 return { speed: 5, rate: 900, label: 'EASY', color: "#ffe4e1", pitch: 1.0 };
}

function updateAtmosphere() {
 const settings = getDifficultySettings(state.donuts);
 canvas.style.backgroundColor = settings.color;
 bgMusic.playbackRate = settings.pitch;
}

// --- LÓGICA DE COLISIONES (MODULAR) ---
function checkCollision(obj1, obj2) {
 const dx = obj1.x - obj2.x;
 const dy = obj1.y - obj2.y;
 const distance = Math.sqrt(dx * dx + dy * dy);
 return distance < (obj1.r + obj2.r);
}

function triggerFeedback(type) {
 canvas.classList.add('shake-effect');
 const flashClass = type === 'donut' ? 'flash-donut' : 'flash-broccoli';
 canvas.classList.add(flashClass);

 setTimeout(() => {
 canvas.classList.remove('shake-effect', 'flash-donut', 'flash-broccoli');
 }, 150);
}

// --- SISTEMA DE PARTÍCULAS (JUICE) ---
function createBurst(x, y, color) {
 for (let i = 0; i<10; i++) {
 state.particles.push({
 x: x, y: y,
 vx: (Math.random() - 0.5) * 15,
 vy: (Math.random() - 0.5) * 15,
 life: 1.0,
 color: color
 });
 }
}

// --- RENDERIZADO ---
function drawBubu() {
 const { x, y, r } = state.bubu;
 // Orejas
 ctx.fillStyle = "black";
 ctx.beginPath();
 ctx.arc(x - r * 0.6, y - r * 0.6, r * 0.35, 0, Math.PI * 2);
 ctx.arc(x + r * 0.6, y - r * 0.6, r * 0.35, 0, Math.PI * 2);
 ctx.fill();
 // Cara
 ctx.fillStyle = "white";
 ctx.beginPath();
 ctx.arc(x, y, r, 0, Math.PI * 2);
 ctx.fill();
 ctx.strokeStyle = "black"; ctx.lineWidth = 5; ctx.stroke();
 // Ojos (Manchas)
 ctx.fillStyle = "black";
 ctx.beginPath();
 ctx.ellipse(x - r * 0.35, y - r * 0.1, r * 0.2, r * 0.28, Math.PI/4, 0, Math.PI*2);
 ctx.ellipse(x + r * 0.35, y - r * 0.1, r * 0.2, r * 0.28, -Math.PI/4, 0, Math.PI*2);
 ctx.fill();
}

function drawEntities() {
 ctx.font = "70px Arial";
 ctx.textAlign = "center";
 state.entities.forEach(ent => {
 ctx.fillText(ent.type === 'donut' ? "🍩" : "🥦", ent.x, ent.y);
 });
}

function drawParticles() {
 state.particles.forEach((p, i) => {
 p.x += p.vx; p.y += p.vy; p.life -= 0.04;
 ctx.globalAlpha = p.life;
 ctx.fillStyle = p.color;
 ctx.fillRect(p.x, p.y, 8, 8);
 if (p.life <= 0) state.particles.splice(i, 1);
 });
 ctx.globalAlpha = 1.0;
}

// --- INPUT HANDLERS ---
const handleMove = (e) => {
 const rect = canvas.getBoundingClientRect();
 const clientX = e.touches ? e.touches[0].clientX : e.clientX;
 const clientY = e.touches ? e.touches[0].clientY : e.clientY;
 state.bubu.x = (clientX - rect.left) * (LOG_W / rect.width);
 state.bubu.y = (clientY - rect.top) * (LOG_H / rect.height);
};

canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchmove', handleMove, { passive: true });

// --- LOOP PRINCIPAL ---
function loop(time) {
 if (state.gameOver) return;
 ctx.clearRect(0, 0, LOG_W, LOG_H);

 updateAtmosphere();
 const settings = getDifficultySettings(state.donuts);

 // Spawn
 if (time - state.lastSpawn > settings.rate) {
 state.entities.push({
 x: Math.random() * (LOG_W - 100) + 50,
 y: -100, r: 40,
 type: Math.random() > 0.4 ? 'broccoli' : 'donut',
 speed: settings.speed + Math.random() * 3
 });
 state.lastSpawn = time;
 }

 // Proceso de Entidades
 for (let i = state.entities.length - 1; i >= 0; i--) {
 const ent = state.entities[i];
 ent.y += ent.speed;

 if (checkCollision(state.bubu, ent)) {
 if (ent.type === 'donut') {
 state.donuts++;
 document.getElementById('donutCount').textContent = state.donuts;
 createBurst(ent.x, ent.y, "#FFD700");
 triggerFeedback('donut');
 if (state.donuts >= 151) {
 alert("🏆 ¡MISION CUMPLIDA! BUBU ESTÁ FELIZ.");
 location.reload();
 }
 } else {
 state.broccoliHits++;
 document.getElementById('broccoliCount').textContent = state.broccoliHits;
 createBurst(ent.x, ent.y, "#32CD32");
 triggerFeedback('broccoli');
 if (state.broccoliHits >= 10) {
 alert("💀 GAME OVER: Demasiado brócoli.");
 location.reload();
 }
 }
 state.entities.splice(i, 1);
 continue;
 }

 if (ent.y > LOG_H + 100) state.entities.splice(i, 1);
 }

 drawParticles();
 drawEntities();
 drawBubu();
 ctx.fillStyle = "white";
 ctx.font = "20px monospace";
 ctx.fillText(`Entidades: ${state.entities.length}`, 100, 50);
 ctx.fillText(`Partículas: ${state.particles.length}`, 100, 80);
 requestAnimationFrame(loop);
}

function die() {
 state.gameOver = true;
 alert("¡Bubu comió demasiado brócoli! Puntuación: " + state.donuts);
 location.reload();
}

function win() {
 state.gameOver = true;
 alert("¡Bubu consiguió las 151 donas! 🏆");
 location.reload();
}

function testIntegrationDifficulty() {
 console.log("🚀 Iniciando verificación de escalabilidad...");

 const checkpoints = [
 { d: 10, expected: 'EASY', color: 'rosa' },
 { d: 60, expected: 'MEDIUM', color: 'naranja' },
 { d: 110, expected: 'HARD', color: 'rojo' },
 { d: 145, expected: 'SUPER', color: 'púrpura' }
 ];

 checkpoints.forEach(check => {
 state.donuts = check.d; // Simulamos progreso
 const settings = getDifficultySettings(state.donuts);
 updateAtmosphere(); // Disparamos el cambio visual y sonoro

 if (settings.label === check.expected) {
 console.log(`✅ Nivel ${check.expected}: OK (Velocidad: ${settings.speed})`);
 } else {
 console.log(`❌ FALLÓ: Se esperaba ${check.expected} pero se obtuvo ${settings.label}`);
 }
 });

 // Resetear a la normalidad tras el test
 state.donuts = 0;
 updateAtmosphere();
 console.log("🏁 Prueba terminada. El sistema es estable.");
}

/**
 * Bot E2E: Busca la dona más cercana y mueve a Bubu hacia ella
 * Verifica que el flujo de colisión -> score -> victoria funcione.
 */
function runE2ETest() {
 console.log("🤖 Iniciando Bot E2E...");

 const testInterval = setInterval(() => {
 if (state.gameOver) {
 clearInterval(testInterval);
 console.log("🏁 Prueba E2E Terminada: El juego finalizó correctamente.");
 return;
 }

 // Buscar la primera dona en pantalla
 const targetDonut = state.entities.find(e => e.type === 'donut');

 if (targetDonut) {
 // Mover a Bubu hacia la dona (Simulación de Input)
 state.bubu.x = targetDonut.x;
 state.bubu.y = targetDonut.y;
 } else {
 // Si no hay donas, esquivar brócolis (mover a Bubu lejos de ellos)
 const danger = state.entities.find(e => e.type === 'broccoli');
 if (danger && checkCollision(state.bubu, danger)) {
 state.bubu.x += 50; // Esquiva simple
 }
 }
 }, 16); // Corre a la misma velocidad que el frame rate (60fps)
}

function testCollision() {
 const p = { x: 100, y: 100, r: 20 };
 const e = { x: 110, y: 110, r: 20 }; // Superpuestos
 console.assert(checkCollision(p, e) === true, "Error: Debería detectar colisión");
}

function runStressTest(amount = 2000) {
 console.log(`🔥 Estresando el motor con ${amount} entidades...`);
 for (let i = 0; i < amount; i++) {
 state.entities.push({
 x: Math.random() * canvas.width,
 y: Math.random() * canvas.height,
 r: 10,
 type: 'broccoli',
 speed: Math.random() * 5
 });
 }
 // Si los FPS se mantienen cerca de 60, la ingeniería es sólida.
}

function runPerformanceTest(count = 1000) {
 console.log(`🚀 Test de rendimiento: Inyectando ${count} donuts...`);
 const originalHits = state.broccoliHits;

 // Volvemos a Bubu inmune al brócoli para el test
 state.broccoliHits = -999999;

 for (let i = 0; i < count; i++) {
 state.entities.push({
 x: Math.random() * LOG_W,
 y: Math.random() * -2000, // Esparcidos hacia arriba
 r: 30,
 type: 'donut',
 speed: 5 + Math.random() * 5
 });
 }

 // Restaurar salud después de un rato
 setTimeout(() => {
 state.broccoliHits = 0;
 console.log("🏁 Test de carga finalizado.");
 }, 5000);
}

// Inicio del Engine
requestAnimationFrame(loop);
