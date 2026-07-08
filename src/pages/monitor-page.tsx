import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageContext";
import { useTheme } from "@/components/ui/ThemeContext";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface ServiceDef {
  id: string;
  label: string;
  color: string | { light: string; dark: string };
  port: number;
  runtime: string;
  db: string;
}

interface TrafficEvent {
  service: string;
  method: string;
  path: string;
  status: number;
  latency_ms: number;
}

interface LogEntry extends TrafficEvent {
  id: number;
  ts: string;
}

interface ParticleData {
  id: number;
  svcIdx: number;
  color: string;
  isErr: boolean;
  segIdx: number;
  t: number;
  speed: number;
  x: number;
  y: number;
  alive: boolean;
  flowMode: "one-way" | "two-way";
}

interface StatsHistoryItem {
  ts: number;
  isErr: boolean;
  latency: number;
}

interface SvcStats {
  req: number;
  err: number;
  latencies: number[];
  window: number[]; // timestamps
  history?: StatsHistoryItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SERVICES: ServiceDef[] = [
  {
    id: "user",
    label: "User Service",
    color: { light: "rgba(139, 92, 246, 1)", dark: "#a855f7" },
    port: 3001,
    runtime: "Node.js",
    db: "PostgreSQL",
  },
  {
    id: "order",
    label: "Order Service",
    color: { light: "rgba(0, 179, 255, 1)", dark: "#00d4ff" },
    port: 3002,
    runtime: "Go",
    db: "MongoDB",
  },
  {
    id: "payment",
    label: "Payment Service",
    color: { light: "rgba(0, 179, 136, 1)", dark: "#00ff88" },
    port: 3003,
    runtime: "Python",
    db: "PostgreSQL",
  },
  {
    id: "notif",
    label: "Notif Service",
    color: { light: "rgba(255, 179, 102, 1)", dark: "#ffd166" },
    port: 3004,
    runtime: "Node.js",
    db: "Redis",
  },
];

const SVC_Y = [110, 210, 310, 410];

// Path segments per service: Client→Gateway→Service→DB
function getSegments(svcY: number, flowMode: "one-way" | "two-way") {
  const req = [
    { x1: 90, y1: 260, x2: 175, y2: 260 },
    { x1: 175, y1: 260, x2: 275, y2: 260 },
    { x1: 275, y1: 260, x2: 330, y2: svcY },
    { x1: 440, y1: svcY, x2: 510, y2: svcY },
  ];
  if (flowMode === "one-way") return req;
  return [
    ...req,
    { x1: 510, y1: svcY, x2: 440, y2: svcY },
    { x1: 330, y1: svcY, x2: 275, y2: 260 },
    { x1: 275, y1: 260, x2: 175, y2: 260 },
    { x1: 175, y1: 260, x2: 90, y2: 260 },
  ];
}

const SIM_PATHS: Record<string, string[]> = {
  user: [
    "/api/users",
    "/api/users/login",
    "/api/users/me",
    "/api/users/logout",
  ],
  order: [
    "/api/orders",
    "/api/orders/create",
    "/api/orders/status",
    "/api/orders/cancel",
  ],
  payment: [
    "/api/payments/charge",
    "/api/payments/refund",
    "/api/payments/status",
  ],
  notif: ["/api/notify/email", "/api/notify/push", "/api/notify/sms"],
};

const SIM_METHODS: Record<string, string[]> = {
  user: ["GET", "GET", "POST", "DELETE"],
  order: ["POST", "GET", "GET", "DELETE"],
  payment: ["POST", "POST", "GET"],
  notif: ["POST", "POST", "POST"],
};

const SIM_INTERVAL: Record<string, number> = {
  normal: 240,
  spike: 70,
  error: 200,
  slow: 600,
};

type SimMode = "normal" | "spike" | "error" | "slow";
type WsStatus = "disconnected" | "connecting" | "connected" | "error";

let _uid = 0;
const uid = () => ++_uid;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function latColor(ms: number) {
  return ms < 200 ? "#00ff88" : ms < 700 ? "#ffd166" : "#ff4d6d";
}
function errColor(r: string) {
  return parseFloat(r) < 3
    ? "#00ff88"
    : parseFloat(r) < 10
      ? "#ffd166"
      : "#ff4d6d";
}
function upColor(u: string) {
  return parseFloat(u) > 99
    ? "#00ff88"
    : parseFloat(u) > 95
      ? "#ffd166"
      : "#ff4d6d";
}
function methodColor(m: string) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    (
      {
        GET: isLight ? "#00b388" : "#00ff88",
        POST: isLight ? "#0096d2" : "#00d4ff",
        PUT: isLight ? "#a36c00" : "#ffd166",
        DELETE: isLight ? "#d2304b" : "#ff4d6d",
      } as Record<string, string>
    )[m] ?? "#9ca3af"
  );
}
function pct(sorted: number[], p: number) {
  if (!sorted.length) return 0;
  return sorted[Math.min(Math.floor(sorted.length * p), sorted.length - 1)];
}
function now_ts() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function makeSimEvent(mode: SimMode): TrafficEvent {
  const svc = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  const paths = SIM_PATHS[svc.id] ?? ["/api/" + svc.id];
  const meths = SIM_METHODS[svc.id] ?? ["GET", "POST"];
  const path = paths[Math.floor(Math.random() * paths.length)];
  const method = meths[Math.floor(Math.random() * meths.length)];
  let status: number;
  let latency_ms: number;
  switch (mode) {
    case "spike":
      status = Math.random() < 0.13 ? (Math.random() < 0.5 ? 429 : 503) : 200;
      latency_ms = ~~(Math.random() * 800 + 50);
      break;
    case "error":
      status =
        Math.random() < 0.4 ? [500, 502, 503, 404][~~(Math.random() * 4)] : 200;
      latency_ms = ~~(Math.random() * 1500 + 200);
      break;
    case "slow":
      status = Math.random() < 0.05 ? 504 : 200;
      latency_ms = ~~(Math.random() * 2000 + 500);
      break;
    default:
      status =
        Math.random() < 0.03
          ? Math.random() < 0.5
            ? 500
            : 404
          : Math.random() < 0.1
            ? 201
            : 200;
      latency_ms = ~~(Math.random() * 150 + 10);
  }
  return { service: svc.id, method, path, status, latency_ms };
}

// ─────────────────────────────────────────────────────────────────────────────
// PULSE DOT  (animates via RAF, no re-render)
// ─────────────────────────────────────────────────────────────────────────────
function PulseDot({
  cx,
  cy,
  r,
  color,
  active = true,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
  active?: boolean;
}) {
  const ref = useRef<SVGCircleElement>(null);
  useEffect(() => {
    if (!active) {
      if (ref.current) {
        ref.current.setAttribute("r", String(r));
        ref.current.setAttribute("opacity", "0.3");
      }
      return;
    }
    let scale = 1;
    let scaleStep = 0.025;
    let animationFrameId = 0;
    const tick = () => {
      scale += scaleStep;
      if (scale > 1.5 || scale < 0.6) scaleStep *= -1;
      if (ref.current) {
        ref.current.setAttribute("r", String(r * scale));
        ref.current.setAttribute("opacity", String(0.4 + (scale - 0.6) * 0.75));
      }
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [r, active]);
  return (
    <circle
      ref={ref}
      cx={cx}
      cy={cy}
      r={r}
      fill={active ? color : "#4a5568"}
      opacity={active ? undefined : 0.3}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DB CYLINDER
// ─────────────────────────────────────────────────────────────────────────────
function DbCylinder({
  cx,
  topY,
  color,
  label,
  isLight = false,
}: {
  cx: number;
  topY: number;
  color: string;
  label: string;
  isLight?: boolean;
}) {
  const rx = 42;
  const ry = 14;
  const h = 24;
  const fillCol = isLight ? "#f1f5f9" : "#0f1520";
  return (
    <g opacity={0.85}>
      <ellipse
        cx={cx}
        cy={topY + h}
        rx={rx}
        ry={ry}
        fill={fillCol}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.7}
      />
      <rect x={cx - rx} y={topY} width={rx * 2} height={h} fill={fillCol} />
      <line
        x1={cx - rx}
        y1={topY}
        x2={cx - rx}
        y2={topY + h}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.7}
      />
      <line
        x1={cx + rx}
        y1={topY}
        x2={cx + rx}
        y2={topY + h}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.7}
      />
      <ellipse
        cx={cx}
        cy={topY}
        rx={rx}
        ry={ry}
        fill={fillCol}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.7}
      />
      <text
        x={cx}
        y={topY + h / 6}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={9}
        fontWeight={600}
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI BAR
// ─────────────────────────────────────────────────────────────────────────────
function MiniBar({
  label,
  val,
  max,
  display,
  color,
}: {
  label: string;
  val: number;
  max: number;
  display: string;
  color: string;
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const w = Math.min(100, (val / max) * 100);
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 9,
          color: isLight ? "#64748b" : "#4a5568",
          width: 50,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 4,
          background: isLight ? "#e2e8f0" : "#2a3a4e",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${w}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width .4s",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 9,
          color: isLight ? "#475569" : "#e2e8f0",
          width: 38,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {display}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function MonitorPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const services = useMemo(() => {
    return SERVICES.map((s) => ({
      ...s,
      color:
        typeof s.color === "string"
          ? s.color
          : isLight
            ? s.color.light
            : s.color.dark,
    }));
  }, [isLight]);

  const css = {
    ...baseCss,
    root: {
      ...baseCss.root,
      color: isLight ? "#1e293b" : "#e2e8f0",
    },
    backBtn: {
      ...baseCss.backBtn,
      color: isLight ? "#475569" : "#9ca3af",
    },
    h1: {
      ...baseCss.h1,
      color: isLight ? "#0f172a" : "#fff",
    },
    wsBar: {
      ...baseCss.wsBar,
      background: isLight ? "#f1f5f9" : "#0f1520",
      borderColor: isLight ? "#cbd5e1" : "#1e2d42",
    },
    wsInput: {
      ...baseCss.wsInput,
      background: isLight ? "#ffffff" : "#121c2a",
      borderColor: isLight ? "#cbd5e1" : "#1e2d42",
      color: isLight ? "#1e293b" : "#e2e8f0",
    },
    stat: {
      ...baseCss.stat,
      background: isLight ? "#f1f5f9" : "#0f1520",
      borderColor: isLight ? "#cbd5e1" : "#1e2d42",
    },
    statVal: {
      ...baseCss.statVal,
      color: isLight ? "#0f172a" : "#fff",
    },
    canvas: {
      ...baseCss.canvas,
      background: isLight ? "#f8fafc" : "#090d14",
      borderColor: isLight ? "#cbd5e1" : "#1e2d42",
      aspectRatio: "640 / 520",
      flex: isMobile ? "none" : 1,
      width: "100%",
    },
    card: {
      ...baseCss.card,
      background: isLight ? "#f1f5f9" : "#0f1520",
      borderColor: isLight ? "#cbd5e1" : "#1e2d42",
      color: isLight ? "#1e293b" : "#e2e8f0",
    },
    logWrap: {
      ...baseCss.logWrap,
      background: isLight ? "#f1f5f9" : "#0f1520",
      borderColor: isLight ? "#cbd5e1" : "#1e2d42",
    },
    btn: {
      ...baseCss.btn,
      background: isLight ? "#f1f5f9" : "#0f1520",
      borderColor: isLight ? "#cbd5e1" : "#1e2d42",
      color: isLight ? "#334155" : "#e2e8f0",
    },
    eyebrow: {
      ...baseCss.eyebrow,
      color: isLight ? "rgb(0 162 255)" : "#00d4ff",
    },
    main: {
      ...baseCss.main,
      flexDirection: isMobile ? ("column" as const) : ("row" as const),
      gap: isMobile ? 20 : 14,
    },
    side: {
      ...baseCss.side,
      width: isMobile ? "100%" : 230,
    },
  };

  const [showGuide, setShowGuide] = useState(true);

  // ── WS ──
  const wsRef = useRef<WebSocket | null>(null);
  const [wsUrl, setWsUrl] = useState("ws://localhost:4001");
  const [wsStatus, setWsStatus] = useState<WsStatus>("disconnected");
  const [flowMode, setFlowMode] = useState<"one-way" | "two-way">("one-way");
  const flowModeRef = useRef<"one-way" | "two-way">("one-way");
  useEffect(() => {
    flowModeRef.current = flowMode;
  }, [flowMode]);

  // ── Sim ──
  const [simOn, setSimOn] = useState(true);
  const [simMode, setSimMode] = useState<SimMode>("normal");
  const simModeRef = useRef<SimMode>("normal");
  useEffect(() => {
    simModeRef.current = simMode;
  }, [simMode]);

  // ── Pause ──
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // ── Particles (pure mutable ref — no re-render) ──
  const particlesRef = useRef<ParticleData[]>([]);
  const svgParticlesRef = useRef<SVGGElement>(null);

  // ── Stats (mutable refs for RAF, state for render) ──
  const gRef = useRef({
    total: 0,
    err: 0,
    latencies: [] as number[],
    window: [] as number[],
    history: [] as StatsHistoryItem[],
  });
  const sRef = useRef<Record<string, SvcStats>>(
    Object.fromEntries(
      SERVICES.map((s) => [
        s.id,
        { req: 0, err: 0, latencies: [], window: [], history: [] },
      ]),
    ),
  );

  const [gUI, setGUI] = useState({
    rps: 0,
    p50: 0,
    p99: 0,
    uptime: "100.0",
    total: 0,
    err: 0,
  });
  const [sUI, setSUI] = useState<
    Record<string, { rps: number; avgLat: number; errRate: string }>
  >(
    Object.fromEntries(
      SERVICES.map((s) => [s.id, { rps: 0, avgLat: 0, errRate: "0.0" }]),
    ),
  );

  // ── Logs ──
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // ── Flash ──
  const [flash, setFlash] = useState<Record<string, "ok" | "err">>({});

  // ─── Ingest event ───────────────────────────────────────────────────────────
  const ingest = useCallback(
    (evt: TrafficEvent) => {
      if (pausedRef.current) return;
      const svcIdx = services.findIndex((s) => s.id === evt.service);
      if (svcIdx < 0) return;

      const isErr = evt.status >= 400;
      const color = services[svcIdx].color;
      const speed =
        simModeRef.current === "slow"
          ? 0.01
          : simModeRef.current === "spike"
            ? 0.036
            : 0.022;

      // Spawn particle
      particlesRef.current.push({
        id: uid(),
        svcIdx,
        color,
        isErr,
        segIdx: 0,
        t: 0,
        speed,
        x: 90,
        y: 260,
        alive: true,
        flowMode: flowModeRef.current,
      });

      // Stats
      const now = Date.now();
      const g = gRef.current;
      g.total++;
      if (isErr) g.err++;
      g.latencies.push(evt.latency_ms);
      if (g.latencies.length > 300) g.latencies.shift();
      g.window.push(now);

      const histItem = { ts: now, isErr, latency: evt.latency_ms };
      if (!g.history) g.history = [];
      g.history.push(histItem);

      const sv = sRef.current[evt.service];
      if (sv) {
        sv.req++;
        if (isErr) sv.err++;
        sv.latencies.push(evt.latency_ms);
        if (sv.latencies.length > 100) sv.latencies.shift();
        sv.window.push(now);
        if (!sv.history) sv.history = [];
        sv.history.push(histItem);
      }

      // Flash
      setFlash((prev) => ({ ...prev, [evt.service]: isErr ? "err" : "ok" }));
      setTimeout(() => {
        setFlash((prev) => {
          const n = { ...prev };
          delete n[evt.service];
          return n;
        });
      }, 350);

      // Log
      setLogs((prev) =>
        [
          {
            id: uid(),
            ts: now_ts(),
            service: evt.service,
            method: evt.method,
            path: evt.path,
            status: evt.status,
            latency_ms: evt.latency_ms,
          },
          ...prev,
        ].slice(0, 28),
      );
    },
    [services],
  );

  // ─── Stats tick (1s) ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      const limit = now - 15000; // 15 seconds window for sliding stats
      const g = gRef.current;

      // Filter global sliding history
      g.history = (g.history || []).filter((item) => item.ts > limit);
      const totalInWindow = g.history.length;
      const errInWindow = g.history.filter((item) => item.isErr).length;

      g.window = g.window.filter((ts) => now - ts < 1000);
      const sorted = [...g.latencies].sort((a, b) => a - b);
      const p50 = pct(sorted, 0.5);
      const p99 = pct(sorted, 0.99);
      const uptime =
        totalInWindow > 0
          ? (((totalInWindow - errInWindow) / totalInWindow) * 100).toFixed(1)
          : "100.0";
      setGUI({
        rps: g.window.length,
        p50,
        p99,
        uptime,
        total: g.total,
        err: g.err,
      });

      setSUI(() => {
        const next: typeof sUI = {};
        for (const [id, sv] of Object.entries(sRef.current)) {
          sv.window = sv.window.filter((ts) => now - ts < 1000);

          // Filter service sliding history
          sv.history = (sv.history || []).filter((item) => item.ts > limit);
          const reqInSvc = sv.history.length;
          const errInSvc = sv.history.filter((item) => item.isErr).length;
          const latenciesInSvc = sv.history.map((item) => item.latency);

          const avgLat = reqInSvc
            ? Math.round(latenciesInSvc.reduce((a, b) => a + b, 0) / reqInSvc)
            : 0;
          const errRate =
            reqInSvc > 0 ? ((errInSvc / reqInSvc) * 100).toFixed(1) : "0.0";
          next[id] = { rps: sv.window.length, avgLat, errRate };
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ─── Particle RAF loop ───────────────────────────────────────────────────────
  useEffect(() => {
    let raf: number;
    const loop = () => {
      if (!pausedRef.current && svgParticlesRef.current) {
        const layer = svgParticlesRef.current;
        // Sync DOM particles
        const alive: ParticleData[] = [];
        for (const p of particlesRef.current) {
          if (!p.alive) continue;
          const segs = getSegments(SVC_Y[p.svcIdx], flowModeRef.current);
          if (p.segIdx >= segs.length) {
            p.alive = false;
            continue;
          }
          p.t += p.speed;
          if (p.t >= 1) {
            p.t = 0;
            p.segIdx++;
          }
          if (p.segIdx >= segs.length) {
            p.alive = false;
            continue;
          }
          const s = segs[p.segIdx];
          p.x = s.x1 + (s.x2 - s.x1) * p.t;
          p.y = s.y1 + (s.y2 - s.y1) * p.t;
          alive.push(p);
        }
        particlesRef.current = alive;

        // Rebuild SVG children
        while (layer.firstChild) {
          layer.removeChild(layer.firstChild);
        }
        const NS = "http://www.w3.org/2000/svg";
        for (const p of alive) {
          const isResponse = flowModeRef.current === "two-way" && p.segIdx >= 4;
          const tailR = isResponse ? "5" : "9";
          const dotR = isResponse ? "3" : "5";
          const tailOpacity = isResponse ? "0.1" : "0.2";

          const tail = document.createElementNS(NS, "circle");
          tail.setAttribute("cx", String(p.x));
          tail.setAttribute("cy", String(p.y));
          tail.setAttribute("r", tailR);
          tail.setAttribute("fill", p.color);
          tail.setAttribute("opacity", tailOpacity);
          layer.appendChild(tail);

          const dot = document.createElementNS(NS, "circle");
          dot.setAttribute("cx", String(p.x));
          dot.setAttribute("cy", String(p.y));
          dot.setAttribute("r", dotR);
          dot.setAttribute("fill", p.color);
          dot.setAttribute("filter", "url(#msm-glow)");
          layer.appendChild(dot);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ─── Simulator ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!simOn || paused) return;
    const t = setInterval(
      () => ingest(makeSimEvent(simModeRef.current)),
      SIM_INTERVAL[simMode],
    );
    return () => clearInterval(t);
  }, [simOn, simMode, paused, ingest]);

  // ─── WebSocket ───────────────────────────────────────────────────────────────
  const connectWS = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (!wsUrl.trim()) return;
    setWsStatus("connecting");
    try {
      const ws = new WebSocket(wsUrl.trim());
      wsRef.current = ws;
      ws.onopen = () => {
        setWsStatus("connected");
        setSimOn(false);
      };
      ws.onclose = () => {
        setWsStatus("disconnected");
        wsRef.current = null;
      };
      ws.onerror = () => setWsStatus("error");
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "event" || msg.type === "request") ingest(msg);
        } catch {}
      };
    } catch {
      setWsStatus("error");
    }
  };

  const disconnectWS = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setWsStatus("disconnected");
  };

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const handleBackClick = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new Event("pushstate-navigate"));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  const isSystemActive = wsStatus === "connected" || (simOn && !paused);

  const getGatewayPulseColor = () => {
    const uptimeVal = parseFloat(gUI.uptime);
    if (uptimeVal < 90) return "#ff4d6d";
    if (uptimeVal < 97) return "#ffd166";
    return "#00ff88";
  };

  const getSvcPulseColor = (svcId: string) => {
    const ui = sUI[svcId];
    if (!ui) return "#00ff88";
    const errRateVal = parseFloat(ui.errRate);
    if (errRateVal > 10) return "#ff4d6d";
    if (errRateVal > 3) return "#ffd166";
    return "#00ff88";
  };

  const wsDotColor: Record<WsStatus, string> = {
    connected: "#00ff88",
    connecting: "#ffd166",
    error: "#ff4d6d",
    disconnected: "#4a5568",
  };
  const wsDotAnim =
    wsStatus === "connecting" ? "msm-blink 1s infinite" : "none";

  return (
    <div style={css.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes msm-blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2d42; border-radius: 2px; }
      `}</style>

      {/* Header with Back Button */}
      <div style={css.hdr}>
        <div style={css.hdrContainer}>
          <button
            onClick={handleBackClick}
            style={css.backBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.backgroundColor = "#1e2d42";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ArrowLeft size={16} />
            Back to Portfolio
          </button>
          <div>
            <div style={css.eyebrow}>websocket · real-time</div>
            <h1 style={css.h1}>
              Microservice{" "}
              <span style={{ color: isLight ? "rgb(0 162 255)" : "#00d4ff" }}>
                Live Monitor
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Guide Panel */}
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          background: isLight ? "rgb(241, 245, 249)" : "#0f1520",
          border: isLight
            ? "1px solid rgb(203, 213, 225)"
            : "1px solid #1e2d42",
          borderRadius: 8,
          padding: 14,
          marginBottom: 14,
          fontSize: 12,
          lineHeight: 1.6,
          color: "#9ca3af",
        }}
      >
        <div
          onClick={() => setShowGuide(!showGuide)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            fontWeight: 600,
            color: isLight ? "rgb(0 162 255)" : "#00d4ff",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Info size={16} />
            <span>
              {language === "ko"
                ? "실시간 웹소켓 연동 및 스펙 가이드"
                : "Real-time WebSocket Integration & Specs Guide"}
            </span>
          </div>
          {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {showGuide && (
          <div
            style={{
              marginTop: 12,
              borderTop: isLight
                ? "1px solid rgb(203, 213, 225)"
                : "1px solid #1e2d42",
              paddingTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div>
              <p
                style={{
                  fontWeight: 600,
                  color: isLight ? "rgb(83 86 90)" : "#e2e8f0",
                  marginBottom: 4,
                }}
              >
                {language === "ko"
                  ? "1. 기본 시뮬레이션 및 배포 환경"
                  : "1. Simulation & Deployment Specs"}
              </p>
              <p>
                {language === "ko"
                  ? "현재 화면은 웹소켓 연결이 실패하거나 오프라인일 때 자동으로 내장 시뮬레이터(Sim ON)로 자동 전환됩니다. Vercel 배포 본에서도 페이지를 연 순간부터 모의 트래픽이 작동됩니다."
                  : "The dashboard automatically runs on an internal traffic simulator (Sim ON) when offline. On Vercel, simulation mode is active by default to visualize traffic immediately."}
              </p>
            </div>

            <div>
              <p
                style={{
                  fontWeight: 600,
                  color: isLight ? "rgb(83 86 90)" : "#e2e8f0",
                  marginBottom: 4,
                }}
              >
                {language === "ko"
                  ? "2. 로컬 웹소켓 서버 연동 방법 (Local Play)"
                  : "2. Local WebSocket Integration"}
              </p>
              <p>
                {language === "ko"
                  ? "로컬 환경에서 실제 실시간 통신을 보려면, 프로젝트의 루트 폴더 터미널에서 아래 명령어로 웹소켓 서버를 구동할 수 있습니다:"
                  : "To test real-time WebSocket communication locally, run the back-end websocket server inside the project root folder:"}
              </p>
              <pre
                style={{
                  background: "#080c12",
                  padding: "8px 12px",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#ffd166",
                  marginTop: 6,
                  border: "1px solid #141f2e",
                  overflowX: "auto",
                }}
              >
                node microservice-ws-server.js
              </pre>
              <p style={{ marginTop: 6 }}>
                {language === "ko"
                  ? "서버 구동 후, 아래 주소창에 ws://localhost:4001 을 입력하고 Connect 버튼을 클릭하면 실제 스트리밍 통신 모드로 동작합니다."
                  : "After launching the server, type ws://localhost:4001 below and click Connect to stream real live events."}
              </p>
            </div>

            <div>
              <p
                style={{
                  fontWeight: 600,
                  color: isLight ? "rgb(83 86 90)" : "#e2e8f0",
                  marginBottom: 4,
                }}
              >
                {language === "ko"
                  ? "3. 연동 데이터 규격 (JSON Protocol)"
                  : "3. JSON Data Protocol Specs"}
              </p>
              <p>
                {language === "ko"
                  ? "본 대시보드가 정상적으로 이벤트를 파싱하여 실시간 애니메이션과 로그를 그리려면 웹소켓 서버가 아래 JSON 구조의 이벤트를 보내주어야 합니다:"
                  : "To parse traffic events, the WebSocket server must stream JSON payloads structured in this schema:"}
              </p>
              <pre
                style={{
                  background: "#080c12",
                  padding: "8px 12px",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#00ff88",
                  marginTop: 6,
                  border: "1px solid #141f2e",
                  overflowX: "auto",
                }}
              >
                {`{
                  "type": "event",
                  "service": "user",      // user, order, payment, notif 중 하나
                  "method": "GET",        // GET, POST, PUT, DELETE
                  "path": "/api/users/me",
                  "status": 200,          // HTTP status (400 이상은 에러 처리)
                  "latency_ms": 42        // 지연 시간 (ms)
                }`}
              </pre>
            </div>

            <div>
              <p
                style={{
                  fontWeight: 600,
                  color: isLight ? "rgb(83 86 90)" : "#e2e8f0",
                  marginBottom: 4,
                }}
              >
                {language === "ko"
                  ? "4. 실시간 슬라이딩 통계 및 헬스 램프 규격"
                  : "4. Real-time Sliding Window Stats & Health Indicators"}
              </p>
              <p>
                {language === "ko"
                  ? "대시보드의 Err% 및 Uptime은 총 누적 값이 아닌 '최근 15초(슬라이딩 윈도우)' 동안 유입된 트래픽만을 기준으로 계산됩니다. 에러율이 3% 초과 시 노란색(주의), 10% 초과 시 빨간색(장애)으로 헬스 램프가 실시간 전환됩니다. 복구(Normal) 모드로 전환하면 15초 이내에 램프가 다시 초록색으로 자동 복귀합니다."
                  : "The Err% and Uptime indicators are calculated based on a 15-second sliding window. The health indicator lights transition to yellow (Warning) when the error rate exceeds 3%, and red (Critical) when it exceeds 10%. Switching back to Normal mode clears the errors within 15 seconds, returning indicators to green."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* WS Bar */}
      <div style={css.wsBar}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: wsDotColor[wsStatus],
              boxShadow: wsStatus === "connected" ? "0 0 8px #00ff88" : "none",
              animation: wsDotAnim,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color:
                wsStatus === "connected"
                  ? "#00ff88"
                  : wsStatus === "error"
                    ? "#ff4d6d"
                    : "#4a5568",
            }}
          >
            {wsStatus}
          </span>
        </div>
        <input
          style={css.wsInput}
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          placeholder="ws://localhost:4001"
          onKeyDown={(e) =>
            e.key === "Enter" &&
            (wsStatus === "connected" ? disconnectWS() : connectWS())
          }
        />
        <button
          style={css.btn}
          onClick={() =>
            wsStatus === "connected" ? disconnectWS() : connectWS()
          }
        >
          {wsStatus === "connected" ? "Disconnect" : "Connect"}
        </button>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#4a5568",
            whiteSpace: "nowrap",
          }}
        >
          or use sim →
        </span>
        <button
          style={{ ...css.btn, ...(simOn ? css.btnActive : {}) }}
          onClick={() => setSimOn((v) => !v)}
        >
          Sim {simOn ? "ON" : "OFF"}
        </button>
      </div>

      {/* Stats */}
      <div style={css.statsRow}>
        {[
          { label: "Req/s", val: String(gUI.rps), color: "#00ff88" },
          { label: "p50 Lat", val: gUI.p50 + "ms", color: latColor(gUI.p50) },
          { label: "p99 Lat", val: gUI.p99 + "ms", color: latColor(gUI.p99) },
          {
            label: "Uptime",
            val: gUI.uptime + "%",
            color: upColor(gUI.uptime),
          },
          { label: "Total", val: String(gUI.total), color: "#00d4ff" },
          { label: "Errors", val: String(gUI.err), color: "#ff4d6d" },
        ].map((s) => (
          <div key={s.label} style={css.stat}>
            <div style={{ ...css.statVal, color: s.color }}>{s.val}</div>
            <div style={css.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={css.main}>
        {/* SVG Canvas */}
        <div style={css.canvas}>
          <svg
            viewBox="0 0 640 520"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <defs>
              <filter
                id="msm-glow"
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
              >
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern
                id="msm-grid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M32 0L0 0 0 32"
                  fill="none"
                  stroke={isLight ? "#cbd5e1" : "#141f2e"}
                  strokeWidth="0.6"
                />
              </pattern>
            </defs>

            <rect
              width="640"
              height="520"
              fill={isLight ? "#f8fafc" : "#090d14"}
            />
            <rect
              width="640"
              height="520"
              fill="url(#msm-grid)"
              opacity="0.8"
            />

            {/* Static wires */}
            <line
              x1="90"
              y1="260"
              x2="175"
              y2="260"
              stroke={isLight ? "#cbd5e1" : "#1e2d42"}
              strokeWidth="1.5"
            />
            {SERVICES.map((_, i) => (
              <g key={i}>
                <line
                  x1="275"
                  y1="260"
                  x2="330"
                  y2={SVC_Y[i]}
                  stroke={isLight ? "#cbd5e1" : "#1e2d42"}
                  strokeWidth="1.2"
                />
                <line
                  x1="440"
                  y1={SVC_Y[i]}
                  x2="510"
                  y2={SVC_Y[i]}
                  stroke={isLight ? "#cbd5e1" : "#1e2d42"}
                  strokeWidth="1.2"
                />
              </g>
            ))}
            {/* Event bus */}
            <line
              x1="385"
              y1="80"
              x2="385"
              y2="460"
              stroke={isLight ? "#cbd5e1" : "#253448"}
              strokeWidth="1"
              strokeDasharray="5,4"
            />
            <text
              x="386"
              y="476"
              fontFamily="monospace"
              fontSize="7"
              fill={isLight ? "#94a3b8" : "#253448"}
              letterSpacing=".1em"
            >
              EVENT BUS
            </text>

            {/* Particle layer */}
            <g ref={svgParticlesRef} />

            {/* Client */}
            <rect
              x="12"
              y="232"
              width="78"
              height="56"
              rx="8"
              fill={isLight ? "#f1f5f9" : "#0f1520"}
              stroke={isLight ? "#cbd5e1" : "#2a3a4e"}
              strokeWidth="1.5"
            />
            <text
              x="51"
              y="251"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="15"
              fill={isLight ? "#475569" : "#6b7280"}
            >
              ⬡
            </text>
            <text
              x="51"
              y="268"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="9"
              fontWeight="600"
              fill={isLight ? "#334155" : "#9ca3af"}
            >
              CLIENT
            </text>
            <text
              x="51"
              y="280"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="7"
              fill={isLight ? "#94a3b8" : "#4a5568"}
            >
              HTTP/2
            </text>

            {/* Gateway */}
            <rect
              x="175"
              y="226"
              width="100"
              height="68"
              rx="8"
              fill={isLight ? "#f1f5f9" : "#0f1520"}
              stroke="#00d4ff"
              strokeWidth="1.5"
            />
            <rect
              x="175"
              y="226"
              width="100"
              height="68"
              rx="8"
              fill="#00d4ff"
              fillOpacity="0.04"
            />
            <text
              x="225"
              y="245"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="12"
              fill="#00d4ff"
            >
              ⬡
            </text>
            <text
              x="225"
              y="272"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="9"
              fontWeight={600}
              fill="#00d4ff"
            >
              API GATEWAY
            </text>
            <text
              x="225"
              y="274"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="7"
              fill={isLight ? "#94a3b8" : "#4a5568"}
            >
              auth · lb · rate
            </text>
            <text
              x="225"
              y="285"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="7"
              fill={isLight ? "#94a3b8" : "#4a5568"}
            >
              :8080
            </text>
            <PulseDot
              cx={272}
              cy={230}
              r={4}
              color={getGatewayPulseColor()}
              active={isSystemActive}
            />

            {/* Services */}
            {services.map((svc, i) => (
              <g key={svc.id}>
                <rect
                  x="330"
                  y={SVC_Y[i] - 28}
                  width="110"
                  height="56"
                  rx="7"
                  fill={isLight ? "#ffffff" : "#111827"}
                  stroke={svc.color}
                  strokeWidth="1.5"
                />
                <text
                  x="385"
                  y={SVC_Y[i] - 6 - 5}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize="11"
                  fill={svc.color}
                >
                  ◈
                </text>
                <text
                  x="385"
                  y={SVC_Y[i] + 9 - 5}
                  textAnchor="middle"
                  fontFamily="sans-serif"
                  fontSize="9"
                  fontWeight={600}
                  fill={svc.color}
                >
                  {svc.label.toUpperCase()}
                </text>
                <text
                  x="385"
                  y={SVC_Y[i] + 21 - 5}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize="7"
                  fill={isLight ? "#64748b" : "#94a3b8"}
                >
                  {svc.runtime} · :{svc.port}
                </text>
                <PulseDot
                  cx={437}
                  cy={SVC_Y[i] - 24 - 5}
                  r={3.5}
                  color={getSvcPulseColor(svc.id)}
                  active={isSystemActive}
                />
                {/* Live latency badge */}
                {(sUI[svc.id]?.avgLat ?? 0) > 0 && (
                  <text
                    x="340"
                    y={SVC_Y[i] - 36 - 5}
                    fontFamily="monospace"
                    fontSize="8"
                    fill={latColor(sUI[svc.id]?.avgLat ?? 0)}
                  >
                    {sUI[svc.id]?.avgLat}ms
                  </text>
                )}
              </g>
            ))}

            {/* Databases */}
            {services.map((svc, i) => (
              <DbCylinder
                key={svc.id}
                cx={560}
                topY={SVC_Y[i] - 18}
                color={svc.color}
                label={svc.db}
                isLight={isLight}
              />
            ))}

            {/* Particle layer will render before Client */}
          </svg>
        </div>

        {/* Side panel */}
        <div style={css.side}>
          {/* Service cards */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "row" : "column",
              flexWrap: "wrap",
              gap: 10,
              width: "100%",
            }}
          >
            {services.map((svc) => {
              const ui = sUI[svc.id] ?? { rps: 0, avgLat: 0, errRate: "0.0" };
              const fl = flash[svc.id];
              return (
                <div
                  key={svc.id}
                  style={{
                    ...css.card,
                    flex: isMobile ? "1 1 calc(50% - 5px)" : undefined,
                    minWidth: isMobile ? 140 : undefined,
                    ...(fl === "err" && { borderColor: "#ff4d6d" }),
                    ...(fl === "ok" && { borderColor: svc.color }),
                    transition: "border-color .3s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: svc.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".07em",
                        color: svc.color,
                        flex: 1,
                      }}
                    >
                      {svc.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 9,
                        color: "#4a5568",
                      }}
                    >
                      :{svc.port}
                    </span>
                  </div>
                  <MiniBar
                    label={flowMode === "two-way" ? "Req RPS" : "RPS"}
                    val={ui.rps}
                    max={50}
                    display={String(ui.rps)}
                    color={svc.color}
                  />
                  {flowMode === "two-way" && (
                    <MiniBar
                      label="Resp RPS"
                      val={ui.rps}
                      max={50}
                      display={String(ui.rps)}
                      color="#9ca3af"
                    />
                  )}
                  <MiniBar
                    label="Latency"
                    val={ui.avgLat}
                    max={1000}
                    display={ui.avgLat + "ms"}
                    color={latColor(ui.avgLat)}
                  />
                  <MiniBar
                    label="Err%"
                    val={parseFloat(ui.errRate)}
                    max={20}
                    display={ui.errRate + "%"}
                    color={errColor(ui.errRate)}
                  />
                </div>
              );
            })}
          </div>

          {/* Log */}
          <div style={css.logWrap}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#4a5568",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {"// live log"}
            </div>
            <div style={{ overflowY: "auto", flex: 1, maxHeight: 200 }}>
              {logs.length === 0 ? (
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#4a5568",
                    padding: "6px 0",
                  }}
                >
                  Waiting…
                </div>
              ) : (
                logs.map((l) => {
                  const svc = services.find((s) => s.id === l.service);
                  return (
                    <div
                      key={l.id}
                      style={{
                        fontFamily: "monospace",
                        fontSize: 10,
                        display: "flex",
                        gap: 5,
                        padding: "2px 0",
                        borderBottom: isLight
                          ? "1px solid rgba(212, 216, 223, 1)"
                          : "1px solid #1e2d42",
                      }}
                    >
                      <span
                        style={{
                          color: svc?.color ?? "#4a5568",
                          flexShrink: 0,
                        }}
                      >
                        ▶
                      </span>
                      <span
                        style={{
                          color: methodColor(l.method),
                          width: 30,
                          flexShrink: 0,
                        }}
                      >
                        {l.method.slice(0, 3)}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: isLight
                            ? "rgba(105, 111, 118, 1)"
                            : "rgba(226, 232, 240, 1)",
                        }}
                      >
                        {l.path}
                      </span>
                      <span
                        style={{
                          color:
                            l.status < 400
                              ? isLight
                                ? "#00b388"
                                : "#00ff88"
                              : isLight
                                ? "#d2304b"
                                : "#ff4d6d",
                          width: 28,
                          flexShrink: 0,
                          textAlign: "right",
                        }}
                      >
                        {l.status}
                      </span>
                      <span
                        style={{
                          color: "#4a5568",
                          width: 40,
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        {l.latency_ms}ms
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: isMobile ? "flex-start" : "center",
          width: "100%",
          maxWidth: 980,
          marginTop: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: 8,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#4a5568",
              alignSelf: isMobile ? "flex-start" : "center",
            }}
          >
            SIM MODE:
          </span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              width: isMobile ? "100%" : "unset",
            }}
          >
            {(["normal", "spike", "error", "slow"] as SimMode[]).map((m) => (
              <button
                key={m}
                style={{ ...css.btn, ...(simMode === m ? css.btnActive : {}) }}
                onClick={() => setSimMode(m)}
              >
                {m}
              </button>
            ))}
            <button
              style={{ ...css.btn, ...(paused ? css.btnActive : {}) }}
              onClick={() => setPaused((v) => !v)}
            >
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#4a5568",
              alignSelf: isMobile ? "flex-start" : "center",
              marginLeft: isMobile ? 0 : 16,
            }}
          >
            {language === "ko" ? "트래픽 흐름:" : "FLOW MODE:"}
          </span>
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              style={{
                ...css.btn,
                ...(flowMode === "one-way" ? css.btnActive : {}),
              }}
              onClick={() => setFlowMode("one-way")}
            >
              {language === "ko" ? "단방향 (요청)" : "One-way (Req)"}
            </button>
            <button
              style={{
                ...css.btn,
                ...(flowMode === "two-way" ? css.btnActive : {}),
              }}
              onClick={() => setFlowMode("two-way")}
            >
              {language === "ko" ? "양방향 (왕복)" : "Two-way (Req & Resp)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const baseCss = {
  root: {
    background: "transparent",
    color: "#e2e8f0",
    fontFamily: "Inter, sans-serif",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "24px 16px 48px",
    gap: 0,
  },
  hdr: { width: "100%", marginBottom: 20 },
  hdrContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    position: "relative" as const,
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
  },
  backBtn: {
    position: "absolute" as const,
    left: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    fontFamily: "sans-serif",
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 12px",
    borderRadius: "6px",
    transition: "color 0.2s, background-color 0.2s",
  },
  eyebrow: {
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: ".2em",
    color: "#00d4ff",
    textTransform: "uppercase" as const,
    marginBottom: 6,
    textAlign: "center" as const,
  },
  h1: {
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: "-.02em",
    color: "#fff",
    textAlign: "center" as const,
  },
  wsBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#0f1520",
    border: "1px solid #1e2d42",
    borderRadius: 8,
    padding: "9px 14px",
    marginBottom: 14,
    width: "100%",
    maxWidth: 980,
    flexWrap: "wrap" as const,
  },
  wsInput: {
    fontFamily: "monospace",
    fontSize: 11,
    background: "#121c2a",
    border: "1px solid #1e2d42",
    borderRadius: 6,
    padding: "5px 10px",
    color: "#e2e8f0",
    flex: 1,
    minWidth: 160,
    outline: "none",
  },
  statsRow: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap" as const,
    justifyContent: "center",
    width: "100%",
    maxWidth: 980,
  },
  stat: {
    background: "#0f1520",
    border: "1px solid #1e2d42",
    borderRadius: 8,
    padding: "9px 16px",
    textAlign: "center" as const,
    flex: 1,
    minWidth: 80,
  },
  statVal: { fontFamily: "monospace", fontSize: 18, fontWeight: 600 },
  statLabel: {
    fontSize: 10,
    color: "#4a5568",
    letterSpacing: ".1em",
    textTransform: "uppercase" as const,
    marginTop: 3,
  },
  main: {
    display: "flex",
    gap: 14,
    width: "100%",
    maxWidth: 980,
    flexWrap: "wrap" as const,
  },
  canvas: {
    flex: 1,
    minWidth: 0,
    background: "#090d14",
    border: "1px solid #1e2d42",
    borderRadius: 12,
    overflow: "hidden",
  },
  side: {
    width: 230,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  card: {
    background: "#0f1520",
    border: "1px solid #1e2d42",
    borderRadius: 10,
    padding: 12,
  },
  logWrap: {
    background: "#0f1520",
    border: "1px solid #1e2d42",
    borderRadius: 10,
    padding: 12,
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    minHeight: 120,
  },
  btn: {
    fontFamily: "monospace",
    fontSize: 11,
    padding: "6px 14px",
    borderRadius: 7,
    border: "1px solid #1e2d42",
    background: "#0f1520",
    color: "#e2e8f0",
    cursor: "pointer",
    letterSpacing: ".04em",
    transition: "border-color .2s,color .2s",
  },
  btnActive: { borderColor: "#00d4ff", color: "#00d4ff" },
};
