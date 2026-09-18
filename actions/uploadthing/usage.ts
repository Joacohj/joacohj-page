"use server";

export async function getUploadThingUsage() {
    const response = await fetch(
        "https://api.uploadthing.com/v6/getUsageInfo",
        {
            method: "POST",
            headers: {
                "x-uploadthing-api-key": process.env.UPLOADTHING_SECRET!,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch UploadThing usage");
    }

    return response.json();
}