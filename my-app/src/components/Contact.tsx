"use client"
import React, { useState } from 'react'
import SectionHeading from './SectionHeading'
import { FaPaperPlane } from 'react-icons/fa'
import { useSectionInView } from '../../lib/hooks'
import { sendEmail } from '@/actions/sendEmail'
import toast from 'react-hot-toast'

export default function Contact() {

    const {ref} = useSectionInView("Contact")
    const [pending, setPending] = useState(false)

  return (
    <section ref={ref} id="contact" className='mb-20 sm:mb-28 w-[min(100%,38rem)] text-center'>
        <SectionHeading>Contact me</SectionHeading>
        <p className='text-gray-700 -mt-5'>
            Please contact me directly at {" "}
            <a className='underline' href="mailto:bougattaya.achraf@gmail.com" >bougattaya.achraf@gmail.com</a> {" "}
            or through this form.
        </p>

        <form className='mt-10 flex flex-col' action={async (formData) => {
            setPending(true)

            const result = await sendEmail(formData)

            setPending(false)

            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Email sent successfully!")
                // Reset form
                const form = document.querySelector('form') as HTMLFormElement
                form?.reset()
            }
        }}>
            <label htmlFor="senderEmail" className="sr-only">Your Email Address</label>
            <input
                id="senderEmail"
                name='senderEmail'
                className='h-14 rounded-lg border border-black/10 px-4 disabled:opacity-50 disabled:cursor-not-allowed'
                type="email"
                placeholder='Your Email'
                required
                aria-required="true"
                maxLength={500}
                disabled={pending}
            />
            <label htmlFor="message" className="sr-only">Your Message</label>
            <textarea
                id="message"
                name='message'
                className='h-50 my-3 rounded-lg border border-black/10 p-4 active:scale-10 h-[10rem] disabled:opacity-50 disabled:cursor-not-allowed'
                placeholder='Your message'
                required
                aria-required="true"
                maxLength={5000}
                disabled={pending}
            />
            <button
                type="submit"
                className='group flex focus:scale-105 hover:bg-gray-950 hover:scale-110 hover:cursor-pointer items-center justify-center gap-2 h-[3rem] w-[8rem] bg-gray-900 text-white rounded-full outline-none transition-all disabled:opacity-65 disabled:scale-100 disabled:cursor-not-allowed'
                disabled={pending}
            >
                {pending ? (
                    <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Sending...
                    </>
                ) : (
                    <>
                        Submit
                        <FaPaperPlane className='text-xs opacity-70 transition-all group-hover:translate-x-1 group-hover:-translate-y-1'/>{" "}
                    </>
                )}
            </button>
        </form>
    </section>
  )
}
