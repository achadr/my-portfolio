"use client"
import { useEffect, useState } from 'react'

/**
 * Cosmic background: dark sides, twinkling stars, floating notes and nebulas.
 *
 * Everything that moves is animated with CSS (opacity / transform only), so it
 * runs on the GPU compositor instead of re-rendering from JavaScript each
 * frame. The stars are drawn as a few layers of box-shadows rather than one
 * element per star. See the keyframes in globals.css.
 */

type Star = { x: number; y: number; size: number }
type Layer = { shadow: string; duration: number; delay: number }
type Note = { id: number; x: number; delay: number; duration: number; type: string; rotation: number }

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** One layer = many stars drawn by a single 1px element with a list of box-shadows. */
function makeLayer(count: number, duration: number, delay: number): Layer {
    const stars: Star[] = Array.from({ length: count }, () => ({
        x: rand(0, 100),
        y: rand(0, 100),
        size: rand(2, 5),
    }))
    const shadow = stars
        .map(
            (s) =>
                `${s.x.toFixed(2)}vw ${s.y.toFixed(2)}vh ${s.size.toFixed(1)}px ${(s.size / 2).toFixed(1)}px rgba(255,255,255,.95), ` +
                `${s.x.toFixed(2)}vw ${s.y.toFixed(2)}vh ${(s.size * 3).toFixed(1)}px ${(s.size * 0.4).toFixed(1)}px rgba(170,140,255,.45)`
        )
        .join(', ')
    return { shadow, duration, delay }
}

const NOTES = ['♪', '♫', '♬']
const INSTRUMENTS = ['🎸', '🎹', '🎺', '🎻', '🥁', '🎷']

export default function AnimatedBackground() {
    const [layers, setLayers] = useState<Layer[]>([])
    const [notes, setNotes] = useState<Note[]>([])

    // Random positions are generated after mount to avoid a hydration mismatch.
    useEffect(() => {
        setLayers([makeLayer(27, 3.4, 0), makeLayer(27, 4.6, 1.3), makeLayer(26, 5.8, 2.4)])

        const left: Note[] = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            x: rand(5, 20), // left side
            delay: rand(0, 5),
            duration: rand(20, 35),
            type: NOTES[Math.floor(Math.random() * NOTES.length)],
            rotation: rand(-180, 180),
        }))
        const right: Note[] = Array.from({ length: 8 }, (_, i) => ({
            id: i + 100,
            x: rand(80, 95), // right side
            delay: rand(0, 5),
            duration: rand(25, 40),
            type: INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)],
            rotation: rand(-180, 180),
        }))
        setNotes([...left, ...right])
    }, [])

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
            {/* Base background - slightly darker */}
            <div className="absolute inset-0 bg-gray-100" />

            {/* Dark cosmic sides - left */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.6) 15%, transparent 30%)',
                }}
            />

            {/* Dark cosmic sides - right */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to left, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.6) 15%, transparent 30%)',
                }}
            />

            {/* Cosmic nebula overlay on sides */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse at left, rgba(99, 102, 241, 0.3) 0%, transparent 40%), radial-gradient(ellipse at right, rgba(147, 51, 234, 0.3) 0%, transparent 40%)',
                }}
            />

            {/* Subtle cosmic glow at top */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to bottom, rgba(79, 70, 229, 0.08) 0%, transparent 20%)',
                }}
            />

            {/* Subtle center darkening for less brightness */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.03) 40%, transparent 70%)',
                }}
            />

            {/* Twinkling stars: three layers with different rhythms */}
            {layers.map((layer, i) => (
                <div
                    key={i}
                    className="bg-twinkle absolute left-0 top-0 h-px w-px rounded-full"
                    style={{
                        boxShadow: layer.shadow,
                        animationDuration: `${layer.duration}s`,
                        animationDelay: `-${layer.delay}s`,
                    }}
                />
            ))}

            {/* Floating music notes (left) and instruments (right) */}
            {notes.map((note) => (
                <span
                    key={note.id}
                    className="bg-float absolute text-3xl"
                    style={
                        {
                            left: `${note.x}%`,
                            bottom: '-5%',
                            textShadow: '0 0 8px rgba(255, 180, 80, 0.5)',
                            animationDuration: `${note.duration}s`,
                            animationDelay: `${note.delay}s`,
                            '--rot': `${note.rotation}deg`,
                        } as React.CSSProperties
                    }
                >
                    {note.type}
                </span>
            ))}

            {/* Nebula glows (purple, blue, pink): soft radial gradients, no blur filter */}
            <div
                className="bg-orb absolute right-[5rem] top-[-10rem] h-[48rem] w-[48rem] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(147,51,234,0.4) 0%, rgba(168,85,247,0.2) 35%, transparent 70%)',
                    animationDuration: '15s',
                }}
            />
            <div
                className="bg-orb absolute left-[-10rem] top-[20rem] h-[42rem] w-[42rem] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(96,165,250,0.2) 35%, transparent 70%)',
                    animationDuration: '18s',
                }}
            />
            <div
                className="bg-orb absolute bottom-[-5rem] right-[-5rem] h-[36rem] w-[36rem] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(244,114,182,0.2) 35%, transparent 70%)',
                    animationDuration: '20s',
                }}
            />
        </div>
    )
}
