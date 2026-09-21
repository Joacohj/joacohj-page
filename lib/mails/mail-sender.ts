import { JSX } from "react/jsx-runtime";
import { sendEmail } from "./mailtrap";

export type MailBody = {
  from: string;
  to: string[];
  subject: string;
  emailTemplate: string;
};

type Provider = {
    provider?: 'mailtrap' | 'resend'
}
export default async function sendMail({provider, emailTemplate, from, subject, to}: MailBody & Provider,) {
    if(provider === 'mailtrap')
        return await sendEmail({emailTemplate, from, subject, to})
}