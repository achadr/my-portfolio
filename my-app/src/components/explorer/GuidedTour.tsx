"use client"
import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { TOUR_STEPS, useTour } from '../../../context/tour'
import { useRoom } from '../../../context/room'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The narrator of the guided tour (a panel at the bottom of the screen) and the halo
 * that lands on what to look at. The explorer cards do the showing (ExplorerCards
 * reacts to the same step); this component only tells and points.
 */
export default function GuidedTour() {
    const { step, next, prev, stop } = useTour()
    const { openRoom } = useRoom()
    const textRef = useRef<HTMLParagraphElement>(null)
    const haloRef = useRef<HTMLDivElement>(null)
    const nextRef = useRef<HTMLButtonElement>(null)
    const current = step >= 0 ? TOUR_STEPS[step] : null
    const last = step === TOUR_STEPS.length - 1

    // when the tour ends, the keyboard focus goes back to the button that started it
    const wasRunning = useRef(false)
    useEffect(() => {
        if (step >= 0) wasRunning.current = true
        else if (wasRunning.current) {
            wasRunning.current = false
            if (!document.querySelector('[data-room-overlay]')) {
                document.querySelector<HTMLElement>('[data-tour-start]')?.focus({ preventScroll: true })
            }
        }
    }, [step])

    // keyboard: the narrator gets the focus when the tour starts; Escape ends the tour
    useEffect(() => {
        if (step < 0) return
        nextRef.current?.focus({ preventScroll: true })
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !document.querySelector('[data-room-overlay]')) stop()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [step, stop])

    // the sentence appears word by word
    useEffect(() => {
        const el = textRef.current
        if (!el || step < 0 || reducedMotion()) return
        let split: { revert: () => unknown } | null = null
        let cancelled = false
        import('animejs').then(({ splitText, animate, stagger }) => {
            if (cancelled) return
            const s = splitText(el, { words: true })
            split = s
            animate(s.words, { opacity: [0, 1], translateY: [10, 0], duration: 380, ease: 'out(3)', delay: stagger(40) })
        })
        return () => {
            cancelled = true
            split?.revert()
        }
    }, [step])

    // the halo follows its target every frame (the page scrolls, cards grow...) once the step had time to show it
    useEffect(() => {
        const halo = haloRef.current
        if (!halo || !current) return
        const shownAt = performance.now() + current.haloDelay
        let raf = 0
        const follow = () => {
            const target = document.querySelector<HTMLElement | SVGElement>(current.target)
            const r = target?.getBoundingClientRect()
            if (r && r.width > 0 && performance.now() >= shownAt) {
                const pad = 8
                halo.style.left = `${r.left - pad}px`
                halo.style.top = `${r.top - pad}px`
                halo.style.width = `${r.width + pad * 2}px`
                halo.style.height = `${r.height + pad * 2}px`
                halo.style.opacity = '1'
            } else {
                halo.style.opacity = '0'
            }
            raf = requestAnimationFrame(follow)
        }
        halo.style.opacity = '0'
        raf = requestAnimationFrame(follow)
        return () => cancelAnimationFrame(raf)
    }, [current])

    if (!current) return null

    const enterRoom = () => {
        stop()
        openRoom()
    }
    const contact = () => {
        stop()
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <>
            <div
                ref={haloRef}
                aria-hidden="true"
                className="tour-halo pointer-events-none fixed z-[890] rounded-xl border-[3px] border-amber-400 opacity-0 transition-opacity duration-300"
            />
            <div
                role="dialog"
                aria-label="Guided tour"
                className="fixed bottom-4 left-1/2 z-[900] w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl bg-gray-900 p-5 text-left text-white shadow-2xl"
            >
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-300">
                    Tour · {step + 1} / {TOUR_STEPS.length}
                </p>
                <p key={step} ref={textRef} className="mt-2 text-lg leading-snug" aria-live="polite">
                    {current.text}
                </p>
                {last && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={enterRoom} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
                            Enter the room →
                        </button>
                        <button type="button" onClick={contact} className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
                            Contact me →
                        </button>
                    </div>
                )}
                <div className="mt-4 flex items-center gap-2">
                    <div className="flex gap-1.5" aria-hidden="true">
                        {TOUR_STEPS.map((_, i) => (
                            <span key={i} className={clsx('h-1 w-6 rounded-full', i <= step ? 'bg-indigo-300' : 'bg-gray-700')} />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={prev}
                        disabled={step === 0}
                        aria-label="Previous step of the tour"
                        className="ml-auto rounded-full border border-gray-600 px-3 py-1.5 text-sm transition hover:border-gray-400 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                    >
                        ←
                    </button>
                    <button
                        ref={nextRef}
                        type="button"
                        onClick={next}
                        className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                    >
                        {last ? 'Finish' : 'Next →'}
                    </button>
                    <button
                        type="button"
                        onClick={stop}
                        className="rounded-full px-3 py-1.5 text-sm text-gray-300 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </>
    )
}
