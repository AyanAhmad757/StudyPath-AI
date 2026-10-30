/**
 * Document Parser Service for AI Study Platform
 * 
 * Comprehensive client & worker text extraction pipeline supporting:
 * - PDF (page-by-page text extraction using Mozilla PDF.js, with OCR fallback for scanned pages)
 * - DOCX (paragraph, heading, and table extraction using Mammoth)
 * - TXT (UTF-8 text extraction with CRLF/LF normalization)
 * - Images (PNG, JPG, JPEG, WEBP) via Tesseract OCR
 * 
 * Features:
 * - Text cleaning & whitespace normalization
 * - Repeated header/footer removal
 * - Scanned / image-only PDF detection with automated OCR processing
 * - Quality verification & minimum content checks
 * - Subject / course name detection from document header
 * - Internal page boundary tracking
 * - Uncertainty and extraction warning reporting (never invents missing content)
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

// Configure PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt', 'png', 'jpg', 'jpeg', 'webp'];
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

export const documentParser = {
  /**
   * Main entry point: validates file and extracts text based on file type
   * @param {File} file
   * @param {Function} [onProgress] Callback with { stage, progress, message }
   */
  async extractTextFromFile(file, onProgress = () => {}) {
    if (!file) {
      throw new Error('No file provided for extraction.');
    }

    // 1. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 10 MB maximum allowed limit.`);
    }

    // 2. Validate Extension & MIME Type
    const fileName = file.name || '';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeType = file.type?.toLowerCase() || '';

    const isExtensionValid = SUPPORTED_EXTENSIONS.includes(ext);
    const isMimeValid = !mimeType || SUPPORTED_MIME_TYPES.some((m) => mimeType.includes(m.split('/')[1]));

    if (!isExtensionValid && !isMimeValid) {
      throw new Error(`Unsupported file type: .${ext || 'unknown'}. Please upload a PDF, DOCX, TXT, PNG, JPG, or WEBP file.`);
    }

    onProgress({ stage: 'validating', progress: 10, message: 'Validating document format...' });

    let extractionResult = null;

    // 3. Dispatch to Specific Extractor
    if (ext === 'pdf' || mimeType.includes('pdf')) {
      onProgress({ stage: 'extracting', progress: 30, message: 'Extracting text from PDF pages...' });
      extractionResult = await this.extractPdfText(file, onProgress);
    } else if (ext === 'docx' || ext === 'doc' || mimeType.includes('word') || mimeType.includes('officedocument')) {
      onProgress({ stage: 'extracting', progress: 40, message: 'Extracting headings, paragraphs, and tables from DOCX...' });
      extractionResult = await this.extractDocxText(file);
    } else if (ext === 'txt' || mimeType.includes('plain')) {
      onProgress({ stage: 'extracting', progress: 50, message: 'Reading plain text...' });
      extractionResult = await this.extractTxtText(file);
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || mimeType.startsWith('image/')) {
      onProgress({ stage: 'ocr', progress: 30, message: 'Running OCR on image...' });
      extractionResult = await this.extractImageOcr(file, onProgress);
    } else {
      throw new Error('Unsupported file type. Please upload a PDF, DOCX, TXT, PNG, JPG, or WEBP document.');
    }

    // 4. Quality Verification
    this.verifyExtractionQuality(extractionResult, file);

    // 5. Detect Subject / Course Title from Document Content
    const detectedSubject = this.detectSubjectName(extractionResult.fullText, fileName);
    extractionResult.detectedSubject = detectedSubject;

    onProgress({ stage: 'completed', progress: 100, message: 'Document extraction successful.' });

    // 6. Development Debug Logging
    this.logDebugInfo(file, extractionResult);

    return extractionResult;
  },

  /**
   * Extracts text from PDF files page-by-page preserving reading order & boundaries.
   * If the text layer is empty or scanned, triggers client-side OCR fallback.
   */
  async extractPdfText(file, onProgress = () => {}) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: true,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;

      if (numPages === 0) {
        throw new Error('The uploaded PDF file contains no pages.');
      }

      const pages = [];
      let totalExtractedChars = 0;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent({
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        });

        const rawPageText = this.assemblePdfPageText(textContent.items);
        const cleanedPageText = this.cleanExtractedText(rawPageText);

        totalExtractedChars += cleanedPageText.length;
        pages.push({
          pageNumber: pageNum,
          text: cleanedPageText,
        });

        onProgress({
          stage: 'extracting',
          progress: 30 + Math.floor((pageNum / numPages) * 40),
          message: `Extracted page ${pageNum} of ${numPages}...`,
        });
      }

      // Check if PDF is a scanned document (insufficient text extracted)
      const avgCharsPerPage = totalExtractedChars / (numPages || 1);
      if (numPages >= 1 && (totalExtractedChars < 40 || avgCharsPerPage < 25)) {
        console.warn('[documentParser] PDF text layer is sparse. Initiating OCR fallback on PDF pages...');
        onProgress({ stage: 'ocr', progress: 50, message: 'Scanned PDF detected. Running OCR processing...' });
        return await this.extractPdfViaOcr(pdfDocument, file, onProgress);
      }

      // Remove repeated running headers and footers across multi-page documents
      const normalizedPages = this.removeRepeatedHeadersAndFooters(pages);

      const fullText = normalizedPages
        .map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`)
        .join('\n\n');

      const rawCleanText = normalizedPages.map((p) => p.text).join('\n\n');
      const charCount = rawCleanText.length;
      const wordCount = rawCleanText.trim() ? rawCleanText.trim().split(/\s+/).length : 0;

      return {
        fileName: file.name,
        fileType: 'pdf',
        fileSize: file.size,
        pageCount: numPages,
        characterCount: charCount,
        wordCount: wordCount,
        pages: normalizedPages,
        fullText: fullText.trim(),
        rawCleanText: rawCleanText.trim(),
        isOcr: false,
        confidence: 'high',
        warnings: [],
      };
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      if (error.message?.includes('Password') || error.name === 'PasswordException') {
        throw new Error('This PDF is password-protected. Please upload an unprotected PDF.');
      }
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  },

  /**
   * OCR Fallback for scanned PDFs: renders pages onto an offscreen canvas and applies Tesseract OCR
   */
  async extractPdfViaOcr(pdfDocument, file, onProgress = () => {}) {
    const numPages = Math.min(pdfDocument.numPages, 10); // Process up to first 10 pages for performance
    const pages = [];
    let worker = null;

    try {
      worker = await createWorker('eng');

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        onProgress({
          stage: 'ocr',
          progress: 50 + Math.floor((pageNum / numPages) * 45),
          message: `Running OCR on page ${pageNum} of ${numPages}...`,
        });

        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const { data: { text, confidence } } = await worker.recognize(canvas);
        const cleaned = this.cleanExtractedText(text);

        pages.push({
          pageNumber: pageNum,
          text: cleaned,
          ocrConfidence: confidence,
        });
      }

      await worker.terminate();
      worker = null;

      const fullText = pages
        .map((p) => `--- Page ${p.pageNumber} (OCR) ---\n${p.text}`)
        .join('\n\n');

      const rawCleanText = pages.map((p) => p.text).join('\n\n');
      const charCount = rawCleanText.length;
      const wordCount = rawCleanText.trim() ? rawCleanText.trim().split(/\s+/).length : 0;

      return {
        fileName: file.name,
        fileType: 'pdf',
        fileSize: file.size,
        pageCount: pdfDocument.numPages,
        characterCount: charCount,
        wordCount: wordCount,
        pages,
        fullText: fullText.trim(),
        rawCleanText: rawCleanText.trim(),
        isOcr: true,
        confidence: charCount > 100 ? 'medium' : 'low',
        warnings: [
          'Text was extracted using optical character recognition (OCR) from a scanned document. Please verify key topic names and formulas.',
        ],
      };
    } catch (ocrErr) {
      if (worker) {
        try { await worker.terminate(); } catch (_) { }
      }
      throw new Error(`OCR processing failed for scanned PDF: ${ocrErr.message}`);
    }
  },

  /**
   * OCR for image files (PNG, JPG, JPEG, WEBP)
   */
  async extractImageOcr(file, onProgress = () => {}) {
    let worker = null;
    try {
      onProgress({ stage: 'ocr', progress: 40, message: 'Initializing optical character recognition...' });
      worker = await createWorker('eng');

      onProgress({ stage: 'ocr', progress: 70, message: 'Analyzing text and layout from image...' });
      const { data: { text, confidence } } = await worker.recognize(file);
      await worker.terminate();
      worker = null;

      const cleanedText = this.cleanExtractedText(text);
      const charCount = cleanedText.length;
      const wordCount = cleanedText.trim() ? cleanedText.trim().split(/\s+/).length : 0;

      if (charCount < 15) {
        throw new Error(
          'Could not detect readable text in this image. Please ensure the image is clear, well-lit, and contains readable printed or typed text.'
        );
      }

      const warnings = [];
      if (confidence < 60) {
        warnings.push('Low OCR confidence detected. Certain words or symbols may need manual verification.');
      }

      return {
        fileName: file.name,
        fileType: file.name.split('.').pop()?.toLowerCase() || 'image',
        fileSize: file.size,
        pageCount: 1,
        characterCount: charCount,
        wordCount: wordCount,
        pages: [{ pageNumber: 1, text: cleanedText }],
        fullText: cleanedText,
        rawCleanText: cleanedText,
        isOcr: true,
        confidence: confidence >= 70 ? 'high' : 'medium',
        warnings,
      };
    } catch (err) {
      if (worker) {
        try { await worker.terminate(); } catch (_) { }
      }
      throw new Error(`Image text extraction failed: ${err.message}`);
    }
  },

  /**
   * Sorts and groups PDF text items by visual position (Y coordinate descending, X ascending)
   */
  assemblePdfPageText(items) {
    if (!items || items.length === 0) return '';

    const validItems = items.filter((item) => typeof item.str === 'string' && item.str.trim().length > 0);
    if (validItems.length === 0) return '';

    validItems.sort((a, b) => {
      const yA = a.transform[5];
      const yB = b.transform[5];
      const yDiff = yB - yA;
      if (Math.abs(yDiff) > 3) {
        return yDiff;
      }
      return a.transform[4] - b.transform[4];
    });

    const lines = [];
    let currentLine = [];
    let lastY = null;
    let lastX = null;
    let lastWidth = 0;

    for (const item of validItems) {
      const x = item.transform[4];
      const y = item.transform[5];
      const text = item.str;

      if (lastY === null) {
        currentLine.push(text);
      } else if (Math.abs(lastY - y) > 4) {
        lines.push(currentLine.join(' '));
        currentLine = [text];
      } else {
        const gap = x - (lastX + lastWidth);
        if (gap > 4 && !currentLine[currentLine.length - 1].endsWith(' ') && !text.startsWith(' ')) {
          currentLine.push(' ');
        }
        currentLine.push(text);
      }

      lastY = y;
      lastX = x;
      lastWidth = item.width || 0;
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }

    return lines.join('\n');
  },

  /**
   * Extracts text from DOCX files preserving headings, paragraphs, and tables
   */
  async extractDocxText(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value || '';

      if (!html.trim()) {
        const rawResult = await mammoth.extractRawText({ arrayBuffer });
        const rawText = this.cleanExtractedText(rawResult.value || '');
        return this.createSinglePageResult(file, 'docx', rawText);
      }

      const formattedText = this.convertDocxHtmlToStructuredText(html);
      const cleanedText = this.cleanExtractedText(formattedText);

      return this.createSinglePageResult(file, 'docx', cleanedText);
    } catch (error) {
      console.error('Error extracting DOCX text:', error);
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  },

  /**
   * Converts Mammoth HTML into structured text with tables and headings
   */
  convertDocxHtmlToStructuredText(html) {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const lines = [];

    const traverse = (element) => {
      if (!element) return;

      const tag = element.tagName ? element.tagName.toLowerCase() : '';

      if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
        const hText = element.textContent.trim();
        if (hText) lines.push(`\n### ${hText}\n`);
      } else if (tag === 'p') {
        const pText = element.textContent.trim();
        if (pText) lines.push(pText);
      } else if (tag === 'table') {
        const rows = element.querySelectorAll('tr');
        rows.forEach((row) => {
          const cells = Array.from(row.querySelectorAll('th, td')).map((c) => c.textContent.trim());
          if (cells.some((c) => c.length > 0)) {
            lines.push(`| ${cells.join(' | ')} |`);
          }
        });
        lines.push('');
      } else if (tag === 'ul' || tag === 'ol') {
        const items = element.querySelectorAll('li');
        items.forEach((li) => {
          const liText = li.textContent.trim();
          if (liText) lines.push(`- ${liText}`);
        });
      } else {
        element.childNodes.forEach(traverse);
      }
    };

    traverse(body);
    return lines.join('\n');
  },

  /**
   * Extracts text from TXT files
   */
  async extractTxtText(file) {
    try {
      const text = await file.text();
      const cleanedText = this.cleanExtractedText(text);
      return this.createSinglePageResult(file, 'txt', cleanedText);
    } catch (error) {
      throw new Error(`Failed to read TXT file: ${error.message}`);
    }
  },

  createSinglePageResult(file, fileType, text) {
    const rawCleanText = text.trim();
    const charCount = rawCleanText.length;
    const wordCount = rawCleanText ? rawCleanText.split(/\s+/).length : 0;

    return {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      pageCount: 1,
      characterCount: charCount,
      wordCount,
      pages: [{ pageNumber: 1, text: rawCleanText }],
      fullText: rawCleanText,
      rawCleanText,
      isOcr: false,
      confidence: 'high',
      warnings: [],
    };
  },

  /**
   * Cleans text: normalizes newlines, spaces, and removes weird control characters
   */
  cleanExtractedText(text) {
    if (!text) return '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  /**
   * Removes repeated headers & footers across multi-page documents
   */
  removeRepeatedHeadersAndFooters(pages) {
    if (!pages || pages.length <= 1) return pages;

    const lineCounts = new Map();
    pages.forEach((page) => {
      const lines = page.text.split('\n');
      const headerCandidate = lines[0]?.trim();
      const footerCandidate = lines[lines.length - 1]?.trim();

      if (headerCandidate && headerCandidate.length > 3 && !this.isSyllabusHeading(headerCandidate)) {
        lineCounts.set(headerCandidate, (lineCounts.get(headerCandidate) || 0) + 1);
      }
      if (footerCandidate && footerCandidate.length > 3 && !this.isSyllabusHeading(footerCandidate)) {
        lineCounts.set(footerCandidate, (lineCounts.get(footerCandidate) || 0) + 1);
      }
    });

    const repeatedLines = new Set();
    lineCounts.forEach((count, line) => {
      if (count >= Math.max(2, Math.floor(pages.length * 0.6))) {
        repeatedLines.add(line);
      }
    });

    return pages.map((page) => {
      const lines = page.text.split('\n').filter((line) => !repeatedLines.has(line.trim()));
      return {
        ...page,
        text: lines.join('\n').trim(),
      };
    });
  },

  isSyllabusHeading(line) {
    const l = line.toLowerCase();
    return (
      l.startsWith('unit') ||
      l.startsWith('module') ||
      l.startsWith('chapter') ||
      l.startsWith('section') ||
      l.startsWith('part') ||
      /^\d+\.\s*/.test(line)
    );
  },

  verifyExtractionQuality(result, file) {
    const { characterCount, wordCount } = result;
    if (wordCount < 5 || characterCount < 20) {
      throw new Error(
        "We couldn't extract enough readable text from this file. Your file may be empty or unreadable. Please check the document content and try again."
      );
    }
  },

  detectSubjectName(text, fileName) {
    if (!text) return '';
    const head = text.slice(0, 1500);

    const patterns = [
      /(?:subject|course\s*name|course\s*title|paper\s*title|paper\s*name|module\s*title)\s*[:\-–]\s*([^\n\r]+)/i,
      /(?:syllabus\s*(?:for|of))\s*[:\-–]?\s*([^\n\r]+)/i,
      /(?:b\.?tech|b\.?e\.?|m\.?tech|m\.?ca|b\.?sc)\s*(?:cse|it|ai|ds)?\s*[:\-–]?\s*([A-Za-z\s&]{4,40})(?:\n|semester)/i,
    ];

    for (const pattern of patterns) {
      const match = head.match(pattern);
      if (match && match[1]) {
        let candidate = match[1].trim();
        candidate = candidate.replace(/\s*\([^)]*\)$/, '').replace(/[:\-–|].*$/, '').trim();
        if (candidate.length >= 3 && candidate.length <= 60) {
          return candidate;
        }
      }
    }

    if (fileName) {
      const cleanFileName = fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/syllabus|curriculum|final|draft|v\d+|\b\d{4}\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanFileName.length >= 3 && cleanFileName.length <= 50) {
        return cleanFileName.replace(/\b\w/g, (l) => l.toUpperCase());
      }
    }

    return '';
  },

  logDebugInfo(file, result) {
    if (import.meta.env.DEV) {
      console.groupCollapsed(`📄 [DocumentParser] ${file.name}`);
      console.log('File Name:', file.name);
      console.log('File Type:', result.fileType);
      console.log('Size:', `${(file.size / 1024).toFixed(2)} KB`);
      console.log('Pages:', result.pageCount);
      console.log('Chars:', result.characterCount);
      console.log('Words:', result.wordCount);
      console.log('OCR Used:', result.isOcr);
      console.log('Confidence:', result.confidence);
      console.log('Detected Subject:', result.detectedSubject || '(None)');
      console.groupEnd();
    }
  },
};

export default documentParser;
