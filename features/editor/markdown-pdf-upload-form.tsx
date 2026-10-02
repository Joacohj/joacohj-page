"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { processPdf } from "@/actions/pdf/pdf-process";

type FormValues = {
    file: File | null;
};
type Props = {
    onMarkdown: (markdown: string) => void;
};
export function MarkdownPdfUploadForm({
    onMarkdown,
}: Props) {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            file: null,
        },
    });

    const file = watch("file");
    const onSubmit = async (data: FormValues) => {
        if (!data.file) return;
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append("file", data.file);

            const result = await processPdf(formData);
            console.log(result)
            if (!result.success) {
                console.error("Error procesando archivo:", result.error);
                return;
            }

            console.log("Markdown recibido:", result.content);

            onMarkdown(result.content ?? "");
        } catch (error) {
            console.error("Error ejecutando processPdf:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
        >
            <Controller
                name="file"
                control={control}
                rules={{
                    required: "Seleccioná un archivo.",
                }}
                render={() => {
                    const { getRootProps, getInputProps, isDragActive } =
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        useDropzone({
                            multiple: false,
                            maxFiles: 1,
                            maxSize: 20 * 1024 * 1024,

                            accept: {
                                "application/pdf": [".pdf"],
                                "text/markdown": [".md", ".markdown"],
                            },

                            onDrop: (acceptedFiles) => {
                                const selectedFile = acceptedFiles[0];

                                if (!selectedFile) return;

                                setValue("file", selectedFile, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                });
                            },
                        });

                    return (
                        <>
                            {!file ? (
                                <div
                                    {...getRootProps()}
                                    className={[
                                        "flex cursor-pointer flex-col items-center justify-center",
                                        "rounded-lg border border-dashed p-8",
                                        "transition-colors",
                                        isDragActive
                                            ? "border-primary bg-primary/5"
                                            : "border-muted-foreground/25 hover:bg-muted/50",
                                    ].join(" ")}
                                >
                                    <input {...getInputProps()} />

                                    <Upload className="mb-3 size-8 text-muted-foreground" />

                                    <p className="text-sm font-medium">
                                        {isDragActive
                                            ? "Soltá el archivo acá"
                                            : "Arrastrá un archivo o hacé click"}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        PDF o Markdown · máximo 20 MB
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                    <FileText className="size-5 shrink-0 text-muted-foreground" />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {file.name}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setValue("file", null, {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            })
                                        }
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    );
                }}
            />

            {errors.file && (
                <p className="text-sm text-destructive">
                    {errors.file.message}
                </p>
            )}

            <Button
                type="submit"
                disabled={!file || isProcessing}
                className="w-full"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Procesando...
                    </>
                ) : (
                    "Importar archivo"
                )}
            </Button>
        </form>
    );
}