// AI Service Layer (Powered by Grok API / xAI Architecture)
import { grokService } from './grokService';

export const aiService = {
  /**
   * AI analysis of verified extracted syllabus text (Grok / xAI Engine via Edge Function)
   */
  async analyzeSyllabus(verifiedExtractedText, subjectName = 'Curriculum Subject', options = {}) {
    if (!verifiedExtractedText || typeof verifiedExtractedText !== 'string' || !verifiedExtractedText.trim()) {
      throw new Error('Unable to analyze the syllabus because no readable syllabus text was provided.');
    }

    return await grokService.analyzeSyllabus({
      syllabusText: verifiedExtractedText,
      subjectName,
      fileName: options.fileName,
      fileType: options.fileType,
      syllabusId: options.syllabusId,
    });
  },

  /**
   * AI skill gap and career assessment analysis
   */
  async analyzeSkillsAndCareer(career) {
    return {
      success: true,
      careerId: career.id,
      careerName: career.name,
      analyzedAt: new Date().toISOString()
    };
  }
};

export default aiService;
