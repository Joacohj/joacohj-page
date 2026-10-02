// services/pdf-to-md.service.ts

import { createHash } from "node:crypto";

const MINERU_URL =
    process.env.MINERU_URL ?? "http://mineru:8000";

const MINERU_API_KEY =
    process.env.MINERU_API_KEY;

const POLL_INTERVAL_MS = 1000;
const MAX_POLLS = 300;

// ============================================================
// TYPES
// ============================================================

type MinerUUpload = {
    id: string;
    object: "upload";
    bytes: number;
    created_at: number;
    expires_at: number;
    filename: string;
    purpose: "parse";
    mime_type: string;
    sha256sum: string;
    status: string;

    upload_url: string | null;
    upload_method: string | null;
    upload_headers: Record<string, string> | null;

    file: {
        id: string;
    } | null;
};
type MinerUJob = {
    job_id: string;
    status:
    | "queued"
    | "running"
    | "completed"
    | "partial"
    | "failed"
    | "canceled";

    created_at: string;
    started_at: string | null;
    finished_at: string | null;

    tier: string;

    output_formats: string[];

    access_level: string;

    progress: {
        completed: number;
        failed: number;
        total: number;
    };

    files: MinerUJobFile[];

    links?: {
        self: string;
        cancel: string;
    };
};

type MinerUJobFile = {
    file_id: string;
    name: string;
    page_range: string | null;

    status:
    | "queued"
    | "running"
    | "completed"
    | "failed";

    parse?: {
        model_used: string;
        duration_ms: number;
        parser_version: string;
    };

    output_files?: {
        markdown?: {
            file_id: string;
            bytes: number;
        };

        middle_json?: {
            file_id: string;
            bytes: number;
        };

        structured_content?: {
            file_id: string;
            bytes: number;
        };

        html?: {
            file_id: string;
            bytes: number;
        };

        latex?: {
            file_id: string;
            bytes: number;
        };

        docx?: {
            file_id: string;
            bytes: number;
        };

        zip?: {
            file_id: string;
            bytes: number;
        };
    };

    error?: {
        type: string;
        code: string;
        message: string;
        param: string;
    } | null;
};

// ============================================================
// HTTP
// ============================================================

function getAuthHeaders(): HeadersInit {
    if (!MINERU_API_KEY) {
        return {};
    }

    return {
        Authorization: `Bearer ${MINERU_API_KEY}`,
    };
}

async function mineruFetch(
    path: string,
    init?: RequestInit
): Promise<Response> {
    return fetch(`${MINERU_URL}${path}`, {
        ...init,
        headers: {
            ...getAuthHeaders(),
            ...init?.headers,
        },
    });
}

// ============================================================
// MAIN
// ============================================================

export async function pdfToMarkdown(
    file: File
): Promise<File> {

    console.log("[MinerU] START", {
        name: file.name,
        type: file.type,
        size: file.size,
    });

    if (file.type !== "application/pdf") {
        throw new Error("El archivo debe ser un PDF.");
    }

    if (file.size === 0) {
        throw new Error("El archivo PDF está vacío.");
    }

    const buffer = Buffer.from(
        await file.arrayBuffer()
    );

    console.log("[MinerU] buffer creado:", buffer.length);

    const sha256sum = createHash("sha256")
        .update(buffer)
        .digest("hex");

    console.log("[MinerU] SHA256:", sha256sum);

    // ==========================================================
    // 1. CREATE UPLOAD
    // ==========================================================

    console.log("[MinerU] 1. POST /v1/uploads");

    const uploadResponse = await mineruFetch(
        "/v1/uploads",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                filename: file.name,
                bytes: file.size,
                mime_type: file.type,
                purpose: "parse",
                sha256sum,
                expires_after: {
                    anchor: "created_at",
                    seconds: 3600,
                },
            }),
        }
    );

    console.log(
        "[MinerU] upload response:",
        uploadResponse.status
    );

    if (!uploadResponse.ok) {
        const error = await uploadResponse.text();

        throw new Error(
            `MinerU upload creation failed (${uploadResponse.status}): ${error}`
        );
    }

    const upload =
        (await uploadResponse.json()) as MinerUUpload;

    console.log("[MinerU] upload creado:", {
        id: upload.id,
        upload_url: upload.upload_url,
        status: upload.status,
    });

    // ==========================================================
    // 2. UPLOAD CONTENT
    // ==========================================================

    let fileId = upload.file?.id ?? null;

    if (upload.status !== "completed") {
        console.log("[MinerU] 2. PUT content");

        if (
            !upload.upload_url ||
            !upload.upload_method ||
            !upload.upload_headers
        ) {
            throw new Error(
                "MinerU indicó que el upload no está completado pero no devolvió los datos necesarios para subir el contenido."
            );
        }

        const contentResponse = await fetch(
            upload.upload_url,
            {
                method: upload.upload_method,
                headers: upload.upload_headers,
                body: buffer,
            }
        );

        console.log(
            "[MinerU] content response:",
            contentResponse.status
        );

        if (!contentResponse.ok) {
            const error =
                await contentResponse.text();

            throw new Error(
                `MinerU content upload failed (${contentResponse.status}): ${error}`
            );
        }

        // ========================================================
        // 3. COMPLETE UPLOAD
        // ========================================================

        console.log(
            "[MinerU] 3. POST complete"
        );

        const completeResponse =
            await mineruFetch(
                `/v1/uploads/${upload.id}/complete`,
                {
                    method: "POST",
                }
            );

        console.log(
            "[MinerU] complete response:",
            completeResponse.status
        );

        if (!completeResponse.ok) {
            const error =
                await completeResponse.text();

            throw new Error(
                `MinerU upload completion failed (${completeResponse.status}): ${error}`
            );
        }

        const completed =
            (await completeResponse.json()) as {
                id?: string;
                file?: {
                    id: string;
                };
            };

        console.log(
            "[MinerU] complete result:",
            completed
        );

        fileId =
            completed.file?.id ??
            fileId;
    }

    // ==========================================================
    // 4. FILE ID
    // ==========================================================

    console.log(
        "[MinerU] fileId:",
        fileId
    );

    if (!fileId) {
        throw new Error(
            "MinerU completó el upload pero no devolvió un file_id."
        );
    }

    // ==========================================================
    // 4. CREATE JOB
    // ==========================================================

    console.log(
        "[MinerU] 4. POST /v1/parse/jobs"
    );

    const jobResponse =
        await mineruFetch(
            "/v1/parse/jobs",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    files: [
                        {
                            source: {
                                type: "file_id",
                                file_id: fileId,
                            },
                        },
                    ],
                    tier: "flash",
                    ocr_mode: "auto",
                    output_formats: ["markdown"],
                }),
            }
        );

    console.log(
        "[MinerU] job response:",
        jobResponse.status
    );

    if (!jobResponse.ok) {
        const error =
            await jobResponse.text();

        throw new Error(
            `MinerU parse job creation failed (${jobResponse.status}): ${error}`
        );
    }

    const createdJob =
        (await jobResponse.json()) as {
            job_id: string;
        };

    console.log(
        "[MinerU] job creado:",
        createdJob.job_id
    );

    if (!createdJob.job_id) {
        throw new Error(
            "MinerU no devolvió un job_id."
        );
    }

    // ==========================================================
    // 5. POLLING
    // ==========================================================

    console.log(
        "[MinerU] 5. esperando job..."
    );

    const job = await waitForJob(
        createdJob.job_id
    );

    console.log(
        "[MinerU] job terminado:",
        job.status
    );

    // ==========================================================
    // 6. MARKDOWN FILE
    // ==========================================================

    const markdownFileId =
        job.files
            .map(
                (jobFile) =>
                    jobFile.output_files
                        ?.markdown?.file_id
            )
            .find(Boolean);

    console.log(
        "[MinerU] markdownFileId:",
        markdownFileId
    );

    if (!markdownFileId) {
        const failedFile =
            job.files.find(
                (file) => file.error
            );

        if (failedFile?.error) {
            throw new Error(
                `MinerU parse failed: ${failedFile.error.message}`
            );
        }

        throw new Error(
            "MinerU terminó correctamente pero no devolvió el Markdown."
        );
    }

    // ==========================================================
    // 7. DOWNLOAD
    // ==========================================================

    console.log(
        "[MinerU] 7. descargando Markdown"
    );

    const markdownResponse =
        await mineruFetch(
            `/v1/files/${markdownFileId}/content`
        );

    console.log(
        "[MinerU] markdown response:",
        markdownResponse.status
    );

    if (!markdownResponse.ok) {
        const error =
            await markdownResponse.text();

        throw new Error(
            `MinerU Markdown download failed (${markdownResponse.status}): ${error}`
        );
    }

    const markdown =
        await markdownResponse.text();

    console.log(
        "[MinerU] markdown recibido:",
        markdown.length,
        "caracteres"
    );

    return new File(
        [markdown],
        replaceExtension(file.name, ".md"),
        {
            type: "text/markdown",
        }
    );
}

// ============================================================
// POLLING
// ============================================================

async function waitForJob(
    jobId: string
): Promise<MinerUJob> {
    for (
        let attempt = 0;
        attempt < MAX_POLLS;
        attempt++
    ) {
        const response =
            await mineruFetch(
                `/v1/parse/jobs/${jobId}`
            );

        if (!response.ok) {
            const error =
                await response.text();

            throw new Error(
                `MinerU job polling failed (${response.status}): ${error}`
            );
        }

        const job =
            (await response.json()) as MinerUJob;

        switch (job.status) {
            case "completed":
            case "partial":
                return job;

            case "failed":
            case "canceled":
                throw new Error(
                    `MinerU job ${jobId} terminó con estado "${job.status}".`
                );

            case "queued":
            case "running":
                break;

            default:
                throw new Error(
                    `MinerU devolvió un estado desconocido: ${job.status}`
                );
        }

        await sleep(POLL_INTERVAL_MS);
    }

    throw new Error(
        `MinerU job ${jobId} superó el tiempo máximo de espera.`
    );
}

// ============================================================
// HELPERS
// ============================================================

function sleep(
    milliseconds: number
): Promise<void> {
    return new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}

function replaceExtension(
    filename: string,
    extension: string
): string {
    const index =
        filename.lastIndexOf(".");

    if (index === -1) {
        return `${filename}${extension}`;
    }

    return (
        filename.slice(0, index) +
        extension
    );
}