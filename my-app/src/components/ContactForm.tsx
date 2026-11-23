"use client"
import React, { useId, useRef, useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa'
import { sendEmail } from '@/actions/sendEmail'
import { CONTACT_EMAIL, HONEYPOT_FIELD } from '../../lib/contact'
import toast from 'react-hot-toast'

/**
 * The contact form, shared by the Contact section of the page and the contact
 * panel of the 3D room. Field ids are generated per instance, so both can be
 * on screen at the same time without clashing.
 */
export default function ContactForm() {
    const [pending, setPending] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const uid = useId()
    const emailId = `${uid}-email`
    const messageId = `${uid}-message`
    const honeypotId = `${uid}-trap`

    return (
        // onSubmit (not the `action` prop): React 19 resets the form after any `action`,
        // even on failure, which would throw away the visitor's message.
        // method="post": if the page is not interactive yet (or JavaScript is off) the browser
        // must never put the visitor's message in the address bar, as a GET would.
        <form ref={formRef} method="post" className='flex flex-col' onSubmit={async (event) => {
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
            {/* Honeypot against bots: invisible and unreachable for real visitors.
                Its name is deliberately meaningless (see HONEYPOT_FIELD) so browser autofill ignores it. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor={honeypotId}>Leave this field empty</label>
                <input id={honeypotId} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
            </div>
            <label htmlFor={emailId} className="sr-only">Your Email Address</label>
            <input
                id={emailId}
                name='senderEmail'
                className='h-14 rounded-lg border border-black/10 px-4 disabled:opacity-50 disabled:cursor-not-allowed'
                type="email"
                placeholder='Your Email'
                required
                aria-required="true"
                maxLength={500}
                disabled={pending}
            />
            <label htmlFor={messageId} className="sr-only">Your Message</label>
            <textarea
                id={messageId}
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
    )
}
