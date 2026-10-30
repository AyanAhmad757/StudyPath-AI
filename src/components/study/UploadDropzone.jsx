import React, { useState, useRef } from 'react';
import Button from '../common/Button';
import { UploadCloud, FileText, X, CheckCircle2, Sparkles, AlertCircle, Layers } from 'lucide-react';

export default function UploadDropzone({ onFileSelected, selectedFile, onRemoveFile, onExtract, isExtracting }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateAndProcessFile = (file) => {
    setError(null);
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Maximum supported file size is 10 MB.');
      return;
    }

    const validExtensions = ['pdf', 'docx', 'doc', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT syllabus.');
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-crimson bg-[#fef2f2] dark:bg-crimson/10'
              : 'border-swiss-border dark:border-[#333333] bg-white dark:bg-[#171717] hover:border-swiss-black dark:hover:border-white'
          }`}
        >
          <input
            ref={fileInputRef}
            id="syllabus-file-input"
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white mx-auto flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6 text-crimson" />
          </div>

          <h3 className="font-headline text-base sm:text-lg font-bold text-swiss-black dark:text-white mb-1 tracking-tight">
            Select or drag institutional syllabus document
          </h3>
          <p className="text-xs sm:text-sm text-[#737373] mb-4 max-w-md mx-auto">
            Upload institutional PDF or DOCX file or <span className="text-crimson font-bold underline underline-offset-4">Browse Local Storage</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#737373]">
            <span className="inline-flex items-center gap-1.5 bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] px-3 py-1 rounded font-mono text-[11px] text-swiss-black dark:text-white">
              <FileText className="w-3.5 h-3.5 text-crimson" />
              PDF, DOCX, TXT
            </span>
            <span className="bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] px-2.5 py-1 rounded font-mono text-[10px] text-[#737373]">
              MAX 10 MB
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-swiss-border dark:border-[#262626] flex items-center justify-center gap-4 text-[11px] font-mono text-[#737373]">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-crimson" /> Page-by-page table extraction
            </span>
            <span>•</span>
            <span>Strict telemetry review before AI ingestion</span>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-crimson flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>

              <div className="truncate">
                <h4 className="font-headline text-sm sm:text-base font-bold text-swiss-black dark:text-white truncate">
                  {selectedFile.name}
                </h4>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#737373] mt-1 font-mono">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="text-crimson font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Document Stage
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!isExtracting && (
                <button
                  type="button"
                  onClick={onRemoveFile}
                  className="p-2 text-[#737373] hover:text-crimson hover:bg-swiss-surface dark:hover:bg-[#262626] rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-swiss-border dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#737373] font-mono">
              Document text will be extracted for analytical inspection.
            </p>

            <Button
              onClick={onExtract}
              variant="primary"
              size="lg"
              loading={isExtracting}
              icon={Sparkles}
              className="w-full sm:w-auto shrink-0"
            >
              Extract & Inspect Telemetry
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3.5 rounded-lg bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/30 text-crimson text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
