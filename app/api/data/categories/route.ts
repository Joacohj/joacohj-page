import { getCategories } from "@/services";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
    const categories = await getCategories();
    return NextResponse.json({categories})
}