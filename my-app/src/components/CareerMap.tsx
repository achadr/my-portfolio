"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { BsChevronLeft, BsChevronRight, BsPauseFill, BsPlayFill } from 'react-icons/bs'
import { careerPath, careerSpans, TIMELINE_FROM, TIMELINE_TO } from '../../lib/content'
import { experiencesData } from '../../lib/data'
import { LAND, MAP_H, MAP_W, project } from '../../lib/geo'
import { skillsInExperience } from '../../lib/relations'
import { useFocus } from '../../context/focus'

const ACCENT = '#4f46e5'
const N = careerPath.length
const LAST = N - 1
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

// Playback: every stop gets the same travel time, and a reading time that
// depends on the length of its text (so long descriptions stay on screen longer).
const TRAVEL_MS = 1100
const HOLD_BASE_MS = 2500
const HOLD_PER_CHAR_MS = 15
const holdFor = (stop: number) =>
    HOLD_BASE_MS + HOLD_PER_CHAR_MS * experiencesData[careerPath[stop].experience].description.length

/**
 * The map works in "progress" units: 0 is the first stop, 1 the second, and so
 * on. The slider and the animation use it, so every step takes the same time
 * whatever the number of years between two stops.
 */
const yearAt = (p: number) => {
    const k = Math.min(LAST - 1, Math.floor(p))
    const f = clamp01(p - k)
    return careerPath[k].year + (careerPath[k + 1].year - careerPath[k].year) * f
}

const LANE_H = 24
// Bars narrower than this (in % of the axis) cannot hold their label: it goes next to the bar.
const NARROW_PCT = 14

/** A real-scale timeline: year graduations, one lane per step, a marker for "now". */
function CareerTimeline({
    year,
    activeExperience,
    onSelect,
}: {
    year: number
    activeExperience: number
    onSelect: (experience: number) => void
}) {
    const span = TIMELINE_TO - TIMELINE_FROM
    const pct = (y: number) => ((y - TIMELINE_FROM) / span) * 100
    const years = Array.from({ length: span }, (_, i) => TIMELINE_FROM + i)
    const bodyH = careerSpans.length * LANE_H
    const marker = pct(Math.max(TIMELINE_FROM, Math.min(TIMELINE_TO, year)))

    return (
        <div className="px-3">
            <div role="group" aria-label="Career timeline" className="relative" style={{ height: bodyH + 24 }}>
                {years.map((y) => (
                    <React.Fragment key={y}>
                        <div className="absolute top-0 border-l border-black/10" style={{ left: `${pct(y)}%`, height: bodyH }} />
                        <span
                            className="absolute text-xs tabular-nums text-gray-600"
                            style={{ left: `${pct(y)}%`, top: bodyH + 6, transform: 'translateX(-50%)' }}
                        >
                            {y}
                        </span>
                    </React.Fragment>
                ))}
                <div className="absolute top-0 border-l border-black/10" style={{ left: '100%', height: bodyH }} />

                {careerSpans.map((s, i) => {
                    const isActive = s.experience === activeExperience
                    const done = year >= s.to
                    const left = pct(s.from)
                    const width = pct(s.to) - left
                    const narrow = width < NARROW_PCT
                    return (
                        // The whole lane is the button, so thin bars stay easy to click.
                        <button
                            key={s.experience}
                            type="button"
                            aria-pressed={isActive}
                            aria-label={`${s.label}, ${s.from > 2019 && s.to - s.from < 1 ? Math.floor(s.from) : `${Math.floor(s.from)} to ${s.to > TIMELINE_TO - 1 ? 'present' : Math.ceil(s.to) - 1}`}`}
                            onClick={() => onSelect(s.experience)}
                            className="group absolute left-0 w-full rounded-md outline-none transition-colors hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-gray-900"
                            style={{ top: i * LANE_H, height: LANE_H }}
                        >
                            <span
                                className={clsx(
                                    'absolute flex items-center overflow-hidden rounded-full text-xs font-medium transition-colors',
                                    isActive
                                        ? 'bg-indigo-600 text-white'
                                        : done
                                          ? 'bg-indigo-200 text-indigo-900 group-hover:bg-indigo-300'
                                          : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                                )}
                                style={{ left: `${left}%`, width: `${width}%`, top: 3, height: LANE_H - 6, paddingLeft: narrow ? 0 : 10 }}
                            >
                                {!narrow && s.label}
                            </span>
                            {narrow && (
                                <span
                                    className={clsx(
                                        'absolute whitespace-nowrap text-xs font-medium',
                                        isActive ? 'text-indigo-700' : 'text-gray-700'
                                    )}
                                    style={{ left: `calc(${left + width}% + 6px)`, top: 4 }}
                                >
                                    {s.label}
                                </span>
                            )}
                        </button>
                    )
                })}

                {/* "you are here" marker */}
                <div
                    className="pointer-events-none absolute top-0 w-0.5 bg-amber-500"
                    style={{ left: `${marker}%`, height: bodyH }}
                    aria-hidden="true"
                >
                    <span className="absolute -left-[3px] -top-1 h-2 w-2 rounded-full bg-amber-500" />
                </div>
            </div>
        </div>
    )
}

type Controller = { pause: () => unknown; play: () => unknown }
type Status = 'idle' | 'playing' | 'paused'

type Props = {
    /** Ask the map to jump to the stop of this experience (index in experiencesData). */
    jumpTo: { index: number; n: number } | null
}

export default function CareerMap({ jumpTo }: Props) {
    const { focusSkill } = useFocus()
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState<Status>('idle')

    const pts = useMemo(
        () =>
            careerPath.map((s) => {
                const p = project(s.lat, s.lon)
                return { x: p.x + (s.dx ?? 0), y: p.y + (s.dy ?? 0) }
            }),
        []
    )
    const segments = useMemo(
        () =>
            pts.slice(0, -1).map((a, k) => {
                const b = pts[k + 1]
                const mx = (a.x + b.x) / 2
                const my = (a.y + b.y) / 2
                const d = Math.hypot(b.x - a.x, b.y - a.y)
                return `M${a.x} ${a.y}Q${mx} ${my - d * 0.3} ${b.x} ${b.y}`
            }),
        [pts]
    )
    const skillsByStop = useMemo(() => careerPath.map((s) => skillsInExperience(s.experience)), [])

    const segRefs = useRef<Array<SVGPathElement | null>>([])
    const dotRef = useRef<SVGCircleElement>(null)
    const anim = useRef<Controller | null>(null)

    const fracs = segments.map((_, k) => clamp01(progress - k))
    // A stop becomes the active one when the dot arrives on it.
    const active = Math.min(LAST, Math.floor(progress + 1e-6))
    const year = yearAt(progress)
    const canPlayFromHere = progress > 0.01 && active < LAST

    // glowing dot follows the route
    useEffect(() => {
        const dot = dotRef.current
        if (!dot) return
        const cur = Math.min(segments.length - 1, Math.floor(progress))
        const path = segRefs.current[cur]
        if (!path) return
        const p = path.getPointAtLength(path.getTotalLength() * fracs[cur])
        dot.setAttribute('cx', String(p.x))
        dot.setAttribute('cy', String(p.y))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progress])

    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stopAnimation = () => {
        anim.current?.pause()
        anim.current = null
        setStatus('idle')
    }

    const goToStop = (i: number) => {
        stopAnimation()
        if (reduceMotion()) {
            setProgress(i)
            return
        }
        import('animejs').then(({ animate }) => {
            const state = { p: progress }
            anim.current = animate(state, {
                p: i,
                duration: 700,
                ease: 'inOutQuad',
                onUpdate: () => setProgress(state.p),
                onComplete: () => {
                    anim.current = null
                },
            })
        })
    }

    /** Plays the path from a given stop (the first one by default) to the last one. */
    const startPlayback = (from = 0) => {
        stopAnimation()
        setProgress(from)
        if (reduceMotion()) return
        setStatus('playing')
        import('animejs').then(({ animate }) => {
            const state = { p: from }
            // hold on the starting stop, then (travel, hold) for each following stop
            const keyframes: Array<{ to: number; duration: number; ease?: string }> = [
                { to: from, duration: holdFor(from) },
            ]
            for (let i = from + 1; i < N; i++) {
                keyframes.push({ to: i, duration: TRAVEL_MS, ease: 'inOutQuad' })
                keyframes.push({ to: i, duration: holdFor(i) })
            }
            anim.current = animate(state, {
                p: keyframes,
                onUpdate: () => setProgress(state.p),
                onComplete: () => {
                    anim.current = null
                    setStatus('idle')
                },
            })
        })
    }

    const onPlayButton = () => {
        if (status === 'playing') {
            anim.current?.pause()
            setStatus('paused')
        } else if (status === 'paused' && anim.current) {
            anim.current.play()
            setStatus('playing')
        } else {
            // after stepping or scrubbing, play on from the current stop; from the end, start over
            startPlayback(canPlayFromHere ? active : 0)
        }
    }

    // --- step by step, and a time scrubber ---
    const between = progress - active > 0.01 // the dot is travelling between two stops
    const prevStop = () => goToStop(between ? active : Math.max(0, active - 1))
    const nextStop = () => goToStop(Math.min(LAST, active + 1))
    const onScrub = (value: number) => {
        stopAnimation()
        setProgress(value)
    }
    // Arrow keys move one whole step (the native step of the range is far too small for that).
    const onScrubKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const actions: Record<string, () => void> = {
            ArrowLeft: prevStop,
            ArrowDown: prevStop,
            PageDown: prevStop,
            ArrowRight: nextStop,
            ArrowUp: nextStop,
            PageUp: nextStop,
            Home: () => goToStop(0),
            End: () => goToStop(LAST),
        }
        const action = actions[e.key]
        if (action) {
            e.preventDefault()
            action()
        }
    }

    // another section asked to show a given experience
    useEffect(() => {
        if (!jumpTo) return
        const i = careerPath.findIndex((s) => s.experience === jumpTo.index)
        if (i >= 0) goToStop(i)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jumpTo])

    useEffect(
        () => () => {
            anim.current?.pause()
        },
        []
    )

    return (
        // One column below lg (the timeline needs ~25rem of width), two columns from lg up.
        <div className="mx-auto grid w-full max-w-[53rem] gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
            <svg
                viewBox={`0 0 ${MAP_W} ${MAP_H}`}
                className="mx-auto h-auto w-full max-w-[22rem] rounded-xl border border-black/5 bg-white lg:mx-0 lg:max-w-none"
                // a group, not an image: the steps inside are buttons a screen reader must be able to reach
                role="group"
                aria-label="Schematic map of my career path from Rabat to France. The same steps are listed in the timeline view."
            >
                {[-10, -5, 0, 5, 10, 15].map((lo) => (
                    <line key={`lo${lo}`} x1={project(0, lo).x} x2={project(0, lo).x} y1={0} y2={MAP_H} stroke="#f1f5f9" />
                ))}
                {[30, 35, 40, 45, 50].map((la) => (
                    <line key={`la${la}`} y1={project(la, 0).y} y2={project(la, 0).y} x1={0} x2={MAP_W} stroke="#f1f5f9" />
                ))}
                {LAND.map((ring, i) => (
                    <polygon
                        key={i}
                        points={ring.map(([lon, lat]) => `${project(lat, lon).x},${project(lat, lon).y}`).join(' ')}
                        fill="#eef2f7"
                        stroke="#cbd5e1"
                        strokeWidth={1.2}
                    />
                ))}

                {segments.map((d, k) => (
                    <g key={k}>
                        <path d={d} fill="none" stroke="#cbd5e1" strokeDasharray="3 5" />
                        <path
                            ref={(el) => {
                                segRefs.current[k] = el
                            }}
                            d={d}
                            pathLength={1}
                            fill="none"
                            stroke={ACCENT}
                            strokeWidth={3}
                            strokeLinecap="round"
                            style={{ strokeDasharray: 1, strokeDashoffset: 1 - fracs[k] }}
                        />
                    </g>
                ))}

                {careerPath.map((s, i) => {
                    const lit = progress >= i
                    const isActive = i === active
                    const left = s.labelSide === 'left'
                    return (
                        <g
                            key={s.label}
                            role="button"
                            tabIndex={0}
                            aria-label={`${s.label}, ${Math.floor(s.year)}`}
                            aria-pressed={isActive}
                            onClick={() => goToStop(i)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    goToStop(i)
                                }
                            }}
                            className="group cursor-pointer outline-none"
                        >
                            <circle cx={pts[i].x} cy={pts[i].y} r={18} fill="transparent" />
                            <circle className="opacity-0 group-focus-visible:opacity-100" cx={pts[i].x} cy={pts[i].y} r={12} fill="none" stroke="#111827" strokeWidth={2} />
                            <circle
                                className="transition-all duration-200 group-hover:[r:8px]"
                                cx={pts[i].x}
                                cy={pts[i].y}
                                r={isActive ? 8 : 6}
                                fill={lit ? ACCENT : '#ffffff'}
                                stroke={ACCENT}
                                strokeWidth={2.5}
                            />
                            <text
                                x={pts[i].x + (left ? -12 : 12)}
                                y={pts[i].y + 4}
                                textAnchor={left ? 'end' : 'start'}
                                fontSize={12}
                                fontWeight={isActive ? 700 : 500}
                                fill="#1f2937"
                                className="pointer-events-none select-none"
                            >
                                {s.label}
                            </text>
                        </g>
                    )
                })}

                <circle ref={dotRef} r={7} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 5px rgba(245,158,11,.8))' }} />
            </svg>

            <div className="flex flex-col gap-4 text-left">
                <div className="flex items-end justify-between gap-4">
                    <div className="min-w-[5.5rem] text-5xl font-semibold tabular-nums" aria-live="polite">
                        {Math.floor(year)}
                    </div>
                    <button
                        type="button"
                        onClick={onPlayButton}
                        className="flex min-w-[11.5rem] items-center justify-center gap-1 rounded-full bg-gray-900 px-6 py-2.5 text-white transition hover:bg-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                        {status === 'playing' ? (
                            <><BsPauseFill aria-hidden="true" className="text-xl" />Pause</>
                        ) : status === 'paused' ? (
                            <><BsPlayFill aria-hidden="true" className="text-xl" />Resume</>
                        ) : (
                            <><BsPlayFill aria-hidden="true" className="text-xl" />{canPlayFromHere ? 'Play from here' : 'Play my path'}</>
                        )}
                    </button>
                </div>

                {/* step by step, or drag the handle to travel in time (arrow keys move one step) */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={prevStop}
                        disabled={progress < 0.01}
                        aria-label="Previous step"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white transition hover:border-gray-900/40 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
                    >
                        <BsChevronLeft aria-hidden="true" />
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={LAST}
                        step={0.01}
                        value={progress}
                        onChange={(e) => onScrub(Number(e.target.value))}
                        onKeyDown={onScrubKey}
                        aria-label="Travel through my career"
                        aria-valuetext={`${Math.floor(year)}, ${careerPath[active].label}`}
                        className="h-2 min-w-0 flex-1 cursor-pointer accent-indigo-600"
                    />
                    <button
                        type="button"
                        onClick={nextStop}
                        disabled={active >= LAST}
                        aria-label="Next step"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white transition hover:border-gray-900/40 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
                    >
                        <BsChevronRight aria-hidden="true" />
                    </button>
                    <span className="w-10 shrink-0 text-right text-sm tabular-nums text-gray-600" aria-hidden="true">
                        {active + 1}/{N}
                    </span>
                </div>

                <CareerTimeline
                    year={year}
                    activeExperience={careerPath[active].experience}
                    onSelect={(experience) => {
                        const i = careerPath.findIndex((s) => s.experience === experience)
                        if (i >= 0) goToStop(i)
                    }}
                />

                {/*
                  All the step cards share one grid cell, so the block always has the
                  height of the tallest one and never grows or shrinks between steps.
                */}
                <div className="grid">
                    {careerPath.map((s, i) => {
                        const experience = experiencesData[s.experience]
                        const skills = skillsByStop[i]
                        return (
                            <div
                                key={s.label}
                                aria-hidden={i !== active}
                                className={clsx(
                                    'col-start-1 row-start-1 rounded-xl border border-black/5 bg-gray-100 p-5',
                                    i !== active && 'invisible'
                                )}
                            >
                                <h3 className="text-lg font-semibold">{experience.title}</h3>
                                <p className="text-sm text-gray-700">
                                    {experience.location} · {experience.date}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-gray-700">{experience.description}</p>
                                {skills.length > 0 && (
                                    <div className="mt-3">
                                        <h4 className="text-xs font-medium uppercase tracking-wider text-gray-600">
                                            Skills used (click to see them in the tree)
                                        </h4>
                                        <ul className="mt-2 flex flex-wrap gap-2">
                                            {skills.map((skill) => (
                                                <li key={skill}>
                                                    <button
                                                        type="button"
                                                        onClick={() => focusSkill(skill)}
                                                        className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm transition hover:border-gray-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
                                                    >
                                                        {skill}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
