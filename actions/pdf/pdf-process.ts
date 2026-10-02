"use server";

import { pdfToMarkdown } from "@/services/pdf-to-md/pdf-to-md.service";

export async function processPdf(formData: FormData) {
  console.log("[processPdf] iniciado");

  try {
    const file = formData.get("file");

    console.log("[processPdf] file:", file);

    if (!(file instanceof File)) {
      throw new Error("No se recibió ningún archivo.");
    }

    console.log("[processPdf] archivo válido:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Markdown
    if (
      file.type === "text/markdown" ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".markdown")
    ) {
      console.log("[processPdf] procesando Markdown");

      const content = await file.text();

      console.log(
        "[processPdf] Markdown obtenido:",
        content.length,
        "caracteres"
      );

      return {
        success: true,
        filename: file.name,
        content,
      };
    }

    // PDF
    if (file.type === "application/pdf") {
      console.log("[processPdf] enviando PDF a MinerU");

      const markdownFile = await pdfToMarkdown(file);

      console.log(
        "[processPdf] MinerU terminó:",
        markdownFile.name,
        markdownFile.size
      );

      const content = await markdownFile.text();

      console.log(
        "[processPdf] Markdown obtenido:",
        content.length,
        "caracteres"
      );

      return {
        success: true,
        filename: markdownFile.name,
        content,
      };
    }

    throw new Error(
      `Tipo de archivo no permitido: ${file.type}`
    );
  } catch (error) {
    console.error(
      "[processPdf] ERROR:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}