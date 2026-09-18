import { getTopics } from "@/services";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
    const topics = await getTopics();
    return NextResponse.json({topics})
}