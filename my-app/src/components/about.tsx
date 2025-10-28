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
                After graduating with a degree in software engineering, I decided to start a career in front-end development, while also keeping an eye on back-end and database technologies.
                I love the problem-solving aspect—it gives me the highest amount of dopamine each day. The feeling of figuring out a solution to a problem is my favorite part of programming.

                My core stack is React, Node.js, JavaScript/TypeScript, and MongoDB.

                I am also familiar with developing map-related components using DeckGL.
            </p>
            <p>
                Apart from coding and web development, I am a big fan of video games. I love everything related to the cosmos and I adore music. Recently I&apos;m learning to play guitar—it&apos;s my favorite instrument.
            </p>
    </motion.section>
    
  )
}
