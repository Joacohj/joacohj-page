export type MarkdownImage = {
  file: File;
  alt: string;
  id: string;
};

export type ExtractedMarkdown = {
  markdown: string;
  images: MarkdownImage[];
};

export function extractMarkdownImages(
  markdown: string,
): ExtractedMarkdown {
  const images: MarkdownImage[] = [];

  const result = markdown.replace(
    /!\[([^\]]*)\]\(data:(image\/[^;]+);base64,([^)]+)\)/g,
    (_, alt: string, mime: string, base64: string) => {
      const binary = atob(base64);

      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const extension = mime.split('/')[1] ?? 'png';

      const id = `mineru-image-${images.length}`;

      const file = new File(
        [bytes],
        `${id}.${extension}`,
        {
          type: mime,
        },
      );

      images.push({
        id,
        file,
        alt,
      });

      return `![${alt}](mineru://${id})`;
    },
  );

  return {
    markdown: result,
    images,
  };
}