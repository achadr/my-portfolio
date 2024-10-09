"use client"
import React from 'react'
import SectionHeading from './SectionHeading'
import { FaPaperPlane } from 'react-icons/fa'
import { useSectionInView } from '../../lib/hooks'

export default function Contact() {

    const {ref, inView} = useSectionInView("Contact")

  return (
    <section ref={ref} id="contact" className='mb-20 sm:mb-28 w-[min(100%,38rem)] text-center'>
        <SectionHeading>Contact me</SectionHeading>
        <p className='text-gray-700 -mt-5'>
            Please contact me directly at {" "}
            <a className='underline' href="mailto:achraf.bougattaya@gmail.com" >achraf.bougattaya@gmail.com</a> {" "}
            or through this form.
        </p>

        <form className='mt-10 flex flex-col'>
            <input className='h-14 rounded-lg border border-black/10 px-4' type="email" placeholder='Your Email'/>
            <textarea className='h-50 my-3 rounded-lg border border-black/10 p-4  active:scale-10 h-[10rem]' placeholder='Your message' />
            <button type="submit" className='group flex focus:scale-105 hover:bg-gray-950 hover:scale-110 hover:cursor-pointer items-center justify-center gap-2 h-[3rem] w-[8rem] bg-gray-900 text-white rounded-full outline-none transition-all'>Submit 
                <FaPaperPlane className='text-xs opacity-70 transition-all group-hover:translate-x-1 group-hover:-translate-y-1'/>{" "}
            </button>
        </form>
    </section>
  )
}
