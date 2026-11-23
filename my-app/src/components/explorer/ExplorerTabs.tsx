"use client"
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import clsx from 'clsx'
import { BsArrowRight } from 'react-icons/bs'
import { careerPath, skillGroups, TIMELINE_FROM } from '../../../lib/content'
import { projectsData } from '../../../lib/data'
import type { SectionName } from '../../../lib/types'
import { useRoom } from '../../../context/room'
import { useActiveSectionContext } from '../../../context/active-section'
import { MiniCareerMap, MiniSkillTree, RoomPreview } from './previews'

const SKILL_COUNT = skillGroups.reduce((n, g) => n + g.skills.length, 0)
// same figure as the desktop "3D room" card
const ROOM_OBJECTS = 7

type Tab = { id: 'career' | 'skills' | 'room'; title: string; badge: string; promise: string; action: string }
const TABS: Tab[] = [
    { id: 'career', title: 'Career', badge: `${careerPath.length} steps · since ${TIMELINE_FROM}`, promise: 'From Rabat to Paris, step by step: schools, internships, Geotwin, freelance.', action: 'Follow the path' },
    { id: 'skills', title: 'Skills', badge: `${SKILL_COUNT} skills · ${skillGroups.length} families`, promise: 'Pick a skill, see the projects and jobs where I used it.', action: 'Explore my skills' },
    { id: 'room', title: '3D room', badge: `${ROOM_OBJECTS} objects · ${projectsData.length} projects`, promise: 'Walk through my work: a monitor, a laptop, a map, a telescope.', action: 'Enter the room' },
]
// gap between two cards of the carousel, in px (Tailwind gap-3)
const GAP = 12

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The explorer on phones: three tabs (career, skills, 3D room) over a row of cards that can also be
 * swiped. Same look as the desktop cards; each card leads to the real thing (a section of the page,
 * or the 3D room). Desktop gets the cards that open in place (ExplorerCards).
 */
export default function ExplorerTabs() {
    const [active, setActive] = useState(0)
    const trackRef = useRef<HTMLDivElement>(null)
    const sectionRef = useRef<HTMLElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
    const uid = useId()
    const { openRoom } = useRoom()
    const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext()

    const show = useCallback((i: number) => {
        const track = trackRef.current
        const panel = track?.children[i] as HTMLElement | undefined
        if (!track || !panel) return
        track.scrollTo({ left: panel.offsetLeft - track.offsetLeft - (track.clientWidth - panel.clientWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' })
        setActive(i)
    }, [])

    // swiping the cards moves the tabs along
    useEffect(() => {
        const track = trackRef.current
        if (!track) return
        let raf = 0
        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const first = track.children[0] as HTMLElement | undefined
                if (!first) return
                setActive(Math.max(0, Math.min(TABS.length - 1, Math.round(track.scrollLeft / (first.clientWidth + GAP)))))
            })
        }
        track.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            cancelAnimationFrame(raf)
            track.removeEventListener('scroll', onScroll)
        }
    }, [])

    // the room video only plays while its card is shown and on screen (and never for reduced motion)
    useEffect(() => {
        const video = videoRef.current
        const section = sectionRef.current
        if (!video || !section) return
        let visible = false
        const sync = () => {
            if (active === 2 && visible && !reducedMotion()) {
                if (video.preload !== 'auto') video.preload = 'auto'
                video.play().catch(() => {})
            } else video.pause()
        }
        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting
            sync()
        })
        io.observe(section)
        sync()
        return () => {
            io.disconnect()
            video.pause()
        }
    }, [active])

    const goSection = (id: string, name: SectionName) => {
        setActiveSection(name)
        setTimeOfLastClick(Date.now())
        document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
    }
    const act = (id: Tab['id']) => {
        if (id === 'career') goSection('experience', 'Experience')
        else if (id === 'skills') goSection('skills', 'Skills')
        else openRoom()
    }

    // tabs keyboard pattern: arrows move between tabs, Home / End jump to the ends
    const onTabKey = (e: React.KeyboardEvent, i: number) => {
        const to = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : null
        if (to === null) return
        e.preventDefault()
        const n = (to + TABS.length) % TABS.length
        show(n)
        tabRefs.current[n]?.focus()
    }

    return (
        <section ref={sectionRef} aria-label="Explore my profile" className="mt-12 w-full max-w-[26rem] scroll-mt-28 md:hidden">
            <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-gray-600">Explore my profile</h2>

            <div role="tablist" aria-label="Explore my profile" className="relative grid grid-cols-3 rounded-full border border-black/10 bg-white p-1 shadow-[0_4px_12px_rgba(17,24,39,0.05)]">
                <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-gray-900 transition-transform duration-300 ease-[cubic-bezier(.3,1.3,.5,1)] motion-reduce:transition-none"
                    style={{ transform: `translateX(${active * 100}%)` }}
                />
                {TABS.map((t, i) => (
                    <button
                        key={t.id}
                        ref={(el) => {
                            tabRefs.current[i] = el
                        }}
                        type="button"
                        role="tab"
                        id={`${uid}-tab-${t.id}`}
                        aria-selected={active === i}
                        aria-controls={`${uid}-panel-${t.id}`}
                        tabIndex={active === i ? 0 : -1}
                        onClick={() => show(i)}
                        onKeyDown={(e) => onTabKey(e, i)}
                        className={clsx(
                            'relative z-10 rounded-full py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                            active === i ? 'text-white' : 'text-gray-600'
                        )}
                    >
                        {t.title}
                    </button>
                ))}
            </div>

            <div ref={trackRef} className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden">
                {TABS.map((t, i) => (
                    <article
                        key={t.id}
                        role="tabpanel"
                        id={`${uid}-panel-${t.id}`}
                        aria-labelledby={`${uid}-tab-${t.id}`}
                        // a card swiped out of view stays visible but out of the keyboard's way
                        inert={active !== i}
                        className="w-full shrink-0 snap-center overflow-hidden rounded-2xl border border-black/10 bg-white text-left shadow-[0_6px_18px_rgba(17,24,39,0.06)]"
                    >
                        <div className="relative h-[11.5rem] overflow-hidden bg-[#0e1226]">
                            {t.id === 'career' && <MiniCareerMap />}
                            {t.id === 'skills' && <MiniSkillTree />}
                            {t.id === 'room' && <RoomPreview ref={videoRef} />}
                            <span className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-[#0e1226]/70 px-2.5 py-0.5 text-[11px] text-white backdrop-blur-sm">{t.badge}</span>
                        </div>
                        <div className="px-4 pb-4 pt-3.5">
                            <h3 className="text-lg font-semibold">{t.title}</h3>
                            <p className="mt-1 text-sm text-gray-600">{t.promise}</p>
                            {t.id === 'skills' && (
                                <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Skill families">
                                    {skillGroups.map((g) => (
                                        <li key={g.id} className="rounded-full border px-2.5 py-0.5 text-xs font-medium" style={{ borderColor: g.color, color: g.color, backgroundColor: `${g.color}12` }}>
                                            {g.short} · {g.skills.length}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button
                                type="button"
                                onClick={() => act(t.id)}
                                className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-[15px] font-semibold text-white transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                {t.action} <BsArrowRight aria-hidden="true" />
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
                {TABS.map((t, i) => (
                    <span key={t.id} className={clsx('h-1.5 rounded-full transition-all duration-300', active === i ? 'w-[18px] bg-gray-900' : 'w-1.5 bg-gray-300')} />
                ))}
            </div>
        </section>
    )
}
