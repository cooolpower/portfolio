/**
 * MicroserviceMonitor — React Component
 * ══════════════════════════════════════
 * Drop-in React component for real-time microservice visualization.
 *
 * USAGE:
 *   import MicroserviceMonitor from './MicroserviceMonitor'
 *
 *   // 1. With WebSocket (auto-connects, falls back to sim if disconnected)
 *   <MicroserviceMonitor wsUrl="ws://localhost:4001" />
 *
 *   // 2. Simulator only
 *   <MicroserviceMonitor />
 *
 *   // 3. Custom services config
 *   <MicroserviceMonitor
 *     wsUrl="wss://prod.example.com/ws"
 *     services={[
 *       { id:'auth',    label:'Auth Service',    color:'#a855f7', port:3001, db:'PostgreSQL' },
 *       { id:'catalog', label:'Catalog Service', color:'#00d4ff', port:3002, db:'MongoDB'    },
 *       { id:'cart',    label:'Cart Service',    color:'#00ff88', port:3003, db:'Redis'       },
 *       { id:'notify',  label:'Notify Service',  color:'#ffd166', port:3004, db:'Redis'       },
 *     ]}
 *   />
 *
 * WEBSOCKET EVENT FORMAT (from your server):
 *   { type: 'event', service: 'order', method: 'POST',
 *     path: '/api/orders', status: 201, latency_ms: 42 }
 *   { type: 'metric', data: { rps, p50, p99, uptime, services: { order: { req, err, avgLatency, errRate } } } }
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Default service definitions ──────────────────────────────────────────────
const DEFAULT_SERVICES = [
  { id:'user',    label:'User Service',    color:'#a855f7', port:3001, db:'PostgreSQL', runtime:'Node.js'  },
  { id:'order',   label:'Order Service',   color:'#00d4ff', port:3002, db:'MongoDB',    runtime:'Go'       },
  { id:'payment', label:'Payment Service', color:'#00ff88', port:3003, db:'PostgreSQL', runtime:'Python'   },
  { id:'notif',   label:'Notif Service',   color:'#ffd166', port:3004, db:'Redis',      runtime:'Node.js'  },
]

// ── SVG layout constants (per service, indexed 0-3) ──────────────────────────
const SVC_Y = [110, 210, 310, 410]

function getSegments(svcY) {
  return [
    { x1:90, y1:260, x2:175, y2:260 },
    { x1:225,y1:260, x2:275, y2:260 },
    { x1:275,y1:260, x2:330, y2:svcY },
    { x1:440,y1:svcY,x2:510, y2:svcY },
  ]
}

// ── Particle class (SVG-based) ───────────────────────────────────────────────
let _pid = 0
class Particle {
  constructor(svcIdx, color, isErr, speed, svgEl) {
    this.id = ++_pid
    this.segs = getSegments(SVC_Y[svcIdx])
    this.segIdx = 0
    this.t = 0
    this.speed = speed
    this.color = isErr ? '#ff4d6d' : color
    this.done = false
    this.svgEl = svgEl

    this.el   = document.createElementNS('http://www.w3.org/2000/svg','circle')
    this.tail = document.createElementNS('http://www.w3.org/2000/svg','circle')
    this.el.setAttribute('r','5')
    this.el.setAttribute('fill', this.color)
    this.el.setAttribute('filter','url(#msm-glow)')
    this.tail.setAttribute('r','9')
    this.tail.setAttribute('fill', this.color)
    this.tail.setAttribute('opacity','.2')
    svgEl.appendChild(this.tail)
    svgEl.appendChild(this.el)
  }
  update() {
    if (this.segIdx >= this.segs.length) { this.destroy(); return }
    const s = this.segs[this.segIdx]
    this.t += this.speed
    if (this.t >= 1) { this.t = 0; this.segIdx++; return }
    const x = s.x1 + (s.x2 - s.x1) * this.t
    const y = s.y1 + (s.y2 - s.y1) * this.t
    this.el.setAttribute('cx', x); this.el.setAttribute('cy', y)
    this.tail.setAttribute('cx', x); this.tail.setAttribute('cy', y)
  }
  destroy() {
    this.done = true
    this.el.remove(); this.tail.remove()
  }
}

// ── useWebSocket hook ────────────────────────────────────────────────────────
function useWebSocket(url, onEvent, onMetric) {
  const wsRef = useRef(null)
  const [status, setStatus] = useState('disconnected') // 'connecting'|'connected'|'disconnected'|'error'

  const connect = useCallback((wsUrl) => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    if (!wsUrl) return
    setStatus('connecting')
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      ws.onopen = () => setStatus('connected')
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'event' || msg.type === 'request') onEvent(msg)
          else if (msg.type === 'metric') onMetric(msg.data)
          else if (msg.type === 'snapshot') onMetric(msg.data)
        } catch {}
      }
      ws.onerror = () => setStatus('error')
      ws.onclose = () => { setStatus('disconnected'); wsRef.current = null }
    } catch { setStatus('error') }
  }, [onEvent, onMetric])

  const disconnect = useCallback(() => {
    wsRef.current?.close(); wsRef.current = null; setStatus('disconnected')
  }, [])

  useEffect(() => {
    if (url) connect(url)
    return () => { wsRef.current?.close() }
  }, [url]) // eslint-disable-line

  return { status, connect, disconnect }
}

// ── useMicroserviceStats hook ────────────────────────────────────────────────
function useMicroserviceStats(services) {
  const globalRef = useRef({ total:0, err:0, latencies:[], reqWindow:[] })
  const svcRef    = useRef(
    Object.fromEntries(services.map(s => [s.id, { req:0, err:0, latencies:[], window:[] }]))
  )
  const [globalUI, setGlobalUI] = useState({ rps:0, p50:0, p99:0, uptime:'100.0', total:0, err:0 })
  const [svcUI,    setSvcUI]    = useState(
    Object.fromEntries(services.map(s => [s.id, { rps:0, avgLat:0, errRate:'0.0' }]))
  )

  const ingestEvent = useCallback((evt) => {
    const { service, latency_ms, status } = evt
    const isErr = status >= 400
    const now = Date.now()
    const g = globalRef.current
    g.total++; if (isErr) g.err++
    g.latencies.push(latency_ms); if (g.latencies.length > 300) g.latencies.shift()
    g.reqWindow.push({ ts: now })

    const sv = svcRef.current[service]
    if (sv) {
      sv.req++; if (isErr) sv.err++
      sv.latencies.push(latency_ms); if (sv.latencies.length > 100) sv.latencies.shift()
      sv.window.push({ ts: now })
    }
  }, [])

  const applyServerMetric = useCallback((data) => {
    if (!data) return
    setGlobalUI(prev => ({
      ...prev,
      rps: data.rps ?? prev.rps,
      p50: data.p50 ?? prev.p50,
      p99: data.p99 ?? prev.p99,
      uptime: data.uptime ?? prev.uptime,
      total: data.totalReq ?? prev.total,
      err: data.totalErr ?? prev.err,
    }))
    if (data.services) {
      setSvcUI(prev => {
        const next = { ...prev }
        for (const [id, info] of Object.entries(data.services)) {
          if (next[id]) next[id] = { ...next[id], avgLat: info.avgLatency ?? 0, errRate: info.errRate ?? '0.0' }
        }
        return next
      })
    }
  }, [])

  // Tick local stats every 1s
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now()
      const g = globalRef.current
      g.reqWindow = g.reqWindow.filter(e => now - e.ts < 1000)
      const lats = [...g.latencies].sort((a,b)=>a-b)
      const p50 = lats[Math.floor(lats.length * .5)] || 0
      const p99 = lats[Math.floor(lats.length * .99)] || 0
      const uptime = g.total > 0 ? (((g.total - g.err)/g.total)*100).toFixed(1) : '100.0'
      setGlobalUI({ rps: g.reqWindow.length, p50, p99, uptime, total: g.total, err: g.err })

      setSvcUI(() => {
        const next = {}
        for (const [id, sv] of Object.entries(svcRef.current)) {
          sv.window = sv.window.filter(e => now - e.ts < 1000)
          const avgLat = sv.latencies.length
            ? Math.round(sv.latencies.reduce((a,b)=>a+b,0)/sv.latencies.length) : 0
          const errRate = sv.req > 0 ? ((sv.err/sv.req)*100).toFixed(1) : '0.0'
          next[id] = { rps: sv.window.length, avgLat, errRate }
        }
        return next
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  return { globalUI, svcUI, ingestEvent, applyServerMetric }
}

// ── Simulator ────────────────────────────────────────────────────────────────
const SIM_PATHS = {
  user:    ['/api/users','/api/users/login','/api/users/me'],
  order:   ['/api/orders','/api/orders/create','/api/orders/status'],
  payment: ['/api/payments/charge','/api/payments/refund','/api/payments/status'],
  notif:   ['/api/notify/email','/api/notify/push'],
}
const SIM_METHODS = {
  user:['GET','POST','GET'], order:['POST','GET','GET'],
  payment:['POST','POST','GET'], notif:['POST','POST'],
}
const SIM_INTERVAL = { normal:230, spike:65, error:190, slow:550 }

function makeSimEvent(services, mode) {
  const svc = services[Math.floor(Math.random()*services.length)]
  const paths = SIM_PATHS[svc.id] || ['/api/'+svc.id]
  const methods = SIM_METHODS[svc.id] || ['GET','POST']
  const path = paths[Math.floor(Math.random()*paths.length)]
  const method = methods[Math.floor(Math.random()*methods.length)]
  let status, latency
  switch(mode) {
    case 'spike': status = Math.random()<.12?(Math.random()<.5?429:503):200; latency=~~(Math.random()*800+50); break
    case 'error': status = Math.random()<.4?[500,502,503,404][~~(Math.random()*4)]:200; latency=~~(Math.random()*1500+200); break
    case 'slow':  status = Math.random()<.05?504:200; latency=~~(Math.random()*2000+500); break
    default:      status = Math.random()<.03?[500,404][~~(Math.random()*2)]:(Math.random()<.1?201:200); latency=~~(Math.random()*150+10)
  }
  return { type:'event', service: svc.id, method, path, status, latency_ms: latency }
}

// ── Colours / helpers ────────────────────────────────────────────────────────
const WS_DOT_COLOR = { connected:'#00ff88', connecting:'#ffd166', error:'#ff4d6d', disconnected:'#4a5568' }
const clamp = (v,min,max) => Math.min(max,Math.max(min,v))

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function MicroserviceMonitor({ wsUrl = '', services = DEFAULT_SERVICES }) {
  // ── Refs ──
  const svgParticleRef = useRef(null)
  const particlesRef   = useRef([])
  const rafRef         = useRef(null)
  const simTimerRef    = useRef(null)

  // ── State ──
  const [wsInput,   setWsInput]   = useState(wsUrl)
  const [simOn,     setSimOn]     = useState(!wsUrl)
  const [simMode,   setSimMode]   = useState('normal')
  const [paused,    setPaused]    = useState(false)
  const [logs,      setLogs]      = useState([])
  const [flashSvc,  setFlashSvc]  = useState({})
  const pausedRef   = useRef(false)
  const simModeRef  = useRef('normal')
  const simOnRef    = useRef(!wsUrl)

  useEffect(() => { pausedRef.current  = paused  }, [paused])
  useEffect(() => { simModeRef.current = simMode }, [simMode])
  useEffect(() => { simOnRef.current   = simOn   }, [simOn])

  // ── Stats ──
  const { globalUI, svcUI, ingestEvent, applyServerMetric } = useMicroserviceStats(services)

  // ── Event pipeline ──
  const handleEvent = useCallback((evt) => {
    if (pausedRef.current) return
    const svcIdx = services.findIndex(s => s.id === evt.service)
    if (svcIdx < 0) return
    const svc = services[svcIdx]
    const isErr = evt.status >= 400
    const speed = simModeRef.current === 'slow' ? 0.01 : simModeRef.current === 'spike' ? 0.036 : 0.022

    // Spawn particle
    if (svgParticleRef.current) {
      particlesRef.current.push(new Particle(svcIdx, svc.color, isErr, speed, svgParticleRef.current))
    }

    ingestEvent(evt)

    // Flash card
    setFlashSvc(prev => ({ ...prev, [evt.service]: isErr ? 'err' : 'ok' }))
    setTimeout(() => setFlashSvc(prev => { const n={...prev}; delete n[evt.service]; return n }), 350)

    // Log
    const now = new Date()
    const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    setLogs(prev => [{ id: _pid, ts, method: evt.method, path: evt.path, status: evt.status, ms: evt.latency_ms, svc: evt.service }, ...prev].slice(0,30))
  }, [services, ingestEvent])

  // ── WebSocket ──
  const { status: wsStatus, connect, disconnect } = useWebSocket(wsUrl || null, handleEvent, applyServerMetric)

  const handleConnect = () => {
    if (wsStatus === 'connected') { disconnect(); return }
    connect(wsInput)
  }

  // Auto-stop sim when WS connects
  useEffect(() => {
    if (wsStatus === 'connected' && simOnRef.current) setSimOn(false)
  }, [wsStatus])

  // ── Simulator ──
  useEffect(() => {
    if (simOn && !paused) {
      simTimerRef.current = setInterval(() => {
        handleEvent(makeSimEvent(services, simModeRef.current))
      }, SIM_INTERVAL[simMode])
    } else {
      clearInterval(simTimerRef.current)
    }
    return () => clearInterval(simTimerRef.current)
  }, [simOn, simMode, paused, services, handleEvent])

  // ── RAF loop ──
  useEffect(() => {
    const loop = () => {
      if (!pausedRef.current) {
        particlesRef.current.forEach(p => p.update())
        particlesRef.current = particlesRef.current.filter(p => !p.done)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Helpers ──
  const latColor = (ms) => ms < 200 ? '#00ff88' : ms < 800 ? '#ffd166' : '#ff4d6d'
  const rateColor = (r) => parseFloat(r) < 5 ? '#00ff88' : parseFloat(r) < 15 ? '#ffd166' : '#ff4d6d'
  const upColor   = (u) => parseFloat(u) > 99 ? '#00ff88' : parseFloat(u) > 95 ? '#ffd166' : '#ff4d6d'
  const mColor    = (m) => ({ GET:'#00ff88',POST:'#00d4ff',PUT:'#ffd166',DELETE:'#ff4d6d' }[m] || '#9ca3af')
  const sColor    = (s) => s < 400 ? '#00ff88' : '#ff4d6d'

  // ── Render ──
  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.hdr}>
        <div style={S.eyebrow}>websocket · real-time</div>
        <h1 style={S.h1}>Microservice <span style={{color:'#00d4ff'}}>Live Monitor</span></h1>
      </div>

      {/* WS bar */}
      <div style={S.wsBar}>
        <div style={S.wsDotWrap}>
          <div style={{...S.wsDot, background: WS_DOT_COLOR[wsStatus],
            boxShadow: wsStatus === 'connected' ? '0 0 8px #00ff88' : 'none',
            animation: wsStatus === 'connecting' ? 'msm-blink 1s infinite' : 'none'
          }}/>
          <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:11,
            color: wsStatus==='connected'?'#00ff88':wsStatus==='error'?'#ff4d6d':'#4a5568'}}>
            {wsStatus}
          </span>
        </div>
        <input
          style={S.wsInput} value={wsInput}
          onChange={e => setWsInput(e.target.value)}
          placeholder="ws://localhost:4001"
          onKeyDown={e => e.key === 'Enter' && handleConnect()}
        />
        <button style={{...S.btnSm, ...(wsStatus==='connected'?S.btnActive:{})}} onClick={handleConnect}>
          {wsStatus === 'connected' ? 'Disconnect' : 'Connect'}
        </button>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'#4a5568',whiteSpace:'nowrap'}}>
          or use sim →
        </span>
        <button style={{...S.btnSm, ...(simOn?S.btnActive:{})}} onClick={() => setSimOn(v => !v)}>
          Sim {simOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Stats row */}
      <div style={S.statsRow}>
        {[
          { id:'rps',   val: globalUI.rps,    label:'Req/s',      color:'#00ff88' },
          { id:'p50',   val: globalUI.p50+'ms', label:'p50 Lat',  color: latColor(globalUI.p50) },
          { id:'p99',   val: globalUI.p99+'ms', label:'p99 Lat',  color: latColor(globalUI.p99) },
          { id:'up',    val: globalUI.uptime+'%', label:'Uptime', color: upColor(globalUI.uptime) },
          { id:'total', val: globalUI.total,  label:'Total',       color:'#00d4ff' },
          { id:'err',   val: globalUI.err,    label:'Errors',      color:'#ff4d6d' },
        ].map(s => (
          <div key={s.id} style={S.stat}>
            <div style={{...S.statVal, color: s.color}}>{s.val}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main area */}
      <div style={S.main}>
        {/* SVG Canvas */}
        <div style={S.canvasWrap}>
          <svg viewBox="0 0 640 520" style={{width:'100%',display:'block'}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="msm-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <pattern id="msm-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0L0 0 0 32" fill="none" stroke="#141f2e" strokeWidth="0.6"/>
              </pattern>
            </defs>
            <rect width="640" height="520" fill="#090d14"/>
            <rect width="640" height="520" fill="url(#msm-grid)" opacity="0.8"/>

            {/* Static wires */}
            <line x1="90" y1="260" x2="175" y2="260" stroke="#1e2d42" strokeWidth="1.5"/>
            {services.map((_, i) => (
              <g key={i}>
                <line x1="275" y1="260" x2="330" y2={SVC_Y[i]} stroke="#1e2d42" strokeWidth="1.2"/>
                <line x1="440" y1={SVC_Y[i]} x2="510" y2={SVC_Y[i]} stroke="#1e2d42" strokeWidth="1.2"/>
              </g>
            ))}
            <line x1="385" y1="80" x2="385" y2="460" stroke="#253448" strokeWidth="1" strokeDasharray="5,4"/>
            <text x="386" y="476" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#253448" letterSpacing=".1em">EVENT BUS</text>

            {/* Client */}
            <rect x="12" y="232" width="78" height="56" rx="8" fill="#0f1520" stroke="#2a3a4e" strokeWidth="1.5"/>
            <text x="51" y="256" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="15" fill="#6b7280">⬡</text>
            <text x="51" y="272" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="600" fill="#9ca3af">CLIENT</text>
            <text x="51" y="283" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#4a5568">HTTP/2</text>

            {/* Gateway */}
            <rect x="175" y="226" width="100" height="68" rx="8" fill="#0f1520" stroke="#00d4ff" strokeWidth="1.5"/>
            <rect x="175" y="226" width="100" height="68" rx="8" fill="#00d4ff" fillOpacity="0.04"/>
            <text x="225" y="252" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="12" fill="#00d4ff">⬡</text>
            <text x="225" y="267" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="600" fill="#00d4ff">API GATEWAY</text>
            <text x="225" y="280" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#4a5568">auth · lb · rate</text>
            <PulseDot cx={272} cy={230} r={4} color="#00ff88"/>

            {/* Services */}
            {services.map((svc, i) => (
              <g key={svc.id}>
                <rect x="330" y={SVC_Y[i]-28} width="110" height="56" rx="7"
                  fill="#0f1520" stroke={svc.color} strokeWidth="1.5"/>
                <text x="385" y={SVC_Y[i]-7} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="11" fill={svc.color}>◈</text>
                <text x="385" y={SVC_Y[i]+9} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="600" fill={svc.color}>{svc.label.toUpperCase()}</text>
                <text x="385" y={SVC_Y[i]+21} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#4a5568">{svc.runtime} · :{svc.port}</text>
                <PulseDot cx={437} cy={SVC_Y[i]-24} r={3.5} color="#00ff88"/>
                {/* Latency overlay */}
                {svcUI[svc.id]?.avgLat > 0 && (
                  <text x="340" y={SVC_Y[i]-30} fontFamily="JetBrains Mono,monospace" fontSize="8" fill={latColor(svcUI[svc.id].avgLat)}>
                    {svcUI[svc.id].avgLat}ms
                  </text>
                )}
              </g>
            ))}

            {/* Databases */}
            {services.map((svc, i) => (
              <DbCylinder key={svc.id} cx={560} topY={SVC_Y[i]-18} color={svc.color} label={svc.db || 'DB'} sublabel={svc.dbLabel || ''}/>
            ))}

            {/* Particle target */}
            <g ref={svgParticleRef}/>
          </svg>
        </div>

        {/* Side panel */}
        <div style={S.side}>
          {/* Service cards */}
          {services.map(svc => {
            const ui = svcUI[svc.id] || {}
            const flash = flashSvc[svc.id]
            return (
              <div key={svc.id} style={{
                ...S.svcCard,
                borderColor: flash === 'err' ? '#ff4d6d' : flash === 'ok' ? svc.color : '#1e2d42',
                transition: 'border-color .3s',
              }}>
                <div style={S.svcHead}>
                  <div style={{...S.svcDot, background: svc.color}}/>
                  <div style={{...S.svcName, color: svc.color}}>{svc.label}</div>
                  <div style={S.svcPort}>:{svc.port}</div>
                </div>
                <MiniBar label="RPS"     val={ui.rps}    max={50}   display={ui.rps}         color={svc.color}/>
                <MiniBar label="Latency" val={ui.avgLat} max={1000} display={(ui.avgLat||0)+'ms'} color={latColor(ui.avgLat||0)}/>
                <MiniBar label="Err%"    val={parseFloat(ui.errRate||0)} max={20} display={(ui.errRate||'0.0')+'%'} color={rateColor(ui.errRate||'0')}/>
              </div>
            )
          })}

          {/* Log */}
          <div style={S.logWrap}>
            <div style={S.logTitle}>// live log</div>
            <div style={{overflowY:'auto',flex:1,maxHeight:200}}>
              {logs.length === 0
                ? <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'#4a5568',padding:'8px 0'}}>Waiting…</div>
                : logs.map(l => {
                  const svc = services.find(s => s.id === l.svc)
                  return (
                    <div key={l.id} style={S.logEntry}>
                      <span style={{color: svc?.color || '#4a5568', width:10}}>▶</span>
                      <span style={{color: mColor(l.method), width:32, flexShrink:0}}>{l.method.slice(0,3)}</span>
                      <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#e2e8f0'}}>{l.path}</span>
                      <span style={{color: sColor(l.status), width:28, flexShrink:0, textAlign:'right'}}>{l.status}</span>
                      <span style={{color:'#4a5568', width:40, flexShrink:0, textAlign:'right'}}>{l.ms}ms</span>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={S.ctrls}>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'#4a5568',alignSelf:'center'}}>SIM:</span>
        {['normal','spike','error','slow'].map(m => (
          <button key={m} style={{...S.btnSm,...(simMode===m?S.btnActive:{})}} onClick={() => { setSimMode(m); simModeRef.current = m }}>
            {m}
          </button>
        ))}
        <button style={{...S.btnSm,...(paused?S.btnActive:{})}} onClick={() => setPaused(v => !v)}>
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Global keyframes */}
      <style>{`@keyframes msm-blink{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function PulseDot({ cx, cy, r, color }) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    let s = 1, d = 0.025
    const t = setInterval(() => {
      s += d; if (s > 1.5 || s < 0.6) d *= -1
      setScale(s)
    }, 60)
    return () => clearInterval(t)
  }, [])
  return <circle cx={cx} cy={cy} r={r * scale} fill={color} opacity={0.4 + (scale-0.6)*0.75}/>
}

function DbCylinder({ cx, topY, color, label }) {
  const rx=42, rye=14, h=24
  return (
    <g opacity="0.85">
      <ellipse cx={cx} cy={topY}   rx={rx} ry={rye} fill="#0f1520" stroke={color} strokeWidth="1" strokeOpacity=".7"/>
      <rect x={cx-rx} y={topY}   width={rx*2} height={h} fill="#0f1520"/>
      <line x1={cx-rx} y1={topY} x2={cx-rx} y2={topY+h} stroke={color} strokeWidth="1" strokeOpacity=".7"/>
      <line x1={cx+rx} y1={topY} x2={cx+rx} y2={topY+h} stroke={color} strokeWidth="1" strokeOpacity=".7"/>
      <ellipse cx={cx} cy={topY+h} rx={rx} ry={rye} fill="#0f1520" stroke={color} strokeWidth="1" strokeOpacity=".7"/>
      <text x={cx} y={topY+h/2+2} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8" fontWeight="600" fill={color}>{label}</text>
    </g>
  )
}

function MiniBar({ label, val, max, display, color }) {
  const pct = clamp((val / max) * 100, 0, 100)
  return (
    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
      <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'#4a5568',width:50,flexShrink:0}}>{label}</span>
      <div style={{flex:1,height:4,background:'#2a3a4e',borderRadius:2,overflow:'hidden'}}>
        <div style={{width:pct+'%',height:'100%',background:color,borderRadius:2,transition:'width .4s'}}/>
      </div>
      <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'#e2e8f0',width:36,textAlign:'right',flexShrink:0}}>{display}</span>
    </div>
  )
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const S = {
  root:       { background:'#090d14',color:'#e2e8f0',fontFamily:'Inter,sans-serif',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',padding:'24px 16px 40px',gap:0 },
  hdr:        { textAlign:'center',marginBottom:20 },
  eyebrow:    { fontFamily:'JetBrains Mono,monospace',fontSize:11,letterSpacing:'.2em',color:'#00d4ff',textTransform:'uppercase',marginBottom:6 },
  h1:         { fontSize:28,fontWeight:600,letterSpacing:'-.02em',color:'#fff',margin:0 },
  wsBar:      { display:'flex',alignItems:'center',gap:8,background:'#0f1520',border:'1px solid #1e2d42',borderRadius:8,padding:'9px 14px',marginBottom:16,width:'100%',maxWidth:980,flexWrap:'wrap' },
  wsDotWrap:  { display:'flex',alignItems:'center',gap:6 },
  wsDot:      { width:8,height:8,borderRadius:'50%',flexShrink:0,transition:'background .3s' },
  wsInput:    { fontFamily:'JetBrains Mono,monospace',fontSize:11,background:'#121c2a',border:'1px solid #1e2d42',borderRadius:6,padding:'5px 10px',color:'#e2e8f0',flex:1,minWidth:160,outline:'none' },
  statsRow:   { display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',justifyContent:'center',width:'100%',maxWidth:980 },
  stat:       { background:'#0f1520',border:'1px solid #1e2d42',borderRadius:8,padding:'9px 16px',textAlign:'center',flex:1,minWidth:80 },
  statVal:    { fontFamily:'JetBrains Mono,monospace',fontSize:18,fontWeight:600 },
  statLabel:  { fontSize:10,color:'#4a5568',letterSpacing:'.1em',textTransform:'uppercase',marginTop:3 },
  main:       { display:'flex',gap:14,width:'100%',maxWidth:980,flexWrap:'wrap' },
  canvasWrap: { flex:1,minWidth:0,background:'#0f1520',border:'1px solid #1e2d42',borderRadius:12,overflow:'hidden' },
  side:       { width:230,flexShrink:0,display:'flex',flexDirection:'column',gap:10 },
  svcCard:    { background:'#0f1520',border:'1px solid #1e2d42',borderRadius:10,padding:12 },
  svcHead:    { display:'flex',alignItems:'center',gap:7,marginBottom:8 },
  svcDot:     { width:7,height:7,borderRadius:'50%',flexShrink:0 },
  svcName:    { fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.07em',flex:1 },
  svcPort:    { fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'#4a5568' },
  logWrap:    { background:'#0f1520',border:'1px solid #1e2d42',borderRadius:10,padding:12,flex:1,display:'flex',flexDirection:'column',minHeight:100 },
  logTitle:   { fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'#4a5568',letterSpacing:'.15em',textTransform:'uppercase',marginBottom:8 },
  logEntry:   { fontFamily:'JetBrains Mono,monospace',fontSize:10,display:'flex',gap:6,padding:'3px 0',borderBottom:'1px solid #2a3a4e' },
  ctrls:      { display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',width:'100%',maxWidth:980,marginTop:14 },
  btnSm:      { fontFamily:'JetBrains Mono,monospace',fontSize:11,padding:'6px 14px',borderRadius:7,border:'1px solid #1e2d42',background:'#0f1520',color:'#e2e8f0',cursor:'pointer',letterSpacing:'.04em',transition:'border-color .2s,color .2s' },
  btnActive:  { borderColor:'#00d4ff',color:'#00d4ff' },
}
