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
import { profile } from '../../lib/content'
import toast from 'react-hot-toast'
import RoomLauncher from './room/RoomLauncher'

export default function Intro() {

    const {setActiveSection, setTimeOfLastClick} = useActiveSectionContext();
    const {ref} = useSectionInView("Home",0.5)

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(profile.email)
            toast.success("Email copied")
        } catch {
            toast.error(`Copy failed. My email: ${profile.email}`)
        }
    }

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
                    role="img"
                    aria-label="Waving hand"
                >
                    👋
                </motion.span>
            </div>
        </div>
        <motion.h1
            className="mb-4 mt-4 px-4 text-2xl font-small !leading-[1.5] sm:text-4xl"
            initial={{ opacity:0, y: 100}}
            animate={{ opacity:1, y: 0}}
            >
        <span className="font-bold">Hello, I&apos;m Achraf.</span> I&apos;m a{" "}
        <span className="font-bold">front-end developer</span> with{" "}
        <span className="font-bold">4+ years</span> of experience. I enjoy
        building <span className="italic">sites & apps</span>. My main focus is{" "}
        <span className="underline">React</span>.
        </motion.h1>

        <motion.p
            className="mb-5 px-4 text-base text-gray-800 sm:text-lg"
            initial={{ opacity:0, y: 60}}
            animate={{ opacity:1, y: 0}}
            transition={{ delay: 0.05 }}
        >
            {profile.pitch}
        </motion.p>

        <motion.ul
            className="mb-8 flex flex-wrap items-center justify-center gap-2 px-4 text-sm"
            aria-label="Key technologies and experience"
            initial={{ opacity:0, y: 60}}
            animate={{ opacity:1, y: 0}}
            transition={{ delay: 0.08 }}
        >
            {profile.facts.map((fact) => (
                <li key={fact} className="rounded-full border border-black/10 bg-white px-3 py-1 text-gray-700">
                    {fact}
                </li>
            ))}
        </motion.ul>

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
                className='group bg-gray-900 text-white px-7 py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105 transition'
                onClick={()=> {
                    setActiveSection("Contact")
                    setTimeOfLastClick(Date.now())
                  }}
                >
                    Contact me Here <BsArrowRight className='opacity-70 group-hover:translate-x-2 transition'/>
            </Link>
            <a
                className='group bg-white px-7 py-3 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-110 hover:cursor-pointer active:scale-105 transition border border-black/10'
                href={profile.cv}
                download
                >
                Download CV <HiDownload className='opacity-60 group-hover:translate-y-1 transition'/>
            </a>
            <RoomLauncher />

            <a
                className='bg-white-700 p-4 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-[1.15] hover:cursor-pointer active:scale-105 transition'
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit my LinkedIn profile"
            >
              <BsLinkedin/>
            </a>
            <a
                className='bg-white-700 p-4 flex items-center gap-2 text-[1.35rem] rounded-full focus:scale-[1.15] hover:scale-110 hover:cursor-pointer active:scale-105 transition'
                href={profile.github}
                target='_blank'
                rel="noopener noreferrer"
                aria-label="Visit my GitHub repositories"
            >
              <BsGithub/>
            </a>
        </motion.div>

        <p className="mt-5 px-4 text-center text-sm text-gray-700">
            {profile.email}{" "}
            <button
                type="button"
                onClick={copyEmail}
                className="ml-1 rounded-full border border-black/10 bg-white px-3 py-1 text-gray-800 transition hover:border-gray-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
                Copy
            </button>
        </p>
    </section>
  )
}
