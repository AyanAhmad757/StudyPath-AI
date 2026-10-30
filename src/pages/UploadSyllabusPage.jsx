import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { documentParser } from '../services/documentParser';
import { syllabusService } from '../services/syllabusService';
import { aiService } from '../services/aiService';
import UploadDropzone from '../components/study/UploadDropzone';
import ExtractedTextReview from '../components/study/ExtractedTextReview';
import Button from '../components/common/Button';
import { 
  Sparkles, 
  ArrowLeft, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  RotateCcw,
  Layers,
  BookOpen,
  ArrowRight,
  Cpu
} from 'lucide-react';

export default function UploadSyllabusPage() {
  const { addNewSubject, refreshUserData, showToast } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Machine: 'idle' | 'extracting' | 'review' | 'analyzing' | 'success' | 'error'
  const [currentState, setCurrentState] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractionData, setExtractionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [savedSyllabus, setSavedSyllabus] = useState(null);
  const [analyzedSubject, setAnalyzedSubject] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setExtractionData(null);
    setErrorMessage(null);
    setCurrentState('idle');
  };

  // Step 1: Start Document Text Extraction
  const handleStartExtraction = async () => {
    if (!selectedFile) return;

    setCurrentState('extracting');
    setErrorMessage(null);

    try {
      // Run reliable PDF, DOCX, or TXT text extraction & cleaning
      const result = await documentParser.extractTextFromFile(selectedFile);
      setExtractionData(result);
      setCurrentState('review');
    } catch (err) {
      console.error('Extraction failed:', err);
      setErrorMessage(err.message || 'Failed to extract text from the uploaded document.');
      setCurrentState('error');
    }
  };

  // Step 2: User Confirms Verified Extracted Text from Review Screen & Triggers Grok AI
  const handleConfirmVerifiedText = async ({
    verifiedText,
    subjectName,
    pageCount,
    characterCount,
    wordCount,
    fileType,
    fileName,
  }) => {
    if (currentState === 'analyzing') return; // Prevent double-clicks
    setCurrentState('analyzing');
    setErrorMessage(null);

    try {
      // 1. Upload original document to Supabase Storage
      let uploadedFileMeta = null;
      try {
        uploadedFileMeta = await syllabusService.uploadSyllabusFile(selectedFile, user?.id);
      } catch (storageErr) {
        console.warn('Storage upload notice:', storageErr.message);
      }

      // 2. Persist initial syllabus record with verified raw_text and extraction metadata
      const initialSyllabusRecord = {
        name: subjectName,
        title: subjectName,
        code: 'CS701',
        university: 'Engineering Curriculum',
        fileName: uploadedFileMeta?.fileName || fileName,
        fileUrl: uploadedFileMeta?.fileUrl || '',
        rawText: verifiedText,
        fileType,
        pageCount,
        characterCount,
        wordCount,
        status: 'analyzing',
        unitsCount: 0,
        topicsCount: 0,
        completedTopics: 0,
        progress: 0,
        units: [],
      };

      const createdRow = await syllabusService.createSyllabus(initialSyllabusRecord, user?.id);
      const activeSyllabusId = createdRow?.id || null;

      // 3. Invoke Grok AI Analysis via Supabase Edge Function
      const structuredData = await aiService.analyzeSyllabus(
        verifiedText,
        subjectName,
        {
          fileName: fileName || selectedFile?.name,
          fileType,
          syllabusId: activeSyllabusId,
        }
      );

      // 4. Save Structured Units and Topics into Supabase
      const finalSubject = await syllabusService.saveStructuredSyllabus(
        activeSyllabusId,
        structuredData,
        user?.id
      );

      setSavedSyllabus(finalSubject || initialSyllabusRecord);
      setAnalyzedSubject(finalSubject || initialSyllabusRecord);

      if (refreshUserData) {
        await refreshUserData();
      }

      setCurrentState('success');
      showToast('Syllabus analyzed by Grok AI successfully!', 'success');
    } catch (err) {
      console.error('Grok analysis failed:', err);
      setErrorMessage(
        err.message || 'Failed to analyze syllabus with Grok AI. Please check your connection and retry.'
      );
      setCurrentState('error');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractionData(null);
    setErrorMessage(null);
    setSavedSyllabus(null);
    setAnalyzedSubject(null);
    setCurrentState('idle');
  };

  const handleBackToReview = () => {
    if (extractionData) {
      setCurrentState('review');
    } else {
      handleReset();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Back button & Page Title */}
      <div>
        <button
          onClick={() => navigate('/study')}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#737373] hover:text-crimson transition-colors mb-3 uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Curriculum Hub
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-crimson bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/20 px-2.5 py-0.5 rounded flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-crimson" />
            Curriculum Ingestion Protocol
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
          Upload & Deconstruct Syllabus
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-1 max-w-3xl">
          Upload institutional syllabus specifications (PDF, DOCX, TXT). Friday extracts document content page-by-page, verifies raw telemetry, and structures authoritative academic units.
        </p>
      </div>

      {/* STATE 1: IDLE / FILE SELECTION */}
      {currentState === 'idle' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left 7 Columns: Dropzone */}
            <div className="lg:col-span-7">
              <UploadDropzone
                onFileSelected={handleFileSelect}
                selectedFile={selectedFile}
                onRemoveFile={handleRemoveFile}
                onExtract={handleStartExtraction}
                isExtracting={false}
              />
            </div>

            {/* Right 5 Columns: Ingestion Guide */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626] space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-swiss-black dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-crimson" />
                  Syllabus Deconstruction Protocol
                </h3>

                <div className="space-y-3 text-xs text-swiss-black dark:text-white">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333]">
                    <span className="w-5 h-5 rounded bg-crimson text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="font-headline font-bold text-swiss-black dark:text-white">Document Text Extraction</h4>
                      <p className="text-[#737373] text-[11px] mt-0.5 font-normal">Parses visual layout, headers, and academic tables preserving verbatim content.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333]">
                    <span className="w-5 h-5 rounded bg-swiss-black text-white dark:bg-white dark:text-swiss-black font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="font-headline font-bold text-swiss-black dark:text-white">Analytical Verification</h4>
                      <p className="text-[#737373] text-[11px] mt-0.5 font-normal">Inspect and sanitize parsed syllabus tokens before triggering AI decomposition.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333]">
                    <span className="w-5 h-5 rounded bg-crimson text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <h4 className="font-headline font-bold text-swiss-black dark:text-white">Modular Unit Structuring</h4>
                      <p className="text-[#737373] text-[11px] mt-0.5 font-normal">Decomposes curriculum into structured units, topics, and verified video lecture queries.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-swiss-border dark:border-[#262626] flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#737373]">
                  <span className="bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] px-2 py-0.5 rounded font-bold text-swiss-black dark:text-white">PDF</span>
                  <span className="bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] px-2 py-0.5 rounded font-bold text-swiss-black dark:text-white">DOCX</span>
                  <span className="bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] px-2 py-0.5 rounded font-bold text-swiss-black dark:text-white">TXT</span>
                  <span>• Limit 10 MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Highlight Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626] text-xs">
              <span className="font-headline font-bold text-swiss-black dark:text-white flex items-center gap-1.5 mb-1 tracking-tight">
                <Layers className="w-3.5 h-3.5 text-crimson" />
                1. Page-by-Page Extraction
              </span>
              <span className="text-[#737373] leading-relaxed">
                Preserves visual reading order, headers, and multi-page boundaries across PDF and Word documents.
              </span>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626] text-xs">
              <span className="font-headline font-bold text-swiss-black dark:text-white flex items-center gap-1.5 mb-1 tracking-tight">
                <CheckCircle2 className="w-3.5 h-3.5 text-crimson" />
                2. Verifiable Inspection
              </span>
              <span className="text-[#737373] leading-relaxed">
                Inspect and edit extracted text before sending it to AI. Ensures 100% syllabus fidelity.
              </span>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626] text-xs">
              <span className="font-headline font-bold text-swiss-black dark:text-white flex items-center gap-1.5 mb-1 tracking-tight">
                <Cpu className="w-3.5 h-3.5 text-crimson" />
                3. Grok AI Unit Structuring
              </span>
              <span className="text-[#737373] leading-relaxed">
                Decomposes curriculum into structured units, topics, subtopics, and difficulty levels.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: EXTRACTING SPINNER */}
      {currentState === 'extracting' && (
        <div className="bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] p-10 text-center max-w-lg mx-auto space-y-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-crimson mx-auto flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-headline font-bold text-swiss-black dark:text-white tracking-tight">
            Extracting Syllabus Content...
          </h3>
          <p className="text-xs text-[#737373] max-w-xs mx-auto font-mono">
            Parsing pages, assembling reading order, and cleaning tables from <span className="font-bold text-crimson">{selectedFile?.name}</span>.
          </p>
        </div>
      )}

      {/* STATE 3: REVIEW EXTRACTED TEXT */}
      {currentState === 'review' && (
        <ExtractedTextReview
          extractionData={extractionData}
          onConfirmAnalysis={handleConfirmVerifiedText}
          onCancel={handleReset}
          isSaving={false}
        />
      )}

      {/* STATE 4: ANALYZING WITH GROK AI */}
      {currentState === 'analyzing' && (
        <div className="bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 animate-fadeIn">
          <div className="w-14 h-14 rounded-lg bg-crimson text-white mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-crimson bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/20 px-3 py-1 rounded inline-block mb-2">
              Grok AI Engine (xAI)
            </span>
            <h3 className="text-xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              Deconstructing syllabus architecture...
            </h3>
            <p className="text-xs sm:text-sm text-[#737373] mt-2 max-w-xs mx-auto">
              Categorizing units, topics, and strict learning dependencies.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2.5 text-xs font-mono text-crimson pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-crimson" />
            <span>Assembling academic unit telemetry...</span>
          </div>
        </div>
      )}

      {/* STATE 5: ANALYSIS SUCCESS & COURSE SUMMARY */}
      {currentState === 'success' && (
        <div className="bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] p-8 sm:p-10 max-w-2xl mx-auto text-center space-y-6 animate-fadeIn">
          <div className="w-14 h-14 rounded-lg bg-crimson text-white mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-crimson bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/20 px-3 py-1 rounded inline-block mb-2">
              Verification Complete
            </span>
            <h2 className="text-xl sm:text-2xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              Syllabus Structured & Ready
            </h2>
            <p className="text-xs sm:text-sm text-[#737373] mt-1.5 max-w-md mx-auto">
              Verified curriculum <span className="font-bold text-swiss-black dark:text-white font-headline">"{analyzedSubject?.name || savedSyllabus?.title}"</span> structured into authoritative academic units.
            </p>
          </div>

          <div className="bg-swiss-surface dark:bg-[#1f1f1f] rounded-lg p-5 text-left border border-swiss-border dark:border-[#262626] space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-swiss-border dark:border-[#262626]">
              <span className="text-[#737373]">Course Title:</span>
              <span className="font-bold text-swiss-black dark:text-white font-headline text-sm">{analyzedSubject?.name || savedSyllabus?.title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-swiss-border dark:border-[#262626]">
              <span className="text-[#737373]">Course Code:</span>
              <span className="font-bold text-crimson">{analyzedSubject?.code || savedSyllabus?.code || 'CS701'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-swiss-border dark:border-[#262626]">
              <span className="text-[#737373]">Structured Units:</span>
              <span className="font-bold text-swiss-black dark:text-white tabular-nums">{analyzedSubject?.units?.length || analyzedSubject?.unitsCount || 0} Units</span>
            </div>
            <div className="flex justify-between py-1 border-b border-swiss-border dark:border-[#262626]">
              <span className="text-[#737373]">Indexed Topics:</span>
              <span className="font-bold text-swiss-black dark:text-white tabular-nums">{analyzedSubject?.topicsCount || 0} Topics</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#737373]">Telemetry Status:</span>
              <span className="font-bold text-crimson flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified & Saved to Registry
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleReset}
              variant="outline"
              size="md"
              icon={RotateCcw}
              className="w-full sm:w-auto"
            >
              Upload Another Syllabus
            </Button>
            <Button
              onClick={() => navigate(`/study/${analyzedSubject?.id || savedSyllabus?.id}`)}
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Examine Course Units
            </Button>
          </div>
        </div>
      )}

      {/* STATE 6: ERROR (WITH RETRY SUPPORT) */}
      {currentState === 'error' && (
        <div className="bg-white dark:bg-[#171717] rounded-lg border border-crimson/30 p-8 sm:p-10 max-w-xl mx-auto text-center space-y-5 animate-fadeIn">
          <div className="w-12 h-12 rounded-lg bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/30 text-crimson mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              Ingestion Exception
            </h3>
            <p className="text-xs sm:text-sm text-crimson mt-2 max-w-md mx-auto font-mono leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <div className="bg-swiss-surface dark:bg-[#1f1f1f] rounded-lg p-4 text-xs text-[#737373] text-left space-y-1.5 border border-swiss-border dark:border-[#262626] font-mono">
            <p className="font-bold text-swiss-black dark:text-white">Diagnostic Suggestions:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Check that the Supabase Edge Function <code>analyze-syllabus</code> is deployed.</li>
              <li>Ensure the extracted text contains valid syllabus curriculum content.</li>
              <li>You can edit the text to remove non-syllabus administrative headers before re-analyzing.</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {extractionData && (
              <Button
                onClick={handleBackToReview}
                variant="outline"
                size="md"
                icon={BookOpen}
                className="w-full sm:w-auto"
              >
                Review & Edit Text
              </Button>
            )}
            <Button
              onClick={handleReset}
              variant="primary"
              size="md"
              icon={RotateCcw}
              className="w-full sm:w-auto"
            >
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

