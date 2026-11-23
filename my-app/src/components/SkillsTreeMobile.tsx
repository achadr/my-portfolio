"use client"
import React, { useEffect, useId, useRef, useState } from 'react'
import { BsArrowLeft } from 'react-icons/bs'
import ProfilePic from '../../public/me.png'
import { skillGroups, type SkillName } from '../../lib/content'

// Drawing size (user units); the SVG scales to the screen width.
const W = 360
const H = 360
const CX = W / 2
const CY = H / 2

const r1 = (v: number) => Math.round(v * 10) / 10
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Props = {
    selected: SkillName | null
    onSelect: (skill: SkillName | null) => void
}

/**
 * The skill tree on phones: the same radial tree as on desktop, one level at a time.
 * First my photo and the three families around it; tapping a family zooms into it with its
 * skills in large pills; tapping a skill selects it (the section shows where it was used).
 */
export default function SkillsTreeMobile({ selected, onSelect }: Props) {
    const groupOf = (s: SkillName | null) => (s ? skillGroups.find((g) => (g.skills as readonly string[]).includes(s))?.id ?? null : null)
    const [family, setFamily] = useState<string | null>(() => groupOf(selected))
    const svgRef = useRef<SVGSVGElement>(null)
    const pulseRef = useRef<SVGCircleElement>(null)
    const backRef = useRef<HTMLButtonElement>(null)
    const clipId = `xmt-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
    const group = family ? skillGroups.find((g) => g.id === family) ?? null : null

    // a skill chosen elsewhere (career map, list) opens its family
    useEffect(() => {
        const g = groupOf(selected)
        if (g) setFamily(g)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected])

    // each level arrives with a short zoom
    useEffect(() => {
        const svg = svgRef.current
        if (!svg || reducedMotion()) return
        svg.animate(
            [
                { transform: family ? 'scale(0.8)' : 'scale(1.15)', opacity: 0.2 },
                { transform: 'none', opacity: 1 },
            ],
            { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)' }
        )
    }, [family])

    const families = skillGroups.map((g, i) => {
        const a = ((-90 + i * 120) * Math.PI) / 180
        return { g, x: r1(CX + Math.cos(a) * 112), y: r1(CY + Math.sin(a) * 112) }
    })
    // skills on an ellipse, wider than tall so the longer names fit at the sides
    const leaves = group
        ? group.skills.map((skill, i) => {
              const a = ((-90 + (i * 360) / group.skills.length) * Math.PI) / 180
              const x = r1(CX + Math.cos(a) * 112)
              const y = r1(CY + Math.sin(a) * 140)
              const w = r1(skill.length * 6.9 + 22)
              return { skill: skill as SkillName, x, y, w }
          })
        : []

    const pick = (skill: SkillName, x: number, y: number) => {
        const next = selected === skill ? null : skill
        onSelect(next)
        // the pulse runs from my photo to the skill, as on desktop
        const dot = pulseRef.current
        if (next && dot && !reducedMotion()) {
            dot.animate(
                [
                    { transform: `translate(${CX}px, ${CY}px) scale(1)`, opacity: 1 },
                    { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1, offset: 0.8 },
                    { transform: `translate(${x}px, ${y}px) scale(2.6)`, opacity: 0 },
                ],
                { duration: 650, easing: 'ease-out' }
            )
        }
    }
    const openFamily = (id: string) => {
        setFamily(id)
        requestAnimationFrame(() => backRef.current?.focus({ preventScroll: true }))
    }
    const keys = (fn: () => void) => (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fn()
        }
    }

    return (
        <div className="mx-auto w-full max-w-[24rem]">
            <div className="flex min-h-[2.25rem] items-center justify-center gap-3">
                {group ? (
                    <>
                        <button
                            ref={backRef}
                            type="button"
                            onClick={() => setFamily(null)}
                            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm transition hover:border-gray-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                        >
                            <BsArrowLeft aria-hidden="true" /> All families
                        </button>
                        <span className="font-semibold" style={{ color: group.color }}>
                            {group.name}
                        </span>
                    </>
                ) : (
                    <span className="text-sm text-gray-600">Tap a family, then a skill.</span>
                )}
            </div>

            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" role="group" aria-label={group ? `${group.name} skills` : 'Skill families'}>
                {!group &&
                    families.map(({ g, x, y }) => (
                        <g key={g.id}>
                            <line x1={CX} y1={CY} x2={x} y2={y} stroke={g.color} strokeWidth={4} strokeOpacity={0.55} />
                            <g
                                role="button"
                                tabIndex={0}
                                aria-label={`${g.name}: ${g.skills.length} skills`}
                                onClick={() => openFamily(g.id)}
                                onKeyDown={keys(() => openFamily(g.id))}
                                className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-gray-900"
                            >
                                {/* white under the tint, so the animated background never shows through the label */}
                                <circle cx={x} cy={y} r={46} fill="#ffffff" />
                                <circle cx={x} cy={y} r={46} fill={`${g.color}1f`} stroke={g.color} strokeWidth={3} />
                                <text x={x} y={y - 2} textAnchor="middle" fontSize={14} fontWeight={700} fill={g.color} className="select-none">
                                    {g.short}
                                </text>
                                <text x={x} y={y + 16} textAnchor="middle" fontSize={11.5} fill="#4b5563" className="select-none">
                                    {g.skills.length} skills
                                </text>
                            </g>
                        </g>
                    ))}

                {group &&
                    leaves.map(({ skill, x, y, w }) => {
                        const on = selected === skill
                        return (
                            <g key={skill}>
                                <line x1={CX} y1={CY} x2={x} y2={y} stroke={group.color} strokeWidth={on ? 4 : 2} strokeOpacity={on ? 0.9 : 0.35} />
                                <g
                                    role="button"
                                    tabIndex={0}
                                    aria-label={skill}
                                    aria-pressed={on}
                                    onClick={() => pick(skill, x, y)}
                                    onKeyDown={keys(() => pick(skill, x, y))}
                                    className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-gray-900"
                                >
                                    <rect x={r1(x - w / 2)} y={y - 15} width={w} height={30} rx={15} fill={on ? group.color : '#ffffff'} stroke={group.color} strokeWidth={2} />
                                    <text x={x} y={y + 5} textAnchor="middle" fontSize={13} fontWeight={600} fill={on ? '#ffffff' : group.color} className="select-none">
                                        {skill}
                                    </text>
                                </g>
                            </g>
                        )
                    })}

                {/* my photo in the middle, ringed with the family's colour when zoomed in */}
                <defs>
                    <clipPath id={clipId}>
                        <circle cx={CX} cy={CY} r={group ? 34 : 31} />
                    </clipPath>
                </defs>
                <circle cx={CX} cy={CY} r={group ? 38 : 35} fill="#0e1226" stroke={group ? group.color : '#8f7cff'} strokeWidth={4} />
                <image
                    href={ProfilePic.src}
                    x={CX - 34}
                    y={CY - 34}
                    width={68}
                    height={68}
                    clipPath={`url(#${clipId})`}
                    preserveAspectRatio="xMidYMid slice"
                />
                <circle ref={pulseRef} cx={0} cy={0} r={5} fill="#fde68a" stroke="#f59e0b" strokeWidth={1.5} opacity={0} pointerEvents="none" />
            </svg>
        </div>
    )
}
