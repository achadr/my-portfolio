"use client"
import React, { useRef, useState } from 'react'
import SectionHeading from './SectionHeading'
import { FaPaperPlane } from 'react-icons/fa'
import { useSectionInView } from '../../lib/hooks'
import { sendEmail } from '@/actions/sendEmail'
import { CONTACT_EMAIL } from '../../lib/contact'
import toast from 'react-hot-toast'

export default function Contact() {

    const {ref} = useSectionInView("Contact")
    const [pending, setPending] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

  return (
    <section ref={ref} id="contact" className='mb-20 sm:mb-28 w-[min(100%,38rem)] text-center'>
        <SectionHeading>Contact me</SectionHeading>
        <p className='text-gray-700 -mt-5'>
            Please contact me directly at {" "}
            <a className='underline' href={`mailto:${CONTACT_EMAIL}`} >{CONTACT_EMAIL}</a> {" "}
            or through this form.
        </p>

        {/* onSubmit (not the `action` prop): React 19 resets the form after any `action`,
            even on failure, which would throw away the visitor's message. */}
        <form ref={formRef} className='mt-10 flex flex-col' onSubmit={async (event) => {
            event.preventDefault()
            // read the values before the inputs get disabled (disabled inputs are skipped)
            const formData = new FormData(event.currentTarget)
            setPending(true)

            try {
                const result = await sendEmail(formData)

                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Email sent successfully!")
                    formRef.current?.reset()
                }
            } catch {
                // network failure or server error: never leave the button stuck on "Sending…"
                toast.error(`Could not send your message. Please email me directly at ${CONTACT_EMAIL}.`)
            } finally {
                setPending(false)
            }
        }}>
            {/* Honeypot against bots: invisible and unreachable for real visitors. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Leave this field empty</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
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
