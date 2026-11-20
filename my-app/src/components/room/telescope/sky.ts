import { TELESCOPE_STEPS as STEPS } from '../../../../lib/telescope'

/*
 * Everything the telescope draws, on a 2D canvas: the constellation of my path, one celestial
 * object per step, and the journey from one object to the next. Sizes are fractions of the
 * eyepiece (S), so the drawings scale with it.
 */

type V2 = [number, number]
const rnd = (a: number, b: number) => a + Math.random() * (b - a)
const TAU = Math.PI * 2

// --- fixed data, drawn once at random so every visit looks a little different ---
const FIELD = Array.from({ length: 220 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.2, t: Math.random() * 6 }))

const PIXELS = (() => {
    const cells: Array<{ x: number; y: number; r: number; t: number }> = []
    const R = 9
    for (let y = -R; y <= R; y++)
        for (let x = -R; x <= R; x++) {
            const d = Math.abs(x) * Math.abs(y)
            const r = Math.hypot(x, y)
            if ((d <= 2 && r <= R) || r <= 3.2) cells.push({ x, y, r, t: Math.random() * 6 })
        }
    return cells
})()

const CITIES: V2[] = [[48.9, 2.3], [40.7, -74], [35.7, 139.7], [-33.9, 151.2], [51.5, -0.1], [1.35, 103.8], [-23.5, -46.6], [33.6, -7.6], [55.7, 37.6], [19.4, -99.1]]
const ARCS: V2[] = [[0, 1], [0, 2], [4, 5], [0, 7], [1, 6], [2, 3], [8, 5], [9, 1], [7, 6]]

const HEAT = Array.from({ length: 60 }, () => ({ a: rnd(-Math.PI / 2 + 0.15, Math.PI / 2 - 0.15), p: Math.random(), v: rnd(0.15, 0.35) }))
const LANDS: Array<[number, number, number, number, number]> = [[-0.55, -0.45, 0.32, 0.2, 0.4], [-0.35, 0.1, 0.22, 0.34, -0.3], [-0.75, 0.25, 0.14, 0.22, 0.2], [-0.2, -0.75, 0.2, 0.1, 0], [-0.6, 0.7, 0.25, 0.12, 0.3]]

// puffs of the cloud: x, y, radius around its centre; every puff ends at the same height (a flat base)
type Puff = [number, number, number]
const PUFFS: Puff[] = [[-0.2, 0, 0.1], [-0.09, -0.06, 0.14], [0.05, -0.1, 0.16], [0.18, -0.03, 0.12], [0.27, 0.02, 0.08], [-0.28, 0.04, 0.06], [0, -0.02, 0.12], [0.13, 0, 0.1]]
const SMALL_PUFFS: Puff[] = [[-0.06, 0, 0.045], [0.02, -0.02, 0.06], [0.08, 0, 0.045]]
const HUES = [268, 300, 322, 205, 232, 285]
type Gas = { x: number; y: number; r: number; h: number; s: number }
// the gas of the nebula: coloured glows inside each puff, so the cloud is made of light
const gasOf = (puffs: Puff[]): Gas[] =>
    puffs.flatMap(([x, y, r], i) =>
        Array.from({ length: 7 }, (_, j) => {
            const a = rnd(0, TAU)
            const d = rnd(0, r * 0.55)
            return { x: x + Math.cos(a) * d, y: Math.min(y + Math.sin(a) * d, 0.06), r: r * rnd(0.55, 1.05), h: HUES[(i + j) % HUES.length], s: rnd(0, 6) }
        })
    )
const GAS = gasOf(PUFFS)
const GAS_SMALL = gasOf(SMALL_PUFFS)
const DUST: Puff[] = [[-0.12, -0.02, 0.07], [0.1, -0.08, 0.05], [0.2, 0.02, 0.04]]
const BIRTHS = Array.from({ length: 8 }, () => ({ x: rnd(-0.22, 0.22), y: rnd(-0.12, 0.05), p: Math.random() * 3 }))

export class Sky {
    private ctx: CanvasRenderingContext2D
    /** Size of the eyepiece, in CSS pixels. */
    S = 0
    /** When the constellation started to draw itself. */
    t0 = 0
    /** Set while several objects share the view: the scenes then skip their own sky. */
    private noBg = false
    private streaks = Array.from({ length: 160 }, () => ({ a: rnd(0, TAU), d: rnd(0.02, 0.7), r: rnd(0.4, 1.3) }))
    readonly scenes: Array<(t: number) => void>

    constructor(private canvas: HTMLCanvasElement, private reduced: boolean) {
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D is not available')
        this.ctx = ctx
        this.scenes = [this.pixelStar, this.globe, this.earthInside, this.launch, this.nebula, this.unknown].map((f) => f.bind(this))
    }

    resize() {
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        this.S = this.canvas.clientWidth
        this.canvas.width = this.canvas.height = Math.round(this.S * dpr)
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    /** A dark veil that fades out: a quick refocus between two views. */
    veil(k: number) {
        if (this.reduced || k >= 1) return
        this.ctx.fillStyle = `rgba(3,4,10,${1 - Math.max(0, k)})`
        this.ctx.fillRect(0, 0, this.S, this.S)
    }

    private background(t: number, k = 1) {
        if (this.noBg) return
        const { ctx, S } = this
        ctx.fillStyle = '#03040a'
        ctx.fillRect(0, 0, S, S)
        ctx.fillStyle = '#fff'
        FIELD.forEach((f) => {
            ctx.globalAlpha = k * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t / 800 + f.t)))
            ctx.beginPath()
            ctx.arc(f.x * S, f.y * S, f.r, 0, TAU)
            ctx.fill()
        })
        ctx.globalAlpha = 1
    }

    /** The whole path, drawn star by star. */
    constellation(t: number) {
        const { ctx, S } = this
        this.background(t)
        const reveal = this.reduced ? 99 : (t - this.t0) / 450
        const P = (i: number): V2 => [(STEPS[i].x / 100) * S, (STEPS[i].y / 100) * S]
        for (let i = 0; i < STEPS.length - 1; i++) {
            const k = Math.max(0, Math.min(1, reveal - i - 0.6))
            if (!k) continue
            const [x1, y1] = P(i)
            const [x2, y2] = P(i + 1)
            const dashed = STEPS[i + 1].status === 'next'
            ctx.strokeStyle = dashed ? '#67e8f9' : '#a5b4fc'
            ctx.globalAlpha = dashed ? 0.55 : 0.7
            ctx.lineWidth = 1.6
            ctx.setLineDash(dashed ? [5, 6] : [])
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k)
            ctx.stroke()
        }
        ctx.setLineDash([])
        STEPS.forEach((s, i) => {
            const k = Math.max(0, Math.min(1, reveal - i))
            if (!k) return
            const [x, y] = P(i)
            if (s.status === 'next') {
                // a faint, blurry star: not there yet
                ctx.globalAlpha = k * 0.5
                ctx.filter = 'blur(4px)'
                ctx.fillStyle = '#a5f3fc'
                ctx.beginPath()
                ctx.arc(x, y, 9, 0, TAU)
                ctx.fill()
                ctx.filter = 'none'
                return
            }
            const now = s.status === 'now'
            const pulse = now && !this.reduced ? 1 + 0.35 * Math.sin(t / 260) : 1
            if (now) {
                ctx.globalAlpha = k * 0.35
                ctx.fillStyle = '#fcd34d'
                ctx.beginPath()
                ctx.arc(x, y, 14 * pulse, 0, TAU)
                ctx.fill()
            }
            ctx.globalAlpha = k
            ctx.shadowColor = now ? '#fcd34d' : '#c7d2fe'
            ctx.shadowBlur = 14
            ctx.fillStyle = now ? '#fde68a' : '#e0e7ff'
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, TAU)
            ctx.fill()
            ctx.shadowBlur = 0
        })
        ctx.globalAlpha = 1
    }

    /**
     * The journey: stars rush past and the objects come from the depth, grow and pass by.
     * `pos` is a step index (fractional while travelling), `speed` in steps per second.
     */
    journey(t: number, pos: number, speed: number, dt: number) {
        const { ctx, S } = this
        ctx.fillStyle = '#03040a'
        ctx.fillRect(0, 0, S, S)
        ctx.strokeStyle = '#fff'
        this.streaks.forEach((s) => {
            s.d += this.reduced ? 0 : Math.abs(speed) * dt * 0.9 * s.d + 0.0006
            if (s.d > 0.75) {
                s.d = 0.02
                s.a = rnd(0, TAU)
            }
            const x = S / 2 + Math.cos(s.a) * s.d * S
            const y = S / 2 + Math.sin(s.a) * s.d * S
            const len = Math.min(40, Math.abs(speed) * 25 * s.d)
            ctx.globalAlpha = Math.min(1, s.d * 2)
            ctx.lineWidth = s.r
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x - Math.cos(s.a) * len, y - Math.sin(s.a) * len)
            ctx.stroke()
        })
        ctx.globalAlpha = 1
        // far objects first, the one passing by last
        STEPS.map((_, i) => i)
            .filter((i) => i - pos < 1.8 && i - pos > -0.55)
            .sort((a, b) => b - a)
            .forEach((i) => {
                const d = i - pos
                const scale = d >= 0 ? 1 / (1 + d * 2.4) : 1 - d * 2.6
                const alpha = d >= 0 ? Math.min(1, (1.8 - d) / 0.6) : Math.max(0, 1 + d * 2)
                ctx.save()
                ctx.globalAlpha = alpha
                ctx.translate(S / 2, S / 2)
                ctx.scale(scale, scale)
                ctx.translate(-S / 2, -S / 2)
                this.noBg = true
                this.scenes[i](t)
                this.noBg = false
                ctx.restore()
            })
        ctx.globalAlpha = 1
    }

    // 1. front-end: a star drawn with pixels
    private pixelStar(t: number) {
        const { ctx, S } = this
        this.background(t, 0.6)
        const c = S / 2
        const size = S / 30
        PIXELS.forEach((p) => {
            const tw = 0.65 + 0.35 * Math.sin(t / 300 + p.t)
            ctx.globalAlpha = Math.max(0.15, 1 - p.r / 10) * tw
            ctx.fillStyle = p.r < 2 ? '#fff7d6' : p.r < 5 ? '#fde68a' : '#a5b4fc'
            ctx.fillRect(c + p.x * size - size / 2 + 0.5, c + p.y * size - size / 2 + 0.5, size - 1, size - 1)
        })
        // a few stray pixels around, like a screen waking up
        for (let i = 0; i < 14; i++) {
            const a = i * 2.4 + t / 3000
            const r = S * (0.22 + (i % 3) * 0.05)
            ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t / 200 + i)
            ctx.fillStyle = ['#f472b6', '#67e8f9', '#a3e635'][i % 3]
            ctx.fillRect(c + Math.cos(a) * r, c + Math.sin(a) * r, size * 0.6, size * 0.6)
        }
        ctx.globalAlpha = 1
    }

    // 2. maps & 3D: the Earth as a turning wireframe globe, with data arcs between cities
    private globe(t: number) {
        const { ctx, S } = this
        this.background(t, 0.6)
        const c = S / 2
        const R = S * 0.3
        const rot = this.reduced ? 0.6 : t / 6000
        const tilt = 0.35
        const proj = (lat: number, lon: number, h = 1): [number, number, number] => {
            const la = (lat * Math.PI) / 180
            const lo = (lon * Math.PI) / 180 + rot
            const x = Math.cos(la) * Math.sin(lo)
            const y = Math.sin(la)
            const z = Math.cos(la) * Math.cos(lo)
            const y2 = y * Math.cos(tilt) - z * Math.sin(tilt)
            const z2 = y * Math.sin(tilt) + z * Math.cos(tilt)
            return [c + x * R * h, c - y2 * R * h, z2]
        }
        const g = ctx.createRadialGradient(c - R * 0.3, c - R * 0.3, R * 0.1, c, c, R)
        g.addColorStop(0, '#1e3a8a')
        g.addColorStop(1, '#0b1029')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(c, c, R, 0, TAU)
        ctx.fill()
        // only the visible side of each line is drawn
        const line = (pts: Array<[number, number, number]>) => {
            let on = false
            ctx.beginPath()
            pts.forEach(([x, y, z]) => {
                if (z > 0) {
                    if (on) ctx.lineTo(x, y)
                    else ctx.moveTo(x, y)
                    on = true
                } else on = false
            })
            ctx.stroke()
        }
        ctx.lineWidth = 1
        ctx.strokeStyle = '#60a5fa'
        ctx.globalAlpha = 0.35
        for (let lat = -60; lat <= 60; lat += 30) line(Array.from({ length: 73 }, (_, i) => proj(lat, i * 5)))
        for (let lon = 0; lon < 360; lon += 20) line(Array.from({ length: 37 }, (_, i) => proj(-90 + i * 5, lon)))
        // arcs lifted above the surface, like DeckGL's ArcLayer
        ARCS.forEach(([a, b], i) => {
            const [la1, lo1] = CITIES[a]
            const [la2, lo2] = CITIES[b]
            const N = 40
            const prog = this.reduced ? 1 : (t / 2200 + i * 0.23) % 1.4
            const pts: Array<[number, number, number]> = []
            for (let k = 0; k <= N * Math.min(1, prog); k++) {
                const u = k / N
                pts.push(proj(la1 + (la2 - la1) * u, lo1 + (lo2 - lo1) * u, 1 + 0.25 * Math.sin(Math.PI * u)))
            }
            ctx.globalAlpha = prog > 1 ? Math.max(0, 1 - (prog - 1) * 2.5) : 0.9
            ctx.strokeStyle = i % 2 ? '#f472b6' : '#fcd34d'
            ctx.lineWidth = 1.6
            line(pts)
        })
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fde68a'
        CITIES.forEach(([la, lo]) => {
            const [x, y, z] = proj(la, lo)
            if (z <= 0) return
            ctx.beginPath()
            ctx.arc(x, y, 2.4, 0, TAU)
            ctx.fill()
        })
    }

    // 3. back-end: the same planet, cut open down to its core
    private earthInside(t: number) {
        const { ctx, S } = this
        this.background(t, 0.5)
        const c = S / 2
        const R = S * 0.3
        const spin = this.reduced ? 0 : t / 9000
        const air = ctx.createRadialGradient(c, c, R * 0.95, c, c, R * 1.25)
        air.addColorStop(0, '#60a5fa66')
        air.addColorStop(1, '#60a5fa00')
        ctx.fillStyle = air
        ctx.beginPath()
        ctx.arc(c, c, R * 1.25, 0, TAU)
        ctx.fill()
        // left half: the surface we know
        ctx.save()
        ctx.beginPath()
        ctx.arc(c, c, R, Math.PI / 2, Math.PI * 1.5)
        ctx.closePath()
        ctx.clip()
        const sea = ctx.createRadialGradient(c - R * 0.4, c - R * 0.3, 0, c, c, R)
        sea.addColorStop(0, '#3b82f6')
        sea.addColorStop(1, '#1e3a8a')
        ctx.fillStyle = sea
        ctx.fillRect(c - R, c - R, R, R * 2)
        LANDS.forEach(([x, y, w, h, a], i) => {
            const dx = ((x + spin * 0.3 + 1) % 1.1) - 1
            ctx.fillStyle = i % 2 ? '#4d7c0f' : '#65a30d'
            ctx.beginPath()
            ctx.ellipse(c + dx * R, c + y * R, w * R, h * R, a, 0, TAU)
            ctx.fill()
        })
        const shade = ctx.createLinearGradient(c - R, 0, c, 0)
        shade.addColorStop(0, '#0008')
        shade.addColorStop(1, '#0000')
        ctx.fillStyle = shade
        ctx.fillRect(c - R, c - R, R, R * 2)
        ctx.restore()
        // right half: crust, mantle, outer core, inner core
        const layers: Array<[number, string]> = [[1, '#7c4a1e'], [0.95, '#b91c1c'], [0.8, '#dc2626'], [0.55, '#f97316'], [0.38, '#fbbf24']]
        layers.forEach(([k, col]) => {
            ctx.fillStyle = col
            ctx.beginPath()
            ctx.moveTo(c, c - R * k)
            ctx.arc(c, c, R * k, -Math.PI / 2, Math.PI / 2)
            ctx.closePath()
            ctx.fill()
        })
        ctx.fillStyle = '#fff7d6'
        ctx.shadowColor = '#fde68a'
        ctx.shadowBlur = this.reduced ? 22 : 22 + 10 * Math.sin(t / 300)
        ctx.beginPath()
        ctx.moveTo(c, c - R * 0.2)
        ctx.arc(c, c, R * 0.2, -Math.PI / 2, Math.PI / 2)
        ctx.closePath()
        ctx.fill()
        ctx.shadowBlur = 0
        // heat rising from the core: the work nobody sees
        ctx.fillStyle = '#fef3c7'
        HEAT.forEach((f) => {
            if (!this.reduced) f.p = (f.p + f.v * 0.012) % 1
            const r = R * (0.2 + 0.75 * f.p)
            ctx.globalAlpha = (1 - f.p) * 0.9
            ctx.beginPath()
            ctx.arc(c + Math.cos(f.a) * r, c + Math.sin(f.a) * r, 1.8, 0, TAU)
            ctx.fill()
        })
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#00000055'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(c, c - R)
        ctx.lineTo(c, c + R)
        ctx.stroke()
        ctx.font = '600 11px system-ui, sans-serif'
        ctx.fillStyle = '#78350f'
        ctx.textAlign = 'center'
        ctx.fillText('core', c + R * 0.1, c + 4)
    }

    // 4. docker & CI/CD: containers stacked, the checks pass, lift-off
    private launch(t: number) {
        const { ctx, S } = this
        this.background(t, 0.6)
        const cyc = this.reduced ? 3.2 : (t / 1000) % 6
        const c = S / 2
        const base = S * 0.74
        const lift = Math.max(0, cyc - 3.4)
        const y0 = base - lift * lift * S * 0.09
        ctx.fillStyle = '#334155'
        ctx.fillRect(c - S * 0.2, base + 2, S * 0.4, 6)
        if (cyc > 2.8) {
            const f = 1 + 0.3 * Math.sin(t / 40)
            const g = ctx.createLinearGradient(0, y0, 0, y0 + 60 * f)
            g.addColorStop(0, '#fde68a')
            g.addColorStop(1, '#f9731600')
            ctx.fillStyle = g
            ctx.beginPath()
            ctx.moveTo(c - 12, y0)
            ctx.lineTo(c + 12, y0)
            ctx.lineTo(c, y0 + 60 * f)
            ctx.fill()
        }
        const W = S * 0.1
        const H = S * 0.075
        ;['#38bdf8', '#818cf8', '#34d399'].forEach((col, i) => {
            const k = Math.max(0, Math.min(1, cyc * 1.6 - i * 0.55))
            if (!k) return
            const y = y0 - (i + 1) * H - (1 - k) * 40
            ctx.globalAlpha = k
            ctx.fillStyle = col
            ctx.fillRect(c - W / 2, y, W, H - 3)
            ctx.fillStyle = '#0f172a55'
            for (let r = 0; r < 3; r++) ctx.fillRect(c - W / 2 + 4, y + 5 + (r * (H - 8)) / 3, W - 8, 2)
        })
        ctx.globalAlpha = Math.min(1, Math.max(0, cyc * 1.6 - 1.8))
        const top = y0 - 3 * H
        ctx.fillStyle = '#e2e8f0'
        ctx.beginPath()
        ctx.moveTo(c - W / 2, top)
        ctx.lineTo(c + W / 2, top)
        ctx.lineTo(c, top - H * 1.2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.font = '600 12px system-ui, sans-serif'
        ctx.textAlign = 'left'
        ;['tests', 'build', 'deploy'].forEach((w, i) => {
            const ok = cyc > 1.2 + i * 0.6
            ctx.fillStyle = ok ? '#34d399' : '#64748b'
            ctx.fillText(`${ok ? '✓' : '○'} ${w}`, S * 0.22, S * 0.36 + i * 18)
        })
    }

    private cloud(cx: number, cy: number, puffs: Puff[], flatY: number, light: { x: number; y: number }, gas: Gas[], t: number, dust?: Puff[]) {
        const { ctx, S } = this
        ctx.save()
        const p = new Path2D()
        puffs.forEach(([x, y, r]) => {
            p.moveTo(cx + (x + r) * S, cy + y * S)
            p.arc(cx + x * S, cy + y * S, r * S, 0, TAU)
        })
        const x0 = Math.min(...puffs.map(([x, , r]) => x - r * 0.6))
        const x1 = Math.max(...puffs.map(([x, , r]) => x + r * 0.6))
        p.roundRect(cx + x0 * S, cy, (x1 - x0) * S, flatY * S, (flatY * S) / 2)
        // the silhouette keeps the cloud shape readable
        const body = ctx.createLinearGradient(0, cy - 0.26 * S, 0, cy + flatY * S)
        body.addColorStop(0, '#8b6fe0')
        body.addColorStop(0.5, '#5b3db0')
        body.addColorStop(1, '#2a1658')
        ctx.filter = 'blur(3px)'
        ctx.shadowColor = '#c4b5fd'
        ctx.shadowBlur = 30
        ctx.fillStyle = body
        ctx.fill(p)
        ctx.filter = 'none'
        ctx.shadowBlur = 0
        // the glowing gas, light added on light
        ctx.globalCompositeOperation = 'lighter'
        gas.forEach((g) => {
            const w = this.reduced ? 0 : Math.sin(t / 2500 + g.s) * 0.012
            const x = cx + (g.x + w) * S
            const y = cy + (g.y + w * 0.5) * S
            const r = g.r * S
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
            grad.addColorStop(0, `hsla(${g.h},90%,68%,.2)`)
            grad.addColorStop(0.6, `hsla(${g.h},90%,55%,.08)`)
            grad.addColorStop(1, `hsla(${g.h},90%,50%,0)`)
            ctx.fillStyle = grad
            ctx.beginPath()
            ctx.arc(x, y, r, 0, TAU)
            ctx.fill()
        })
        // the bright heart where stars are born
        const hx = cx + light.x
        const hy = cy + light.y
        const heart = ctx.createRadialGradient(hx, hy, 0, hx, hy, S * 0.16)
        heart.addColorStop(0, '#fff3c4aa')
        heart.addColorStop(0.4, '#f9a8d444')
        heart.addColorStop(1, '#f9a8d400')
        ctx.fillStyle = heart
        ctx.beginPath()
        ctx.arc(hx, hy, S * 0.16, 0, TAU)
        ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
        if (dust) {
            ctx.filter = 'blur(8px)'
            ctx.fillStyle = '#05060c88'
            dust.forEach(([x, y, r]) => {
                ctx.beginPath()
                ctx.ellipse(cx + x * S, cy + y * S, r * S * 1.6, r * S * 0.45, -0.3, 0, TAU)
                ctx.fill()
            })
            ctx.filter = 'none'
        }
        ctx.restore()
    }

    // 5. cloud: a nebula shaped like a cloud, where new stars are born
    private nebula(t: number) {
        const { ctx, S } = this
        this.background(t, 0.8)
        const bob = this.reduced ? 0 : Math.sin(t / 1600) * S * 0.012
        const cx = S / 2
        const cy = S * 0.5 + bob
        const drift = this.reduced ? 0 : ((t / 90) % (S * 1.6)) - S * 0.3
        ctx.globalAlpha = 0.5
        this.cloud(S * 1.1 - drift, S * 0.28, SMALL_PUFFS, 0.04, { x: 0, y: 0 }, GAS_SMALL, t)
        ctx.globalAlpha = 1
        const pulse = this.reduced ? 0 : Math.sin(t / 900) * S * 0.04
        this.cloud(cx, cy, PUFFS, 0.1, { x: S * 0.03 + pulse, y: -S * 0.05 }, GAS, t, DUST)
        ctx.fillStyle = '#fff7d6'
        ctx.shadowColor = '#fbbf24'
        BIRTHS.forEach((b) => {
            const p = this.reduced ? 0.5 : ((t / 1000 + b.p) % 3) / 3
            const a = Math.sin(Math.PI * p)
            ctx.globalAlpha = a
            ctx.shadowBlur = 14
            ctx.beginPath()
            ctx.arc(cx + b.x * S, cy + b.y * S, 1.5 + 2.5 * a, 0, TAU)
            ctx.fill()
        })
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
    }

    // 6. next: not in focus yet, the telescope keeps trying
    private unknown(t: number) {
        const { ctx, S } = this
        this.background(t, 0.5)
        const c = S / 2
        const blur = this.reduced ? 8 : 7 + 4 * Math.sin(t / 900)
        ctx.filter = `blur(${blur}px)`
        ctx.globalAlpha = 0.8
        ctx.fillStyle = '#a5f3fc'
        ctx.beginPath()
        ctx.arc(c, c, S * 0.06, 0, TAU)
        ctx.fill()
        ctx.globalAlpha = 0.4
        ctx.fillStyle = '#c4b5fd'
        ctx.beginPath()
        ctx.arc(c + S * 0.12, c - S * 0.06, S * 0.035, 0, TAU)
        ctx.fill()
        ctx.fillStyle = '#f9a8d4'
        ctx.beginPath()
        ctx.arc(c - S * 0.1, c + S * 0.08, S * 0.03, 0, TAU)
        ctx.fill()
        ctx.filter = 'none'
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = '#67e8f9'
        ctx.setLineDash([4, 8])
        ctx.lineWidth = 1.5
        ctx.save()
        ctx.translate(c, c)
        ctx.rotate(this.reduced ? 0 : t / 3000)
        ctx.beginPath()
        ctx.arc(0, 0, S * 0.2, 0, TAU)
        ctx.stroke()
        ctx.restore()
        ctx.setLineDash([])
        ctx.font = '600 28px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#e0f2fe'
        ctx.globalAlpha = 0.7
        ctx.fillText('?', c, c + 10)
        ctx.globalAlpha = 1
    }
}
