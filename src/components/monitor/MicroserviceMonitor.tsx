import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Info,
  ChevronDown,
  ChevronUp,
  Settings,
  Plus,
  Trash2,
  X,
  RefreshCw,
  Link,
  Layers,
  Code,
  Activity,
} from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageContext";
import { useTheme } from "@/components/ui/ThemeContext";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface ServiceDef {
  id: string;
  label: string;
  color: string | { light: string; dark: string };
  port: number;
  runtime: string;
  db: string;
}

export interface EndpointDef {
  id: string;
  name: string;
  type: "websocket" | "http";
  url: string;
  intervalMs: number;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: string; // stringified JSON
  body?: string; // stringified JSON
  connected: boolean;
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
  endpointName?: string;
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

type SimMode = "normal" | "spike" | "error" | "slow";

let _uid = 0;
const uid = () => ++_uid;

// ─────────────────────────────────────────────────────────────────────────────
// PRESETS & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { label: "Purple", value: "#a855f7" },
  { label: "Cyan", value: "#00d4ff" },
  { label: "Emerald", value: "#00ff88" },
  { label: "Amber", value: "#ffd166" },
  { label: "Orange", value: "#ff9f43" },
  { label: "Rose", value: "#ff4d6d" },
];

const DEFAULT_SERVICES: ServiceDef[] = [
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
];

const DEFAULT_ENDPOINTS: EndpointDef[] = [
  {
    id: "local-ws",
    name: "Mock Web Socket",
    type: "websocket",
    url: "ws://localhost:4001",
    intervalMs: 1000,
    method: "GET",
    headers: JSON.stringify({ "Content-Type": "application/json" }, null, 2),
    body: "",
    connected: false,
  },
  {
    id: "public-mock-http",
    name: "Example HTTP Mock",
    type: "http",
    url: "https://jsonplaceholder.typicode.com/todos/1",
    intervalMs: 3000,
    method: "GET",
    headers: JSON.stringify({ Accept: "application/json" }, null, 2),
    body: "",
    connected: false,
  },
];

const SIM_PATHS: Record<string, string[]> = {
  user: ["/api/users", "/api/users/login", "/api/users/me"],
  order: ["/api/orders", "/api/orders/create", "/api/orders/status"],
};

const SIM_METHODS: Record<string, string[]> = {
  user: ["GET", "GET", "POST"],
  order: ["POST", "GET", "GET"],
};

const SIM_INTERVAL: Record<string, number> = {
  normal: 240,
  spike: 70,
  error: 200,
  slow: 600,
};

// Compute bezier/linear coordinates
function getSegments(
  svcY: number,
  centerY: number,
  flowMode: "one-way" | "two-way",
) {
  const req = [
    { x1: 90, y1: centerY, x2: 175, y2: centerY },
    { x1: 175, y1: centerY, x2: 275, y2: centerY },
    { x1: 275, y1: centerY, x2: 330, y2: svcY },
    { x1: 440, y1: svcY, x2: 510, y2: svcY },
  ];
  if (flowMode === "one-way") return req;
  return [
    ...req,
    { x1: 510, y1: svcY, x2: 440, y2: svcY },
    { x1: 330, y1: svcY, x2: 275, y2: centerY },
    { x1: 275, y1: centerY, x2: 175, y2: centerY },
    { x1: 175, y1: centerY, x2: 90, y2: centerY },
  ];
}

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
function methodColor(m: string, isLight: boolean) {
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

function makeSimEvent(mode: SimMode, servicesList: ServiceDef[]): TrafficEvent {
  if (!servicesList.length)
    return {
      service: "",
      method: "GET",
      path: "/health",
      status: 200,
      latency_ms: 5,
    };
  const svc = servicesList[Math.floor(Math.random() * servicesList.length)];
  const paths = SIM_PATHS[svc.id] ?? [
    `/api/${svc.id}`,
    `/api/${svc.id}/status`,
  ];
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

// Helper: safe JSON parsing
function safeParseJson(str?: string): Record<string, any> {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PULSE DOT Component
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
// DB CYLINDER Component
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
// MINI BAR Component
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
// MAIN EXPORT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface MicroserviceMonitorProps {
  initialServices?: ServiceDef[];
}

export function MicroserviceMonitor({
  initialServices = DEFAULT_SERVICES,
}: MicroserviceMonitorProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [isMobile, setIsMobile] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // Raw Services State
  const [rawServices, setRawServices] = useState<ServiceDef[]>(initialServices);
  // Endpoints State (Multi connections)
  const [endpoints, setEndpoints] = useState<EndpointDef[]>(DEFAULT_ENDPOINTS);
  // Custom Data Mapper Code State
  const [mapperCode, setMapperCode] = useState<string>(
    `// 수신된 raw 데이터를 대시보드 지표 구조(TrafficEvent)로 변환해 리턴합니다.\n` +
      `// raw: WebSocket 수신 데이터 또는 HTTP Response 데이터 객체\n` +
      `// Return format: { service: string, method: string, path: string, status: number, latency_ms: number }\n\n` +
      `return {\n` +
      `  service: raw.service || raw.svc || "user",\n` +
      `  method: raw.method || "GET",\n` +
      `  path: raw.path || raw.url || "/api/ping",\n` +
      `  status: Number(raw.status || raw.code || 200),\n` +
      `  latency_ms: Number(raw.latency_ms || raw.duration || 32)\n` +
      `};`,
  );

  // Flow Mode State
  const [flowMode, setFlowMode] = useState<"one-way" | "two-way">("one-way");
  const flowModeRef = useRef<"one-way" | "two-way">("one-way");
  useEffect(() => {
    flowModeRef.current = flowMode;
  }, [flowMode]);

  // Configuration Panel Tab / Open states
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [configTab, setConfigTab] = useState<
    "services" | "endpoints" | "mapper"
  >("services");

  // Drawer form states - Service
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceLabel, setServiceLabel] = useState("");
  const [servicePort, setServicePort] = useState(3001);
  const [serviceRuntime, setServiceRuntime] = useState("Node.js");
  const [serviceDb, setServiceDb] = useState("PostgreSQL");
  const [serviceColor, setServiceColor] = useState("#a855f7");

  // Drawer form states - Endpoint
  const [editingEndpointId, setEditingEndpointId] = useState<string | null>(
    null,
  );
  const [endpointName, setEndpointName] = useState("");
  const [endpointType, setEndpointType] = useState<"websocket" | "http">(
    "websocket",
  );
  const [endpointUrl, setEndpointUrl] = useState("");
  const [endpointInterval, setEndpointInterval] = useState(3000);
  const [endpointMethod, setEndpointMethod] = useState<
    "GET" | "POST" | "PUT" | "DELETE"
  >("GET");
  const [endpointHeaders, setEndpointHeaders] = useState(
    JSON.stringify({ "Content-Type": "application/json" }, null, 2),
  );
  const [endpointBody, setEndpointBody] = useState("");

  // Refs for WebSocket connections & Polling intervals
  const wsRefs = useRef<Record<string, WebSocket>>({});
  const pollingRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      // Clean up all connections on unmount
      Object.values(wsRefs.current).forEach((ws) => ws.close());
      Object.values(pollingRefs.current).forEach((t) => clearInterval(t));
    };
  }, []);

  // Compute theme services
  const services = useMemo(() => {
    return rawServices.map((s) => ({
      ...s,
      color:
        typeof s.color === "string"
          ? s.color
          : isLight
            ? s.color.light
            : s.color.dark,
    }));
  }, [rawServices, isLight]);

  // Dynamic layout settings
  const itemHeight = 100;
  const paddingY = 60;
  const N = services.length;
  const canvasHeight = useMemo(() => {
    return Math.max(360, N * itemHeight + paddingY * 2);
  }, [N]);

  const centerY = useMemo(() => canvasHeight / 2, [canvasHeight]);
  const centerYRef = useRef(centerY);
  useEffect(() => {
    centerYRef.current = centerY;
  }, [centerY]);

  const svcYList = useMemo(() => {
    if (N === 0) return [];
    if (N === 1) return [centerY];
    const startY = centerY - ((N - 1) * itemHeight) / 2;
    return Array.from({ length: N }, (_, i) => startY + i * itemHeight);
  }, [N, centerY]);

  const svcYListRef = useRef<number[]>([]);
  useEffect(() => {
    svcYListRef.current = svcYList;
  }, [svcYList]);

  // Simulator State
  const [simOn, setSimOn] = useState(true);
  const [simMode, setSimMode] = useState<SimMode>("normal");
  const simModeRef = useRef<SimMode>("normal");
  useEffect(() => {
    simModeRef.current = simMode;
  }, [simMode]);

  // Pause State
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Particles
  const particlesRef = useRef<ParticleData[]>([]);
  const svgParticlesRef = useRef<SVGGElement>(null);

  // Global & Service Stats
  const gRef = useRef({
    total: 0,
    err: 0,
    latencies: [] as number[],
    window: [] as number[],
    history: [] as StatsHistoryItem[],
  });
  const sRef = useRef<Record<string, SvcStats>>({});

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
  >({});

  // Synchronize stats container keys when service list updates
  useEffect(() => {
    const serviceIds = new Set(rawServices.map((s) => s.id));
    for (const key of Object.keys(sRef.current)) {
      if (!serviceIds.has(key)) {
        delete sRef.current[key];
      }
    }
    for (const s of rawServices) {
      if (!sRef.current[s.id]) {
        sRef.current[s.id] = {
          req: 0,
          err: 0,
          latencies: [],
          window: [],
          history: [],
        };
      }
    }
    setSUI((prev) => {
      const next: typeof sUI = {};
      for (const s of rawServices) {
        next[s.id] = prev[s.id] || { rps: 0, avgLat: 0, errRate: "0.0" };
      }
      return next;
    });
  }, [rawServices]);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [flash, setFlash] = useState<Record<string, "ok" | "err">>({});

  // ─── Event Ingestion Pipeline ───────────────────────────────────────────────
  const ingest = useCallback(
    (evt: TrafficEvent, endpointName?: string) => {
      if (pausedRef.current) return;
      const svcIdx = services.findIndex((s) => s.id === evt.service);

      // Fallback: If service doesn't exist, ignore or route to index 0
      if (svcIdx < 0) return;

      const isErr = evt.status >= 400;
      const color = services[svcIdx].color;
      const speed =
        simModeRef.current === "slow"
          ? 0.01
          : simModeRef.current === "spike"
            ? 0.036
            : 0.022;

      // Spawn particle on SVG Canvas
      particlesRef.current.push({
        id: uid(),
        svcIdx,
        color,
        isErr,
        segIdx: 0,
        t: 0,
        speed,
        x: 90,
        y: centerYRef.current,
        alive: true,
        flowMode: flowModeRef.current,
      });

      // Update Global Metrics
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

      // Update Service Metrics
      if (!sRef.current[evt.service]) {
        sRef.current[evt.service] = {
          req: 0,
          err: 0,
          latencies: [],
          window: [],
          history: [],
        };
      }
      const sv = sRef.current[evt.service];
      sv.req++;
      if (isErr) sv.err++;
      sv.latencies.push(evt.latency_ms);
      if (sv.latencies.length > 100) sv.latencies.shift();
      sv.window.push(now);
      if (!sv.history) sv.history = [];
      sv.history.push(histItem);

      // Trigger wire flash
      setFlash((prev) => ({ ...prev, [evt.service]: isErr ? "err" : "ok" }));
      setTimeout(() => {
        setFlash((prev) => {
          const n = { ...prev };
          delete n[evt.service];
          return n;
        });
      }, 350);

      // Add to Console log
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
            endpointName,
          },
          ...prev,
        ].slice(0, 28),
      );
    },
    [services],
  );

  // Run custom mapper parsing code in sandbox
  const runMapper = useCallback(
    (rawData: any): TrafficEvent | null => {
      try {
        const fn = new Function("raw", mapperCode);
        const result = fn(rawData);
        if (result && typeof result === "object" && "service" in result) {
          return result as TrafficEvent;
        }
      } catch (e) {
        console.error("Custom Mapper Parse Error:", e);
      }
      return null;
    },
    [mapperCode],
  );

  // ─── Connection Management (HTTP Polling / WebSockets) ─────────────────────
  const connectEndpoint = (ep: EndpointDef) => {
    // 1. WebSocket Type Connection
    if (ep.type === "websocket") {
      if (wsRefs.current[ep.id]) {
        wsRefs.current[ep.id].close();
      }
      try {
        const ws = new WebSocket(ep.url);
        wsRefs.current[ep.id] = ws;
        ws.onopen = () => {
          setEndpoints((prev) =>
            prev.map((e) => (e.id === ep.id ? { ...e, connected: true } : e)),
          );
          setSimOn(false); // disable sim if actual streaming starts
        };
        ws.onclose = () => {
          setEndpoints((prev) =>
            prev.map((e) => (e.id === ep.id ? { ...e, connected: false } : e)),
          );
          delete wsRefs.current[ep.id];
        };
        ws.onerror = () => {
          setEndpoints((prev) =>
            prev.map((e) => (e.id === ep.id ? { ...e, connected: false } : e)),
          );
        };
        ws.onmessage = (e) => {
          try {
            const rawData = JSON.parse(e.data);
            const mappedEvent = runMapper(rawData);
            if (mappedEvent) {
              ingest(mappedEvent, ep.name);
            }
          } catch {}
        };
      } catch {
        setEndpoints((prev) =>
          prev.map((e) => (e.id === ep.id ? { ...e, connected: false } : e)),
        );
      }
    }

    // 2. HTTP Polling Type Connection
    if (ep.type === "http") {
      if (pollingRefs.current[ep.id]) {
        clearInterval(pollingRefs.current[ep.id]);
      }

      const poll = async () => {
        const start = performance.now();
        let status = 0;
        let latency_ms = 0;
        let responseData: any = null;

        try {
          const fetchOpts: RequestInit = {
            method: ep.method,
            headers: {
              "Content-Type": "application/json",
              ...safeParseJson(ep.headers),
            },
          };
          if (["POST", "PUT"].includes(ep.method) && ep.body) {
            fetchOpts.body = ep.body;
          }

          const res = await fetch(ep.url, fetchOpts);
          status = res.status;
          try {
            responseData = await res.json();
          } catch {
            responseData = {};
          }
        } catch {
          status = 500;
        } finally {
          latency_ms = Math.round(performance.now() - start);
          const eventToIngest = runMapper(responseData) || {
            service: rawServices[0]?.id || "user",
            method: ep.method,
            path: ep.url.replace(/^https?:\/\/[^\/]+/, "") || "/",
            status,
            latency_ms,
          };
          ingest(eventToIngest, ep.name);
        }
      };

      // Run immediately
      poll();
      // Set interval
      pollingRefs.current[ep.id] = setInterval(
        poll,
        Math.max(1000, ep.intervalMs),
      );
      setEndpoints((prev) =>
        prev.map((e) => (e.id === ep.id ? { ...e, connected: true } : e)),
      );
    }
  };

  const disconnectEndpoint = (ep: EndpointDef) => {
    if (ep.type === "websocket") {
      wsRefs.current[ep.id]?.close();
      delete wsRefs.current[ep.id];
    }
    if (ep.type === "http") {
      if (pollingRefs.current[ep.id]) {
        clearInterval(pollingRefs.current[ep.id]);
        delete pollingRefs.current[ep.id];
      }
    }
    setEndpoints((prev) =>
      prev.map((e) => (e.id === ep.id ? { ...e, connected: false } : e)),
    );
  };

  const toggleEndpoint = (ep: EndpointDef) => {
    if (ep.connected) {
      disconnectEndpoint(ep);
    } else {
      connectEndpoint(ep);
    }
  };

  // ─── Stats tick (1s) ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      const limit = now - 15000;
      const g = gRef.current;

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

  // ─── Particle RAF loop hook (RAF reference) ─────────────────────────────────
  useEffect(() => {
    let raf: number;

    const loop = () => {
      if (!pausedRef.current && svgParticlesRef.current) {
        const layer = svgParticlesRef.current;
        const alive: ParticleData[] = [];

        for (const p of particlesRef.current) {
          if (!p.alive) continue;
          if (p.svcIdx >= svcYListRef.current.length) {
            p.alive = false;
            continue;
          }
          const segs = getSegments(
            svcYListRef.current[p.svcIdx],
            centerYRef.current,
            p.flowMode,
          );
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

        while (layer.firstChild) {
          layer.removeChild(layer.firstChild);
        }
        const NS = "http://www.w3.org/2000/svg";
        for (const p of alive) {
          const isResponse = p.flowMode === "two-way" && p.segIdx >= 4;
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

  // ─── Simulator Trigger ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!simOn || paused || !rawServices.length) return;
    const t = setInterval(
      () => ingest(makeSimEvent(simModeRef.current, rawServices), "Simulator"),
      SIM_INTERVAL[simMode],
    );
    return () => clearInterval(t);
  }, [simOn, simMode, paused, ingest, rawServices]);

  // ─── CRUD Actions: Service ──────────────────────────────────────────────────
  const openAddService = () => {
    setEditingServiceId(null);
    setServiceLabel("");
    setServicePort(3000 + rawServices.length + 1);
    setServiceRuntime("Node.js");
    setServiceDb("PostgreSQL");
    setServiceColor("#a855f7");
    setConfigTab("services");
    setIsEditPanelOpen(true);
  };

  const openEditService = (svc: ServiceDef) => {
    setEditingServiceId(svc.id);
    setServiceLabel(svc.label);
    setServicePort(svc.port);
    setServiceRuntime(svc.runtime);
    setServiceDb(svc.db);
    setServiceColor(typeof svc.color === "string" ? svc.color : svc.color.dark);
    setConfigTab("services");
    setIsEditPanelOpen(true);
  };

  const saveService = () => {
    if (!serviceLabel.trim()) return;
    const labelVal = serviceLabel.trim();

    if (editingServiceId) {
      setRawServices((prev) =>
        prev.map((s) =>
          s.id === editingServiceId
            ? {
                ...s,
                label: labelVal,
                port: servicePort,
                runtime: serviceRuntime,
                db: serviceDb,
                color: serviceColor,
              }
            : s,
        ),
      );
    } else {
      const newId =
        labelVal
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `svc-${Date.now()}`;
      const finalId = rawServices.some((s) => s.id === newId)
        ? `${newId}-${Date.now().toString().slice(-4)}`
        : newId;

      const newSvc: ServiceDef = {
        id: finalId,
        label: labelVal,
        port: servicePort,
        runtime: serviceRuntime,
        db: serviceDb,
        color: serviceColor,
      };
      setRawServices((prev) => [...prev, newSvc]);
    }
    setIsEditPanelOpen(false);
  };

  const deleteService = (svcId: string) => {
    setRawServices((prev) => prev.filter((s) => s.id !== svcId));
    if (editingServiceId === svcId) {
      setIsEditPanelOpen(false);
    }
  };

  const resetServices = () => {
    setRawServices(DEFAULT_SERVICES);
  };

  // ─── CRUD Actions: Endpoint ──────────────────────────────────────────────────
  const openAddEndpoint = () => {
    setEditingEndpointId(null);
    setEndpointName("");
    setEndpointType("websocket");
    setEndpointUrl("");
    setEndpointInterval(3000);
    setEndpointMethod("GET");
    setEndpointHeaders(
      JSON.stringify({ "Content-Type": "application/json" }, null, 2),
    );
    setEndpointBody("");
    setConfigTab("endpoints");
    setIsEditPanelOpen(true);
  };

  const openEditEndpoint = (ep: EndpointDef) => {
    setEditingEndpointId(ep.id);
    setEndpointName(ep.name);
    setEndpointType(ep.type);
    setEndpointUrl(ep.url);
    setEndpointInterval(ep.intervalMs);
    setEndpointMethod(ep.method);
    setEndpointHeaders(ep.headers || "{}");
    setEndpointBody(ep.body || "");
    setConfigTab("endpoints");
    setIsEditPanelOpen(true);
  };

  const saveEndpoint = () => {
    if (!endpointName.trim() || !endpointUrl.trim()) return;

    if (editingEndpointId) {
      setEndpoints((prev) =>
        prev.map((e) =>
          e.id === editingEndpointId
            ? {
                ...e,
                name: endpointName,
                type: endpointType,
                url: endpointUrl,
                intervalMs: endpointInterval,
                method: endpointMethod,
                headers: endpointHeaders,
                body: endpointBody,
              }
            : e,
        ),
      );
      const updated = endpoints.find((e) => e.id === editingEndpointId);
      if (updated && updated.connected) {
        disconnectEndpoint(updated);
        setTimeout(
          () =>
            connectEndpoint({
              id: editingEndpointId,
              name: endpointName,
              type: endpointType,
              url: endpointUrl,
              intervalMs: endpointInterval,
              method: endpointMethod,
              headers: endpointHeaders,
              body: endpointBody,
              connected: false,
            }),
          200,
        );
      }
    } else {
      const newEp: EndpointDef = {
        id: `ep-${Date.now()}`,
        name: endpointName,
        type: endpointType,
        url: endpointUrl,
        intervalMs: endpointInterval,
        method: endpointMethod,
        headers: endpointHeaders,
        body: endpointBody,
        connected: false,
      };
      setEndpoints((prev) => [...prev, newEp]);
    }
    setIsEditPanelOpen(false);
  };

  const deleteEndpoint = (epId: string) => {
    const ep = endpoints.find((e) => e.id === epId);
    if (ep) {
      disconnectEndpoint(ep);
    }
    setEndpoints((prev) => prev.filter((e) => e.id !== epId));
  };

  const isSystemActive =
    endpoints.some((e) => e.connected) || (simOn && !paused);

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

  const css = {
    ...baseCss,
    root: {
      ...baseCss.root,
      color: isLight ? "#1e293b" : "#e2e8f0",
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

  return (
    <div style={css.root}>
      <style>{`
        @keyframes msm-blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2d42; border-radius: 2px; }
      `}</style>

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
                ? "실시간 모니터링 고도화 기능 가이드"
                : "Real-time Advanced Monitor Guide"}
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
                  ? "1. 다중 연결 지원 (WebSocket & HTTP Request/Response)"
                  : "1. Multi Connections (WebSocket & HTTP Request)"}
              </p>
              <p>
                {language === "ko"
                  ? "오른쪽 사이드바의 설정 톱니바퀴 버튼을 눌러 연동할 WebSocket 혹은 HTTP API Polling 주소를 자유롭게 등록할 수 있습니다. 등록된 HTTP 요청은 주기마다 설정된 Header와 Body(Payload)를 담아 백그라운드 호출을 실행합니다."
                  : "Click the settings button in the sidebar to register WebSocket streams or HTTP endpoints. HTTP endpoints run background requests automatically with custom Headers and JSON Body."}
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
                  ? "2. 유연한 데이터 매퍼 (JSON Field mapping)"
                  : "2. Flexible Custom JSON Mapper"}
              </p>
              <p>
                {language === "ko"
                  ? "외부 연동 API 서버마다 반환하는 JSON 형태가 다르더라도 대시보드 규격으로 가공해주는 자바스크립트 매퍼(Mapper) 함수를 설정하여 파티클 흐름을 정상 제어할 수 있습니다."
                  : "Write mapping logic to parse various third-party JSON formats into the dashboard standard event layout for seamless metrics tracking."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Connection Bar */}
      <div style={css.wsBar}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <Activity size={14} style={{ color: "#00d4ff" }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".05em",
            }}
          >
            {language === "ko" ? "연동 장치 스트림" : "Connected Streams"}:
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            flex: 1,
            paddingLeft: 6,
          }}
        >
          {endpoints.map((ep) => (
            <button
              key={ep.id}
              onClick={() => toggleEndpoint(ep)}
              style={{
                ...css.btn,
                fontSize: 10,
                padding: "4px 10px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                borderColor: ep.connected
                  ? ep.type === "websocket"
                    ? "#00ff88"
                    : "#a855f7"
                  : "#1e2d42",
                color: ep.connected ? "#fff" : "#4a5568",
                background: ep.connected
                  ? ep.type === "websocket"
                    ? "rgba(0,255,136,0.15)"
                    : "rgba(168,85,247,0.15)"
                  : "#0f1520",
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: ep.connected
                    ? ep.type === "websocket"
                      ? "#00ff88"
                      : "#a855f7"
                    : "#4a5568",
                }}
              />
              <span>
                {ep.name} ({ep.type.toUpperCase()})
              </span>
            </button>
          ))}
          {endpoints.length === 0 && (
            <span
              style={{ fontSize: 10, color: "#4a5568", fontStyle: "italic" }}
            >
              {language === "ko"
                ? "등록된 연동 주소가 없습니다."
                : "No registered endpoints."}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            style={{ ...css.btn, ...(simOn ? css.btnActive : {}) }}
            onClick={() => setSimOn((v) => !v)}
          >
            Sim {simOn ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => {
              setConfigTab("endpoints");
              setIsEditPanelOpen(true);
            }}
            style={{
              ...css.btn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 8px",
            }}
            title="Configure Connections & Endpoints"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Global Stats */}
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

      {/* Main Panel */}
      <div style={css.main}>
        {/* Canvas Area */}
        <div
          style={{
            ...css.canvas,
            minHeight: canvasHeight,
            position: "relative",
          }}
        >
          {services.length === 0 ? (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                background: isLight ? "#f8fafc" : "#090d14",
                color: "#64748b",
                padding: 20,
              }}
            >
              <div
                style={{
                  width: 320,
                  height: 180,
                  border: "2px dashed #1e2d42",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 24 }}>⬡</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {language === "ko"
                    ? "구성된 서비스가 없습니다"
                    : "No Services Configured"}
                </span>
                <button
                  onClick={openAddService}
                  style={{
                    ...css.btn,
                    fontSize: 11,
                    borderColor: "#00d4ff",
                    color: "#00d4ff",
                    marginTop: 6,
                  }}
                >
                  {language === "ko"
                    ? "첫 서비스 추가하기"
                    : "Add Your First Service"}
                </button>
              </div>
            </div>
          ) : (
            <svg
              viewBox={`0 0 640 ${canvasHeight}`}
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
                height={canvasHeight}
                fill={isLight ? "#f8fafc" : "#090d14"}
              />
              <rect
                width="640"
                height={canvasHeight}
                fill="url(#msm-grid)"
                opacity="0.8"
              />

              {/* Static wires */}
              <line
                x1="90"
                y1={centerY}
                x2="175"
                y2={centerY}
                stroke={isLight ? "#cbd5e1" : "#1e2d42"}
                strokeWidth="1.5"
              />
              {services.map((_, i) => (
                <g key={i}>
                  <line
                    x1="275"
                    y1={centerY}
                    x2="330"
                    y2={svcYList[i]}
                    stroke={isLight ? "#cbd5e1" : "#1e2d42"}
                    strokeWidth="1.2"
                  />
                  <line
                    x1="440"
                    y1={svcYList[i]}
                    x2="510"
                    y2={svcYList[i]}
                    stroke={isLight ? "#cbd5e1" : "#1e2d42"}
                    strokeWidth="1.2"
                  />
                </g>
              ))}

              {/* Event bus */}
              <line
                x1="385"
                y1="50"
                x2="385"
                y2={canvasHeight - 60}
                stroke={isLight ? "#cbd5e1" : "#253448"}
                strokeWidth="1"
                strokeDasharray="5,4"
              />
              <text
                x="386"
                y={canvasHeight - 44}
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
                y={centerY - 28}
                width="78"
                height="56"
                rx="8"
                fill={isLight ? "#f1f5f9" : "#0f1520"}
                stroke={isLight ? "#cbd5e1" : "#2a3a4e"}
                strokeWidth="1.5"
              />
              <text
                x="51"
                y={centerY - 9}
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="15"
                fill={isLight ? "#475569" : "#6b7280"}
              >
                ⬡
              </text>
              <text
                x="51"
                y={centerY + 8}
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
                y={centerY + 20}
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
                y={centerY - 34}
                width="100"
                height="68"
                rx="8"
                fill={isLight ? "#f1f5f9" : "#0f1520"}
                stroke="#00d4ff"
                strokeWidth="1.5"
              />
              <rect
                x="175"
                y={centerY - 34}
                width="100"
                height="68"
                rx="8"
                fill="#00d4ff"
                fillOpacity="0.04"
              />
              <text
                x="225"
                y={centerY - 15}
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="12"
                fill="#00d4ff"
              >
                ⬡
              </text>
              <text
                x="225"
                y={centerY + 12}
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
                y={centerY + 14}
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="7"
                fill={isLight ? "#94a3b8" : "#4a5568"}
              >
                auth · lb · rate
              </text>
              <text
                x="225"
                y={centerY + 25}
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="7"
                fill={isLight ? "#94a3b8" : "#4a5568"}
              >
                :8080
              </text>
              <PulseDot
                cx={272}
                cy={centerY - 30}
                r={4}
                color={getGatewayPulseColor()}
                active={isSystemActive}
              />

              {/* Services */}
              {services.map((svc, i) => (
                <g key={svc.id}>
                  <rect
                    x="330"
                    y={svcYList[i] - 28}
                    width="110"
                    height="56"
                    rx="7"
                    fill={isLight ? "#ffffff" : "#111827"}
                    stroke={svc.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x="385"
                    y={svcYList[i] - 6 - 5}
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontSize="11"
                    fill={svc.color}
                  >
                    ◈
                  </text>
                  <text
                    x="385"
                    y={svcYList[i] + 9 - 5}
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
                    y={svcYList[i] + 21 - 5}
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontSize="7"
                    fill={isLight ? "#64748b" : "#94a3b8"}
                  >
                    {svc.runtime} · :{svc.port}
                  </text>
                  <PulseDot
                    cx={437}
                    cy={svcYList[i] - 24 - 5}
                    r={3.5}
                    color={getSvcPulseColor(svc.id)}
                    active={isSystemActive}
                  />
                  {(sUI[svc.id]?.avgLat ?? 0) > 0 && (
                    <text
                      x="340"
                      y={svcYList[i] - 36 - 5}
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
                  topY={svcYList[i] - 18}
                  color={svc.color}
                  label={svc.db}
                  isLight={isLight}
                />
              ))}
            </svg>
          )}
        </div>

        {/* Sidebar */}
        <div style={css.side}>
          <div
            style={{ display: "flex", gap: 8, width: "100%", marginBottom: 4 }}
          >
            <button
              onClick={openAddService}
              style={{
                ...css.btn,
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                borderColor: "#00d4ff",
                color: "#00d4ff",
              }}
            >
              <Plus size={14} />
              {language === "ko" ? "서비스 추가" : "Add Service"}
            </button>
            <button
              onClick={resetServices}
              title="Reset Services"
              style={{
                ...css.btn,
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Service Cards */}
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
                    position: "relative",
                    ...(fl === "err" && { borderColor: "#ff4d6d" }),
                    ...(fl === "ok" && { borderColor: svc.color }),
                    transition: "border-color .3s, transform .2s",
                  }}
                >
                  {/* Service actions */}
                  <div
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      display: "flex",
                      gap: 4,
                      opacity: 0.8,
                    }}
                  >
                    <button
                      onClick={() => openEditService(svc)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#4a5568",
                        cursor: "pointer",
                        padding: 2,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#00d4ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#4a5568")
                      }
                    >
                      <Settings size={12} />
                    </button>
                    <button
                      onClick={() => deleteService(svc.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#4a5568",
                        cursor: "pointer",
                        padding: 2,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#ff4d6d")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#4a5568")
                      }
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 8,
                      paddingRight: 26,
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
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
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

          {/* Log Console */}
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
            <div style={{ overflowY: "auto", flex: 1, maxHeight: 160 }}>
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
                          color: methodColor(l.method, isLight),
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
                        title={l.path}
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

      {/* Controller Area */}
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
            style={{ fontFamily: "monospace", fontSize: 10, color: "#4a5568" }}
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
              marginLeft: isMobile ? 0 : 16,
            }}
          >
            {language === "ko" ? "트래픽 흐름:" : "FLOW MODE:"}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
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

      {/* Tabbed Glassmorphism Configuration Drawer */}
      {isEditPanelOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isLight
              ? "rgba(15, 23, 42, 0.4)"
              : "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 450,
              background: isLight ? "#ffffff" : "#0d131f",
              borderLeft: isLight ? "1px solid #e2e8f0" : "1px solid #1e2d42",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              color: isLight ? "#1e293b" : "#e2e8f0",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: isLight
                  ? "1px solid #f1f5f9"
                  : "1px solid #1e2d42",
                paddingBottom: 16,
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Settings size={18} style={{ color: "#00d4ff" }} />
                <span>
                  {language === "ko"
                    ? "모니터 시스템 고도화 설정"
                    : "Advanced Monitor Configuration"}
                </span>
              </h2>
              <button
                onClick={() => setIsEditPanelOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Buttons */}
            <div
              style={{
                display: "flex",
                gap: 4,
                marginBottom: 20,
                borderBottom: isLight
                  ? "1px solid #f1f5f9"
                  : "1px solid #1e2d42",
                paddingBottom: 8,
              }}
            >
              {[
                {
                  id: "services",
                  label: language === "ko" ? "서비스 설정" : "Services",
                  icon: <Layers size={12} />,
                },
                {
                  id: "endpoints",
                  label: language === "ko" ? "연동 엔드포인트" : "Endpoints",
                  icon: <Link size={12} />,
                },
                {
                  id: "mapper",
                  label: language === "ko" ? "데이터 매퍼" : "Data Mapper",
                  icon: <Code size={12} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id as any)}
                  style={{
                    ...css.btn,
                    flex: 1,
                    fontSize: 10,
                    padding: "6px 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    borderColor:
                      configTab === tab.id ? "#00d4ff" : "transparent",
                    color: configTab === tab.id ? "#00d4ff" : "#4a5568",
                    background: "transparent",
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                paddingRight: 4,
              }}
            >
              {/* TAB 1: SERVICES CONFIGURATION */}
              {configTab === "services" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ fontSize: 13, fontWeight: 600 }}>
                      {editingServiceId
                        ? language === "ko"
                          ? "서비스 수정"
                          : "Edit Service"
                        : language === "ko"
                          ? "새 서비스 추가"
                          : "Add Service"}
                    </h3>
                    {editingServiceId && (
                      <button
                        onClick={() => setEditingServiceId(null)}
                        style={{ ...css.btn, padding: "4px 8px", fontSize: 10 }}
                      >
                        {language === "ko" ? "신규 폼 작성" : "New Form"}
                      </button>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      SERVICE NAME
                    </label>
                    <input
                      style={{
                        ...css.wsInput,
                        flex: "none",
                        padding: "8px 12px",
                        width: "100%",
                      }}
                      value={serviceLabel}
                      onChange={(e) => setServiceLabel(e.target.value)}
                      placeholder="e.g. Auth Service"
                    />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      PORT NUMBER
                    </label>
                    <input
                      type="number"
                      style={{
                        ...css.wsInput,
                        flex: "none",
                        padding: "8px 12px",
                        width: "100%",
                      }}
                      value={servicePort}
                      onChange={(e) =>
                        setServicePort(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      RUNTIME
                    </label>
                    <select
                      style={{
                        ...css.wsInput,
                        flex: "none",
                        padding: "8px 12px",
                        width: "100%",
                        cursor: "pointer",
                      }}
                      value={serviceRuntime}
                      onChange={(e) => setServiceRuntime(e.target.value)}
                    >
                      {[
                        "Node.js",
                        "Go",
                        "Python",
                        "Rust",
                        "Java",
                        "Ruby",
                        "Spring",
                      ].map((r) => (
                        <option
                          key={r}
                          value={r}
                          style={{
                            background: isLight ? "#ffffff" : "#0d131f",
                            color: isLight ? "#1e293b" : "#e2e8f0",
                          }}
                        >
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      DATABASE
                    </label>
                    <select
                      style={{
                        ...css.wsInput,
                        flex: "none",
                        padding: "8px 12px",
                        width: "100%",
                        cursor: "pointer",
                      }}
                      value={serviceDb}
                      onChange={(e) => setServiceDb(e.target.value)}
                    >
                      {[
                        "PostgreSQL",
                        "MongoDB",
                        "Redis",
                        "MySQL",
                        "DynamoDB",
                        "Cassandra",
                        "SQLite",
                      ].map((db) => (
                        <option
                          key={db}
                          value={db}
                          style={{
                            background: isLight ? "#ffffff" : "#0d131f",
                            color: isLight ? "#1e293b" : "#e2e8f0",
                          }}
                        >
                          {db}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      THEME COLOR
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginTop: 4,
                      }}
                    >
                      {COLOR_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setServiceColor(p.value)}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: p.value,
                            border:
                              serviceColor === p.value
                                ? "2px solid #fff"
                                : "2px solid transparent",
                            boxShadow:
                              serviceColor === p.value
                                ? "0 0 0 1px #00d4ff"
                                : "none",
                            cursor: "pointer",
                          }}
                          title={p.label}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={saveService}
                    style={{
                      ...css.btn,
                      background: "#00d4ff",
                      borderColor: "#00d4ff",
                      color: "#0f1520",
                      fontWeight: 600,
                      width: "100%",
                      padding: "10px",
                      marginTop: 10,
                    }}
                  >
                    {language === "ko"
                      ? "서비스 구성 저장"
                      : "Save Service Configuration"}
                  </button>
                </div>
              )}

              {/* TAB 2: ENDPOINTS (WS & HTTP POLLING) CONFIGURATION */}
              {configTab === "endpoints" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ fontSize: 13, fontWeight: 600 }}>
                      {editingEndpointId
                        ? language === "ko"
                          ? "엔드포인트 수정"
                          : "Edit Endpoint"
                        : language === "ko"
                          ? "새 엔드포인트 추가"
                          : "Add Endpoint"}
                    </h3>
                    <button
                      onClick={openAddEndpoint}
                      style={{
                        ...css.btn,
                        padding: "4px 8px",
                        fontSize: 10,
                        display: editingEndpointId ? "block" : "none",
                      }}
                    >
                      {language === "ko" ? "신규 폼" : "New Form"}
                    </button>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      ENDPOINT NAME
                    </label>
                    <input
                      style={{
                        ...css.wsInput,
                        flex: "none",
                        padding: "8px 12px",
                        width: "100%",
                      }}
                      value={endpointName}
                      onChange={(e) => setEndpointName(e.target.value)}
                      placeholder="e.g. User REST API"
                    />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      CONNECTION TYPE
                    </label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setEndpointType("websocket")}
                        style={{
                          ...css.btn,
                          flex: 1,
                          padding: 8,
                          fontSize: 11,
                          borderColor:
                            endpointType === "websocket"
                              ? "#00d4ff"
                              : "#1e2d42",
                        }}
                      >
                        WebSocket
                      </button>
                      <button
                        onClick={() => setEndpointType("http")}
                        style={{
                          ...css.btn,
                          flex: 1,
                          padding: 8,
                          fontSize: 11,
                          borderColor:
                            endpointType === "http" ? "#00d4ff" : "#1e2d42",
                        }}
                      >
                        HTTP Polling
                      </button>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      URL ADDRESS
                    </label>
                    <input
                      style={{
                        ...css.wsInput,
                        flex: "none",
                        padding: "8px 12px",
                        width: "100%",
                      }}
                      value={endpointUrl}
                      onChange={(e) => setEndpointUrl(e.target.value)}
                      placeholder={
                        endpointType === "websocket"
                          ? "ws://localhost:4001"
                          : "https://api.test.com/v1/health"
                      }
                    />
                  </div>

                  {endpointType === "http" && (
                    <>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            flex: 1,
                          }}
                        >
                          <label
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#64748b",
                            }}
                          >
                            METHOD
                          </label>
                          <select
                            style={{
                              ...css.wsInput,
                              flex: "none",
                              padding: "8px 12px",
                              width: "100%",
                              cursor: "pointer",
                            }}
                            value={endpointMethod}
                            onChange={(e) =>
                              setEndpointMethod(e.target.value as any)
                            }
                          >
                            {["GET", "POST", "PUT", "DELETE"].map((m) => (
                              <option
                                key={m}
                                value={m}
                                style={{
                                  background: isLight ? "#ffffff" : "#0d131f",
                                  color: isLight ? "#1e293b" : "#e2e8f0",
                                }}
                              >
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            flex: 1,
                          }}
                        >
                          <label
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#64748b",
                            }}
                          >
                            INTERVAL (MS)
                          </label>
                          <input
                            type="number"
                            style={{
                              ...css.wsInput,
                              flex: "none",
                              padding: "8px 12px",
                              width: "100%",
                            }}
                            value={endpointInterval}
                            onChange={(e) =>
                              setEndpointInterval(
                                parseInt(e.target.value) || 1000,
                              )
                            }
                            min={1000}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#64748b",
                          }}
                        >
                          HEADERS (JSON STRING)
                        </label>
                        <textarea
                          style={{
                            ...css.wsInput,
                            fontFamily: "monospace",
                            minHeight: 70,
                            maxHeight: 120,
                            padding: 8,
                            resize: "none",
                            width: "100%",
                          }}
                          value={endpointHeaders}
                          onChange={(e) => setEndpointHeaders(e.target.value)}
                        />
                      </div>

                      {["POST", "PUT"].includes(endpointMethod) && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          <label
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#64748b",
                            }}
                          >
                            REQUEST BODY (JSON PAYLOAD)
                          </label>
                          <textarea
                            style={{
                              ...css.wsInput,
                              fontFamily: "monospace",
                              height: 70,
                              padding: 8,
                              resize: "none",
                              width: "100%",
                            }}
                            value={endpointBody}
                            onChange={(e) => setEndpointBody(e.target.value)}
                            placeholder='{ "userId": 10 }'
                          />
                        </div>
                      )}
                    </>
                  )}

                  <button
                    onClick={saveEndpoint}
                    style={{
                      ...css.btn,
                      background: "#00d4ff",
                      borderColor: "#00d4ff",
                      color: "#0f1520",
                      fontWeight: 600,
                      width: "100%",
                      padding: "10px",
                      marginTop: 6,
                    }}
                  >
                    {language === "ko" ? "엔드포인트 저장" : "Save Endpoint"}
                  </button>

                  <div
                    style={{
                      borderTop: isLight
                        ? "1px solid #f1f5f9"
                        : "1px solid #1e2d42",
                      paddingTop: 14,
                      marginTop: 10,
                    }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                      }}
                    >
                      {language === "ko"
                        ? "등록된 주소 리스트"
                        : "Registered Address List"}
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {endpoints.map((ep) => (
                        <div
                          key={ep.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 10px",
                            background: isLight ? "#f8fafc" : "#080d14",
                            border: isLight
                              ? "1px solid #e2e8f0"
                              : "1px solid #1e2d42",
                            borderRadius: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                              minWidth: 0,
                            }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 600 }}>
                              {ep.name}
                            </span>
                            <span
                              style={{
                                fontSize: 9,
                                color: "#4a5568",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ep.url}
                            </span>
                          </div>
                          <div
                            style={{ display: "flex", gap: 6, flexShrink: 0 }}
                          >
                            <button
                              onClick={() => openEditEndpoint(ep)}
                              style={{
                                ...css.btn,
                                padding: "4px 8px",
                                fontSize: 9,
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteEndpoint(ep.id)}
                              style={{
                                ...css.btn,
                                padding: "4px 8px",
                                fontSize: 9,
                                borderColor: "#ff4d6d",
                                color: "#ff4d6d",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOM DATA MAPPER (JS PARSER CODE) */}
              {configTab === "mapper" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div>
                    <h3
                      style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}
                    >
                      {language === "ko"
                        ? "자바스크립트 수신 데이터 파서"
                        : "JS Response Data Parser"}
                    </h3>
                    <p style={{ fontSize: 11, color: "#64748b" }}>
                      {language === "ko"
                        ? "외부 WebSocket 및 HTTP response JSON 데이터를 대시보드의 파티클 및 차트 규격인 TrafficEvent 타입으로 변환하는 로직을 작성합니다."
                        : "Write mapping codes to convert raw json payload into TrafficEvent types dynamically."}
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      MAPPER FUNCTION BODY
                    </label>
                    <textarea
                      style={{
                        ...css.wsInput,
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 11,
                        minHeight: 200,
                        maxHeight: 300,
                        padding: 10,
                        resize: "none",
                        lineHeight: 1.5,
                        width: "100%",
                      }}
                      value={mapperCode}
                      onChange={(e) => setMapperCode(e.target.value)}
                    />
                  </div>
                  <div
                    style={{
                      background: isLight ? "#f1f5f9" : "#080c13",
                      border: isLight
                        ? "1px solid #cbd5e1"
                        : "1px solid #141f2e",
                      padding: 10,
                      borderRadius: 6,
                      fontSize: 10,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#00d4ff",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      [!] TrafficEvent Schema:
                    </span>
                    <code>
                      {"{"} <br />
                      &nbsp;&nbsp;service: string; // "user" | "order" 등 구성된
                      서비스 ID <br />
                      &nbsp;&nbsp;method: string; // "GET" | "POST" | "PUT" |
                      "DELETE" <br />
                      &nbsp;&nbsp;path: string; // API Endpoint URI <br />
                      &nbsp;&nbsp;status: number; // HTTP Response Code <br />
                      &nbsp;&nbsp;latency_ms: number; // Duration in ms <br />
                      {"}"}
                    </code>
                  </div>
                </div>
              )}
            </div>

            {/* Actions footer */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 14,
                borderTop: isLight ? "1px solid #f1f5f9" : "1px solid #1e2d42",
                paddingTop: 16,
              }}
            >
              <button
                onClick={() => setIsEditPanelOpen(false)}
                style={{ ...css.btn, flex: 1, padding: "10px" }}
              >
                {language === "ko" ? "닫기" : "Close Panel"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 0,
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
