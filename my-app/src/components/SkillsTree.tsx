"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import ProfilePic from '../../public/me.png'
import { skillGroups, type SkillName } from '../../lib/content'
import { useFocus } from '../../context/focus'
import {
    experienceAnchor,
    experiencesUsing,
    projectAnchor,
    projectsUsing,
} from '../../lib/relations'

const W = 800
const H = 540
const CX = 400
const CY = 262
/** Size of the tree drawing, shared with the small preview of the explorer card. */
export const TREE_VIEW = { W, H, CX, CY } as const
// Where each group sits around the centre (degrees, 0 = right, -90 = up).
// The two top groups are spread wide enough for 9 and 7 skills without their labels meeting.
const GROUP_ANGLES = [-155, -25, 90]

/**
 * Selecting a skill makes the related projects and career steps appear as
 * new nodes inside the tree (no separate details panel).
 */
type Leaf = { skill: SkillName; x: number; y: number; right: boolean }
type Branch = {
    id: string
    short: string
    name: string
    color: string
    x: number
    y: number
    leaves: Leaf[]
}

// Coordinates are rounded: Node (server) and the browser can disagree on the last
// decimals of Math.cos / Math.sin, which would break hydration.
const r2 = (v: number) => Math.round(v * 100) / 100

export function buildLayout(): Branch[] {
    return skillGroups.map((group, gi) => {
        const angle = (GROUP_ANGLES[gi] * Math.PI) / 180
        const x = r2(CX + 125 * Math.cos(angle))
        const y = r2(CY + 118 * Math.sin(angle))
        const n = group.skills.length
        const spread = n > 6 ? 2.4 : n > 4 ? 2.0 : 1.5
        // Crowded groups alternate between an inner and an outer ring so labels never collide.
        const inner = n >= 6 ? 98 : 105
        const outer = n > 7 ? 156 : 138
        const leaves = group.skills.map((skill, i) => {
            const phi = angle + spread * (n > 1 ? i / (n - 1) - 0.5 : 0)
            const r = n >= 6 && i % 2 === 1 ? outer : inner
            return {
                skill,
                x: r2(x + r * Math.cos(phi)),
                y: r2(y + r * Math.sin(phi)),
                right: Math.cos(phi) >= 0,
            }
        })
        return { id: group.id, short: group.short, name: group.name, color: group.color, x, y, leaves }
    })
}

const trim = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

type RelItem = { kind: 'project' | 'career'; label: string; sub?: string; anchor: string; index: number; url?: string }

function relatedItems(skill: SkillName): RelItem[] {
    return [
        ...projectsUsing(skill).map(({ project, index }) => ({
            kind: 'project' as const,
            label: project.title,
            anchor: projectAnchor(index),
            index,
            url: project.url,
        })),
        ...experiencesUsing(skill).map(({ experience, index }) => ({
            kind: 'career' as const,
            label: experience.title,
            sub: experience.date,
            anchor: experienceAnchor(index),
            index,
        })),
    ]
}

type Props = {
    selected: SkillName | null
    onSelect: (skill: SkillName | null) => void
}

export default function SkillsTree({ selected, onSelect }: Props) {
    const branches = useMemo(buildLayout, [])
    const svgRef = useRef<SVGSVGElement>(null)
    const relRef = useRef<SVGGElement>(null)
    // the pulse that travels from my photo to the selected skill
    const pulsePathRef = useRef<SVGPathElement>(null)
    const pulseDotRef = useRef<SVGCircleElement>(null)
    const { focusExperience } = useFocus()
    // Projects open the live app in a new tab (see the pill below); career steps open the career map.
    const [focusedGroup, setFocusedGroup] = useState<string | null>(null)

    const selectedLeaf = selected
        ? branches.flatMap((b) => b.leaves.map((l) => ({ ...l, color: b.color, group: b.id }))).find((l) => l.skill === selected) ?? null
        : null
    const litGroup = selectedLeaf?.group ?? focusedGroup
    // route of the pulse: my photo -> the skill's branch -> the skill
    const selectedBranch = selectedLeaf ? branches.find((b) => b.id === selectedLeaf.group) ?? null : null
    const pulseRoute =
        selectedLeaf && selectedBranch
            ? `M${CX} ${CY}L${selectedBranch.x} ${selectedBranch.y}L${selectedLeaf.x} ${selectedLeaf.y}`
            : ''
    const items = useMemo(() => (selected ? relatedItems(selected) : []), [selected])

    // --- intro animation (Anime.js is loaded on demand, only when the tree is shown) ---
    useEffect(() => {
        const svg = svgRef.current
        if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        let cancelled = false
        const running: Array<{ revert: () => unknown }> = []

        import('animejs').then(({ animate, stagger }) => {
            if (cancelled) return
            const edges = Array.from(svg.querySelectorAll<SVGPathElement>('.tree-edge'))
            const nodes = Array.from(svg.querySelectorAll<SVGGElement>('.tree-node'))
            edges.forEach((e) => {
                e.style.strokeDasharray = '1'
                e.style.strokeDashoffset = '1'
            })
            nodes.forEach((n) => {
                n.style.opacity = '0'
            })
            running.push(
                animate(edges, { strokeDashoffset: [1, 0], duration: 700, delay: stagger(16), ease: 'inOutSine' })
            )
            running.push(
                animate(nodes, { opacity: [0, 1], duration: 450, delay: stagger(12, { start: 450 }), ease: 'outQuad' })
            )
        })

        return () => {
            cancelled = true
            running.forEach((a) => a.revert())
        }
    }, [])

    // --- a pulse runs from my photo along the branch to the skill, then the related nodes draw themselves in ---
    useEffect(() => {
        const g = relRef.current
        const path = pulsePathRef.current
        const dot = pulseDotRef.current
        if (!g || !selected || !path || !dot) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            path.style.opacity = '0.55' // the route stays visible, without movement
            return
        }
        let cancelled = false
        const running: Array<{ cancel: () => unknown }> = []
        import('animejs').then(({ createTimeline, stagger, svg }) => {
            if (cancelled) return
            const lines = Array.from(g.querySelectorAll<SVGPathElement>('.rel-line'))
            const pills = Array.from(g.querySelectorAll<SVGGElement>('.rel-pill'))
            lines.forEach((l) => {
                l.style.strokeDasharray = '1'
                l.style.strokeDashoffset = '1'
            })
            pills.forEach((p) => {
                p.style.opacity = '0'
            })
            const fromX = selectedLeaf && selectedLeaf.x < CX ? -24 : 24
            running.push(
                createTimeline({ defaults: { ease: 'inOut(2)' } })
                    // the route lights up while the pulse travels it (photo -> branch -> skill)
                    .add(path, { opacity: [0, 0.9], duration: 120 }, 0)
                    .add(svg.createDrawable(path), { draw: ['0 0', '0 1'], duration: 600 }, 0)
                    .add(dot, { opacity: [0, 1], duration: 120 }, 0)
                    .add(dot, { ...svg.createMotionPath(path), duration: 600 }, 0)
                    // arrival: the pulse bursts on the skill, the route stays softly lit
                    .add(dot, { opacity: [1, 0], scale: [1, 2.4], duration: 320, ease: 'out(2)' }, 600)
                    .add(path, { opacity: 0.55, duration: 400 }, 650)
                    // then the projects and career steps that use the skill appear
                    .add(lines, { strokeDashoffset: [1, 0], duration: 600, delay: stagger(70), ease: 'inOutSine' }, 550)
                    .add(pills, { opacity: [0, 1], translateX: [fromX, 0], duration: 500, delay: stagger(70), ease: 'outCubic' }, 750)
            )
        })
        return () => {
            cancelled = true
            // cancel (not revert): by now React may have emptied the pulse route, and reverting
            // would render the motion path one last time on an empty path, which throws.
            // The next pulse resets every value it animates anyway.
            running.forEach((a) => a.cancel())
            if (path) path.style.opacity = '0'
            if (dot) dot.style.opacity = '0'
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected])

    // Escape closes the details
    useEffect(() => {
        if (!selected) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onSelect(null)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [selected, onSelect])

    const clickLeaf = (skill: SkillName) => {
        setFocusedGroup(null)
        onSelect(selected === skill ? null : skill)
    }
    const clickGroup = (id: string) => {
        onSelect(null)
        setFocusedGroup(focusedGroup === id ? null : id)
    }
    const reset = () => {
        setFocusedGroup(null)
        onSelect(null)
    }
    const activate = (fn: () => void) => (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fn()
        }
    }
    const dim = (id: string) => litGroup !== null && litGroup !== id

    // --- geometry of the related nodes: a column on the opposite side of the selected skill ---
    const PILL_W = 210
    const PILL_H = 40
    const GAP = 10
    const colOnRight = selectedLeaf ? selectedLeaf.x < CX : true
    const colX = colOnRight ? W - PILL_W - 14 : 14
    const colTop = H / 2 - (items.length * (PILL_H + GAP) - GAP) / 2
    const pillY = (i: number) => colTop + i * (PILL_H + GAP)

    return (
        <div className="relative mx-auto w-full max-w-[53rem]">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className="h-auto w-full"
                role="group"
                aria-label="Skill tree. The same skills are available as a list."
            >
                <defs>
                    <clipPath id="tree-avatar">
                        <circle cx={CX} cy={CY} r={42} />
                    </clipPath>
                </defs>

                {/* edges */}
                {branches.map((b) => (
                    <g key={`e-${b.id}`} className={clsx('transition-opacity duration-300', dim(b.id) && 'opacity-25')}>
                        <path className="tree-edge" pathLength={1} d={`M${CX} ${CY}L${b.x} ${b.y}`} fill="none" stroke={b.color} strokeOpacity={0.45} strokeWidth={2} />
                        {b.leaves.map((l) => (
                            <path
                                key={l.skill}
                                className="tree-edge"
                                pathLength={1}
                                d={`M${b.x} ${b.y}L${l.x} ${l.y}`}
                                fill="none"
                                stroke={b.color}
                                strokeOpacity={0.35}
                                strokeWidth={1.5}
                            />
                        ))}
                    </g>
                ))}

                {/* the route lit by the pulse (under the nodes) */}
                <path
                    ref={pulsePathRef}
                    d={pulseRoute}
                    fill="none"
                    stroke={selectedLeaf?.color ?? 'none'}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0}
                    className="pointer-events-none"
                    aria-hidden="true"
                />

                {/* leaves + domains */}
                {branches.map((b) => (
                    <g key={`n-${b.id}`} className={clsx('transition-opacity duration-300', dim(b.id) && 'opacity-30')}>
                        {b.leaves.map((l) => {
                            const isSel = selected === l.skill
                            const faded = selected !== null && !isSel
                            return (
                                <g
                                    key={l.skill}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isSel}
                                    aria-label={l.skill}
                                    onClick={() => clickLeaf(l.skill)}
                                    onKeyDown={activate(() => clickLeaf(l.skill))}
                                    className={clsx('group cursor-pointer outline-none transition-opacity duration-300', faded && 'opacity-40')}
                                >
                                    <g className="tree-node">
                                        <circle cx={l.x} cy={l.y} r={18} fill="transparent" />
                                        <circle className="opacity-0 group-focus-visible:opacity-100" cx={l.x} cy={l.y} r={13} fill="none" stroke="#111827" strokeWidth={2} />
                                        <circle
                                            className="transition-all duration-200 group-hover:[r:10px]"
                                            cx={l.x}
                                            cy={l.y}
                                            r={isSel ? 10 : 8}
                                            fill={b.color}
                                            stroke={isSel ? '#111827' : '#ffffff'}
                                            strokeWidth={isSel ? 3 : 2}
                                        />
                                        <text
                                            x={l.x + (l.right ? 15 : -15)}
                                            y={l.y + 5}
                                            textAnchor={l.right ? 'start' : 'end'}
                                            fontSize={14}
                                            fontWeight={isSel ? 700 : 500}
                                            fill="#1f2937"
                                            className="pointer-events-none select-none"
                                        >
                                            {l.skill}
                                        </text>
                                    </g>
                                </g>
                            )
                        })}
                        <g
                            role="button"
                            tabIndex={0}
                            aria-pressed={litGroup === b.id && selected === null}
                            aria-label={`${b.name}: show only this branch`}
                            onClick={() => clickGroup(b.id)}
                            onKeyDown={activate(() => clickGroup(b.id))}
                            className="group cursor-pointer outline-none"
                        >
                            <g className="tree-node">
                                <circle className="opacity-0 group-focus-visible:opacity-100" cx={b.x} cy={b.y} r={42} fill="none" stroke="#111827" strokeWidth={2} />
                                <circle
                                    className="transition-all duration-200 group-hover:[r:39px]"
                                    cx={b.x}
                                    cy={b.y}
                                    r={36}
                                    fill={b.color}
                                    stroke="#ffffff"
                                    strokeWidth={3}
                                />
                                <text x={b.x} y={b.y + 5} textAnchor="middle" fontSize={13} fontWeight={600} fill="#ffffff" className="pointer-events-none select-none">
                                    {b.short}
                                </text>
                            </g>
                        </g>
                    </g>
                ))}

                {/* centre: me */}
                <g
                    role="button"
                    tabIndex={0}
                    aria-label="Show all skills"
                    onClick={reset}
                    onKeyDown={activate(reset)}
                    className="group cursor-pointer outline-none"
                >
                    <g className="tree-node">
                        <circle className="opacity-0 group-focus-visible:opacity-100" cx={CX} cy={CY} r={52} fill="none" stroke="#111827" strokeWidth={2} />
                        <circle cx={CX} cy={CY} r={46} fill="#ffffff" stroke="#111827" strokeWidth={3} />
                        <image
                            href={ProfilePic.src}
                            x={CX - 42}
                            y={CY - 42}
                            width={84}
                            height={84}
                            clipPath="url(#tree-avatar)"
                            preserveAspectRatio="xMidYMid slice"
                        />
                    </g>
                </g>

                {/* the travelling pulse (above the nodes) */}
                <circle
                    ref={pulseDotRef}
                    cx={0}
                    cy={0}
                    r={7}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth={2}
                    opacity={0}
                    className="pointer-events-none"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center', filter: 'drop-shadow(0 0 5px rgba(245,158,11,.8))' }}
                    aria-hidden="true"
                />

                {/* related projects / career steps as nodes of the tree */}
                {selectedLeaf && (
                    <g ref={relRef} key={selectedLeaf.skill}>
                        {items.length === 0 ? (
                            <g className="rel-pill" transform={`translate(${colX} ${H / 2 - PILL_H / 2})`}>
                                <rect width={PILL_W} height={PILL_H} rx={20} fill="#ffffff" stroke="#d1d5db" />
                                <text x={PILL_W / 2} y={PILL_H / 2 + 5} textAnchor="middle" fontSize={13} fill="#4b5563">
                                    Part of my everyday toolbox
                                </text>
                            </g>
                        ) : (
                            items.map((it, i) => {
                                const y = pillY(i)
                                const px = colOnRight ? colX : colX + PILL_W
                                const mid = (selectedLeaf.x + px) / 2
                                const py = y + PILL_H / 2
                                const isProject = it.kind === 'project'
                                return (
                                    <g key={`${it.kind}-${it.anchor}`}>
                                        <path
                                            className="rel-line"
                                            pathLength={1}
                                            d={`M${selectedLeaf.x} ${selectedLeaf.y}C${mid} ${selectedLeaf.y} ${mid} ${py} ${px} ${py}`}
                                            fill="none"
                                            stroke={selectedLeaf.color}
                                            strokeOpacity={0.7}
                                            strokeWidth={2}
                                        />
                                        {isProject ? (
                                            <a
                                                className="rel-pill group cursor-pointer outline-none"
                                                href={it.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Project: ${it.label} (opens in a new tab)`}
                                            >
                                            <rect
                                                className="transition-colors group-hover:fill-gray-700 group-focus-visible:stroke-amber-500"
                                                x={colX}
                                                y={y}
                                                width={PILL_W}
                                                height={PILL_H}
                                                rx={20}
                                                fill={isProject ? '#111827' : '#ffffff'}
                                                stroke={isProject ? '#111827' : selectedLeaf.color}
                                                strokeWidth={isProject ? 2 : 2}
                                            />
                                            <text
                                                x={colX + PILL_W / 2}
                                                y={it.sub ? y + 17 : y + PILL_H / 2 + 5}
                                                textAnchor="middle"
                                                fontSize={13}
                                                fontWeight={600}
                                                fill={isProject ? '#ffffff' : '#111827'}
                                                className="pointer-events-none select-none"
                                            >
                                                {isProject ? `${trim(it.label, 24)} ↗` : trim(it.label, 26)}
                                            </text>
                                            {it.sub && (
                                                <text
                                                    x={colX + PILL_W / 2}
                                                    y={y + 31}
                                                    textAnchor="middle"
                                                    fontSize={11}
                                                    fill="#4b5563"
                                                    className="pointer-events-none select-none"
                                                >
                                                    {it.sub}
                                                </text>
                                            )}
                                            </a>
                                        ) : (
                                            <g
                                                className="rel-pill group cursor-pointer outline-none"
                                                role="link"
                                                tabIndex={0}
                                                aria-label={`Career: ${it.label}`}
                                                onClick={() => focusExperience(it.index)}
                                                onKeyDown={activate(() => focusExperience(it.index))}
                                            >
                                            <rect
                                                className="transition-colors group-hover:fill-gray-700 group-focus-visible:stroke-amber-500"
                                                x={colX}
                                                y={y}
                                                width={PILL_W}
                                                height={PILL_H}
                                                rx={20}
                                                fill={isProject ? '#111827' : '#ffffff'}
                                                stroke={isProject ? '#111827' : selectedLeaf.color}
                                                strokeWidth={isProject ? 2 : 2}
                                            />
                                            <text
                                                x={colX + PILL_W / 2}
                                                y={it.sub ? y + 17 : y + PILL_H / 2 + 5}
                                                textAnchor="middle"
                                                fontSize={13}
                                                fontWeight={600}
                                                fill={isProject ? '#ffffff' : '#111827'}
                                                className="pointer-events-none select-none"
                                            >
                                                {isProject ? `${trim(it.label, 24)} ↗` : trim(it.label, 26)}
                                            </text>
                                            {it.sub && (
                                                <text
                                                    x={colX + PILL_W / 2}
                                                    y={y + 31}
                                                    textAnchor="middle"
                                                    fontSize={11}
                                                    fill="#4b5563"
                                                    className="pointer-events-none select-none"
                                                >
                                                    {it.sub}
                                                </text>
                                            )}
                                            </g>
                                        )}
                                    </g>
                                )
                            })
                        )}
                    </g>
                )}
            </svg>
        </div>
    )
}
