import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Grok API (xAI) Service Architecture
 * 
 * Provides interface for syllabus unit decomposition and curricular analysis.
 * All Grok AI requests are securely proxied through the Supabase Edge Function
 * 'analyze-syllabus' where GROK_API_KEY is kept in server secrets.
 */
export const grokService = {
  /**
   * Decompose verified syllabus text into structured units & topics via Grok AI Edge Function.
   * 
   * @param {Object} params
   * @param {string} params.syllabusText - Verified extracted document text
   * @param {string} [params.fileName] - Original file name
   * @param {string} [params.fileType] - Document type (pdf, docx, txt)
   * @param {string} [params.subjectName] - User-confirmed or detected subject title
   * @param {string} [params.syllabusId] - Syllabus row ID in Supabase
   * @returns {Promise<{ syllabusId: string, subject: Object, units: Array, analysisMetadata: Object }>}
   */
  async analyzeSyllabus({ syllabusText, fileName, fileType, subjectName, syllabusId }) {
    if (!syllabusText || typeof syllabusText !== 'string' || !syllabusText.trim()) {
      throw new Error('Unable to analyze the syllabus because no readable syllabus text was provided.');
    }

    if (!isSupabaseConfigured() || !supabase) {
      throw new Error(
        'Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.'
      );
    }

    try {
      const { data, error } = await supabase.functions.invoke('analyze-syllabus', {
        body: {
          syllabusText,
          fileName: fileName || 'Syllabus',
          fileType: fileType || 'txt',
          subjectName: subjectName || '',
          syllabusId: syllabusId || null,
        },
      });

      if (error) {
        let detailedMsg = error.message;
        try {
          if (error.context && typeof error.context.json === 'function') {
            const errBody = await error.context.json();
            if (errBody?.error?.message) {
              detailedMsg = errBody.error.message;
            }
          }
        } catch (_) {
          // Ignore json parse error on error context
        }
        console.error('[grokService] Edge Function Error:', detailedMsg);
        throw new Error(detailedMsg || 'Failed to invoke Grok AI Edge Function.');
      }

      if (!data || !data.success || !data.data) {
        const errorMsg = data?.error?.message || 'Grok AI did not return structured syllabus data.';
        throw new Error(errorMsg);
      }

      return data.data; // { syllabusId, subject, units, analysisMetadata }
    } catch (err) {
      console.error('[grokService] Syllabus analysis failed:', err.message);
      throw err;
    }
  },
};

export default grokService;
