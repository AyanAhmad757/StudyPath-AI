import React, { useState } from 'react';
import Button from '../common/Button';
import { 
  FileText, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Hash, 
  AlignLeft, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export default function ExtractedTextReview({
  extractionData,
  onConfirmAnalysis,
  onCancel,
  isSaving = false,
}) {
  const [currentText, setCurrentText] = useState(extractionData?.fullText || '');
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(extractionData?.fullText || '');
  const [subjectName, setSubjectName] = useState(
    extractionData?.detectedSubject || ''
  );
  const [validationError, setValidationError] = useState(null);

  if (!extractionData) return null;

  const {
    fileName,
    fileType,
    pageCount,
    characterCount,
    wordCount,
  } = extractionData;

  // Calculate live counts based on current/edited text
  const liveCharCount = currentText.length;
  const liveWordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;

  const handleStartEditing = () => {
    setDraftText(currentText);
    setIsEditing(true);
    setValidationError(null);
  };

  const handleCancelEditing = () => {
    setDraftText(currentText);
    setIsEditing(false);
    setValidationError(null);
  };

  const handleSaveChanges = () => {
    if (!draftText.trim()) {
      setValidationError('Extracted syllabus text cannot be empty.');
      return;
    }
    setCurrentText(draftText.trim());
    setIsEditing(false);
    setValidationError(null);
  };

  const handleConfirm = () => {
    if (!currentText.trim()) {
      setValidationError('Please ensure syllabus text is present before continuing.');
      return;
    }
    onConfirmAnalysis({
      verifiedText: currentText,
      subjectName: subjectName.trim() || 'Untitled Course',
      pageCount,
      characterCount: liveCharCount,
      wordCount: liveWordCount,
      fileType,
      fileName,
    });
  };

  const formatFileTypeLabel = (type) => {
    switch (type) {
      case 'pdf':
        return 'PDF Document';
      case 'docx':
      case 'doc':
        return 'Word Document';
      case 'txt':
        return 'Plain Text (UTF-8)';
      default:
        return 'Document';
    }
  };

  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] p-6 sm:p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-swiss-border dark:border-[#262626]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-crimson bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/20 px-2.5 py-0.5 rounded inline-flex items-center gap-1">
              <Check className="w-3 h-3 text-crimson stroke-[3]" />
              Verbatim Extraction Complete
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
            Review Extracted Syllabus Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
            Verify parsed text accuracy prior to algorithmic unit partitioning.
          </p>
        </div>

        {/* Metadata Summary Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white">
            <FileText className="w-3.5 h-3.5 text-crimson" />
            {formatFileTypeLabel(fileType)}
          </span>
          {pageCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white">
              <Layers className="w-3.5 h-3.5 text-crimson" />
              {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white tabular-nums">
            <AlignLeft className="w-3.5 h-3.5 text-crimson" />
            {liveWordCount.toLocaleString()} Words
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white tabular-nums">
            <Hash className="w-3.5 h-3.5 text-crimson" />
            {liveCharCount.toLocaleString()} Chars
          </span>
        </div>
      </div>

      {/* Subject Name Input / Confirmation */}
      <div className="bg-swiss-surface dark:bg-[#1f1f1f] rounded-lg p-4 border border-swiss-border dark:border-[#262626] space-y-1.5">
        <label className="block text-[11px] font-mono font-bold text-swiss-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-crimson" />
          Academic Subject / Course Identifier
        </label>
        <p className="text-[11px] text-[#737373]">
          Confirm or sanitize the syllabus title detected from document text:
        </p>
        <input
          type="text"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          placeholder="e.g. Computer Networks, Distributed Systems, Operating Systems"
          className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#333333] focus:border-swiss-black dark:focus:border-white focus:outline-none text-swiss-black dark:text-white font-mono transition-colors"
        />
      </div>

      {/* Extracted Text Content Box / Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-swiss-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-crimson" />
            Raw Telemetry Stream ({fileName})
          </span>

          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEditing}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white hover:border-swiss-black dark:hover:border-white transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-crimson" />
              Edit Text
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEditing}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-[#737373] hover:text-swiss-black dark:hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold rounded bg-crimson text-white hover:bg-crimson-hover transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Commit Edit
              </button>
            </div>
          )}
        </div>

        {/* Text View / Edit Area */}
        {!isEditing ? (
          <div className="relative rounded-lg border border-swiss-border dark:border-[#262626] bg-swiss-surface dark:bg-[#121212] overflow-hidden">
            <pre className="p-5 sm:p-6 font-mono text-xs sm:text-[13px] leading-relaxed text-swiss-black dark:text-[#d4d4d4] whitespace-pre-wrap break-words max-h-[500px] xl:max-h-[600px] overflow-y-auto">
              {currentText}
            </pre>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={18}
              className="w-full p-5 font-mono text-xs sm:text-[13px] leading-relaxed rounded-lg bg-white dark:bg-[#121212] border border-crimson focus:outline-none text-swiss-black dark:text-white resize-y max-h-[650px]"
              placeholder="Paste or edit syllabus text here..."
            />
            <p className="text-[11px] text-[#737373] font-mono">
              Adjust formatting, remove administrative headers, or correct OCR artifacts before analysis.
            </p>
          </div>
        )}
      </div>

      {validationError && (
        <div className="p-3.5 rounded-lg bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/30 text-crimson text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 border-t border-swiss-border dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto px-4 py-2 text-xs font-mono font-bold text-[#737373] hover:text-crimson transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Abort & Replace File
        </button>

        <Button
          onClick={handleConfirm}
          variant="primary"
          size="lg"
          loading={isSaving}
          disabled={isSaving || !currentText.trim()}
          icon={Sparkles}
          className="w-full sm:w-auto"
        >
          Verify & Trigger AI Ingestion
        </Button>
      </div>
    </div>
  );
}
