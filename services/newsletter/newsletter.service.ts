import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


import sendMail from "@/lib/mails/mail-sender";
import { render } from "@react-email/components";
import { Prisma } from "@/generated/prisma/client";
import NewsletterWelcomeEmail from "@/components/emails/newsletter-welcome-email";

export async function createNewsletterSubscriptor(email: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const subscriber = await tx.newsletter.create({
                data: {
                    email,
                },
                select: {
                    id: true,
                    createdAt: true,
                },
            });

            const notice = await tx.notice.create({
                data: {
                    newsletterId: subscriber.id,
                    title: "Welcome to the newsletter",
                    description: "Thanks for subscribing to the newsletter.",
                },
            });

            return {
                subscriber,
                notice,
            };
        });

        // Enviar email después de crear correctamente la suscripción
        const html = await render(
            NewsletterWelcomeEmail({
                unsubscribeUrl: `https://joacohj.dev/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
            }),
        );

        const data = await sendMail({
            provider: "mailtrap",
            from: "joaquinalvarezoficial@outlook.com",
            to: [email],
            subject: "Welcome to the newsletter",
            emailTemplate: html,
        });

        return {
            ...result,
            email: data,
        };
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return {
                error: true,
                message: "This email is already subscribed.",
            };
        }

        console.error("Newsletter subscription error:", error);

        return {
            error: true,
            message: "Could not subscribe to the newsletter.",
        };
    }
}
export const getSubscriptors = unstable_cache(async () => {
    try {
        return await prisma.newsletter.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    } catch (error) {
        throw error;
    }
}, ["newsletter-subscriptors"]);
