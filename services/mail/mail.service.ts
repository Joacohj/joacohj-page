import { JSX } from "react";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

type MailBody = {
  from?: string;
  to: string[];
  subject: string;
  emailTemplate: JSX.Element;
};

export default async function sendMail({
  from,
  to,
  subject,
  emailTemplate,
}: MailBody) {
  try {
    const { data, error } = await resend.emails.send({
      from: from ?? "joacohj.dev@resend.dev",
      to,
      subject,
      react: emailTemplate,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}