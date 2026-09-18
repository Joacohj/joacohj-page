import { PrismaClient, MediaKind } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "pexels";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

const pexels = createClient(process.env.PEXELS_API_KEY!);

const USER_ID = "GILhHOu68JAMYbnuKHbqNB7MjC5ubMGR";

const categories = [
    {
        title: "Photography",
        description: "Photography, visual composition and moments.",
    },
    {
        title: "Travel",
        description: "Places, trips and experiences.",
    },
    {
        title: "Lifestyle",
        description: "Daily life, habits and personal experiences.",
    },
    {
        title: "Technology",
        description: "Programming, software and technology.",
    },
    {
        title: "Fitness",
        description: "Training, exercise and healthy habits.",
    },
];

const topics = [
    {
        title: "Nature",
        description: "Nature, landscapes and outdoor environments.",
    },
    {
        title: "Programming",
        description: "Software development and programming.",
    },
    {
        title: "Design",
        description: "Design, creativity and visual interfaces.",
    },
    {
        title: "Travel",
        description: "Travel destinations and experiences.",
    },
    {
        title: "Personal",
        description: "Personal thoughts and experiences.",
    },
];

const postTitles = [
    "A day worth remembering",
    "Building something new",
    "Exploring new places",
    "Somewhere between work and life",
    "A different perspective",
    "Small moments",
    "Things I have been learning",
    "Weekend adventures",
    "Behind the scenes",
    "Finding inspiration",
    "A new project",
    "What I am working on",
    "Exploring the unknown",
    "Keeping things simple",
    "Another day outside",
    "Learning by doing",
    "A collection of moments",
    "The creative process",
    "Building in public",
    "A quiet afternoon",
    "New ideas",
    "Work in progress",
    "Going somewhere",
    "Things worth documenting",
    "A little inspiration",
    "Current projects",
    "Exploring",
    "Another perspective",
    "Life lately",
    "What comes next",
];

function random<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getPhotos() {
    const result = await pexels.photos.curated({
        per_page: 80,
    });

    if ("error" in result) {
        throw new Error(result.error);
    }

    return result.photos;
}

async function getVideos() {
    const result = await pexels.videos.search({
        query: "nature",
        per_page: 20,
    });

    if ("error" in result) {
        throw new Error(result.error);
    }

    return result.videos;
}

async function main() {
    console.log("Fetching Pexels media...");

    const [photos, videos] = await Promise.all([
        getPhotos(),
        getVideos(),
    ]);

    console.log(`Photos: ${photos.length}`);
    console.log(`Videos: ${videos.length}`);

    // -------------------------
    // Categories
    // -------------------------

    const createdCategories = await Promise.all(
        categories.map((category) =>
            prisma.postCategory.create({
                data: category,
            }),
        ),
    );

    console.log("Created categories.");

    // -------------------------
    // Topics
    // -------------------------

    const createdTopics = await Promise.all(
        topics.map((topic) =>
            prisma.topic.create({
                data: topic,
            }),
        ),
    );

    console.log("Created topics.");

    // -------------------------
    // Posts
    // -------------------------

    // for (let i = 0; i < 30; i++) {
    //     const category = random(createdCategories);

    //     const selectedTopics = [...createdTopics]
    //         .sort(() => Math.random() - 0.5)
    //         .slice(0, randomInt(1, 3));

    //     const post = await prisma.post.create({
    //         data: {
    //             userId: USER_ID,

    //             title: postTitles[i],

    //             description:
    //                 "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
    //                 "This is sample content generated for development.",

    //             allowInteractions: random(["all", "none"]),

    //             fileSize: random(["small", "medium", "large"]),

    //             visibility: random(["public", "private"]),

    //             categoryId: category.id,

    //             topics: {
    //                 connect: selectedTopics.map((topic) => ({
    //                     id: topic.id,
    //                 })),
    //             },
    //         },
    //     });

    //     // -------------------------
    //     // Media
    //     // -------------------------

    //     const mediaCount = randomInt(1, 5);

    //     for (let order = 0; order < mediaCount; order++) {
    //         const useVideo =
    //             Math.random() < 0.25 && videos.length > 0;

    //         if (useVideo) {
    //             const video = random(videos);

    //             const videoFile = video.video_files
    //                 .filter(
    //                     (file) =>
    //                         file.width != null &&
    //                         file.height != null,
    //                 )
    //                 .sort(
    //                     (a, b) =>
    //                         (b.width ?? 0) - (a.width ?? 0),
    //                 )[0];
    //             await prisma.media.create({
    //                 data: {
    //                     width: videoFile.width ?? 1920,

    //                     height: videoFile.height ?? 1080,

    //                     aspectRatio:
    //                         (videoFile.width ?? 1920) / (videoFile.height ?? 1080),

    //                     src: videoFile.link,

    //                     poster: video.image,

    //                     kind: MediaKind.video,

    //                     order,

    //                     postId: post.id,
    //                 },
    //             });
    //         } else {
    //             const photo = random(photos);

    //             await prisma.media.create({
    //                 data: {
    //                     width: photo.width,

    //                     height: photo.height,

    //                     aspectRatio:
    //                         photo.width / photo.height,

    //                     src: photo.src.original,

    //                     poster: null,

    //                     kind: MediaKind.image,

    //                     order,

    //                     alt: photo.alt ?? null,

    //                     postId: post.id,
    //                 },
    //             });
    //         }
    //     }

    //     console.log(`Created post ${i + 1}/30`);
    // }

    console.log("Seed completed!");
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });