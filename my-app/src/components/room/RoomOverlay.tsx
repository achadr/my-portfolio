"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { RoomTarget } from './RoomScene'

// The 3D scene (three.js) is only downloaded when the room is opened.
const RoomScene = dynamic(() => import('./RoomScene'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center text-sm text-white/70" role="status">
            Loading the room…
        </div>
    ),
})

export type SectionId = 'projects' | 'skills' | 'experience'

const SECTION_OF: Partial<Record<RoomTarget, SectionId>> = {
    projects: 'projects',
    skills: 'skills',
    career: 'experience',
}

const HOBBIES: Partial<Record<RoomTarget, { title: string; text: string }>> = {
    guitar: { title: 'Guitar', text: "I'm currently on a mission to master the guitar." },
    cosmos: { title: 'Cosmos', text: "I'm fascinated by the cosmos. It is the theme of this whole portfolio." },
    games: { title: 'Video games', text: "I'm competitive in video games, which keeps my reflexes and attention to detail sharp." },
}

const LINKS: Array<{ id: SectionId; label: string; hint: string }> = [
    { id: 'projects', label: 'Projects', hint: 'Four applications, online' },
    { id: 'skills', label: 'Skills', hint: 'An interactive skill tree' },
    { id: 'experience', label: 'Career', hint: 'A map and a timeline of my path' },
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
    onNavigate: (section: SectionId) => void
}

export default function RoomOverlay({ onClose, onNavigate }: Props) {
    const rootRef = useRef<HTMLDivElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)
    const [supported, setSupported] = useState<boolean | null>(null)
    const [reduced, setReduced] = useState(false)
    const [focus, setFocus] = useState<RoomTarget | null>(null)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    const select = useCallback(
        (id: RoomTarget) => {
            setFocus(id)
            const section = SECTION_OF[id]
            if (section) {
                // let the camera fly to the object, then leave for the real section
                timer.current = setTimeout(() => onNavigate(section), reduced ? 0 : 700)
            }
        },
        [onNavigate, reduced]
    )

    const back = useCallback(() => setFocus(null), [])

    // Escape: step back from a hobby first, then close. Tab stays inside the dialog.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (hobby) back()
                else onClose()
            } else if (e.key === 'Tab') {
                const nodes = rootRef.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
                if (!nodes || nodes.length === 0) return
                const first = nodes[0]
                const last = nodes[nodes.length - 1]
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
    }, [hobby, back, onClose])

    return (
        <div
            ref={rootRef}
            role="dialog"
            aria-modal="true"
            aria-label="3D room: explore my work"
            className="fixed inset-0 z-[1000] bg-[#05060c] text-white"
        >
            <div className="absolute inset-0">
                {supported === true && <RoomScene focus={focus} reducedMotion={reduced} onSelect={select} />}

                {supported === false && (
                    <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-3 px-6">
                        <h2 className="text-2xl font-semibold">The 3D room is not available here</h2>
                        <p className="text-white/70">Your device cannot display it, but everything is on the page:</p>
                        <ul className="flex flex-col gap-2">
                            {LINKS.map((l) => (
                                <li key={l.id}>
                                    <button
                                        type="button"
                                        onClick={() => onNavigate(l.id)}
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

            {hobby && (
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

            {supported === true && !focus && (
                <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-900/70 px-4 py-1.5 text-xs text-white/70">
                    Click an object or a label · Esc to close
                </p>
            )}
        </div>
    )
}
