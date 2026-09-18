import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma"
export async function getTopics() {
     const getCachedTopics = unstable_cache(async () => {
            return prisma.topic.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            })
    })

    return getCachedTopics()
}

export type CreateTopicInput = {
  title: string;
  description: string;
};
export async function createTopic(data: CreateTopicInput) {
  try {
    return await prisma.topic.create({
      data: {
        title: data.title,
        description: data.description,
      },
    });
  } catch (error) {
    throw error;
  }
}
