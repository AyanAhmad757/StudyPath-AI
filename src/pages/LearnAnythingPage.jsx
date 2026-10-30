import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { documentParser } from '../services/documentParser';
import { aiTeachingEngine } from '../services/api/aiTeachingEngine';
import { lessonService } from '../services/api/lessonService';
import {
  Sparkles,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  X,
  Eye,
} from 'lucide-react';

export default function LearnAnythingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTopic = searchParams.get('topic') || '';
  const [topicName, setTopicName] = useState(initialTopic);
  const [learningLevel, setLearningLevel] = useState('intermediate');

  useEffect(() => {
    const urlTopic = searchParams.get('topic');
    if (urlTopic && urlTopic.trim()) {
      setTopicName(urlTopic.trim());
    }
  }, [searchParams]);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractionResult, setExtractionResult] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ stage: '', progress: 0, message: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;
    setError(null);
    setUploadedFile(file);
    setIsExtracting(true);

    try {
      const result = await documentParser.extractTextFromFile(file, (p) => {
        setExtractionProgress(p);
      });

      setExtractionResult(result);

      if (!topicName.trim()) {
        if (result.detectedSubject) {
          setTopicName(result.detectedSubject);
        } else {
          const cleanName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .trim();
          setTopicName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err.message || 'Failed to extract text from the uploaded file.');
      setUploadedFile(null);
      setExtractionResult(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setExtractionResult(null);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleGenerateLesson = async (e) => {
    e.preventDefault();
    const finalTopic = topicName.trim();
    if (!finalTopic) return;

    setError(null);
    setIsGenerating(true);

    try {
      setGenerationStep('Synthesizing structured lesson plan...');
      const response = await aiTeachingEngine.generateStandaloneLesson({
        topicName: finalTopic,
        extractedText: extractionResult?.fullText || '',
        learningLevel,
      });

      setGenerationStep('Saving lesson to personal library...');
      const saved = await lessonService.saveLesson({
        title: response.title || finalTopic,
        content: response.content,
        learningLevel,
        sourceFileId: null,
        userId: user?.id || null,
      });

      navigate(`/lessons/${saved.id}`);
    } catch (err) {
      console.error('Lesson generation error:', err);
      setError(err.message || 'Failed to generate lesson. Please check AI configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-[#e5e5e5] dark:border-[#262626] pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#fef2f2] dark:bg-crimson/20 text-crimson text-xs font-headline font-bold mb-3 border border-crimson/30 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Mode B • Instant Standalone Learning
        </div>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-[#0a0a0a] dark:text-white tracking-tight">
          Learn Anything
        </h1>
        <p className="mt-2 text-[#737373] text-sm leading-relaxed">
          Enter any academic concept, algorithm, or theorem—or upload lecture notes, slides, or scanned texts.
          The AI engine synthesizes an objective, research-grade interactive lesson.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleGenerateLesson} className="space-y-6">
        {/* Topic Name Input */}
        <div className="bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] rounded-lg p-6 sm:p-8 space-y-4">
          <label className="block text-xs uppercase font-headline font-bold tracking-wider text-[#0a0a0a] dark:text-white">
            Topic or Concept to Master <span className="text-crimson">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Distributed Consensus in Raft, Dijkstra Algorithm, Quantum Teleportation..."
              className="w-full px-4 py-3 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] text-[#0a0a0a] dark:text-white placeholder-[#737373] focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white text-sm font-medium transition-colors"
              disabled={isGenerating}
            />
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#737373]">
            <span className="font-headline font-semibold text-[#737373]">Suggestions:</span>
            {[
              'B-Tree Indexing in Databases',
              'Backpropagation and Gradient Descent',
              'Virtual Memory and Paging',
              'RSA Cryptography',
            ].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setTopicName(s)}
                className="px-2.5 py-1 rounded bg-[#f4f4f4] dark:bg-neutral-800 hover:bg-[#0a0a0a] hover:text-white dark:hover:bg-white dark:hover:text-[#0a0a0a] text-[#171717] dark:text-neutral-200 transition-colors text-xs font-medium border border-[#e5e5e5] dark:border-neutral-700"
                disabled={isGenerating}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Document Upload Card */}
        <div className="bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] rounded-lg p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs uppercase font-headline font-bold tracking-wider text-[#0a0a0a] dark:text-white">
                Ground in Study Material (Optional)
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Upload a lecture PDF, DOCX, TXT, or scanned textbook photo.
              </p>
            </div>
            {uploadedFile && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-crimson bg-[#fef2f2] dark:bg-crimson/20 px-2.5 py-0.5 rounded border border-crimson/30 flex items-center gap-1 font-headline">
                <CheckCircle2 className="w-3 h-3" />
                Attached
              </span>
            )}
          </div>

          {!uploadedFile ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#e5e5e5] dark:border-[#262626] hover:border-[#0a0a0a] dark:hover:border-white rounded-lg p-8 text-center transition-all bg-[#fafafa] dark:bg-[#121212] cursor-pointer"
              onClick={() => document.getElementById('file-input-learn')?.click()}
            >
              <input
                id="file-input-learn"
                type="file"
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                disabled={isExtracting || isGenerating}
              />
              <div className="w-10 h-10 rounded-md bg-[#f4f4f4] dark:bg-neutral-800 text-[#0a0a0a] dark:text-white flex items-center justify-center mx-auto mb-3 border border-[#e5e5e5] dark:border-neutral-700">
                <UploadCloud className="w-5 h-5 text-crimson" />
              </div>
              <p className="text-xs sm:text-sm font-headline font-semibold text-[#0a0a0a] dark:text-white">
                Click or drag & drop research material here
              </p>
              <p className="text-[11px] text-[#737373] mt-1">
                PDF, Word DOCX, TXT, or Photos (Max 10 MB) • Scanned documents processed via OCR
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-[#f4f4f4] dark:bg-neutral-800 text-[#0a0a0a] dark:text-white flex items-center justify-center shrink-0 border border-[#e5e5e5] dark:border-neutral-700">
                    <FileText className="w-4 h-4 text-crimson" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-[11px] text-[#737373]">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • {extractionResult?.pageCount || 1} page(s)
                      {extractionResult?.isOcr && ' • OCR Processed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="p-1.5 text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white rounded hover:bg-[#e5e5e5] dark:hover:bg-neutral-800 transition-colors"
                    title="Preview extracted text"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-[#737373] hover:text-crimson rounded hover:bg-[#e5e5e5] dark:hover:bg-neutral-800 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {extractionResult?.warnings && extractionResult.warnings.length > 0 && (
                <div className="text-xs text-crimson bg-[#fef2f2] dark:bg-crimson/20 p-2.5 rounded border border-crimson/30">
                  {extractionResult.warnings.join(' ')}
                </div>
              )}
            </div>
          )}

          {/* Extraction progress bar */}
          {isExtracting && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#737373] font-medium font-headline">
                <span>{extractionProgress.message || 'Extracting content...'}</span>
                <span className="tabular-nums font-bold text-[#0a0a0a] dark:text-white">{extractionProgress.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#f4f4f4] dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-crimson transition-all duration-300 rounded-full"
                  style={{ width: `${extractionProgress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Learning Level Selector */}
        <div className="bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] rounded-lg p-6 sm:p-8 space-y-3">
          <label className="block text-xs uppercase font-headline font-bold tracking-wider text-[#0a0a0a] dark:text-white">
            Target Research Depth
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'beginner',
                label: 'Beginner',
                desc: 'Intuitive analogies, core principles, foundational examples.',
              },
              {
                id: 'intermediate',
                label: 'Intermediate',
                desc: 'Standard academic rigor, algorithms, equations, viva prep.',
              },
              {
                id: 'advanced',
                label: 'Advanced',
                desc: 'Formal proofs, asymptotic limits, distributed scale trade-offs.',
              },
            ].map((lvl) => (
              <button
                type="button"
                key={lvl.id}
                onClick={() => setLearningLevel(lvl.id)}
                className={`p-4 rounded-lg text-left border transition-all ${
                  learningLevel === lvl.id
                    ? 'bg-[#f4f4f4] dark:bg-[#1f1f1f] border-[#0a0a0a] dark:border-white text-[#0a0a0a] dark:text-white font-bold'
                    : 'bg-white dark:bg-[#121212] border-[#e5e5e5] dark:border-[#262626] text-[#737373] hover:border-[#0a0a0a] dark:hover:border-white'
                }`}
                disabled={isGenerating}
              >
                <div className="font-headline font-bold text-xs uppercase tracking-wider">{lvl.label}</div>
                <div className="text-xs text-[#737373] mt-1.5 leading-relaxed">{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-lg bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30 text-crimson text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-bold font-headline">Generation Error:</span> {error}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!topicName.trim() || isGenerating || isExtracting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-crimson hover:bg-crimson-hover disabled:opacity-40 text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{generationStep || 'Generating Lesson...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate In-Depth Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Extracted Text Preview Modal: 1px border (#0a0a0a), hard edge */}
      {showPreviewModal && extractionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-[#171717] border border-[#0a0a0a] dark:border-neutral-700 rounded-lg flex flex-col shadow-[0_4px_0_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#e5e5e5] dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm uppercase tracking-wider">Extracted Document Preview</h3>
                <p className="text-xs text-[#737373] mt-0.5 tabular-nums">
                  {extractionResult.wordCount} words • {extractionResult.characterCount} characters
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white rounded hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-xs text-[#171717] dark:text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[60vh] bg-[#fafafa] dark:bg-[#121212]">
              {extractionResult.fullText}
            </div>
            <div className="p-4 border-t border-[#e5e5e5] dark:border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-lg bg-[#0a0a0a] text-white hover:bg-[#171717] dark:bg-white dark:text-[#0a0a0a] text-xs font-headline font-semibold uppercase tracking-wider transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
