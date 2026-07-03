/**
 * Microservice Visualization — WebSocket Server
 * ─────────────────────────────────────────────
 * node microservice-ws-server.js
 *
 * Broadcasts real-time traffic events to all connected clients.
 * In production: replace the simulator block with your actual
 * middleware/interceptor that calls broadcastEvent().
 *
 * npm install ws
 */

const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = 4001;

// ── HTTP server (health check endpoint) ─────────────────────────────────────
const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', clients: wss?.clients?.size ?? 0 }));
  } else {
    res.writeHead(404); res.end();
  }
});

// ── WebSocket Server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

const clients = new Set();

wss.on('connection', (ws, req) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total: ${clients.size}`);

  // Send current snapshot immediately on connect
  ws.send(JSON.stringify({ type: 'snapshot', data: getSnapshot() }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      // Client can send: { type: 'subscribe', services: ['user','order'] }
      if (msg.type === 'subscribe') {
        ws._filter = new Set(msg.services || []);
      }
    } catch {}
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
    clients.delete(ws);
  });
});

// ── Broadcast helper ─────────────────────────────────────────────────────────
/**
 * Call this from your real middleware to push live events.
 *
 * @param {Object} event
 * @param {string} event.type        - 'request' | 'error' | 'metric'
 * @param {string} event.service     - 'user' | 'order' | 'payment' | 'notif'
 * @param {string} event.method      - 'GET' | 'POST' | 'PUT' | 'DELETE'
 * @param {string} event.path        - '/api/orders/123'
 * @param {number} event.status      - HTTP status code
 * @param {number} event.latency_ms  - response time in ms
 * @param {string} [event.traceId]   - optional trace ID
 * @param {string} [event.userId]    - optional user context
 */
function broadcastEvent(event) {
  const payload = JSON.stringify({
    type: 'event',
    ts: Date.now(),
    ...event,
  });

  for (const ws of clients) {
    if (ws.readyState !== 1) continue; // OPEN
    // Respect client-side service filter if set
    if (ws._filter && ws._filter.size > 0 && !ws._filter.has(event.service)) continue;
    ws.send(payload);
  }

  // Update internal counters
  updateSnapshot(event);
}

// ── Snapshot (rolling 60-second window) ─────────────────────────────────────
const snapshot = {
  totalReq: 0,
  totalErr: 0,
  rps: 0,
  services: {
    user:    { req: 0, err: 0, latencies: [] },
    order:   { req: 0, err: 0, latencies: [] },
    payment: { req: 0, err: 0, latencies: [] },
    notif:   { req: 0, err: 0, latencies: [] },
  },
  reqWindow: [], // [{ts, service, status, latency_ms}] — last 60s
};

function updateSnapshot(event) {
  snapshot.totalReq++;
  if (event.status >= 400) snapshot.totalErr++;

  const svc = snapshot.services[event.service];
  if (svc) {
    svc.req++;
    if (event.status >= 400) svc.err++;
    svc.latencies.push(event.latency_ms);
    if (svc.latencies.length > 500) svc.latencies.shift();
  }

  snapshot.reqWindow.push({ ts: Date.now(), service: event.service, status: event.status, latency_ms: event.latency_ms });
}

function getSnapshot() {
  const now = Date.now();
  const window1s = snapshot.reqWindow.filter(e => now - e.ts < 1000);
  const window60s = snapshot.reqWindow.filter(e => now - e.ts < 60000);
  const allLatencies = window60s.map(e => e.latency_ms).sort((a,b)=>a-b);
  const p50 = percentile(allLatencies, 0.5);
  const p99 = percentile(allLatencies, 0.99);

  return {
    totalReq: snapshot.totalReq,
    totalErr: snapshot.totalErr,
    rps: window1s.length,
    p50,
    p99,
    uptime: snapshot.totalReq > 0 ? (((snapshot.totalReq - snapshot.totalErr) / snapshot.totalReq) * 100).toFixed(2) : '100.00',
    services: Object.fromEntries(
      Object.entries(snapshot.services).map(([k, v]) => {
        const lats = v.latencies.slice(-100);
        return [k, {
          req: v.req,
          err: v.err,
          errRate: v.req > 0 ? ((v.err / v.req) * 100).toFixed(1) : '0.0',
          avgLatency: lats.length ? Math.round(lats.reduce((a,b)=>a+b,0)/lats.length) : 0,
        }];
      })
    ),
  };
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.floor(sorted.length * p);
  return sorted[Math.min(idx, sorted.length - 1)];
}

// Broadcast snapshot every second to all clients
setInterval(() => {
  if (clients.size === 0) return;
  const payload = JSON.stringify({ type: 'metric', data: getSnapshot() });
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(payload);
  }
  // Prune reqWindow older than 60s
  const cutoff = Date.now() - 60000;
  snapshot.reqWindow = snapshot.reqWindow.filter(e => e.ts > cutoff);
}, 1000);


// ═══════════════════════════════════════════════════════════════════════════
// ── SIMULATOR (remove in production, replace with real instrumentation) ──
// ═══════════════════════════════════════════════════════════════════════════

const SERVICES = ['user', 'order', 'payment', 'notif'];
const PATHS = {
  user:    ['/api/users', '/api/users/login', '/api/users/profile', '/api/users/logout'],
  order:   ['/api/orders', '/api/orders/create', '/api/orders/status', '/api/orders/cancel'],
  payment: ['/api/payments/charge', '/api/payments/refund', '/api/payments/status'],
  notif:   ['/api/notify/email', '/api/notify/push', '/api/notify/sms'],
};
const METHODS = {
  user:    ['GET','GET','POST','DELETE'],
  order:   ['POST','GET','GET','DELETE'],
  payment: ['POST','POST','GET'],
  notif:   ['POST','POST','POST'],
};

let simMode = 'normal'; // 'normal' | 'spike' | 'error' | 'slow'

function simulateRequest() {
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  const paths = PATHS[service];
  const path = paths[Math.floor(Math.random() * paths.length)];
  const methods = METHODS[service];
  const method = methods[Math.floor(Math.random() * methods.length)];

  let status, latency;
  switch (simMode) {
    case 'spike':
      status = Math.random() < 0.12 ? (Math.random() < 0.5 ? 429 : 503) : 200;
      latency = Math.floor(Math.random() * 800 + 50);
      break;
    case 'error':
      status = Math.random() < 0.4 ? [500,502,503,404][Math.floor(Math.random()*4)] : 200;
      latency = Math.floor(Math.random() * 1500 + 200);
      break;
    case 'slow':
      status = Math.random() < 0.05 ? 504 : 200;
      latency = Math.floor(Math.random() * 2000 + 500);
      break;
    default:
      status = Math.random() < 0.03 ? [500,404][Math.floor(Math.random()*2)] : (Math.random() < 0.1 ? 201 : 200);
      latency = Math.floor(Math.random() * 150 + 10);
  }

  broadcastEvent({ type: 'request', service, method, path, status, latency_ms: latency, traceId: Math.random().toString(36).slice(2,10) });
}

const simIntervals = { normal: 220, spike: 60, error: 200, slow: 500 };
let simTimer = setInterval(simulateRequest, simIntervals[simMode]);

// Accept mode changes via stdin (optional: "spike\n", "error\n", etc.)
process.stdin.on('data', (d) => {
  const cmd = d.toString().trim();
  if (simIntervals[cmd]) {
    simMode = cmd;
    clearInterval(simTimer);
    simTimer = setInterval(simulateRequest, simIntervals[simMode]);
    console.log(`[SIM] Mode → ${simMode}`);
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🟢 Microservice Viz WS Server`);
  console.log(`   WebSocket : ws://localhost:${PORT}`);
  console.log(`   Health    : http://localhost:${PORT}/health`);
  console.log(`   Simulator : active (stdin: normal/spike/error/slow)\n`);
  console.log(`── Real instrumentation ──────────────────────────────`);
  console.log(`   import { broadcastEvent } from './microservice-ws-server'`);
  console.log(`   broadcastEvent({ type:'request', service:'order', method:'POST',`);
  console.log(`     path:'/api/orders', status:201, latency_ms:42, traceId:'abc' })\n`);
});

// Export for direct integration
module.exports = { broadcastEvent };
