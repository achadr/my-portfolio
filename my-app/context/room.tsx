"use client"

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
// Type-only imports: they are erased at build time, so three.js stays out of the page bundle.
import type { RoomTarget } from "../src/components/room/RoomScene"
import type { SectionId } from "../src/components/room/RoomOverlay"
import { useActiveSectionContext } from "./active-section"

// Only the small overlay shell is loaded when the room is opened; it pulls three.js in itself.
const RoomOverlay = dynamic(() => import("../src/components/room/RoomOverlay"), { ssr: false })

const SECTION_NAME = {
    projects: "Projects",
    skills: "Skills",
    experience: "Experience",
    contact: "Contact",
} as const

type RoomContextType = {
    isOpen: boolean
    /** Opens the 3D room, optionally flying straight to an object (a panel or a hobby). */
    openRoom: (target?: RoomTarget) => void
    closeRoom: () => void
}

const RoomContext = createContext<RoomContextType | null>(null)

/**
 * One 3D room for the whole page: the hero button, the explorer cards, the hobbies
 * of the About section and the guided tour all open the same overlay.
 */
export default function RoomContextProvider({ children }: { children: React.ReactNode }) {
    // `n` changes on every opening, so the overlay starts fresh each time.
    const [room, setRoom] = useState<{ open: boolean; target?: RoomTarget; n: number }>({ open: false, n: 0 })
    // Focus goes back to whatever opened the room (button, card, link) when it closes.
    const returnFocus = useRef<HTMLElement | null>(null)
    const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext()

    const openRoom = useCallback((target?: RoomTarget) => {
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        setRoom((r) => ({ open: true, target, n: r.n + 1 }))
    }, [])

    const closeRoom = useCallback(() => {
        setRoom((r) => ({ ...r, open: false }))
        setTimeout(() => returnFocus.current?.focus({ preventScroll: true }), 0)
    }, [])

    // "See it on the page": leave the room and scroll to the matching section.
    const navigate = useCallback(
        (section: SectionId) => {
            setRoom((r) => ({ ...r, open: false }))
            setActiveSection(SECTION_NAME[section])
            setTimeOfLastClick(Date.now())
            // wait one tick so the page is scrollable again once the overlay is gone
            setTimeout(() => {
                document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" })
            }, 60)
        },
        [setActiveSection, setTimeOfLastClick]
    )

    const value = useMemo(() => ({ isOpen: room.open, openRoom, closeRoom }), [room.open, openRoom, closeRoom])

    return (
        <RoomContext.Provider value={value}>
            {children}
            {room.open && <RoomOverlay key={room.n} initialFocus={room.target} onClose={closeRoom} onNavigate={navigate} />}
        </RoomContext.Provider>
    )
}

export function useRoom() {
    const ctx = useContext(RoomContext)
    if (!ctx) throw new Error("useRoom must be used within RoomContextProvider")
    return ctx
}
