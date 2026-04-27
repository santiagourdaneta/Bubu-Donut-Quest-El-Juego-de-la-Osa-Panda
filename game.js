/**
 * BUBU DONUT QUEST  
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO GLOBAL DEL SISTEMA ---
const LOG_W = 800;
const LOG_H = 1422;
canvas.width = LOG_W;
canvas.height = LOG_H;

let state = {
    donuts: 0,
    broccoliHits: 0,
    gameOver: false,
    isStarted: false,
    bubu: { x: LOG_W / 2, y: LOG_H * 0.85, r: 60 },
    entities: [],
    particles: [],
    lastSpawn: 0
};

// --- CONFIGURACIÓN DE AUDIO ---
const bgMusic = new Audio('./assets/musica.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

// --- INICIALIZACIÓN DE UI ---
function initUI() {
    const btnStart = document.getElementById('btn-start');
    const linkRules = document.getElementById('link-rules');
    const overlay = document.getElementById('ui-overlay');

    if (btnStart) {
        btnStart.onclick = () => {
            state.isStarted = true;
            overlay.style.setProperty('display', 'none', 'important');
            if (bgMusic.paused) bgMusic.play().catch(e => console.log("Audio waiting..."));
        };
    }

    if (linkRules) {
        linkRules.onclick = (e) => {
            e.preventDefault();
            alert("🐼 PROTOCOLO DE JUEGO:\n- Usa el mouse o dedo para mover a Bubu.\n- 🍩 Dona = +1 punto (Límite 151).\n- 🥦 Brócoli = +1 daño (Límite 10).\n- El nivel cambia cada 50 donas.");
        };
    }
}
initUI();

// --- MOTOR DE DIFICULTAD ---
function getDifficultySettings(donuts) {
    if (donuts >= 140) return { speed: 15, rate: 150, label: 'SUPER', color: "#2d132c", pitch: 1.4 };
    if (donuts >= 100) return { speed: 11, rate: 320, label: 'HARD', color: "#c72c41", pitch: 1.2 };
    if (donuts >= 50) return { speed: 8, rate: 550, label: 'MEDIUM', color: "#f08a5d", pitch: 1.1 };
    return { speed: 5, rate: 900, label: 'EASY', color: "#ffe4e1", pitch: 1.0 };
}

function updateAtmosphere() {
    const settings = getDifficultySettings(state.donuts);
    canvas.style.backgroundColor = settings.color;
    bgMusic.playbackRate = settings.pitch;
    
    const levelDisplay = document.getElementById('levelTag');
    if (levelDisplay && levelDisplay.textContent !== settings.label) {
        levelDisplay.textContent = settings.label;
    }
}

// --- LÓGICA DE COLISIONES Y LÍMITES ---
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy) < (obj1.r + obj2.r);
}

function handleCollision(ent, index) {
    if (state.gameOver) return;

    if (ent.type === 'donut') {
        if (state.donuts < 151) {
            state.donuts++;
            document.getElementById('donutCount').textContent = state.donuts;
            triggerFeedback('donut');
            createBurst(ent.x, ent.y, "#FFD700");
        }
        if (state.donuts === 151) victory();
    } else {
        if (state.broccoliHits < 10) {
            state.broccoliHits++;
            document.getElementById('broccoliCount').textContent = state.broccoliHits;
            triggerFeedback('broccoli');
            createBurst(ent.x, ent.y, "#32CD32");
        }
        if (state.broccoliHits === 10) gameOver();
    }
    state.entities.splice(index, 1);
}

// --- EFECTOS VISUALES ---
function triggerFeedback(type) {
    canvas.classList.add('shake-effect');
    const flash = type === 'donut' ? 'flash-donut' : 'flash-broccoli';
    canvas.classList.add(flash);
    setTimeout(() => canvas.classList.remove('shake-effect', 'flash-donut', 'flash-broccoli'), 150);
}

function createBurst(x, y, color) {
    for (let i = 0; i < 10; i++) {
        state.particles.push({
            x, y, vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15,
            life: 1.0, color
        });
    }
}

// --- RENDERIZADO ---
function drawBubu() {
    const { x, y, r } = state.bubu;
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x - r * 0.6, y - r * 0.6, r * 0.35, 0, Math.PI * 2);
    ctx.arc(x + r * 0.6, y - r * 0.6, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "black"; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(x - r * 0.35, y - r * 0.1, r * 0.2, r * 0.28, Math.PI/4, 0, Math.PI*2);
    ctx.ellipse(x + r * 0.35, y - r * 0.1, r * 0.2, r * 0.28, -Math.PI/4, 0, Math.PI*2);
    ctx.fill();
}

// --- LOOP PRINCIPAL ---
function loop(time) {

    const frameStart = performance.now(); // Inicio del "Trace"

    if (!state.isStarted || state.gameOver) {
        requestAnimationFrame(loop);
        return;
    }

    ctx.clearRect(0, 0, LOG_W, LOG_H);
    updateAtmosphere();

    const settings = getDifficultySettings(state.donuts);

    // Generar Entidades
    if (time - state.lastSpawn > settings.rate) {
        state.entities.push({
            x: Math.random() * (LOG_W - 100) + 50,
            y: -100, r: 40,
            type: Math.random() > 0.4 ? 'broccoli' : 'donut',
            speed: settings.speed + Math.random() * 3
        });
        state.lastSpawn = time;
        Telemetry.metrics.entitiesProcessed++;
    }

    // Partículas
    state.particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.04;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 8, 8);
        if (p.life <= 0) state.particles.splice(i, 1);
    });
    ctx.globalAlpha = 1.0;

    // Procesar Entidades (Física y Dibujo)
    ctx.font = "70px Arial";
    ctx.textAlign = "center";
    for (let i = state.entities.length - 1; i >= 0; i--) {
        const ent = state.entities[i];
        ent.y += ent.speed;
        
        ctx.fillText(ent.type === 'donut' ? "🍩" : "🥦", ent.x, ent.y);

        if (checkCollision(state.bubu, ent)) {
            handleCollision(ent, i);  
        } else if (ent.y > LOG_H + 100) {
            state.entities.splice(i, 1);
        }
    }

    drawBubu();
    // Al final del frame, dibujamos el Dashboard
    Telemetry.update(frameStart);
    drawTelemetryDashboard();
    requestAnimationFrame(loop);

    // HEALTH CHECK: Si la latencia supera los 30ms, el sistema está degradado
    if (parseFloat(Telemetry.metrics.latency) > 30) {
        if (!state.degradedMode) {
            state.degradedMode = true;
            Telemetry.log('error', 'SYSTEM DEGRADED: High Latency Detected', { latency: Telemetry.metrics.latency });
            
            // Acción correctiva automática (Self-Healing)
            state.particles = []; // Limpiamos partículas para liberar memoria
        }
    } else {
        state.degradedMode = false;
    }
}

// --- FIN DEL JUEGO ---
function gameOver() {
    state.gameOver = true;
    bgMusic.pause();
    setTimeout(() => {
        alert("💀 GAME OVER: Demasiado brócoli (10/10).");
        location.reload();
    }, 100);
}

function victory() {
    state.gameOver = true;
    bgMusic.pause();
    setTimeout(() => {
        alert("🏆 ¡MISION CUMPLIDA! Bubu consiguió las 151 donas.");
        location.reload();
    }, 100);
}

// --- INPUTS ---
const handleMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    state.bubu.x = (clientX - rect.left) * (LOG_W / rect.width);
    state.bubu.y = (clientY - rect.top) * (LOG_H / rect.height);
};
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchmove', handleMove, { passive: true });

requestAnimationFrame(loop);

const Telemetry = {
    metrics: {
        latency: 0,
        fps: 0,
        history: [], // Almacén para el Sparkline
        maxHistory: 40, // Cuántos puntos mostrar en el gráfico
        entitiesProcessed: 0,
        errors: 0,
        lastTime: performance.now()
    },
    logs: [],
    
    // Structured Logging (Inspirado en JSON logging de servidores)
    log(level, message, context = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            ...context
        };
        this.logs.push(entry);
        if (this.logs.length > 5) this.logs.shift(); // Solo guardamos los últimos 5
        console.log(`[${entry.level}] ${message}`, context);
    },

    pushMetric(value) {
            this.metrics.history.push(value);
            if (this.metrics.history.length > this.metrics.maxHistory) {
                this.metrics.history.shift();
            }
    },

    update(frameStartTime) {
        const now = performance.now();
        this.metrics.latency = (now - frameStartTime).toFixed(2); // Latencia del frame
        this.metrics.fps = Math.round(1000 / (now - this.metrics.lastTime));
        this.metrics.lastTime = now;
    }
};

function drawTelemetryDashboard() {
    ctx.save();
    // Panel de fondo
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(LOG_W - 230, 10, 220, 200);

    const x = LOG_W - 220;
    ctx.font = "14px monospace";
    ctx.fillStyle = "#00ff00";
    ctx.fillText(`SYSTEM TELEMETRY`, x, 30);
    
     ctx.fillStyle = "white";
         ctx.fillText(`Latency: ${Telemetry.metrics.latency}ms`, x, 55);
         ctx.fillText(`FPS: ${Telemetry.metrics.fps}`, x, 75);
         
         // Dibujar el Sparkline de Latencia
         ctx.fillText(`LATENCY TREND:`, x, 105);
         drawSparkline(x, 115, 200, 40);
         
         // Logs
         if (Telemetry.logs.length > 0) {
             ctx.fillStyle = "#aaa";
             ctx.font = "10px monospace";
             ctx.fillText(`> ${Telemetry.logs[Telemetry.logs.length-1].message}`, x, 185);
         }
         ctx.restore();
}

// En la carga de música
bgMusic.onerror = () => {
    Telemetry.metrics.errors++;
    Telemetry.log('error', 'Audio Asset Load Failed', { path: './assets/musica.mp3' });
};

// En colisiones
if (isNaN(state.bubu.x)) {
    Telemetry.metrics.errors++;
    Telemetry.log('warn', 'Bubu position is NaN', { state: state.bubu });
}

function drawSparkline(x, y, width, height) {
    const data = Telemetry.metrics.history;
    if (data.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;

    const maxVal = Math.max(...data, 16); // Mínimo escala de 16ms (60fps)
    
    for (let i = 0; i < data.length; i++) {
        const posX = x + (i * (width / (Telemetry.metrics.maxHistory - 1)));
        const posY = y + height - (data[i] / maxVal * height);
        
        if (i === 0) ctx.moveTo(posX, posY);
        else ctx.lineTo(posX, posY);
    }
    ctx.stroke();

    // Etiqueta de escala máxima
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    ctx.font = "9px monospace";
    ctx.fillText(`${Math.round(maxVal)}ms`, x, y - 5);
}

// --- SUITE DE PRUEBAS INTEGRADA ---

const TestSuite = {
    // 1. UNIT TEST: Colisiones
    testCollision() {
        const p = { x: 100, y: 100, r: 20 };
        const e = { x: 110, y: 110, r: 20 };
        const result = checkCollision(p, e);
        console.assert(result === true, "❌ Unit Test Falló: Debería detectar colisión");
        if(result) Telemetry.log('info', 'Unit Test: Collision detection OK');
    },

    // 2. INTEGRATION TEST: Dificultad y Atmósfera
    testDifficulty() {
        console.log("🚀 Verificando escalabilidad de niveles...");
        const checkpoints = [
            { d: 10,  expected: 'EASY' },
            { d: 60,  expected: 'MEDIUM' },
            { d: 110, expected: 'HARD' },
            { d: 145, expected: 'SUPER' }
        ];

        checkpoints.forEach(check => {
            state.donuts = check.d;
            const settings = getDifficultySettings(state.donuts);
            if (settings.label === check.expected) {
                console.log(`✅ Nivel ${check.expected}: OK`);
            } else {
                console.error(`❌ FALLÓ: Se esperaba ${check.expected} pero se obtuvo ${settings.label}`);
            }
        });
        state.donuts = 0; // Reset
    },

    // 3. STRESS TEST: Carga de Entidades (Observa el Sparkline!)
    runStressTest(amount = 1000) {
        Telemetry.log('warn', `Iniciando STRESS TEST: ${amount} entidades`);
        for (let i = 0; i < amount; i++) {
            state.entities.push({
                x: Math.random() * LOG_W,
                y: Math.random() * LOG_H,
                r: 10,
                type: 'broccoli',
                speed: Math.random() * 5
            });
        }
    },

    // 4. E2E TEST: Bot de Autoreproducción
    runE2ETest() {
        Telemetry.log('info', "🤖 Bot E2E activado");
        state.isStarted = true; // Forzar inicio
        
        const testInterval = setInterval(() => {
            if (state.gameOver) {
                clearInterval(testInterval);
                Telemetry.log('info', "🏁 Prueba E2E terminada.");
                return;
            }

            const target = state.entities.find(e => e.type === 'donut');
            if (target) {
                state.bubu.x = target.x;
                state.bubu.y = target.y;
            }
        }, 16);
    }
};

// Exponer a la consola global para disparar pruebas bajo demanda
window.TestSuite = TestSuite;