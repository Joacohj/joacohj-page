import { getSubscriptors } from "@/services/newsletter/newsletter.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await getSubscriptors();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error })
    }
}