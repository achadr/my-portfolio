"use client"

import Image from 'next/image'
import React from 'react'
import ProfilePic from '../../public/me.png'
import {motion} from "framer-motion"
import Link from 'next/link'
import { BsArrowRight, BsGithub, BsLinkedin } from 'react-icons/bs'
import { HiDownload } from 'react-icons/hi'
import { useSectionInView } from '../../lib/hooks'
import { useActiveSectionContext } from '../../context/active-section'

export default function Intro() {

    const {activeSection, setActiveSection, setTimeOfLastClick} = useActiveSectionContext();
    const {ref} = useSectionInView("Home",0.5)

  return (
    <section className='mb-28 max-w-[50rem] sm:mb-0 scroll-mt-[100rem]' id="home" ref={ref}>
        <div className='flex items-center justify-center'>
            <div className='relative'>
                <motion.div
                    initial={{opacity: 0, scale: 0}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{
                        type:"tween",
                        duration: 0.4
                    }}

                >
                    <Image
                        src={ProfilePic}
                        alt="Achraf portrait"
                        width={192}
                        height={192}
                        quality={95}
                        className='rounded-full w-24 h-24 border-[0.35rem] border-white object-cover shadow-xl'
                        priority={true}
                    />
                </motion.div>
                
                <motion.span 
                    className='text-4xl absolute bottom-0 right-0'
                    initial={{opacity: 0, scale: 0}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{
                        type:"spring",
                        stiffness: 125,
                        delay: 0.15,
                        duration : 0.9
                    }}
                >
                    👋
                </motion.span>
            </div>
        </div>
        <motion.h1 
            className="mb-10 mt-4 px-4 text-2xl font-small !leading-[1.5] sm:text-4xl"
            initial={{ opacity:0, y: 100}}
            animate={{ opacity:1, y: 0}}
            >
        <span className="font-bold">Hello, I'm Achraf.</span> I'm a{" "}
        <span className="font-bold">front-end developer</span> with{" "}
        <span className="font-bold">3 years</span> of experience. I enjoy
        building <span className="italic">sites & apps</span>. My main focus is{" "}
        <span className="underline">React</span>.
        </motion.h1>

        <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 text-lg font-medium"
            initial={{ opacity:0, y: 100}}
            animate={{ opacity:1, y: 0}}
            transition={{
                delay: 0.1
            }}
        >
            <Link 
                href="#contact"
                className='group bg-gray-900 text-white px-7 py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 hover:bg-gra-950 active:scale-105 transition'
                onClick={()=> {
                    setActiveSection("Contact")
                    setTimeOfLastClick(Date.now())
                  }}
                >
                    Contact me Here <BsArrowRight className='opacity-70 group-hover:translate-x-2 transition'/>
            </Link>
            <a 
                className='group bg-white px-7 py-3 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-110 hover:cursor-pointer active:scale-105 transition border border-black/10'
                href="/CV_BOUGATTAYA_Achraf.pdf"
                download
                >
                Download CV <HiDownload className='opacity-60 group-hover:translate-y-1 transition'/> 
            </a>

            <a className='bg-white-700 p-4 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-[1.15] hover:cursor-pointer active:scale-105 transition ' href="https://www.linkedin.com/in/achraf-bougattaya-747320177/" target="_blank">
              <BsLinkedin/>  
            </a>
            <a className='bg-white-700 p-4 flex items-center gap-2 text-[1.35rem] rounded-full focus:scale-[1.15] hover:scale-110 hover:cursor-pointer active:scale-105 transition ' href="https://github.com/achadr?tab=repositories" target='_blank'>
              <BsGithub/>  
            </a>
        </motion.div>
    </section>
  )
}
