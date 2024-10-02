"use client"

import React, { useEffect } from 'react'
import SectionHeading from './SectionHeading'
import {motion} from "framer-motion"
import { useInView } from 'react-intersection-observer'
import { useActiveSectionContext } from '../../context/active-section'

export default function About() {
  const {ref,inView}=useInView({
    threshold : 0.75
  })
  const {setActiveSection, timeOfLastClick} = useActiveSectionContext();
  
  useEffect(() => {
    if (inView && Date.now() - timeOfLastClick > 1000) {
      setActiveSection("About")
    }
  },[inView, timeOfLastClick])



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
                After guaduating with a degree of software engineering, I decided to start a carriere in front-end developement, while also having an eye on the back-end and data bases technologies.
                I love problem solving aspect, it gives me the highest ammount of dopamine each day. The feeling of figuring out a solution to a problem is my favourite part of programming.

                My core stack is React, Node.js, Javascript/Typescript, MongoDB

                I am also familliar with developing Maps related components using DeckGL
            </p>
            <p>
                Apart from coding and web developement. I am a big fan of videos games. I love everything related to the cosmos and I adore music, recently I'm learning to play guitar, it's my favourite instrument
            </p>
    </motion.section>
    
  )
}
