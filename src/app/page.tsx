"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Select from "react-select";
import { File, Upload, X } from "lucide-react";
import { ErrorCard } from "@/components/ErrorCard";
import { Leckerli_One, Poppins } from "next/font/google";

const leckerliOne = Leckerli_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

type FileWithPreview = File & {
  preview: string;
  convertedUrl?: string;
};

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isConversionComplete, setIsConversionComplete] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState({
    value: "Convert Into",
    label: "Convert Into",
  });
  const [conversionProgress, setConversionProgress] = useState(0);
  const [error, setError] = useState<{
    message: string;
    type?: "error" | "success" | "warning" | "info";
  } | null>(null);

  const showError = (
    message: string,
    type: "error" | "success" | "warning" | "info" = "error"
  ) => {
    setError({ message, type });
  };

  // Handle conversion
  const handleConvert = async () => {
    if (files.length === 0) {
      showError("Please select a file", "warning");
      return;
    }
    if (selectedFormat.value === "Convert Into") {
      showError("Please select a target format", "warning");
      return;
    }

    try {
      setIsConverting(true);
      setConversionProgress(0);

      if (selectedFormat.value === "PDF") {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("file", file);
        });
        formData.append("format", "pdf");

        const res = await fetch("/api/convert", { method: "POST", body: formData });
        if (!res.ok) {
          const error = await res.text();
          throw new Error(`Failed to convert files to PDF: ${error}`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const pdfFile = Object.assign(
          new window.File([blob], `converted-${Date.now()}.pdf`, { type: "application/pdf" }),
          {
            preview: url,
            convertedUrl: url
          }
        ) as FileWithPreview;
        setFiles([{ ...pdfFile, preview: url, convertedUrl: url }]);
      } else {
        const convertedFiles: FileWithPreview[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("format", selectedFormat.value);

          const res = await fetch("/api/convert", { method: "POST", body: formData });
          if (!res.ok) throw new Error(`Failed to convert ${file.name}`);

          const blob = await res.blob() as Blob;
          const url = URL.createObjectURL(blob);
          const convertedFile = Object.assign(
            new window.File(
              [blob],
              `${file.name.split(".")[0]}.${selectedFormat.value.toLowerCase()}`,
              { type: blob.type }
            ),
            {
              preview: url,
              convertedUrl: url
            }
          ) as FileWithPreview;

          convertedFiles.push({ ...convertedFile, preview: url, convertedUrl: url });
          setConversionProgress(Math.round(((i + 1) / files.length) * 100));
        }

        setFiles(convertedFiles);
      }

      setIsConversionComplete(true);
      showError("Conversion completed successfully!", "success");
    } catch (err: any) {
      showError(err.message || "Conversion failed", "error");
    } finally {
      setIsConverting(false);
    }
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 10,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      if (updated[index].convertedUrl) URL.revokeObjectURL(updated[index].convertedUrl);
      updated.splice(index, 1);
      return updated;
    });
    setIsConversionComplete(false);
  };

  const handleDownload = () => {
    files.forEach((file, index) => {
      if (!file.convertedUrl) return;
      const a = document.createElement("a");
      a.href = file.convertedUrl;
      a.download = `converted_${index}.${selectedFormat.value.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const resetConversion = () => {
    files.forEach((file) => {
      URL.revokeObjectURL(file.preview);
      if (file.convertedUrl) URL.revokeObjectURL(file.convertedUrl);
    });
    setFiles([]);
    setSelectedFormat({ value: "Convert Into", label: "Convert Into" });
    setConversionProgress(0);
    setIsConversionComplete(false);
    setIsConverting(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      {/* Error/Success Message */}
      <div className="fixed top-4 right-1 z-50 w-full max-w-md">
        {error && (
          <ErrorCard
            message={error.message}
            type={error.type}
            autoDismiss={5000}
            onDismiss={() => setError(null)}
            className="mb-2 w-full"
          />
        )}
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" role="main">
        {/* Header */}
        <header className="text-center pt-6 sm:pt-12">
          <h1 className={`text-4xl sm:text-6xl md:text-7xl font-bold text-[#055] mb-2 ${leckerliOne.className}`}>
            Convertly
          </h1>
          <p className={`text-lg sm:text-xl md:text-2xl text-gray-600 mb-3 sm:mb-4 ${poppins.className}`}>
            Effortless file conversion at your fingertips
          </p>
        </header>

        {/* Upload Section */}
        <section className="mb-8">
          <div
            {...(isConverting || isConversionComplete ? {} : getRootProps())}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isConverting || isConversionComplete
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : isDragActive
                ? "border-blue-500 bg-blue-50 cursor-pointer"
                : "border-gray-300 hover:border-[#055] bg-white cursor-pointer"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="mt-2 text-gray-700">
              {isDragActive ? "Drop the files here" : "Drag & drop files here or click to upload"}
            </p>
            <p className="text-sm text-gray-500">Supported: JPG, PNG, WEBP (Max 10MB)</p>
          </div>
        </section>

        {/* Files Section */}
        {files.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Selected Files ({isConversionComplete ? "" : files.length})</h3>
              <div className="flex gap-3">
                <Select
                  value={selectedFormat}
                  onChange={(opt) => opt && setSelectedFormat(opt)}
                  options={[
                    { value: "JPG", label: "JPG" },
                    { value: "PNG", label: "PNG" },
                    { value: "WEBP", label: "WEBP" },
                    { value: "PDF", label: "PDF" },
                  ]}
                  className="text-sm w-36"
                  isSearchable={false}
                />
                {isConversionComplete ? (
                  <>
                    <button onClick={handleDownload} className="px-4 py-2 rounded-md bg-[#ff7e50] text-white hover:bg-[#ff6b35]">
                      Download All
                    </button>
                    <button onClick={resetConversion} className="px-4 py-2 rounded-md bg-[#6b7e94] text-white hover:bg-[#475261]">
                      New Conversion
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConvert}
                    disabled={isConverting}
                    className={`px-4 py-2 rounded-md text-white ${
                      isConverting ? "bg-gray-400 cursor-not-allowed" : "bg-[#055] hover:bg-[#183535]"
                    }`}
                  >
                    {isConverting ? "Converting..." : "Convert All"}
                  </button>
                )}
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && !isConversionComplete && (
            <div className="bg-white shadow rounded-md">
              <ul className="divide-y divide-gray-200">
                {files.map((file) => (
                  <li key={`${file.name}-${file.lastModified}`} className="px-6 py-3 flex justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(files.indexOf(file))} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
              )}
            {/* Progress */}
            {isConverting && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${conversionProgress}%` }} />
                </div>
                <p className="text-sm text-gray-600 mt-1 text-right">{conversionProgress}% Complete</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
