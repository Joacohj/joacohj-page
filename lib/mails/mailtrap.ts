import { MailtrapClient, MailtrapTransport, type Address } from "mailtrap";
import { MailBody } from "./mailSender";
const TOKEN = process.env.MAILTRAP_API_TOKEN!;

import * as nodemailer from "nodemailer";

export const client = new MailtrapClient({
  token: "93b0cb72d0430bfb62bc67529811c410",
});

export const mailTransport = nodemailer.createTransport({
  secure: false,
  auth: {
    user: "bccfa5041742ff",
    pass: "b8e532b2e8b6a5",
  },
  host: 'sandbox.smtp.mailtrap.io',
});

export async function sendEmail({from, to, subject, emailTemplate}: MailBody ) {
    try {
        const data = await mailTransport.sendMail({
            from: {address: from},
            to: to[0],
            subject: subject,
            html: emailTemplate
        })

        return data;
    } catch (error) {
        throw error;
    }
}