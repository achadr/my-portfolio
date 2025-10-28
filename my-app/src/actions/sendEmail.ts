"use server";

import { Resend } from "resend"
import { getErrorMessage, validateString } from "../../lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY)



export const sendEmail = async (formData : FormData) => {
    const senderEmail = formData.get('senderEmail')
    const message = formData.get('message')

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


    let data;
    try{
        const emailBody = `
This email is from your portfolio contact form.

Sender's Email: ${senderEmail}

Message:
${message}
        `.trim();

        data = await resend.emails.send({
            from: "Portfolio Contact Form <onboarding@resend.dev>",
            to: process.env.RECIPIENT_EMAIL || 'bougattaya.achraf@gmail.com',
            subject: "New message from your portfolio contact form",
            replyTo: senderEmail as string,
            text: emailBody,
        })
    }
    catch (error: unknown) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error sending email:', error);
        }
        return {
            error : getErrorMessage(error)
        }
    }

    return {
        data,
    }
}