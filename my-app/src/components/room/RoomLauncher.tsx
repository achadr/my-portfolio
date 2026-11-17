"use client"
import React, { useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { BsBoxSeam } from 'react-icons/bs'
import { useActiveSectionContext } from '../../../context/active-section'
import type { SectionId } from './RoomOverlay'

// Only the small overlay shell is loaded with the page; it pulls three.js in
// when the room is actually opened.
const RoomOverlay = dynamic(() => import('./RoomOverlay'), { ssr: false })

const SECTION_NAME = {
    projects: 'Projects',
    skills: 'Skills',
    experience: 'Experience',
    contact: 'Contact',
} as const

/**
 * "Explore in 3D" button for the intro. The room is an optional way in: every
 * object leads to a real section of the page. Hidden on small screens, where
 * the regular page is the better experience.
 */
export default function RoomLauncher() {
    const [open, setOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext()

    const close = useCallback(() => {
        setOpen(false)
        buttonRef.current?.focus({ preventScroll: true })
    }, [])

    const navigate = useCallback(
        (section: SectionId) => {
            setOpen(false)
            setActiveSection(SECTION_NAME[section])
            setTimeOfLastClick(Date.now())
            // wait one tick so the page is scrollable again once the overlay is gone
            setTimeout(() => {
                document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 60)
        },
        [setActiveSection, setTimeOfLastClick]
    )

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen(true)}
                className="group hidden items-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3 text-lg font-medium outline-none transition hover:scale-110 focus:scale-110 active:scale-105 md:flex"
            >
                Explore in 3D <BsBoxSeam className="opacity-60 transition group-hover:rotate-12" />
            </button>
            {open && <RoomOverlay onClose={close} onNavigate={navigate} />}
        </>
    )
}
