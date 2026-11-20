"use client"
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { BsArrowRight, BsXLg } from 'react-icons/bs'
import { careerPath, skillGroups, TIMELINE_FROM, type SkillName } from '../../../lib/content'
import { projectsData } from '../../../lib/data'
import { useRoom } from '../../../context/room'
import { TOUR_STEPS, useTour } from '../../../context/tour'
import CareerMap from '../CareerMap'
import SkillsTree from '../SkillsTree'
import GuidedTour from './GuidedTour'
import { MiniCareerMap, MiniSkillTree, RoomPreview } from './previews'

type Anime = typeof import('animejs')
type CardId = 'career' | 'skills' | 'room'
type Stat = { n?: number; text: string }

// Clickable objects of the 3D room: projects, skills, career, contact, guitar, cosmos, games.
const ROOM_OBJECTS = 7
const SKILL_COUNT = skillGroups.reduce((n, g) => n + g.skills.length, 0)

const CARDS: Array<{ id: CardId; title: string; promise: string; stats: Stat[]; action: string }> = [
    {
        id: 'career',
        title: 'Career',
        promise: 'From Rabat to Paris, step by step.',
        stats: [{ n: careerPath.length, text: 'steps' }, { text: `since ${TIMELINE_FROM}` }],
        action: 'Follow the path',
    },
    {
        id: 'skills',
        title: 'Skills',
        promise: 'Pick a skill, see the projects and jobs where I used it.',
        stats: [{ n: SKILL_COUNT, text: 'skills' }, { n: skillGroups.length, text: 'families' }],
        action: 'Explore the tree',
    },
    {
        id: 'room',
        title: '3D room',
        promise: 'Walk through my work: a monitor, a laptop, a map, a guitar.',
        stats: [{ n: ROOM_OBJECTS, text: 'objects' }, { n: projectsData.length, text: 'projects' }],
        action: 'Enter the room',
    },
]

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The three ways into my profile, under the intro. Career and Skills open in place
 * (the card grows into the real career map / skill tree, animated by Anime.js
 * Layout); the 3D room card opens the real room. Desktop only: phones get tabs.
 */
export default function ExplorerCards() {
    const rootRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const anime = useRef<Anime | null>(null)
    const layout = useRef<ReturnType<Anime['createLayout']> | null>(null)
    const pendingLayout = useRef(false)
    const focusAfter = useRef<string | null>(null)
    // stops the live previews; they restart whenever previews are mounted again (after closing a card)
    const stopLive = useRef<(() => void) | null>(null)
    const restartLive = () => {
        const A = anime.current
        const root = rootRef.current
        stopLive.current?.()
        stopLive.current = A && root && !reducedMotion() ? startLive(A, root, videoRef.current) : null
    }
    const [open, setOpen] = useState<CardId | null>(null)
    // "is-ready" lifts the pre-entrance hiding (globals.css). It must be part of the className
    // React renders: a class added by hand would be wiped out at the next render.
    const [ready, setReady] = useState(false)
    // content of the open card (real map / tree): shown once the card has reached its size
    const [contentShown, setContentShown] = useState(true)
    const [selectedSkill, setSelectedSkill] = useState<SkillName | null>(null)
    const [careerJump, setCareerJump] = useState<{ index: number; n: number } | null>(null)
    // what the guided tour asks the open card to show, applied once the card content is visible
    const [pending, setPending] = useState<{ skill?: SkillName; experience?: number } | null>(null)
    const sectionRef = useRef<HTMLElement>(null)
    const { openRoom } = useRoom()
    const { step } = useTour()

    // --- first appearance, then the live previews ---
    useEffect(() => {
        const root = rootRef.current
        if (!root) return
        let cancelled = false
        const stops: Array<() => void> = []
        const reveal = () => setReady(true)

        import('animejs')
            .then((A) => {
                if (cancelled) return
                anime.current = A
                const reduced = reducedMotion()
                if (!reduced) layout.current = A.createLayout(root, { children: '.xcard', duration: 600, ease: 'inOut(3)' })

                // The entrance plays on every page load, except for visitors who prefer reduced motion.
                if (reduced) {
                    reveal()
                    return
                }
                const tl = entrance(A, root)
                reveal()
                tl.then(() => {
                    if (cancelled) return
                    clearEntranceStyles(root)
                    restartLive()
                })
                stops.push(() => tl.revert())
            })
            .catch(reveal)

        return () => {
            cancelled = true
            stops.forEach((stop) => stop())
            stopLive.current?.()
            stopLive.current = null
            layout.current?.revert()
            layout.current = null
        }
        // restartLive only reads refs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // --- open / close in place: record the layout, change it, then animate between the two ---
    const change = (next: CardId | null) => {
        if (layout.current) {
            layout.current.record()
            pendingLayout.current = true
            // the real map / tree stay invisible while the card grows: the layout animation
            // stretches them during the transition, which looks broken
            setContentShown(false)
        }
        setOpen(next)
    }
    useLayoutEffect(() => {
        if (pendingLayout.current && layout.current) {
            pendingLayout.current = false
            layout.current.animate().then(() => setContentShown(true))
        } else {
            setContentShown(true)
        }
        if (focusAfter.current) {
            const id = focusAfter.current
            focusAfter.current = null
            rootRef.current?.querySelector<HTMLElement>(id)?.focus({ preventScroll: true })
        }
        // previews were unmounted / remounted: give the new ones their live loops
        if (stopLive.current) restartLive()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // --- guided tour: each step opens the right card and points it at a skill or a career step ---
    useEffect(() => {
        if (step < 0) return
        const show = TOUR_STEPS[step].show
        sectionRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
        if (show.card === 'room') return
        if (open !== show.card) {
            setSelectedSkill(null) // no pulse for an old skill while the card opens
            change(show.card)
        }
        setPending(show.card === 'skills' ? { skill: show.skill as SkillName } : { experience: show.experience })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step])
    // the skill pulse / the career journey start once the opened card shows its content
    useEffect(() => {
        if (!contentShown || !pending) return
        if (pending.skill) setSelectedSkill(pending.skill)
        if (pending.experience !== undefined) {
            const index = pending.experience
            setCareerJump((j) => ({ index, n: (j?.n ?? 0) + 1 }))
        }
        setPending(null)
    }, [contentShown, pending])

    const onCard = (id: CardId) => {
        if (id === 'room') return openRoom()
        focusAfter.current = `[data-card="${id}"] [data-close]`
        change(id)
    }
    const close = () => {
        focusAfter.current = `[data-card="${open}"] [data-open]`
        change(null)
    }

    // counters replay when the pointer enters a closed card
    const recount = (card: HTMLElement) => {
        const A = anime.current
        if (!A || reducedMotion() || card.dataset.state === 'open') return
        card.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
            const o = { v: 0 }
            A.animate(o, { v: Number(el.dataset.count), duration: 700, ease: 'out(3)', modifier: A.utils.round(0), onUpdate: () => (el.textContent = String(o.v)) })
        })
        A.animate(card.querySelector('.xgo')!, { translateX: [0, 6, 0], duration: 600, ease: 'out(3)' })
    }

    return (
        <section ref={sectionRef} aria-label="Explore my profile" className="mx-auto mt-14 hidden w-full max-w-[56rem] scroll-mt-28 md:block">
            <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-gray-600">Explore my profile</h2>
            <div ref={rootRef} className={clsx('xcards grid gap-3', ready && 'is-ready', open ? 'grid-cols-2' : 'grid-cols-3')}>
                {CARDS.map((c) => {
                    const state = open === c.id ? 'open' : open ? 'compact' : 'closed'
                    return (
                        <div
                            key={c.id}
                            data-card={c.id}
                            data-state={state}
                            onPointerEnter={(e) => recount(e.currentTarget)}
                            className={clsx(
                                'xcard relative flex overflow-hidden rounded-2xl border border-black/10 bg-white text-left shadow-[0_6px_18px_rgba(17,24,39,0.06)] transition-shadow hover:shadow-[0_14px_30px_rgba(17,24,39,0.12)]',
                                state === 'closed' && 'h-[18rem] flex-col',
                                state === 'compact' && 'h-[3.75rem] flex-row items-center',
                                state === 'open' && 'col-span-2 row-start-2 flex-col'
                            )}
                        >
                            {state !== 'open' && (
                                <button
                                    type="button"
                                    data-open=""
                                    onClick={() => onCard(c.id)}
                                    aria-expanded={c.id === 'room' ? undefined : false}
                                    aria-controls={c.id === 'room' ? undefined : `xcard-${c.id}`}
                                    aria-label={`${c.title}: ${c.promise} ${c.action}`}
                                    className="absolute inset-0 z-10 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                                />
                            )}

                            {state !== 'open' && (
                                <>
                                    <div
                                        className={clsx(
                                            'xpv relative overflow-hidden bg-[#0e1226]',
                                            // same image height on every card, whatever the length of its text
                                            state === 'closed' ? 'h-[8.5rem] shrink-0' : 'h-full w-[5.5rem] shrink-0'
                                        )}
                                    >
                                        {c.id === 'career' && <MiniCareerMap />}
                                        {c.id === 'skills' && <MiniSkillTree />}
                                        {c.id === 'room' && <RoomPreview ref={videoRef} />}
                                    </div>
                                    <div className={clsx('flex', state === 'closed' ? 'flex-1 flex-col gap-1 px-4 pb-4 pt-3' : 'flex-1 items-center gap-3 px-4')}>
                                        <h3 className="xttl whitespace-nowrap text-lg font-semibold">{c.title}</h3>
                                        {state === 'closed' && (
                                            <>
                                                {/* always two lines tall, so the stats and the action line up across the cards */}
                                                <p className="xpr line-clamp-2 min-h-[2.5rem] text-sm text-gray-600">{c.promise}</p>
                                                <p className="xst font-mono text-xs text-gray-500">
                                                    {c.stats.map((s, i) => (
                                                        <React.Fragment key={s.text}>
                                                            {i > 0 && ' · '}
                                                            {s.n !== undefined && (
                                                                <b className="text-sm text-gray-900" data-count={s.n}>
                                                                    {s.n}
                                                                </b>
                                                            )}{' '}
                                                            {s.text}
                                                        </React.Fragment>
                                                    ))}
                                                </p>
                                            </>
                                        )}
                                        <span className={clsx('xgo flex items-center gap-1 text-sm font-semibold text-indigo-600', state === 'compact' && 'ml-auto')}>
                                            {state === 'closed' ? c.action : 'Open'} <BsArrowRight aria-hidden="true" />
                                        </span>
                                    </div>
                                </>
                            )}

                            {state === 'open' && (
                                <div id={`xcard-${c.id}`} role="region" aria-label={c.title} className="flex flex-col">
                                    <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-gray-50 px-4 py-3">
                                        <h3 className="text-lg font-semibold">{c.title}</h3>
                                        <button
                                            type="button"
                                            data-close=""
                                            onClick={close}
                                            aria-label={`Close ${c.title}`}
                                            aria-expanded={true}
                                            aria-controls={`xcard-${c.id}`}
                                            className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm transition hover:border-gray-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
                                        >
                                            Close <BsXLg aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className={clsx('p-4 transition-opacity duration-300 sm:p-6', !contentShown && 'opacity-0')}>
                                        {c.id === 'career' && <CareerMap jumpTo={careerJump} />}
                                        {c.id === 'skills' && (
                                            <>
                                                <p className="mb-4 text-center text-sm text-gray-600">Pick a skill to see where I used it.</p>
                                                <SkillsTree selected={selectedSkill} onSelect={setSelectedSkill} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* outline drawn during the first appearance */}
                            <svg className="xbd pointer-events-none absolute inset-0 z-20 h-full w-full opacity-0" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                                <rect x="0.6" y="0.6" width="98.8" height="98.8" rx="5" fill="none" stroke="#4f46e5" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                            </svg>
                        </div>
                    )
                })}
            </div>
            <GuidedTour />
        </section>
    )
}

/**
 * First appearance: each card rises with a spring, its outline draws itself, the
 * preview is unveiled and builds up, then the title slides up from a mask and the
 * counters count. Every element gets its starting state before the cards are shown.
 */
function entrance(A: Anime, root: HTMLElement) {
    const { createTimeline, stagger, svg, utils, splitText, spring } = A
    const tl = createTimeline({ defaults: { ease: 'out(3)' } })
    root.querySelectorAll<HTMLElement>('.xcard').forEach((card, i) => {
        const base = i * 170
        const id = card.dataset.card
        const pv = card.querySelector<HTMLElement>('.xpv')!
        const outline = card.querySelector('.xbd rect')!
        const drawable = svg.createDrawable(outline)

        utils.set(card, { opacity: 0 })
        utils.set(drawable, { draw: '0 0' })
        utils.set(pv, { clipPath: 'inset(100% 0% 0% 0%)' })
        utils.set(card.querySelectorAll('.xpr, .xst, .xgo'), { opacity: 0 })
        card.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => (el.textContent = '0'))
        const title = splitText(card.querySelector<HTMLElement>('.xttl')!, { words: { wrap: 'clip' } })
        utils.set(title.words, { translateY: '100%' })

        tl.add(card, { opacity: [0, 1], translateY: [36, 0], ease: spring({ stiffness: 120, damping: 15 }) }, base)
            .add(card.querySelector('.xbd')!, { opacity: [1, 1], duration: 1 }, base + 60)
            .add(drawable, { draw: ['0 0', '0 1'], duration: 750, ease: 'inOut(2)' }, base + 80)
            .add(card.querySelector('.xbd')!, { opacity: [1, 0], duration: 500 }, base + 1150)
            .add(pv, { clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'], duration: 620 }, base + 220)

        if (id === 'career') {
            const route = pv.querySelector('.xroute')!
            const routeDraw = svg.createDrawable(route)
            utils.set(routeDraw, { draw: '0 0' })
            utils.set(pv.querySelectorAll('.xstop'), { scale: 0 })
            tl.add(routeDraw, { draw: ['0 0', '0 1'], duration: 900, ease: 'inOut(2)' }, base + 450)
                .add(pv.querySelectorAll('.xstop'), { scale: [0, 1.35, 1], duration: 420, delay: stagger(110) }, base + 450)
        }
        if (id === 'skills') {
            const lines = svg.createDrawable(pv.querySelectorAll('.xline'))
            utils.set(lines, { draw: '0 0' })
            utils.set(pv.querySelectorAll('.xme, .xgroup, .xleaf'), { scale: 0 })
            tl.add(pv.querySelector('.xme')!, { scale: [0, 1], ease: spring({ stiffness: 200, damping: 12 }) }, base + 420)
                .add(lines, { draw: ['0 0', '0 1'], duration: 380, delay: stagger(14) }, base + 520)
                .add(pv.querySelectorAll('.xgroup'), { scale: [0, 1], ease: spring({ stiffness: 220, damping: 12 }), delay: stagger(90) }, base + 600)
                .add(pv.querySelectorAll('.xleaf'), { scale: [0, 1], duration: 380, delay: stagger(22, { from: 'center' }) }, base + 720)
        }
        if (id === 'room') {
            utils.set(pv.querySelector('.xvideo')!, { opacity: 0, scale: 1.08 })
            tl.add(pv.querySelector('.xvideo')!, { opacity: [0, 1], scale: [1.08, 1], duration: 900 }, base + 380)
        }

        tl.add(title.words, { translateY: ['100%', '0%'], duration: 520, delay: stagger(60) }, base + 520)
            .add(card.querySelector('.xpr')!, { opacity: [0, 1], translateY: [8, 0], duration: 420 }, base + 680)
            .add(card.querySelector('.xst')!, { opacity: [0, 1], duration: 380 }, base + 740)
            .add(card.querySelector('.xgo')!, { opacity: [0, 1], translateX: [-10, 0], duration: 420 }, base + 900)
        card.querySelectorAll<HTMLElement>('[data-count]').forEach((el, j) => {
            const o = { v: 0 }
            tl.add(o, { v: Number(el.dataset.count), duration: 800, modifier: utils.round(0), onUpdate: () => (el.textContent = String(o.v)) }, base + 760 + j * 80)
        })
    })
    return tl
}

/**
 * Once the entrance is over, hand the cards back to their stylesheet: the layout
 * animation must measure them without leftover transforms. (utils.cleanInlineStyles
 * would restore the starting states set before the entrance, i.e. hide them again.)
 */
function clearEntranceStyles(root: HTMLElement) {
    root.querySelectorAll<HTMLElement | SVGElement>('.xcard, .xpv, .xbd, .xpr, .xst, .xgo, .xttl *').forEach((el) => {
        el.style.removeProperty('opacity')
        el.style.removeProperty('transform')
        el.style.removeProperty('clip-path')
    })
}

/**
 * Previews that keep moving once the cards are shown: the dot travels the career
 * route, the skill tree twinkles, the room video plays. Everything pauses while the
 * cards are off screen. Returns a cleanup function.
 */
function startLive(A: Anime, root: HTMLElement, video: HTMLVideoElement | null) {
    const loops: Array<ReturnType<Anime['animate']>> = []
    const route = root.querySelector<SVGPathElement>('[data-card="career"] .xroute')
    const dot = root.querySelector('[data-card="career"] .xdot')
    if (route && dot) {
        A.utils.set(dot, { opacity: 1 })
        loops.push(A.animate(dot, { ...A.svg.createMotionPath(route), duration: 6000, ease: 'inOut(1.2)', loop: true }))
    }
    const leaves = root.querySelectorAll('[data-card="skills"] .xleaf')
    if (leaves.length) {
        loops.push(A.animate(leaves, { opacity: [0.45, 1], scale: [0.8, 1.15], duration: 900, ease: 'inOut(2)', loop: true, alternate: true, delay: A.stagger(110, { from: 'random' }) }))
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
            loops.forEach((l) => (entry.isIntersecting ? l.play() : l.pause()))
            if (video) {
                if (entry.isIntersecting) video.play().catch(() => {})
                else video.pause()
            }
        },
        { threshold: 0.2 }
    )
    observer.observe(root)

    return () => {
        observer.disconnect()
        loops.forEach((l) => l.revert())
        video?.pause()
    }
}
