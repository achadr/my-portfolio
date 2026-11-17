"use client"
import React from 'react'
import SectionHeading from './SectionHeading'
import ContactForm from './ContactForm'
import { useSectionInView } from '../../lib/hooks'
import { CONTACT_EMAIL } from '../../lib/contact'

export default function Contact() {

    const {ref} = useSectionInView("Contact")

  return (
    <section ref={ref} id="contact" className='mb-20 sm:mb-28 w-[min(100%,38rem)] text-center'>
        <SectionHeading>Contact me</SectionHeading>
        <p className='text-gray-700 -mt-5'>
            Please contact me directly at {" "}
            <a className='underline' href={`mailto:${CONTACT_EMAIL}`} >{CONTACT_EMAIL}</a> {" "}
            or through this form.
        </p>

        <div className='mt-10'>
            <ContactForm />
        </div>
    </section>
  )
}
