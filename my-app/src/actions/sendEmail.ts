"use server";

import { Resend } from "resend"
import { getErrorMessage, validateString } from "../../lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY)



export const sendEmail = async (formData : FormData) => {
    const senderEmail = formData.get('senderEmail')
    const message = formData.get('message')

    //server side validation
    if (!validateString(senderEmail, 500)) {
        return {
            error : "Invalid sender Email"
        }
    }
    if (!validateString(message,5000)) {
        return {
            error : "Invalid message"
        }
    }


    try{
        await resend.emails.send({
            from: "My portfolio Contact form <onboarding@resend.dev>",
            to:'bougattaya.achraf@gmail.com',
            subject: "Message from contact form",
            replyTo: senderEmail as string,
            text: message as string,
        })
    }
    catch (error: unknown) {


        return {
            error : getErrorMessage(error)
        }
    }
}