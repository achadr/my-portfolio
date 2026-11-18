"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { RoomTarget } from './RoomScene'
import ProjectsPanel from './ProjectsPanel'
import SkillsTree from '../SkillsTree'
import CareerMap from '../CareerMap'
import ContactForm from '../ContactForm'
import clsx from 'clsx'
import { useFocus } from '../../../context/focus'
import type { SkillName } from '../../../lib/content'
import { CONTACT_EMAIL } from '../../../lib/contact'
import { projectsData } from '../../../lib/data'

// The 3D scene (three.js) is only downloaded when the room is opened.
const RoomScene = dynamic(() => import('./RoomScene'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center text-sm text-white/70" role="status">
            Loading the room…
        </div>
    ),
})

/** Sections of the regular page, used by the "open on the page" escape hatch. */
export type SectionId = 'projects' | 'skills' | 'experience' | 'contact'
type PanelId = 'projects' | 'skills' | 'career' | 'contact'

const PANEL_OF: Partial<Record<RoomTarget, PanelId>> = {
    projects: 'projects',
    skills: 'skills',
    career: 'career',
    contact: 'contact',
}
const SECTION_OF_PANEL: Record<PanelId, SectionId> = {
    projects: 'projects',
    skills: 'skills',
    career: 'experience',
    contact: 'contact',
}
const PANEL_TITLE: Record<PanelId, { title: string; object: string }> = {
    projects: { title: 'My projects', object: 'Monitor' },
    skills: { title: 'My skills', object: 'Laptop' },
    career: { title: 'My career', object: 'Wall map' },
    contact: { title: 'Contact me', object: 'Letter' },
}

const HOBBIES: Partial<Record<RoomTarget, { title: string; text: string }>> = {
    guitar: { title: 'Guitar', text: "I'm currently on a mission to master the guitar." },
    cosmos: { title: 'Cosmos', text: "I'm fascinated by the cosmos. It is the theme of this whole portfolio." },
    games: { title: 'Video games', text: "I'm competitive in video games, which keeps my reflexes and attention to detail sharp." },
}

const LINKS: Array<{ id: PanelId; label: string; hint: string }> = [
    { id: 'projects', label: 'Projects', hint: `${projectsData.length} applications, online` },
    { id: 'skills', label: 'Skills', hint: 'An interactive skill tree' },
    { id: 'career', label: 'Career', hint: 'A map and a timeline of my path' },
    { id: 'contact', label: 'Contact', hint: 'Send me a message' },
]

function webglAvailable() {
    try {
        const c = document.createElement('canvas')
        return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
        return false
    }
}

type Props = {
    onClose: () => void
    /** Leave the room and scroll to a section of the regular page. */
    onNavigate: (section: SectionId) => void
    /** Object to fly to as soon as the room is ready (a panel or a hobby). */
    initialFocus?: RoomTarget
}

export default function RoomOverlay({ onClose, onNavigate, initialFocus }: Props) {
    const rootRef = useRef<HTMLDivElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const [supported, setSupported] = useState<boolean | null>(null)
    const [reduced, setReduced] = useState(false)
    const [focus, setFocus] = useState<RoomTarget | null>(null)
    const [panel, setPanel] = useState<PanelId | null>(null)
    const [selectedSkill, setSelectedSkill] = useState<SkillName | null>(null)
    const [contactMounted, setContactMounted] = useState(false)
    const [careerJump, setCareerJump] = useState<{ index: number; n: number } | null>(null)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const { skill: skillRequest, experience: experienceRequest } = useFocus()
    // Requests made before the room opened are not ours: only react to new ones.
    const seen = useRef({ skill: skillRequest?.n ?? 0, experience: experienceRequest?.n ?? 0 })

    const hobby = focus ? HOBBIES[focus] : undefined

    useEffect(() => {
        setSupported(webglAvailable())
        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        closeRef.current?.focus()
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prevOverflow
            if (timer.current) clearTimeout(timer.current)
        }
    }, [])

    // fade in (skipped when the visitor prefers reduced motion)
    useEffect(() => {
        const el = rootRef.current
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        let cancelled = false
        import('animejs').then(({ animate }) => {
            if (!cancelled) animate(el, { opacity: [0, 1], duration: 350, ease: 'outQuad' })
        })
        return () => {
            cancelled = true
        }
    }, [])

    // a panel slides in each time it opens
    useEffect(() => {
        const el = panelRef.current
        if (!panel || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        let cancelled = false
        import('animejs').then(({ animate }) => {
            if (!cancelled) animate(el, { opacity: [0, 1], translateY: [24, 0], duration: 380, ease: 'outCubic' })
        })
        return () => {
            cancelled = true
        }
    }, [panel])

    // Keep the contact form alive after its first opening: closing the panel must not throw a typed message away.
    useEffect(() => {
        if (panel !== 'contact') return
        setContactMounted(true)
        const id = setTimeout(() => {
            panelRef.current?.querySelector<HTMLInputElement>('input[type="email"]')?.focus()
        }, 80)
        return () => clearTimeout(id)
    }, [panel])

    // The skill tree and the career map point at each other through the shared focus context.
    useEffect(() => {
        if (!skillRequest || skillRequest.n === seen.current.skill) return
        seen.current.skill = skillRequest.n
        setSelectedSkill(skillRequest.name)
        setFocus('skills')
        setPanel('skills')
    }, [skillRequest])
    useEffect(() => {
        if (!experienceRequest || experienceRequest.n === seen.current.experience) return
        seen.current.experience = experienceRequest.n
        setCareerJump(experienceRequest)
        setFocus('career')
        setPanel('career')
    }, [experienceRequest])

    const openPanel = useCallback(
        (id: PanelId) => {
            if (timer.current) clearTimeout(timer.current)
            setFocus(id)
            // let the camera fly to the object before the panel opens
            timer.current = setTimeout(() => setPanel(id), reduced || !supported ? 0 : 650)
        },
        [reduced, supported]
    )

    const select = useCallback(
        (id: RoomTarget) => {
            const p = PANEL_OF[id]
            if (p) openPanel(p)
            else setFocus(id)
        },
        [openPanel]
    )

    // Opened on a given object (e.g. a hobby link): go there once we know whether WebGL works,
    // so the camera flies to it and the panel waits for the flight like a normal click.
    const started = useRef(false)
    useEffect(() => {
        if (started.current || supported === null || !initialFocus) return
        started.current = true
        select(initialFocus)
    }, [supported, initialFocus, select])

    const back = useCallback(() => {
        if (timer.current) clearTimeout(timer.current)
        setPanel(null)
        setFocus(null)
    }, [])

    // Escape: step back (panel, then object), then close. Tab stays inside the dialog.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (panel || hobby) back()
                else onClose()
            } else if (e.key === 'Tab') {
                const nodes = rootRef.current?.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), a[href], input:not([tabindex="-1"]), textarea, [role="button"][tabindex]:not([tabindex="-1"])'
                )
                if (!nodes || nodes.length === 0) return
                const visible = Array.from(nodes).filter((n) => n.offsetParent !== null || n === document.activeElement)
                if (visible.length === 0) return
                const first = visible[0]
                const last = visible[visible.length - 1]
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [panel, hobby, back, onClose])

    return (
        <div
            ref={rootRef}
            data-room-overlay=""
            role="dialog"
            aria-modal="true"
            aria-label="3D room: explore my work"
            className="fixed inset-0 z-[1000] bg-[#05060c] text-white"
        >
            <div className="absolute inset-0">
                {supported === true && (
                    <RoomScene
                        focus={focus}
                        reducedMotion={reduced}
                        paused={!!panel}
                        onSelect={select}
                        // clicking an empty part of the scene closes the hobby card, like the back button
                        onBackgroundClick={() => {
                            if (hobby) back()
                        }}
                    />
                )}

                {supported === false && !panel && (
                    <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-3 px-6">
                        <h2 className="text-2xl font-semibold">The 3D room is not available here</h2>
                        <p className="text-white/70">Your device cannot display it, but everything is here:</p>
                        <ul className="flex flex-col gap-2">
                            {LINKS.map((l) => (
                                <li key={l.id}>
                                    <button
                                        type="button"
                                        onClick={() => openPanel(l.id)}
                                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                                    >
                                        <span className="block font-medium">{l.label}</span>
                                        <span className="text-sm text-white/60">{l.hint}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-slate-900/80 px-4 py-2 text-sm transition hover:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
            >
                Close ✕
            </button>

            {hobby && !panel && (
                <div className="absolute bottom-6 left-1/2 z-10 w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-white/15 bg-slate-900/90 p-5 backdrop-blur">
                    <h2 className="text-lg font-semibold">{hobby.title}</h2>
                    <p className="mt-1 text-sm text-white/80">{hobby.text}</p>
                    <button
                        type="button"
                        onClick={back}
                        className="mt-3 rounded-full border border-white/20 px-4 py-1.5 text-sm transition hover:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                    >
                        ← Back to the room
                    </button>
                </div>
            )}

            {/* Clicking the scene around an open panel goes back to the room (same as the back button).
                Keyboard users have the back button and Escape. */}
            {panel && (
                <div
                    aria-hidden="true"
                    onClick={back}
                    className="absolute inset-0 z-[5] cursor-pointer bg-black/50"
                />
            )}

            {/* a section of my profile, opened from an object of the room */}
            {(panel || contactMounted) && (
                <div
                    ref={panelRef}
                    role="region"
                    aria-label={PANEL_TITLE[panel ?? 'contact'].title}
                    className={clsx(
                        'absolute inset-x-3 bottom-3 top-14 z-20 mx-auto flex max-w-[64rem] flex-col overflow-hidden rounded-2xl bg-white text-gray-950 shadow-2xl',
                        !panel && 'hidden'
                    )}
                >
                    <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-gray-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={back}
                                className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm transition hover:border-gray-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
                            >
                                ← Back to the room
                            </button>
                            <h2 className="text-lg font-semibold">{PANEL_TITLE[panel ?? 'contact'].title}</h2>
                            <span className="hidden text-sm text-gray-600 sm:inline">· {PANEL_TITLE[panel ?? 'contact'].object}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigate(SECTION_OF_PANEL[panel ?? 'contact'])}
                            className="rounded-full px-3 py-1.5 text-sm text-gray-700 underline underline-offset-2 hover:text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
                        >
                            See it on the page ↗
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {panel === 'projects' && <ProjectsPanel />}
                        {panel === 'skills' && (
                            <div>
                                <p className="mb-4 text-center text-sm text-gray-600">Pick a skill to see where I used it.</p>
                                <SkillsTree selected={selectedSkill} onSelect={setSelectedSkill} />
                            </div>
                        )}
                        {panel === 'career' && <CareerMap jumpTo={careerJump} />}
                        {contactMounted && (
                            <div className={clsx('mx-auto max-w-[34rem] text-center', panel !== 'contact' && 'hidden')}>
                                <p className="text-gray-700">
                                    Please contact me directly at{' '}
                                    <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
                                        {CONTACT_EMAIL}
                                    </a>{' '}
                                    or through this form.
                                </p>
                                <div className="mt-6 text-left">
                                    <ContactForm />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {supported === true && !focus && (
                <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-900/70 px-4 py-1.5 text-xs text-white/70">
                    Click an object or a label · Esc to close
                </p>
            )}
        </div>
    )
}
