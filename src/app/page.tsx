"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';
import { File, Upload, X } from 'lucide-react';
import { ErrorCard } from '@/components/ErrorCard';
import { Leckerli_One,Poppins } from 'next/font/google';

const leckerliOne = Leckerli_One({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
});

const poppins = Poppins({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
});

type FileWithPreview = File & {
  preview: string;
};

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isConversionComplete, setIsConversionComplete] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState({ value: 'Convert Into', label: 'Convert Into' });
  const [conversionProgress, setConversionProgress] = useState(0);
  const [error, setError] = useState<{message: string, type?: 'error' | 'success' | 'warning' | 'info'} | null>(null);

  // Example function to show error
  const showError = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    setError({ message, type });
  };

  // Example function to handle file conversion with error handling
  const handleConvert = () => {
    if (files.length === 0) {
      showError('Please select at least one file to convert', 'error');
      return;
    }

    if (selectedFormat.value === 'Convert Into') {
      showError('Please select a target format', 'warning');
      return;
    }

    // Your conversion logic here
    setIsConverting(true);

    const interval = setInterval(() => {
      setConversionProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 20);
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsConverting(false);
          return 100;
        }
        return newProgress;
      });
    }, 300);
    
    // Simulate conversion
    setTimeout(() => {
      setIsConverting(false);
      setIsConversionComplete(true);
      showError('Conversion completed successfully!', 'success');
    }, 2000);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx', '.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xls'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx', '.ppt'],
    },
    maxFiles: 10,
  });

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    setIsConversionComplete(false);
  };

  const handleDownload = () => {
    // In a real app, this would download the converted file
    // For now, we'll simulate it by downloading the original file
    files.forEach((file, index) => {
      const a = document.createElement('a');
      a.href = file.preview;
      a.download = `converted_${index}.${selectedFormat.value.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const resetConversion = () => {
    setFiles([]);
    setSelectedFormat({ value: 'Convert Into', label: 'Convert Into' });
    setConversionProgress(0);
    setIsConversionComplete(false);
    setIsConverting(false);
  };

  // const convertFiles = () => {
  //   if (files.length === 0) return alert('Please select a file to convert');
  //   if (selectedFormat.value === 'Convert Into') return alert('Please select a format to convert into');

  //   setIsConverting(true);
  //   setConversionProgress(0);
    
  //   // Simulate conversion progress
  //   const interval = setInterval(() => {
  //     setConversionProgress(prev => {
  //       const newProgress = prev + Math.floor(Math.random() * 20);
  //       if (newProgress >= 100) {
  //         clearInterval(interval);
  //         setIsConverting(false);
  //         return 100;
  //       }
  //       return newProgress;
  //     });
  //   }, 300);
  // };

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
        <section aria-labelledby="file-conversion" className="mb-8 sm:mb-12">
          <header className="text-center pt-6 sm:pt-12">
            <h1 className={`text-4xl sm:text-6xl md:text-7xl font-bold text-[#055] mb-2 ${leckerliOne.className}`}>Convertly</h1>
            <p className={`text-lg sm:text-xl md:text-2xl text-gray-600 mb-3 sm:mb-4 ${poppins.className}`}>Effortless file conversion at your fingertips</p>
            <p className="sr-only">Free online tool to convert between various file formats including images, documents, spreadsheets, and presentations.</p>
            <p className={`text-xs sm:text-sm text-gray-500 ${poppins.className}`}>Convert between JPG, PNG, PDF, DOCX, XLSX, and more</p>
          </header>

        </section>

        {/* File Upload Section */}
        <section aria-labelledby="upload-section" className="mb-8">
        <div 
          {...(isConverting || isConversionComplete ? {} : getRootProps())} 
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-12 text-center transition-colors ${
            isConverting || isConversionComplete 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : isDragActive 
                ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                : 'border-gray-300 hover:border-[#055] bg-white cursor-pointer'
          }`}
          aria-disabled={isConverting || isConversionComplete}
        >
          <input {...getInputProps()} />
          <div className={`flex flex-col items-center justify-center space-y-2 sm:space-y-4 ${
            isConverting || isConversionComplete ? 'opacity-60' : ''
          }`}>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop the files here' : 'Drag & drop files here'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                or click to browse files
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Supported: JPG, PNG, PDF, DOC, DOCX, XLSX, PPTX
            </p>
            <p className="text-xs text-gray-400">
              (Max 10MB per file)
            </p>
          </div>
        </div>

        </section>

        {/* File List Section */}
        <section aria-labelledby="file-list">
        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Selected Files ({files.length})
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-36">
                  <Select
                    value={selectedFormat}
                    onChange={(selectedOption) => selectedOption && setSelectedFormat(selectedOption)}
                    options={[
                      { value: 'JPG', label: 'JPG' },
                      { value: 'PNG', label: 'PNG' },
                      { value: 'PDF', label: 'PDF' },
                      { value: 'DOCX', label: 'DOCX' },
                      { value: 'XLSX', label: 'XLSX' },
                      { value: 'PPTX', label: 'PPTX' },
                    ]}
                    className="text-sm"
                    classNamePrefix="select"
                    isSearchable={false}
                    placeholder="Convert to..."
                    menuPlacement="auto"
                    menuPosition="fixed"
                  />
                </div>
                {isConversionComplete ? (
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 text-sm sm:text-base rounded-md bg-[#ff7e50] hover:bg-[#ff6b35] text-white font-medium flex-1 sm:flex-none"
                    >
                      Download All
                    </button>
                    <button
                      onClick={resetConversion}
                      className="px-4 py-2 text-sm sm:text-base rounded-md bg-[#6b7e94] hover:bg-[#475261] text-white font-medium flex-1 sm:flex-none"
                    >
                      New Conversion
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConvert}
                    disabled={isConverting}
                    className={`px-4 py-2 text-sm sm:text-base rounded-md text-white font-medium w-full sm:w-auto ${
                      isConverting 
                        ? 'bg-[#055] cursor-not-allowed' 
                        : 'bg-[#055] hover:bg-[#183535]'
                    }`}
                  >
                    {isConverting ? 'Converting...' : 'Convert All'}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={file.name} className="px-3 py-3 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                        <div className="flex-shrink-0">
                          <File className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 font-semibold">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="text-gray-400 hover:text-gray-500 p-1"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                    {index === 0 && isConverting && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${conversionProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {conversionProgress}% Complete
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        </section>
      </main>
    </div>
  );
}
