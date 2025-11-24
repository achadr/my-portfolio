"use client"

import React from 'react'
import SectionHeading from './SectionHeading'
import {motion} from "framer-motion"
import { useSectionInView } from '../../lib/hooks'

export default function About() {
  const {ref} = useSectionInView("About")


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
                After earning my software engineering degree, I dove into front-end development—and haven&apos;t looked back. Over the past 3 years, I&apos;ve built everything from internal management tools to geospatial platforms, with React and TypeScript as my weapons of choice.
            </p>
            <p className='mb-3'>
                Here&apos;s what gets me excited: that moment when a complex problem finally clicks. It&apos;s like solving a puzzle where the reward is clean, working code. My stack centers around React, Node.js, TypeScript, and MongoDB, with a special focus on map visualizations using DeckGL.
            </p>
            <p>
                Outside the code editor, I&apos;m fascinated by the cosmos, competitive in video games, and currently on a mission to master guitar. These passions fuel my creativity and keep my problem-solving skills sharp.
            </p>
    </motion.section>
    
  )
}
