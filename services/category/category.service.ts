import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
export async function getCategories() {
  const getCachedCategories = unstable_cache(async () => {
    return prisma.postCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  return getCachedCategories();
}

export type CreateCategoryInput = {
  title: string;
  description: string;
};
export async function createCategory(data: CreateCategoryInput) {
  try {
    return await prisma.postCategory.create({
      data: {
        title: data.title,
        description: data.description,
      },
    });
  } catch (error) {
    throw error;
  }
}
