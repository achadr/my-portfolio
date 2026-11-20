"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { careerPath } from '../../../lib/content'
import { projectsData } from '../../../lib/data'
import { LAND, project } from '../../../lib/geo'

export type RoomTarget = 'projects' | 'skills' | 'career' | 'contact' | 'guitar' | 'cosmos' | 'games'
type V3 = [number, number, number]

/** Camera positions: where to stand and what to look at for each object. */
const PRESETS: Record<'home' | RoomTarget, { pos: V3; look: V3 }> = {
    home: { pos: [6.4, 5, 7.4], look: [0, 1.9, -1.6] },
    projects: { pos: [0.8, 2.4, 0.6], look: [-0.3, 1.95, -3.1] },
    skills: { pos: [-1.2, 2.3, 0.9], look: [-1.6, 1.3, -2.5] },
    career: { pos: [3.1, 3.2, 0.9], look: [3.1, 3.2, -3.95] },
    guitar: { pos: [-2.7, 2.45, 1.3], look: [-3, 2.2, -3.9] },
    cosmos: { pos: [-2.1, 2.1, 2.0], look: [-3.9, 1.6, 0.2] },
    games: { pos: [1.8, 2.1, 0.6], look: [1.3, 1.2, -2.3] },
    contact: { pos: [1.0, 2.25, 0.0], look: [0.75, 1.1, -2.1] },
}
const HOME_NARROW: V3 = [8.8, 6.4, 9.8]

const HOTSPOTS: Array<{ id: RoomTarget; label: string; pos: V3 }> = [
    { id: 'projects', label: 'Projects', pos: [-0.3, 2.75, -3.1] },
    { id: 'skills', label: 'Skills', pos: [-1.6, 2.1, -2.5] },
    { id: 'career', label: 'Career', pos: [3.1, 4.3, -3.9] },
    { id: 'guitar', label: 'Guitar', pos: [-3, 3.3, -3.8] },
    { id: 'cosmos', label: 'Cosmos', pos: [-3.8, 2.4, 0.3] },
    { id: 'games', label: 'Games', pos: [1.3, 1.9, -2.3] },
    { id: 'contact', label: 'Contact', pos: [0.6, 1.55, -1.95] },
]

const PROJECT_COLORS = ['#ff6b8a', '#7a8cff', '#ff8f6b', '#5fd6b0', '#e4b5ff']

/* ---------- small helpers ---------- */

function useCanvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
    return useMemo(() => {
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const g = c.getContext('2d')
        if (g) draw(g, w, h)
        const t = new THREE.CanvasTexture(c)
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 4
        return t
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}

type PartProps = { pos?: V3; rot?: V3; color: string; rough?: number; metal?: number; shadow?: boolean }

function B({ size, pos, rot, color, rough = 0.7, metal = 0, shadow = true }: PartProps & { size: V3 }) {
    return (
        <mesh position={pos} rotation={rot} castShadow={shadow} receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
        </mesh>
    )
}
function Cyl({ r1, r2, h, pos, rot, color, rough = 0.7, metal = 0, seg = 16 }: PartProps & { r1: number; r2: number; h: number; seg?: number }) {
    return (
        <mesh position={pos} rotation={rot} castShadow receiveShadow>
            <cylinderGeometry args={[r1, r2, h, seg]} />
            <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
        </mesh>
    )
}
function Sph({ r, pos, scale, color, rough = 0.6 }: { r: number; pos: V3; scale?: V3; color: string; rough?: number }) {
    return (
        <mesh position={pos} scale={scale} castShadow receiveShadow>
            <sphereGeometry args={[r, 20, 14]} />
            <meshStandardMaterial color={color} roughness={rough} />
        </mesh>
    )
}
/** A cylinder joining two points (telescope legs). */
function Rod({ a, b, r, color }: { a: V3; b: V3; r: number; color: string }) {
    const { position, quaternion, len } = useMemo(() => {
        const A = new THREE.Vector3(...a)
        const Bv = new THREE.Vector3(...b)
        const d = Bv.clone().sub(A)
        const length = d.length()
        return {
            position: A.clone().add(Bv).multiplyScalar(0.5).toArray() as V3,
            quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()),
            len: length,
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <mesh position={position} quaternion={quaternion} castShadow>
            <cylinderGeometry args={[r, r, len, 8]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.35} />
        </mesh>
    )
}
/** Invisible (but clickable) sphere that makes small objects easy to hit. */
function Hit({ pos, r }: { pos: V3; r: number }) {
    return (
        <mesh position={pos}>
            <sphereGeometry args={[r, 10, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
    )
}

type Api = {
    setHover: (id: RoomTarget | null) => void
    onSelect: (id: RoomTarget) => void
    /** True when the last press was a drag (turning the camera), not a click. */
    wasDrag: () => boolean
    refs: React.MutableRefObject<Partial<Record<RoomTarget, THREE.Group | null>>>
}
function Interactive({ id, api, children }: { id: RoomTarget; api: Api; children: React.ReactNode }) {
    return (
        <group
            ref={(el) => {
                api.refs.current[id] = el
            }}
            onPointerOver={(e) => {
                e.stopPropagation()
                api.setHover(id)
            }}
            onPointerOut={() => api.setHover(null)}
            onClick={(e) => {
                e.stopPropagation()
                if (!api.wasDrag()) api.onSelect(id)
            }}
        >
            {children}
        </group>
    )
}

/* ---------- the guitar ---------- */

/** An acoustic guitar: extruded figure-eight body with a sunburst top, sound hole, bridge, fretted neck, headstock and strings. */
function Guitar() {
    const { geometry, sunburst } = useMemo(() => {
        // body outline (x = width, y = height), mirrored left/right
        const s = new THREE.Shape()
        s.moveTo(0, 0.95)
        s.bezierCurveTo(0.35, 0.95, 0.6, 0.8, 0.58, 0.5)
        s.bezierCurveTo(0.56, 0.25, 0.36, 0.22, 0.4, -0.05)
        s.bezierCurveTo(0.44, -0.3, 0.82, -0.25, 0.8, -0.55)
        s.bezierCurveTo(0.78, -0.92, 0.35, -0.97, 0, -0.97)
        s.bezierCurveTo(-0.35, -0.97, -0.78, -0.92, -0.8, -0.55)
        s.bezierCurveTo(-0.82, -0.25, -0.44, -0.3, -0.4, -0.05)
        s.bezierCurveTo(-0.36, 0.22, -0.56, 0.25, -0.58, 0.5)
        s.bezierCurveTo(-0.6, 0.8, -0.35, 0.95, 0, 0.95)
        const geo = new THREE.ExtrudeGeometry(s, {
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.03,
            bevelSegments: 3,
            curveSegments: 40,
        })
        // sunburst top, centred on the sound hole
        const c = document.createElement('canvas')
        c.width = c.height = 512
        const g = c.getContext('2d')
        if (g) {
            const gr = g.createRadialGradient(256, 230, 10, 256, 260, 340)
            gr.addColorStop(0, '#f4bf6e')
            gr.addColorStop(0.45, '#d98a3a')
            gr.addColorStop(1, '#4a2410')
            g.fillStyle = gr
            g.fillRect(0, 0, 512, 512)
        }
        const tex = new THREE.CanvasTexture(c)
        tex.colorSpace = THREE.SRGBColorSpace
        // the extruded caps use the outline coordinates as UVs: fit the texture to the outline's bounds
        tex.repeat.set(1 / 1.7, 1 / 2.0)
        tex.offset.set(0.85 / 1.7, 1.0 / 2.0)
        return { geometry: geo, sunburst: tex }
    }, [])

    const fretboard = '#1c120c'
    const gold = '#d9b45a'
    const fretYs = useMemo(() => Array.from({ length: 8 }, (_, i) => 2.37 - 3.5 * (1 - Math.pow(2, -(i + 1) / 12))), [])

    return (
        <group position={[-3, 1.7, -3.85]} rotation={[0, 0, 0.06]} scale={0.9}>
            {/* body */}
            <mesh geometry={geometry} position={[0, 0, -0.12]} castShadow receiveShadow>
                <meshStandardMaterial attach="material-0" map={sunburst} roughness={0.35} />
                <meshStandardMaterial attach="material-1" color="#7a3d14" roughness={0.45} />
            </mesh>
            {/* sound hole and rosette */}
            <mesh position={[0, 0.08, 0.116]}>
                <circleGeometry args={[0.2, 40]} />
                <meshBasicMaterial color="#0d0704" />
            </mesh>
            <mesh position={[0, 0.08, 0.117]}>
                <ringGeometry args={[0.2, 0.235, 40]} />
                <meshBasicMaterial color="#2a1608" />
            </mesh>
            <mesh position={[0, 0.08, 0.117]}>
                <ringGeometry args={[0.25, 0.265, 40]} />
                <meshBasicMaterial color="#e8d6a8" />
            </mesh>
            {/* bridge */}
            <B size={[0.52, 0.07, 0.05]} pos={[0, -0.52, 0.135]} color="#2a1608" rough={0.5} />
            <B size={[0.42, 0.018, 0.02]} pos={[0, -0.49, 0.162]} color="#f0e6cc" rough={0.4} />
            {/* neck, fretboard, nut, frets */}
            <B size={[0.17, 1.5, 0.1]} pos={[0, 1.65, 0.06]} color="#3b2416" rough={0.5} />
            <B size={[0.15, 1.45, 0.025]} pos={[0, 1.68, 0.12]} color={fretboard} rough={0.5} />
            <B size={[0.16, 0.022, 0.035]} pos={[0, 2.39, 0.135]} color="#efe6cf" rough={0.4} />
            {fretYs.map((y, i) => (
                <B key={i} size={[0.16, 0.012, 0.012]} pos={[0, y, 0.135]} color="#d9d6f0" metal={0.7} rough={0.3} shadow={false} />
            ))}
            {[2, 4, 6].map((i) => (
                <Cyl key={i} r1={0.016} r2={0.016} h={0.01} pos={[0, (fretYs[i - 1] + fretYs[i]) / 2, 0.135]} rot={[Math.PI / 2, 0, 0]} color="#e8e6f2" seg={12} />
            ))}
            {/* headstock and tuning pegs */}
            <B size={[0.27, 0.46, 0.06]} pos={[0, 2.62, 0.05]} rot={[-0.12, 0, 0]} color="#2a1608" rough={0.5} />
            {[2.5, 2.62, 2.74].map((y) => (
                <React.Fragment key={y}>
                    <Cyl r1={0.018} r2={0.018} h={0.1} pos={[-0.15, y, 0.07]} rot={[0, 0, Math.PI / 2]} color={gold} metal={0.7} rough={0.3} seg={10} />
                    <Cyl r1={0.018} r2={0.018} h={0.1} pos={[0.15, y, 0.07]} rot={[0, 0, Math.PI / 2]} color={gold} metal={0.7} rough={0.3} seg={10} />
                </React.Fragment>
            ))}
            {/* strings, from the saddle to the nut */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <Rod key={i} a={[-0.1 + i * 0.04, -0.49, 0.172]} b={[-0.055 + i * 0.022, 2.38, 0.148]} r={0.0035} color="#e8e6f2" />
            ))}
        </group>
    )
}

/* ---------- the envelope (contact) ---------- */

/** A sealed letter with a stamp, lying on the desk. Opens the contact form. */
function Envelope() {
    const flap = useMemo(() => {
        const s = new THREE.Shape()
        s.moveTo(-0.21, 0.14)
        s.lineTo(0.21, 0.14)
        s.lineTo(0, 0)
        s.closePath()
        return s
    }, [])
    return (
        <group position={[0.75, 1.106, -2.1]} rotation={[0, 0.25, 0]} scale={1.25}>
            <B size={[0.42, 0.012, 0.28]} pos={[0, 0.006, 0]} color="#f4efe0" rough={0.8} />
            {/* flap (the triangle pointing at the viewer) */}
            <mesh position={[0, 0.0135, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                <shapeGeometry args={[flap]} />
                <meshStandardMaterial color="#e3dac1" roughness={0.8} />
            </mesh>
            {/* wax seal */}
            <Cyl r1={0.025} r2={0.028} h={0.006} pos={[0, 0.0165, 0.005]} color="#c0392b" rough={0.4} seg={20} />
            {/* stamp, top right of the back would be hidden, so it sits on the visible corner */}
            <B size={[0.06, 0.004, 0.075]} pos={[0.14, 0.014, 0.085]} rot={[0, 0.08, 0]} color="#ff8f6b" rough={0.6} shadow={false} />
            <B size={[0.04, 0.0045, 0.05]} pos={[0.14, 0.0145, 0.085]} rot={[0, 0.08, 0]} color="#fff4e6" rough={0.6} shadow={false} />
            {/* address lines */}
            <B size={[0.17, 0.0035, 0.007]} pos={[-0.06, 0.014, 0.075]} color="#3b3a55" rough={0.9} shadow={false} />
            <B size={[0.13, 0.0035, 0.007]} pos={[-0.08, 0.014, 0.1]} color="#3b3a55" rough={0.9} shadow={false} />
        </group>
    )
}

/* ---------- the room ---------- */

function Room({ api }: { api: Api }) {
    const floorTex = useCanvasTexture(512, 512, (g, w, h) => {
        const n = 8
        const pw = w / n
        for (let i = 0; i < n; i++) {
            g.fillStyle = `hsl(255,28%,${26 + ((i * 37) % 10)}%)`
            g.fillRect(i * pw, 0, pw - 2, h)
            g.fillStyle = 'rgba(0,0,0,.35)'
            g.fillRect(i * pw + pw - 2, 0, 2, h)
        }
    })
    useMemo(() => {
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping
        floorTex.repeat.set(3.2, 3.5)
    }, [floorTex])
    const wallTex = useCanvasTexture(256, 256, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, 0, h)
        gr.addColorStop(0, '#272a5c')
        gr.addColorStop(1, '#1b1d44')
        g.fillStyle = gr
        g.fillRect(0, 0, w, h)
        g.fillStyle = 'rgba(255,255,255,.02)'
        for (let i = 0; i < w; i += 32) g.fillRect(i, 0, 2, h)
    })
    const rugTex = useCanvasTexture(256, 256, (g, w, h) => {
        const gr = g.createRadialGradient(128, 128, 10, 128, 128, 126)
        gr.addColorStop(0, '#3a2f7a')
        gr.addColorStop(0.5, '#2a2360')
        gr.addColorStop(0.62, '#8f7cff')
        gr.addColorStop(0.68, '#2a2360')
        gr.addColorStop(1, '#1a1540')
        g.fillStyle = gr
        g.fillRect(0, 0, w, h)
    })
    const skyTex = useCanvasTexture(256, 180, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, 0, h)
        gr.addColorStop(0, '#03040c')
        gr.addColorStop(1, '#101842')
        g.fillStyle = gr
        g.fillRect(0, 0, w, h)
        for (let i = 0; i < 110; i++) {
            g.fillStyle = `rgba(225,225,255,${0.3 + ((i * 53) % 70) / 100})`
            g.fillRect(((i * 97) % 256), ((i * 61) % 180), 1 + (i % 3) * 0.6, 1 + (i % 3) * 0.6)
        }
        g.fillStyle = '#e8e6f2'
        g.beginPath()
        g.arc(200, 38, 13, 0, 6.3)
        g.fill()
        g.fillStyle = '#101842'
        g.beginPath()
        g.arc(206, 34, 12, 0, 6.3)
        g.fill()
    })
    const keysTex = useCanvasTexture(190, 60, (g, w, h) => {
        g.fillStyle = '#20203f'
        g.fillRect(0, 0, w, h)
        for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) {
            g.fillStyle = '#3a3a6c'
            g.fillRect(6 + c * 14, 6 + r * 13, 11, 10)
        }
    })
    const monitorTex = useCanvasTexture(336, 186, (g, w, h) => {
        g.fillStyle = '#0b0d22'
        g.fillRect(0, 0, w, h)
        g.fillStyle = '#16193a'
        g.fillRect(0, 0, w, 26)
        g.fillStyle = '#e8e6f2'
        g.font = 'bold 15px sans-serif'
        g.fillText('Projects', 12, 18)
        // One row per project, so the screen holds all of them (up to 5 at this size).
        const rows = projectsData.slice(0, 5)
        const rowH = Math.floor((h - 34) / rows.length)
        rows.forEach((p, i) => {
            const y = 32 + i * rowH
            g.fillStyle = '#12142e'
            g.fillRect(12, y, w - 24, rowH - 4)
            g.fillStyle = PROJECT_COLORS[i % PROJECT_COLORS.length]
            g.fillRect(12, y, 5, rowH - 4)
            g.fillStyle = '#e8e6f2'
            g.font = 'bold 12px sans-serif'
            g.fillText(p.title, 24, y + rowH / 2 + 2)
            g.fillStyle = '#9a98b4'
            g.font = '10px sans-serif'
            g.textAlign = 'right'
            g.fillText(p.tags.slice(0, 2).join(' · '), w - 20, y + rowH / 2 + 2)
            g.textAlign = 'left'
        })
    })
    const laptopTex = useCanvasTexture(172, 104, (g, w, h) => {
        g.fillStyle = '#0b0d22'
        g.fillRect(0, 0, w, h)
        g.strokeStyle = '#8f7cff'
        g.lineWidth = 2
        const pts: Array<[number, number]> = [[30, 22], [142, 22], [30, 82], [142, 82]]
        pts.forEach(([x, y]) => {
            g.beginPath()
            g.moveTo(86, 52)
            g.lineTo(x, y)
            g.stroke()
        })
        g.fillStyle = '#ffb86b'
        g.beginPath()
        g.arc(86, 52, 9, 0, 6.3)
        g.fill()
        pts.forEach(([x, y], i) => {
            g.fillStyle = ['#7a8cff', '#e4b5ff', '#5fd6b0', '#ffb86b'][i]
            g.beginPath()
            g.arc(x, y, 7, 0, 6.3)
            g.fill()
        })
    })
    const mapTex = useCanvasTexture(440, 540, (g, w, h) => {
        g.fillStyle = '#070a1c'
        g.fillRect(0, 0, w, h)
        LAND.forEach((ring) => {
            g.beginPath()
            ring.forEach(([lon, lat], i) => {
                const p = project(lat, lon)
                if (i) g.lineTo(p.x, p.y)
                else g.moveTo(p.x, p.y)
            })
            g.closePath()
            g.fillStyle = '#1d2350'
            g.fill()
            g.strokeStyle = '#3a4290'
            g.lineWidth = 2
            g.stroke()
        })
        const pts = careerPath.map((s) => {
            const p = project(s.lat, s.lon)
            return { x: p.x + (s.dx ?? 0), y: p.y + (s.dy ?? 0) }
        })
        g.strokeStyle = '#ffb86b'
        g.lineWidth = 4
        g.lineCap = 'round'
        for (let k = 0; k < pts.length - 1; k++) {
            const a = pts[k]
            const b = pts[k + 1]
            const d = Math.hypot(b.x - a.x, b.y - a.y)
            g.beginPath()
            g.moveTo(a.x, a.y)
            g.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 - d * 0.3, b.x, b.y)
            g.stroke()
        }
        pts.forEach((p) => {
            g.fillStyle = '#ffb86b'
            g.beginPath()
            g.arc(p.x, p.y, 9, 0, 6.3)
            g.fill()
        })
    })
    const posterTex = useCanvasTexture(160, 220, (g, w, h) => {
        g.fillStyle = '#070a1c'
        g.fillRect(0, 0, w, h)
        for (let i = 0; i < 60; i++) {
            g.fillStyle = 'rgba(255,255,255,.7)'
            g.fillRect((i * 71) % 160, (i * 43) % 220, 1.5, 1.5)
        }
        const gr = g.createRadialGradient(70, 90, 5, 80, 100, 46)
        gr.addColorStop(0, '#ffd9a0')
        gr.addColorStop(1, '#8f5cff')
        g.fillStyle = gr
        g.beginPath()
        g.arc(80, 100, 42, 0, 6.3)
        g.fill()
        g.strokeStyle = 'rgba(255,255,255,.6)'
        g.lineWidth = 3
        g.beginPath()
        g.ellipse(80, 100, 70, 14, -0.4, 0, 6.3)
        g.stroke()
    })

    const wood = '#4a3a78'
    const dark = '#1c1b3c'
    const fm = '#cfc8ee'
    const telescopeTop: V3 = [-3.8, 1.3, 0.3]

    return (
        <>
            {/* shell */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 0, 3]} receiveShadow>
                <planeGeometry args={[16, 14]} />
                <meshStandardMaterial map={floorTex} roughness={0.55} />
            </mesh>
            <mesh position={[3, 4, -4]} receiveShadow>
                <planeGeometry args={[16, 8]} />
                <meshStandardMaterial map={wallTex} roughness={0.9} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 4, 3]} receiveShadow>
                <planeGeometry args={[14, 8]} />
                <meshStandardMaterial map={wallTex} roughness={0.9} />
            </mesh>
            <B size={[16, 0.16, 0.06]} pos={[3, 0.08, -3.97]} color="#0e0f2a" shadow={false} />
            <B size={[0.06, 0.16, 14]} pos={[-4.97, 0.08, 3]} color="#0e0f2a" shadow={false} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.4, 0.012, -0.2]} receiveShadow>
                <circleGeometry args={[1.8, 48]} />
                <meshStandardMaterial map={rugTex} roughness={1} />
            </mesh>

            {/* window with sky and frame */}
            <mesh rotation={[0, Math.PI / 2, 0]} position={[-4.97, 2.7, -1]}>
                <planeGeometry args={[2.6, 1.8]} />
                <meshBasicMaterial map={skyTex} />
            </mesh>
            <B size={[0.08, 0.08, 2.75]} pos={[-4.95, 3.62, -1]} color={fm} rough={0.5} />
            <B size={[0.1, 0.1, 2.85]} pos={[-4.93, 1.78, -1]} color={fm} rough={0.5} />
            <B size={[0.08, 1.9, 0.08]} pos={[-4.95, 2.7, -2.3]} color={fm} rough={0.5} />
            <B size={[0.08, 1.9, 0.08]} pos={[-4.95, 2.7, 0.3]} color={fm} rough={0.5} />
            <B size={[0.06, 1.8, 0.05]} pos={[-4.95, 2.7, -1]} color={fm} rough={0.5} />
            <B size={[0.06, 0.05, 2.6]} pos={[-4.95, 2.7, -1]} color={fm} rough={0.5} />

            {/* desk */}
            <B size={[4.4, 0.1, 1.8]} pos={[0, 1.05, -2.95]} color={wood} rough={0.55} />
            <B size={[4.2, 0.5, 0.04]} pos={[0, 0.75, -3.8]} color={dark} rough={0.6} />
            {([[-2.1, -3.7], [2.1, -3.7], [-2.1, -2.25], [2.1, -2.25]] as Array<[number, number]>).map(([x, z]) => (
                <B key={`${x}${z}`} size={[0.1, 1, 0.1]} pos={[x, 0.5, z]} color={dark} rough={0.6} />
            ))}
            <B size={[1.3, 0.4, 1.5]} pos={[1.55, 0.78, -2.95]} color={dark} rough={0.6} />
            <B size={[0.95, 0.04, 0.3]} pos={[-0.3, 1.12, -2.5]} color="#20203f" />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, 1.143, -2.5]}>
                <planeGeometry args={[0.93, 0.28]} />
                <meshBasicMaterial map={keysTex} />
            </mesh>
            <B size={[0.1, 0.035, 0.16]} pos={[0.45, 1.12, -2.5]} color="#3a3a6c" />

            {/* monitor = projects */}
            <Interactive id="projects" api={api}>
                <Hit pos={[-0.3, 1.95, -3.1]} r={1.1} />
                <B size={[0.7, 0.03, 0.35]} pos={[-0.3, 1.11, -3.25]} color={dark} />
                <B size={[0.12, 0.55, 0.08]} pos={[-0.3, 1.4, -3.3]} color={dark} />
                <B size={[1.8, 1.05, 0.07]} pos={[-0.3, 1.98, -3.28]} color="#0a0a18" />
                <mesh position={[-0.3, 1.98, -3.24]}>
                    <planeGeometry args={[1.68, 0.93]} />
                    <meshBasicMaterial map={monitorTex} />
                </mesh>
            </Interactive>

            {/* laptop = skills */}
            <Interactive id="skills" api={api}>
                <Hit pos={[-1.6, 1.3, -2.5]} r={0.7} />
                <B size={[0.95, 0.04, 0.62]} pos={[-1.6, 1.13, -2.5]} color="#8a89a8" metal={0.5} rough={0.35} />
                <B size={[0.95, 0.62, 0.03]} pos={[-1.6, 1.47, -2.8]} rot={[-0.3, 0, 0]} color="#8a89a8" metal={0.5} rough={0.35} />
                <mesh position={[-1.6, 1.47, -2.78]} rotation={[-0.3, 0, 0]}>
                    <planeGeometry args={[0.86, 0.52]} />
                    <meshBasicMaterial map={laptopTex} />
                </mesh>
            </Interactive>

            {/* headphones, controller */}
            <mesh position={[0.6, 1.3, -2.55]} castShadow>
                <torusGeometry args={[0.2, 0.03, 8, 24, Math.PI]} />
                <meshStandardMaterial color="#2b2b55" />
            </mesh>
            <Cyl r1={0.07} r2={0.07} h={0.05} pos={[0.4, 1.2, -2.55]} rot={[0, 0, Math.PI / 2]} color="#ff8f6b" />
            <Cyl r1={0.07} r2={0.07} h={0.05} pos={[0.8, 1.2, -2.55]} rot={[0, 0, Math.PI / 2]} color="#ff8f6b" />
            <Interactive id="games" api={api}>
                <Hit pos={[1.3, 1.2, -2.3]} r={0.55} />
                <B size={[0.55, 0.12, 0.32]} pos={[1.3, 1.17, -2.3]} color="#3a3a6a" rough={0.4} />
                <B size={[0.14, 0.1, 0.3]} pos={[1.05, 1.14, -2.25]} color="#3a3a6a" rough={0.4} />
                <B size={[0.14, 0.1, 0.3]} pos={[1.55, 1.14, -2.25]} color="#3a3a6a" rough={0.4} />
                {([[1.45, -2.3, '#ff8f6b'], [1.55, -2.35, '#5fd6b0'], [1.35, -2.38, '#7a8cff']] as Array<[number, number, string]>).map(([x, z, c]) => (
                    <Sph key={c} r={0.03} pos={[x, 1.25, z]} color={c} />
                ))}
            </Interactive>

            {/* envelope = contact */}
            <Interactive id="contact" api={api}>
                <Hit pos={[0.75, 1.15, -2.1]} r={0.55} />
                <Envelope />
            </Interactive>

            {/* desk lamp */}
            <Cyl r1={0.18} r2={0.2} h={0.04} pos={[1.9, 1.12, -3.2]} color={dark} />
            <Cyl r1={0.025} r2={0.025} h={0.9} pos={[1.9, 1.55, -3.2]} color={fm} seg={8} />
            <Cyl r1={0.02} r2={0.02} h={0.7} pos={[1.75, 1.95, -3.2]} rot={[0, 0, 0.9]} color={fm} seg={8} />
            <Cyl r1={0.04} r2={0.16} h={0.22} pos={[1.55, 2.05, -3.2]} rot={[0, 0, 0.55]} color="#ffb86b" />
            <mesh position={[1.5, 1.97, -3.2]}>
                <sphereGeometry args={[0.05, 10, 8]} />
                <meshBasicMaterial color="#fff0c0" />
            </mesh>

            {/* shelf: books, trophy, vinyl */}
            <B size={[2.4, 0.06, 0.38]} pos={[-0.4, 3.75, -3.8]} color={wood} rough={0.55} />
            {['#7a8cff', '#ff8f6b', '#5fd6b0', '#e4b5ff', '#ffb86b', '#cfc8ee'].map((c, i) => (
                <B key={c} size={[0.09, 0.34 + (i % 3) * 0.06, 0.26]} pos={[-1.4 + i * 0.11, 3.95 + (i % 3) * 0.03, -3.8]} color={c} />
            ))}
            <Cyl r1={0.09} r2={0.12} h={0.06} pos={[0.1, 3.81, -3.8]} color="#d9b45a" metal={0.7} rough={0.3} />
            <Cyl r1={0.03} r2={0.03} h={0.2} pos={[0.1, 3.94, -3.8]} color="#d9b45a" metal={0.7} rough={0.3} seg={8} />
            <Cyl r1={0.12} r2={0.07} h={0.14} pos={[0.1, 4.1, -3.8]} color="#d9b45a" metal={0.7} rough={0.3} />
            <Cyl r1={0.3} r2={0.3} h={0.015} pos={[0.55, 4.0, -3.78]} rot={[Math.PI / 2, 0, 0]} color="#0c0c14" rough={0.3} seg={40} />
            <Cyl r1={0.1} r2={0.1} h={0.017} pos={[0.55, 4.0, -3.77]} rot={[Math.PI / 2, 0, 0]} color="#ff8f6b" seg={24} />

            {/* guitar */}
            <Interactive id="guitar" api={api}>
                <Hit pos={[-3, 2.5, -3.8]} r={1.7} />
                <Guitar />
            </Interactive>

            {/* telescope */}
            <Interactive id="cosmos" api={api}>
                <Hit pos={[-3.8, 1.5, 0.3]} r={1.1} />
                <Rod a={[-3.3, 0, 0.3]} b={telescopeTop} r={0.03} color="#9a98b4" />
                <Rod a={[-4.15, 0, 0.78]} b={telescopeTop} r={0.03} color="#9a98b4" />
                <Rod a={[-4.15, 0, -0.18]} b={telescopeTop} r={0.03} color="#9a98b4" />
                <group position={telescopeTop} rotation={[-0.2, 0, 0.9]}>
                    <Cyl r1={0.17} r2={0.2} h={1.7} pos={[0, 0.6, 0]} color="#e8e6f2" rough={0.3} seg={20} />
                    <Cyl r1={0.19} r2={0.19} h={0.06} pos={[0, 1.47, 0]} color="#2b2b55" seg={20} />
                    <Sph r={0.12} pos={[0, 0, 0]} color="#9a98b4" rough={0.35} />
                </group>
            </Interactive>

            {/* wall map = career */}
            <Interactive id="career" api={api}>
                <Hit pos={[3.1, 3.2, -3.9]} r={1.1} />
                <B size={[1.66, 2, 0.05]} pos={[3.1, 3.2, -3.95]} color="#d9b45a" metal={0.5} rough={0.4} />
                <mesh position={[3.1, 3.2, -3.92]}>
                    <planeGeometry args={[1.5, 1.84]} />
                    <meshBasicMaterial map={mapTex} />
                </mesh>
            </Interactive>
            <B size={[0.9, 1.2, 0.04]} pos={[1.65, 3.1, -3.96]} color={fm} />
            <mesh position={[1.65, 3.1, -3.935]}>
                <planeGeometry args={[0.8, 1.1]} />
                <meshBasicMaterial map={posterTex} />
            </mesh>

            {/* plant */}
            <Cyl r1={0.28} r2={0.22} h={0.4} pos={[4.35, 0.2, -3.2]} color="#c0603a" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const a = (i / 7) * 6.28
                return (
                    <Sph
                        key={i}
                        r={0.2}
                        pos={[4.35 + Math.cos(a) * 0.18, 0.85 + (i % 3) * 0.1, -3.2 + Math.sin(a) * 0.12]}
                        scale={[0.55, 1.5, 0.3]}
                        color="#2f8a5a"
                    />
                )
            })}

            {/* string lights */}
            {Array.from({ length: 26 }, (_, i) => (
                <mesh key={i} position={[-4.6 + i * 0.37, 4.62 - Math.sin((i / 25) * Math.PI) * 0.35, -3.93]}>
                    <sphereGeometry args={[0.045, 8, 6]} />
                    <meshBasicMaterial color={['#ffb86b', '#ffd9a0', '#ff8f6b'][i % 3]} />
                </mesh>
            ))}
        </>
    )
}

/* ---------- camera ---------- */

/** How the visitor turned the view: a turn around the looked-at point, a tilt and a zoom factor. */
type View = { yaw: number; pitch: number; zoom: number }
const VIEW_LIMITS = { yaw: 0.9, pitchMin: -0.35, pitchMax: 0.45, zoomMin: 0.45, zoomMax: 1.35 }
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
function clampView(v: View) {
    v.yaw = clamp(v.yaw, -VIEW_LIMITS.yaw, VIEW_LIMITS.yaw)
    v.pitch = clamp(v.pitch, VIEW_LIMITS.pitchMin, VIEW_LIMITS.pitchMax)
    v.zoom = clamp(v.zoom, VIEW_LIMITS.zoomMin, VIEW_LIMITS.zoomMax)
}

/**
 * Flies between the presets, then applies what the visitor asked for:
 * the view only turns while the mouse button is held, and the wheel zooms.
 */
function CameraRig({ focus, reduced, view }: { focus: RoomTarget | null; reduced: boolean; view: React.MutableRefObject<View> }) {
    const { camera, size } = useThree()
    const cur = useRef({
        pos: new THREE.Vector3(...PRESETS.home.pos),
        look: new THREE.Vector3(...PRESETS.home.look),
        view: { yaw: 0, pitch: 0, zoom: 1 } as View,
    })
    const tmp = useMemo(() => new THREE.Vector3(), [])
    const offset = useMemo(() => new THREE.Vector3(), [])
    const sph = useMemo(() => new THREE.Spherical(), [])

    // going to an object (or back home) starts from its framing again
    useEffect(() => {
        view.current = { yaw: 0, pitch: 0, zoom: 1 }
    }, [focus, view])

    useFrame((_, dt) => {
        const narrow = size.width / size.height < 1.1
        const target = focus ? PRESETS[focus] : { pos: narrow ? HOME_NARROW : PRESETS.home.pos, look: PRESETS.home.look }
        const k = reduced ? 1 : Math.min(1, dt * 2.8)
        cur.current.pos.lerp(tmp.set(...target.pos), k)
        cur.current.look.lerp(tmp.set(...target.look), k)
        // the turn follows the hand closely, but still eases a little
        const kv = reduced ? 1 : Math.min(1, dt * 10)
        const v = cur.current.view
        v.yaw += (view.current.yaw - v.yaw) * kv
        v.pitch += (view.current.pitch - v.pitch) * kv
        v.zoom += (view.current.zoom - v.zoom) * kv

        offset.copy(cur.current.pos).sub(cur.current.look)
        sph.setFromVector3(offset)
        sph.theta += v.yaw
        sph.phi = clamp(sph.phi - v.pitch, 0.2, 1.5)
        sph.radius = Math.max(1.2, sph.radius * v.zoom)
        camera.position.copy(cur.current.look).add(offset.setFromSpherical(sph))
        camera.lookAt(cur.current.look)
    })
    return null
}

/** Moves the DOM label buttons (outside the canvas) onto the 3D position of their object. */
function LabelProjector({ labels }: { labels: React.MutableRefObject<Partial<Record<RoomTarget, HTMLButtonElement | null>>> }) {
    const { camera, size } = useThree()
    const v = useMemo(() => new THREE.Vector3(), [])
    useFrame(() => {
        HOTSPOTS.forEach((h) => {
            const el = labels.current[h.id]
            if (!el) return
            v.set(...h.pos).project(camera)
            el.style.transform = `translate(${(v.x * 0.5 + 0.5) * size.width}px, ${(-v.y * 0.5 + 0.5) * size.height}px) translate(-50%, -100%)`
            el.style.opacity = v.z < 1 ? '1' : '0'
        })
    })
    return null
}

/* ---------- scene ---------- */

type Props = {
    focus: RoomTarget | null
    reducedMotion: boolean
    /** Stop rendering (e.g. while an opaque panel covers the scene) to save the GPU and keep the UI smooth. */
    paused?: boolean
    onSelect: (id: RoomTarget) => void
    /** Called when the visitor clicks the scene where there is no object. */
    onBackgroundClick?: () => void
}

export default function RoomScene({ focus, reducedMotion, paused = false, onSelect, onBackgroundClick }: Props) {
    const [hover, setHover] = useState<RoomTarget | null>(null)
    const refs = useRef<Partial<Record<RoomTarget, THREE.Group | null>>>({})
    const labels = useRef<Partial<Record<RoomTarget, HTMLButtonElement | null>>>({})
    const view = useRef<View>({ yaw: 0, pitch: 0, zoom: 1 })
    const wrapRef = useRef<HTMLDivElement>(null)
    const drag = useRef({ down: false, moved: false, x: 0, y: 0, id: -1 })
    const [dragging, setDragging] = useState(false)
    const api = useMemo<Api>(() => ({ setHover, onSelect, refs, wasDrag: () => drag.current.moved }), [onSelect])

    // Turning the view: only while the button is held. Zoom: mouse wheel. Keyboard: arrows and + / -.
    useEffect(() => {
        const el = wrapRef.current
        if (!el || paused) return
        const canvas = el.querySelector('canvas')
        const d = drag.current
        const onDown = (e: PointerEvent) => {
            if (e.target !== canvas || e.button !== 0) return
            Object.assign(d, { down: true, moved: false, x: e.clientX, y: e.clientY, id: e.pointerId })
        }
        const onMove = (e: PointerEvent) => {
            if (!d.down || e.pointerId !== d.id) return
            const dx = e.clientX - d.x
            const dy = e.clientY - d.y
            if (!d.moved && Math.hypot(dx, dy) < 5) return
            if (!d.moved) {
                d.moved = true
                setDragging(true)
            }
            d.x = e.clientX
            d.y = e.clientY
            view.current.yaw -= dx * 0.005
            view.current.pitch += dy * 0.004
            clampView(view.current)
        }
        const onUp = (e: PointerEvent) => {
            if (e.pointerId !== d.id) return
            d.down = false
            setDragging(false)
        }
        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            view.current.zoom *= Math.exp(e.deltaY * 0.0012)
            clampView(view.current)
        }
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement | null
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
            const v = view.current
            if (e.key === 'ArrowLeft') v.yaw += 0.12
            else if (e.key === 'ArrowRight') v.yaw -= 0.12
            else if (e.key === 'ArrowUp') v.pitch += 0.08
            else if (e.key === 'ArrowDown') v.pitch -= 0.08
            else if (e.key === '+' || e.key === '=') v.zoom *= 0.85
            else if (e.key === '-') v.zoom /= 0.85
            else return
            e.preventDefault()
            clampView(v)
        }
        el.addEventListener('pointerdown', onDown)
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onUp)
        el.addEventListener('wheel', onWheel, { passive: false })
        window.addEventListener('keydown', onKey)
        return () => {
            el.removeEventListener('pointerdown', onDown)
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onUp)
            el.removeEventListener('wheel', onWheel)
            window.removeEventListener('keydown', onKey)
        }
    }, [paused])

    // highlight the hovered / focused object
    useEffect(() => {
        ;(Object.keys(refs.current) as RoomTarget[]).forEach((id) => {
            const on = hover === id || focus === id
            refs.current[id]?.traverse((o) => {
                const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
                if (m && 'emissive' in m && !(m as unknown as THREE.MeshBasicMaterial).isMeshBasicMaterial) {
                    m.emissive.set(on ? 0x3a2870 : 0x000000)
                }
            })
        })
    }, [hover, focus])

    return (
        <div
            ref={wrapRef}
            className="relative h-full w-full touch-none overflow-hidden"
            style={{ cursor: dragging ? 'grabbing' : hover ? 'pointer' : 'grab' }}
        >
        <Canvas
            shadows
            dpr={[1, 1.5]}
            frameloop={paused ? 'never' : 'always'}
            onPointerMissed={() => {
                if (!drag.current.moved) onBackgroundClick?.()
            }}
            camera={{ fov: 45, near: 0.1, far: 100, position: PRESETS.home.pos }}
            gl={{ antialias: true }}
        >
            <color attach="background" args={['#05060c']} />
            <fog attach="fog" args={['#05060c', 16, 34]} />
            <ambientLight intensity={1.7} color="#7a80c4" />
            <hemisphereLight args={['#aab4ff', '#2a2040', 1.3]} />
            <directionalLight
                position={[5, 9, 6]}
                intensity={2.2}
                color="#fff0dd"
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-8}
                shadow-camera-right={8}
                shadow-camera-top={8}
                shadow-camera-bottom={-8}
                shadow-camera-near={1}
                shadow-camera-far={25}
                shadow-bias={-0.0004}
            />
            <pointLight position={[1.9, 2.1, -3.1]} intensity={6} distance={7} color="#ffc98a" />
            <pointLight position={[-0.3, 2.1, -2.4]} intensity={5} distance={7} color="#8f7cff" />
            <pointLight position={[-4.4, 2.7, -1]} intensity={5} distance={9} color="#9bb6ff" />

            <Room api={api} />
            <CameraRig focus={focus} reduced={reducedMotion} view={view} />
            <LabelProjector labels={labels} />
        </Canvas>

        {/* labels: real buttons (keyboard + screen reader friendly), placed over their object */}
        {HOTSPOTS.map((h) => (
            <button
                key={h.id}
                ref={(el) => {
                    labels.current[h.id] = el
                }}
                type="button"
                onClick={() => onSelect(h.id)}
                onMouseEnter={() => setHover(h.id)}
                onMouseLeave={() => setHover(null)}
                className={
                    'absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap rounded-full border border-amber-300 bg-slate-900/90 px-3 py-1 text-xs font-medium text-white shadow-lg transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300' +
                    (focus ? ' pointer-events-none invisible' : '')
                }
            >
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" aria-hidden="true" />
                {h.label}
            </button>
        ))}
        </div>
    )
}
