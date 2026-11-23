"use server";

import { Resend } from "resend"
import { getErrorMessage, validateString } from "../../lib/utils";
import { CONTACT_EMAIL, HONEYPOT_FIELD } from "../../lib/contact";

const resend = new Resend(process.env.RESEND_API_KEY)



export const sendEmail = async (formData : FormData) => {
    const senderEmail = formData.get('senderEmail')
    const message = formData.get('message')

    // Honeypot: a hidden field that real visitors never fill in. Bots usually do.
    // The field has a neutral name on purpose: names like "website" or "url" get filled in
    // by browser autofill, which would silently swallow a real visitor's message.
    // If it ever triggers, say so instead of pretending the message was sent, so a
    // false positive is never invisible.
    if (formData.get(HONEYPOT_FIELD)) {
        return {
            error: `Your message was flagged as automated and was not sent. If this is a mistake, please email me directly at ${CONTACT_EMAIL}.`
        }
    }

    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
        return {
            error: "Email service is not configured. Please contact the administrator."
        }
    }

    //server side validation
    if (!validateString(senderEmail, 500)) {
        return {
            error : "Invalid sender Email"
        }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail as string)) {
        return {
            error : "Please provide a valid email address"
        }
    }
    if (!validateString(message,5000)) {
        return {
            error : "Invalid message"
        }
    }


    try{
        const emailBody = `
This email is from your portfolio contact form.

Sender's Email: ${senderEmail}

Message:
${message}
        `.trim();

        // Resend does not throw when it refuses an email (invalid key, sandbox
        // sender restrictions, unverified domain...): it returns { data, error }.
        const { data, error } = await resend.emails.send({
            from: "Portfolio Contact Form <onboarding@resend.dev>",
            to: process.env.RECIPIENT_EMAIL || CONTACT_EMAIL,
            subject: "New message from your portfolio contact form",
            replyTo: senderEmail as string,
            text: emailBody,
        })

        if (error) {
            // The reason goes to the server logs (Vercel > Logs). Visitors only get a
            // generic message, because Resend's text can contain private details
            // (for example the email address of the Resend account).
            console.error('[contact form] Resend refused the email:', error.name, error.message)
            return {
                error: process.env.NODE_ENV === 'development'
                    ? `Resend refused the email: ${error.message}`
                    : `Your message could not be sent right now. Please email me directly at ${CONTACT_EMAIL}.`
            }
        }

        return {
            data,
        }
    }
    catch (error: unknown) {
        console.error('[contact form] Error sending email:', error)
        return {
            error : getErrorMessage(error)
        }
    }
}