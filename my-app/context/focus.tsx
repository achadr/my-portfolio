"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { SkillName } from "../lib/content"

/**
 * Lets the skill tree, the career map and the timeline point at each other.
 * A counter (`n`) is part of each request so asking for the same item twice
 * still triggers the listeners.
 */
type SkillRequest = { name: SkillName; n: number } | null
type ExperienceRequest = { index: number; n: number } | null

type FocusContextType = {
    skill: SkillRequest
    experience: ExperienceRequest
    focusSkill: (name: SkillName) => void
    focusExperience: (index: number) => void
}

const FocusContext = createContext<FocusContextType | null>(null)

export default function FocusContextProvider({ children }: { children: React.ReactNode }) {
    const [skill, setSkill] = useState<SkillRequest>(null)
    const [experience, setExperience] = useState<ExperienceRequest>(null)

    const focusSkill = useCallback((name: SkillName) => {
        setSkill((prev) => ({ name, n: (prev?.n ?? 0) + 1 }))
        // When the 3D room is open it shows the skill itself: leave the page behind it alone.
        if (!document.querySelector("[data-room-overlay]")) {
            document.getElementById("skills")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
    }, [])
    const focusExperience = useCallback((index: number) => {
        setExperience((prev) => ({ index, n: (prev?.n ?? 0) + 1 }))
    }, [])

    const value = useMemo(
        () => ({ skill, experience, focusSkill, focusExperience }),
        [skill, experience, focusSkill, focusExperience]
    )

    return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}

export function useFocus() {
    const ctx = useContext(FocusContext)
    if (!ctx) throw new Error("useFocus must be used within FocusContextProvider")
    return ctx
}
