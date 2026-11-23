"use client"
import React, { useId, useMemo } from 'react'
import ProfilePic from '../../../public/me.png'
import { careerPath } from '../../../lib/content'
import { LAND, MAP_W, project } from '../../../lib/geo'
import { buildLayout, TREE_VIEW } from '../SkillsTree'

/*
 * Small, decorative previews of the explorer cards. They reuse the real data and
 * geometry of the career map and the skill tree; the real, interactive versions
 * open when the card is opened. Classes starting with "x" are animation hooks
 * used by ExplorerCards (entrance and live loops).
 */

const r2 = (v: number) => Math.round(v * 100) / 100

export function MiniCareerMap() {
    const pts = useMemo(
        () =>
            careerPath.map((s) => {
                const p = project(s.lat, s.lon)
                return { x: r2(p.x + (s.dx ?? 0)), y: r2(p.y + (s.dy ?? 0)) }
            }),
        []
    )
    // the whole route as one path, with the same curved segments as the real map
    const route = useMemo(
        () =>
            pts.slice(1).reduce((d, b, k) => {
                const a = pts[k]
                const dist = Math.hypot(b.x - a.x, b.y - a.y)
                return `${d}Q${r2((a.x + b.x) / 2)} ${r2((a.y + b.y) / 2 - dist * 0.3)} ${b.x} ${b.y}`
            }, `M${pts[0].x} ${pts[0].y}`),
        [pts]
    )

    return (
        <svg viewBox={`0 70 ${MAP_W} 410`} preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden="true">
            {LAND.map((ring, i) => (
                <polygon
                    key={i}
                    points={ring.map(([lon, lat]) => `${r2(project(lat, lon).x)},${r2(project(lat, lon).y)}`).join(' ')}
                    fill="#1c2150"
                    stroke="#2c3374"
                    strokeWidth={1.5}
                />
            ))}
            <path className="xroute" d={route} fill="none" stroke="#8f7cff" strokeWidth={3} strokeLinecap="round" />
            {pts.map((p, i) => (
                <circle key={i} className="xstop xnode" cx={p.x} cy={p.y} r={7} fill="#ffb86b" stroke="#0e1226" strokeWidth={2} />
            ))}
            <circle className="xdot" cx={0} cy={0} r={9} fill="#fde68a" stroke="#ffffff" strokeWidth={2.5} opacity={0} />
        </svg>
    )
}

export function MiniSkillTree() {
    const branches = useMemo(buildLayout, [])
    const { W, H, CX, CY } = TREE_VIEW
    // the preview can be on the page twice (desktop card + phone tab): each copy needs its own clip id
    const clipId = `xtree-avatar-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
    return (
        <svg viewBox={`40 20 ${W - 80} ${H - 40}`} preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden="true">
            <defs>
                <clipPath id={clipId}>
                    <circle cx={CX} cy={CY} r={40} />
                </clipPath>
            </defs>
            {branches.map((b) => (
                <g key={b.id}>
                    <line className="xline" x1={CX} y1={CY} x2={b.x} y2={b.y} stroke={b.color} strokeWidth={4} strokeOpacity={0.75} />
                    {b.leaves.map((l) => (
                        <line key={l.skill} className="xline" x1={b.x} y1={b.y} x2={l.x} y2={l.y} stroke={b.color} strokeWidth={2.5} strokeOpacity={0.4} />
                    ))}
                </g>
            ))}
            {branches.map((b) => (
                <g key={`n-${b.id}`}>
                    {b.leaves.map((l) => (
                        <circle key={l.skill} className="xleaf xnode" cx={l.x} cy={l.y} r={12} fill={b.color} />
                    ))}
                    <circle className="xgroup xnode" cx={b.x} cy={b.y} r={34} fill={b.color} fillOpacity={0.3} stroke={b.color} strokeWidth={4} />
                </g>
            ))}
            <g className="xme xnode">
                <circle cx={CX} cy={CY} r={45} fill="#0e1226" stroke="#8f7cff" strokeWidth={5} />
                <image
                    href={ProfilePic.src}
                    x={CX - 40}
                    y={CY - 40}
                    width={80}
                    height={80}
                    clipPath={`url(#${clipId})`}
                    preserveAspectRatio="xMidYMid slice"
                />
            </g>
        </svg>
    )
}

/** A short loop of the real 3D room (no three.js on the page: the video only loads when needed). */
export const RoomPreview = React.forwardRef<HTMLVideoElement>(function RoomPreview(_, ref) {
    return (
        <video
            ref={ref}
            className="xvideo h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="none"
            poster="/room/room-preview.jpg"
            aria-hidden="true"
            tabIndex={-1}
        >
            <source src="/room/room-preview.webm" type="video/webm" />
            <source src="/room/room-preview.mp4" type="video/mp4" />
        </video>
    )
})
