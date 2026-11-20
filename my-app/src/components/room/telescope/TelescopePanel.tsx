"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { BsArrowLeft, BsArrowRight, BsRocketTakeoff, BsStars } from 'react-icons/bs'
import { TELESCOPE_INTRO, TELESCOPE_NOW, TELESCOPE_STATUS, TELESCOPE_STEPS as STEPS } from '../../../../lib/telescope'
import { Sky } from './sky'

const LAST = STEPS.length - 1

// Buttons in the style of the night sky: translucent glass, and a golden glow for the way forward
// (the same gold as the "you are here" star).
const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300'
const glassBtn = clsx(
    'inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-400/[0.08] px-4 py-2 text-sm text-indigo-50 backdrop-blur transition hover:border-indigo-200/70 hover:bg-indigo-400/20 disabled:pointer-events-none disabled:opacity-30',
    focusRing
)
const glowBtn = clsx(
    'group inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-300/10 px-5 py-2 text-sm text-amber-50 shadow-[0_0_24px_-6px_#fcd34d88] transition hover:border-amber-200 hover:bg-amber-300/20 hover:shadow-[0_0_30px_-4px_#fcd34daa]',
    focusRing
)
const clampStep = (v: number) => Math.max(0, Math.min(LAST, v))

type Props = {
    /** The call to action at the end: opens the contact panel of the room. */
    onContact: () => void
}

/**
 * The telescope of the 3D room: my path through the stack, from the pixel to the cloud.
 * It opens on the constellation; then the visitor travels from one object to the next at their own
 * pace: the "next stop" button says where it goes, the route under the eyepiece shows where they are,
 * and the wheel, a drag or the arrow keys travel too.
 */
export default function TelescopePanel({ onContact }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const eyeRef = useRef<HTMLDivElement>(null)
    const [travelling, setTravelling] = useState(false)
    const [step, setStep] = useState(TELESCOPE_NOW)
    const [visited, setVisited] = useState<Set<number>>(() => new Set())

    // Everything that changes every frame lives in a ref, so the animation never re-renders React.
    const live = useRef({ travelling: false, pos: 0, target: 0, lastInput: 0, flash: 0, dragging: false, shown: TELESCOPE_NOW })
    const skyRef = useRef<Sky | null>(null)
    const reducedRef = useRef(false)

    const goTo = useCallback((i: number) => {
        live.current.target = clampStep(i)
        live.current.lastInput = 0
    }, [])

    const start = useCallback((i: number) => {
        const l = live.current
        l.travelling = true
        // the first object arrives from the depth of space
        l.pos = i - 1.3
        l.target = i
        l.shown = i
        setStep(i)
        setTravelling(true)
    }, [])

    const overview = useCallback(() => {
        const l = live.current
        l.travelling = false
        l.flash = performance.now()
        if (skyRef.current) skyRef.current.t0 = performance.now()
        l.shown = TELESCOPE_NOW
        setStep(TELESCOPE_NOW)
        setTravelling(false)
    }, [])

    // the drawing loop
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const sky = new Sky(canvas, reducedRef.current)
        skyRef.current = sky
        sky.resize()
        sky.t0 = performance.now()
        const ro = new ResizeObserver(() => sky.resize())
        ro.observe(canvas)
        let raf = 0
        let last = performance.now()
        const frame = (t: number) => {
            const l = live.current
            const dt = Math.min(0.05, (t - last) / 1000)
            last = t
            if (!l.travelling) {
                sky.constellation(t)
                sky.veil((t - l.flash) / 450)
            } else {
                // when the hand stops, settle on the nearest object
                if (!l.dragging && performance.now() - l.lastInput > 350) l.target = Math.round(l.target)
                const before = l.pos
                l.pos += (l.target - l.pos) * (reducedRef.current ? 1 : Math.min(1, dt * 3))
                const speed = (l.pos - before) / Math.max(dt, 0.001)
                const cur = clampStep(Math.round(l.pos))
                if (cur !== l.shown) {
                    l.shown = cur
                    setStep(cur)
                }
                sky.journey(t, l.pos, speed, dt)
            }
            raf = requestAnimationFrame(frame)
        }
        raf = requestAnimationFrame(frame)
        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
        }
    }, [])

    // remember the stops already seen, to light them up on the route
    useEffect(() => {
        if (!travelling) return
        setVisited((v) => (v.has(step) ? v : new Set(v).add(step)))
    }, [step, travelling])

    // wheel or drag on the eyepiece: travel freely, then settle on the nearest object
    useEffect(() => {
        const eye = eyeRef.current
        if (!eye) return
        const l = live.current
        let dragY: number | null = null
        const S = () => eye.clientWidth || 400
        const onDown = (e: PointerEvent) => {
            if (!l.travelling || e.button !== 0) return
            dragY = e.clientY
            l.dragging = true
            eye.setPointerCapture(e.pointerId)
        }
        const onMove = (e: PointerEvent) => {
            if (dragY === null) return
            l.target = clampStep(l.target + (dragY - e.clientY) / (S() * 0.7))
            l.lastInput = performance.now()
            dragY = e.clientY
        }
        const onUp = () => {
            dragY = null
            l.dragging = false
        }
        const onWheel = (e: WheelEvent) => {
            if (!l.travelling) return
            e.preventDefault()
            l.target = clampStep(l.target + e.deltaY * 0.0016)
            l.lastInput = performance.now()
        }
        eye.addEventListener('pointerdown', onDown)
        eye.addEventListener('pointermove', onMove)
        eye.addEventListener('pointerup', onUp)
        eye.addEventListener('pointercancel', onUp)
        eye.addEventListener('wheel', onWheel, { passive: false })
        return () => {
            eye.removeEventListener('pointerdown', onDown)
            eye.removeEventListener('pointermove', onMove)
            eye.removeEventListener('pointerup', onUp)
            eye.removeEventListener('pointercancel', onUp)
            eye.removeEventListener('wheel', onWheel)
        }
    }, [])

    // keyboard. Listening in the capture phase lets Escape go back to the constellation
    // before the room's own Escape (which closes the panel) sees it.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const l = live.current
            if (!l.travelling) {
                if (e.key === 'ArrowRight') start(0)
                return
            }
            if (e.key === 'Escape') {
                e.stopPropagation()
                overview()
            } else if (e.key === 'ArrowRight') goTo(Math.round(l.target) + 1)
            else if (e.key === 'ArrowLeft') goTo(Math.round(l.target) - 1)
        }
        window.addEventListener('keydown', onKey, true)
        return () => window.removeEventListener('keydown', onKey, true)
    }, [start, overview, goTo])

    const s = STEPS[step]
    const next = step < LAST ? STEPS[step + 1] : null
    const prev = step > 0 ? STEPS[step - 1] : null

    return (
        <div className="grid min-h-full gap-0 bg-[#0f1220] text-white md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col items-center justify-center gap-4 border-b border-white/10 bg-[#080a14] px-4 py-6 md:border-b-0 md:border-r">
                <div
                    ref={eyeRef}
                    role="img"
                    aria-label={travelling ? `Through the telescope: ${s.object}` : 'Through the telescope: the constellation of my path'}
                    className={clsx(
                        'relative aspect-square w-[min(400px,80vw)] touch-none select-none overflow-hidden rounded-full shadow-[0_0_0_8px_#1a1d2e,0_0_0_10px_#3b3f5c,inset_0_0_80px_#6366f144]',
                        travelling && 'cursor-grab active:cursor-grabbing'
                    )}
                >
                    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
                    {/* the dark edge of the eyepiece */}
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_60%,#000d_73%)]" />
                    {!travelling &&
                        STEPS.map((st, i) => (
                            <button
                                key={st.label}
                                type="button"
                                onClick={() => start(i)}
                                aria-label={`${st.title}: travel there`}
                                className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                                style={{ left: `${st.x}%`, top: `${st.y}%` }}
                            >
                                <span className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap text-[11px] text-indigo-200 [text-shadow:0_1px_4px_#000]">
                                    {st.label}
                                </span>
                            </button>
                        ))}
                    {travelling && (
                        <span className="pointer-events-none absolute bottom-[15%] left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-indigo-200 [text-shadow:0_1px_4px_#000]">
                            {s.object}
                        </span>
                    )}
                </div>

                {!travelling ? (
                    <>
                        <button type="button" onClick={() => start(0)} className={glowBtn}>
                            <BsRocketTakeoff aria-hidden="true" className="text-base" />
                            Start the journey
                        </button>
                        <p className="text-center text-xs text-white/50">Six stops, at your own pace. Or click a star to go straight there.</p>
                    </>
                ) : (
                    <>
                        {/* the route: where I am, where I've been, where I can go. Names sit above the dots,
                            so they never fall behind the buttons below. */}
                        <nav aria-label="Route" className="w-[min(360px,72vw)] pt-7">
                            <ol className="relative flex items-center justify-between">
                                <span aria-hidden="true" className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-indigo-300/50 via-indigo-300/50 to-cyan-300/40" />
                                {STEPS.map((st, i) => {
                                    const here = i === step
                                    return (
                                        <li key={st.label} className="relative flex">
                                            <button
                                                type="button"
                                                onClick={() => goTo(i)}
                                                aria-label={`${st.title}${here ? ' (you are here)' : ''}`}
                                                aria-current={here ? 'step' : undefined}
                                                className={clsx('group relative flex h-6 w-6 items-center justify-center rounded-full', focusRing)}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={clsx(
                                                        'block rounded-full transition',
                                                        here ? 'h-3.5 w-3.5 bg-amber-300 shadow-[0_0_12px_#fcd34d]' : 'h-2.5 w-2.5 group-hover:scale-150',
                                                        !here && (visited.has(i) ? 'bg-indigo-200' : 'border border-indigo-300/70 bg-[#080a14]'),
                                                        st.status === 'next' && !here && 'border-dashed border-cyan-300'
                                                    )}
                                                />
                                                <span
                                                    aria-hidden="true"
                                                    className={clsx(
                                                        'pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] transition',
                                                        here
                                                            ? 'text-amber-200'
                                                            : 'bg-[#141833] text-indigo-100 opacity-0 ring-1 ring-indigo-300/30 group-hover:opacity-100 group-focus-visible:opacity-100'
                                                    )}
                                                >
                                                    {st.label}
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ol>
                        </nav>

                        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                            <button type="button" onClick={() => goTo(step - 1)} disabled={!prev} aria-label={prev ? `Back to: ${prev.object}` : 'Back'} className={clsx(glassBtn, 'px-3')}>
                                <BsArrowLeft aria-hidden="true" />
                            </button>
                            {next ? (
                                // the destination stays a surprise on screen; screen readers still hear where it goes
                                <button type="button" onClick={() => goTo(step + 1)} aria-label={`Next stop: ${next.object}`} className={glowBtn}>
                                    Next stop
                                    <BsArrowRight aria-hidden="true" className="transition group-hover:translate-x-0.5" />
                                </button>
                            ) : (
                                <button type="button" onClick={onContact} className={glowBtn}>
                                    End of the road, for now. Let&apos;s talk
                                    <BsArrowRight aria-hidden="true" className="transition group-hover:translate-x-0.5" />
                                </button>
                            )}
                            <button type="button" onClick={overview} className={glassBtn}>
                                <BsStars aria-hidden="true" />
                                Constellation
                            </button>
                        </div>
                        <p className="text-center text-xs text-white/50">You can also scroll, drag or use ← → to travel.</p>
                    </>
                )}
            </div>

            <div className="flex flex-col gap-3 p-6">
                <span className="text-xs uppercase tracking-[0.12em] text-indigo-300">Telescope · Next horizon</span>
                <h3 className="text-2xl font-semibold leading-tight">{TELESCOPE_INTRO.title}</h3>
                <p className="text-indigo-50/90">{TELESCOPE_INTRO.text}</p>

                <div className="min-h-[10rem] rounded-xl border border-white/10 bg-[#0b0e1b] px-4 py-3.5" aria-live="polite">
                    <p className="text-xs uppercase tracking-wider text-white/50">
                        Stop {step + 1} / {STEPS.length}
                        <span
                            className={clsx(
                                'ml-2 inline-block rounded-full px-2 py-px align-middle text-[11px] normal-case tracking-normal',
                                s.status === 'done' && 'bg-indigo-900 text-indigo-200',
                                s.status === 'now' && 'bg-amber-900 text-amber-200',
                                s.status === 'next' && 'bg-cyan-900 text-cyan-200'
                            )}
                        >
                            {TELESCOPE_STATUS[s.status]}
                        </span>
                    </p>
                    <h4 className="mt-1 text-lg font-semibold">{s.title}</h4>
                    <p className="mb-1.5 text-xs italic text-cyan-300">{s.object}</p>
                    <p className="text-sm leading-relaxed text-indigo-50/90">{s.text}</p>
                    {s.chips.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Technologies">
                            {s.chips.map((c) => (
                                <li key={c} className="rounded-full border border-white/15 px-2 py-px text-[11px] text-slate-300">
                                    {c}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mt-auto pt-2">
                    <button type="button" onClick={onContact} className={glowBtn}>
                        Let&apos;s build what&apos;s next
                        <BsArrowRight aria-hidden="true" className="transition group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
