"use client"

import React from 'react'
import SectionHeading from './SectionHeading'
import {motion} from "framer-motion"
import { useSectionInView } from '../../lib/hooks'
import { useRoom } from '../../context/room'
import { BsStars } from 'react-icons/bs'

export default function About() {
  const {ref} = useSectionInView("About")
  const { openRoom } = useRoom()


  return (
    <motion.section 
        className='mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28'
        initial={{opacity: 0, y :100}}
        animate={{opacity : 1, y : 0}}
        transition={{delay : 0.175}}
        id="about"
        ref={ref}
        >
            <SectionHeading> About me</SectionHeading>
            <p className='mb-3'>
                After earning my software engineering degree, I dove into front-end development—and haven&apos;t looked back. Over the past 4+ years, I&apos;ve built everything from internal management tools to geospatial platforms, with React and TypeScript as my weapons of choice.
            </p>
            <p className='mb-3'>
                Here&apos;s what gets me excited: that moment when a complex problem finally clicks. It&apos;s like solving a puzzle where the reward is clean, working code. My stack centers around React, Node.js, TypeScript, and MongoDB, with a special focus on map visualizations using DeckGL.
            </p>
            <p>
                Outside the code editor, I&apos;m fascinated by{" "}
                {/* the cosmos opens the 3D room straight on the telescope (Horizon): where I'm heading */}
                <button
                    type="button"
                    onClick={() => openRoom('telescope')}
                    aria-label="the cosmos: look through the telescope of my 3D room"
                    className="group inline-flex items-baseline gap-1 rounded font-medium text-indigo-700 underline decoration-indigo-300 decoration-2 underline-offset-4 transition hover:text-indigo-900 hover:decoration-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                    the cosmos
                    <BsStars aria-hidden="true" className="self-center text-sm transition group-hover:rotate-12 group-hover:scale-110" />
                </button>
                , competitive in video games, and currently on a mission to master guitar. These passions fuel my creativity and keep my problem-solving skills sharp.
            </p>
    </motion.section>
    
  )
}
