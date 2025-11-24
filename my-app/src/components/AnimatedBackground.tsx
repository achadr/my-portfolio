"use client"
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false)
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([])
  const [musicNotes, setMusicNotes] = useState<Array<{ id: number; x: number; delay: number; duration: number; type: string }>>([])

  useEffect(() => {
    setMounted(true)
    // Generate random stars (cosmic theme)
    const generatedStars = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2, // Bigger stars (2-5px)
      duration: Math.random() * 3 + 2,
    }))
    setStars(generatedStars)

    // Generate floating music notes (LEFT SIDE)
    const notes = ['♪', '♫', '♬']
    const generatedNotes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 15 + 5, // Left side: 5-20%
      delay: Math.random() * 5,
      duration: Math.random() * 15 + 20,
      type: notes[Math.floor(Math.random() * notes.length)],
    }))

    // Generate floating instruments (RIGHT SIDE)
    const instruments = ['🎸', '🎹', '🎺', '🎻', '🥁', '🎷']
    const generatedInstruments = Array.from({ length: 8 }, (_, i) => ({
      id: i + 100,
      x: Math.random() * 15 + 80, // Right side: 80-95%
      delay: Math.random() * 5,
      duration: Math.random() * 15 + 25,
      type: instruments[Math.floor(Math.random() * instruments.length)],
    }))

    setMusicNotes([...generatedNotes, ...generatedInstruments])
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
          background: 'radial-gradient(ellipse at left, rgba(99, 102, 241, 0.3) 0%, transparent 40%), radial-gradient(ellipse at right, rgba(147, 51, 234, 0.3) 0%, transparent 40%)',
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

      {/* Twinkling stars - only render after mount to avoid hydration mismatch */}
      {mounted && stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
            boxShadow: `0 0 ${star.size * 4}px rgba(255, 255, 255, 0.9), 0 0 ${star.size * 2}px rgba(147, 51, 234, 0.5)`,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating music notes and instruments - only render after mount */}
      {mounted && musicNotes.map((note) => {
        return (
          <motion.div
            key={note.id}
            className="absolute text-3xl"
            style={{
              left: `${note.x}%`,
              bottom: '-5%',
              filter: 'drop-shadow(0 0 8px rgba(255, 180, 80, 0.5))',
            }}
            animate={{
              y: [0, -1100],
              x: [0, 0],
              rotate: [0, Math.random() * 360 - 180],
              scale: [1, 1.1, 0.3],
              opacity: [0, 0.5, 0.5, 0],
            }}
            transition={{
              duration: note.duration,
              delay: note.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {note.type}
          </motion.div>
        )
      })}

      {/* Nebula-like gradient orbs (purple - cosmos) */}
      <motion.div
        className="absolute top-[-10rem] right-[5rem] h-[40rem] w-[40rem] rounded-full opacity-20 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(147,51,234,0.4) 0%, rgba(168,85,247,0.2) 50%, transparent 100%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Nebula orb (blue - space) */}
      <motion.div
        className="absolute top-[20rem] left-[-10rem] h-[35rem] w-[35rem] rounded-full opacity-20 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(96,165,250,0.2) 50%, transparent 100%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Nebula orb (pink - musical energy) */}
      <motion.div
        className="absolute bottom-[-5rem] right-[-5rem] h-[30rem] w-[30rem] rounded-full opacity-15 blur-[90px]"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(244,114,182,0.2) 50%, transparent 100%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
