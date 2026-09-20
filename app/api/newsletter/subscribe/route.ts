import { createNewsletterSubscriptor } from "@/services/newsletter/newsletter.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const { email } = await req.json();
    try {
        const data = await createNewsletterSubscriptor(email);
        if (data.id)
            return NextResponse.json({ data });

        return NextResponse.json(
            { error: "Could not create subscription" },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json({ error: error });
    }
}