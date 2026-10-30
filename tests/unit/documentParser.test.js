import { describe, it, expect } from 'vitest';
import { documentParser, MAX_FILE_SIZE_BYTES } from '../../src/services/documentParser';

describe('Document Parser Service (Section 5)', () => {
  it('enforces maximum file size limit of 10 MB', async () => {
    const oversizedFile = {
      name: 'large_syllabus.pdf',
      size: MAX_FILE_SIZE_BYTES + 1024,
      type: 'application/pdf',
    };

    await expect(documentParser.extractTextFromFile(oversizedFile)).rejects.toThrow(
      'exceeds the 10 MB maximum allowed limit'
    );
  });

  it('rejects unsupported file formats', async () => {
    const invalidFile = {
      name: 'archive.zip',
      size: 5000,
      type: 'application/zip',
    };

    await expect(documentParser.extractTextFromFile(invalidFile)).rejects.toThrow(
      'Unsupported file type'
    );
  });

  it('normalizes newlines, trims control characters, and collapses redundant spaces', () => {
    const dirty = 'Line 1\r\n\r\n\r\n\r\nLine 2   with   spaces\r\n\x00\x08End of text';
    const cleaned = documentParser.cleanExtractedText(dirty);

    expect(cleaned).toContain('Line 1');
    expect(cleaned).toContain('Line 2 with spaces');
    expect(cleaned).toContain('End of text');
    expect(cleaned).not.toContain('\x00');
    expect(cleaned).not.toContain('\r');
  });

  it('removes repeated running page headers and footers across multiple pages', () => {
    const pages = [
      {
        pageNumber: 1,
        text: 'Apex Institute of Technology - Examination Syllabus\nUnit 1: Data Structures\nArrays and Linked Lists\nPage 1 of 3',
      },
      {
        pageNumber: 2,
        text: 'Apex Institute of Technology - Examination Syllabus\nUnit 2: Trees and Graphs\nBinary Search Trees\nPage 2 of 3',
      },
      {
        pageNumber: 3,
        text: 'Apex Institute of Technology - Examination Syllabus\nUnit 3: Graph Algorithms\nDijkstra and Prim\nPage 3 of 3',
      },
    ];

    const cleanedPages = documentParser.removeRepeatedHeadersAndFooters(pages);

    // The repeated institute header line should be removed from body text
    cleanedPages.forEach((p) => {
      expect(p.text).not.toContain('Apex Institute of Technology - Examination Syllabus');
    });

    // Content lines should be preserved
    expect(cleanedPages[0].text).toContain('Unit 1: Data Structures');
    expect(cleanedPages[1].text).toContain('Unit 2: Trees and Graphs');
    expect(cleanedPages[2].text).toContain('Unit 3: Graph Algorithms');
  });

  it('detects course and subject titles from document header patterns', () => {
    const textWithSubject = 'Course Title: Distributed Database Systems\nSemester: 7th\nUnit 1: Concurrency';
    const detected = documentParser.detectSubjectName(textWithSubject, 'syllabus.pdf');

    expect(detected).toBe('Distributed Database Systems');
  });

  it('detects subject from filename as a clean fallback if not in text', () => {
    const textWithoutHeader = 'Unit 1: Basic Electronics\nSemiconductors and Diodes';
    const detected = documentParser.detectSubjectName(textWithoutHeader, 'Analog_Circuits_Syllabus_2026.pdf');

    expect(detected).toBe('Analog Circuits');
  });

  it('throws an error for unreadable or empty documents instead of inventing content', () => {
    const emptyResult = {
      characterCount: 5,
      wordCount: 1,
      fileType: 'txt',
    };

    expect(() => documentParser.verifyExtractionQuality(emptyResult, { name: 'empty.txt' })).toThrow(
      "We couldn't extract enough readable text from this file"
    );
  });
});
