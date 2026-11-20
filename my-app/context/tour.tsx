"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"

/**
 * The 30-second guided tour. Each step tells one sentence of the story and points
 * at the matching part of the explorer cards (ExplorerCards reacts to the step,
 * GuidedTour shows the narrator and the halo).
 * Texts are a first draft, to be refined (and translated) in the content phase.
 */
export type TourStep = {
    text: string
    /** What the explorer cards must show for this step. */
    show: { card: "skills"; skill: string } | { card: "career"; experience: number } | { card: "room" }
    /** Element the halo lands on, inside the explorer cards. */
    target: string
    /** Time to wait before the halo appears (the card opens, the pulse travels...). */
    haloDelay: number
}

export const TOUR_STEPS: readonly TourStep[] = [
    {
        text: "I build with React and TypeScript every day.",
        show: { card: "skills", skill: "React" },
        target: '[data-card="skills"] [role="button"][aria-label="React"]',
        haloDelay: 1900,
    },
    {
        text: "At Geotwin, in Paris from 2021 to 2024, I used it with DeckGL on a geospatial platform.",
        // index of the Geotwin entry in experiencesData
        show: { card: "career", experience: 1 },
        target: '[data-card="career"] [role="button"][aria-label^="Geotwin"]',
        haloDelay: 2000,
    },
    {
        text: "That led to City Analyzer, an interactive map tool of my own.",
        show: { card: "skills", skill: "Mapbox" },
        target: '[data-card="skills"] a[aria-label^="Project: City Analyzer"]',
        haloDelay: 2400,
    },
    {
        text: "There is more in the 3D room. Or tell me about your project.",
        show: { card: "room" },
        target: '[data-card="room"]',
        haloDelay: 400,
    },
]

type TourContextType = {
    /** Index of the current step, or -1 when the tour is not running. */
    step: number
    start: () => void
    next: () => void
    prev: () => void
    stop: () => void
}

const TourContext = createContext<TourContextType | null>(null)

export default function TourContextProvider({ children }: { children: React.ReactNode }) {
    const [step, setStep] = useState(-1)
    const start = useCallback(() => setStep(0), [])
    const next = useCallback(() => setStep((s) => (s + 1 < TOUR_STEPS.length ? s + 1 : -1)), [])
    const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), [])
    const stop = useCallback(() => setStep(-1), [])
    const value = useMemo(() => ({ step, start, next, prev, stop }), [step, start, next, prev, stop])
    return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour() {
    const ctx = useContext(TourContext)
    if (!ctx) throw new Error("useTour must be used within TourContextProvider")
    return ctx
}
