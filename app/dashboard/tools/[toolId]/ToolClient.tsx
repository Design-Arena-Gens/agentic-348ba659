'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import { User, DocumentTool, PLAN_FEATURES } from '@/lib/types';
import {
  FileText,
  Upload,
  ArrowLeft,
  X,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  user: User;
  tool: DocumentTool;
}

export default function ToolClient({ user, tool }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [outputFiles, setOutputFiles] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');

  const planFeatures = PLAN_FEATURES[user.subscriptionPlan];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const maxSize = planFeatures.maxFileSize;
    const maxFiles = planFeatures.maxFilesPerJob;

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds ${maxSize / (1024 * 1024)}MB limit`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [files, planFeatures]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: processing,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setProcessing(true);
    setStatus('processing');
    setProgress(0);

    try {
      // Upload files
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('toolType', tool.id);

      const uploadRes = await fetch('/api/jobs/create', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { jobId: newJobId } = await uploadRes.json();
      setJobId(newJobId);

      // Poll for job status
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/jobs/${newJobId}`);
        const jobData = await statusRes.json();

        setProgress(jobData.progress);

        if (jobData.status === 'COMPLETED') {
          clearInterval(pollInterval);
          setStatus('completed');
          setOutputFiles(jobData.outputFiles);
          setProcessing(false);
          toast.success('Processing completed!');
        } else if (jobData.status === 'FAILED') {
          clearInterval(pollInterval);
          setStatus('failed');
          setProcessing(false);
          toast.error(jobData.error || 'Processing failed');
        }
      }, 1000);

      // Cleanup interval after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);

    } catch (error) {
      setProcessing(false);
      setStatus('failed');
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDownload = async (fileKey: string, index: number) => {
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(fileKey)}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `output-${index + 1}.${getFileExtension(tool.id)}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const reset = () => {
    setFiles([]);
    setProcessing(false);
    setJobId(null);
    setProgress(0);
    setOutputFiles([]);
    setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">{tool.name}</h1>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {status === 'idle' || status === 'processing' ? (
          <>
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`dropzone mb-6 ${isDragActive ? 'active' : ''} ${processing ? 'disabled' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-500">
                or click to browse (max {planFeatures.maxFileSize / (1024 * 1024)}MB per file)
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-semibold mb-4">Uploaded Files ({files.length})</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      {!processing && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress */}
            {processing && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="font-medium">Processing...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
              </div>
            )}

            {/* Action Button */}
            {!processing && files.length > 0 && (
              <button
                onClick={handleProcess}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Process Files
              </button>
            )}
          </>
        ) : status === 'completed' ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold">Processing Complete!</h2>
                <p className="text-gray-600">Your files are ready to download</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {outputFiles.map((fileKey, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span className="font-medium">Output File {index + 1}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(fileKey, index)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              Process More Files
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h2 className="text-2xl font-bold">Processing Failed</h2>
                <p className="text-gray-600">Something went wrong</p>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function getFileExtension(toolId: string): string {
  if (toolId.includes('pdf') && !toolId.includes('to-')) return 'pdf';
  if (toolId.includes('excel')) return 'xlsx';
  if (toolId.includes('word')) return 'docx';
  if (toolId.includes('csv')) return 'csv';
  if (toolId.includes('jpg')) return 'jpg';
  if (toolId.includes('txt')) return 'txt';
  if (toolId.endsWith('-to-pdf')) return 'pdf';
  if (toolId.endsWith('-to-word')) return 'docx';
  if (toolId.endsWith('-to-excel')) return 'xlsx';
  if (toolId.endsWith('-to-jpg')) return 'jpg';
  if (toolId.endsWith('-to-txt')) return 'txt';
  return 'bin';
}
