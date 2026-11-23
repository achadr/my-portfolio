"use client"

import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
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
import { useTour } from '../../context/tour'
import { BsCheck2, BsCopy, BsPlayFill } from 'react-icons/bs'
import { HiOutlineMail } from 'react-icons/hi'

export default function Intro() {

    const {setActiveSection, setTimeOfLastClick} = useActiveSectionContext();
    const { start: startTour } = useTour()
    const {ref} = useSectionInView("Home",0.5)

    // "Copied" shows in the pill for a moment, then it goes back to "Copy"
    const [copied, setCopied] = useState(false)
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    useEffect(() => () => clearTimeout(copiedTimer.current), [])

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(profile.email)
            setCopied(true)
            clearTimeout(copiedTimer.current)
            copiedTimer.current = setTimeout(() => setCopied(false), 2000)
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

        <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 px-4 text-lg font-medium"
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

        {/* the guided tour runs on the explorer cards, which are shown from the md breakpoint up */}
        <div className="mt-4 hidden justify-center md:flex">
            <button
                type="button"
                data-tour-start=""
                onClick={startTour}
                className="group flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 font-medium text-white transition hover:scale-105 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 active:scale-100"
            >
                <BsPlayFill aria-hidden="true" className="text-xl" /> Take the 30-second tour
            </button>
        </div>

        {/* the whole pill copies the address; the badge confirms it in place */}
        <div className="mt-5 flex justify-center px-4">
            <button
                type="button"
                onClick={copyEmail}
                aria-label={`Copy my email address: ${profile.email}`}
                className="group inline-flex max-w-full items-center gap-2.5 rounded-full border border-black/10 bg-white/80 py-1.5 pl-4 pr-1.5 text-sm shadow-sm backdrop-blur transition hover:border-gray-900/30 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 active:scale-[0.98]"
            >
                <HiOutlineMail aria-hidden="true" className="shrink-0 text-base text-gray-500" />
                <span className="truncate font-medium text-gray-800">{profile.email}</span>
                <span
                    aria-hidden="true"
                    className={clsx(
                        'flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                        copied ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700 group-hover:bg-gray-900 group-hover:text-white'
                    )}
                >
                    {copied ? <BsCheck2 /> : <BsCopy />}
                    {copied ? 'Copied' : 'Copy'}
                </span>
            </button>
            <span role="status" className="sr-only">
                {copied ? 'Email address copied' : ''}
            </span>
        </div>
    </section>
  )
}
